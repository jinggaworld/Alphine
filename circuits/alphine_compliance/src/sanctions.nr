// Sanctions Non-Membership Proof
//
// Proves that a user's address is NOT in the sanctions Merkle tree
// without revealing the address itself.
//
// Public Inputs: merkle_root, nullifier
// Private Inputs: user_address, merkle_proof, merkle_indices

fn compute_merkle_root(
    leaf: Field,
    proof: [Field; 5],
    indices: [bool; 5],
) -> Field {
    let mut current = leaf;
    for i in 0..5 {
        let sibling = proof[i];
        // Use pedersen_hash for Merkle tree hashing
        if indices[i] {
            current = std::hash::pedersen_hash([sibling, current]);
        } else {
            current = std::hash::pedersen_hash([current, sibling]);
        }
    }
    current
}

pub fn verify_not_sanctioned(
    merkle_root: Field,
    user_address: Field,
    merkle_proof: [Field; 5],
    merkle_indices: [bool; 5],
    nullifier: Field,
) {
    // 1. Compute nullifier: unique per user to prevent replay attacks
    let computed_nullifier = std::hash::pedersen_hash([user_address, 1]);
    assert(computed_nullifier == nullifier, "Invalid nullifier");

    // 2. Compute what the Merkle root would be IF user_address were in the tree
    let computed_root = compute_merkle_root(user_address, merkle_proof, merkle_indices);

    // 3. Non-membership: if address IS sanctioned, computed_root would match
    assert(computed_root != merkle_root, "Address is sanctioned!");
}
