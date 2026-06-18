# 🏔️ Alphine — 10 Phase Final Build (0% → 100%)

## ZK-Powered AML Compliance Layer for Stellar

---

**Hackathon:** Stellar Hacks: Real-World ZK (DoraHacks)
**Deadline:** June 29, 2026 — 19:00 UTC
**Development Environment:** WSL Ubuntu (Windows Subsystem for Linux)
**Target:** $5,000 Grand Prize + Judges' Recognition

---

## 📊 Phase Overview

| Phase | % | Fokus Utama | Estimasi Waktu |
|-------|---|-------------|----------------|
| [1️⃣](#phase-1-0-10-environment-setup--stellar-protocol-foundation) | 0–10% | Environment Setup + Stellar Foundation | 3–4 jam |
| [2️⃣](#phase-2-10-20-rust--soroban-smart-contract-fundamentals) | 10–20% | Rust & Soroban Smart Contract Fundamentals | 4–6 jam |
| [3️⃣](#phase-3-20-30-noir-circuit-design--zk-proof-pipeline) | 20–30% | Noir Circuit Design + ZK Proof Pipeline | 6–8 jam |
| [4️⃣](#phase-4-30-40-circom-groth16-on-stellar--verifier-contract) | 30–40% | Circom Groth16 on Stellar + Verifier Contract | 6–8 jam |
| [5️⃣](#phase-5-40-50-groq-ai-integration--aml-pattern-detection) | 40–50% | Groq AI Integration + AML Pattern Detection | 4–6 jam |
| [6️⃣](#phase-6-50-60-tavily-integration--real-time-sanctions-oracle) | 50–60% | Tavily Integration + Real-time Sanctions Oracle | 4–5 jam |
| [7️⃣](#phase-7-60-70-soroban-payment-contract--end-to-end-logic) | 60–70% | Soroban Payment Contract + End-to-End Logic | 6–8 jam |
| [8️⃣](#phase-8-70-80-frontend-dapp--user-dashboard) | 70–80% | Frontend dApp + User Dashboard | 6–8 jam |
| [9️⃣](#phase-9-80-90-integration-testing--testnet-deployment) | 80–90% | Integration Testing + Testnet Deployment | 4–6 jam |
| [🔟](#phase-10-90-100-demo-video--submission-package) | 90–100% | Demo Video + Submission Package | 4–6 jam |

**Total Estimasi:** 48–65 jam (dikerjakan dalam 14 hari)

---

# Phase 1 (0–10%): Environment Setup + Stellar Protocol Foundation

**Goal:** WSL Ubuntu siap development dengan Stellar Soroban toolchain, Rust, Noir, dan semua dependencies. Verifikasi setup dengan "Hello World" smart contract di Soroban testnet.

---

## 1.1 WSL Ubuntu System Preparation

```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Build essentials & dev tools
sudo apt install -y build-essential pkg-config libssl-dev \
  libclang-dev clang curl wget git cmake jq htop

# Check Ubuntu version — minimal 22.04 LTS
lsb_release -a
```

## 1.2 Install Rust Toolchain

```bash
# Install rustup (Rust installer)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Load Rust ke PATH
source "$HOME/.cargo/env"

# Target WASM untuk Soroban
rustup target add wasm32-unknown-unknown

# Set default toolchain ke stable
rustup default stable

# Verifikasi
rustc --version          # → rustc 1.84+
cargo --version          # → cargo 1.84+
```

**Penjelasan:** Soroban contract di-compile ke WebAssembly (WASM), jadi kita perlu `wasm32-unknown-unknown` target. Rust stable adalah versi yang didukung resmi oleh Stellar SDK.

## 1.3 Install Soroban CLI

Soroban CLI adalah tool utama untuk compile, test, deploy, dan interact dengan smart contract di Stellar.

```bash
# Install dari source (recommended untuk latest)
cargo install --locked --version 21.0.4 soroban-cli

# Atau install via binary (alternatif)
# curl -fsSL https://soroban.stellar.org/install.sh | bash

# Verifikasi
soroban version
# → soroban-cli 21.0.4 (stellar-core 21.2.0)
```

## 1.4 Install Node.js + pnpm (untuk Frontend & Backend Services)

```bash
# Install Node.js 22 LTS via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22

# Install pnpm
corepack enable && corepack prepare pnpm@latest --activate

# Verifikasi
node --version   # → v22.x
pnpm --version   # → 9.x
```

## 1.5 Install Noir (nargo)

```bash
# Install Noir via official script
curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash
source ~/.bashrc
noirup
nargo --version  # → nargo 1.0.0-beta.x
```

**Penjelasan:** `noirup` adalah version manager untuk Noir, mirip `rustup`. Ini akan menginstall `nargo` — compiler dan toolchain Noir.

## 1.6 Stellar Testnet Account Setup

```bash
# Generate keypair baru untuk development
soroban keys generate alice --network testnet
soroban keys generate bob --network testnet

# Fund dengan Friendbot (testnet faucet)
soroban keys fund alice --network testnet
soroban keys fund bob --network testnet

# Cek balance
soroban keys balance alice --network testnet

# Export private key untuk digunakan di backend
soroban keys show alice

# Set default identity
soroban config identity set default alice
```

## 1.7 Project Directory Structure

```bash
mkdir -p ~/alphine && cd ~/alphine

# Struktur project
mkdir -p contracts/          # Soroban smart contracts
mkdir -p circuits/           # Noir ZK circuits  
mkdir -p backend/            # Node.js/TypeScript backend
mkdir -p frontend/           # React frontend
mkdir -p scripts/            # Deploy & test scripts
mkdir -p docs/               # Dokumentasi
mkdir -p tests/              # Integration tests
mkdir -p artifacts/          # Compiled WASM & circuit artifacts

# Init workspace
git init
echo "node_modules/\ntarget/\n.env\n*.wasm\n" > .gitignore
```

## 1.8 Verification: Deploy Hello World Contract

```bash
# Init Soroban contract project
cd ~/alphine/contracts
soroban contract init hello_world
cd hello_world

# Build
soroban contract build

# Deploy ke testnet
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/hello_world.wasm \
  --network testnet \
  --source alice

# Simpan contract ID
# → Contract ID: C...

# Invoke
soroban contract invoke \
  --id <CONTRACT_ID> \
  --network testnet \
  --source alice \
  -- \
  hello --to "Alphine"
# → Output: ["Hello", "Alphine"]
```

## 1.9 Environment Variables Setup

```bash
cd ~/alphine
cat > .env << 'EOF'
# Stellar
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
SOROBAN_RPC_URL=https://rpc-futurenet.stellar.org:443

# API Keys
GROQ_API_KEY=
TAVILY_API_KEY=

# Contract IDs (diisi setelah deploy)
SANCTIONS_VERIFIER_ID=
PAYMENT_CONTRACT_ID=
EOF

echo ".env" >> .gitignore
```

## 1.10 ✅ Phase 1 — Deliverables Check

| Item | Status |
|------|--------|
| Rust + `wasm32-unknown-unknown` | ☐ |
| Soroban CLI 21.x | ☐ |
| Node.js 22 + pnpm | ☐ |
| Noir (nargo) | ☐ |
| Stellar testnet accounts (alice, bob) | ☐ |
| Keys funded with testnet XLM | ☐ |
| Hello World contract deployed + invoked | ☐ |
| Project directory structure | ☐ |
| `.env` dengan semua variables | ☐ |
| Git initialized | ☐ |

---

# Phase 2 (10–20%): Rust & Soroban Smart Contract Fundamentals

**Goal:** Kuasai Soroban SDK, develop foundational contract patterns (storage, auth, token interactions), dan deploy Stellar Asset Contract (SAC) untuk USDC testnet.

---

## 2.1 Soroban SDK Deep Dive

**Key Concepts yang harus dikuasai:**

| Konsep | Deskripsi | Kenapa Penting |
|--------|-----------|----------------|
| **Env** | Environment object untuk contract | Akses storage, crypto, logging |
| **Soroban-sdk** | Rust crate untuk contract development | Type, storage, auth |
| **Data Types** | `i128`, `u64`, `Bytes`, `Address` | Representasi data on-chain |
| **Storage** | `Env::storage().persistent()` / `temporary()` | Data persistence |
| **Auth** | `require_auth()` | Signature verification |
| **Events** | `env.events().publish()` | Off-chain indexing |
| **Token Interface** | `token::Client` | Interaksi dengan asset Stellar |

```rust
// Contoh pattern dasar — contracts/alphine_core/src/lib.rs
#![no_std]
use soroban_sdk::{contract, contractimpl, Env, symbol_short, Symbol};

const DATA_KEY: Symbol = symbol_short!("version");

#[contract]
pub struct AlphineCore;

#[contractimpl]
impl AlphineCore {
    pub fn version(env: Env) -> u32 {
        env.storage().persistent().get(&DATA_KEY).unwrap_or(0)
    }
    
    pub fn init(env: Env) {
        env.storage().persistent().set(&DATA_KEY, &1u32);
        env.events().publish((symbol_short!("init"),), 1u32);
    }
}
```

## 2.2 Setup Soroban Development Contract

```bash
cd ~/alphine/contracts

# Init contract untuk Alphine
soroban contract init alphine_core
cd alphine_core

# Tambah dependencies ke Cargo.toml
cat >> Cargo.toml << 'EOF'

[dependencies]
soroban-sdk = "21.0.4"
serde = { version = "1", default-features = false, features = ["derive"] }
serde_json = { version = "1", default-features = false, features = ["alloc"] }
EOF

# Build untuk verifikasi
soroban contract build
```

## 2.3 Stellar Asset Contract (SAC) — USDC Mock

Untuk hackathon, kita perlu mock USDC untuk testing.

```bash
# Deploy Stellar Asset Contract untuk USDC mock
cd ~/alphine

# Sac-cli untuk manage token
# Token SAC sudah built-in di Stellar, kita deploy asset baru
soroban lab token wrap \
  --asset USDC:GD5KD... \
  --network testnet \
  --source alice

# Atau deploy SAC dari template untuk test token
soroban contract asset deploy \
  --issuer alice \
  --network testnet

# Cek balance
soroban lab token balance \
  --id <TOKEN_CONTRACT_ID> \
  --user alice \
  --network testnet
```

## 2.4 Token Transfer Pattern

Pattern ini vital untuk Alphine — contract harus bisa transfer USDC setelah proof diverifikasi.

```rust
// Fungsi transfer yang akan dipakai di payment contract
use soroban_sdk::token::{self, TokenClient};

pub fn transfer_token(
    env: &Env,
    token_address: &Address,
    from: &Address,
    to: &Address,
    amount: i128,
) {
    // Require auth dari sender
    from.require_auth();
    
    let token_client = token::Client::new(env, token_address);
    token_client.transfer(from, to, &amount);
    
    env.events().publish(
        (symbol_short!("transfer"),),
        (from, to, amount),
    );
}
```

## 2.5 Soroban Test Framework

Soroban SDK punya test framework built-in. Ini kritis untuk development cepat.

```rust
#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_init_and_version() {
        let env = Env::default();
        let contract_id = env.register_contract(None, AlphineCore);
        let client = AlphineCoreClient::new(&env, &contract_id);
        
        client.init();
        
        let version = client.version();
        assert_eq!(version, 1u32);
    }
    
    #[test]
    fn test_token_transfer() {
        let env = Env::default();
        env.mock_all_auths();
        
        let user1 = Address::generate(&env);
        let user2 = Address::generate(&env);
        
        // Register token contract
        let token_id = env.register_stellar_asset_contract(user1.clone());
        let token = token::Client::new(&env, &token_id);
        
        // Mint some tokens
        token.mint(&user1.clone(), &1000i128);
        
        // Transfer
        token.transfer(&user1, &user2, &500i128);
        
        assert_eq!(token.balance(&user1), 500i128);
        assert_eq!(token.balance(&user2), 500i128);
    }
}
```

## 2.6 BN254 & Poseidon — ZK Primitives Exploration

Stellar Protocol 25/X-Ray memperkenalkan host functions untuk ZK. Mari kita test.

```rust
// contracts/zk_host_test/src/lib.rs
#![no_std]
use soroban_sdk::{contract, contractimpl, Env, BytesN};

#[contract]
pub struct ZkPrimitivesTest;

#[contractimpl]
impl ZkPrimitivesTest {
    /// Test BN254 pairing check host function
    pub fn test_pairing(env: Env, g1_point: BytesN<64>, g2_point: BytesN<128>) -> bool {
        env.crypto().pairing_check().check(&[g1_point, g2_point])
    }
    
    /// Test Poseidon hash
    pub fn test_poseidon(env: Env, input: BytesN<32>) -> BytesN<32> {
        env.crypto().poseidon_hash(&input)
    }
}
```

**Kenapa ini penting untuk Alphine:**
- **BN254**: Pairing-friendly curve yang dipakai Groth16 proofs. Verifikasi ZK proof butuh pairing check.
- **Poseidon**: Hash function yang ZK-friendly. Dipakai untuk Merkle tree sanctions list.

## 2.7 Error Handling Pattern

Alphine butuh error handling yang solid untuk compliance use case.

```rust
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum AlphineError {
    /// Proof verification failed
    InvalidProof = 1,
    /// Sender is on sanctions list
    SanctionedAddress = 2,
    /// Amount exceeds reporting threshold  
    AmountExceedsThreshold = 3,
    /// Structuring pattern detected
    StructuringDetected = 4,
    /// Transaction history unavailable
    HistoryUnavailable = 5,
    /// Insufficient balance
    InsufficientBalance = 6,
    /// Unauthorized caller
    Unauthorized = 7,
}
```

## 2.8 ✅ Phase 2 — Deliverables Check

| Item | Status |
|------|--------|
| Soroban `alphine_core` contract init + build | ☐ |
| Paham Storage pattern (persistent vs temporary) | ☐ |
| Paham Auth & require_auth() | ☐ |
| Stellar Asset Contract (SAC) USDC mock deployed | ☐ |
| Token transfer pattern dikuasai | ☐ |
| Test framework setup + first test pass | ☐ |
| BN254 & Poseidon host functions exploration | ☐ |
| Error handling enum untuk Alphine | ☐ |
| All tests pass: `cargo test` | ☐ |

---

# Phase 3 (20–30%): Noir Circuit Design + ZK Proof Pipeline

**Goal:** Design dan implementasi 3 ZK circuits di Noir untuk compliance verification. Setup proof generation pipeline dengan `bb.js`.

---

## 3.1 Noir Project Setup

```bash
cd ~/alphine/circuits

# Init Noir project
nargo new --contract alphine_compliance
cd alphine_compliance

# Struktur akhir:
# circuits/
#   alphine_compliance/
#     Nargo.toml
#     Prover.toml
#     Verifier.toml
#     src/
#       main.nr          # Entry point (main circuit)
#       sanctions.nr     # Sanctions check circuit
#       amount.nr        # Amount threshold circuit
#       structuring.nr   # Structuring detection circuit
#       merkle.nr        # Merkle tree utilities
```

## 3.2 Circuit 1 — Sanctions Check (Merkle Tree Non-Membership)

Ini adalah circuit paling kritis. User membuktikan address mereka **tidak ada** di dalam Merkle tree sanctioned addresses, tanpa mengungkap address mereka.

```rust
// circuits/alphine_compliance/src/sanctions.nr
// Sanctions Non-Membership Proof
//
// Public Inputs:
//   - merkle_root: Field (root of sanctions Merkle tree)
//   - nullifier: Field (unique identifier to prevent replay)
//
// Private Inputs:
//   - user_address: Field (actual address being checked)  
//   - merkle_proof: [Field; DEPTH] (proof path in tree)
//   - merkle_indices: [u1; DEPTH] (left/right indicators)

global SANCTIONS_TREE_DEPTH: u32 = 20;

struct SanctionsProof {
    merkle_root: Field,
    nullifier: Field,
    user_address: Field,
    merkle_proof: [Field; SANCTIONS_TREE_DEPTH],
    merkle_indices: [u1; SANCTIONS_TREE_DEPTH],
}

fn compute_merkle_root(
    leaf: Field,
    proof: [Field; SANCTIONS_TREE_DEPTH],
    indices: [u1; SANCTIONS_TREE_DEPTH],
) -> Field {
    let mut current = leaf;
    for i in 0..SANCTIONS_TREE_DEPTH {
        let sibling = proof[i];
        if indices[i] == 0 {
            // Left: current node is left child
            current = std::hash::poseidon2([current, sibling]);
        } else {
            // Right: current node is right child
            current = std::hash::poseidon2([sibling, current]);
        }
    }
    current
}

pub fn verify_not_sanctioned(
    merkle_root: Field,
    user_address: Field,
    merkle_proof: [Field; SANCTIONS_TREE_DEPTH],
    merkle_indices: [u1; SANCTIONS_TREE_DEPTH],
    nullifier: Field,
) {
    // 1. Compute nullifier to prevent replay attacks
    let computed_nullifier = std::hash::poseidon2([user_address, 1]);
    assert(computed_nullifier == nullifier, "Invalid nullifier");
    
    // 2. Compute root from proof
    let computed_root = compute_merkle_root(user_address, merkle_proof, merkle_indices);
    
    // 3. Assert computed root matches public root
    //    If the user's address IS in the tree, this assertion fails
    //    because the computed hash won't match.
    //    This is non-membership via "wrong path" — if the address exists,
    //    the computed path won't match the published root.
    assert(computed_root != merkle_root, "User is sanctioned!");
    
    // 4. Verify against an alternate root that confirms non-existence
    //    We use a separate nullifier tree entry as existence check
    assert(
        std::hash::poseidon2([user_address, 0]) != merkle_root,
        "Replay detected"
    );
}
```

**Cara kerja non-membership proof:**
- Merkle tree berisi hash dari semua sanctioned address
- User memiliki address `A` dan ingin buktikan `A` tidak ada di tree
- User hitung `root_user = compute_root(A, proof, indices)`
- Dia buktikan bahwa `root_user != root_publik`
- Karena satu-satunya cara `root_user == root_publik` adalah jika `A` ada di tree, maka `!=` membuktikan non-membership

## 3.3 Circuit 2 — Amount Threshold Check

User membuktikan jumlah transaksi di bawah threshold FINCEN ($10,000) tanpa reveal jumlah pastinya.

```rust
// circuits/alphine_compliance/src/amount.nr
// Amount Threshold Proof
//
// Public Inputs:
//   - threshold: Field (e.g., 10000 * 10^7 = 100000000000 for USDC with 7 decimals)
//
// Private Inputs:
//   - amount: Field (actual transaction amount)

pub fn verify_amount_below_threshold(
    amount: Field,
    threshold: Field,
) {
    // Constrain: amount <= threshold
    // Using range constraint to bound amount
    // In real circuit, we'd use bit decomposition
    assert(amount <= threshold, "Amount exceeds threshold");
    
    // Prove amount is positive
    assert(amount > 0, "Amount must be positive");
}
```

## 3.4 Circuit 3 — Structuring Detection

Structuring = memecah transaksi besar menjadi transaksi kecil untuk menghindari threshold reporting. Circuit ini membuktikan bahwa user **tidak** melakukan structuring dalam 90 hari terakhir.

```rust
// circuits/alphine_compliance/src/structuring.nr
// Structuring Detection Proof
//
// Checks that in the last N days, no more than a certain number of
// transactions fell just below the reporting threshold.
//
// Public Inputs:
//   - threshold: Field (reporting threshold, e.g. $10,000)
//   - max_suspicious: Field (max allowed suspicious transactions)
//   - time_window: Field (lookback window in days, e.g. 90)
//
// Private Inputs:
//   - historical_amounts: [Field; MAX_TX] (past transaction amounts)
//   - historical_timestamps: [Field; MAX_TX] (past transaction timestamps)
//   - num_tx: Field (actual number of transactions in history)

global MAX_TX_HISTORY: u32 = 100;
global SUSPICIOUS_RATIO: Field = 80; // 80% of threshold

pub fn verify_no_structuring(
    historical_amounts: [Field; MAX_TX_HISTORY],
    historical_timestamps: [Field; MAX_TX_HISTORY],
    num_tx: Field,
    threshold: Field,
    time_window: Field,
    current_timestamp: Field,
) {
    let suspicious_threshold = (threshold * SUSPICIOUS_RATIO) / 100;
    let mut suspicious_count: Field = 0;
    let lookback = current_timestamp - (time_window * 86400); // seconds in a day
    
    // Count suspicious transactions in time window  
    for i in 0..MAX_TX_HISTORY {
        // Only check actual transactions (not padding)
        if i < num_tx as usize {
            let in_window = historical_timestamps[i] >= lookback;
            let near_threshold = historical_amounts[i] > suspicious_threshold 
                && historical_amounts[i] < threshold;
            
            // If both conditions true, this is suspicious
            if in_window & near_threshold {
                suspicious_count += 1;
            }
        }
    }
    
    // Constrain suspicious count below max
    // Typically max_suspicious = 3 (FINRA pattern)
    assert(suspicious_count <= 3, "Structuring pattern detected");
    
    // Prove the total sum in suspicious transactions
    // doesn't exceed a separate cumulative threshold
    let mut suspicious_sum: Field = 0;
    for i in 0..MAX_TX_HISTORY {
        if i < num_tx as usize {
            let in_window = historical_timestamps[i] >= lookback;
            let near_threshold = historical_amounts[i] > suspicious_threshold;
            
            if in_window & near_threshold {
                suspicious_sum += historical_amounts[i];
            }
        }
    }
    
    // Cumulative structuring should also be below a limit
    assert(suspicious_sum <= threshold * 2, "Cumulative structuring detected");
}
```

## 3.5 Main Circuit — Combine All Proofs

```rust
// circuits/alphine_compliance/src/main.nr
mod sanctions;
mod amount;
mod structuring;

// Public circuit inputs
struct PublicInputs {
    // Sanctions check
    merkle_root: Field,
    nullifier: Field,
    
    // Amount check  
    threshold: Field,
    
    // Structuring check
    time_window: Field,
    current_timestamp: Field,
    
    // Transaction details
    to_address: Field,
    from_address: Field,
}

struct PrivateInputs {
    // Sanctions
    user_address: Field,
    merkle_proof: [Field; 20],
    merkle_indices: [u1; 20],
    
    // Amount
    amount: Field,
    
    // Structuring
    historical_amounts: [Field; 100],
    historical_timestamps: [Field; 100],
    num_tx: Field,
}

fn main(
    pub_merkle_root: Field,
    pub_nullifier: Field,
    pub_threshold: Field,
    pub_time_window: Field,
    pub_current_timestamp: Field,
    pub_to_address: Field,
    
    priv_user_address: Field,
    priv_merkle_proof: [Field; 20],
    priv_merkle_indices: [u1; 20],
    priv_amount: Field,
    priv_historical_amounts: [Field; 100],
    priv_historical_timestamps: [Field; 100],
    priv_num_tx: Field,
) {
    // 1. Verify sender is not sanctioned
    sanctions::verify_not_sanctioned(
        pub_merkle_root,
        priv_user_address,
        priv_merkle_proof,
        priv_merkle_indices,
        pub_nullifier,
    );
    
    // 2. Verify amount below threshold
    amount::verify_amount_below_threshold(
        priv_amount,
        pub_threshold,
    );
    
    // 3. Verify no structuring
    structuring::verify_no_structuring(
        priv_historical_amounts,
        priv_historical_timestamps,
        priv_num_tx,
        pub_threshold,
        pub_time_window,
        pub_current_timestamp,
    );
}
```

## 3.6 Compile Circuit & Generate Proof

```bash
# Compile Noir circuit
cd ~/alphine/circuits/alphine_compliance
nargo compile

# Ini menghasilkan:
# - target/alphine_compliance.json (circuit definition)
# - target/alphine_compliance.code (prover code)

# Generate Solidity verifier (untuk referensi)
nargo codegen-verifier

# Setup BB (Barretenberg) untuk proof generation
# Install bb.js
pnpm add @noir-lang/backend_barretenberg
pnpm add @noir-lang/noir_wasm
pnpm add @noir-lang/acvm_js
```

## 3.7 Proof Generation in Node.js

```javascript
// backend/prover/prove_compliance.mjs
import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';
import circuit from '../../circuits/alphine_compliance/target/alphine_compliance.json' assert { type: 'json' };

async function generateComplianceProof(inputs) {
    const backend = new BarretenbergBackend(circuit);
    const noir = new Noir(circuit, backend);
    
    // Format inputs
    const proofInputs = {
        pub_merkle_root: inputs.merkleRoot,
        pub_nullifier: inputs.nullifier,
        pub_threshold: inputs.threshold,
        pub_time_window: inputs.timeWindow,
        pub_current_timestamp: inputs.currentTimestamp,
        pub_to_address: inputs.toAddress,
        
        priv_user_address: inputs.userAddress,
        priv_merkle_proof: inputs.merkleProof,
        priv_merkle_indices: inputs.merkleIndices,
        priv_amount: inputs.amount,
        priv_historical_amounts: inputs.historicalAmounts,
        priv_historical_timestamps: inputs.historicalTimestamps,
        priv_num_tx: inputs.numTransactions,
    };
    
    // Generate proof
    const { proof, publicOutputs } = await noir.generateFinalProof(proofInputs);
    
    return { proof, publicOutputs };
}

// Test
async function main() {
    const result = await generateComplianceProof({
        merkleRoot: "0x1234...",
        nullifier: "0xabcd...",
        threshold: "10000000000", // $10,000 with 7 decimals
        timeWindow: "90",
        currentTimestamp: Math.floor(Date.now() / 1000).toString(),
        toAddress: "0x...",
        userAddress: "0x...",
        merkleProof: [...],
        merkleIndices: [...],
        amount: "5000000000", // $5,000
        historicalAmounts: [...],
        historicalTimestamps: [...],
        numTransactions: "10",
    });
    
    console.log("Proof:", result.proof);
    console.log("Public outputs:", result.publicOutputs);
}
```

## 3.8 ✅ Phase 3 — Deliverables Check

| Item | Status |
|------|--------|
| `nargo new` project setup | ☐ |
| Sanctions non-membership circuit (Merkle tree) | ☐ |
| Amount threshold circuit | ☐ |
| Structuring detection circuit | ☐ |
| Main circuit combining all 3 | ☐ |
| `nargo compile` succeeds | ☐ |
| BB.js installed + proof generation script | ☐ |
| Proof generation test pass | ☐ |

---

# Phase 4 (30–40%): Circom Groth16 on Stellar + Verifier Contract

**Goal:** Bridge Noir → SNARK proof → Soroban verifier menggunakan Groth16 over BN254. Deploy verifier contract di Stellar testnet.

---

## 4.1 Kenapa Groth16 + BN254?

| Komponen | Pilihan | Alasan |
|----------|---------|--------|
| Proving System | **Groth16** | Ukuran proof terkecil (~200 bytes), verifikasi constant-time, cocok untuk blockchain |
| Curve | **BN254** | Didukung native oleh Stellar host functions (Protocol 25) |
| Backend | **Barretenberg** | BB support Groth16 + BN254 out of the box |

**Workflow:**
```
Noir Circuit → ACIR → BB (Groth16) → Proof + Verification Key
                                                      ↓
                                           circom2soroban → Rust Verifier Bytecode
                                                      ↓
                                           Deploy ke Soroban → Verify Proof On-Chain
```

## 4.2 Setup circom2soroban Bridge Tool

```bash
cd ~/alphine

# Clone or build circom2soroban converter
git clone https://github.com/NethermindEth/soroban-verifier-tools
# Atau gunakan stellar/soroban-examples groth16_verifier
git clone https://github.com/stellar/soroban-examples
cd soroban-examples
cargo build -p groth16_verifier
```

## 4.3 Generate BB (Barretenberg) Artifacts

```bash
cd ~/alphine/circuits/alphine_compliance

# Export verification key in format compatible with Soroban
# BB output → convert → Soroban-compatible byte arrays

# Using bb binary (install separately)
# bb contract -k target/verification_key -o target/verifier.sol
```

## 4.4 Soroban Groth16 Verifier Contract

```rust
// contracts/groth16_verifier/src/lib.rs
// Groth16 verifier using Stellar's native BN254 host functions
#![no_std]
use soroban_sdk::{contract, contractimpl, Env, BytesN, Bytes};

#[contract]
pub struct Groth16Verifier;

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct VerifyingKey {
    pub alpha_g1: BytesN<64>,
    pub beta_g2: BytesN<128>,
    pub gamma_g2: BytesN<128>,
    pub delta_g2: BytesN<128>,
    pub gamma_abc_g1: Vec<BytesN<64>>,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Proof {
    pub a: BytesN<64>,     // G1 point
    pub b: BytesN<128>,    // G2 point
    pub c: BytesN<64>,     // G1 point
}

#[contractimpl]
impl Groth16Verifier {
    /// Verify a Groth16 proof
    /// 
    /// Implements the pairing check equation:
    /// e(A, B) = e(α, β) * e(∑(γ_abc_i * public_i), γ) * e(C, δ)
    pub fn verify(
        env: Env,
        vk: VerifyingKey,
        proof: Proof,
        public_inputs: Vec<BytesN<32>>, // serialized field elements
    ) -> bool {
        // Compute the linear combination of γ_abc * public_inputs
        let mut gamma_abc_combined = vk.gamma_abc_g1.get(0).unwrap();
        
        for i in 0..public_inputs.len() {
            let input = public_inputs.get(i).unwrap();
            let g1_point = vk.gamma_abc_g1.get(i + 1).unwrap();
            
            // scalar_mult: input * g1_point
            let scaled = env.crypto().bn254().g1_scalar_mul(&g1_point, &input);
            
            // g1_add: gamma_abc_combined + scaled
            gamma_abc_combined = env.crypto().bn254().g1_add(&gamma_abc_combined, &scaled);
        }
        
        // Pairing check: e(proof.a, proof.b) == e(vk.alpha, vk.beta) * e(gamma_abc_combined, vk.gamma) * e(proof.c, vk.delta)
        env.crypto().pairing_check().check(&[
            proof.a,          // G1 point
            proof.b,          // G2 point
            vk.alpha_g1,      // G1 point
            vk.beta_g2,       // G2 point
            gamma_abc_combined, // G1 point
            vk.gamma_g2,     // G2 point
            proof.c,          // G1 point
            vk.delta_g2,     // G2 point
        ])
    }
}
```

## 4.5 Deploy Verifier Contract

```bash
cd ~/alphine/contracts/groth16_verifier

# Build WASM
soroban contract build

# Deploy ke testnet
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/groth16_verifier.wasm \
  --network testnet \
  --source alice

# Save contract ID
echo "GROTH16_VERIFIER_ID=<contract_id>" >> ~/alphine/.env
```

## 4.6 Integration: Noir Proof → Soroban Verification

```javascript
// backend/verifier/submit_proof.mjs
import { SorobanClient } from 'soroban-client';
import { nativeToScVal, scValToNative } from 'soroban-client';

async function submitProofForVerification(proof, publicInputs) {
    const server = new SorobanClient.Server(
        process.env.SOROBAN_RPC_URL, 
        { allowHttp: true }
    );
    
    const sourceKeys = SorobanClient.Keypair.fromSecret(
        process.env.USER_SECRET_KEY
    );
    
    const contract = new SorobanClient.Contract(
        process.env.GROTH16_VERIFIER_ID
    );
    
    // Convert proof to Soroban format
    const proofScVal = {
        a: SorobanClient.xdr.ScVal.scvBytes(Buffer.from(proof.a, 'hex')),
        b: SorobanClient.xdr.ScVal.scvBytes(Buffer.from(proof.b, 'hex')),
        c: SorobanClient.xdr.ScVal.scvBytes(Buffer.from(proof.c, 'hex')),
    };
    
    // Submit transaction
    const tx = await server.prepareTransaction(
        contract.call('verify', proofScVal, ...publicInputs),
        sourceKeys.publicKey()
    );
    
    const signedTx = tx.sign(sourceKeys);
    const response = await server.sendTransaction(signedTx);
    
    return response;
}
```

## 4.7 Optimize for Gas/Resource Costs

Soroban memiliki resource limits (CPU instructions, memory). Optimasi kritis:

```rust
// Best practices untuk resource optimization:
// 1. Batch pairing check — Stellar host function pairing_check menerima array
//    Ini lebih efisien daripada multiple pairing check calls
//
// 2. Pre-compute verification key — Simpan VK di contract storage, 
//    jangan pass sebagai parameter setiap kali
//
// 3. Use BytesN instead of Bytes — Fixed-size arrays lebih murah

// Simpan VK di storage saat init
pub fn init(env: Env, vk: VerifyingKey) {
    env.storage().persistent().set(&DataKey::Vk, &vk);
}

// Verify menggunakan stored VK (lebih murah)
pub fn verify(env: Env, proof: Proof, public_inputs: Vec<BytesN<32>>) -> bool {
    let vk = env.storage().persistent()
        .get::<_, VerifyingKey>(&DataKey::Vk)
        .unwrap();
    Self::verify_internal(env, vk, proof, public_inputs)
}
```

## 4.8 Test Verifier with Local Soroban

```rust
#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_verifier_deploy() {
        let env = Env::default();
        let contract_id = env.register_contract(None, Groth16Verifier);
        let client = Groth16VerifierClient::new(&env, &contract_id);
        
        // Init with a test verification key
        let mock_vk = VerifyingKey {
            alpha_g1: BytesN::from_array(&env, &[0u8; 64]),
            beta_g2: BytesN::from_array(&env, &[0u8; 128]),
            gamma_g2: BytesN::from_array(&env, &[0u8; 128]),
            delta_g2: BytesN::from_array(&env, &[0u8; 128]),
            gamma_abc_g1: vec![&env, BytesN::from_array(&env, &[0u8; 64])],
        };
        
        client.init(&mock_vk);
        
        // Verify (will fail with invalid proof — expected)
        let mock_proof = Proof {
            a: BytesN::from_array(&env, &[0u8; 64]),
            b: BytesN::from_array(&env, &[0u8; 128]),
            c: BytesN::from_array(&env, &[0u8; 64]),
        };
        
        let result = client.verify(&mock_proof, &vec![&env]);
        assert!(!result);
    }
}
```

## 4.9 ✅ Phase 4 — Deliverables Check

| Item | Status |
|------|--------|
| circom2soroban tool setup | ☐ |
| BB artifacts generated (VK, proof format) | ☐ |
| Groth16 Verifier contract (BN254 pairing) | ☐ |
| Contract compiles to WASM | ☐ |
| Verifier deployed to testnet | ☐ |
| Integration script: Noir proof → Soroban verification | ☐ |
| Gas/resource optimization done | ☐ |
| Verifier tests pass | ☐ |

---

# Phase 5 (40–50%): Groq AI Integration + AML Pattern Detection

**Goal:** Integrasi Groq AI untuk menganalisis transaction pattern user, mendeteksi red flag AML, dan menghasilkan compliance report yang masuk ke ZK circuit.

---

## 5.1 Groq API Setup

```bash
# Daftar di https://console.groq.com
# Generate API key
export GROQ_API_KEY="gsk_..."

# Install Groq SDK
cd ~/alphine/backend
pnpm add groq-sdk
pnpm add ai @ai-sdk/groq
```

## 5.2 AML Transaction Analyzer — Core Logic

```javascript
// backend/aml/analyzer.mjs
import Groq from 'groq-sdk';

class AMLTransactionAnalyzer {
    constructor(apiKey) {
        this.groq = new Groq({ apiKey });
        this.model = 'llama-3.3-70b-versatile'; // Fastest model for low-latency
    }
    
    /**
     * Analyze a single transaction for AML red flags
     * Returns: Structured compliance assessment
     */
    async analyzeTransaction(transaction, userHistory) {
        const prompt = this.buildAnalysisPrompt(transaction, userHistory);
        
        const completion = await this.groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are an AML (Anti-Money Laundering) compliance officer AI.
Your job is to analyze cryptocurrency transactions for suspicious patterns.
Respond ONLY with valid JSON. No markdown, no explanation.

Output format:
{
  "risk_score": <0-100>,
  "red_flags": [<string>],
  "structuring_detected": <boolean>,
  "structuring_details": {
    "suspicious_tx_count": <number>,
    "time_window_days": <number>,
    "total_amount_near_threshold": <number>
  },
  "velocity_alerts": [<string>],
  "country_risk": <string>,
  "recommendation": "approve" | "review" | "block",
  "circuit_inputs": {
    "threshold": <number>,
    "time_window": <number>,
    "num_suspicious_tx": <number>,
    "current_timestamp": <number>
  }
}`
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: this.model,
            temperature: 0.1,  // Low temp for consistency
            response_format: { type: 'json_object' },
        });
        
        return JSON.parse(completion.choices[0].message.content);
    }
    
    buildAnalysisPrompt(transaction, userHistory) {
        return `Analyze this Stellar USDC transaction for AML compliance:

## Current Transaction
- From: ${transaction.from}
- To: ${transaction.to}
- Amount: ${transaction.amount} USDC
- Timestamp: ${transaction.timestamp}
- Asset: USDC (Stellar)

## User Transaction History (Last 90 days)
${JSON.stringify(userHistory, null, 2)}

## Compliance Rules to Apply
1. Structuring Detection: Are there multiple transactions just under $10,000?
2. Velocity Check: Are there rapid successive transactions?
3. Pattern Analysis: Does this deviate from user's normal behavior?
4. Threshold Check: Is amount ≥ $10,000 (FINRA reporting threshold)?

Return JSON only.`;
    }
    
    /**
     * Batch analyze transactions for structuring patterns
     */
    async detectStructuring(transactions, threshold = 10000) {
        const prompt = {
            transactions: transactions.map(tx => ({
                amount: parseFloat(tx.amount),
                timestamp: tx.timestamp,
                days_apart: tx.daysApart,
            })),
            threshold,
            suspicious_ratio: 0.8, // 80% of threshold = suspicious
            time_window_days: 90,
        };
        
        const completion = await this.groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `Analyze this transaction pattern for structuring.
Structuring = breaking large transactions into smaller ones to avoid reporting thresholds.
Output JSON: { "structuring_detected": bool, "confidence": 0-100, "suspicious_clusters": [...], "recommendation": "string" }`
                },
                {
                    role: 'user',
                    content: JSON.stringify(prompt)
                }
            ],
            model: this.model,
            response_format: { type: 'json_object' },
        });
        
        return JSON.parse(completion.choices[0].message.content);
    }
}

export { AMLTransactionAnalyzer };
```

## 5.3 Compliance Report Generator

```javascript
// backend/aml/compliance_report.mjs
// Report yang bridging AI → ZK circuit

class ComplianceReportGenerator {
    constructor(amlAnalyzer) {
        this.amlAnalyzer = amlAnalyzer;
    }
    
    async generateReport(transaction, userHistory) {
        // Step 1: AI analyzes transaction
        const analysis = await this.amlAnalyzer.analyzeTransaction(
            transaction, 
            userHistory
        );
        
        // Step 2: If structuring detected, do deep analysis
        let structuringDetails = null;
        if (analysis.structuring_detected || analysis.risk_score > 50) {
            structuringDetails = await this.amlAnalyzer.detectStructuring(
                userHistory
            );
        }
        
        // Step 3: Map AI analysis to circuit inputs
        return {
            // For ZK Circuit (public inputs)
            circuitInputs: {
                threshold: this.toCircuitField(analysis.circuit_inputs.threshold),
                timeWindow: this.toCircuitField(analysis.circuit_inputs.time_window),
                currentTimestamp: this.toCircuitField(
                    Math.floor(Date.now() / 1000)
                ),
                numSuspiciousTx: this.toCircuitField(
                    analysis.circuit_inputs.num_suspicious_tx
                ),
            },
            
            // For compliance display
            compliance: {
                riskScore: analysis.risk_score,
                redFlags: analysis.red_flags,
                recommendation: analysis.recommendation,
                needsManualReview: analysis.recommendation !== 'approve',
            },
            
            // Audit trail (stored off-chain)
            auditLog: {
                timestamp: new Date().toISOString(),
                aiModel: this.amlAnalyzer.model,
                analysisId: crypto.randomUUID(),
            }
        };
    }
    
    toCircuitField(value) {
        // Convert to Noir/Barratenberg field format
        return BigInt(value).toString();
    }
}
```

## 5.4 Groq Service — Express API

```javascript
// backend/api/analyze.mjs
import express from 'express';
import { AMLTransactionAnalyzer } from '../aml/analyzer.mjs';
import { ComplianceReportGenerator } from '../aml/compliance_report.mjs';
import { TavilySanctionsFetcher } from '../sanctions/fetcher.mjs';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const amlAnalyzer = new AMLTransactionAnalyzer(process.env.GROQ_API_KEY);
const reportGenerator = new ComplianceReportGenerator(amlAnalyzer);
const sanctionsFetcher = new TavilySanctionsFetcher(process.env.TAVILY_API_KEY);

router.post('/analyze-transaction', async (req, res) => {
    try {
        const { transaction, userHistory } = req.body;
        
        // 1. Fetch latest sanctions list
        const sanctions = await sanctionsFetcher.fetchLatestSanctions();
        
        // 2. Build Merkle tree from sanctions
        const merkleTree = buildMerkleTree(sanctions);
        
        // 3. AI compliance analysis
        const report = await reportGenerator.generateReport(transaction, userHistory);
        
        // 4. Check if sender is sanctioned
        const isSanctioned = merkleTree.contains(transaction.from);
        
        res.json({
            sanctioned: isSanctioned,
            merkleRoot: merkleTree.getRoot(),
            complianceReport: report,
            canProceed: !isSanctioned && report.compliance.recommendation === 'approve',
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export { router as analyzeRouter };
```

## 5.5 Groq Rate Limit Management

Groq free tier: 14,400 req/hari (~10 req/menit). Kita perlu smart caching.

```javascript
// backend/aml/cache_manager.mjs
class GroqCacheManager {
    constructor() {
        this.cache = new Map();
        this.ttl = 5 * 60 * 1000; // 5 minutes
    }
    
    getCacheKey(userAddress, historyHash) {
        return `${userAddress}:${historyHash}`;
    }
    
    get(address, historyHash) {
        const key = this.getCacheKey(address, historyHash);
        const entry = this.cache.get(key);
        
        if (!entry) return null;
        if (Date.now() - entry.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }
        
        return entry.data;
    }
    
    set(address, historyHash, data) {
        const key = this.getCacheKey(address, historyHash);
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
        });
    }
}
```

## 5.6 ✅ Phase 5 — Deliverables Check

| Item | Status |
|------|--------|
| Groq API key obtained + SDK installed | ☐ |
| AML Transaction Analyzer (LLM prompt + JSON parsing) | ☐ |
| Structuring detection with AI | ☐ |
| Compliance report generator (AI → circuit inputs) | ☐ |
| Express API endpoint for transaction analysis | ☐ |
| Sanctions check integration (pre-AI filter) | ☐ |
| Rate limit caching | ☐ |
| API test with real Groq call | ☐ |

---

# Phase 6 (50–60%): Tavily Integration + Real-time Sanctions Oracle

**Goal:** Integrasi Tavily API untuk real-time fetch OFAC sanctions list, UN sanctions list, dan regulatory news. Build Merkle tree dari data sanctions dan expose via API.

---

## 6.1 Tavily API Setup

```bash
# Daftar di https://app.tavily.com
# Generate API key
export TAVILY_API_KEY="tvly-..."

# Install SDK
cd ~/alphine/backend
pnpm add @tavily/core
```

## 6.2 Sanctions Data Fetcher

```javascript
// backend/sanctions/fetcher.mjs
import { tavily } from '@tavily/core';

class TavilySanctionsFetcher {
    constructor(apiKey) {
        this.client = tavily({ apiKey });
    }
    
    /**
     * Fetch latest sanctions data from multiple sources
     */
    async fetchLatestSanctions() {
        const results = await Promise.all([
            this.fetchOFACSanctions(),
            this.fetchUNSanctions(),
            this.fetchSanctionsNews(),
        ]);
        
        return {
            ofac: results[0],
            un: results[1],
            news: results[2],
            fetchedAt: new Date().toISOString(),
        };
    }
    
    async fetchOFACSanctions() {
        // Search for latest OFAC SDN list
        const response = await this.client.search(
            'OFAC SDN sanctions list current addresses cryptocurrency wallets 2026',
            {
                searchDepth: 'advanced',
                maxResults: 10,
                includeAnswer: true,
                includeRawContent: true,
            }
        );
        
        // Also directly fetch from OFAC SLS
        const ofacData = await this.tryFetchOFACDirect();
        
        return {
            source: 'OFAC',
            url: 'https://sanctionslist.ofac.treas.gov/',
            entries: this.parseSanctionsEntries(response, ofacData),
            raw: response,
            lastUpdated: new Date().toISOString(),
        };
    }
    
    async fetchUNSanctions() {
        const response = await this.client.search(
            'United Nations security council sanctions list consolidated',
            {
                searchDepth: 'basic',
                maxResults: 5,
                includeAnswer: true,
            }
        );
        
        return {
            source: 'UN',
            entries: this.parseSanctionsEntries(response),
            lastUpdated: new Date().toISOString(),
        };
    }
    
    async fetchSanctionsNews() {
        // Get latest regulatory updates
        const response = await this.client.search(
            'cryptocurrency sanctions regulatory update OFAC June 2026',
            {
                searchDepth: 'advanced',
                maxResults: 5,
                includeAnswer: true,
                includeRawContent: true,
            }
        );
        
        return {
            source: 'News',
            articles: response.results?.map(r => ({
                title: r.title,
                url: r.url,
                content: r.content,
                publishedDate: r.publishedDate,
            })) || [],
        };
    }
    
    async tryFetchOFACDirect() {
        try {
            // Try direct download from OFAC
            const response = await fetch(
                'https://sanctionslist.ofac.treas.gov/sdn.xml'
            );
            const xml = await response.text();
            return this.parseOFACXml(xml);
        } catch (e) {
            console.warn('OFAC direct download failed, using Tavily search:', e.message);
            return [];
        }
    }
    
    parseSanctionsEntries(...sources) {
        // Extract wallet addresses, entity names, and other identifiers
        const entries = new Set();
        
        for (const source of sources) {
            if (!source) continue;
            
            // Parse from search results
            if (source.results) {
                for (const result of source.results) {
                    // Extract crypto addresses using regex
                    const addresses = result.content?.match(
                        /0x[a-fA-F0-9]{40}|G[A-Z0-9]{55}/g
                    ) || [];
                    
                    for (const addr of addresses) {
                        entries.add(addr.toLowerCase());
                    }
                }
            }
            
            // Parse from OFAC XML
            if (Array.isArray(source)) {
                for (const entry of source) {
                    entries.add(entry.toLowerCase());
                }
            }
        }
        
        return Array.from(entries);
    }
    
    parseOFACXml(xml) {
        // Simple XML parser for OFAC SDN list
        const addresses = [];
        const addrRegex = /0x[a-fA-F0-9]{40}|G[A-Z0-9]{55}/g;
        const matches = xml.match(addrRegex) || [];
        
        return matches.map(m => m.toLowerCase());
    }
}
```

## 6.3 Merkle Tree Builder

```javascript
// backend/sanctions/merkle_tree.mjs
import { createHash } from 'crypto';

class PoseidonMerkleTree {
    constructor(depth = 20) {
        this.depth = depth;
        this.leaves = new Map(); // address -> leaf hash
        this.tree = []; // levels
        this.root = null;
        this.defaultZero = this.hash(Buffer.alloc(32));
    }
    
    hash(data) {
        // Simulate Poseidon hash using keccak256 for development
        // Will be replaced with actual Poseidon for production
        return createHash('sha256').update(data).digest();
    }
    
    addAddress(address) {
        const leaf = this.hash(Buffer.from(address.toLowerCase(), 'utf-8'));
        this.leaves.set(address.toLowerCase(), leaf);
        this.rebuild();
    }
    
    addAddresses(addresses) {
        for (const addr of addresses) {
            this.addAddress(addr);
        }
    }
    
    rebuild() {
        const leaves = Array.from(this.leaves.values());
        const leafCount = leaves.length;
        
        // Pad to power of 2
        const size = Math.pow(2, Math.ceil(Math.log2(leafCount || 1)));
        let currentLevel = new Array(size).fill(this.defaultZero);
        
        for (let i = 0; i < leafCount; i++) {
            currentLevel[i] = leaves[i];
        }
        
        this.tree = [currentLevel];
        
        // Build tree bottom-up
        while (currentLevel.length > 1) {
            const nextLevel = [];
            for (let i = 0; i < currentLevel.length; i += 2) {
                const left = currentLevel[i];
                const right = currentLevel[i + 1] || left;
                const combined = Buffer.concat([left, right]);
                nextLevel.push(this.hash(combined));
            }
            this.tree.push(nextLevel);
            currentLevel = nextLevel;
        }
        
        this.root = this.tree[this.tree.length - 1][0];
    }
    
    getProof(address) {
        const leaf = this.leaves.get(address.toLowerCase());
        if (!leaf) return null;
        
        const proof = [];
        const indices = [];
        let index = Array.from(this.leaves.values()).indexOf(leaf);
        
        for (let level = 0; level < this.tree.length - 1; level++) {
            const siblingIndex = index % 2 === 0 ? index + 1 : index - 1;
            const sibling = this.tree[level][siblingIndex] || this.defaultZero;
            
            proof.push(sibling);
            indices.push(index % 2 === 0 ? 0 : 1);
            
            index = Math.floor(index / 2);
        }
        
        return { proof, indices, root: this.root };
    }
    
    contains(address) {
        return this.leaves.has(address.toLowerCase());
    }
    
    getRoot() {
        return this.root?.toString('hex') || null;
    }
}

export { PoseidonMerkleTree };
```

## 6.4 Sanctions API Service

```javascript
// backend/api/sanctions.mjs
import express from 'express';
import { TavilySanctionsFetcher } from '../sanctions/fetcher.mjs';
import { PoseidonMerkleTree } from '../sanctions/merkle_tree.mjs';

const router = express.Router();

let currentTree = new PoseidonMerkleTree();
let lastUpdate = null;
const UPDATE_INTERVAL = 30 * 60 * 1000; // 30 minutes

async function ensureSanctionsUpdated(fetcher) {
    if (!lastUpdate || Date.now() - lastUpdate > UPDATE_INTERVAL) {
        const data = await fetcher.fetchLatestSanctions();
        const allAddresses = [
            ...(data.ofac?.entries || []),
            ...(data.un?.entries || []),
        ];
        
        currentTree = new PoseidonMerkleTree();
        currentTree.addAddresses(allAddresses);
        lastUpdate = Date.now();
        
        console.log(`Sanctions tree updated: ${allAddresses.length} entries`);
    }
}

router.get('/sanctions/root', async (req, res) => {
    const fetcher = new TavilySanctionsFetcher(process.env.TAVILY_API_KEY);
    await ensureSanctionsUpdated(fetcher);
    
    res.json({
        merkleRoot: currentTree.getRoot(),
        lastUpdated: lastUpdate,
        entriesCount: currentTree.leaves.size,
    });
});

router.post('/sanctions/check', async (req, res) => {
    const fetcher = new TavilySanctionsFetcher(process.env.TAVILY_API_KEY);
    await ensureSanctionsUpdated(fetcher);
    
    const { address } = req.body;
    const proof = currentTree.getProof(address);
    
    res.json({
        isSanctioned: currentTree.contains(address),
        merkleRoot: currentTree.getRoot(),
        proof: proof ? {
            proof: proof.proof.map(p => p.toString('hex')),
            indices: proof.indices,
        } : null,
        lastUpdated: lastUpdate,
    });
});

router.post('/sanctions/proof', async (req, res) => {
    const { address } = req.body;
    const proof = currentTree.getProof(address);
    
    if (!proof) {
        // Address not in tree — return proof of non-membership
        // by providing an alternate valid proof path
        return res.json({
            isSanctioned: false,
            noProof: true,
            merkleRoot: currentTree.getRoot(),
            message: 'Address not found in sanctions list',
        });
    }
    
    res.json({
        isSanctioned: true,
        merkleRoot: currentTree.getRoot(),
        proof: {
            proof: proof.proof.map(p => p.toString('hex')),
            indices: proof.indices,
        },
    });
});

export { router as sanctionsRouter, currentTree, ensureSanctionsUpdated };
```

## 6.5 Scheduled Sanctions Update (Cron Job)

```javascript
// backend/sanctions/update_scheduler.mjs
import { TavilySanctionsFetcher } from './fetcher.mjs';
import { ensureSanctionsUpdated } from '../api/sanctions.mjs';

class SanctionsUpdateScheduler {
    constructor(apiKey, intervalMinutes = 30) {
        this.fetcher = new TavilySanctionsFetcher(apiKey);
        this.interval = intervalMinutes * 60 * 1000;
        this.timer = null;
    }
    
    start() {
        console.log(`Sanctions update scheduler started (every ${this.interval / 60000} min)`);
        this.update();
        this.timer = setInterval(() => this.update(), this.interval);
    }
    
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    async update() {
        try {
            await ensureSanctionsUpdated(this.fetcher);
            console.log(`[${new Date().toISOString()}] Sanctions list updated`);
        } catch (error) {
            console.error('Sanctions update failed:', error.message);
        }
    }
}

export { SanctionsUpdateScheduler };
```

## 6.6 Backend Main Server

```javascript
// backend/index.mjs
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { analyzeRouter } from './api/analyze.mjs';
import { sanctionsRouter } from './api/sanctions.mjs';
import { SanctionsUpdateScheduler } from './sanctions/update_scheduler.mjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', analyzeRouter);
app.use('/api', sanctionsRouter);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        tavily: !!process.env.TAVILY_API_KEY,
        groq: !!process.env.GROQ_API_KEY,
    });
});

// Start scheduler
const scheduler = new SanctionsUpdateScheduler(process.env.TAVILY_API_KEY);
scheduler.start();

app.listen(PORT, () => {
    console.log(`Alphine backend running on http://localhost:${PORT}`);
});
```

## 6.7 ✅ Phase 6 — Deliverables Check

| Item | Status |
|------|--------|
| Tavily API key obtained + SDK installed | ☐ |
| OFAC sanctions fetcher | ☐ |
| UN sanctions fetcher | ☐ |
| Sanctions news fetcher | ☐ |
| Poseidon Merkle tree implementation | ☐ |
| Sanctions check + proof API endpoints | ☐ |
| Scheduled auto-update (30 min) | ☐ |
| Backend server running with all routes | ☐ |

---

# Phase 7 (60–70%): Soroban Payment Contract + End-to-End Logic

**Goal:** Smart contract utama yang mengintegrasikan verifier + token transfer. Contract ini jadi otak dari Alphine — nerima proof, verify, dan execute payment.

---

## 7.1 Alphine Payment Contract

```rust
// contracts/alphine_payment/src/lib.rs
//! Alphine Payment Contract
//!
//! This contract handles the end-to-end flow:
//! 1. Receive ZK proof + compliance report
//! 2. Verify proof via Groth16 verifier
//! 3. If valid → execute USDC transfer
//! 4. If invalid → emit failure event for manual review

#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracterror, contracttype,
    token, Address, BytesN, Bytes, Env, String, Vec,
    symbol_short, Symbol,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum PaymentError {
    InvalidProof = 1,
    AlreadyProcessed = 2,
    InsufficientBalance = 3,
    Unauthorized = 4,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ComplianceProof {
    // Groth16 proof
    pub proof_a: BytesN<64>,
    pub proof_b: BytesN<128>,
    pub proof_c: BytesN<64>,
    
    // Public inputs
    pub merkle_root: BytesN<32>,
    pub nullifier: BytesN<32>,
    pub threshold: i128,
    pub time_window: u64,
    pub current_timestamp: u64,
    pub to_address: BytesN<32>,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PaymentInit {
    pub from: Address,
    pub to: Address,
    pub token: Address,
    pub amount: i128,
    pub compliance_proof: ComplianceProof,
}

#[contract]
pub struct AlphinePayment;

#[contractimpl]
impl AlphinePayment {
    /// Initialize contract with verifier address
    pub fn init(env: Env, verifier: Address, owner: Address) {
        env.storage().persistent().set(&DataKey::Verifier, &verifier);
        env.storage().persistent().set(&DataKey::Owner, &owner);
        
        env.events().publish(
            (symbol_short!("init"),),
            (verifier, owner),
        );
    }
    
    /// Process a payment with ZK compliance proof
    pub fn process_payment(
        env: Env,
        payment: PaymentInit,
    ) -> Result<i128, PaymentError> {
        // 1. Authenticate sender
        payment.from.require_auth();
        
        // 2. Check nullifier — prevent replay attacks
        let nullifier_key = DataKey::Nullifier(payment.compliance_proof.nullifier.clone());
        if env.storage().persistent().has(&nullifier_key) {
            return Err(PaymentError::AlreadyProcessed);
        }
        
        // 3. Verify ZK proof via Groth16 verifier
        let verifier: Address = env.storage().persistent()
            .get(&DataKey::Verifier).unwrap();
        let verifier_client = crate::groth16_verifier::Client::new(&env, &verifier);
        
        // Prepare proof inputs for verifier
        let public_inputs = vec![
            &env,
            payment.compliance_proof.merkle_root,
            payment.compliance_proof.nullifier,
            BytesN::from_array(&env, &payment.compliance_proof.threshold.to_be_bytes()),
            BytesN::from_array(&env, &payment.compliance_proof.time_window.to_be_bytes()),
            BytesN::from_array(&env, &payment.compliance_proof.current_timestamp.to_be_bytes()),
            payment.compliance_proof.to_address,
        ];
        
        let proof = crate::groth16_verifier::Proof {
            a: payment.compliance_proof.proof_a,
            b: payment.compliance_proof.proof_b,
            c: payment.compliance_proof.proof_c,
        };
        
        let is_valid = verifier_client.verify(&proof, public_inputs);
        
        if !is_valid {
            // Emit failure event for manual review
            env.events().publish(
                (symbol_short!("fail"), symbol_short!("proof")),
                (payment.from.clone(), payment.amount),
            );
            return Err(PaymentError::InvalidProof);
        }
        
        // 4. Mark nullifier as used (prevent replay)
        env.storage().persistent().set(&nullifier_key, &true);
        
        // 5. Check balance
        let token_client = token::Client::new(&env, &payment.token);
        let balance = token_client.balance(&payment.from);
        if balance < payment.amount {
            return Err(PaymentError::InsufficientBalance);
        }
        
        // 6. Execute transfer
        token_client.transfer(&payment.from, &payment.to, &payment.amount);
        
        // 7. Emit success event
        env.events().publish(
            (symbol_short!("paid"), symbol_short!("compliant")),
            (payment.from, payment.to, payment.amount),
        );
        
        Ok(payment.amount)
    }
    
    /// Check if a nullifier has been used (for frontend)
    pub fn is_nullifier_used(env: Env, nullifier: BytesN<32>) -> bool {
        env.storage().persistent()
            .has(&DataKey::Nullifier(nullifier))
    }
    
    /// Get contract version
    pub fn version(env: Env) -> u32 {
        env.storage().persistent()
            .get(&DataKey::Version).unwrap_or(1)
    }
}

#[contracttype]
pub enum DataKey {
    Verifier,
    Owner,
    Version,
    Nullifier(BytesN<32>),
}
```

## 7.2 Contract Factory Pattern (for multi-currency support)

```rust
// contracts/alphine_factory/src/lib.rs
// Factory pattern untuk deploy instance payment contract per-asset

#![no_std]
use soroban_sdk::{
    contract, contractimpl, Address, BytesN, Env, Vec,
};

#[contract]
pub struct AlphineFactory;

#[contractimpl]
impl AlphineFactory {
    pub fn create_payment_contract(
        env: Env,
        salt: BytesN<32>,
        verifier: Address,
        token: Address,
        owner: Address,
    ) -> Address {
        // Deploy new alphine_payment instance
        let payment_wasm = env.deployer().upload_current_contract_wasm();
        let contract_id = env.deployer().deploy_v2(
            payment_wasm,
            salt,
            (verifier.clone(), owner.clone()),
        );
        
        // Init the new contract
        let client = crate::alphine_payment::Client::new(&env, &contract_id);
        client.init(&verifier, &owner);
        
        contract_id
    }
}
```

## 7.3 Build & Test Payment Contract

```bash
cd ~/alphine/contracts/alphine_payment

# Build
soroban contract build

# Run tests
cargo test

# Deploy
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/alphine_payment.wasm \
  --network testnet \
  --source alice

# Save
echo "ALPHINE_PAYMENT_ID=<contract_id>" >> ~/alphine/.env

# Init
soroban contract invoke \
  --id $ALPHINE_PAYMENT_ID \
  --network testnet \
  --source alice \
  -- \
  init \
  --verifier $GROTH16_VERIFIER_ID \
  --owner alice

# Test payment (will fail without valid proof — expected)
soroban contract invoke \
  --id $ALPHINE_PAYMENT_ID \
  --network testnet \
  --source alice \
  -- \
  process_payment \
  --payment '{"from": "alice", "to": "bob", "token": "...", "amount": 1000, "compliance_proof": {...}}'
```

## 7.4 End-to-End Transaction Script

```javascript
// scripts/end_to_end.mjs
// Simulasi end-to-end: User → AI → ZK → Blockchain

import { AMLTransactionAnalyzer } from '../backend/aml/analyzer.mjs';
import { ComplianceReportGenerator } from '../backend/aml/compliance_report.mjs';
import { TavilySanctionsFetcher } from '../backend/sanctions/fetcher.mjs';
import { PoseidonMerkleTree } from '../backend/sanctions/merkle_tree.mjs';
import { generateComplianceProof } from '../backend/prover/prove_compliance.mjs';
import { submitProofForVerification } from '../backend/verifier/submit_proof.mjs';
import { SorobanClient } from 'soroban-client';

async function runEndToEnd() {
    console.log('🏔️ Alphine — End-to-End Demo\n');
    
    // Step 1: Get user transaction context
    console.log('1️⃣ Fetching user transaction history...');
    const userHistory = await fetchUserHistory('GD5KD...');
    
    // Step 2: Fetch latest sanctions
    console.log('2️⃣ Fetching sanctions list from Tavily...');
    const sanctionsFetcher = new TavilySanctionsFetcher(process.env.TAVILY_API_KEY);
    const sanctions = await sanctionsFetcher.fetchLatestSanctions();
    
    // Step 3: Build Merkle tree
    console.log('3️⃣ Building Merkle tree...');
    const tree = new PoseidonMerkleTree();
    const allAddresses = [...(sanctions.ofac?.entries || []), ...(sanctions.un?.entries || [])];
    tree.addAddresses(allAddresses);
    
    // Step 4: Check if user is sanctioned
    console.log('4️⃣ Checking sanctions status...');
    const userAddress = 'GD5KD...';
    if (tree.contains(userAddress)) {
        console.log('❌ User is sanctioned! Blocking transaction.');
        return;
    }
    console.log('✅ User is not sanctioned');
    
    // Step 5: AI compliance analysis
    console.log('5️⃣ Groq AI analyzing transaction pattern...');
    const amlAnalyzer = new AMLTransactionAnalyzer(process.env.GROQ_API_KEY);
    const reportGenerator = new ComplianceReportGenerator(amlAnalyzer);
    const report = await reportGenerator.generateReport(
        { from: userAddress, to: 'GDBOB...', amount: '5000', timestamp: Date.now() },
        userHistory
    );
    
    if (report.compliance.recommendation === 'block') {
        console.log('❌ AI flagged transaction as suspicious. Manual review required.');
        return;
    }
    console.log('✅ AI compliance check passed');
    
    // Step 6: Generate ZK proof
    console.log('6️⃣ Generating ZK proof (this may take a moment)...');
    const proofResult = await generateComplianceProof({
        merkleRoot: tree.getRoot(),
        nullifier: computeNullifier(userAddress),
        threshold: '10000000000',
        timeWindow: '90',
        currentTimestamp: Math.floor(Date.now() / 1000).toString(),
        toAddress: 'GDBOB...',
        userAddress: userAddress,
        merkleProof: [],
        merkleIndices: [],
        amount: '5000000000',
        historicalAmounts: userHistory.map(tx => tx.amount),
        historicalTimestamps: userHistory.map(tx => tx.timestamp),
        numTransactions: userHistory.length.toString(),
    });
    console.log('✅ ZK proof generated');
    
    // Step 7: Submit to Soroban
    console.log('7️⃣ Submitting to Stellar testnet...');
    const txResult = await submitProofForVerification(
        proofResult.proof,
        proofResult.publicOutputs
    );
    
    if (txResult.success) {
        console.log('\n🎉 Transaction approved! USDC transferred.');
        console.log(`🔗 Transaction hash: ${txResult.hash}`);
    } else {
        console.log('\n❌ Transaction failed:', txResult.error);
    }
}
```

## 7.5 ✅ Phase 7 — Deliverables Check

| Item | Status |
|------|--------|
| AlphinePayment contract (process_payment) | ☐ |
| Nullifier check (replay protection) | ☐ |
| Verifier integration (proof check → transfer) | ☐ |
| Token transfer integration | ☐ |
| Event publishing (success/failure) | ☐ |
| Factory contract (multi-currency) | ☐ |
| Contract built + deployed to testnet | ☐ |
| End-to-end demo script | ☐ |

---

# Phase 8 (70–80%): Frontend dApp + User Dashboard

**Goal:** React frontend dengan wallet connection, transaction dashboard, compliance visualization, dan demo flow yang impresif untuk judges.

---

## 8.1 Frontend Setup

```bash
cd ~/alphine/frontend

# Create React app with Vite + TypeScript
pnpm create vite alphine-ui --template react-ts
cd alphine-ui

# Install dependencies
pnpm add @stellar/stellar-sdk @creit.tech/stellar-wallets-kit
pnpm add @tanstack/react-query axios recharts
pnpm add tailwindcss @tailwindcss/vite
pnpm add lucide-react framer-motion

# Dev setup
pnpm dev
```

## 8.2 Wallet Connection (Stellar Wallets Kit)

```tsx
// frontend/src/components/WalletConnect.tsx
import { useState, useEffect } from 'react';
import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
} from '@creit.tech/stellar-wallets-kit';

const kit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: 'freighter',
  modules: allowAllModules(),
});

export function WalletConnect() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');

  const connectWallet = async () => {
    await kit.openModal({
      onWalletSelected: async (option) => {
        kit.setWallet(option.id);
        const { address } = await kit.getAddress();
        setPublicKey(address);
        await fetchBalance(address);
      },
    });
  };

  const fetchBalance = async (address: string) => {
    const server = new StellarSdk.SorobanRpc.Server(
      'https://soroban-testnet.stellar.org'
    );
    // Fetch balances
  };

  const disconnectWallet = () => {
    setPublicKey(null);
    setBalance('0');
  };

  return (
    <div className="flex items-center gap-4">
      {publicKey ? (
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-gray-400">
              {publicKey.slice(0, 6)}...{publicKey.slice(-4)}
            </p>
            <p className="text-xs text-emerald-400">{balance} USDC</p>
          </div>
          <button
            onClick={disconnectWallet}
            className="px-3 py-1.5 text-sm bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
```

## 8.3 Transaction Dashboard

```tsx
// frontend/src/components/TransactionDashboard.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Shield, CheckCircle, XCircle, 
  AlertTriangle, Loader2, Search
} from 'lucide-react';

type TransactionStatus = 'idle' | 'analyzing' | 'sanctions_check' | 'generating_proof' | 'submitting' | 'success' | 'failed';

interface ComplianceResult {
  sanctioned: boolean;
  merkleRoot: string;
  complianceReport: {
    riskScore: number;
    redFlags: string[];
    recommendation: 'approve' | 'review' | 'block';
    structuringDetails: {
      suspiciousTxCount: number;
    };
  };
  canProceed: boolean;
}

export function TransactionDashboard() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<TransactionStatus>('idle');
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stepLabels: Record<TransactionStatus, string> = {
    idle: 'Ready to send',
    analyzing: '🧠 AI analyzing transaction pattern...',
    sanctions_check: '🔍 Checking sanctions lists via Tavily...',
    generating_proof: '🔐 Generating ZK compliance proof...',
    submitting: '📡 Submitting to Stellar testnet...',
    success: '✅ Transaction approved!',
    failed: '❌ Transaction blocked',
  };

  const handleSend = async () => {
    setStatus('analyzing');
    setError(null);
    
    try {
      // Step 1: AI Analysis
      setStatus('sanctions_check');
      const complianceRes = await fetch('/api/sanctions/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: recipient }),
      });
      const complianceData = await complianceRes.json();
      setResult(complianceData);
      
      if (complianceData.sanctioned) {
        setStatus('failed');
        setError('Recipient is on sanctions list');
        return;
      }
      
      // Step 2: Generate ZK Proof
      setStatus('generating_proof');
      // ... proof generation ...
      
      // Step 3: Submit
      setStatus('submitting');
      // ... blockchain submission ...
      
      setStatus('success');
    } catch (err) {
      setStatus('failed');
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Status Bar */}
      <AnimatePresence mode="wait">
        {status !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-xl border ${
              status === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : status === 'failed'
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
            }`}
          >
            <div className="flex items-center gap-3">
              {(status === 'analyzing' || status === 'generating_proof' || status === 'submitting') && (
                <Loader2 className="w-5 h-5 animate-spin" />
              )}
              {status === 'success' && <CheckCircle className="w-5 h-5" />}
              {status === 'failed' && <XCircle className="w-5 h-5" />}
              <span className="font-medium">{stepLabels[status]}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Send Form */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Recipient Address
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="G..."
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={status !== 'idle'}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Amount (USDC)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              max="10000"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={status !== 'idle'}
            />
            <p className="text-xs text-gray-500 mt-1">
              FINRA reporting threshold: $10,000
            </p>
          </div>
          
          <button
            onClick={handleSend}
            disabled={status !== 'idle' || !recipient || !amount}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send Compliant Transfer
          </button>
        </div>
      </div>
      
      {/* Compliance Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            Compliance Report
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400">Risk Score</span>
              <span className={`font-mono font-bold ${
                result.complianceReport.riskScore > 70 
                  ? 'text-red-400' 
                  : result.complianceReport.riskScore > 40 
                  ? 'text-yellow-400' 
                  : 'text-emerald-400'
              }`}>
                {result.complianceReport.riskScore}/100
              </span>
            </div>
            
            {result.complianceReport.redFlags.length > 0 && (
              <div className="space-y-2">
                <span className="text-gray-400 text-sm">Red Flags</span>
                {result.complianceReport.redFlags.map((flag, i) => (
                  <div key={i} className="flex items-center gap-2 text-yellow-400 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    {flag}
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-400">Recommendation</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                result.complianceReport.recommendation === 'approve'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : result.complianceReport.recommendation === 'review'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {result.complianceReport.recommendation.toUpperCase()}
              </span>
            </div>
            
            <div className="flex items-center justify-between py-2 border-t border-gray-800">
              <span className="text-gray-400">Merkle Root</span>
              <span className="font-mono text-xs text-gray-500">
                {result.merkleRoot.slice(0, 16)}...
              </span>
            </div>
          </div>
        </motion.div>
      )}
      
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}
```

## 8.4 Main App Layout

```tsx
// frontend/src/App.tsx
import { WalletConnect } from './components/WalletConnect';
import { TransactionDashboard } from './components/TransactionDashboard';
import { Shield, TrendingUp, History } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold">🏔️</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Alphine
            </span>
            <span className="px-2 py-0.5 text-xs bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
              Compliance
            </span>
          </div>
          <WalletConnect />
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">
            Zero-Knowledge{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AML Compliance
            </span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Send USDC on Stellar with cryptographic proof of compliance.
            Your privacy preserved, regulators satisfied.
          </p>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { icon: Shield, label: 'ZK-Protected', value: '100%' },
            { icon: TrendingUp, label: 'Threshold', value: '$10,000' },
            { icon: History, label: 'Sanctions Checked', value: 'Live' },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-4 border border-gray-800 text-center">
              <stat.icon className="w-5 h-5 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
        
        {/* Transaction Dashboard */}
        <TransactionDashboard />
      </main>
      
      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 text-center text-sm text-gray-600">
        Built for Stellar Hacks: Real-World ZK • June 2026
      </footer>
    </div>
  );
}
```

## 8.5 Styling (Tailwind Config)

```css
/* frontend/src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-950 text-white antialiased;
  }
  
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
}

@layer utilities {
  .glass {
    @apply bg-gray-900/50 backdrop-blur-sm border border-gray-800;
  }
}
```

## 8.6 ✅ Phase 8 — Deliverables Check

| Item | Status |
|------|--------|
| Vite + React + TypeScript setup | ☐ |
| Stellar wallet connection (Freighter, xBull) | ☐ |
| Transaction send form UI | ☐ |
| Real-time compliance status visualization | ☐ |
| Step-by-step progress animation (Framer Motion) | ☐ |
| Risk score display & red flag indicators | ☐ |
| Tailwind CSS styling + responsive design | ☐ |
| All components render correctly | ☐ |

---

# Phase 9 (80–90%): Integration Testing + Testnet Deployment

**Goal:** Full integration testing seluruh pipeline, deploy ke Stellar testnet, verify end-to-end flow works, dan debug semua issues.

---

## 9.1 Integration Test Suite

```javascript
// tests/integration/full_pipeline.test.mjs
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

async function setupTestEnvironment() {
    // 1. Start backend
    // 2. Deploy contracts
    // 3. Fund test accounts
    // 4. Set up mock data
}

async function teardownTestEnvironment() {
    // Cleanup
}

describe('Alphine Full Pipeline', () => {
    let env;
    
    before(async () => {
        env = await setupTestEnvironment();
    });
    
    after(async () => {
        await teardownTestEnvironment();
    });
    
    it('should analyze a clean transaction', async () => {
        const analyzer = new AMLTransactionAnalyzer(process.env.GROQ_API_KEY);
        const result = await analyzer.analyzeTransaction(
            { from: 'GA...', to: 'GB...', amount: '5000', timestamp: Date.now() },
            []
        );
        
        assert.equal(result.risk_score < 30, true);
        assert.equal(result.recommendation, 'approve');
    });
    
    it('should detect structuring pattern', async () => {
        const structuringTxs = [
            { amount: '9500', timestamp: 1, daysApart: 2 },
            { amount: '9700', timestamp: 3, daysApart: 2 },
            { amount: '9200', timestamp: 5, daysApart: 2 },
            { amount: '9800', timestamp: 7, daysApart: 2 },
            { amount: '9400', timestamp: 9, daysApart: 2 },
            { amount: '9600', timestamp: 11, daysApart: 2 },
        ];
        
        const analyzer = new AMLTransactionAnalyzer(process.env.GROQ_API_KEY);
        const detection = await analyzer.detectStructuring(structuringTxs);
        
        assert.equal(detection.structuring_detected, true);
        assert.equal(detection.confidence > 80, true);
    });
    
    it('should build merkle tree from sanctions', async () => {
        const tree = new PoseidonMerkleTree();
        tree.addAddresses([
            '0x1234567890abcdef1234567890abcdef12345678',
            'GCK3H5SJOK7P6P6P6P6P6P6P6P6P6P6P6P6P6P6P',
        ]);
        
        const root = tree.getRoot();
        assert.ok(root);
        assert.ok(root.length > 0);
    });
    
    it('should generate a valid ZK proof', async () => {
        // This test requires the Noir circuit to be compiled
        const proof = await generateComplianceProof({
            merkleRoot: '0x...',
            nullifier: '0x...',
            threshold: '10000000000',
            timeWindow: '90',
            currentTimestamp: Math.floor(Date.now() / 1000).toString(),
            toAddress: '0x...',
            userAddress: '0x...',
            merkleProof: [],
            merkleIndices: [],
            amount: '5000000000',
            historicalAmounts: [],
            historicalTimestamps: [],
            numTransactions: '0',
        });
        
        assert.ok(proof.proof);
        assert.ok(proof.publicOutputs);
    });
    
    it('should deploy and verify on Soroban testnet', async () => {
        // Deploy verifier
        const verifierId = await deployContract('groth16_verifier');
        assert.ok(verifierId);
        
        // Deploy payment contract
        const paymentId = await deployContract('alphine_payment');
        assert.ok(paymentId);
        
        // Process payment (with real proof)
        // This will only pass if all other steps work
    });
});
```

## 9.2 Deployment Script

```bash
#!/bin/bash
# scripts/deploy.sh — Full deployment to Stellar testnet

set -e

echo "🏔️ Alphine — Deployment to Stellar Testnet"
echo "============================================"

# Load environment
source .env

# 1. Build all contracts
echo -e "\n📦 Building Soroban contracts..."
cd contracts

for contract in groth16_verifier alphine_payment; do
    echo "  Building $contract..."
    (cd $contract && soroban contract build)
done

cd ..

# 2. Deploy Groth16 Verifier
echo -e "\n🔐 Deploying Groth16 Verifier..."
VERIFIER_ID=$(soroban contract deploy \
    --wasm contracts/groth16_verifier/target/wasm32-unknown-unknown/release/groth16_verifier.wasm \
    --network testnet \
    --source alice)
echo "  Verifier ID: $VERIFIER_ID"

# 3. Deploy Payment Contract
echo -e "\n💳 Deploying Alphine Payment..."
PAYMENT_ID=$(soroban contract deploy \
    --wasm contracts/alphine_payment/target/wasm32-unknown-unknown/release/alphine_payment.wasm \
    --network testnet \
    --source alice)
echo "  Payment ID: $PAYMENT_ID"

# 4. Initialize Payment Contract
echo -e "\n⚙️ Initializing Payment Contract..."
soroban contract invoke \
    --id $PAYMENT_ID \
    --network testnet \
    --source alice \
    -- \
    init \
    --verifier $VERIFIER_ID \
    --owner $(soroban keys address alice)

# 5. Wrap USDC token
echo -e "\n💰 Wrapping USDC token..."
TOKEN_ID=$(soroban lab token wrap \
    --asset USDC:$(soroban keys address alice) \
    --network testnet \
    --source alice)
echo "  Token ID: $TOKEN_ID"

# 6. Save to .env
echo -e "\n📝 Saving contract IDs..."
cat >> .env << EOF

# Deployed Contracts (from deploy.sh)
GROTH16_VERIFIER_ID=$VERIFIER_ID
ALPHINE_PAYMENT_ID=$PAYMENT_ID
USDC_TOKEN_ID=$TOKEN_ID
DEPLOY_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
EOF

echo -e "\n✅ Deployment complete!"
echo "  Verifier:  $VERIFIER_ID"
echo "  Payment:   $PAYMENT_ID"
echo "  Token:     $TOKEN_ID"
```

## 9.3 Verification Script

```bash
#!/bin/bash
# scripts/verify_deployment.sh — Verify all contracts are live

source .env

echo "🔍 Verifying Testnet Deployment..."
echo "===================================="

# Check verifier
echo -ne "  Verifier contract: "
soroban contract invoke \
    --id $GROTH16_VERIFIER_ID \
    --network testnet \
    --source alice \
    -- \
    version 2>/dev/null \
    && echo "✅ Live" \
    || echo "❌ Not responding"

# Check payment contract
echo -ne "  Payment contract: "
soroban contract invoke \
    --id $ALPHINE_PAYMENT_ID \
    --network testnet \
    --source alice \
    -- \
    version 2>/dev/null \
    && echo "✅ Live" \
    || echo "❌ Not responding"

# Check balance
echo -ne "  Account balance: "
soroban keys balance alice --network testnet 2>/dev/null \
    || echo "❌ Cannot fetch"

# Check backend health
echo -ne "  Backend API: "
curl -s http://localhost:3001/api/health | jq .status 2>/dev/null \
    && echo "✅ Running" \
    || echo "❌ Not running"

echo -e "\n✅ Verification complete"
```

## 9.4 Performance & Gas Optimization

```rust
// Optimasi: Batch nullifier checking
// Daripada check satu per satu, kita bisa batch

pub fn check_nullifiers(
    env: Env,
    nullifiers: Vec<BytesN<32>>,
) -> Vec<bool> {
    let mut results = Vec::new(&env);
    for nullifier in nullifiers.iter() {
        let used = env.storage().persistent()
            .has(&DataKey::Nullifier(nullifier));
        results.push_back(used);
    }
    results
}

// Optimasi: Event batching
// Daripada emit event setiap step, emit satu event composite

pub fn emit_compliance_event(
    env: Env,
    from: Address,
    to: Address,
    amount: i128,
    success: bool,
    risk_score: u32,
) {
    env.events().publish(
        (symbol_short!("compliance"),),
        (from, to, amount, success, risk_score),
    );
}
```

## 9.5 Error Recovery Procedures

```bash
# scripts/reset_testnet.sh — Reset and redeploy if something breaks

echo "🔄 Resetting testnet deployment..."

# 1. Clear contract storage
# (Contracts need to be re-deployed — Soroban doesn't have upgrade yet)

# 2. Get fresh testnet XLM
soroban keys fund alice --network testnet
soroban keys fund bob --network testnet

# 3. Re-run deploy
bash scripts/deploy.sh

echo "✅ Reset complete"
```

## 9.6 ✅ Phase 9 — Deliverables Check

| Item | Status |
|------|--------|
| Full integration test suite | ☐ |
| Structuring detection test | ☐ |
| Merkle tree test | ☐ |
| ZK proof generation test | ☐ |
| Deployment script (deploy.sh) | ☐ |
| Verification script (verify_deployment.sh) | ☐ |
| All contracts live on testnet | ☐ |
| Backend API live + responding | ☐ |
| End-to-end flow works (real transaction) | ☐ |

---

# Phase 10 (90–100%): Demo Video + Submission Package

**Goal:** Polish final submission dengan 3-minute demo video, comprehensive README, dan semua deliverable hackathon.

---

## 10.1 Demo Video Script (2–3 Minutes)

```
SCENE 1: INTRO (0:00–0:15)
🎥 Screen recording split: Code editor + Terminal
🗣️ "Alphine is a zero-knowledge AML compliance layer for Stellar.
    This is the problem: every fintech on Stellar must comply with AML regulations,
    but blockchain transparency means zero privacy for users.
    Alphine solves both — with ZK proofs."

SCENE 2: THE PROBLEM (0:15–0:30)
🎥 Show Stellar network diagram → USDC flow → compliance gap
🗣️ "Banks need to verify three things before approving a transaction:
    - Is this address sanctioned?
    - Is the amount below reporting threshold?
    - Is this part of a structuring pattern?
    Currently, they need full transaction visibility to do this."

SCENE 3: THE SOLUTION — ARCHITECTURE (0:30–0:50)
🎥 Architecture diagram: User → Groq AI → Tavily → Noir Circuit → Soroban Contract
🗣️ "Alphine introduces a privacy-preserving pipeline:
    1. Groq AI analyzes transaction patterns for AML red flags
    2. Tavily fetches latest OFAC/UN sanctions lists in real-time
    3. Noir circuit generates a ZK proof proving compliance
    4. Soroban contract verifies proof and executes the transfer
    The regulator gets cryptographic proof — no user data needed."

SCENE 4: LIVE DEMO (0:50–2:00)
🎥 Screen recording: Frontend dApp
🗣️ "Let me show you the live demo on Stellar testnet...
    [Connect wallet] → [Enter recipient & amount] → [Send]
    Watch the compliance pipeline execute in real-time:
    - ✅ Sanctions check passes
    - ✅ AI pattern analysis shows low risk
    - ✅ ZK proof generated and verified on-chain
    [Show transaction success]
    The entire process takes seconds, and the user's privacy is preserved."

SCENE 5: ZK EXPLANATION (2:00–2:30)
🎥 Show Noir circuit code → Merkle tree → Proof verification flow
🗣️ "Under the hood, we're using three Noir circuits:
    - Sanctions non-membership (Merkle tree proof)
    - Amount threshold (range proof)
    - Structuring detection (pattern analysis)
    All verified via Groth16 on Stellar's native BN254 primitives."

SCENE 6: CLOSING (2:30–3:00)
🎥 Show GitHub repo + live testnet links
🗣️ "Alphine is fully open-source, deployed on Stellar testnet.
    This is production-ready compliance infrastructure for the Stellar ecosystem.
    Check the repo for full documentation and try it yourself."
```

## 10.2 README.md — Final Version

```markdown
# 🏔️ Alphine — ZK-Powered AML Compliance for Stellar

[![Stellar](https://img.shields.io/badge/Stellar-Testnet-00B4E6)](https://stellar.org)
[![Noir](https://img.shields.io/badge/Noir-Circuits-FF6B6B)](https://noir-lang.org)
[![Groq](https://img.shields.io/badge/Groq-AI-00C853)](https://groq.com)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

**Hackathon:** [Stellar Hacks: Real-World ZK](https://dorahacks.io/hackathon/stellar-hacks-zk/detail)
**Prize:** $10,000 USD Pool
**Track:** Real-World ZK on Stellar

---

## 📋 Table of Contents

- [Problem](#problem)
- [Solution](#solution)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Tech Stack](#tech-stack)
- [API Reference](#api-reference)
- [Demo Video](#demo-video)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Problem

Every financial institution on Stellar must comply with AML/CFT regulations. They need to:
1. Verify addresses aren't on sanctions lists
2. Report transactions over $10,000
3. Detect structuring patterns

With transparent blockchains, this means **zero privacy** for users. Two bad choices: comply but expose data, or protect privacy but violate compliance.

## Solution

**Alphine** introduces a ZK-powered compliance layer:

| Check | Traditional | Alphine |
|-------|-------------|---------|
| Sanctions | Reveal address | ZK non-membership proof |
| Amount | Reveal amount | ZK range proof |
| Structuring | Full history | ZK pattern proof |

Regulators get cryptographic proof. Users keep their privacy.

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                         USER                             │
│              (Freighter Wallet / dApp)                    │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│                    GROQ AI ENGINE                         │
│  • Transaction pattern analysis                          │
│  • Structuring detection                                 │
│  • Risk scoring (0-100)                                  │
│  → Output: structured compliance report                  │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│               TAVILY SANCTIONS ORACLE                    │
│  • Real-time OFAC SDN list fetch                         │
│  • UN sanctions consolidated list                        │
│  • Regulatory news monitoring                            │
│  → Output: Merkle root of sanctioned addresses           │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│                 NOIR ZK CIRCUIT                           │
│  • sanctions.nr — Merkle non-membership proof            │
│  • amount.nr — Range proof                               │
│  • structuring.nr — Pattern proof                        │
│  → Output: Groth16 proof (BN254)                         │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│              SOROBAN SMART CONTRACT                       │
│  • Groth16 Verifier (BN254 pairing check)                │
│  • Alphine Payment (proof → transfer)                    │
│  • Nullifier registry (replay protection)                │
│  → Output: Executed USDC transfer                        │
└──────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites
- WSL Ubuntu 22.04+, Rust 1.84+, Node.js 22+

### 1. Environment Setup
```bash
git clone https://github.com/yourusername/alphine.git
cd alphine
cp .env.example .env
# Add your API keys (Groq, Tavily)
```

### 2. Install Dependencies
```bash
# Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown

# Soroban CLI
cargo install --locked --version 21.0.4 soroban-cli

# Noir
curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash
noirup

# Node dependencies
pnpm install
```

### 3. Deploy Smart Contracts
```bash
bash scripts/deploy.sh
```

### 4. Start Backend
```bash
cd backend
pnpm start
```

### 5. Start Frontend
```bash
cd frontend/alphine-ui
pnpm dev
```

### 6. Open Browser
Navigate to `http://localhost:5173`

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **ZK Language** | Noir | ZK circuit development |
| **Proving System** | Groth16 (BN254) | Efficient on-chain verification |
| **Blockchain** | Stellar Soroban | Smart contract platform |
| **AI / LLM** | Groq (Llama 3.3 70B) | Compliance pattern analysis |
| **Data Oracle** | Tavily API | Real-time sanctions fetching |
| **Frontend** | React + Vite + Tailwind | User dashboard |
| **Backend** | Node.js + Express | API orchestration |
| **Wallet** | Freighter / Stellar Wallets Kit | User authentication |

## Live Testnet Deployment

| Contract | Address | Network |
|----------|---------|---------|
| Groth16 Verifier | `CA...` | Stellar Testnet |
| Alphine Payment | `CB...` | Stellar Testnet |
| USDC Token | `CC...` | Stellar Testnet |

## Demo Video

[▶️ Watch the 3-minute demo](https://youtube.com/...)

## License

MIT — See [LICENSE](LICENSE)
```

## 10.3 Submission Checklist

```markdown
# 📋 Hackathon Submission Checklist

## Required by DoraHacks Rules

### 1. Open Source Repository ✅
- [ ] Public GitHub repo
- [ ] Full source code
- [ ] README.md (above)
- [ ] License file
- [ ] .gitignore
- [ ] Package manager lock files

### 2. Demo Video (2–3 minutes) ✅
- [ ] Clear problem statement
- [ ] Architecture overview
- [ ] Live demo on testnet
- [ ] ZK component explained
- [ ] Working end-to-end flow
- [ ] Upload to YouTube/Streamable

### 3. ZK Integration (Core Requirement) ✅
- [ ] ZK proof generated off-chain (Noir)
- [ ] Proof verified on-chain (Soroban) — THIS IS CRITICAL
- [ ] ZK does meaningful work (not cosmetic)

### 4. Additional Polish
- [ ] Landing page / dApp
- [ ] Backend API running
- [ ] Testnet contracts live
- [ ] All tests passing
- [ ] Clean commit history
```

## 10.4 Demo Video Recording Setup (WSL Ubuntu)

Since you're on WSL Ubuntu (no built-in screen recorder):

```bash
# Option 1: Install OBS Studio on Windows (recommended)
# Download from https://obsproject.com/
# OBS can capture WSL GUI apps (WSLg) AND Windows browser

# Option 2: Use asciinema for terminal recording
sudo apt install asciinema
asciinema rec alphine-demo.cast

# Option 3: Use OBS on Linux if you have it
sudo apt install obs-studio

# For voiceover, use OBS audio capture
```

**Demo Recording Tips:**
1. Record at 1080p 30fps
2. Use OBS to capture:
   - Browser (frontend dApp at localhost:5173)
   - Terminal (backend + contract interactions)
   - Voiceover microphone
3. Export as MP4, upload to YouTube unlisted
4. Keep it under 3 minutes

## 10.5 Final Submission on DoraHacks

```bash
# Steps to submit on https://dorahacks.io/hackathon/stellar-hacks-zk/detail

# 1. Push final code
git add .
git commit -m "🏔️ Alphine v1.0 — ZK-Powered AML Compliance"
git tag v1.0.0
git push origin main --tags

# 2. Upload demo video to YouTube (unlisted)
# 3. Submit on DoraHacks:
#    - Project name: Alphine
#    - Tagline: "ZK-Powered AML Compliance for Stellar"
#    - GitHub URL
#    - Demo Video URL
#    - Description (copy from README)
#    - Track: Real-World ZK on Stellar
#    - Submitted by: [Your Name/Team]
```

## 10.6 ✅ Phase 10 — Deliverables Check

| Item | Status |
|------|--------|
| Demo video recorded (2-3 min) | ☐ |
| Video uploaded to YouTube | ☐ |
| README.md comprehensive | ☐ |
| All code pushed to GitHub | ☐ |
| License file | ☐ |
| Submission on DoraHacks | ☐ |
| Live testnet links in README | ☐ |
| Contract addresses in README | ☐ |
| Final git tag (v1.0.0) | ☐ |

---

# 🎯 Winning Strategy Recap

## Mengapa Alphine Akan Menang

### 1. ZK Adalah Inti, Bukan Hiasan ✅
- Proof diverifikasi **on-chain** di Soroban via Groth16 + BN254
- Bukan cuma disebut di README — benar-benar jalan

### 2. Real-World Impact ✅
- AML compliance adalah masalah nyata untuk setiap fintech di Stellar
- Judges langsung paham: "Ini jelas kenapa harus ada"
- Timing sempurna — compliance adalah prioritas SDF

### 3. Working Demo End-to-End ✅
- Bukan slide, bukan mockup
- Wallet → AI analysis → ZK proof → Soroban verification → USDC transfer
- Semua jalan di testnet

### 4. Memanfaatkan Primitif Baru Stellar ✅
- **BN254**: Pairing curve untuk Groth16 verification
- **Poseidon**: Hash function untuk Merkle tree
- **Protocol 25/26**: Native host functions
- Judges dari SDF akan appreciate ini

### 5. Kombinasi AI + ZK yang Unik ✅
- **Groq AI**: Bukan chatbot biasa — compliance intelligence engine
- Output AI langsung masuk ke ZK circuit
- Belum ada yang bikin ini di hackathon Stellar

### 6. Skalabilitas Jelas ✅
- Bukan prototype yang mati setelah hackathon
- Setiap fintech di Stellar butuh compliance layer
- Market: MoneyGram, Circle, exchange partners Stellar

---

> **"Alphine is the compliance layer Stellar needs."**
>
> Built with ❤️ for Stellar Hacks: Real-World ZK 2026
