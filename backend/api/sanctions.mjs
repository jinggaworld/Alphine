/**
 * Sanctions API Router
 * Phase 6 — Real-time sanctions oracle endpoints
 *
 * GET  /api/sanctions/root      — Current Merkle root hash
 * POST /api/sanctions/check     — Check if address is sanctioned
 * POST /api/sanctions/proof     — Get Merkle proof for an address
 * GET  /api/sanctions/status    — Scheduler + tree status
 * POST /api/sanctions/refresh   — Force refresh sanctions data
 */
import express from 'express';
import { TavilySanctionsFetcher } from '../sanctions/fetcher.mjs';
import { MerkleTree } from '../sanctions/merkle_tree.mjs';
import { SanctionsUpdateScheduler } from '../sanctions/update_scheduler.mjs';

export function createSanctionsRouter() {
    const router = express.Router();

    // Initialize sanctions infrastructure
    const fetcher = new TavilySanctionsFetcher(process.env.TAVILY_API_KEY);
    const tree = new MerkleTree(10);
    const scheduler = new SanctionsUpdateScheduler(fetcher, tree, 30);

    // Build initial tree with mock data immediately
    const initialData = fetcher.getMockSanctions() || [];
    tree.addAddresses(initialData);
    tree.build();
    console.log(`🏗️  Initial sanctions tree: ${tree.size} entries, root: ${tree.getRootHex()?.slice(0, 16)}...`);

    // Start scheduler (fetches from Tavily periodically)
    scheduler.start();

    /**
     * GET /api/sanctions/root
     * Get the current Merkle root of the sanctions tree
     */
    router.get('/sanctions/root', (req, res) => {
        res.json({
            merkleRoot: tree.getRootHex(),
            entriesCount: tree.size,
            lastUpdated: scheduler.lastUpdate?.toISOString() || null,
            addresses: tree.addresses.slice(0, 5), // First 5 for preview
        });
    });

    /**
     * POST /api/sanctions/check
     * Check if an address is in the sanctions list
     *
     * Body: { address: "G..." }
     */
    router.post('/sanctions/check', (req, res) => {
        const { address } = req.body;

        if (!address) {
            return res.status(400).json({ error: 'Missing required field: address' });
        }

        const isSanctioned = tree.contains(address);
        const proof = isSanctioned ? tree.getProof(address) : null;

        res.json({
            address,
            isSanctioned,
            merkleRoot: tree.getRootHex(),
            proof: proof ? {
                proof: proof.proof.map(p => p.toString('hex')),
                indices: proof.indices,
            } : null,
            lastUpdated: scheduler.lastUpdate?.toISOString() || null,
            schedulerStatus: scheduler.getStatus(),
        });
    });

    /**
     * POST /api/sanctions/proof
     * Get Merkle proof for an address in the sanctions list
     *
     * Body: { address: "G..." }
     */
    router.post('/sanctions/proof', (req, res) => {
        const { address } = req.body;

        if (!address) {
            return res.status(400).json({ error: 'Missing required field: address' });
        }

        const isSanctioned = tree.contains(address);
        const proof = tree.getProof(address);

        if (!proof) {
            return res.json({
                address,
                isSanctioned: false,
                merkleRoot: tree.getRootHex(),
                message: 'Address not found in sanctions list — no proof available (non-membership)',
            });
        }

        res.json({
            address,
            isSanctioned: true,
            merkleRoot: tree.getRootHex(),
            proof: {
                proof: proof.proof.map(p => p.toString('hex')),
                indices: proof.indices,
            },
        });
    });

    /**
     * GET /api/sanctions/status
     * Scheduler and tree status
     */
    router.get('/sanctions/status', (req, res) => {
        res.json({
            scheduler: scheduler.getStatus(),
            tree: {
                size: tree.size,
                depth: tree.depth,
                merkleRoot: tree.getRootHex(),
            },
        });
    });

    /**
     * POST /api/sanctions/refresh
     * Force an immediate refresh of sanctions data
     */
    router.post('/sanctions/refresh', async (req, res) => {
        try {
            await scheduler.forceUpdate();
            res.json({
                success: true,
                message: 'Sanctions data refreshed',
                status: scheduler.getStatus(),
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    });

    return { router, tree, scheduler, fetcher };
}
