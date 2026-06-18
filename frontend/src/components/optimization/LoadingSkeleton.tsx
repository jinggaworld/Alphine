import { motion } from 'framer-motion';

export function LoadingSkeleton() {
  return (
    <div className="card p-6 space-y-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3" />
      <div className="h-10 bg-gray-200 rounded" />
      <div className="h-10 bg-gray-200 rounded" />
      <div className="h-12 bg-gray-200 rounded" />
      <div className="flex gap-2">
        <div className="h-5 bg-gray-200 rounded w-20" />
        <div className="h-5 bg-gray-200 rounded w-24" />
      </div>
      <div className="h-10 bg-gray-200 rounded" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
    </div>
  );
}

export function ComplianceSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6 space-y-4 animate-pulse"
    >
      <div className="h-5 bg-gray-200 rounded w-1/4" />
      <div className="h-8 bg-gray-200 rounded-full w-full" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
    </motion.div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card p-5 space-y-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
          <div className="h-3 bg-gray-200 rounded w-16" />
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-3 bg-gray-200 rounded w-20" />
        </div>
      ))}
    </div>
  );
}
