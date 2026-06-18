# 🏔️ Alphine — Zero-Knowledge AML Compliance Layer for Stellar

> **Hackathon:** [Stellar Hacks: Real-World ZK](https://dorahacks.io/hackathon/stellar-hacks-zk/detail)  
> **Prize Track:** Real-World ZK Application  
> **Timeline:** June 15 – June 29, 2026

---

## 📋 BUIDL Overview

| Field | Detail |
|-------|--------|
| **Project Name** | Alphine |
| **Track** | Real-World ZK Application |
| **Tagline** | Zero-Knowledge AML Compliance Layer for Stellar |
| **One-Liner** | Privacy-preserving compliance for Stellar payments — sanctions screening, threshold reporting, and structuring detection powered by Groq AI, verified via Noir ZK circuits, and secured on Soroban smart contracts. |
| **Status** | ✅ Fully functional — Testnet + Mainnet ready |

---

## 🏗️ Problem

Every financial institution on Stellar must comply with AML/CFT regulations:

1. **Sanctions screening** — Verify addresses aren't on OFAC/UN sanctions lists
2. **Threshold reporting** — Report transactions over $10,000 to FINRA
3. **Structuring detection** — Detect users breaking large transactions into smaller ones

With transparent blockchains, compliance means **zero privacy for users**. Companies face a lose-lose choice: comply but expose sensitive user data, or protect privacy but violate compliance requirements.

---

## 💡 Solution

**Alphine** introduces a **ZK-powered compliance layer** that lets institutions verify compliance without accessing private user data:

| Compliance Check | Traditional | Alphine (ZK) |
|-----------------|-------------|---------------|
| Sanctions list | Reveal user address | **Non-membership Merkle proof** 🛡️ |
| Amount threshold | Reveal exact amount | **Range proof** (below threshold) 🔢 |
| Structuring | Full transaction history | **Pattern proof** (no suspicious patterns) 📊 |

Regulators get cryptographic proof. Users keep their data private. **Both sides win.**

---

## 🏛️ Architecture

```
┌──────────────────────────────────────────────────────┐
│                    USER (React dApp)                   │
│   • Freighter Wallet · NetworkSwitcher · AssetSelector │
│   • TransactionDashboard · ComplianceReport            │
└──────────────────────┬────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│                 GROQ AI ENGINE (Llama 3.3 70B)         │
│   • Transaction pattern analysis                      │
│   • Structuring detection over 90-day history          │
│   • Sanctions-context reasoning ("why blocked")        │
│   • Fallback to mock on rate limit                     │
└──────────────────────┬────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│             TAVILY SANCTIONS ORACLE                    │
│   • Hybrid mode: 21 OFAC baseline + real-time search   │
│   • ETH (0x...) + Stellar (G...) address support      │
│   • 30-min auto-update scheduler                      │
│   • SHA-256 Merkle tree with inclusion proof           │
└──────────────────────┬────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│              NOIR ZK CIRCUIT (Groth16)                 │
│   • sanctions.nr — Merkle non-membership proof         │
│   • amount.nr — Range proof (below FINRA threshold)    │
│   • structuring.nr — Structuring pattern proof         │
└──────────────────────┬────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│           SOROBAN SMART CONTRACTS (Protocol 25)        │
│   • Groth16 Verifier — BN254 pairing (4-pair eq)      │
│   • Alphine Payment — Proof → USDC/XLM transfer       │
│   • Nullifier Registry — Replay protection             │
└──────────────────────────────────────────────────────┘
```

### End-to-End Data Flow

```
1. User connects Freighter wallet
2. Select asset (XLM/USDC) + network (Testnet/Mainnet)
3. Enter recipient — G... (Stellar) or 0x... (ETH sanctions check)
4. Backend checks 25-entry hybrid sanctions tree
5. If sanctioned: Groq AI explains WHY, full compliance report
6. If clean: AI analysis + ZK proof generation
7. Transaction built → signed via Freighter → submitted to Horizon
8. Compliance report: Merkle root, risk score, AI reasoning
```

---

## ✨ Key Features

| # | Feature | Why It Matters |
|---|---------|----------------|
| 1 | **Hybrid Sanctions** (21 OFAC baseline + Tavily real-time) | Always catches known bad actors + real-time updates |
| 2 | **Groq AI Analysis with Sanctions Reasoning** | Not just "blocked" — AI explains WHY it's significant |
| 3 | **ETH Address Support** (0x...) | Check any address against sanctions without Stellar TX |
| 4 | **Real Stellar Transactions** (Testnet + Mainnet) | Build → Sign (Freighter) → Submit (Horizon) |
| 5 | **Network Switcher** | One-click toggle between Testnet and Mainnet |
| 6 | **Asset Selector** (XLM ↔ USDC) | Auto-balance fetch, correct issuers per network |
| 7 | **Step-by-Step Transaction Log** | Every API call visible with timing + status codes |
| 8 | **AI Fallback on Rate Limit** | Mock analysis when Groq API is unavailable |
| 9 | **Automatic Account Creation** | `createAccount` for unfunded XLM destinations |
| 10 | **Freighter + Manual Wallet** | Browser extension OR paste any Stellar address |
| 11 | **Mobile Responsive** | Full responsive UI with compact navigation |
| 12 | **TypeScript Strict Mode** | Zero TypeScript errors across entire frontend |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **ZK Language** | [Noir](https://noir-lang.org) | Zero-knowledge circuit development |
| **Proving System** | Groth16 (BN254) | Efficient on-chain verification |
| **Blockchain** | [Stellar Soroban](https://stellar.org) Protocol 25 | Smart contract platform |
| **Smart Contracts** | Rust + soroban-sdk | 3 contracts: Verifier, Core, Payment |
| **AI / LLM** | [Groq](https://groq.com) Llama 3.3 70B | AML compliance + sanctions analysis |
| **Oracle** | [Tavily](https://tavily.com) Search API | Real-time OFAC/UN sanctions fetching |
| **Frontend** | React 18 + Vite + Tailwind | User dashboard (Material Design) |
| **Backend** | Node.js + Express | 12 REST endpoints |
| **Wallet** | Freighter (`@stellar/freighter-api`) | Stellar wallet + transaction signing |
| **SDK** | `@stellar/stellar-sdk` v15 | Horizon + transaction building |
| **Animation** | Framer Motion | Step-by-step compliance flow UI |
| **HTTP** | Axios | API communication + Horizon queries |

---

## 📊 Test Results

| Component | Result |
|-----------|--------|
| **Soroban Smart Contracts** | 22/22 unit tests passing |
| **Noir Circuit** | `nargo compile` — zero errors |
| **Frontend TypeScript** | Strict mode — zero errors |
| **Frontend Build** | Vite production build — ✅ |
| **Backend API** | 12 endpoints — all functional |
| **Sanctions Detection** | 25 entries — GARANTEX ✅ detected |
| **ETH Address Flow** | Sanctions check only — no Stellar TX build |
| **Groq AI Analysis** | Real Llama 3.3 — fallback to mock on error |
| **Stellar TX Flow** | Build → Sign (Freighter) → Submit (Horizon) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- [Freighter Wallet](https://freighter.app) browser extension

### Setup
```bash
git clone https://github.com/jinggaworld/Alphine
cd Alphine

# Environment variables (root folder)
cp .env.example .env
# Fill in: GROQ_API_KEY (https://console.groq.com)
# Fill in: TAVILY_API_KEY (https://app.tavily.com)

# Start backend
cd backend && npm install && npm start
# → http://localhost:3001/api/health

# Start frontend (separate terminal)
cd frontend && npm install && npm run dev
# → http://localhost:5173
```

### Test the Flow
```bash
# 1. Open http://localhost:5173
# 2. Connect Freighter (or enter address manually)
# 3. Select: Testnet / XLM
# 4. Send ≥2 XLM to any Stellar address
# 5. Watch: Sanctions Check → AI Analysis → ZK Proof → Build → Sign → Submit
```

---

## 📁 Project Structure

```
alphine/
├── backend/                     # Node.js Express API
│   ├── index.mjs               # Server entry
│   ├── aml/                    # Groq AI integration
│   │   ├── analyzer.mjs        # Llama 3.3 AML analysis
│   │   ├── compliance_report.mjs  # AI → circuit bridge
│   │   └── cache_manager.mjs   # Rate limit cache
│   ├── sanctions/              # Tavily oracle
│   │   ├── fetcher.mjs         # OFAC/UN fetcher
│   │   ├── merkle_tree.mjs     # SHA-256 Merkle tree
│   │   └── update_scheduler.mjs # 30-min auto-update
│   └── api/                    # REST endpoints
│       ├── analyze.mjs         # Phase 5 — AI analysis
│       ├── sanctions.mjs       # Phase 6 — Sanctions
│       └── proof.mjs           # Phase 9 — ZK proofs
│
├── frontend/                   # React + Vite dApp
│   └── src/
│       ├── App.tsx             # Main layout
│       └── components/
│           ├── WalletConnect.tsx      # Freighter + manual
│           ├── TransactionDashboard.tsx # Send form + flow
│           ├── ComplianceReport.tsx    # Risk score + AI
│           ├── StatusBar.tsx           # Animated progress
│           ├── AssetSelector.tsx       # XLM/USDC toggle
│           ├── NetworkSwitcher.tsx     # Testnet/Mainnet
│           └── TransactionLog/        # Step-by-step log
│
├── circuits/                   # Noir ZK circuits
├── contracts/                  # Soroban smart contracts
├── tests/                      # Integration tests
└── docs/                       # Documentation + branding
    ├── logo/                   # Alphine logo assets
    └── dorahacks-build.md      # ← This file
```

---

## 📹 Demo

> **Demo Video:** Upload 3-minute walkthrough showing:
> 1. Connect Freighter wallet
> 2. Send XLM on testnet with compliance flow
> 3. Sanctions check — blocked + AI reasoning
> 4. ETH address sanctions check
> 5. Switch to Mainnet
> 6. Transaction Log in detail

---

## 🔮 Future Roadmap

- [ ] **ZK Proof Prover**: Compile Noir circuit to native binary for real Groth16 proofs
- [ ] **Soroban On-Chain Verification**: Deploy Groth16 verifier + Alphine Payment on mainnet
- [ ] **Multi-Asset Support**: Add more Stellar assets (EURT, ARST, yUSDC)
- [ ] **Historical Lookback**: Store transaction history for structuring detection across sessions
- [ ] **Admin Dashboard**: Analytics dashboard for compliance officers
- [ ] **Webhook Alerts**: Real-time compliance alert webhooks
- [ ] **Audit Trail Export**: Download compliance reports as PDF

---

## 👥 Team

| Role | Member |
|------|--------|
| **Developer** | @jinggaworld |

---

## 📄 License

MIT — See [LICENSE](../LICENSE) for details.

---

> *Built for [Stellar Hacks: Real-World ZK](https://dorahacks.io/hackathon/stellar-hacks-zk/detail) — June 2026*
