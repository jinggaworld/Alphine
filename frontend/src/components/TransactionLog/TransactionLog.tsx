import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronRight, Clock, CheckCircle, XCircle,
  Loader2, FileText, Eye, EyeOff, Copy, Terminal,
  ArrowRight, AlertTriangle, Info, Shield, SkipForward,
  Server, Database, Pen, Globe
} from 'lucide-react';
import type { StellarNetwork } from '../NetworkSwitcher';

export type LogStatus = 'pending' | 'success' | 'error' | 'skipped';

export interface LogEntry {
  id: string;
  timestamp: number;
  step: string;
  endpoint?: string;
  method?: string;
  status: LogStatus;
  statusCode?: number;
  duration?: number;
  request?: any;
  response?: any;
  error?: string;
  network?: StellarNetwork;
}

interface TransactionLogProps {
  entries: LogEntry[];
}

function formatJson(data: any): string {
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
}

function JsonViewer({ data, label }: { data: any; label?: string }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyContent = () => {
    navigator.clipboard.writeText(formatJson(data));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const jsonStr = formatJson(data);
  const isLong = jsonStr.length > 80;
  const truncated = isLong ? jsonStr.slice(0, 120) + '...' : jsonStr;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/50">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          {expanded ? <ChevronDown className="w-3 h-3 shrink-0" /> : <ChevronRight className="w-3 h-3 shrink-0" />}
          <span className="font-medium text-google-dark shrink-0">{label || 'Data'}</span>
          {!expanded && (
            <code className="text-[10px] text-google-gray font-mono truncate">{truncated}</code>
          )}
          <span className="text-[10px] text-google-gray shrink-0">({jsonStr.length} B)</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {expanded && (
            <button
              onClick={(e) => { e.stopPropagation(); copyContent(); }}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Copy JSON"
            >
              {copied ? <CheckCircle className="w-3 h-3 text-google-green" /> : <Copy className="w-3 h-3 text-google-gray" />}
            </button>
          )}
          {expanded ? <EyeOff className="w-3 h-3 text-google-gray" /> : <Eye className="w-3 h-3 text-google-gray" />}
        </div>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <pre className="p-3 text-xs font-mono text-google-dark bg-white border-t border-gray-200 overflow-x-auto max-h-60 overflow-y-auto scroll-smooth">
              <code>{jsonStr}</code>
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusBadge({ status, statusCode }: { status: LogStatus; statusCode?: number }) {
  const config = {
    pending: { icon: Loader2, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', label: 'PENDING' },
    success: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', label: 'OK' },
    error: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'ERROR' },
    skipped: { icon: SkipForward, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', label: 'SKIP' },
  };

  const c = config[status];
  const Icon = c.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${c.bg} ${c.border} border ${c.color}`}>
      {status === 'pending' ? <Icon className="w-3 h-3 animate-spin" /> : <Icon className="w-3 h-3" />}
      {c.label}
      {statusCode && <span className="opacity-50">({statusCode})</span>}
    </span>
  );
}

function StepIcon({ step }: { step: string }) {
  const icons: Record<string, any> = {
    'Stellar Account': Server,
    'Sanctions Check': Shield,
    'AI Analysis': FileText,
    'ZK Proof': Terminal,
    'Build Transaction': Pen,
    'Sign Transaction': Pen,
    'Submit to Horizon': Globe,
    'Submit to Stellar': ArrowRight,
    'Submit': ArrowRight,
  };
  const Icon = icons[step] || Database;
  return <Icon className="w-3.5 h-3.5" />;
}

function LogRow({ entry, index }: { entry: LogEntry; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const isActive = entry.status === 'pending';

  const borderColors = {
    error: 'border-red-200 bg-red-50/20',
    success: 'border-green-200',
    skipped: 'border-gray-200 bg-gray-50/30',
    pending: 'border-blue-200 bg-blue-50/10',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
      className={`border rounded-lg overflow-hidden transition-all ${
        borderColors[entry.status]
      } ${isActive ? 'animate-pulse border-blue-300' : ''} ${
        expanded ? 'shadow-sm' : ''
      }`}
    >
      {/* Header row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 hover:bg-black/[0.02] transition-colors text-left"
      >
        {/* Index marker */}
        <span className="text-[10px] text-google-gray font-mono w-5 shrink-0 text-right">
          #{index + 1}
        </span>

        {/* Step icon */}
        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
          entry.status === 'error' ? 'bg-red-100' :
          entry.status === 'success' ? 'bg-green-100' :
          entry.status === 'skipped' ? 'bg-gray-100' :
          'bg-blue-100'
        }`}>
          <StepIcon step={entry.step} />
        </div>

        {/* Step info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-google-dark truncate flex items-center gap-2">
            {entry.step}
            {entry.duration !== undefined && (
              <span className="text-[10px] text-google-gray font-mono font-normal">
                {entry.duration}ms
              </span>
            )}
          </p>
          {entry.endpoint && (
            <p className="text-[10px] text-google-gray font-mono truncate flex items-center gap-1">
              <span className="text-[9px] font-semibold uppercase">{entry.method || 'GET'}</span>
              {entry.endpoint}
            </p>
          )}
        </div>

        {/* Status */}
        <div className="shrink-0">
          <StatusBadge status={entry.status} statusCode={entry.statusCode} />
        </div>

        {/* Expand */}
        <div className="shrink-0">
          {expanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-google-gray" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-google-gray" />
          )}
        </div>
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-gray-200"
          >
            <div className="p-3 space-y-2">
              {/* Error */}
              {entry.error && (
                <div className="flex items-start gap-2 p-2.5 bg-red-50 rounded-lg border border-red-200">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-red-700">Error</p>
                    <p className="text-xs text-red-600 mt-0.5">{entry.error}</p>
                  </div>
                </div>
              )}

              {/* Skipped reason */}
              {entry.status === 'skipped' && entry.error && (
                <div className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                  <SkipForward className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-500">{entry.error}</p>
                </div>
              )}

              {/* Request */}
              {entry.request && (
                <JsonViewer data={entry.request} label={`Request ${entry.method ? `(${entry.method})` : ''}`} />
              )}

              {/* Response */}
              {entry.response && (
                <JsonViewer data={entry.response} label={`Response (${entry.statusCode || '?'})`} />
              )}

              {/* Timing details */}
              {entry.duration !== undefined && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="flex items-center gap-1.5 text-xs text-google-gray">
                      <Clock className="w-3 h-3" />
                      Duration
                    </span>
                    <span className="text-xs font-mono font-semibold text-google-dark">
                      {entry.duration}ms
                    </span>
                  </div>
                  {entry.timestamp && (
                    <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-xs text-google-gray">Timestamp</span>
                      <span className="text-[10px] font-mono text-google-dark">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function TransactionLog({ entries }: TransactionLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll to latest entry
  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [entries.length, autoScroll]);

  if (entries.length === 0) return null;

  const successCount = entries.filter(e => e.status === 'success').length;
  const errorCount = entries.filter(e => e.status === 'error').length;
  const skippedCount = entries.filter(e => e.status === 'skipped').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50/50">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-google-blue" />
          <h3 className="text-sm font-semibold text-google-dark">Transaction Log</h3>
          <span className="text-[10px] text-google-gray bg-gray-200 px-2 py-0.5 rounded-full font-mono">
            {entries.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Summary badges */}
          <div className="hidden sm:flex items-center gap-1.5">
            {successCount > 0 && (
              <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-mono">
                {successCount}✓
              </span>
            )}
            {errorCount > 0 && (
              <span className="text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded font-mono">
                {errorCount}✗
              </span>
            )}
            {skippedCount > 0 && (
              <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                {skippedCount}→
              </span>
            )}
          </div>

          {/* Auto-scroll toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`text-[10px] flex items-center gap-1 px-2 py-1 rounded transition-colors ${
              autoScroll ? 'bg-google-blue text-white' : 'text-google-gray hover:bg-gray-200'
            }`}
          >
            {autoScroll ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            Auto
          </button>
        </div>
      </div>

      {/* Log entries */}
      <div
        ref={containerRef}
        className="p-3 space-y-1.5 max-h-[460px] overflow-y-auto scroll-smooth"
      >
        {entries.map((entry, i) => (
          <LogRow key={entry.id} entry={entry} index={i} />
        ))}
        {/* Inline status for pending */}
        {entries.some(e => e.status === 'pending') && (
          <div className="flex items-center justify-center gap-2 py-2 text-xs text-google-gray">
            <Loader2 className="w-3 h-3 animate-spin" />
            Waiting for response...
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </motion.div>
  );
}
