import { motion } from 'framer-motion';
import { memo } from 'react';

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

const WIDTH_PATTERN = [100, 92, 85, 78, 95, 88, 72];

/** Skeleton loader for content placeholders */
const LoadingSkeleton = memo(({ className = '', lines = 3 }: LoadingSkeletonProps) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0.5 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
        className="h-4 bg-slate-200 dark:bg-slate-700 rounded"
        style={{ width: `${WIDTH_PATTERN[i % WIDTH_PATTERN.length]}%` }}
      />
    ))}
  </div>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

export default LoadingSkeleton;
