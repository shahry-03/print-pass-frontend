import { useState, useEffect, useId } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Printer,
  Globe,
  Code,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services';
import { useAuthStore } from '../store';
import { getErrorMessage } from '../utils/httpError';
import { Card, Input } from '../components/ui';

const LoginPage = () => {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  // Validation errors
  const emailError = touched.email && email && !/^\S+@\S+\.\S+$/.test(email)
      ? 'Enter a valid email address'
      : '';
  const passwordError = touched.password && password && password.length < 6
      ? 'Password must be at least 6 characters'
      : '';

  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  // Load remembered email from localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem('printpass_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    const emailErr = email && !/^\S+@\S+\.\S+$/.test(email) ? 'Enter a valid email address' : '';
    const pwdErr = password && password.length < 6 ? 'Password must be at least 6 characters' : '';
    if (!email.trim()) {
      toast.error('Enter your email');
      return;
    }
    if (!password) {
      toast.error('Enter your password');
      return;
    }
    if (emailErr || pwdErr) {
      toast.error('Please fix the errors before continuing');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.login({ email, password });
      login(res.token, res.role, res.email);
      toast.success('Welcome back!');

      if (rememberMe) {
        localStorage.setItem('printpass_remembered_email', email);
      } else {
        localStorage.removeItem('printpass_remembered_email');
      }

      if (res.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Invalid credentials'));
    } finally {
      setLoading(false);
    }
  };

  // Unique IDs for accessibility
  const emailId = useId();
  const passwordId = useId();
  const errorEmailId = useId();
  const errorPasswordId = useId();

  return (
      <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-3 sm:px-4 py-6 sm:py-12 overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        <div className="absolute top-1/4 left-1/4 hidden md:block w-96 h-96 bg-primary-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 hidden md:block w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-400/5 rounded-full blur-3xl" />

        {/* Floating particles (decorative) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block" aria-hidden>
          {[...Array(12)].map((_, i) => {
            const left = ((i * 17 + 13) % 100);
            const top = ((i * 23 + 7) % 100);
            const delay = ((i * 0.4) % 5).toFixed(1);
            const duration = 8 + (i % 5) * 2;
            return (
              <div
                key={i}
                className="absolute w-1 h-1 bg-primary-300/40 rounded-full animate-float"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`,
                }}
              />
            );
          })}
        </div>

        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="relative w-full max-w-md"
        >
          <Card className="backdrop-blur-sm rounded-2xl sm:rounded-3xl p-5 sm:p-10 transition-all">
            {/* Logo + Brand */}
            <div className="flex flex-col items-center mb-6 sm:mb-8">
              <motion.div
                  whileHover={{ rotate: 5, scale: 1.05 }}
                  className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center shadow-lg shadow-primary-500/40"
              >
                <Printer size={30} className="text-white" />
              </motion.div>
              <h1 className="text-2xl sm:text-3xl font-bold text-center text-slate-900 dark:text-white mt-4">
                Welcome Back
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Sign in to your PrintPass account
              </p>
            </div>

            {/* Demo Credentials Hint */}
            <div className="mb-5 sm:mb-6 p-3 rounded-xl bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800/50 text-xs text-primary-700 dark:text-primary-300 text-center">
              🔐 Demo: <span className="font-mono">demo@printpass.com</span> / <span className="font-mono">demopass</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Email Field */}
              <div>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors peer-focus:text-primary-500" />
                  <Input
                      id={emailId}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                      aria-invalid={!!emailError}
                      aria-describedby={emailError ? errorEmailId : undefined}
                      placeholder=" "
                      className="ui-input peer pl-11 pr-4 pt-5 pb-2 placeholder-transparent"
                  />
                  <label
                      htmlFor={emailId}
                      className="absolute left-11 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 text-sm transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary-500 peer-placeholder-shown:translate-y-1/2 peer-focus:translate-y-0"
                  >
                    Email address
                  </label>
                </div>
                <AnimatePresence>
                  {emailError && (
                      <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          id={errorEmailId}
                          className="mt-1.5 text-xs text-red-500 flex items-center gap-1"
                      >
                        <AlertCircle size={12} /> {emailError}
                      </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Password Field */}
              <div>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                      id={passwordId}
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                      aria-invalid={!!passwordError}
                      aria-describedby={passwordError ? errorPasswordId : undefined}
                      placeholder=" "
                      className="ui-input peer pl-11 pr-12 pt-5 pb-2 placeholder-transparent"
                  />
                  <label
                      htmlFor={passwordId}
                      className="absolute left-11 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 text-sm transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary-500 peer-placeholder-shown:translate-y-1/2 peer-focus:translate-y-0"
                  >
                    Password
                  </label>
                  <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <AnimatePresence>
                  {passwordError && (
                      <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          id={errorPasswordId}
                          className="mt-1.5 text-xs text-red-500 flex items-center gap-1"
                      >
                        <AlertCircle size={12} /> {passwordError}
                      </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Remember Me + Forgot Password */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-400 focus:ring-offset-0"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-primary-600 transition-colors">
                  Remember me
                </span>
                </label>
                <Link
                    to="/forgot-password"
                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.98 }}
                  className="btn-press ui-btn-primary relative w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-all text-sm overflow-hidden group"
              >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                      <LogIn size={18} className="group-hover:translate-x-0.5 transition-transform" />
                      Sign In
                    </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="relative my-6 sm:my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white/80 dark:bg-slate-800/70 text-slate-500">
                Or continue with
              </span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                  type="button"
                  onClick={() => toast('Google login coming soon')}
                  className="btn-press flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm"
              >
                <Globe size={18} /> Google
              </button>
              <button
                  type="button"
                  onClick={() => toast('GitHub login coming soon')}
                  className="btn-press flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm"
              >
                <Code size={18} /> GitHub
              </button>
            </div>

            {/* Register Link */}
            <p className="mt-6 sm:mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
              Don&apos;t have an account?{' '}
              <Link
                  to="/register"
                  className="text-primary-600 dark:text-primary-400 font-semibold hover:underline inline-flex items-center gap-1"
              >
                Register your shop
                <CheckCircle size={14} />
              </Link>
            </p>
            <p className="mt-4 text-center">
              <Link
                to="/"
                className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                ← Back to home
              </Link>
            </p>
          </Card>
        </motion.div>

      </div>
  );
};

export default LoginPage;

