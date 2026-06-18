import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Wallet, Search, Shield, FileCode, Send } from 'lucide-react';

export type TransactionStatus =
  | 'idle'
  | 'connect_wallet'
  | 'analyzing'
  | 'sanctions_check'
  | 'generating_proof'
  | 'submitting'
  | 'success'
  | 'failed';

interface StatusBarProps {
  status: TransactionStatus;
  error?: string | null;
}

const stepConfig: Record<TransactionStatus, {
  icon: typeof Wallet;
  label: string;
  color: string;
  bg: string;
  border: string;
}> = {
  idle: { icon: Wallet, label: 'Ready', color: 'text-google-gray', bg: 'bg-gray-50', border: 'border-gray-200' },
  connect_wallet: { icon: Wallet, label: 'Connect Wallet', color: 'text-google-blue', bg: 'bg-blue-50', border: 'border-blue-200' },
  analyzing: { icon: Search, label: 'AI analyzing transaction...', color: 'text-google-blue', bg: 'bg-blue-50', border: 'border-blue-200' },
  sanctions_check: { icon: Shield, label: 'Checking sanctions lists...', color: 'text-google-yellow', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  generating_proof: { icon: FileCode, label: 'Generating ZK proof...', color: 'text-google-blue', bg: 'bg-blue-50', border: 'border-blue-200' },
  submitting: { icon: Send, label: 'Submitting to Stellar...', color: 'text-google-blue', bg: 'bg-blue-50', border: 'border-blue-200' },
  success: { icon: CheckCircle, label: 'Transaction approved!', color: 'text-google-green', bg: 'bg-green-50', border: 'border-green-200' },
  failed: { icon: XCircle, label: 'Transaction failed', color: 'text-google-red', bg: 'bg-red-50', border: 'border-red-200' },
};

export function StatusBar({ status, error }: StatusBarProps) {
  if (status === 'idle') return null;

  const config = stepConfig[status];
  const Icon = config.icon;
  const isLoading = ['analyzing', 'sanctions_check', 'generating_proof', 'submitting'].includes(status);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, y: -12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.98 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={`p-4 rounded-xl border ${config.bg} ${config.border} ${config.color}`}
      >
        <div className="flex items-center gap-3">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin shrink-0" />
          ) : (
            <Icon className="w-5 h-5 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{config.label}</p>
            {error && status === 'failed' && (
              <p className="text-xs text-google-gray mt-0.5 truncate">{error}</p>
            )}
          </div>
          {status === 'success' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <CheckCircle className="w-6 h-6 text-google-green" />
            </motion.div>
          )}
          {status === 'failed' && (
            <XCircle className="w-6 h-6 text-google-red" />
          )}
        </div>

        {/* Progress bar for loading states */}
        {isLoading && (
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="h-0.5 bg-gradient-to-r from-transparent via-current to-transparent rounded-full mt-3 opacity-30"
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
