import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  text?: string;
}

/** Animated loading spinner with optional text */
const LoadingSpinner = ({ size = 32, text }: LoadingSpinnerProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 py-12"
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <Loader2 size={size} className="animate-spin text-primary-500" aria-hidden />
    {text ? (
      <p className="text-sm text-slate-500 dark:text-slate-400">{text}</p>
    ) : (
      <span className="sr-only">Loading</span>
    )}
  </motion.div>
);

export default LoadingSpinner;
