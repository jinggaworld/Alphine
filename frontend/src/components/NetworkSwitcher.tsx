import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, ChevronDown, Server, Wifi, WifiOff, ExternalLink } from 'lucide-react';

export type StellarNetwork = 'testnet' | 'mainnet';

interface NetworkSwitcherProps {
  network: StellarNetwork;
  onNetworkChange: (network: StellarNetwork) => void;
  compact?: boolean;
}

const NETWORK_CONFIG = {
  testnet: {
    label: 'Testnet',
    horizon: 'https://horizon-testnet.stellar.org',
    friendbot: 'https://friendbot.stellar.org',
    passphrase: 'Test SDF Network ; September 2015',
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    dot: 'bg-yellow-400',
    badgeText: 'TESTNET',
  },
  mainnet: {
    label: 'Mainnet',
    horizon: 'https://horizon.stellar.org',
    friendbot: null,
    passphrase: 'Public Global Stellar Network ; September 2015',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    badgeText: 'MAINNET',
  },
};

export function NetworkSwitcher({ network, onNetworkChange, compact }: NetworkSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [horizonStatus, setHorizonStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const config = NETWORK_CONFIG[network];

  // Check Horizon connectivity
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      setHorizonStatus('checking');
      try {
        const res = await fetch(`${config.horizon}/`, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
        if (!cancelled) setHorizonStatus(res.ok ? 'online' : 'offline');
      } catch {
        if (!cancelled) setHorizonStatus('offline');
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [network]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (compact) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold
            ${config.bg} ${config.color} ${config.border} border transition-all hover:shadow-sm`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
          {config.badgeText}
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-xs font-semibold text-google-dark">Select Network</p>
              </div>

              {/* Network options */}
              <div className="p-2 space-y-1">
                {(Object.entries(NETWORK_CONFIG) as [StellarNetwork, typeof NETWORK_CONFIG.testnet][]).map(([key, nc]) => (
                  <button
                    key={key}
                    onClick={() => { onNetworkChange(key); setIsOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors
                      ${network === key ? nc.bg : 'hover:bg-gray-50'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${nc.bg}`}>
                      <Globe className={`w-4 h-4 ${nc.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${network === key ? nc.color : 'text-google-dark'}`}>
                        {nc.label}
                      </p>
                      <p className="text-[10px] text-google-gray font-mono truncate mt-0.5">{nc.horizon}</p>
                    </div>
                    {network === key && (
                      <Check className="w-4 h-4 text-google-blue" />
                    )}
                  </button>
                ))}
              </div>

              {/* Status bar */}
              <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {horizonStatus === 'online' ? (
                    <Wifi className="w-3 h-3 text-google-green" />
                  ) : horizonStatus === 'offline' ? (
                    <WifiOff className="w-3 h-3 text-google-red" />
                  ) : (
                    <Server className="w-3 h-3 text-google-gray animate-pulse" />
                  )}
                  <span className="text-[10px] text-google-gray">
                    {horizonStatus === 'online' ? 'Connected' : horizonStatus === 'offline' ? 'Disconnected' : 'Checking...'}
                  </span>
                </div>
                <a
                  href={config.horizon}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-google-blue hover:underline inline-flex items-center gap-0.5"
                >
                  Explorer <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Full size version
  return (
    <div className="flex items-center gap-2">
      {(Object.entries(NETWORK_CONFIG) as [StellarNetwork, typeof NETWORK_CONFIG.testnet][]).map(([key, nc]) => (
        <button
          key={key}
          onClick={() => onNetworkChange(key)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
            ${network === key
              ? `${nc.bg} ${nc.color} ${nc.border} border shadow-sm`
              : 'text-google-gray hover:bg-gray-50 border border-transparent'
            }`}
        >
          <span className={`w-2 h-2 rounded-full ${network === key ? nc.dot : 'bg-gray-300'}`} />
          {nc.label}
        </button>
      ))}
    </div>
  );
}

// Export config for use across components
export { NETWORK_CONFIG };
export function getHorizonUrl(network: StellarNetwork): string {
  return NETWORK_CONFIG[network].horizon;
}
