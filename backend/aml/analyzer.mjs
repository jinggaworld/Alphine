/**
 * AML Transaction Analyzer
 * Phase 5 — Groq AI Integration for AML Pattern Detection
 * 
 * Uses Groq's Llama 3.3 70B to analyze transaction patterns,
 * detect structuring, and output structured compliance reports
 * that feed into the ZK circuit.
 */
import Groq from 'groq-sdk';

export class AMLTransactionAnalyzer {
    constructor(apiKey) {
        if (!apiKey) {
            console.warn('⚠️  No GROQ_API_KEY provided — using mock mode');
            this.mockMode = true;
        } else {
            this.groq = new Groq({ apiKey });
            this.mockMode = false;
        }
        this.model = 'llama-3.3-70b-versatile';
    }

    /**
     * Analyze a single transaction for AML red flags
     * @param {Object} transaction - { from, to, amount, timestamp }
     * @param {Array} userHistory - Array of historical transactions
     * @returns {Object} Structured compliance assessment
     */
    async analyzeTransaction(transaction, userHistory = []) {
        if (this.mockMode) {
            return this._mockAnalysis(transaction, userHistory);
        }

        const prompt = this._buildAnalysisPrompt(transaction, userHistory);

        const completion = await this.groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are an AML (Anti-Money Laundering) compliance officer AI.
Analyze cryptocurrency transactions for suspicious patterns.
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
  "country_risk": "low" | "medium" | "high",
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
            temperature: 0.1,
            response_format: { type: 'json_object' },
        });

        return JSON.parse(completion.choices[0].message.content);
    }

    /**
     * Batch analyze for structuring patterns
     */
    async detectStructuring(transactions, threshold = 10000) {
        if (this.mockMode) {
            return this._mockStructuring(transactions);
        }

        const prompt = {
            transactions: transactions.map(tx => ({
                amount: parseFloat(tx.amount),
                timestamp: tx.timestamp,
                days_apart: tx.daysApart,
            })),
            threshold,
            suspicious_ratio: 0.8,
            time_window_days: 90,
        };

        const completion = await this.groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `Analyze this transaction pattern for structuring (smurfing).
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

    _buildAnalysisPrompt(transaction, userHistory) {
        return `Analyze this Stellar USDC transaction for AML compliance:

## Current Transaction
- From: ${transaction.from || 'unknown'}
- To: ${transaction.to || 'unknown'}
- Amount: ${transaction.amount} USDC
- Timestamp: ${transaction.timestamp || Date.now()}
- Asset: USDC (Stellar)

## User Transaction History (Last 90 days)
${JSON.stringify(userHistory.slice(0, 20), null, 2)}

## Compliance Rules to Apply
1. Structuring Detection: Are there multiple transactions just under $10,000?
2. Velocity Check: Are there rapid successive transactions?
3. Pattern Analysis: Does this deviate from user's normal behavior?
4. Threshold Check: Is amount ≥ $10,000 (FINRA reporting threshold)?

Return JSON only.`;
    }

    _mockAnalysis(transaction, userHistory) {
        const amount = parseFloat(transaction.amount) || 0;
        const riskScore = amount > 9000 ? 60 : amount > 5000 ? 25 : 10;
        const nearThreshold = amount > 8000 && amount < 10000;

        return {
            risk_score: riskScore,
            red_flags: nearThreshold ? ['Amount close to reporting threshold'] : [],
            structuring_detected: false,
            structuring_details: {
                suspicious_tx_count: 0,
                time_window_days: 90,
                total_amount_near_threshold: 0
            },
            velocity_alerts: [],
            country_risk: 'low',
            recommendation: riskScore > 50 ? 'review' : 'approve',
            circuit_inputs: {
                threshold: 10000,
                time_window: 90,
                num_suspicious_tx: 0,
                current_timestamp: Math.floor(Date.now() / 1000)
            }
        };
    }

    _mockStructuring(transactions) {
        const suspiciousCount = transactions.filter(tx =>
            parseFloat(tx.amount) > 8000 && parseFloat(tx.amount) < 10000
        ).length;

        return {
            structuring_detected: suspiciousCount > 3,
            confidence: Math.min(suspiciousCount * 20, 95),
            suspicious_clusters: [],
            recommendation: suspiciousCount > 3 ? 'block' : 'approve'
        };
    }
}
