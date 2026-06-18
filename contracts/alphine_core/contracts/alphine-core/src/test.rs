#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Env};

#[test]
fn test_init_and_version() {
    let env = Env::default();
    let contract_id = env.register(AlphineCore, ());
    let client = AlphineCoreClient::new(&env, &contract_id);

    // Before init, version should be 0
    assert_eq!(client.version(), 0);

    // Init with an owner
    let owner = Address::generate(&env);
    client.init(&owner);

    // After init, version should be 1
    assert_eq!(client.version(), 1);

    // Owner should be set
    assert_eq!(client.owner(), owner);
}

#[test]
#[should_panic(expected = "Already initialized")]
fn test_double_init_panics() {
    let env = Env::default();
    let contract_id = env.register(AlphineCore, ());
    let client = AlphineCoreClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    client.init(&owner);
    // Second init should panic
    client.init(&owner);
}

#[test]
#[should_panic(expected = "Error(Contract, #6)")]
fn test_token_transfer_insufficient_balance() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(AlphineCore, ());
    let client = AlphineCoreClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    client.init(&owner);

    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);

    // Register SAC and get the contract address
    let sac = env.register_stellar_asset_contract_v2(user1.clone());
    let token_id = sac.address();
    let token = token::TokenClient::new(&env, &token_id);

    // user1 has 0 balance, trying to transfer 500 should panic
    assert_eq!(token.balance(&user1), 0i128);
    client.transfer_token(&token_id, &user1, &user2, &500i128);
}

#[test]
fn test_get_balance_zero() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(AlphineCore, ());
    let client = AlphineCoreClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    client.init(&owner);

    let user = Address::generate(&env);
    let sac = env.register_stellar_asset_contract_v2(user.clone());
    let token_id = sac.address();

    // Balance of newly created token should be 0
    let balance = client.get_balance(&token_id, &user);
    assert_eq!(balance, 0i128);
}

#[test]
fn test_version_initialized() {
    let env = Env::default();
    let contract_id = env.register(AlphineCore, ());
    let client = AlphineCoreClient::new(&env, &contract_id);

    // Before init
    assert_eq!(client.version(), 0);

    let owner = Address::generate(&env);
    client.init(&owner);

    // After init
    assert_eq!(client.version(), 1);
}
