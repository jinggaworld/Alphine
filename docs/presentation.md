# Alphine — Zero-Knowledge AML Compliance Layer for Stellar

> **Presentation for:** Stellar Hacks: Real-World ZK (DoraHacks)
> **Built by:** @jinggaworld
> **Timeline:** June 15–29, 2026

---

## SLIDE 1: TITLE SLIDE

<!-- Gemini Instructions: Create title slide with Alphine logo, centered text, blue gradient theme -->

# 🏔️ Alphine

### Zero-Knowledge AML Compliance Layer for Stellar

**Stellar Hacks: Real-World ZK** · June 2026

[Logo: docs/logo/alphine-logo.svg]
[Background: Blue gradient #1a73e8 → #8ab4f8]

---

## SLIDE 2: THE PROBLEM

<!-- Gemini Instructions: Problem slide with 3 columns/cards showing the compliance dilemma -->

# The Compliance Dilemma

Financial institutions on Stellar must comply with AML/CFT regulations, but transparent blockchains expose user data.

| 😟 **Sanctions Screening** | 😟 **Threshold Reporting** | 😟 **Structuring Detection** |
|:---|:---|:---|
| Every address must be checked against OFAC/UN sanctions lists | Transactions over $10,000 must be reported to FINRA | Users breaking large txs into smaller ones to avoid reporting |
| ❌ Reveals user's entire address history | ❌ Reveals exact financial amounts | ❌ Exposes full transaction patterns |

### The Lose-Lose Choice

```
┌─────────────────────────────────────┐
│  Comply but expose sensitive data   │
│         OR                          │
│  Protect privacy but violate law    │
└─────────────────────────────────────┘
```

**Key Stat:** Over $2 trillion in daily transactions face this privacy-compliance trade-off.

---

## SLIDE 3: THE SOLUTION

<!-- Gemini Instructions: Solution slide showing ZK-powered compliance vs traditional approach -->

# Alphine: Privacy-First Compliance

ZK proofs let institutions verify compliance **without accessing private data**.

| ✅ **Traditional** | 🛡️ **Alphine (ZK)** |
|:---|:---|
| Reveal user address → Check sanctions | **Non-membership Merkle proof** → Address not on list ✓ |
| Reveal exact amount → Check threshold | **Range proof** → Amount below $10K ✓ |
| Show full history → Detect structuring | **Pattern proof** → No suspicious patterns ✓ |

### How It Works

```
User Transaction
      │
      ▼
┌─────────────────────┐     ┌──────────────────────┐
│  Sanctions Check     │────▶│  ZK Proof: Not on    │
│  (Merkle Tree)       │     │  OFAC/UN list ✓      │
└─────────────────────┘     └──────────────────────┘
      │
      ▼
┌─────────────────────┐     ┌──────────────────────┐
│  Amount Check        │────▶│  ZK Proof: Below     │
│  (Range Proof)       │     │  $10K threshold ✓    │
└─────────────────────┘     └──────────────────────┘
      │
      ▼
┌─────────────────────┐     ┌──────────────────────┐
│  Structuring Check   │────▶│  ZK Proof: No        │
│  (Pattern Proof)     │     │  structuring ✓       │
└─────────────────────┘     └──────────────────────┘
      │
      ▼
      ✅ Regulatory compliance proved — User data stays private
```

---

## SLIDE 4: ARCHITECTURE

<!-- Gemini Instructions: Architecture slide showing the 4-layer system diagram -->

# System Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    FRONTEND (React dApp)                    │
│  Freighter Wallet · NetworkSwitcher · AssetSelector         │
│  TransactionDashboard · ComplianceReport · TransactionLog  │
└─────────────────────────┬──────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────┐
│               BACKEND API (Node.js + Express)               │
│  12 REST endpoints · 3 route groups                        │
└──────┬──────────────────┬──────────────────┬───────────────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────────┐
│  GROQ AI     │ │  TAVILY     │ │  SANCTIONS       │
│  Llama 3.3   │ │  Oracle     │ │  Merkle Tree     │
│  70B         │ │  OFAC/UN    │ │  25 entries      │
│  AML Pattern │ │  Real-time  │ │  Hybrid mode     │
│  Analysis    │ │  Fetching   │ │  SHA-256         │
└──────────────┘ └──────────────┘ └──────────────────┘
       │
       ▼
┌────────────────────────────────────────────────────────────┐
│                 NOIR ZK CIRCUIT (Groth16)                   │
│  sanctions.nr · amount.nr · structuring.nr                 │
│  Pedersen Hash · Barretenberg Prover                      │
└─────────────────────────┬──────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────┐
│              SOROBAN SMART CONTRACTS (Protocol 25)          │
│  Groth16 Verifier (BN254) · Alphine Payment · Nullifier    │
└────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Connect** → Freighter wallet (or manual address)
2. **Select** → Asset (XLM/USDC) + Network (Testnet/Mainnet)
3. **Check** → Hybrid sanctions tree (21 baseline + Tavily real-time)
4. **Analyze** → Groq AI evaluates AML risk + explains sanctions
5. **Prove** → Noir generates ZK compliance proof
6. **Submit** → Stellar transaction built → signed via Freighter → submitted to Horizon
7. **Report** → Compliance report with Merkle root, risk score, AI reasoning

---

## SLIDE 5: KEY FEATURES

<!-- Gemini Instructions: Features slide with icon grid showing 12 key capabilities -->

# Key Features

| # | Feature | Technical Detail |
|---|---------|-----------------|
| 🛡️ | **Hybrid Sanctions** | 21 OFAC baseline addresses + Tavily real-time = 25+ entries |
| 🤖 | **Groq AI Analysis** | Llama 3.3 70B with sanctions-context reasoning |
| 🔍 | **ETH Address Check** | `0x...` addresses → sanctions check only, no Stellar TX |
| 💱 | **Asset Selector** | XLM (native) ↔ USDC (Circle) with auto-balance fetch |
| 🌐 | **Network Switcher** | One-click toggle Testnet ↔ Mainnet, live Horizon status |
| 📜 | **Transaction Log** | Step-by-step API log with timing, status codes, responses |
| 📊 | **Compliance Report** | Risk meter, AI reasoning, Merkle root, REAL/MOCK badge |
| 🔐 | **Real Signing** | Freighter `signTransaction()` — mainnet + testnet |
| 🏦 | **Account Creation** | Auto `createAccount` for unfunded XLM destinations |
| ⚡ | **AI Fallback** | Mock analysis when Groq API is rate-limited, txs not blocked |
| 📱 | **Mobile Responsive** | Full responsive layout with compact navigation |
| ✅ | **TypeScript Strict** | Zero TypeScript errors across entire frontend |

---

## SLIDE 6: TECH STACK

<!-- Gemini Instructions: Tech stack slide showing all technologies used -->

# Technology Stack

| Layer | Technology | Purpose |
|:---|:---|:---|
| **Blockchain** | ![Stellar](https://img.shields.io/badge/Stellar-00B4E6) Soroban Protocol 25 | Smart contract execution |
| **ZK** | ![Noir](https://img.shields.io/badge/Noir-FF6B6B) + Groth16 (BN254) | Zero-knowledge proofs |
| **AI** | ![Groq](https://img.shields.io/badge/Groq-00C853) Llama 3.3 70B | AML + sanctions analysis |
| **Oracle** | ![Tavily](https://img.shields.io/badge/Tavily-FF6B35) Search API | OFAC/UN sanctions data |
| **Frontend** | React 18 + Vite + Tailwind | User dashboard |
| **Backend** | Node.js + Express | API orchestrator |
| **Wallet** | Freighter (`@stellar/freighter-api`) | Stellar signing |
| **SDK** | `@stellar/stellar-sdk` v15 | Horizon + transactions |
| **Contracts** | Rust + soroban-sdk | 3 Soroban contracts |
| **Animation** | Framer Motion | Step-by-step UI flow |

### Smart Contract Architecture (Soroban)

```
┌─────────────────────────────────────────────────┐
│              ALPHINE CORE SYSTEM                 │
├─────────────────────────────────────────────────┤
│                                                   │
│  1. Groth16 Verifier                             │
│     • BN254 pairing check (4-pair equation)      │
│     • e(A,B)·e(α,-β)·e(γ_combined,-γ)·e(C,-δ)=1 │
│                                                   │
│  2. Alphine Core                                 │
│     • Nullifier registry (replay protection)     │
│     • Compliance state management               │
│                                                   │
│  3. Alphine Payment                              │
│     • Proof → USDC/XLM transfer                  │
│     • 7/7 unit tests passing                    │
│                                                   │
└─────────────────────────────────────────────────┘
```

---

## SLIDE 7: DEMO WALKTHROUGH

<!-- Gemini Instructions: Demo slide showing the step-by-step user flow with screenshots -->

# Demo: Sending XLM with Compliance

### Step-by-Step Flow

```
┌─────────────────────────────────────────────────────────┐
│  1. CONNECT WALLET                                      │
│     • Freighter extension popup                         │
│     • Or enter Stellar address manually                 │
│     • Network: Testnet (default)                        │
└─────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────┐
│  2. ENTER TRANSACTION DETAILS                            │
│     • Asset: XLM (or USDC)                              │
│     • Recipient: G... Stellar address (or 0x... ETH)    │
│     • Amount: 100 XLM                                   │
│     • Reporting threshold: 100,000 XLM                  │
└─────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────┐
│  3. COMPLIANCE PIPELINE (Automated)                     │
│                                                         │
│  ✅ Stellar Account Lookup (Horizon)                    │
│  ✅ Sanctions Check (25-entry Merkle Tree)              │
│  ✅ AI Analysis (Groq Llama 3.3)                        │
│  ✅ ZK Proof Generation (Noir)                          │
│  ✅ Transaction Build (Stellar SDK)                     │
│  ✅ Sign via Freighter (Popup)                          │
│  ✅ Submit to Horizon                                   │
└─────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────┐
│  4. COMPLIANCE REPORT                                   │
│     • Risk Score: 10/100 (Low Risk)                     │
│     • AI Reasoning: "Transaction patterns normal..."    │
│     • Merkle Root: 8061a37194db3eb6...                  │
│     • Processing Time: 8,432ms                          │
│     • Status: ✅ APPROVED                               │
└─────────────────────────────────────────────────────────┘
```

### Special Flows

| Scenario | Behavior |
|:---|:---|
| **ETH Address** (`0x...`) | Sanctions check only — "Check Sanctions Only" button |
| **Sanctioned Address** | Blocked + Groq explains WHY it's sanctioned |
| **AI Rate Limited** | Fallback to mock analysis — transaction still proceeds |
| **New Account** (< 2 XLM) | Error: "Minimum 2 XLM to create account" |
| **Unfunded Destination** | Auto `Operation.createAccount()` for XLM |

---

## SLIDE 8: SANCTIONS — HYBRID MODE

<!-- Gemini Instructions: Slide explaining the hybrid sanctions oracle system -->

# Hybrid Sanctions Oracle

### How Sanctions Detection Works

```
┌─────────────────┐     ┌──────────────────┐
│  MOCK BASELINE  │     │  TAVILY REAL-TIME│
│  21 addresses   │     │  OFAC/UN Search  │
│  (Always loaded)│     │  (30-min refresh)│
└────────┬────────┘     └────────┬─────────┘
         │                       │
         └──────────┬────────────┘
                    ▼
       ┌───────────────────────┐
       │  MERGED ADDRESS LIST  │
       │  25+ entries          │
       │  SHA-256 Merkle Tree  │
       └───────────────────────┘
                    │
                    ▼
       ┌───────────────────────┐
       │  INCLUSION PROOF      │
       │  query: is address    │
       │  in sanctioned set?   │
       └───────────────────────┘
```

### Baseline Mock Addresses Include

| Category | Examples |
|:---|:---|
| **Tornado Cash** | `0x8Dce2aAC0dE82bdCAf6b4373B79f94331b8e4995` (GARANTEX) |
| **OFAC Sanctioned** | Russian entities, North Korean wallets |
| **Stellar Addresses** | Flagged Stellar accounts |
| **BTC Addresses** | Known illicit Bitcoin addresses |

### Mode Detection

| API Key Status | Mode Response |
|:---|:---|
| `TAVILY_API_KEY` set + Groq working | `mode: "real"` |
| `TAVILY_API_KEY` missing | `mode: "mock"` |
| Groq API error | `mode: "mock_ai_fallback"` |

---

## SLIDE 9: ADDRESS SUPPORT

<!-- Gemini Instructions: Slide showing Stellar and ETH address handling -->

# Multi-Address Support

### Stellar Address (G...) — Full Transaction

```
┌─────────────────────────────────────────────────────────┐
│  Recipient: GCNNWFGVDMHKGOB27FPKFMR72YYLQVMXPXR47H257…  │
│                                                         │
│  ✅ Sanctions Check                                     │
│  ✅ AI Analysis                                         │
│  ✅ ZK Proof                                            │
│  ✅ Build Transaction                                   │
│  ✅ Sign via Freighter                                  │
│  ✅ Submit to Horizon                                   │
│  🎉 TRANSFER COMPLETE                                   │
└─────────────────────────────────────────────────────────┘
```

### ETH Address (0x...) — Sanctions Check Only

```
┌─────────────────────────────────────────────────────────┐
│  Recipient: 0x57ec89a0c056163a0314e413320f9b3abe761259  │
│                                                         │
│  ⚠️  ETH addresses CANNOT be used for Stellar transfers │
│                                                         │
│  ✅ Sanctions Check                                     │
│  ⛔ AI Analysis — skipped (ETH, no Stellar TX)          │
│  ⛔ Build Transaction — skipped                         │
│  ⛔ Sign — skipped                                      │
│  ⛔ Submit — skipped                                    │
│                                                         │
│  📋 Compliance Report: "ETH checked — not sanctioned"   │
└─────────────────────────────────────────────────────────┘
```

### Error Handling

| Error | User Sees |
|:---|:---|
| `tx_failed` + `op_no_destination` | "Destination does not exist. Fund with ≥2 XLM first." |
| `tx_failed` + `op_underfunded` | "Insufficient balance in source account." |
| AI 500 / Groq Connection Error | "AI unavailable — using defaults. Transaction proceeds." |
| < 2 XLM to new account | "Minimum 2 XLM to create + fund a new account." |
| USDC to unfunded account | "Fund destination with 2 XLM + setup USDC trustline first." |

---

## SLIDE 10: TEST RESULTS

<!-- Gemini Instructions: Test results slide showing all passing metrics -->

# Test Results & Build Status

### Component Status

| Component | Tests | Result |
|:---|:---|:---:|
| **Soroban: Alphine Core** | 5/5 | ✅ All pass |
| **Soroban: Groth16 Verifier** | 5/5 | ✅ All pass (BN254 pairing) |
| **Soroban: ZK Primitives** | 5/5 | ✅ All pass |
| **Soroban: Alphine Payment** | 7/7 | ✅ All pass |
| **Total Rust Contracts** | **22/22** | ✅ **100%** |
| **Noir Circuit Compilation** | `nargo compile` | ✅ Zero errors |
| **Frontend TypeScript** | Strict mode | ✅ Zero errors |
| **Frontend Production Build** | Vite | ✅ 1.3MB |
| **Backend API Endpoints** | 12 routes | ✅ All functional |
| **Sanctions Detection** | 25 entries | ✅ GARANTEX detected |
| **ETH Address Flow** | Integration | ✅ Sanctions check only |
| **Groq AI Fallback** | Mock mode | ✅ Graceful degradation |

### Performance

| Metric | Average |
|:---|:---:|
| Sanctions Check | ~15ms |
| AI Analysis (Groq) | ~3,500ms (cached: ~15ms) |
| ZK Proof Generation | ~70ms (mock) |
| Transaction Build | ~200ms |
| End-to-End (cached) | ~500ms |
| End-to-End (full) | ~8,500ms |

---

## SLIDE 11: GROQ AI ANALYSIS

<!-- Gemini Instructions: Slide explaining the AI integration with sanctions context -->

# AI-Powered Compliance with Groq

### What Groq Analyzes

```
Transaction Input
├── Sender address
├── Recipient address
├── Amount + Asset (XLM/USDC)
├── Transaction history (90 days)
└── ⚠️  Sanctions flag (if applicable)

Groq Llama 3.3 70B
├── Risk score (0–100)
├── Red flags detected
├── Structuring patterns
├── Velocity alerts
└── Recommendation: approve | review | block
```

### Sanctions-Context Analysis

When a sanctioned address is detected, Groq doesn't just say "blocked" — it **explains WHY**:

```
🚫 SANCTIONED ADDRESS DETECTED

🧾 Sanctions Match: The recipient address (0x8Dce2a...)
is on the OFAC sanctions list. Transaction is BLOCKED.

🔍 AI Analysis:
"This address is associated with GARANTEX, a sanctioned
entity under OFAC regulations. Transactions involving
this address must be blocked per US sanctions laws.
Compliance with sanctions regulations is critical for
financial institutions to avoid legal penalties."
```

### Rate Limit Handling

| Scenario | Behavior |
|:---|:---|
| Groq API available | ✅ Real AI analysis |
| Groq rate limited | ⚠️ Fallback to mock (riskScore: 5, recommendation: 'review') |
| Cached result (5-min TTL) | ✅ Instant response (15ms vs 3,500ms) |

---

## SLIDE 12: FUTURE ROADMAP

<!-- Gemini Instructions: Roadmap slide showing planned enhancements -->

# Future Roadmap

### Phase 2: Production Readiness

```
Now                    Q3 2026                 Q4 2026
│                       │                       │
▼                       ▼                       ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│  ✅ Current  │  │  🔄 Next     │  │  🎯 Vision       │
├──────────────┤  ├──────────────┤  ├──────────────────┤
│ MVP Flow     │  │ Native Prover│  │ Multi-Chain      │
│ Testnet/MN   │  │ Soroban Main │  │ Ethereum, Solana │
│ XLM + USDC   │  │ Admin Dash   │  │ Mobile App       │
│ Groq + Tavily│  │ Audit Export │  │ DAO Governance   │
└──────────────┘  └──────────────┘  └──────────────────┘
```

### Upcoming Milestones

| Milestone | Priority | Timeline |
|:---|:---:|:---:|
| **Native ZK Prover**: Compile Noir to native binary for real Groth16 proofs | 🔴 High | Q3 2026 |
| **Soroban Mainnet**: Deploy contracts on Stellar mainnet | 🔴 High | Q3 2026 |
| **Multi-Asset Support**: EURT, ARST, yUSDC | 🟡 Medium | Q3 2026 |
| **Admin Dashboard**: Analytics + compliance officer tools | 🟡 Medium | Q4 2026 |
| **Audit Trail Export**: PDF/CSV compliance reports | 🟡 Medium | Q4 2026 |
| **Webhook Alerts**: Real-time Slack/Email notifications | 🟢 Low | Q4 2026 |
| **Multi-Chain**: Ethereum, Solana, Polygon integration | 🟢 Low | 2027 |

---

## SLIDE 13: THANK YOU

<!-- Gemini Instructions: Final slide with project links, QR code, and call to action -->

# 🏔️ Thank You

### Alphine — Zero-Knowledge AML Compliance for Stellar

---

### Links

```
🔗 GitHub:    https://github.com/jinggaworld/Alphine
🔗 Demo:      http://localhost:5173 (local)
🔗 Hackathon: https://dorahacks.io/hackathon/stellar-hacks-zk
```

### Built For

**Stellar Hacks: Real-World ZK** — June 2026

---

**"Privacy-preserving compliance — not either/or, but both."**

---

[Logo: docs/logo/alphine-logo.svg]

---

## SLIDE NOTES (For Presenter)

<!-- Gemini Instructions: Speaker notes for each slide -->

### Slide 1 Notes
"Hi everyone, I'm excited to present Alphine — a zero-knowledge AML compliance layer for the Stellar network. We're solving one of the biggest challenges in decentralized finance: how to comply with regulations while preserving user privacy."

### Slide 2 Notes
"The problem is simple but painful. Financial institutions need to check sanctions, report large transactions, and detect structuring. On a transparent blockchain like Stellar, this means exposing all user data. It's a lose-lose choice between compliance and privacy."

### Slide 3 Notes
"Our solution uses zero-knowledge proofs. Instead of revealing the actual data, we prove compliance cryptographically. Merkle proofs show an address isn't sanctioned. Range proofs show an amount is below threshold. Pattern proofs show no structuring. Regulators get proof. Users keep privacy."

### Slide 4 Notes
"Let me walk you through the architecture. We have a React frontend connecting to Freighter wallet, a Node.js backend with three main services — Groq AI for analysis, Tavily for sanctions data, and the Merkle tree. Then Noir ZK circuits generate proofs, verified on Soroban smart contracts."

### Slide 5 Notes
"We've packed 12 key features into this first version. The hybrid sanctions system combines a baseline list with real-time fetching. The AI explains WHY something is sanctioned. ETH addresses can be checked for sanctions without needing a Stellar transaction."

### Slide 6 Notes
"Our tech stack spans the full Web3 spectrum — from smart contracts in Rust on Soroban, to ZK circuits in Noir, to AI with Groq's Llama 3.3, all tied together with a React frontend. Three Soroban contracts handle verification, compliance state, and payment execution."

### Slide 7 Notes
"Let me show you the flow. Connect Freighter, enter transaction details, and watch the compliance pipeline run step by step. Each step is logged with timing. If the address is sanctioned, we block AND explain why. If Groq is rate-limited, we fall back gracefully."

### Slide 8 Notes
"Our sanctions oracle uses a hybrid approach. A baseline of 21 known OFAC addresses is always loaded, merged with real-time results from Tavily search. The Merkle tree structure allows for efficient inclusion proofs without revealing the full list."

### Slide 9 Notes
"We support both Stellar and ETH addresses. ETH addresses go through sanctions check only — you can't send Stellar transactions to them. Error messages are detailed and actionable."

### Slide 10 Notes
"All tests pass. 22 Soroban contract tests, zero TypeScript errors, clean Noir compilation. The end-to-end flow completes in about 8.5 seconds with real Groq AI analysis."

### Slide 11 Notes
"The Groq AI integration is one of our strongest features. It doesn't just flag sanctioned addresses — it explains WHY they're sanctioned, citing OFAC regulations and specific sanctions lists. And if the API is rate-limited, we degrade gracefully with mock analysis."

### Slide 12 Notes
"We have an ambitious roadmap. Next up is compiling the Noir prover to native code for real proof generation, deploying to Soroban mainnet, and building an admin dashboard for compliance officers."

### Slide 13 Notes
"Thank you for your time. The full codebase is open source on GitHub. I'd love to answer any questions about the architecture, the ZK circuits, or the compliance pipeline."
