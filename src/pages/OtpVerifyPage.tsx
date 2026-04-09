import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, RefreshCw, ArrowLeft, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { otpService } from '../services';
import { Button, Card } from '../components/ui';

const OTP_LENGTH = 6;

const OtpVerifyPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = (location.state as { email?: string } | null)?.email || '';

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      navigate('/register', { replace: true });
      return;
    }
    const t = requestAnimationFrame(() => inputsRef.current[0]?.focus());
    return () => cancelAnimationFrame(t);
  }, [email, navigate]);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);

    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const next = [...otp];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtp(next);
    inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      toast.error('Please enter the full code');
      return;
    }
    setLoading(true);
    try {
      await otpService.verifyOtp({ email, otp: code });
      toast.success('Email verified successfully!');
      navigate('/login');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(msg || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await otpService.resendOtp({ email });
      toast.success('New code sent — check your inbox');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(msg || 'Could not resend code');
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-3 sm:px-4 py-6 sm:py-12">
      <div className="absolute top-32 left-8 hidden md:block w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-8 hidden md:block w-64 h-64 bg-primary-400/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-full max-w-md"
      >
        <Card className="rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/85 backdrop-blur-sm shadow-2xl shadow-slate-200/40 dark:shadow-black/25 p-5 sm:p-10 text-center">
          <div className="flex justify-center mb-5 sm:mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <ShieldCheck size={28} className="text-white" aria-hidden />
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">Verify your email</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
            <span className="inline-flex items-center gap-1.5 justify-center">
              <Mail size={14} className="shrink-0 opacity-70" aria-hidden />
              We sent a {OTP_LENGTH}-digit code to
            </span>
          </p>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 break-all mb-6 sm:mb-8">
            {email}
          </p>

          <form onSubmit={handleSubmit}>
            <fieldset>
              <legend className="sr-only">One-time password</legend>
              <div
                className="flex justify-center gap-1.5 sm:gap-3 mb-6 sm:mb-8"
                onPaste={handlePaste}
              >
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputsRef.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={i === 0 ? 'one-time-code' : 'off'}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
                    className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                ))}
              </div>
            </fieldset>

            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={18} aria-hidden />
                  Verify & continue
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-sm">
            <Button
              type="button"
              onClick={handleResend}
              disabled={resending}
              variant="ghost"
              className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium hover:underline disabled:opacity-50 disabled:no-underline"
            >
              <RefreshCw size={14} className={resending ? 'animate-spin' : ''} aria-hidden />
              {resending ? 'Sending…' : 'Resend code'}
            </Button>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-600" aria-hidden>
              |
            </span>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <ArrowLeft size={14} aria-hidden />
              Wrong email?
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default OtpVerifyPage;
