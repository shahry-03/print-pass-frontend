import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { otpApi } from '../../api/otpApi';
import { getErrorMessage } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import Logo from '../../components/common/Logo';

// ── Constants ──
const OTP_LENGTH = 6;
const RESEND_COOLDOWN_MS = 60_000; // 60 seconds
const RESEND_STORAGE_KEY = 'pp_otp_resend_until';
const DESKTOP_BREAKPOINT = 768;

// ═══════════════════════════════════════════════════════════
// Hooks
// ═══════════════════════════════════════════════════════════

/**
 * Persisted cooldown — survives page refresh within the same browser.
 * Reads an end-timestamp from localStorage, ticks `now` while active.
 */
const useCooldown = (durationMs, storageKey) => {
  const readEndsAt = useCallback(() => {
    if (typeof localStorage === 'undefined') return 0;
    try {
      const saved = parseInt(localStorage.getItem(storageKey) || '0', 10);
      return saved > Date.now() ? saved : 0;
    } catch {
      return 0;
    }
  }, [storageKey]);

  const [endsAt, setEndsAt] = useState(readEndsAt);
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    if (!endsAt) return undefined;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [endsAt]);

  const remaining = Math.max(0, endsAt - now);
  const isActive = remaining > 0;

  const start = useCallback(() => {
    const end = Date.now() + durationMs;
    setEndsAt(end);
    setNow(Date.now());
    try { localStorage.setItem(storageKey, String(end)); } catch { /* ignore */ }
  }, [durationMs, storageKey]);

  return { isActive, remaining, secondsLeft: Math.ceil(remaining / 1000), start };
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

/**
 * OtpVerifyPage — 6-digit email verification.
 *
 * Features:
 * - 60s resend cooldown, persisted via localStorage (survives refresh)
 * - 429 rate-limit detection with specific feedback
 * - Shake + red-border inputs on error (auto-clears on typing)
 * - Arrow-key navigation (Left/Right) + smart Backspace
 * - Paste support with digit sanitization
 * - Per-input aria-labels + screen-reader progress announcements
 * - `autoComplete="one-time-code"` for native autofill
 * - Desktop-only auto-focus (mobile keyboard stays hidden)
 * - "Change email" link to fix typos
 * - Inline server error + toast + aria-live
 */
const OtpVerifyPage = () => {
  const [otp, setOtp] = useState(() => Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [serverError, setServerError] = useState(null);

  const inputRefs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  const cooldown = useCooldown(RESEND_COOLDOWN_MS, RESEND_STORAGE_KEY);

  // Redirect if email is missing
  useEffect(() => {
    if (!email) {
      navigate('/register', { replace: true });
    }
  }, [email, navigate]);

  // Desktop-only auto-focus (mobile: don't pop virtual keyboard)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= DESKTOP_BREAKPOINT) {
      inputRefs.current[0]?.focus();
    }
  }, []);

  // Focus and select a specific input
  const focusInput = useCallback((index) => {
    const el = inputRefs.current[index];
    if (el) {
      el.focus();
      el.select?.();
    }
  }, []);

  // Clear error state when user starts typing
  const clearError = () => {
    if (hasError) setHasError(false);
    if (serverError) setServerError(null);
  };

  const handleChange = (index, rawValue) => {
    clearError();

    // Accept only the last typed digit (handles autofill/paste into one cell)
    const digit = rawValue.replace(/\D/g, '').slice(-1);
    if (rawValue && !digit) return; // Reject non-digit input

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleVerify = useCallback(async () => {
    const otpString = otp.join('');

    if (otpString.length !== OTP_LENGTH) {
      setServerError(`Please enter all ${OTP_LENGTH} digits.`);
      setHasError(true);
      toast.error(`Please enter all ${OTP_LENGTH} digits`);
      return;
    }

    setLoading(true);
    setServerError(null);

    try {
      await otpApi.verify({ email, otp: otpString });
      toast.success('Email verified! Redirecting to login…');
      navigate('/login', { replace: true });
    } catch (err) {
      const message = getErrorMessage(err);
      setServerError(message);
      setHasError(true);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [otp, email, navigate]);

  const handleKeyDown = (index, e) => {
    const { key } = e;

    if (key === 'Backspace') {
      e.preventDefault();
      const newOtp = [...otp];

      if (otp[index]) {
        // Clear current cell
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        // Move to previous and clear it
        newOtp[index - 1] = '';
        setOtp(newOtp);
        focusInput(index - 1);
      }
      return;
    }

    if (key === 'ArrowLeft') {
      e.preventDefault();
      focusInput(index - 1);
    } else if (key === 'ArrowRight') {
      e.preventDefault();
      focusInput(index + 1);
    } else if (key === 'Enter') {
      e.preventDefault();
      handleVerify();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    clearError();

    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, OTP_LENGTH);

    if (!pasted) return;

    const newOtp = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);

    // Focus the last filled input (or last slot if complete)
    focusInput(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  const handleResend = async () => {
    if (cooldown.isActive || resending) return;

    setResending(true);
    try {
      await otpApi.resend({ email });
      toast.success('A fresh code has been sent to your inbox.');
      cooldown.start(); // Start cooldown only on success
    } catch (err) {
      const isRateLimited = err?.response?.status === 429;
      if (isRateLimited) {
        toast.error('Too many requests. Please wait a minute before retrying.');
        cooldown.start(); // Force cooldown on 429 too
      } else {
        toast.error(getErrorMessage(err));
      }
    } finally {
      setResending(false);
    }
  };

  // Don't flash blank before redirect kicks in
  if (!email) return null;

  const otpString = otp.join('');
  const isComplete = otpString.length === OTP_LENGTH;

  return (
    <div className="auth-page">
      <Motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="auth-header">
          <div className="logo-wrapper">
            <Logo size="lg" linkTo="/" />
          </div>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--accent-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'var(--accent)',
            }}
            aria-hidden="true"
          >
            <ShieldCheck size={28} />
          </div>
          <h1>Verify Your Email</h1>
          <p>
            We sent a 6-digit code to{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
          </p>
        </div>

        {/* OTP inputs — shake on error */}
        <Motion.div
          className="otp-input-group"
          onPaste={handlePaste}
          animate={hasError ? { x: [0, -8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
        >
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              className={`otp-input ${hasError ? 'otp-input-error' : ''}`}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onFocus={(e) => e.target.select()}
              aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
              aria-invalid={hasError || undefined}
              disabled={loading}
            />
          ))}
        </Motion.div>

        {/* Screen-reader progress announcement */}
        <p className="sr-only" aria-live="polite">
          {otpString.length} of {OTP_LENGTH} digits entered
        </p>

        {/* Inline server error */}
        {serverError && (
          <div
            role="alert"
            aria-live="assertive"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              marginTop: 12,
              background: 'var(--danger-bg)',
              color: 'var(--danger)',
              border: '1px solid var(--danger-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
            }}
          >
            <AlertCircle size={16} aria-hidden="true" />
            <span>{serverError}</span>
          </div>
        )}

        <div style={{ marginTop: 24 }}>
          <Button
            fullWidth
            size="lg"
            loading={loading}
            loadingText="Verifying…"
            disabled={!isComplete || loading}
            onClick={handleVerify}
          >
            Verify Email
          </Button>
        </div>

        <div className="auth-footer" style={{ marginTop: 20 }}>
          <p>
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || cooldown.isActive}
              style={{
                background: 'none',
                border: 'none',
                color: cooldown.isActive ? 'var(--text-tertiary)' : 'var(--accent)',
                fontWeight: 500,
                cursor: cooldown.isActive || resending ? 'not-allowed' : 'pointer',
                padding: 0,
              }}
            >
              {resending
                ? 'Sending…'
                : cooldown.isActive
                  ? `Resend in ${cooldown.secondsLeft}s`
                  : 'Resend OTP'}
            </button>
          </p>

          <p style={{ marginTop: 8 }}>
            Wrong email?{' '}
            <Link
              to="/register"
              state={{ email }}
              style={{ color: 'var(--accent)', fontWeight: 500 }}
            >
              Change it
            </Link>
          </p>

          <p style={{ marginTop: 8 }}>
            <Link to="/login">Back to login</Link>
          </p>
        </div>
      </Motion.div>
    </div>
  );
};

export default OtpVerifyPage;