import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, LogOut, Copy, Check, ExternalLink, User, Star, Key, Plug, Zap, Loader2, Sparkles } from 'lucide-react';
import { Horizon, Keypair } from '@stellar/stellar-sdk';
import { isConnected, requestAccess } from '@stellar/freighter-api';
import { StellarNetwork, getHorizonUrl } from './NetworkSwitcher';

interface WalletConnectProps {
  walletAddress: string | null;
  onConnect: (address: string) => void;
  onDisconnect: () => void;
  network: StellarNetwork;
}

export function WalletConnect({ walletAddress, onConnect, onDisconnect, network }: WalletConnectProps) {
  const [connecting, setConnecting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [inputError, setInputError] = useState('');
  const [connectionMode, setConnectionMode] = useState<'freighter' | 'manual'>('freighter');
  const [freighterStatus, setFreighterStatus] = useState<'unknown' | 'available' | 'unavailable'>('unknown');
  const [accountBalances, setAccountBalances] = useState<string | null>(null);
  const [accountExists, setAccountExists] = useState<boolean | null>(null);

  // Check Freighter availability on mount
  useEffect(() => {
    const checkFreighter = async () => {
      try {
        const { isConnected: connected } = await isConnected();
        setFreighterStatus(connected ? 'available' : 'available');
      } catch {
        setFreighterStatus('unavailable');
      }
    };
    checkFreighter();
  }, []);

  // Fetch account info when connected
  useEffect(() => {
    if (!walletAddress) {
      setAccountBalances(null);
      setAccountExists(null);
      return;
    }

    const server = new Horizon.Server(getHorizonUrl(network));
    server.loadAccount(walletAddress)
      .then(account => {
        setAccountExists(true);
        const xlmBal = account.balances.find((b: any) => b.asset_type === 'native');
        const usdcBal = account.balances.find((b: any) => b.asset_code === 'USDC');
        if (xlmBal) setAccountBalances(`${parseFloat(xlmBal.balance).toFixed(2)} XLM`);
        else if (usdcBal) setAccountBalances(`${parseFloat(usdcBal.balance).toFixed(2)} USDC`);
        else setAccountBalances('Active');
      })
      .catch((err: any) => {
        if (err.response?.status === 404) {
          setAccountExists(false);
          setAccountBalances('0 XLM');
        } else {
          setAccountExists(null);
        }
      });
  }, [walletAddress, network]);

  // === Connect via Freighter ===
  const connectFreighter = useCallback(async () => {
    setConnecting(true);
    setInputError('');

    try {
      // Check if Freighter is connected
      const { isConnected: connected } = await isConnected();
      if (!connected) {
        setInputError('Freighter wallet not detected. Please install the Freighter extension.');
        setConnecting(false);
        return;
      }

      // Request access — triggers Freighter popup
      const result = await requestAccess();

      if (result.error) {
        setInputError(`Freighter access denied: ${result.error}`);
        setConnecting(false);
        return;
      }

      if (result.address) {
        onConnect(result.address);
        setConnectionMode('freighter');
      }
    } catch (err: any) {
      setInputError(`Freighter connection failed: ${err.message}`);
    } finally {
      setConnecting(false);
    }
  }, [onConnect]);

  // === Connect via Manual Address ===
  const connectManual = useCallback(() => {
    const addr = manualInput.trim().toUpperCase();
    if (!addr) {
      setInputError('Please enter a Stellar address');
      return;
    }
    if (!addr.startsWith('G') || addr.length < 50) {
      setInputError('Invalid Stellar address. Must start with G and be 56 characters.');
      return;
    }
    onConnect(addr);
    setConnectionMode('manual');
    setManualInput('');
    setInputError('');
    setShowManualInput(false);
  }, [manualInput, onConnect]);

  const disconnectWallet = useCallback(() => {
    onDisconnect();
    setAccountBalances(null);
    setAccountExists(null);
    setConnectionMode('freighter');
  }, [onDisconnect]);

  const copyAddress = useCallback(async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [walletAddress]);

  const truncateKey = (key: string) => `${key.slice(0, 6)}...${key.slice(-4)}`;

  const generateTestKeypair = useCallback(() => {
    const kp = Keypair.random();
    setManualInput(kp.publicKey());
  }, []);

  // === Connected State ===
  if (walletAddress) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Connection mode badge */}
        {connectionMode === 'freighter' ? (
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200 rounded-full">
            <Zap className="w-2.5 h-2.5" />
            FREIGHTER
          </span>
        ) : (
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-gray-50 text-gray-500 border border-gray-200 rounded-full">
            <Key className="w-2.5 h-2.5" />
            MANUAL
          </span>
        )}

        {/* Address + Balance */}
        <button
          onClick={copyAddress}
          className="flex items-center gap-2 px-3 py-1.5 bg-google-gray-bg rounded-full text-sm text-google-dark hover:bg-gray-200 transition-colors border border-google-gray-border group"
          title="Copy address"
        >
          <div className="w-2 h-2 rounded-full bg-google-green" />
          <div className="text-left">
            <span className="font-mono text-xs">{truncateKey(walletAddress)}</span>
            {accountBalances && (
              <p className="text-[10px] text-google-gray leading-none mt-0.5">{accountBalances}</p>
            )}
          </div>
          {copied ? (
            <Check className="w-3.5 h-3.5 text-google-green" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-google-gray group-hover:text-google-dark transition-colors" />
          )}
        </button>

        <button
          onClick={disconnectWallet}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-google-gray hover:text-google-red transition-colors rounded-full hover:bg-red-50"
          title="Disconnect"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Disconnect</span>
        </button>
      </div>
    );
  }

  // === Disconnected State ===
  return (
    <div className="flex flex-col items-end gap-2">
      <AnimatePresence mode="wait">
        {!showManualInput ? (
          <motion.div
            key="connect-buttons"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2"
          >
            {/* Freighter button (primary) */}
            <button
              onClick={connectFreighter}
              disabled={connecting}
              className="btn-primary text-xs py-2 px-4 relative overflow-hidden group"
            >
              {connecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span className="hidden sm:inline">Connect Freighter</span>
                  <span className="sm:hidden">Connect</span>
                </>
              )}
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
            </button>

            {/* Manual fallback */}
            <button
              onClick={() => setShowManualInput(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-google-gray hover:text-google-dark transition-colors rounded-lg hover:bg-gray-50 border border-transparent hover:border-google-gray-border"
              title="Enter address manually"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Manual</span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="manual-input"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-col gap-2"
          >
            <div className="flex items-stretch gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => { setManualInput(e.target.value.toUpperCase()); setInputError(''); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') connectManual(); }}
                  placeholder="G... Stellar address"
                  className="w-[220px] sm:w-[260px] px-3 py-2 text-xs border border-google-gray-border rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-google-blue focus:border-transparent
                             placeholder:text-gray-300 font-mono"
                  autoFocus
                />
              </div>
              <button
                onClick={connectManual}
                disabled={manualInput.length < 50}
                className="btn-primary text-xs py-2 px-3"
              >
                <User className="w-3.5 h-3.5" />
                Connect
              </button>
              <button
                onClick={() => { setShowManualInput(false); setInputError(''); }}
                className="px-2 text-xs text-google-gray hover:text-google-dark transition-colors"
              >
                Cancel
              </button>
            </div>

            {/* Quick actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={generateTestKeypair}
                className="text-[10px] text-google-gray hover:text-google-blue transition-colors px-2 py-0.5 rounded hover:bg-blue-50 inline-flex items-center gap-1"
              >
                <Sparkles className="w-2.5 h-2.5" />
                Generate random
              </button>
              <a
                href={`https://laboratory.stellar.org/#account-creator?network=${network}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-google-gray hover:text-google-blue transition-colors px-2 py-0.5 rounded hover:bg-blue-50 inline-flex items-center gap-1"
              >
                <ExternalLink className="w-2.5 h-2.5" />
                Create test account
              </a>
            </div>

            {/* Error */}
            {inputError && (
              <p className="text-[10px] text-google-red">{inputError}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Freighter not detected hint */}
      {freighterStatus === 'unavailable' && !showManualInput && (
        <a
          href="https://freighter.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-google-gray hover:text-google-blue transition-colors flex items-center gap-1"
        >
          <Plug className="w-2.5 h-2.5" />
          Freighter not detected — install extension
        </a>
      )}
    </div>
  );
}

// Also export a simple version without Freighter for testing
export { isConnected as checkFreighterInstalled } from '@stellar/freighter-api';
