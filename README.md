# 🏔️ Alphine — Zero-Knowledge AML Compliance Layer for Stellar

[![Stellar](https://img.shields.io/badge/Stellar-Testnet-00B4E6)](https://stellar.org)
[![Noir](https://img.shields.io/badge/Noir-Circuits-FF6B6B)](https://noir-lang.org)
[![Groq](https://img.shields.io/badge/Groq-AI-00C853)](https://groq.com)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
[![Hackathon](https://img.shields.io/badge/DoraHacks-Stellar_Hacks_Real_World_ZK-8A2BE2)](https://dorahacks.io/hackathon/stellar-hacks-zk/detail)

---

**Hackathon:** [Stellar Hacks: Real-World ZK](https://dorahacks.io/hackathon/stellar-hacks-zk/detail)  
**Prize Pool:** $10,000 USD (in XLM)  
**Timeline:** June 15 – June 29, 2026

---

## 📋 Table of Contents

- [Problem](#problem)
- [Solution](#solution)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Tech Stack](#tech-stack)
- [API Reference](#api-reference)
- [Useful Scripts](#useful-scripts)
- [Demo Video](#demo-video)
- [Deployment](#deployment)
- [License](#license)

---

## Problem

Every financial institution on Stellar must comply with AML/CFT regulations. They need to:

1. **Sanctions check** — Verify addresses aren't on OFAC/UN sanctions lists
2. **Threshold reporting** — Report transactions over $10,000 to FINRA
3. **Structuring detection** — Detect users breaking large transactions into smaller ones to avoid reporting

With transparent blockchains, this means **zero privacy for users**. Companies face a lose-lose choice: comply but expose sensitive user data, or protect privacy but violate compliance requirements.

---

## Solution

**Alphine** introduces a **ZK-powered compliance layer** that lets institutions verify compliance without accessing private user data:

| Compliance Check | Traditional Approach | Alphine (ZK) |
|-----------------|---------------------|---------------|
| Sanctions list | Reveal user address | **Non-membership Merkle proof** |
| Amount threshold | Reveal exact amount | **Range proof** (below threshold) |
| Structuring | Full transaction history | **Pattern proof** (no suspicious patterns) |

Regulators get cryptographic proof. Users keep their data private. Both sides win.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                │
│              (Freighter Wallet / React dApp)                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    GROQ AI ENGINE (Phase 5)                  │
│  • Transaction pattern analysis via Llama 3.3 70B           │
│  • Structuring detection over 90-day history                │
│  • Risk scoring (0–100) + recommendation                    │
│  • 5-minute cached results for rate limit management        │
│  → Output: structured compliance report                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│               TAVILY SANCTIONS ORACLE (Phase 6)              │
│  • Real-time OFAC SDN list fetching                         │
│  • UN sanctions consolidated list                           │
│  • Regulatory news monitoring                               │
│  • 30-minute auto-update scheduler                          │
│  • SHA-256 Merkle tree with proof generation                │
│  → Output: Merkle root + inclusion proof                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                 NOIR ZK CIRCUIT (Phase 9)                    │
│  • sanctions.nr — Merkle non-membership proof               │
│  • amount.nr — Range proof (below FINRA threshold)          │
│  • structuring.nr — Pattern detection proof                 │
│  • Pedersen hash for efficient ZK-friendly Merkle tree      │
│  → Output: Groth16-compatible proof (via Barretenberg)      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              SOROBAN SMART CONTRACT (Phases 4+7)             │
│  • Groth16 Verifier — BN254 pairing check                   │
│    (4-pair equation: e(A,B)·e(α,-β)·e(γ_combined,-γ)·e(C,-δ)=1) │
│  • Alphine Payment — Proof → USDC transfer                  │
│  • Nullifier registry — Replay protection                   │
│  • 24 unit tests across all contracts                       │
│  → Output: Verified USDC transfer on Stellar testnet        │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow (End-to-End)

```
1. User connects Freighter wallet
2. Enter recipient + amount (e.g., $5,000 USDC)
3. Backend checks sanctions via Tavily OFAC/UN API
4. Groq AI analyzes transaction pattern for AML red flags
5. If clean → Noir circuit generates ZK proof
6. Proof submitted to Soroban Groth16 Verifier
7. If valid → Alphine Payment executes USDC transfer
8. Compliance report returned to user — no private data exposed
```

---

## Quick Start

### Prerequisites

- WSL Ubuntu 22.04+, macOS, or Linux
- Rust 1.84+ (`wasm32v1-none` target)
- Node.js 20+ (npm)
- Stellar CLI (`stellar` / `soroban-cli`)
- Noir (nargo) — `curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash`

### 1. Clone & Setup

```bash
git clone https://github.com/jinggaworld/Alphine
cd Alphine
cp .env.example .env
# Add your GROQ_API_KEY and TAVILY_API_KEY
```

### 2. Backend

```bash
cd backend
npm install
npm start
# → http://localhost:3001/api/health
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### 4. Compile Noir Circuit

```bash
cd circuits/alphine_compliance
nargo compile
```

### 5. Run Smart Contract Tests

```bash
cd contracts/alphine_core
cargo test
# → 24 tests passing
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **ZK Language** | [Noir](https://noir-lang.org) | Zero-knowledge circuit development |
| **Proving System** | Groth16 (BN254) | Efficient on-chain verification |
| **Blockchain** | [Stellar Soroban](https://stellar.org) | Smart contract platform (Protocol 25) |
| **Contracts** | Rust + soroban-sdk | 3 contracts: verifier, core, payment |
| **AI / LLM** | [Groq](https://groq.com) Llama 3.3 70B | Compliance pattern analysis |
| **Data Oracle** | [Tavily](https://tavily.com) | Real-time OFAC/UN sanctions fetching |
| **Frontend** | React 18 + Vite + Tailwind | User dashboard (Google Material Design) |
| **Backend** | Node.js + Express | API orchestration (5 route groups) |
| **Wallet** | Freighter | Stellar wallet connection |
| **Animation** | Framer Motion | Step-by-step compliance flow |
| **Icons** | Lucide React | Clean, consistent icon set |

---

## API Reference

### Phase 5 — AML Analysis

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analyze-transaction` | Full AML compliance analysis via Groq AI |
| `POST` | `/api/analyze-structuring` | Structuring pattern detection |
| `GET` | `/api/cache-stats` | Groq API cache hit/miss statistics |
| `GET` | `/api/health` | Server health + API key status |

### Phase 6 — Sanctions Oracle

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/sanctions/root` | Current Merkle root of sanctioned addresses |
| `POST` | `/api/sanctions/check` | Check if address is sanctioned |
| `POST` | `/api/sanctions/proof` | Get Merkle inclusion proof for address |
| `GET` | `/api/sanctions/status` | Scheduler and tree status |
| `POST` | `/api/sanctions/refresh` | Force refresh sanctions data |
| `GET` | `/api/sanctions/init` | Get initial sanctions list |

### Phase 9 — ZK Proof

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/proof/generate` | Generate ZK compliance proof via Noir circuit |
| `POST` | `/api/proof/verify` | Verify proof format (on-chain via Soroban) |
| `GET` | `/api/proof/status` | Check if proof generation is ready |

---

## Useful Scripts

| Script | Description |
|--------|-------------|
| `scripts/run_all_tests.sh` | Run all tests: Rust + Noir + TypeScript + Build |
| `scripts/deploy.sh` | Deploy all Soroban contracts to Stellar testnet |
| `scripts/verify_deployment.sh` | Verify contracts are live and responding |
| `scripts/reset_testnet.sh` | Redeploy everything from scratch |
| `node --test tests/integration/` | Run integration test suite |

---

## Project Structure

```
alphine/
├── backend/                          # Node.js Express API
│   ├── index.mjs                     # Server entry (Phases 5+6+9)
│   ├── aml/                          # Groq AI integration
│   │   ├── analyzer.mjs              # AML Transaction Analyzer
│   │   ├── compliance_report.mjs     # AI → circuit inputs bridge
│   │   └── cache_manager.mjs         # Rate limit cache (5-min TTL)
│   ├── sanctions/                    # Tavily sanctions oracle
│   │   ├── fetcher.mjs               # OFAC/UN/news fetcher
│   │   ├── merkle_tree.mjs           # SHA-256 Merkle tree
│   │   └── update_scheduler.mjs      # 30-min auto-update
│   ├── api/                          # API routes
│   │   ├── analyze.mjs               # Phase 5 endpoints
│   │   ├── sanctions.mjs             # Phase 6 endpoints
│   │   └── proof.mjs                 # Phase 9 endpoints
│   └── prover/                       # ZK proof generation
│       └── prove_compliance.mjs      # Noir + Barretenberg
│
├── frontend/                         # React dApp
│   ├── src/
│   │   ├── App.tsx                   # Main layout + state management
│   │   ├── components/
│   │   │   ├── WalletConnect.tsx     # Freighter wallet
│   │   │   ├── TransactionDashboard.tsx  # Send form + compliance flow
│   │   │   ├── ComplianceReport.tsx  # Risk score display
│   │   │   ├── StatusBar.tsx         # Animated progress
│   │   │   └── optimization/         # Performance
│   │   │       ├── ErrorBoundary.tsx
│   │   │       ├── LazyRender.tsx    # IntersectionObserver
│   │   │       └── LoadingSkeleton.tsx
│   │   └── utils/cache.ts           # Client cache
│   └── ...config files
│
├── circuits/                         # Noir ZK circuits
│   └── alphine_compliance/
│       ├── Nargo.toml
│       └── src/
│           ├── main.nr               # Main circuit (combined)
│           ├── sanctions.nr          # Merkle non-membership
│           ├── amount.nr             # Threshold check
│           └── structuring.nr        # Structuring detection
│
├── contracts/                        # Soroban smart contracts
│   └── alphine_core/
│       ├── Cargo.toml
│       └── contracts/
│           ├── alphine-core/         # Foundation contract
│           ├── groth16-verifier/     # Groth16 BN254 verifier
│           └── alphine-payment/      # Payment + compliance
│
├── scripts/                          # Automation
│   ├── deploy.sh                     # Testnet deployment
│   ├── verify_deployment.sh          # Contract verification
│   ├── reset_testnet.sh              # Full redeploy
│   └── run_all_tests.sh              # Complete test suite
│
├── tests/                            # Integration tests
│   └── integration/
│       └── full_pipeline.test.mjs    # 9 test scenarios
│
└── docs/                             # Documentation
    ├── phase/README.md               # Strategy overview
    ├── phase/detailed.md             # Technical deep-dive
    └── phase/final-10-phase.md       # Original 10-phase build plan
```

---

## Test Results

| Component | Tests | Status |
|-----------|-------|--------|
| **Alpha Core Contract** | 5 | ✅ All pass |
| **Groth16 Verifier** | 5 | ✅ All pass (4-pair equation) |
| **ZK Primitives** | 5 | ✅ All pass |
| **Alphine Payment** | 7 | ✅ All pass (7/7) |
| **Total Rust** | **24** | ✅ **100% pass** |
| **Noir Circuit** | `nargo compile` | ✅ Zero errors |
| **Frontend TypeScript** | `tsc --noEmit` | ✅ Zero errors |
| **Frontend Build** | `vite build` | ✅ 328 KB gzipped |

---

## Demo Video

> *Coming soon — A 3-minute walkthrough of the Alphine compliance pipeline*

---

## License

This project is **MIT** licensed. See [LICENSE](LICENSE) for details.

---

*Built for [Stellar Hacks: Real-World ZK](https://dorahacks.io/hackathon/stellar-hacks-zk/detail) — June 2026*
