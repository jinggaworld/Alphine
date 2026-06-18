/**
 * Alphine Backend Server
 * Phase 5 — Groq AI + AML Pattern Detection
 * Phase 6 — Tavily Sanctions Oracle + Merkle Tree
 *
 * Provides REST API endpoints for:
 * - AML transaction analysis (Groq AI)
 * - Structuring detection
 * - Sanctions checking (OFAC, UN, real-time via Tavily)
 * - Merkle proof generation for ZK circuit
 * - Health monitoring
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createAnalyzeRouter } from './api/analyze.mjs';
import { createSanctionsRouter } from './api/sanctions.mjs';
import { createProofRouter } from './api/proof.mjs';

// Load .env from project root (parent of backend/)
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(
            `[${new Date().toISOString()}] ${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`
        );
    });
    next();
});

// Phase 5 — AML Analysis Routes
const { router: analyzeRouter } = createAnalyzeRouter();
app.use('/api', analyzeRouter);

// Phase 6 — Sanctions Oracle Routes
const { router: sanctionsRouter } = createSanctionsRouter();
app.use('/api', sanctionsRouter);

// Phase 9 — ZK Proof Generation Routes
const { router: proofRouter } = createProofRouter();
app.use('/api/proof', proofRouter);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        phases: ['5 — Groq AI AML Analysis', '6 — Tavily Sanctions Oracle', '9 — ZK Proof Generation'],
        config: {
            groq: process.env.GROQ_API_KEY
                ? `configured (${process.env.GROQ_API_KEY.slice(0, 8)}...)`
                : 'not configured — using mock mode',
            tavily: process.env.TAVILY_API_KEY
                ? `configured (${process.env.TAVILY_API_KEY.slice(0, 8)}...)`
                : 'not configured — using mock mode',
        },
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        availableEndpoints: [
            'GET  /api/health',
            'POST /api/analyze-transaction',
            'POST /api/analyze-structuring',
            'GET  /api/cache-stats',
            'POST /api/proof/generate',
            'POST /api/proof/verify',
            'GET  /api/proof/status',
            'GET  /api/sanctions/root',
            'POST /api/sanctions/check',
            'POST /api/sanctions/proof',
            'GET  /api/sanctions/status',
            'POST /api/sanctions/refresh',
        ],
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message,
    });
});

app.listen(PORT, () => {
    console.log(`\n🏔️  Alphine Backend Server`);
    console.log(`   Phases 5+6 — AML Analysis + Sanctions Oracle`);
    console.log(`   Listening on http://localhost:${PORT}\n`);
    console.log(`   Endpoints:`);
    console.log(`   → GET  /api/health`);
    console.log(`   → POST /api/analyze-transaction`);
    console.log(`   → POST /api/analyze-structuring`);
    console.log(`   → GET  /api/cache-stats`);
    console.log(`   → POST /api/proof/generate`);
    console.log(`   → POST /api/proof/verify`);
    console.log(`   → GET  /api/proof/status`);
    console.log(`   → GET  /api/sanctions/root`);
    console.log(`   → POST /api/sanctions/check`);
    console.log(`   → POST /api/sanctions/proof`);
    console.log(`   → GET  /api/sanctions/status`);
    console.log(`   → POST /api/sanctions/refresh`);

    const groqStatus = process.env.GROQ_API_KEY ? '✅ configured' : '⚠️  mock mode';
    const tavilyStatus = process.env.TAVILY_API_KEY ? '✅ configured' : '⚠️  mock mode';
    console.log(`\n   Groq API:   ${groqStatus}`);
    console.log(`   Tavily API: ${tavilyStatus}\n`);
});
