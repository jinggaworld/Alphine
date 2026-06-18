/**
 * Alphine Full Pipeline Integration Tests
 * Phase 9 — Testing the complete flow from AI analysis → ZK proof → API
 *
 * Run: node --test tests/integration/full_pipeline.test.mjs
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'child_process';
import { spawn } from 'child_process';
import { createHash } from 'crypto';

// Helper: simplified Merkle tree for sanctions
function buildMerkleTree(addresses) {
  const leaves = addresses.map(a =>
    createHash('sha256').update(a.toLowerCase()).digest()
  );
  // Pad to power of 2
  const size = Math.pow(2, Math.ceil(Math.log2(leaves.length || 1)));
  const tree = [new Array(size).fill(Buffer.alloc(32))];
  leaves.forEach((l, i) => { tree[0][i] = l; });

  while (tree[0].length > 1) {
    const next = [];
    for (let i = 0; i < tree[0].length; i += 2) {
      const combined = Buffer.concat([tree[0][i], tree[0][i + 1] || tree[0][i]]);
      next.push(createHash('sha256').update(combined).digest());
    }
    tree.unshift(next);
  }
  return { root: tree[0][0], tree };
}

describe('🏔️ Alphine Phase 9 — Integration Tests', () => {
  let serverProcess = null;

  before(async () => {
    console.log('  Starting backend server...');
    serverProcess = spawn('node', ['index.mjs'], {
      cwd: './backend',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, PORT: '3099' },
    });

    await new Promise((resolve) => {
      setTimeout(resolve, 3000);
    });
  });

  after(() => {
    if (serverProcess) {
      serverProcess.kill();
      console.log('  Backend server stopped');
    }
  });

  it('should respond to health check', async () => {
    const res = await fetch('http://localhost:3099/api/health');
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.status, 'ok');
    assert.ok(data.version);
  });

  it('should return sanctions merkle root', async () => {
    const res = await fetch('http://localhost:3099/api/sanctions/root');
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.ok(data.merkleRoot || data.entriesCount >= 0);
  });

  it('should check if address is sanctioned', async () => {
    const res = await fetch('http://localhost:3099/api/sanctions/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: '0x1da5821544e25c636c141977baa94b100cbf8b0b' }),
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.ok('isSanctioned' in data);
    assert.ok('merkleRoot' in data);
  });

  it('should analyze transaction for AML compliance', async () => {
    const res = await fetch('http://localhost:3099/api/analyze-transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transaction: {
          from: 'GAXHJL2X5YW4CL7QJ4C5ZOY5PJ5ZOY5PJ5ZOY5PJ5ZOY5PJ5ZOY5PJ5',
          to: 'GBPLT6T3K6Q5W5Y4W5Y4W5Y4W5Y4W5Y4W5Y4W5Y4W5Y4W5Y4W5Y4W5Y4',
          amount: '5000',
          timestamp: Math.floor(Date.now() / 1000),
        },
        userHistory: [],
      }),
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.ok('compliance' in data || 'circuitInputs' in data);
  });

  it('should build correct Merkle tree for sanctions', () => {
    const addresses = ['0xabc123', '0xdef456', '0xghi789'];
    const tree = buildMerkleTree(addresses);
    assert.ok(tree.root);
    assert.ok(tree.root.length === 32);
    assert.ok(tree.tree.length > 0);
  });

  it('should have compiled Noir circuit', () => {
    const result = execSync(
      'ls -la circuits/alphine_compliance/target/*.json 2>/dev/null || echo "NOT_FOUND"',
      { encoding: 'utf-8' }
    );
    assert.ok(!result.includes('NOT_FOUND'), 'Noir circuit not compiled');
  });

  it('should have clean TypeScript compilation', () => {
    const result = execSync(
      'cd frontend && npx tsc --noEmit 2>&1 || echo "TSC_FAILED"',
      { encoding: 'utf-8' }
    );
    assert.ok(!result.includes('TSC_FAILED'), 'TypeScript has errors');
    assert.ok(!result.includes('error'), 'TypeScript compilation errors');
  });

  it('should run end-to-end flow (sanctions check + analyze)', async () => {
    const sanRes = await fetch('http://localhost:3099/api/sanctions/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: 'GCLEANADDRESS1234567890123456789012345678901234567890123' }),
    });
    const sanData = await sanRes.json();
    assert.equal(sanRes.status, 200);

    if (!sanData.isSanctioned) {
      const analyzeRes = await fetch('http://localhost:3099/api/analyze-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction: {
            from: 'GA...',
            to: 'GB...',
            amount: '5000',
            timestamp: Math.floor(Date.now() / 1000),
          },
          userHistory: [],
        }),
      });
      assert.equal(analyzeRes.status, 200);
    }
  });
});
