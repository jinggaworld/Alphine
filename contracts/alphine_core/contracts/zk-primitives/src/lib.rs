#![no_std]
use soroban_sdk::{
    contract, contractimpl, crypto::bn254::{Bn254Fr, Bn254G1Affine, Bn254G2Affine},
    BytesN, Env, Vec, U256,
};

/// Test contract for Stellar's native ZK primitives:
/// - BN254 elliptic curve operations (g1_add, g1_mul, pairing_check, g1_is_on_curve)
/// - Poseidon2 permutation (ZK-friendly hash, low-level host function)
///
/// These primitives were introduced in Stellar Protocol 25 (X-Ray)
/// and are used for on-chain Groth16 proof verification.
///
/// ## Poseidon2 Usage
/// The Poseidon2 permutation is available via `env.crypto().poseidon2_permutation()`
/// but requires the full parameter set (field, t, d, rounds_f, rounds_p,
/// mat_internal_diag_m_1, round_constants). For high-level hash functions,
/// use the `soroban-poseidon` crate instead:
/// ```rust,ignore
/// use soroban_poseidon::poseidon_hash;
/// let inputs = vec![&env, U256::from_u32(&env, 1)];
/// let hash = poseidon_hash::<3, Bn254Fr>(&env, &inputs);
/// ```
#[contract]
pub struct ZkPrimitives;

#[contractimpl]
impl ZkPrimitives {
    /// Compute BN254 pairing check between G1 and G2 points.
    ///
    /// This is the core cryptographic operation for verifying
    /// Groth16 proofs on-chain. The pairing check verifies:
    /// e(A, B) * e(C, D) == 1 (in multiplicative notation)
    pub fn pairing_check(
        env: Env,
        g1_points: Vec<BytesN<64>>,
        g2_points: Vec<BytesN<128>>,
    ) -> bool {
        let bn254 = env.crypto().bn254();

        // Convert raw bytes to Bn254G1Affine by building vec manually
        let mut vp1: Vec<Bn254G1Affine> = Vec::new(&env);
        for i in 0..g1_points.len() {
            let point = g1_points.get(i).unwrap();
            vp1.push_back(Bn254G1Affine::from_bytes(point));
        }

        // Convert raw bytes to Bn254G2Affine
        let mut vp2: Vec<Bn254G2Affine> = Vec::new(&env);
        for i in 0..g2_points.len() {
            let point = g2_points.get(i).unwrap();
            vp2.push_back(Bn254G2Affine::from_bytes(point));
        }

        bn254.pairing_check(vp1, vp2)
    }

    /// Add two BN254 G1 points.
    pub fn g1_add(env: Env, a: BytesN<64>, b: BytesN<64>) -> BytesN<64> {
        let bn254 = env.crypto().bn254();
        let p0 = Bn254G1Affine::from_bytes(a);
        let p1 = Bn254G1Affine::from_bytes(b);
        let result = bn254.g1_add(&p0, &p1);
        result.to_bytes()
    }

    /// Multiply a BN254 G1 point by a scalar.
    pub fn g1_mul(env: Env, point: BytesN<64>, scalar: U256) -> BytesN<64> {
        let bn254 = env.crypto().bn254();
        let p0 = Bn254G1Affine::from_bytes(point);
        let scalar_fr = Bn254Fr::from_u256(scalar);
        let result = bn254.g1_mul(&p0, &scalar_fr);
        result.to_bytes()
    }

    /// Check if a G1 point is on the BN254 curve.
    pub fn g1_is_on_curve(env: Env, point: BytesN<64>) -> bool {
        let bn254 = env.crypto().bn254();
        let p0 = Bn254G1Affine::from_bytes(point);
        bn254.g1_is_on_curve(&p0)
    }
}

mod test;
