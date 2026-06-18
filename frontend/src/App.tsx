import { useState, lazy, Suspense, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, Globe, Coins, ArrowRight, Github, ExternalLink } from 'lucide-react';
import { WalletConnect } from './components/WalletConnect';
import { NetworkSwitcher, StellarNetwork } from './components/NetworkSwitcher';
import { AssetSelector, StellarAsset } from './components/AssetSelector';
import { ErrorBoundary } from './components/optimization/ErrorBoundary';
import { LoadingSkeleton, StatsSkeleton } from './components/optimization/LoadingSkeleton';
import { LazyRender } from './components/optimization/LazyRender';

const TransactionDashboard = lazy(() =>
  import('./components/TransactionDashboard').then(m => ({ default: m.TransactionDashboard }))
);

export default function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<StellarNetwork>('testnet');
  const [selectedAsset, setSelectedAsset] = useState<StellarAsset>('XLM');

  const handleConnect = useCallback((addr: string) => setWalletAddress(addr), []);
  const handleDisconnect = useCallback(() => setWalletAddress(null), []);
  const handleNetworkChange = useCallback((n: StellarNetwork) => setNetwork(n), []);
  const handleAssetChange = useCallback((a: StellarAsset) => setSelectedAsset(a), []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#f8f9fa]">
        {/* ========== HEADER ========== */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
            {/* Left: Brand */}
            <div className="flex items-center gap-3 shrink-0">
              <motion.div
                whileHover={{ scale: 1.05, rotate: -5 }}
                className="w-9 h-9 bg-gradient-to-br from-google-blue via-blue-400 to-indigo-400 rounded-xl flex items-center justify-center shadow-sm"
              >
                <span className="text-sm font-bold text-white drop-shadow-sm">⛰</span>
              </motion.div>
              <div className="hidden sm:block">
                <span className="text-lg font-bold text-google-dark tracking-tight">
                  Alphine
                </span>
                <span className="ml-2 px-2 py-0.5 text-[10px] font-medium bg-blue-50 text-google-blue rounded-full border border-blue-100">
                  ZK Compliance
                </span>
              </div>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Network Switcher */}
              <div className="hidden sm:block">
                <NetworkSwitcher
                  network={network}
                  onNetworkChange={handleNetworkChange}
                  compact
                />
              </div>

                {/* Wallet Connect */}
              <WalletConnect
                walletAddress={walletAddress}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                network={network}
              />
            </div>
          </div>

          {/* Mobile sub-header: Network for small screens */}
          <div className="sm:hidden border-t border-gray-100 px-4 py-2 flex items-center justify-center bg-white/80">
            <NetworkSwitcher network={network} onNetworkChange={handleNetworkChange} compact />
          </div>
        </header>

        {/* ========== MAIN CONTENT ========== */}
        <main className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-10 sm:mb-14"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-google-blue text-[11px] font-medium rounded-full mb-4 border border-blue-100/50"
            >
              <Shield className="w-3 h-3" />
              Zero-Knowledge Compliance Layer for Stellar
            </motion.div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-google-dark tracking-tight mb-4 leading-tight">
              Send{' '}
              <span className="relative">
                <span className="text-google-blue">{selectedAsset}</span>
                <motion.span
                  key={selectedAsset}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-google-blue to-blue-300 rounded-full"
                />
              </span>
              {' '}with{' '}
              <span className="bg-gradient-to-r from-google-blue to-indigo-500 bg-clip-text text-transparent">
                ZK Privacy
              </span>
            </h1>

            <p className="text-sm sm:text-base text-google-gray max-w-2xl mx-auto leading-relaxed">
              Zero-knowledge proof of AML compliance — without exposing your data.
              Sanctions check via Merkle tree, amount threshold verification, and
              structuring detection. All verified on-chain via Stellar Soroban.
            </p>

            {/* Network indicator */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border
                ${network === 'testnet'
                  ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${network === 'testnet' ? 'bg-yellow-400' : 'bg-blue-500'}`} />
                {network === 'testnet' ? 'TESTNET' : 'MAINNET'}
              </span>
              <span className="text-[10px] text-google-gray">•</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-semibold">
                <Coins className="w-2.5 h-2.5" />
                {selectedAsset}
              </span>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <LazyRender placeholder={<StatsSkeleton />}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10">
              {[
                {
                  icon: Shield,
                  label: 'Privacy',
                  value: 'ZK-Protected',
                  desc: 'Privacy-first compliance. Your data stays yours.',
                  color: 'text-google-blue',
                  gradient: 'from-blue-50 to-blue-100/50',
                },
                {
                  icon: TrendingUp,
                  label: 'Threshold',
                  value: selectedAsset === 'USDC' ? '$10,000' : '100,000 XLM',
                  desc: `${selectedAsset === 'USDC' ? 'FINRA' : 'Customizable'} reporting limit with structuring detection.`,
                  color: 'text-emerald-600',
                  gradient: 'from-emerald-50 to-emerald-100/50',
                },
                {
                  icon: Globe,
                  label: 'Sanctions',
                  value: 'OFAC + UN',
                  desc: 'Merkle tree-powered sanctions screening. Real-time checks.',
                  color: 'text-amber-600',
                  gradient: 'from-amber-50 to-amber-100/50',
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="card p-4 sm:p-5 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-[10px] text-google-gray font-semibold uppercase tracking-wider">{stat.label}</p>
                      <p className="text-sm font-bold text-google-dark">{stat.value}</p>
                    </div>
                  </div>
                  <p className="text-xs text-google-gray leading-relaxed">{stat.desc}</p>
                </motion.div>
              ))}
            </div>
          </LazyRender>

          {/* Transaction Dashboard */}
          <Suspense fallback={<LoadingSkeleton />}>
            <TransactionDashboard
              walletAddress={walletAddress}
              network={network}
              selectedAsset={selectedAsset}
              onAssetChange={handleAssetChange}
            />
          </Suspense>

          {/* Architecture Diagram */}
          <LazyRender rootMargin="400px">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 sm:mt-16 card p-6 sm:p-8"
            >
              <h2 className="text-base sm:text-lg font-bold text-google-dark mb-6">System Architecture</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
                {[
                  { step: '01', title: 'Connect Wallet', desc: 'Freighter wallet via Stellar SDK', icon: WalletIcon },
                  { step: '02', title: 'Sanctions Check', desc: 'Merkle tree membership proof', icon: Shield },
                  { step: '03', title: 'AI + ZK Analysis', desc: 'Groq AI + Noir circuit proof', icon: TrendingUp },
                  { step: '04', title: 'Soroban Verify', desc: 'On-chain Groth16 verification', icon: Globe },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.step} className="text-center group">
                      <div className="relative">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-google-blue to-blue-500 text-white text-sm font-bold flex items-center justify-center mx-auto mb-3 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        {i < 3 && (
                          <ArrowRight className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-google-gray/40" />
                        )}
                      </div>
                      <h3 className="text-xs sm:text-sm font-semibold text-google-dark mb-1">{item.title}</h3>
                      <p className="text-[10px] sm:text-xs text-google-gray">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </LazyRender>

          {/* Compliance Details */}
          <LazyRender rootMargin="400px">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-6 card p-6 sm:p-8"
            >
              <h2 className="text-base sm:text-lg font-bold text-google-dark mb-5">Compliance Pipeline</h2>
              <div className="space-y-3">
                {[
                  {
                    phase: 'Sanctions Screening',
                    detail: 'Merkle tree of OFAC + UN sanctions lists. Zero-knowledge membership proof.',
                    icon: Shield,
                    color: 'text-blue-600',
                    bg: 'bg-blue-50',
                  },
                  {
                    phase: 'Structuring Detection',
                    detail: 'AI-powered pattern recognition for smurfing/structuring attempts.',
                    icon: TrendingUp,
                    color: 'text-emerald-600',
                    bg: 'bg-emerald-50',
                  },
                  {
                    phase: 'Amount Threshold',
                    detail: `${selectedAsset === 'USDC' ? '$10,000 FINRA reporting threshold' : '100,000 XLM configurable threshold'}. Proof of compliance without revealing amount.`,
                    icon: Coins,
                    color: 'text-amber-600',
                    bg: 'bg-amber-50',
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.phase} className="flex items-start gap-3 p-3 sm:p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
                      <div className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-google-dark">{item.phase}</p>
                        <p className="text-[11px] sm:text-xs text-google-gray mt-0.5">{item.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </LazyRender>
        </main>

        {/* ========== FOOTER ========== */}
        <footer className="border-t border-gray-200 mt-12 sm:mt-16">
          <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-google-gray">
                <span className="font-semibold text-google-dark">Alphine</span>
                <span>—</span>
                <span>ZK Compliance Layer</span>
                <span>•</span>
                <span>v1.0.0</span>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com/jinggaworld/Alphine"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-google-gray hover:text-google-dark transition-colors inline-flex items-center gap-1"
                >
                  <Github className="w-3.5 h-3.5" />
                  GitHub
                </a>
                <a
                  href="https://dorahacks.io/hackathon/stellar-hacks-zk/detail"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-google-gray hover:text-google-blue transition-colors inline-flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Stellar Hacks
                </a>
                <span className="text-xs text-google-gray">
                  June 2026
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

// Helper icon component for Wallet in architecture
function WalletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}
