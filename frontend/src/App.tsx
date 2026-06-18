import { useState, lazy, Suspense, useCallback } from 'react';
import { Shield, TrendingUp, Globe } from 'lucide-react';
import { WalletConnect } from './components/WalletConnect';
import { ErrorBoundary } from './components/optimization/ErrorBoundary';
import { LoadingSkeleton, StatsSkeleton } from './components/optimization/LoadingSkeleton';
import { LazyRender } from './components/optimization/LazyRender';

// Lazy-loaded TransactionDashboard for better initial bundle size
const TransactionDashboard = lazy(() =>
  import('./components/TransactionDashboard').then(m => ({ default: m.TransactionDashboard }))
);

export default function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const handleConnect = useCallback((addr: string) => setWalletAddress(addr), []);
  const handleDisconnect = useCallback(() => setWalletAddress(null), []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-google-blue to-blue-300 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-sm font-bold text-white">🏔</span>
              </div>
              <span className="text-xl font-bold text-google-dark tracking-tight">
                Alphine
              </span>
              <span className="hidden sm:inline-flex px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-google-blue rounded-full border border-blue-100">
                Compliance
              </span>
            </div>
            <WalletConnect
              walletAddress={walletAddress}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-4 py-10">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-google-blue text-xs font-medium rounded-full mb-4">
              <Shield className="w-3.5 h-3.5" />
              Zero-Knowledge Compliance Layer for Stellar
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-google-dark tracking-tight mb-4">
              Send USDC with{' '}
              <span className="text-google-blue">ZK Privacy</span>
            </h1>
            <p className="text-google-gray max-w-2xl mx-auto text-base leading-relaxed">
              Cryptographic proof of AML compliance — without exposing your data.
              Sanctions check, amount threshold, and structuring detection,
              all verified on-chain via Stellar Soroban.
            </p>
          </div>

          {/* Stats Cards */}
          <LazyRender placeholder={<StatsSkeleton />}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              {[
                { icon: Shield, label: 'Privacy', value: 'ZK-Protected', desc: 'No data exposed', color: 'text-google-blue' },
                { icon: TrendingUp, label: 'Threshold', value: '$10,000', desc: 'FINRA reporting limit', color: 'text-google-green' },
                { icon: Globe, label: 'Sanctions', value: 'Live Check', desc: 'OFAC + UN lists', color: 'text-google-yellow' },
              ].map((stat) => (
                <div key={stat.label} className="card p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-google-gray-bg flex items-center justify-center">
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-xs text-google-gray font-medium">{stat.label}</p>
                      <p className="text-sm font-semibold text-google-dark">{stat.value}</p>
                    </div>
                  </div>
                  <p className="text-xs text-google-gray">{stat.desc}</p>
                </div>
              ))}
            </div>
          </LazyRender>

          {/* Transaction Dashboard (lazy loaded) */}
          <Suspense fallback={<LoadingSkeleton />}>
            <TransactionDashboard walletAddress={walletAddress} />
          </Suspense>

          {/* How It Works */}
          <LazyRender rootMargin="400px">
            <div className="mt-16 card p-8">
              <h2 className="text-lg font-semibold text-google-dark mb-6">How It Works</h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                {[
                  { step: '1', title: 'Connect Wallet', desc: 'Connect your Stellar wallet via Freighter' },
                  { step: '2', title: 'AI Analysis', desc: 'Groq AI scans for AML red flags in real-time' },
                  { step: '3', title: 'ZK Proof', desc: 'Noir circuit generates privacy-preserving proof' },
                  { step: '4', title: 'On-Chain Verify', desc: 'Soroban contract verifies and executes transfer' },
                ].map((item) => (
                  <div key={item.step} className="text-center">
                    <div className="w-10 h-10 rounded-full bg-google-blue text-white text-sm font-bold flex items-center justify-center mx-auto mb-3 shadow-sm">
                      {item.step}
                    </div>
                    <h3 className="text-sm font-semibold text-google-dark mb-1">{item.title}</h3>
                    <p className="text-xs text-google-gray">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </LazyRender>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 py-6 text-center text-xs text-google-gray">
          Built for{' '}
          <a href="https://dorahacks.io/hackathon/stellar-hacks-zk/detail" target="_blank" rel="noopener noreferrer"
             className="text-google-blue hover:underline">
            Stellar Hacks: Real-World ZK
          </a>
          {' '}• June 2026
        </footer>
      </div>
    </ErrorBoundary>
  );
}
