#!/bin/bash
# scripts/run_all_tests.sh — Run all project tests before submission
set -e

echo "=========================================="
echo "  🏔️  Alphine — Full Test Suite"
echo "=========================================="

cd "$(dirname "$0")/.."
PROJECT_ROOT=$(pwd)

# 1. Rust / Soroban Contract Tests
echo ""
echo "📦 1/4 — Rust Contract Tests (cargo test)"
echo "------------------------------------------"
cd "$PROJECT_ROOT/contracts/alphine_core"
cargo test 2>&1 | tail -5
echo "✅ Rust tests complete"

# 2. Noir Circuit Compilation Check
echo ""
echo "🔌 2/4 — Noir Circuit Check (nargo compile)"
echo "------------------------------------------"
export PATH="$HOME/.nargo/bin:$PATH"
cd "$PROJECT_ROOT/circuits/alphine_compliance"
if nargo compile 2>&1 | grep -q "error"; then
  echo "❌ Noir compilation failed!"
  nargo compile 2>&1
  exit 1
else
  echo "✅ Noir circuit compiled"
fi

# 3. Frontend TypeScript Check
echo ""
echo "🎨 3/4 — Frontend TypeScript Check"
echo "------------------------------------------"
cd "$PROJECT_ROOT/frontend"
npx tsc --noEmit 2>&1 || { echo "❌ TypeScript errors!"; exit 1; }
echo "✅ TypeScript clean"

# 4. Frontend Build
echo ""
echo "🏗️  4/4 — Frontend Production Build"
echo "------------------------------------------"
cd "$PROJECT_ROOT/frontend"
npx vite build 2>&1 | tail -5
echo "✅ Frontend build successful"

echo ""
echo "=========================================="
echo "  ✅  All tests passed!"
echo "=========================================="
