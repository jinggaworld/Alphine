#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracterror, token, Address, Env, Symbol,
    symbol_short,
};

const VERSION_KEY: Symbol = symbol_short!("version");
const OWNER_KEY: Symbol = symbol_short!("owner");

/// Core error types for the Alphine AML compliance system.
/// These map to real-world compliance failure modes.
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum AlphineError {
    /// Zero-knowledge proof verification failed
    InvalidProof = 1,
    /// Sender or recipient is on a sanctions list
    SanctionedAddress = 2,
    /// Transaction amount exceeds FINCEN reporting threshold ($10,000)
    AmountExceedsThreshold = 3,
    /// Structuring (smurfing) pattern detected in transaction history
    StructuringDetected = 4,
    /// Transaction history for the user is unavailable
    HistoryUnavailable = 5,
    /// Insufficient token balance to complete the transfer
    InsufficientBalance = 6,
    /// Caller is not authorized to perform this action
    Unauthorized = 7,
}

/// Core contract for the Alphine AML compliance system.
///
/// This contract manages:
/// - Protocol versioning and initialization
/// - Owner-based access control
/// - Token transfer execution (used after ZK proof verification)
#[contract]
pub struct AlphineCore;

#[contractimpl]
impl AlphineCore {
    /// Initialize the contract with version and owner.
    /// Can only be called once.
    pub fn init(env: Env, owner: Address) {
        // Prevent re-initialization
        if env.storage().persistent().has(&VERSION_KEY) {
            panic!("Already initialized");
        }
        env.storage().persistent().set(&VERSION_KEY, &1u32);
        env.storage().persistent().set(&OWNER_KEY, &owner);

        env.events().publish((symbol_short!("init"),), (1u32, owner));
    }

    /// Return the current protocol version.
    /// Returns 0 if not initialized.
    pub fn version(env: Env) -> u32 {
        env.storage()
            .persistent()
            .get(&VERSION_KEY)
            .unwrap_or(0)
    }

    /// Return the contract owner address.
    pub fn owner(env: Env) -> Address {
        env.storage()
            .persistent()
            .get(&OWNER_KEY)
            .unwrap()
    }

    /// Transfer tokens from one address to another.
    /// Requires authorization from the sender.
    ///
    /// # Arguments
    /// * `token` - Address of the token contract (e.g., USDC)
    /// * `from` - Sender address
    /// * `to` - Recipient address
    /// * `amount` - Amount to transfer (in smallest units)
    ///
    /// # Errors
    /// * `InsufficientBalance` - if sender has fewer tokens than `amount`
    /// * `Unauthorized` - if sender does not authorize the transfer
    pub fn transfer_token(
        env: Env,
        token: Address,
        from: Address,
        to: Address,
        amount: i128,
    ) -> Result<i128, AlphineError> {
        // Authenticate the sender
        from.require_auth();

        let token_client = token::Client::new(&env, &token);

        // Check balance before transfer
        let balance = token_client.balance(&from);
        if balance < amount {
            return Err(AlphineError::InsufficientBalance);
        }

        // Execute the transfer
        token_client.transfer(&from, &to, &amount);

        // Emit transfer event for off-chain indexing
        env.events().publish(
            (symbol_short!("transfer"),),
            (from, to, amount),
        );

        Ok(amount)
    }

    /// Get the token balance for a given address.
    /// Useful for off-chain queries.
    pub fn get_balance(env: Env, token: Address, addr: Address) -> i128 {
        let token_client = token::Client::new(&env, &token);
        token_client.balance(&addr)
    }
}

mod test;
