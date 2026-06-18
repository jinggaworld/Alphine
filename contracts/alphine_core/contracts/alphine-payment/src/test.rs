#![cfg(test)]

use super::*;
use groth16_verifier::{VerifyingKey, Groth16Verifier, Groth16VerifierClient};
use soroban_sdk::{testutils::Address as _, vec, BytesN, Env, Vec};
use soroban_sdk::token::StellarAssetClient;

/// Helper to create a mock VK for tests
/// gamma_abc_g1 must have N+1 entries where N = number of public inputs.
/// Our compliance proof has 6 public inputs, so we need 7 entries.
fn mock_vk(env: &Env) -> VerifyingKey {
    VerifyingKey {
        alpha_g1: BytesN::from_array(env, &[0u8; 64]),
        beta_g2_neg: BytesN::from_array(env, &[0u8; 128]),
        gamma_g2_neg: BytesN::from_array(env, &[0u8; 128]),
        delta_g2_neg: BytesN::from_array(env, &[0u8; 128]),
        gamma_abc_g1: vec![
            env,
            BytesN::from_array(env, &[0u8; 64]),  // vk element (index 0)
            BytesN::from_array(env, &[0u8; 64]),  // public input 1
            BytesN::from_array(env, &[0u8; 64]),  // public input 2
            BytesN::from_array(env, &[0u8; 64]),  // public input 3
            BytesN::from_array(env, &[0u8; 64]),  // public input 4
            BytesN::from_array(env, &[0u8; 64]),  // public input 5
            BytesN::from_array(env, &[0u8; 64]),  // public input 6
        ],
    }
}

/// Helper to create a mock proof for tests (all zeros = identity)
fn mock_proof(env: &Env) -> Proof {
    Proof {
        a: BytesN::from_array(env, &[0u8; 64]),
        b: BytesN::from_array(env, &[0u8; 128]),
        c: BytesN::from_array(env, &[0u8; 64]),
    }
}

/// Helper to create a mock compliance proof
fn mock_compliance_proof(env: &Env) -> ComplianceProof {
    let zk_proof = mock_proof(env);
    ComplianceProof {
        proof_a: zk_proof.a,
        proof_b: zk_proof.b,
        proof_c: zk_proof.c,
        merkle_root: BytesN::from_array(env, &[0u8; 32]),
        nullifier: BytesN::from_array(env, &[0u8; 32]),
        threshold: BytesN::from_array(env, &[0u8; 32]),
        time_window: BytesN::from_array(env, &[0u8; 32]),
        current_timestamp: BytesN::from_array(env, &[0u8; 32]),
        to_address: BytesN::from_array(env, &[0u8; 32]),
    }
}

#[test]
fn test_init_and_is_initialized() {
    let env = Env::default();
    let contract_id = env.register(AlphinePayment, ());
    let client = AlphinePaymentClient::new(&env, &contract_id);

    // Should not be initialized yet
    assert!(!client.is_initialized());

    let verifier = Address::generate(&env);
    let owner = Address::generate(&env);
    client.init(&verifier, &owner);

    // Should be initialized now
    assert!(client.is_initialized());
    assert_eq!(client.verifier(), verifier);
    assert_eq!(client.owner(), owner);
}

#[test]
#[should_panic(expected = "Already initialized")]
fn test_double_init_panics() {
    let env = Env::default();
    let contract_id = env.register(AlphinePayment, ());
    let client = AlphinePaymentClient::new(&env, &contract_id);

    let verifier = Address::generate(&env);
    let owner = Address::generate(&env);
    client.init(&verifier, &owner);
    // Second init should panic
    client.init(&verifier, &owner);
}

#[test]
fn test_process_payment_with_valid_proof() {
    let env = Env::default();
    env.mock_all_auths();

    // Register Groth16 Verifier
    let verifier_id = env.register(Groth16Verifier, ());
    let verifier_client = Groth16VerifierClient::new(&env, &verifier_id);
    let vk = mock_vk(&env);
    verifier_client.init(&vk);

    // Register Alphine Payment
    let payment_id = env.register(AlphinePayment, ());
    let payment_client = AlphinePaymentClient::new(&env, &payment_id);

    let owner = Address::generate(&env);
    payment_client.init(&verifier_id, &owner);

    // Setup test accounts and token
    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);
    let sac = env.register_stellar_asset_contract_v2(sender.clone());
    let token_id = sac.address();
    let sac_client = StellarAssetClient::new(&env, &token_id);

    // Mint tokens to sender
    sac_client.mint(&sender, &1000i128);

    let token_client = token::Client::new(&env, &token_id);
    assert_eq!(token_client.balance(&sender), 1000i128);

    // Create payment with valid proof (identity points → pairing returns true)
    let compliance = mock_compliance_proof(&env);
    let payment = PaymentInit {
        from: sender.clone(),
        to: recipient.clone(),
        token: token_id,
        amount: 500i128,
        compliance_proof: compliance,
    };

    // Soroban client auto-unwraps Result — returns i128 directly
    let result = payment_client.process_payment(&payment);
    assert_eq!(result, 500i128);

    // Check balances after transfer
    assert_eq!(token_client.balance(&sender), 500i128);
    assert_eq!(token_client.balance(&recipient), 500i128);
}

#[test]
#[should_panic(expected = "Error(Contract, #2)")]
fn test_nullifier_replay_protection() {
    let env = Env::default();
    env.mock_all_auths();

    // Setup contracts
    let verifier_id = env.register(Groth16Verifier, ());
    let verifier_client = Groth16VerifierClient::new(&env, &verifier_id);
    verifier_client.init(&mock_vk(&env));

    let payment_id = env.register(AlphinePayment, ());
    let payment_client = AlphinePaymentClient::new(&env, &payment_id);

    let owner = Address::generate(&env);
    payment_client.init(&verifier_id, &owner);

    // Setup accounts and token
    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);
    let sac = env.register_stellar_asset_contract_v2(sender.clone());
    let token_id = sac.address();
    let sac_client = StellarAssetClient::new(&env, &token_id);
    sac_client.mint(&sender, &2000i128);

    // First payment should succeed
    let compliance = mock_compliance_proof(&env);
    let payment1 = PaymentInit {
        from: sender.clone(),
        to: recipient.clone(),
        token: token_id.clone(),
        amount: 500i128,
        compliance_proof: compliance.clone(),
    };
    payment_client.process_payment(&payment1);

    // Second payment with same nullifier should panic with AlreadyProcessed (#2)
    let payment2 = PaymentInit {
        from: sender.clone(),
        to: recipient.clone(),
        token: token_id,
        amount: 300i128,
        compliance_proof: compliance,
    };
    payment_client.process_payment(&payment2);
}

#[test]
fn test_is_nullifier_used() {
    let env = Env::default();
    env.mock_all_auths();

    let verifier_id = env.register(Groth16Verifier, ());
    let verifier_client = Groth16VerifierClient::new(&env, &verifier_id);
    verifier_client.init(&mock_vk(&env));

    let payment_id = env.register(AlphinePayment, ());
    let payment_client = AlphinePaymentClient::new(&env, &payment_id);

    let owner = Address::generate(&env);
    payment_client.init(&verifier_id, &owner);

    let nullifier = BytesN::from_array(&env, &[1u8; 32]);

    // Should not be used yet
    assert!(!payment_client.is_nullifier_used(&nullifier));

    // Process payment with this nullifier
    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);
    let sac = env.register_stellar_asset_contract_v2(sender.clone());
    let token_id = sac.address();
    let sac_client = StellarAssetClient::new(&env, &token_id);
    sac_client.mint(&sender, &1000i128);

    let mut compliance = mock_compliance_proof(&env);
    compliance.nullifier = nullifier.clone();

    let payment = PaymentInit {
        from: sender.clone(),
        to: recipient.clone(),
        token: token_id,
        amount: 100i128,
        compliance_proof: compliance,
    };
    payment_client.process_payment(&payment);

    // Should be used now
    assert!(payment_client.is_nullifier_used(&nullifier));
}

#[test]
#[should_panic(expected = "Error(Contract, #3)")]
fn test_process_payment_insufficient_balance() {
    let env = Env::default();
    env.mock_all_auths();

    let verifier_id = env.register(Groth16Verifier, ());
    let verifier_client = Groth16VerifierClient::new(&env, &verifier_id);
    verifier_client.init(&mock_vk(&env));

    let payment_id = env.register(AlphinePayment, ());
    let payment_client = AlphinePaymentClient::new(&env, &payment_id);

    let owner = Address::generate(&env);
    payment_client.init(&verifier_id, &owner);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);
    let sac = env.register_stellar_asset_contract_v2(sender.clone());
    let token_id = sac.address();

    // Sender has 0 balance, try to transfer 500 → InsufficientBalance (#3)
    let compliance = mock_compliance_proof(&env);
    let payment = PaymentInit {
        from: sender.clone(),
        to: recipient.clone(),
        token: token_id,
        amount: 500i128,
        compliance_proof: compliance,
    };
    payment_client.process_payment(&payment);
}

#[test]
#[should_panic(expected = "HostError")]
fn test_process_payment_uninitialized() {
    let env = Env::default();
    let contract_id = env.register(AlphinePayment, ());
    let client = AlphinePaymentClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let compliance = mock_compliance_proof(&env);
    let payment = PaymentInit {
        from: sender.clone(),
        to: Address::generate(&env),
        token: Address::generate(&env),
        amount: 100i128,
        compliance_proof: compliance,
    };

    // Process payment without init should panic
    client.process_payment(&payment);
}
