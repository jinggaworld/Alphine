// Amount Threshold Proof
//
// Proves the transaction amount is below the FINRA reporting threshold
// without revealing the exact amount.
//
// Public Inputs: threshold
// Private Inputs: amount

pub fn verify_amount_below_threshold(
    amount: Field,
    threshold: Field,
) {
    // Cast to u64 for comparison
    let amount_u64 = amount as u64;
    let threshold_u64 = threshold as u64;

    // Prove amount is positive
    assert(amount_u64 > 0, "Amount must be positive");

    // Prove amount is below or equal to threshold
    assert(amount_u64 <= threshold_u64, "Amount exceeds reporting threshold");
}
