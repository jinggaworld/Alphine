//! Alphine Payment Contract
//! Phase 7 — Soroban Payment Contract + End-to-End Logic
//!
//! This contract handles the end-to-end payment flow:
//! 1. Receive ZK compliance proof + payment details
//! 2. Verify proof via Groth16 verifier contract
//! 3. If valid → execute USDC transfer
//! 4. If invalid → emit failure event for manual review

#![no_std]
use soroban_sdk::{
    contract, contractimpl, contractclient, contracterror, contracttype,
    token, vec, Address, BytesN, Env, Vec,
    symbol_short,
};

/// Groth16 Proof struct matching the verifier contract interface.
/// Defined locally to avoid depending on the groth16-verifier crate.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Proof {
    pub a: BytesN<64>,
    pub b: BytesN<128>,
    pub c: BytesN<64>,
}

/// Verifier contract interface.
/// Used for cross-contract calls to the Groth16 verifier.
#[contractclient(name = "VerifierClient")]
pub trait Verifier {
    /// Verify a Groth16 proof with the given public inputs.
    fn verify(env: Env, proof: Proof, public_inputs: Vec<BytesN<32>>) -> bool;
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum PaymentError {
    /// ZK proof verification failed
    InvalidProof = 1,
    /// This nullifier has already been used (replay attack)
    AlreadyProcessed = 2,
    /// Insufficient token balance
    InsufficientBalance = 3,
    /// Caller is not authorized
    Unauthorized = 4,
}

/// Compliance proof containing the Groth16 proof elements
/// and the public inputs for the ZK circuit.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ComplianceProof {
    // Groth16 proof elements
    pub proof_a: BytesN<64>,
    pub proof_b: BytesN<128>,
    pub proof_c: BytesN<64>,
    // Public inputs for the circuit
    pub merkle_root: BytesN<32>,
    pub nullifier: BytesN<32>,
    pub threshold: BytesN<32>,
    pub time_window: BytesN<32>,
    pub current_timestamp: BytesN<32>,
    pub to_address: BytesN<32>,
}

/// Payment initiation request containing sender, recipient,
/// token, amount, and the compliance proof.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PaymentInit {
    pub from: Address,
    pub to: Address,
    pub token: Address,
    pub amount: i128,
    pub compliance_proof: ComplianceProof,
}

#[contract]
pub struct AlphinePayment;

#[contractimpl]
impl AlphinePayment {
    /// Initialize the payment contract with verifier address and owner.
    pub fn init(env: Env, verifier: Address, owner: Address) {
        if env.storage().persistent().has(&DataKey::Initialized) {
            panic!("Already initialized");
        }
        env.storage().persistent().set(&DataKey::Verifier, &verifier);
        env.storage().persistent().set(&DataKey::Owner, &owner);
        env.storage().persistent().set(&DataKey::Initialized, &true);

        env.events().publish(
            (symbol_short!("init"),),
            (verifier, owner),
        );
    }

    /// Process a payment with ZK compliance proof.
    ///
    /// Flow:
    /// 1. Authenticate sender
    /// 2. Check nullifier (replay protection)
    /// 3. Verify ZK proof via Groth16 verifier
    /// 4. Mark nullifier as used
    /// 5. Check balance
    /// 6. Execute USDC transfer
    /// 7. Emit success event
    pub fn process_payment(
        env: Env,
        payment: PaymentInit,
    ) -> Result<i128, PaymentError> {
        // 1. Authenticate sender
        payment.from.require_auth();

        // 2. Check nullifier — prevent replay attacks
        let nullifier_key = DataKey::Nullifier(payment.compliance_proof.nullifier.clone());
        if env.storage().persistent().has(&nullifier_key) {
            return Err(PaymentError::AlreadyProcessed);
        }

        // 3. Verify ZK proof via Groth16 verifier
        let verifier: Address = env.storage().persistent()
            .get(&DataKey::Verifier).unwrap();
        let verifier_client = VerifierClient::new(&env, &verifier);

        // Build proof struct
        let zk_proof = Proof {
            a: payment.compliance_proof.proof_a,
            b: payment.compliance_proof.proof_b,
            c: payment.compliance_proof.proof_c,
        };

        // Build public inputs vector
        let public_inputs = vec![
            &env,
            payment.compliance_proof.merkle_root,
            payment.compliance_proof.nullifier,
            payment.compliance_proof.threshold,
            payment.compliance_proof.time_window,
            payment.compliance_proof.current_timestamp,
            payment.compliance_proof.to_address,
        ];

        let is_valid = verifier_client.verify(&zk_proof, &public_inputs);

        if !is_valid {
            env.events().publish(
                (symbol_short!("fail"), symbol_short!("proof")),
                (payment.from.clone(), payment.amount),
            );
            return Err(PaymentError::InvalidProof);
        }

        // 4. Mark nullifier as used (prevent replay)
        env.storage().persistent().set(&nullifier_key, &true);

        // 5. Check balance
        let token_client = token::Client::new(&env, &payment.token);
        let balance = token_client.balance(&payment.from);
        if balance < payment.amount {
            return Err(PaymentError::InsufficientBalance);
        }

        // 6. Execute transfer
        token_client.transfer(&payment.from, &payment.to, &payment.amount);

        // 7. Emit success event
        env.events().publish(
            (symbol_short!("paid"), symbol_short!("compliant")),
            (payment.from, payment.to, payment.amount),
        );

        Ok(payment.amount)
    }

    /// Check if a nullifier has been used (for frontend queries)
    pub fn is_nullifier_used(env: Env, nullifier: BytesN<32>) -> bool {
        env.storage().persistent()
            .has(&DataKey::Nullifier(nullifier))
    }

    /// Get the verifier contract address
    pub fn verifier(env: Env) -> Address {
        env.storage().persistent()
            .get(&DataKey::Verifier).unwrap()
    }

    /// Get the contract owner
    pub fn owner(env: Env) -> Address {
        env.storage().persistent()
            .get(&DataKey::Owner).unwrap()
    }

    /// Check if the contract has been initialized
    pub fn is_initialized(env: Env) -> bool {
        env.storage().persistent()
            .get::<_, bool>(&DataKey::Initialized)
            .unwrap_or(false)
    }
}

#[contracttype]
pub enum DataKey {
    Verifier,
    Owner,
    Initialized,
    Nullifier(BytesN<32>),
}

mod test;
