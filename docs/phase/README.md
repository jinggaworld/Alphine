# Alphine 🏔️

## Zero-Knowledge AML Compliance Layer for Stellar

---

**Hackathon:** [Stellar Hacks: Real-World ZK](https://dorahacks.io/hackathon/stellar-hacks-zk/detail)
**Timeline:** June 15 – June 29, 2026
**Prize Pool:** $10,000 USD (in XLM)
**Tech Stack:** Stellar Soroban | Noir | Groq AI | Tavily | Rust | TypeScript | React

---

## 📋 Dokumentasi Lengkap

| File | Deskripsi |
|------|-----------|
| [`docs/phase/detailed.md`](./detailed.md) | Strategi, arsitektur, dan ide teknis Alphine |
| [`docs/phase/final-10-phase.md`](./final-10-phase.md) | **10 Phase Final Build — 0% → 100%** |

---

## 🎯 Alphine — Apa dan Mengapa?

**Alphine** adalah **ZK-Powered AML Compliance Layer** untuk Stellar. Solusi yang memungkinkan exchange, fintech, dan lembaga keuangan di ekosistem Stellar untuk:

- ✅ **Membuktikan compliance** (bukan sanctioned address, amount di bawah threshold, tidak ada structuring)
- ✅ **Tanpa mengorbankan privasi user** — ZK proof tidak mengungkap data sensitif
- ✅ **Verifikasi on-chain** via Soroban smart contract, bukan off-chain oracle

### Arsitektur Tingkat Tinggi

```
USER (kirim USDC cross-border)
 │
 ├── 1. Groq AI → Analisis AML pattern + deteksi structuring
 ├── 2. Tavily → Fetch real-time sanctions list (OFAC, UN)
 ├── 3. Noir Circuit → Generate ZK Proof (privacy-preserving)
 └── 4. Soroban Contract → Verify proof + eksekusi transaksi

EXCHANGE / REGULATOR → Terima proof kriptografik, tidak simpan data user
```

### API Gratis yang Digunakan

| API | Fungsi | Free Tier |
|-----|--------|-----------|
| **Groq** | AI analisis transaksi + deteksi structuring | 14,400 req/hari |
| **Tavily** | Fetch OFAC sanctions list real-time | 1,000/bulan |
| **Stellar Horizon** | Baca history transaksi on-chain | Gratis |
| **Soroban Testnet** | Deploy verifier + payment contract | Gratis |
| **Noir (nargo)** | Generate ZK proof | Open source |
