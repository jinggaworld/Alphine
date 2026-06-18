// Alphine Compliance Circuit
// ZK Proof of AML compliance — sanctions check, amount threshold, structuring detection

mod sanctions;
mod amount;
mod structuring;

global MERKLE_DEPTH: u32 = 5;
global MAX_HISTORY: u32 = 20;

fn main(
    pub_merkle_root: pub Field,
    pub_nullifier: pub Field,
    pub_threshold: pub Field,
    pub_current_timestamp: pub Field,
    priv_user_address: Field,
    priv_merkle_proof: [Field; MERKLE_DEPTH],
    priv_merkle_indices: [bool; MERKLE_DEPTH],
    priv_amount: Field,
    priv_historical_amounts: [Field; MAX_HISTORY],
    priv_historical_timestamps: [Field; MAX_HISTORY],
) {
    // 1. Verify sender is not on sanctions list (Merkle non-membership)
    sanctions::verify_not_sanctioned(
        pub_merkle_root,
        priv_user_address,
        priv_merkle_proof,
        priv_merkle_indices,
        pub_nullifier,
    );

    // 2. Verify amount is below reporting threshold
    amount::verify_amount_below_threshold(
        priv_amount,
        pub_threshold,
    );

    // 3. Verify no structuring pattern detected
    structuring::verify_no_structuring(
        priv_historical_amounts,
        priv_historical_timestamps,
        pub_threshold,
        pub_current_timestamp,
    );
}
