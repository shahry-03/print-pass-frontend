import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, FileQuestion } from 'lucide-react';

const NotFoundPage = () => (
  <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="text-center"
    >
      <div className="flex justify-center mb-8">
        <div className="w-24 h-24 rounded-3xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <FileQuestion size={48} className="text-primary-500" />
        </div>
      </div>
      <h1 className="text-7xl font-black bg-gradient-to-r from-primary-500 to-purple-600 bg-clip-text text-transparent mb-4">
        404
      </h1>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
        Page Not Found
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-white font-semibold gradient-hero shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-[1.02] transition-all"
      >
        <Home size={18} />
        Go Home
      </Link>
    </motion.div>
  </div>
);

export default NotFoundPage;
