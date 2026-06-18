/**
 * Analyze API Router
 * Phase 5 — Express endpoints for AML transaction analysis
 * 
 * POST /api/analyze-transaction — Full AML pipeline (AI + sanctions)
 * POST /api/analyze-structuring — Structuring detection only
 * GET  /api/health — Server health + API key status
 */
import express from 'express';
import { AMLTransactionAnalyzer } from '../aml/analyzer.mjs';
import { ComplianceReportGenerator } from '../aml/compliance_report.mjs';
import { GroqCacheManager } from '../aml/cache_manager.mjs';

export function createAnalyzeRouter() {
    const router = express.Router();
    const amlAnalyzer = new AMLTransactionAnalyzer(process.env.GROQ_API_KEY);
    const reportGenerator = new ComplianceReportGenerator(amlAnalyzer);
    const cache = new GroqCacheManager();

    /**
     * POST /api/analyze-transaction
     * Full AML compliance analysis pipeline
     * 
     * Body: { transaction: { from, to, amount, timestamp }, userHistory: [...] }
     */
    router.post('/analyze-transaction', async (req, res) => {
        try {
            const { transaction, userHistory } = req.body;

            if (!transaction || !transaction.amount) {
                return res.status(400).json({
                    error: 'Missing required fields: transaction.amount',
                });
            }

            const userAddress = transaction.from || 'unknown';
            const startTime = Date.now();

            // Check cache first
            const cached = cache.get(userAddress, userHistory);
            if (cached) {
                return res.json({
                    ...cached,
                    cached: true,
                    processingTimeMs: Date.now() - startTime,
                });
            }

            // Generate compliance report via Groq AI
            const report = await reportGenerator.generateReport(
                transaction,
                userHistory || []
            );

            // Cache the result
            cache.set(userAddress, userHistory, report);

            res.json({
                ...report,
                cached: false,
                processingTimeMs: Date.now() - startTime,
                cacheStats: cache.getStats(),
            });
        } catch (error) {
            console.error('Analysis error:', error.message);
            res.status(500).json({
                error: 'Analysis failed',
                details: error.message,
            });
        }
    });

    /**
     * POST /api/analyze-structuring
     * Focused structuring detection only
     * 
     * Body: { transactions: [...], threshold: 10000 }
     */
    router.post('/analyze-structuring', async (req, res) => {
        try {
            const { transactions, threshold } = req.body;

            if (!transactions || !Array.isArray(transactions)) {
                return res.status(400).json({
                    error: 'Missing required field: transactions (array)',
                });
            }

            const result = await amlAnalyzer.detectStructuring(
                transactions,
                threshold || 10000
            );

            res.json(result);
        } catch (error) {
            console.error('Structuring analysis error:', error.message);
            res.status(500).json({
                error: 'Structuring analysis failed',
                details: error.message,
            });
        }
    });

    /**
     * GET /api/cache-stats
     * Groq cache hit/miss statistics
     */
    router.get('/cache-stats', (req, res) => {
        res.json(cache.getStats());
    });

    return { router, cache };
}
