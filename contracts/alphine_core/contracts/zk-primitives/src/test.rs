#![cfg(test)]

use super::*;
use soroban_sdk::{vec, Env, U256};

#[test]
fn test_g1_add_identity_identity() {
    let env = Env::default();
    let contract_id = env.register(ZkPrimitives, ());
    let client = ZkPrimitivesClient::new(&env, &contract_id);

    // Identity + Identity = Identity
    let identity = BytesN::from_array(&env, &[0u8; 64]);
    let result = client.g1_add(&identity, &identity);
    assert_eq!(result, identity);
}

#[test]
fn test_g1_is_on_curve_identity() {
    let env = Env::default();
    let contract_id = env.register(ZkPrimitives, ());
    let client = ZkPrimitivesClient::new(&env, &contract_id);

    // Identity point (all zeros) is considered on curve
    let identity = BytesN::from_array(&env, &[0u8; 64]);
    assert!(client.g1_is_on_curve(&identity));
}

#[test]
fn test_g1_mul_by_zero() {
    let env = Env::default();
    let contract_id = env.register(ZkPrimitives, ());
    let client = ZkPrimitivesClient::new(&env, &contract_id);

    // Identity point
    let identity = BytesN::from_array(&env, &[0u8; 64]);
    let zero_scalar = U256::from_u32(&env, 0);

    // identity * 0 = identity
    let result = client.g1_mul(&identity, &zero_scalar);
    assert_eq!(result, identity);
}

#[test]
fn test_g1_mul_by_one() {
    let env = Env::default();
    let contract_id = env.register(ZkPrimitives, ());
    let client = ZkPrimitivesClient::new(&env, &contract_id);

    let identity = BytesN::from_array(&env, &[0u8; 64]);
    let one_scalar = U256::from_u32(&env, 1);

    // identity * 1 = identity
    let result = client.g1_mul(&identity, &one_scalar);
    assert_eq!(result, identity);
}

#[test]
fn test_pairing_check_identity() {
    let env = Env::default();
    let contract_id = env.register(ZkPrimitives, ());
    let client = ZkPrimitivesClient::new(&env, &contract_id);

    // Identity points in G1 and G2
    let g1_identity = BytesN::from_array(&env, &[0u8; 64]);
    let g2_identity = BytesN::from_array(&env, &[0u8; 128]);

    let g1_points = vec![&env, g1_identity];
    let g2_points = vec![&env, g2_identity];

    // Pairing with identity points should return true
    let result = client.pairing_check(&g1_points, &g2_points);
    assert!(result);
}
