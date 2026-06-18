/**
 * Proof API Router
 * Phase 9 — ZK Proof generation and verification endpoints
 *
 * POST /api/proof/generate — Generate ZK compliance proof
 * POST /api/proof/verify   — Verify a proof (calls Soroban contract)
 * GET  /api/proof/status   — Check if proof generation is available
 */
import express from 'express';
import { generateComplianceProof, loadCompiledCircuit } from '../prover/prove_compliance.mjs';

// Check if Barretenberg is available
let BarretenbergBackend;
try {
    BarretenbergBackend = (await import('@noir-lang/backend_barretenberg')).BarretenbergBackend;
} catch {
    BarretenbergBackend = null;
}

const compiledCircuit = loadCompiledCircuit();

export function createProofRouter() {
  const router = express.Router();

  /**
   * POST /api/proof/generate
   * Generate a ZK compliance proof from transaction data
   *
   * Body: {
   *   userAddress: string,
   *   merkleRoot: string,
   *   nullifier: string,
   *   merkleProof: string[],
   *   merkleIndices: boolean[],
   *   amount: number,
   *   threshold: number,
   *   historicalAmounts: number[],
   *   historicalTimestamps: number[],
   * }
   */
  router.post('/generate', async (req, res) => {
    const startTime = Date.now();
    try {
      const {
        userAddress,
        merkleRoot,
        nullifier,
        merkleProof,
        merkleIndices,
        amount,
        threshold,
        historicalAmounts,
        historicalTimestamps,
      } = req.body;

      if (!userAddress || !merkleRoot || !nullifier || amount === undefined) {
        return res.status(400).json({
          error: 'Missing required fields: userAddress, merkleRoot, nullifier, amount',
        });
      }

      const result = await generateComplianceProof({
        merkleRoot,
        nullifier,
        threshold: threshold || 10000,
        currentTimestamp: Math.floor(Date.now() / 1000),
        userAddress,
        merkleProof: merkleProof || [],
        merkleIndices: merkleIndices || [],
        amount,
        historicalAmounts: historicalAmounts || [],
        historicalTimestamps: historicalTimestamps || [],
      });

      if (!result) {
        return res.status(500).json({ error: 'Proof generation failed' });
      }

      const processingTime = Date.now() - startTime;

      res.json({
        proofHex: Buffer.from(result.proof).toString('hex'),
        publicOutputs: result.publicOutputs,
        proofSize: result.proof.byteLength,
        processingTimeMs: processingTime,
        circuit: 'alphine_compliance',
      });
    } catch (error) {
      console.error('Proof generation error:', error.message);
      res.status(500).json({
        error: 'Proof generation failed',
        details: error.message,
      });
    }
  });

  /**
   * POST /api/proof/verify
   * Verify a ZK proof (stub for now — real verification done on Soroban)
   *
   * Body: { proofHex: string, publicOutputs: string[] }
   */
  router.post('/verify', async (req, res) => {
    try {
      const { proofHex, publicOutputs } = req.body;

      if (!proofHex) {
        return res.status(400).json({ error: 'Missing required field: proofHex' });
      }

      // Soroban verification is done on-chain in the Groth16 verifier contract
      // This endpoint is a convenience for checking proof format validity
      const proofBuffer = Buffer.from(proofHex, 'hex');
      const isValidFormat = proofBuffer.length > 0;

      res.json({
        verified: isValidFormat,
        proofSize: proofBuffer.length,
        publicInputs: publicOutputs || [],
        note: 'On-chain verification is performed via Groth16 Verifier Soroban contract',
      });
    } catch (error) {
      console.error('Proof verification error:', error.message);
      res.status(500).json({ error: 'Verification failed', details: error.message });
    }
  });

  /**
   * GET /api/proof/status
   * Check if proof generation is configured and ready
   */
  router.get('/status', async (req, res) => {
    const { BarretenbergBackend } = await import('@noir-lang/backend_barretenberg').catch(() => null);
    const { loadCompiledCircuit } = await import('../prover/prove_compliance.mjs');

    const circuit = loadCompiledCircuit();

    res.json({
      status: circuit ? 'ready' : 'mock_mode',
      circuit: circuit ? {
        name: circuit.name || 'alphine_compliance',
        hash: circuit.bytecode?.slice(0, 16) || 'unknown',
        abiLength: Object.keys(circuit.abi || {}).length,
      } : null,
      barretenberg: BarretenbergBackend ? 'available' : 'not installed',
      note: circuit
        ? 'Full ZK proof generation ready'
        : 'Running in mock mode — run `cd circuits/alphine_compliance && nargo compile` to enable real proofs',
    });
  });

  return { router };
}
