import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authApi } from '../../api/authApi';
import { useAuthStore } from '../../store/authStore';
import { ROLE_DASHBOARD_MAP } from '../../components/guards/RoleGuard';
import { getErrorMessage } from '../../utils/helpers';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Logo from '../../components/common/Logo';

// ── Constants ──
const REMEMBERED_EMAIL_KEY = 'pp_remembered_email';
const DESKTOP_BREAKPOINT = 768;

// Read remembered email safely (localStorage may throw in private mode)
const getRememberedEmail = () => {
  try { return localStorage.getItem(REMEMBERED_EMAIL_KEY) || ''; }
  catch { return ''; }
};

// Persist or clear remembered email — safe across browser modes
const setRememberedEmail = (email) => {
  try {
    if (email) localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
    else localStorage.removeItem(REMEMBERED_EMAIL_KEY);
  } catch {
    /* ignore storage errors (private mode, quota, etc.) */
  }
};

/**
 * LoginPage — Role-aware authentication.
 *
 * Features:
 * - Direct data from authApi.login() (no `.data` extraction)
 * - Redirect priority: state.from > ROLE_DASHBOARD_MAP[role] > '/'
 * - Remember-me persists email in localStorage (safe, self-cleaning)
 * - Auto-focus email on desktop only (mobile keeps keyboard hidden)
 * - "Forgot password?" link
 * - Inline server error + toast + aria-live
 * - Proper autocomplete attributes (password manager compatible)
 * - Loading state via Button's `loadingText` prop (no ternary)
 */
const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);

  // Where should the user land after successful login?
  const redirectTarget = location.state?.from?.pathname;

  // Remember-me — initial state derived from storage
  const [rememberedEmail] = useState(getRememberedEmail);
  const [rememberMe, setRememberMe] = useState(() => Boolean(getRememberedEmail()));

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setFocus,
  } = useForm({
    defaultValues: { email: rememberedEmail, password: '' },
    mode: 'onTouched',
  });

  // ✓ FIX: Auto-focus on desktop only — mobile would pop the virtual keyboard,
  //         causing layout shift and poor first-impression UX.
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= DESKTOP_BREAKPOINT) {
      setFocus('email');
    }
  }, [setFocus]);

  // ✓ FIX: Instant cleanup when user unchecks — even without submitting,
  //         this ensures the stored email won't reappear on next visit.
  const handleRememberToggle = useCallback((e) => {
    const checked = e.target.checked;
    setRememberMe(checked);
    if (!checked) {
      setRememberedEmail(null); // Clears localStorage immediately
    }
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError(null);

    try {
      const { token, role, email, expiresIn } = await authApi.login(data);

      setAuth({ token, role, email, expiresIn });

      // Persist email only on successful login (avoids saving on failed attempts)
      if (rememberMe) setRememberedEmail(email);

      toast.success('Welcome back!');

      // Priority: originally-requested page > role dashboard > fallback
      const target = redirectTarget || ROLE_DASHBOARD_MAP[role] || '/';
      navigate(target, { replace: true });
    } catch (err) {
      const message = getErrorMessage(err);
      setServerError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

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
          <h1>Welcome back</h1>
          <p>Sign in to your PrintPass account</p>

          {redirectTarget && (
            <p
              className="text-sm"
              role="status"
              style={{
                marginTop: 12,
                padding: '8px 12px',
                background: 'var(--info-bg)',
                color: 'var(--info)',
                border: '1px solid var(--info-border)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              Please sign in to continue to <strong>{redirectTarget}</strong>
            </p>
          )}
        </div>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input
            label="Email Address"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            icon={Mail}
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Invalid email format',
              },
            })}
          />

          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            icon={Lock}
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              // ✓ Only minLength on login — no character-class regex here.
              //   Password strength is enforced at REGISTRATION (shopApi),
              //   not at login. Legacy users must not be blocked.
              minLength: { value: 8, message: 'Password must be at least 8 characters' },
            })}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={handleRememberToggle}
                className="checkbox-input"
              />
              <span className="text-sm">Remember me</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-sm fw-500"
              style={{ color: 'var(--accent)' }}
            >
              Forgot password?
            </Link>
          </div>

          {serverError && (
            <div
              role="alert"
              aria-live="assertive"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
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

          <Button
            type="submit"
            fullWidth
            loading={loading || isSubmitting}
            loadingText="Signing in…"
            disabled={loading}
            size="lg"
          >
            Sign In
          </Button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Register your shop</Link>
        </div>
      </Motion.div>
    </div>
  );
};

export default LoginPage;