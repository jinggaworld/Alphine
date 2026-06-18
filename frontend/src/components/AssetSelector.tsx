import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Coins, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';
import { Horizon } from '@stellar/stellar-sdk';
import { StellarNetwork, getHorizonUrl } from './NetworkSwitcher';

export type StellarAsset = 'XLM' | 'USDC';

interface AssetSelectorProps {
  selectedAsset: StellarAsset;
  onAssetChange: (asset: StellarAsset) => void;
  walletAddress: string | null;
  network: StellarNetwork;
}

// Stellar USDC issuers
const USDC_ISSUERS = {
  mainnet: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
  testnet: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
};

interface AssetBalance {
  asset_code?: string;
  asset_type: string;
  balance: string;
  asset_issuer?: string;
}

export function AssetSelector({ selectedAsset, onAssetChange, walletAddress, network }: AssetSelectorProps) {
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  const fetchBalances = useCallback(async () => {
    if (!walletAddress) {
      setBalances({});
      return;
    }

    setLoadingBalance(true);
    setBalanceError(null);
    const server = new Horizon.Server(getHorizonUrl(network));

    try {
      const account = await server.loadAccount(walletAddress);
      const bals: Record<string, string> = {};

      for (const b of account.balances as AssetBalance[]) {
        if (b.asset_type === 'native') {
          bals['XLM'] = b.balance;
        } else if (b.asset_code === 'USDC') {
          bals['USDC'] = b.balance;
        }
      }

      setBalances(bals);
    } catch (err: any) {
      if (err.response?.status === 404) {
        // Account not found (new testnet account) — show 0 balance
        setBalances({ XLM: '0', USDC: '0' });
      } else {
        setBalanceError(err.message);
      }
    } finally {
      setLoadingBalance(false);
    }
  }, [walletAddress, network]);

  // Fetch balances on mount and when wallet/network changes
  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num === 0) return '0.00';
    if (num >= 1000) return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return num.toFixed(2);
  };

  const ASSETS: { key: StellarAsset; label: string; icon: typeof DollarSign; description: string }[] = [
    { key: 'XLM', label: 'XLM', icon: Coins, description: 'Native Stellar asset' },
    { key: 'USDC', label: 'USDC', icon: DollarSign, description: network === 'testnet' ? 'Testnet USDC' : 'Circle USDC' },
  ];

  return (
    <div className="flex flex-col gap-1.5">
      {/* Asset toggle */}
      <div className="flex bg-gray-100 rounded-lg p-0.5">
        {ASSETS.map((asset) => {
          const isActive = selectedAsset === asset.key;
          const Icon = asset.icon;
          const balance = balances[asset.key];

          return (
            <button
              key={asset.key}
              onClick={() => onAssetChange(asset.key)}
              className={`relative flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all
                ${isActive ? 'text-white shadow-sm' : 'text-google-gray hover:text-google-dark'}`}
            >
              {isActive && (
                <motion.div
                  layoutId="asset-bg"
                  className="absolute inset-0 bg-google-blue rounded-md"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5" />
                {asset.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Balance display */}
      {walletAddress && (
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1">
            {loadingBalance ? (
              <RefreshCw className="w-3 h-3 text-google-gray animate-spin" />
            ) : balanceError ? (
              <AlertCircle className="w-3 h-3 text-google-red" />
            ) : null}
            <span className="text-[10px] text-google-gray">
              Balance: {' '}
              <span className="font-semibold text-google-dark">
                {balances[selectedAsset] !== undefined
                  ? `${formatBalance(balances[selectedAsset])} ${selectedAsset}`
                  : '—'}
              </span>
            </span>
          </div>
          <button
            onClick={fetchBalances}
            className="text-[10px] text-google-gray hover:text-google-blue transition-colors"
            title="Refresh balance"
          >
            <RefreshCw className={`w-2.5 h-2.5 ${loadingBalance ? 'animate-spin' : ''}`} />
          </button>
        </div>
      )}

      {/* USDC issuer info */}
      {selectedAsset === 'USDC' && (
        <a
          href={`https://stellar.expert/explorer/${network}/asset/USDC-${USDC_ISSUERS[network].slice(0, 4)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[9px] text-google-gray hover:text-google-blue transition-colors inline-flex items-center gap-0.5 px-1"
        >
          <ExternalLink className="w-2 h-2" />
          {network === 'testnet' ? 'Testnet USDC issuer' : 'Circle USDC issuer'}
        </a>
      )}
    </div>
  );
}

// Helper to get asset config
export function getAssetConfig(asset: StellarAsset, network: StellarNetwork) {
  if (asset === 'XLM') {
    return { code: 'XLM', issuer: undefined, isNative: true };
  }
  return {
    code: 'USDC',
    issuer: USDC_ISSUERS[network],
    isNative: false,
  };
}
