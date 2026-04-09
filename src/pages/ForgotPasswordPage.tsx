import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail,
  ArrowLeft,
  Send,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Card, Input } from '../components/ui';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSent(true);
      toast.success('Password reset link sent to your email');
    } catch {
      toast.error('Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-3 sm:px-4 py-6 sm:py-12 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/70 rounded-2xl sm:rounded-3xl border border-white/20 dark:border-slate-700/50 shadow-2xl p-5 sm:p-8">
          {/* Back to Login */}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>

          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center shadow-lg shadow-primary-500/40 mx-auto mb-4">
              <Mail size={28} className="text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {sent ? 'Check Your Email' : 'Forgot Password?'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {sent
                ? 'We\'ve sent a password reset link to your email address.'
                : 'Enter your email address and we\'ll send you a link to reset your password.'
              }
            </p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-11 pr-4 py-2.5 sm:py-3"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                disabled={loading}
                variant="primary"
                className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={18} />
                    Send Reset Link
                  </>
                )}
              </Button>
              </motion.div>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                If an account with that email exists, we've sent you a password reset link.
              </p>
              <Button
                onClick={() => setSent(false)}
                variant="ghost"
                className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
              >
                Didn't receive the email? Try again
              </Button>
            </motion.div>
          )}

          {/* Help Text */}
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-8">
            Remember your password?{' '}
            <Link
              to="/login"
              className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
