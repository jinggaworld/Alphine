/**
 * Compliance Report Generator
 * Phase 5 — Bridges Groq AI analysis → ZK circuit inputs
 * 
 * Takes the AI analysis output and maps it to the format
 * expected by the Noir ZK circuit for proof generation.
 */
import crypto from 'crypto';

export class ComplianceReportGenerator {
    constructor(amlAnalyzer) {
        this.amlAnalyzer = amlAnalyzer;
    }

    /**
     * Generate a full compliance report for a transaction
     * @param {Object} transaction - { from, to, amount, timestamp }
     * @param {Array} userHistory - Historical transactions
     * @returns {Object} Report with circuit inputs + compliance info
     */
    async generateReport(transaction, userHistory = []) {
        // Step 1: AI analyzes the transaction
        const analysis = await this.amlAnalyzer.analyzeTransaction(
            transaction,
            userHistory
        );

        // Step 2: Deep structuring analysis if flagged
        let structuringDetails = null;
        if (analysis.structuring_detected || analysis.risk_score > 50) {
            const historyWithDays = userHistory.map((tx, i) => ({
                ...tx,
                daysApart: i > 0
                    ? Math.round((tx.timestamp - userHistory[i - 1].timestamp) / 86400)
                    : 0,
            }));
            structuringDetails = await this.amlAnalyzer.detectStructuring(
                historyWithDays
            );
        }

        // Step 3: Map AI analysis to ZK circuit inputs
        return {
            // For the ZK circuit
            circuitInputs: {
                threshold: this._toCircuitField(
                    analysis.circuit_inputs?.threshold || 10000
                ),
                timeWindow: this._toCircuitField(
                    analysis.circuit_inputs?.time_window || 90
                ),
                currentTimestamp: this._toCircuitField(
                    analysis.circuit_inputs?.current_timestamp || Math.floor(Date.now() / 1000)
                ),
                numSuspiciousTx: this._toCircuitField(
                    analysis.circuit_inputs?.num_suspicious_tx || 0
                ),
            },

            // For the compliance dashboard
            compliance: {
                riskScore: analysis.risk_score,
                redFlags: analysis.red_flags || [],
                recommendation: analysis.recommendation || 'approve',
                structuringDetected: analysis.structuring_detected || false,
                velocityAlerts: analysis.velocity_alerts || [],
                needsManualReview: (analysis.recommendation || 'approve') !== 'approve',
            },

            // For audit trail
            auditLog: {
                timestamp: new Date().toISOString(),
                aiModel: this.amlAnalyzer.model || 'mock',
                analysisId: crypto.randomUUID(),
                transactionAmount: transaction.amount,
                transactionFrom: transaction.from,
                transactionTo: transaction.to,
            }
        };
    }

    /**
     * Convert a value to the format expected by the Noir circuit
     */
    _toCircuitField(value) {
        if (typeof value === 'bigint') return value.toString();
        if (typeof value === 'number') return BigInt(Math.round(value)).toString();
        return String(value);
    }
}
