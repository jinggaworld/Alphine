#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, crypto::bn254::{Bn254Fr, Bn254G1Affine, Bn254G2Affine},
    vec, BytesN, Env, Vec,
};

/// Groth16 Verifier Contract
///
/// Verifies Groth16 zero-knowledge proofs on-chain using Stellar's
/// native BN254 pairing host functions (Protocol 25/X-Ray).
///
/// ⚠️ SECURITY: This is a simplified MVP verifier. The full Groth16
/// verification equation requires proper point negation. This contract
/// uses pre-negated G2 elements passed during init(). See the VK
/// struct for the expected format.
///
/// Full verification equation (4 pairs):
///   e(A, B) * e(α, -β) * e(∑(γ_abc_i * public_i), -γ) * e(C, -δ) = 1
///
/// Where β_neg, γ_neg, δ_neg are pre-computed negated G2 points:
///   (x, y) → (x, p - y) where p is the BN254 field modulus.
#[contract]
pub struct Groth16Verifier;

#[contractimpl]
impl Groth16Verifier {
    /// Initialize the verifier with a verification key.
    /// The VK includes pre-negated G2 elements for the pairing equation.
    pub fn init(env: Env, vk: VerifyingKey) {
        env.storage().persistent().set(&DataKey::Vk, &vk);
        env.storage().persistent().set(&DataKey::Initialized, &true);
    }

    /// Check if the verifier has been initialized.
    pub fn is_initialized(env: Env) -> bool {
        env.storage()
            .persistent()
            .get::<_, bool>(&DataKey::Initialized)
            .unwrap_or(false)
    }

    /// Verify a Groth16 proof against the stored verification key.
    ///
    /// Implements the full 4-pair Groth16 verification equation using
    /// pre-negated G2 elements passed during init():
    ///
    ///   e(A, B) * e(α, -β) * e(γ_abc_combined, -γ) * e(C, -δ) = 1
    pub fn verify(
        env: Env,
        proof: Proof,
        public_inputs: Vec<BytesN<32>>,
    ) -> bool {
        let bn254 = env.crypto().bn254();

        // Load verification key from storage
        let vk: VerifyingKey = env.storage()
            .persistent()
            .get(&DataKey::Vk)
            .unwrap();

        // Convert proof elements to BN254 types
        let proof_a = Bn254G1Affine::from_bytes(proof.a);
        let proof_b = Bn254G2Affine::from_bytes(proof.b);
        let proof_c = Bn254G1Affine::from_bytes(proof.c);

        // VK elements (G1)
        let vk_alpha = Bn254G1Affine::from_bytes(vk.alpha_g1);
        // VK elements (G2 — pre-negated for the pairing equation)
        let vk_beta_neg = Bn254G2Affine::from_bytes(vk.beta_g2_neg);
        let vk_gamma_neg = Bn254G2Affine::from_bytes(vk.gamma_g2_neg);
        let vk_delta_neg = Bn254G2Affine::from_bytes(vk.delta_g2_neg);

        // Compute gamma_abc_combined = gamma_abc[0] + sum(gamma_abc[i+1] * public_input[i])
        let mut gamma_abc_combined = Bn254G1Affine::from_bytes(vk.gamma_abc_g1.get(0).unwrap());

        for i in 0..public_inputs.len() {
            let input = public_inputs.get(i).unwrap();
            let point_bytes = vk.gamma_abc_g1.get(i + 1).unwrap();
            let point = Bn254G1Affine::from_bytes(point_bytes);
            let scalar = Bn254Fr::from_bytes(input);

            // scalar * point
            let scaled = bn254.g1_mul(&point, &scalar);
            // add to accumulator
            gamma_abc_combined = bn254.g1_add(&gamma_abc_combined, &scaled);
        }

        // Full Groth16 verification (4 pairs):
        // e(A, B) * e(α, -β) * e(γ_abc_combined, -γ) * e(C, -δ) == 1
        //
        // G2 elements (β_neg, γ_neg, δ_neg) are pre-negated so the
        // pairing_check product equals 1 for a valid proof.
        let g1_points = vec![&env, proof_a, vk_alpha, gamma_abc_combined, proof_c];
        let g2_points = vec![&env, proof_b, vk_beta_neg, vk_gamma_neg, vk_delta_neg];

        bn254.pairing_check(g1_points, g2_points)
    }
}

/// Groth16 Verifying Key
///
/// Contains all elements needed for on-chain proof verification.
/// G2 elements (beta, gamma, delta) are pre-negated for the pairing equation:
/// negated point = (x, p - y) where p is the BN254 field modulus.
///
/// Fields:
/// - alpha_g1: α ∈ G1 (64 bytes)
/// - beta_g2_neg: -β ∈ G2 (128 bytes, pre-negated)
/// - gamma_g2_neg: -γ ∈ G2 (128 bytes, pre-negated)
/// - delta_g2_neg: -δ ∈ G2 (128 bytes, pre-negated)
/// - gamma_abc_g1: γ_abc_i ∈ G1 for each public input + 1 (Vec of 64-byte points)
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct VerifyingKey {
    pub alpha_g1: BytesN<64>,
    pub beta_g2_neg: BytesN<128>,
    pub gamma_g2_neg: BytesN<128>,
    pub delta_g2_neg: BytesN<128>,
    pub gamma_abc_g1: Vec<BytesN<64>>,
}

/// Groth16 Proof
///
/// Contains the 3 proof elements:
/// - a: A ∈ G1 (64 bytes)
/// - b: B ∈ G2 (128 bytes)
/// - c: C ∈ G1 (64 bytes)
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Proof {
    pub a: BytesN<64>,
    pub b: BytesN<128>,
    pub c: BytesN<64>,
}

#[contracttype]
pub enum DataKey {
    Vk,
    Initialized,
}

mod test;
