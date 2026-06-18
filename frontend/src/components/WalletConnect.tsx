import { useState, useEffect, useCallback } from 'react';
import { Wallet, LogOut, Copy, Check } from 'lucide-react';

declare global {
  interface Window {
    stellar?: {
      isConnected: () => Promise<{ isConnected: boolean }>;
      getPublicKey: () => Promise<string>;
    };
  }
}



interface WalletConnectProps {
  walletAddress: string | null;
  onConnect: (address: string) => void;
  onDisconnect: () => void;
}

export function WalletConnect({ walletAddress, onConnect, onDisconnect }: WalletConnectProps) {
  const [connecting, setConnecting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    checkExistingConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkExistingConnection = async () => {
    try {
      if (window.stellar) {
        const { isConnected } = await window.stellar.isConnected();
        if (isConnected) {
          const key = await window.stellar.getPublicKey();
          onConnect(key);
        }
      }
    } catch {
      // Freighter not installed
    }
  };

  const connectWallet = useCallback(async () => {
    setConnecting(true);
    try {
      if (!window.stellar) {
        window.open('https://freighter.app', '_blank');
        alert('Please install Freighter wallet extension first, then try again.');
        return;
      }

      const key = await window.stellar.getPublicKey();
      onConnect(key);
    } catch (err) {
      console.error('Wallet connection failed:', err);
    } finally {
      setConnecting(false);
    }
  }, [onConnect]);

  const disconnectWallet = useCallback(() => {
    onDisconnect();
  }, [onDisconnect]);

  const copyAddress = useCallback(async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [walletAddress]);

  const truncateKey = (key: string) => {
    return `${key.slice(0, 6)}...${key.slice(-4)}`;
  };

  if (walletAddress) {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={copyAddress}
          className="flex items-center gap-2 px-3 py-1.5 bg-google-gray-bg rounded-full text-sm text-google-dark hover:bg-gray-200 transition-colors border border-google-gray-border"
          title="Copy address"
        >
          <div className="w-2 h-2 rounded-full bg-google-green" />
          <span className="font-mono text-xs">{truncateKey(walletAddress)}</span>
          {copied ? (
            <Check className="w-3.5 h-3.5 text-google-green" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-google-gray" />
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

  return (
    <button
      onClick={connectWallet}
      disabled={connecting}
      className="btn-primary text-sm"
    >
      {connecting ? (
        <>
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="w-4 h-4" />
          Connect Wallet
        </>
      )}
    </button>
  );
}
