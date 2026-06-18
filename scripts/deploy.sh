#!/bin/bash
# scripts/deploy.sh — Full deployment to Stellar testnet
set -e

echo "🏔️  Alphine — Deployment to Stellar Testnet"
echo "============================================"

# Load environment
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

# 1. Build all contracts
echo -e "\n📦 Building Soroban contracts..."
cd contracts/alphine_core

for contract in groth16-verifier alphine-payment; do
  echo "  Building $contract..."
  cargo build --target wasm32v1-none --package "$contract" --release 2>&1 | tail -3
done

cd ../..

# 2. Deploy Groth16 Verifier
echo -e "\n🔐 Deploying Groth16 Verifier..."
VERIFIER_ID=$(stellar contract deploy \
  --wasm contracts/alphine_core/target/wasm32v1-none/release/groth16_verifier.wasm \
  --source alice --network testnet \
  --network-passphrase 'Test SDF Network ; September 2015')
echo "  Verifier ID: $VERIFIER_ID"

# 3. Deploy Payment Contract
echo -e "\n💳 Deploying Alphine Payment..."
PAYMENT_ID=$(stellar contract deploy \
  --wasm contracts/alphine_core/target/wasm32v1-none/release/alphine_payment.wasm \
  --source alice --network testnet \
  --network-passphrase 'Test SDF Network ; September 2015')
echo "  Payment ID: $PAYMENT_ID"

# 4. Save to .env
echo -e "\n📝 Saving contract IDs..."
if grep -q "^GROTH16_VERIFIER_ID=" .env 2>/dev/null; then
  sed -i "s/^GROTH16_VERIFIER_ID=.*/GROTH16_VERIFIER_ID=$VERIFIER_ID/" .env
else
  echo "GROTH16_VERIFIER_ID=$VERIFIER_ID" >> .env
fi
if grep -q "^ALPHINE_PAYMENT_ID=" .env 2>/dev/null; then
  sed -i "s/^ALPHINE_PAYMENT_ID=.*/ALPHINE_PAYMENT_ID=$PAYMENT_ID/" .env
else
  echo "ALPHINE_PAYMENT_ID=$PAYMENT_ID" >> .env
fi

echo -e "\n✅ Deployment complete!"
echo "  Verifier: $VERIFIER_ID"
echo "  Payment:  $PAYMENT_ID"
