import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, TrendingUp, FileText } from 'lucide-react';

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

interface ComplianceReportProps {
  data: ComplianceData;
}

function RiskMeter({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 70) return 'bg-google-red';
    if (score >= 40) return 'bg-google-yellow';
    return 'bg-google-green';
  };

  const getLabel = () => {
    if (score >= 70) return 'High Risk';
    if (score >= 40) return 'Medium Risk';
    return 'Low Risk';
  };

  const getTextColor = () => {
    if (score >= 70) return 'text-google-red';
    if (score >= 40) return 'text-google-yellow';
    return 'text-google-green';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-google-gray font-medium">Risk Score</span>
        <span className={`text-sm font-bold ${getTextColor()}`}>
          {score}/100
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${getColor()}`}
        />
      </div>
      <div className="flex items-center gap-1.5">
        <TrendingUp className={`w-3.5 h-3.5 ${getTextColor()}`} />
        <span className={`text-xs font-medium ${getTextColor()}`}>{getLabel()}</span>
      </div>
    </div>
  );
}

function RecommendationBadge({ rec }: { rec: string }) {
  const config = {
    approve: { icon: CheckCircle, color: 'text-google-green', bg: 'bg-green-50', border: 'border-green-200', label: 'APPROVED' },
    review: { icon: AlertTriangle, color: 'text-google-yellow', bg: 'bg-yellow-50', border: 'border-yellow-200', label: 'REVIEW' },
    block: { icon: Shield, color: 'text-google-red', bg: 'bg-red-50', border: 'border-red-200', label: 'BLOCKED' },
  };

  const c = config[rec as keyof typeof config] ?? config.review;
  const Icon = c.icon;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${c.bg} ${c.border} border ${c.color}`}>
      <Icon className="w-4 h-4" />
      <span className="text-xs font-bold tracking-wider">{c.label}</span>
    </div>
  );
}

export function ComplianceReport({ data }: ComplianceReportProps) {
  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="card p-6 space-y-5"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-google-dark flex items-center gap-2">
          <Shield className="w-4 h-4 text-google-blue" />
          Compliance Report
        </h3>
        <RecommendationBadge rec={data.recommendation} />
      </div>

      <RiskMeter score={data.riskScore} />

      {/* Red Flags */}
      {data.redFlags.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-google-gray uppercase tracking-wider">Red Flags</h4>
          {data.redFlags.map((flag, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-2 p-2.5 bg-red-50 rounded-lg"
            >
              <AlertTriangle className="w-4 h-4 text-google-red shrink-0 mt-0.5" />
              <span className="text-xs text-google-red">{flag}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Structuring Alert */}
      {data.structuringDetected && (
        <div className="flex items-start gap-2 p-2.5 bg-yellow-50 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-google-yellow shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-google-yellow">Structuring Pattern Detected</p>
            <p className="text-xs text-google-gray mt-0.5">
              Multiple transactions near the reporting threshold in the lookback window.
            </p>
          </div>
        </div>
      )}

      {/* Velocity Alerts */}
      {data.velocityAlerts.length > 0 && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-google-gray uppercase tracking-wider">Velocity Alerts</h4>
          {data.velocityAlerts.map((alert, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-google-yellow">
              <TrendingUp className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{alert}</span>
            </div>
          ))}
        </div>
      )}

      {/* No Issues */}
      {data.redFlags.length === 0 && !data.structuringDetected && data.velocityAlerts.length === 0 && (
        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
          <CheckCircle className="w-4 h-4 text-google-green shrink-0" />
          <span className="text-xs text-google-green font-medium">
            No compliance issues detected — transaction can proceed.
          </span>
        </div>
      )}

      {/* Processing Time */}
      {data.processingTimeMs !== undefined && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xs text-google-gray">Processing Time</span>
          <span className="text-xs font-mono text-google-dark">{data.processingTimeMs}ms</span>
        </div>
      )}
    </motion.div>
  );
}
