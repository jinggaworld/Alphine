/**
 * Merkle Tree Builder
 * Phase 6 — Builds Merkle tree from sanctions list for ZK circuit
 *
 * Uses SHA-256 as a Poseidon stand-in for development.
 * In production, this would use actual Poseidon hash to match the Noir circuit.
 *
 * Provides:
 * - addAddress / addAddresses
 * - getProof (for Merkle proof generation)
 * - contains (check if address is in tree)
 * - getRoot (current Merkle root hash)
 */
import { createHash } from 'crypto';

export class MerkleTree {
    constructor(depth = 10) {
        this.depth = depth;
        this.leaves = new Map(); // address -> index
        this.tree = [];          // levels of hashes
        this.root = null;
        this._zeroHash = this._hash(Buffer.alloc(32));
    }

    _hash(data) {
        return createHash('sha256').update(data).digest();
    }

    _hashLeaf(address) {
        return this._hash(Buffer.from(address.toLowerCase(), 'utf-8'));
    }

    /**
     * Add an address to the tree
     */
    addAddress(address) {
        const normalized = address.toLowerCase().trim();
        if (!this.leaves.has(normalized)) {
            this.leaves.set(normalized, this.leaves.size);
        }
    }

    /**
     * Add multiple addresses at once
     */
    addAddresses(addresses) {
        for (const addr of addresses) {
            this.addAddress(addr);
        }
    }

    /**
     * Remove an address from the tree
     */
    removeAddress(address) {
        const normalized = address.toLowerCase().trim();
        this.leaves.delete(normalized);
    }

    /**
     * Clear all addresses and rebuild
     */
    clear() {
        this.leaves.clear();
        this.tree = [];
        this.root = null;
    }

    /**
     * Build the Merkle tree from current leaves
     */
    build() {
        const leafValues = Array.from(this.leaves.keys()).map(addr =>
            this._hashLeaf(addr)
        );

        const leafCount = leafValues.length;
        // Pad to power of 2
        const size = Math.max(2, Math.pow(2, Math.ceil(Math.log2(leafCount || 1))));
        let currentLevel = new Array(size).fill(this._zeroHash);

        for (let i = 0; i < leafCount; i++) {
            currentLevel[i] = leafValues[i];
        }

        this.tree = [currentLevel];

        // Build tree bottom-up
        while (currentLevel.length > 1) {
            const nextLevel = [];
            for (let i = 0; i < currentLevel.length; i += 2) {
                const left = currentLevel[i];
                const right = currentLevel[i + 1] !== undefined ? currentLevel[i + 1] : this._zeroHash;
                const combined = Buffer.concat([left, right]);
                nextLevel.push(this._hash(combined));
            }
            this.tree.push(nextLevel);
            currentLevel = nextLevel;
        }

        this.root = this.tree[this.tree.length - 1][0];
    }

    /**
     * Get Merkle proof for an address
     * @returns {{ proof: Buffer[], indices: number[] } | null}
     */
    getProof(address) {
        const normalized = address.toLowerCase().trim();
        const index = this.leaves.get(normalized);

        if (index === undefined) return null;
        if (this.tree.length === 0) this.build();

        const proof = [];
        const indices = [];
        let idx = index;

        for (let level = 0; level < this.tree.length - 1; level++) {
            const siblingIdx = idx % 2 === 0 ? idx + 1 : idx - 1;
            const sibling = this.tree[level][siblingIdx] || this._zeroHash;

            proof.push(sibling);
            indices.push(idx % 2 === 0 ? 0 : 1);

            idx = Math.floor(idx / 2);
        }

        return { proof, indices };
    }

    /**
     * Check if an address is in the tree
     */
    contains(address) {
        return this.leaves.has(address.toLowerCase().trim());
    }

    /**
     * Get the current Merkle root as hex string
     */
    getRootHex() {
        if (!this.root) this.build();
        return this.root?.toString('hex') || null;
    }

    /**
     * Get raw Merkle root buffer
     */
    getRoot() {
        if (!this.root) this.build();
        return this.root;
    }

    /**
     * Get the number of leaves in the tree
     */
    get size() {
        return this.leaves.size;
    }

    /**
     * Get all addresses in the tree
     */
    get addresses() {
        return Array.from(this.leaves.keys());
    }
}
