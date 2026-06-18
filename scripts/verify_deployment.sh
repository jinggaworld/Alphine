#!/bin/bash
# scripts/verify_deployment.sh — Verify all contracts are live on testnet
set -e

echo "🔍 Verifying Testnet Deployment..."
echo "===================================="

# Load environment
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

# Check verifier
echo -ne "  Verifier contract ($GROTH16_VERIFIER_ID): "
stellar contract invoke \
  --id "$GROTH16_VERIFIER_ID" \
  --source alice --network testnet \
  --network-passphrase 'Test SDF Network ; September 2015' \
  -- is_initialized 2>/dev/null \
  && echo "✅ Live" \
  || echo "❌ Not responding"

# Check payment contract
echo -ne "  Payment contract ($ALPHINE_PAYMENT_ID): "
stellar contract invoke \
  --id "$ALPHINE_PAYMENT_ID" \
  --source alice --network testnet \
  --network-passphrase 'Test SDF Network ; September 2015' \
  -- version 2>/dev/null \
  && echo "✅ Live" \
  || echo "❌ Not responding"

# Check account balance
echo -ne "  Alice balance: "
stellar keys balance alice --network testnet 2>/dev/null \
  || echo "❌ Cannot fetch"

# Check backend health
echo -ne "  Backend API: "
curl -s --max-time 3 http://localhost:3001/api/health | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('status','❌'))" 2>/dev/null \
  && echo "✅ Running" \
  || echo "❌ Not running"

# Check circuit compilation
echo -ne "  Noir circuit: "
ls -la circuits/alphine_compliance/target/*.json 2>/dev/null | head -1 \
  && echo "✅ Compiled" \
  || echo "❌ Not compiled (run: cd circuits/alphine_compliance && nargo compile)"

echo -e "\n✅ Verification complete"
