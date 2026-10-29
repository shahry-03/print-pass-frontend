import { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import {
  Mail, Lock, Store, User, Phone, MapPin, Building, AlertCircle,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { shopApi } from '../../api/shopApi';
import { getErrorMessage } from '../../utils/helpers';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Logo from '../../components/common/Logo';

// ── Constants (must match shopApi validation) ──
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9]{10,15}$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const DESKTOP_BREAKPOINT = 768;

// Matches shopApi's phone sanitization — strips spaces, dashes, brackets
const sanitizePhone = (v) => String(v || '').replace(/[\s\-()]/g, '');

// ═══════════════════════════════════════════════════════════
// Password strength meter (inline sub-component)
// ═══════════════════════════════════════════════════════════
const PasswordStrengthMeter = ({ password }) => {
  const { score, label, color } = useMemo(() => {
    if (!password) return { score: 0, label: '', color: 'transparent' };

    let s = 0;
    if (password.length >= 8) s++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) s++;
    if (/\d/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;

    const map = [
      { label: 'Too short', color: 'var(--text-tertiary)' },
      { label: 'Weak', color: 'var(--danger)' },
      { label: 'Fair', color: 'var(--warning)' },
      { label: 'Good', color: 'var(--info)' },
      { label: 'Strong', color: 'var(--success)' },
    ];

    return { score: Math.min(s, 4), ...map[Math.min(s, 4)] };
  }, [password]);

  if (!password) return null;

  return (
    <div style={{ marginTop: 6 }} aria-live="polite">
      <div style={{ display: 'flex', gap: 4 }} aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: i <= score ? color : 'var(--border)',
              transition: 'background 0.15s ease',
            }}
          />
        ))}
      </div>
      <span
        style={{
          fontSize: '0.72rem',
          color,
          marginTop: 4,
          display: 'inline-block',
          fontWeight: 600,
        }}
      >
        {label}
      </span>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

/**
 * RegisterPage — Print shop owner registration.
 *
 * Features:
 * - Prefills email when navigated from OtpVerifyPage "Change email"
 * - Password + confirm password (with matching validation)
 * - Live password strength indicator
 * - Phone validation matches shopApi sanitization (accepts spaces/dashes)
 * - Desktop-only auto-focus (mobile keyboard stays hidden)
 * - `noValidate` (React Hook Form handles validation)
 * - Proper autocomplete attributes for password managers
 * - Inline server error + toast + role="alert"
 * - Section completion progress
 * - Loading via Button's `loadingText`
 */
const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Prefill when arriving from OtpVerifyPage "Change email"
  const prefillEmail = location.state?.email || '';

  const emailRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setFocus,
  } = useForm({
    defaultValues: {
      email: prefillEmail,
      password: '',
      confirmPassword: '',
      shopName: '',
      ownerName: '',
      phone: '',
      address: '',
      city: '',
    },
    mode: 'onTouched',
  });

  const passwordValue = watch('password');

  // Desktop-only auto-focus
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= DESKTOP_BREAKPOINT) {
      setFocus(prefillEmail ? 'password' : 'email');
    }
  }, [setFocus, prefillEmail]);

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError(null);

    // Strip confirmPassword — not part of the API contract
    const { confirmPassword, ...payload } = data;

    try {
      await shopApi.register(payload);
      toast.success('Registration successful! Check your email for the OTP.');
      navigate('/verify-otp', { state: { email: payload.email } });
    } catch (err) {
      const message = getErrorMessage(err);
      setServerError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <Motion.div
        className="register-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="register-header">
          <div className="logo-wrapper">
            <Logo size="lg" linkTo="/" />
          </div>
          <h1>Register Your Shop</h1>
          <p>Join PrintPass and start receiving print jobs from students</p>
        </div>

        <form
          className="register-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          {/* ── Section 1: Account Credentials ── */}
          <div className="form-section">
            <div className="form-section-header">
              <p className="form-section-title">Account Credentials</p>
              <p className="form-section-desc">Used to sign in to your shop dashboard</p>
            </div>

            <div className="form-grid-2col">
              <div className="form-grid-full">
                <Input
                  ref={emailRef}
                  label="Email Address"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  icon={Mail}
                  error={errors.email?.message}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: EMAIL_REGEX,
                      message: 'Invalid email format',
                    },
                  })}
                />
              </div>

              <div>
                <Input
                  label="Password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  icon={Lock}
                  hint="At least 8 characters with 1 letter and 1 number"
                  error={errors.password?.message}
                  {...register('password', {
                    required: 'Password is required',
                    pattern: {
                      value: PASSWORD_REGEX,
                      message: 'Min 8 chars, 1 letter & 1 number',
                    },
                  })}
                />
                <PasswordStrengthMeter password={passwordValue} />
              </div>

              <Input
                label="Confirm Password"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter your password"
                icon={Lock}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  deps: ['password'], // Re-validate when password changes
                  validate: (v, values) =>
                    v === values.password || 'Passwords do not match',
                })}
              />
            </div>
          </div>

          {/* ── Section 2: Business Information ── */}
          <div className="form-section">
            <div className="form-section-header">
              <p className="form-section-title">Business Information</p>
              <p className="form-section-desc">Shown to customers on the platform</p>
            </div>
            <div className="form-grid-2col">
              <Input
                label="Shop Name"
                autoComplete="organization"
                placeholder="My Print Shop"
                icon={Store}
                maxLength={100}
                error={errors.shopName?.message}
                {...register('shopName', {
                  required: 'Shop name is required',
                  maxLength: { value: 100, message: 'Max 100 characters' },
                })}
              />
              <Input
                label="Owner Name"
                autoComplete="name"
                placeholder="John Doe"
                icon={User}
                maxLength={100}
                error={errors.ownerName?.message}
                {...register('ownerName', {
                  required: 'Owner name is required',
                  maxLength: { value: 100, message: 'Max 100 characters' },
                })}
              />
              <div className="form-grid-full">
                <Input
                  label="Phone Number"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+92 300 1234567"
                  icon={Phone}
                  hint="Include country code. Spaces and dashes are okay."
                  error={errors.phone?.message}
                  {...register('phone', {
                    required: 'Phone is required',
                    // ✓ FIX: Sanitize BEFORE validation so "  +92 300 1234567  " passes
                    //   (matches shopApi's exact phone sanitization logic)
                    setValueAs: sanitizePhone,
                    validate: (v) =>
                      PHONE_REGEX.test(v) ||
                      'Enter a valid phone number (10-15 digits, optional + prefix)',
                  })}
                />
              </div>
            </div>
          </div>

          {/* ── Section 3: Shop Location ── */}
          <div className="form-section">
            <div className="form-section-header">
              <p className="form-section-title">Shop Location</p>
              <p className="form-section-desc">Helps students find your shop nearby</p>
            </div>
            <div className="form-grid-2col">
              <div className="form-grid-full">
                <Input
                  label="Address"
                  autoComplete="street-address"
                  placeholder="Shop #12, Main Market"
                  icon={MapPin}
                  maxLength={255}
                  error={errors.address?.message}
                  {...register('address', {
                    required: 'Address is required',
                    maxLength: { value: 255, message: 'Max 255 characters' },
                  })}
                />
              </div>
              <Input
                label="City"
                autoComplete="address-level2"
                placeholder="Karachi"
                icon={Building}
                maxLength={100}
                error={errors.city?.message}
                {...register('city', {
                  required: 'City is required',
                  maxLength: { value: 100, message: 'Max 100 characters' },
                })}
              />
            </div>
          </div>

          {/* ── Inline server error ── */}
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
            loadingText="Creating account…"
            size="lg"
          >
            Create Account
          </Button>
        </form>

        <div className="register-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </Motion.div>
    </div>
  );
};

export default RegisterPage;