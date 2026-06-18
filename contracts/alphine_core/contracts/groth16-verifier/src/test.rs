#![cfg(test)]

use super::*;
use soroban_sdk::{vec, BytesN, Env, Vec};

#[test]
fn test_init_and_initialized() {
    let env = Env::default();
    let contract_id = env.register(Groth16Verifier, ());
    let client = Groth16VerifierClient::new(&env, &contract_id);

    // Should not be initialized yet
    assert!(!client.is_initialized());

    // Init with mock VK (all zeros = identity points)
    let mock_vk = VerifyingKey {
        alpha_g1: BytesN::from_array(&env, &[0u8; 64]),
        beta_g2_neg: BytesN::from_array(&env, &[0u8; 128]),
        gamma_g2_neg: BytesN::from_array(&env, &[0u8; 128]),
        delta_g2_neg: BytesN::from_array(&env, &[0u8; 128]),
        gamma_abc_g1: vec![&env, BytesN::from_array(&env, &[0u8; 64])],
    };
    client.init(&mock_vk);

    // Should be initialized now
    assert!(client.is_initialized());
}

#[test]
fn test_verify_with_identity_proof() {
    let env = Env::default();
    let contract_id = env.register(Groth16Verifier, ());
    let client = Groth16VerifierClient::new(&env, &contract_id);

    // Init with identity VK (all zeros)
    let mock_vk = VerifyingKey {
        alpha_g1: BytesN::from_array(&env, &[0u8; 64]),
        beta_g2_neg: BytesN::from_array(&env, &[0u8; 128]),
        gamma_g2_neg: BytesN::from_array(&env, &[0u8; 128]),
        delta_g2_neg: BytesN::from_array(&env, &[0u8; 128]),
        gamma_abc_g1: vec![&env, BytesN::from_array(&env, &[0u8; 64])],
    };
    client.init(&mock_vk);

    // With all-identity points, pairing_check should return true
    let proof = Proof {
        a: BytesN::from_array(&env, &[0u8; 64]),
        b: BytesN::from_array(&env, &[0u8; 128]),
        c: BytesN::from_array(&env, &[0u8; 64]),
    };
    let public_inputs: Vec<BytesN<32>> = vec![&env];

    let result = client.verify(&proof, &public_inputs);
    // Identity pairing returns true (e(O,O) = 1)
    assert!(result);
}

#[test]
#[should_panic(expected = "HostError")]
fn test_verify_uninitialized_panics() {
    let env = Env::default();
    let contract_id = env.register(Groth16Verifier, ());
    let client = Groth16VerifierClient::new(&env, &contract_id);

    let proof = Proof {
        a: BytesN::from_array(&env, &[0u8; 64]),
        b: BytesN::from_array(&env, &[0u8; 128]),
        c: BytesN::from_array(&env, &[0u8; 64]),
    };
    let public_inputs: Vec<BytesN<32>> = vec![&env];

    // Verify without init should panic
    client.verify(&proof, &public_inputs);
}

#[test]
fn test_deterministic_verification() {
    let env = Env::default();
    let contract_id = env.register(Groth16Verifier, ());
    let client = Groth16VerifierClient::new(&env, &contract_id);

    let mock_vk = VerifyingKey {
        alpha_g1: BytesN::from_array(&env, &[0u8; 64]),
        beta_g2_neg: BytesN::from_array(&env, &[0u8; 128]),
        gamma_g2_neg: BytesN::from_array(&env, &[0u8; 128]),
        delta_g2_neg: BytesN::from_array(&env, &[0u8; 128]),
        gamma_abc_g1: vec![&env, BytesN::from_array(&env, &[0u8; 64])],
    };
    client.init(&mock_vk);

    // Same proof should give same result
    let proof = Proof {
        a: BytesN::from_array(&env, &[0u8; 64]),
        b: BytesN::from_array(&env, &[0u8; 128]),
        c: BytesN::from_array(&env, &[0u8; 64]),
    };
    let public_inputs: Vec<BytesN<32>> = vec![&env];

    let r1 = client.verify(&proof, &public_inputs);
    let r2 = client.verify(&proof, &public_inputs);
    assert_eq!(r1, r2);
}

#[test]
fn test_verify_with_public_inputs() {
    let env = Env::default();
    let contract_id = env.register(Groth16Verifier, ());
    let client = Groth16VerifierClient::new(&env, &contract_id);

    // VK with 1 public input (gamma_abc has 2 points: vk + 1 for public input)
    let mock_vk = VerifyingKey {
        alpha_g1: BytesN::from_array(&env, &[0u8; 64]),
        beta_g2_neg: BytesN::from_array(&env, &[0u8; 128]),
        gamma_g2_neg: BytesN::from_array(&env, &[0u8; 128]),
        delta_g2_neg: BytesN::from_array(&env, &[0u8; 128]),
        gamma_abc_g1: vec![
            &env,
            BytesN::from_array(&env, &[0u8; 64]),
            BytesN::from_array(&env, &[0u8; 64]),
        ],
    };
    client.init(&mock_vk);

    let proof = Proof {
        a: BytesN::from_array(&env, &[0u8; 64]),
        b: BytesN::from_array(&env, &[0u8; 128]),
        c: BytesN::from_array(&env, &[0u8; 64]),
    };
    let public_inputs: Vec<BytesN<32>> = vec![&env, BytesN::from_array(&env, &[0u8; 32])];

    let result = client.verify(&proof, &public_inputs);
    // With all-identity points, should return true
    assert!(result);
}
