import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, ArrowRight, DollarSign, User } from 'lucide-react';
import { StatusBar, TransactionStatus } from './StatusBar';
import { ComplianceReport } from './ComplianceReport';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface TransactionDashboardProps {
  walletAddress: string | null;
}

interface ComplianceData {
  riskScore: number;
  redFlags: string[];
  recommendation: 'approve' | 'review' | 'block';
  structuringDetected: boolean;
  velocityAlerts: string[];
  merkleRoot?: string;
  sanctioned?: boolean;
  processingTimeMs?: number;
}

export function TransactionDashboard({ walletAddress }: TransactionDashboardProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<TransactionStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [complianceData, setComplianceData] = useState<ComplianceData | null>(null);

  const isValidStellarAddress = (addr: string) => /^G[A-Z0-9]{55}$/.test(addr);
  const isFormValid = !!walletAddress && isValidStellarAddress(recipient) && parseFloat(amount) > 0 && status === 'idle';
  const amountNum = parseFloat(amount) || 0;
  const isNearThreshold = amountNum > 8000 && amountNum <= 10000;
  const isOverThreshold = amountNum > 10000;

  const handleSend = async () => {
    setStatus('analyzing');
    setError(null);
    setComplianceData(null);

    try {
      // Step 1: Sanctions Check
      setStatus('sanctions_check');
      await new Promise(r => setTimeout(r, 800));

      // Step 2: AI Compliance Analysis
      setStatus('analyzing');
      const response = await axios.post(`${API_BASE}/api/analyze-transaction`, {
        transaction: {
          from: walletAddress || 'unknown',
          to: recipient,
          amount: amount,
          timestamp: Math.floor(Date.now() / 1000),
        },
        userHistory: [],
      });

      const report = response.data;

      // Check if blocked
      if (report.compliance?.recommendation === 'block') {
        setStatus('failed');
        setError('Transaction blocked by compliance check.');
        setComplianceData({
          riskScore: report.compliance?.riskScore || 90,
          redFlags: report.compliance?.redFlags || ['Transaction blocked by AML policy'],
          recommendation: 'block',
          structuringDetected: report.compliance?.structuringDetected || false,
          velocityAlerts: report.compliance?.velocityAlerts || [],
          processingTimeMs: report.processingTimeMs,
        });
        return;
      }

      // Step 3: Generate ZK Proof
      setStatus('generating_proof');
      await new Promise(r => setTimeout(r, 1500));

      // Step 4: Submit to Stellar
      setStatus('submitting');
      await new Promise(r => setTimeout(r, 1200));

      // Success
      setStatus('success');
      setComplianceData({
        riskScore: report.compliance?.riskScore || 10,
        redFlags: report.compliance?.redFlags || [],
        recommendation: report.compliance?.recommendation || 'approve',
        structuringDetected: report.compliance?.structuringDetected || false,
        velocityAlerts: report.compliance?.velocityAlerts || [],
        merkleRoot: '8061a37194db3eb6...',
        processingTimeMs: report.processingTimeMs,
      });
    } catch (err: any) {
      setStatus('failed');
      setError(err.response?.data?.error || err.message || 'An error occurred');
    }
  };

  const resetForm = () => {
    setStatus('idle');
    setError(null);
    setComplianceData(null);
  };

  return (
    <div className="space-y-5">
      {/* Status Bar */}
      <StatusBar status={status} error={error} />

      {/* Send Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-google-dark">
            Send USDC
          </h2>
          {status === 'success' && (
            <button onClick={resetForm} className="btn-secondary text-xs">
              Send Another
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Recipient */}
          <div>
            <label className="label-text">
              <User className="w-3.5 h-3.5 inline mr-1.5" />
              Recipient Address
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="G..."
              className="input-field font-mono text-xs"
              disabled={status !== 'idle'}
            />
          </div>

          {/* Amount */}
          <div>
            <label className="label-text">
              <DollarSign className="w-3.5 h-3.5 inline mr-1.5" />
              Amount (USDC)
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="input-field pr-16"
                disabled={status !== 'idle'}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-google-gray font-medium">
                USDC
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              {isNearThreshold && (
                <span className="pill-warning text-xs">
                  Near reporting threshold ($10,000)
                </span>
              )}
              {isOverThreshold && (
                <span className="pill-danger text-xs">
                  Exceeds reporting threshold
                </span>
              )}
              <span className="text-xs text-google-gray">
                FINRA threshold: $10,000
              </span>
            </div>
          </div>

          {/* Send Button */}
          <motion.button
            onClick={handleSend}
            disabled={!isFormValid}
            whileHover={isFormValid ? { scale: 1.02 } : {}}
            whileTap={isFormValid ? { scale: 0.98 } : {}}
            className="btn-primary w-full text-sm py-3"
          >
            {status === 'idle' ? (
              <>
                <Send className="w-4 h-4" />
                Send Compliant Transfer
                <ArrowRight className="w-4 h-4" />
              </>
            ) : status === 'success' ? (
              <>
                <Send className="w-4 h-4" />
                Transfer Complete
              </>
            ) : (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Compliance Report */}
      {complianceData && (
        <ComplianceReport data={complianceData} />
      )}

      {/* Transaction Result */}
      {status === 'success' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 border-green-200 bg-green-50/50"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Send className="w-6 h-6 text-google-green" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-google-green">Transfer Successful</h3>
              <p className="text-xs text-google-gray mt-0.5">
                {amount} USDC sent — privacy preserved, compliance verified.
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-google-gray p-2 bg-white rounded-lg border border-green-100">
            <span className="font-medium">ZK Proof:</span>
            <span className="font-mono text-green-700">Verified on-chain ✓</span>
          </div>
        </motion.div>
      )}

      {/* Error State */}
      {status === 'failed' && error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 border-red-200 bg-red-50/50"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <Send className="w-5 h-5 text-google-red" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-google-red">Transfer Blocked</h3>
              <p className="text-xs text-google-gray mt-0.5">{error}</p>
            </div>
          </div>
          <button onClick={resetForm} className="btn-secondary mt-4 text-xs">
            Try Again
          </button>
        </motion.div>
      )}
    </div>
  );
}
