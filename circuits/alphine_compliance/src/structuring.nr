// Structuring Detection Proof
//
// Proves the user has not engaged in structuring (breaking large transactions
// into smaller ones to avoid reporting thresholds) in the lookback window.

global MAX_HISTORY: u32 = 20;
global SUSPICIOUS_RATIO: u64 = 80;
global MAX_SUSPICIOUS_COUNT: u64 = 3;
global LOOKBACK_DAYS: u64 = 90;

pub fn verify_no_structuring(
    historical_amounts: [Field; MAX_HISTORY],
    historical_timestamps: [Field; MAX_HISTORY],
    threshold: Field,
    current_timestamp: Field,
) {
    let threshold_u64 = threshold as u64;
    let suspicious_threshold = (threshold_u64 * SUSPICIOUS_RATIO) / 100;
    let lookback_seconds = (current_timestamp as u64) - (LOOKBACK_DAYS * 86400);

    let mut suspicious_count: u64 = 0;
    let mut suspicious_sum: u64 = 0;

    for i in 0..MAX_HISTORY {
        // Skip empty history entries (timestamp == 0 means no transaction)
        if historical_timestamps[i] != 0 {
            let ts_u64 = historical_timestamps[i] as u64;
            let amt_u64 = historical_amounts[i] as u64;

            let in_window = ts_u64 >= lookback_seconds;
            let near_threshold = amt_u64 > suspicious_threshold
                & amt_u64 < threshold_u64;

            // If in window AND near threshold, this is suspicious
            if (in_window as u64 * near_threshold as u64) == 1 {
                suspicious_count = suspicious_count + 1;
                suspicious_sum = suspicious_sum + amt_u64;
            }
        }
    }

    // Assert: suspicious count is within acceptable range
    assert(
        suspicious_count <= MAX_SUSPICIOUS_COUNT,
        "Too many transactions near threshold"
    );

    // Assert: cumulative suspicious amount is also limited
    assert(
        suspicious_sum <= threshold_u64 * 2,
        "Cumulative structuring amount exceeds limit"
    );
}
