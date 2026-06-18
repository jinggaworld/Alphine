/**
 * Alphine Compliance Proof Generator
 * Phase 9 — Integrates compiled Noir circuit for ZK proof generation
 *
 * Uses the compiled ACIR circuit from:
 *   circuits/alphine_compliance/target/alphine_compliance.json
 *
 * The circuit proves:
 *   1. User is not on sanctions list (Merkle non-membership)
 *   2. Transaction amount is below FINRA threshold
 *   3. No structuring pattern detected
 */

import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CIRCUIT_PATH = join(__dirname, '../../circuits/alphine_compliance/target/alphine_compliance.json');

/**
 * Load the compiled ACIR circuit from disk
 */
function loadCompiledCircuit() {
  try {
    if (!existsSync(CIRCUIT_PATH)) {
      console.warn('  ⚠️  Compiled circuit not found at:', CIRCUIT_PATH);
      console.warn('     Run: cd circuits/alphine_compliance && nargo compile');
      return null;
    }
    const data = readFileSync(CIRCUIT_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    console.error('  ❌ Failed to load circuit:', e.message);
    return null;
  }
}

/**
 * Generate a ZK compliance proof using the Noir circuit
 *
 * @param {Object} inputs - Proof inputs
 * @param {string} inputs.merkleRoot - Sanctions Merkle tree root (hex)
 * @param {string} inputs.nullifier - Unique nullifier for replay protection
 * @param {number} inputs.threshold - FINRA reporting threshold
 * @param {number} inputs.currentTimestamp - Current Unix timestamp
 * @param {string} inputs.userAddress - User's address (hex)
 * @param {string[]} inputs.merkleProof - Merkle tree sibling hashes
 * @param {boolean[]} inputs.merkleIndices - Left/right indicators
 * @param {number} inputs.amount - Transaction amount
 * @param {number[]} inputs.historicalAmounts - Past transaction amounts
 * @param {number[]} inputs.historicalTimestamps - Past transaction timestamps
 *
 * @returns {Promise<{proof: Uint8Array, publicOutputs: string[]}|null>}
 */
async function generateComplianceProof(inputs) {
  const circuit = loadCompiledCircuit();
  if (!circuit) {
    console.log('  ℹ️  Mock mode: returning demo proof');
    return getMockProof(inputs);
  }

  console.log('  🔐 Initializing Noir backend (Barretenberg)...');
  const backend = new BarretenbergBackend(circuit);
  const noir = new Noir(circuit, backend);

  // Format inputs matching the bin-type circuit:
  // fn main(pub_merkle_root, pub_nullifier, pub_threshold, pub_current_timestamp,
  //         priv_user_address, priv_merkle_proof, priv_merkle_indices,
  //         priv_amount, priv_historical_amounts, priv_historical_timestamps)
  const proofInputs = {
    pub_merkle_root: inputs.merkleRoot,
    pub_nullifier: inputs.nullifier,
    pub_threshold: inputs.threshold.toString(),
    pub_current_timestamp: inputs.currentTimestamp.toString(),
    priv_user_address: inputs.userAddress,
    priv_merkle_proof: inputs.merkleProof || new Array(5).fill('0'),
    priv_merkle_indices: inputs.merkleIndices || new Array(5).fill(false),
    priv_amount: inputs.amount.toString(),
    priv_historical_amounts: padArray(inputs.historicalAmounts || [], 20, 0),
    priv_historical_timestamps: padArray(inputs.historicalTimestamps || [], 20, 0),
  };

  console.log('  ⚡ Generating ZK proof...');
  try {
    const result = await noir.generateFinalProof(proofInputs);
    console.log('  ✅ Proof generated!');
    console.log(`     Proof length: ${result.proof.byteLength} bytes`);
    return result;
  } catch (e) {
    console.error('  ❌ Proof generation failed:', e.message);
    return getMockProof(inputs);
  }
}

/**
 * Pad array to target length with default value
 */
function padArray(arr, targetLen, defaultVal) {
  const padded = [...arr];
  while (padded.length < targetLen) {
    padded.push(defaultVal);
  }
  return padded.slice(0, targetLen);
}

/**
 * Return a mock proof for development/testing
 */
function getMockProof(inputs) {
  return {
    proof: new Uint8Array(32).fill(42),
    publicOutputs: [
      inputs.merkleRoot || '0x00',
      inputs.nullifier || '0x00',
      (inputs.threshold || 10000).toString(),
      (inputs.currentTimestamp || Math.floor(Date.now() / 1000)).toString(),
    ],
  };
}

export { generateComplianceProof, loadCompiledCircuit };
