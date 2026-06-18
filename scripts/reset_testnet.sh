#!/bin/bash
# scripts/reset_testnet.sh — Redeploy everything from scratch
set -e

echo "🔄 Resetting testnet deployment..."

# Source env
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

# Get fresh testnet XLM
echo "  Funding accounts..."
stellar keys fund alice --network testnet 2>/dev/null || true
stellar keys fund bob --network testnet 2>/dev/null || true

# Re-run deploy
echo "  Redeploying..."
bash scripts/deploy.sh

# Verify
echo "  Verifying..."
bash scripts/verify_deployment.sh

echo -e "\n✅ Reset complete"
