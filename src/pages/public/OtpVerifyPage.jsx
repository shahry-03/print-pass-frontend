import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { otpApi } from '../../api/otpApi';
import { getErrorMessage } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import Logo from '../../components/common/Logo';

const OtpVerifyPage = () => {
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) {
      navigate('/register', { replace: true });
    }
  }, [email, navigate]);

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').slice(0, 6);
    if (!/^[0-9]+$/.test(pasted)) return;

    const newOtp = [...otp];
    pasted.split('').forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    try {
      await otpApi.verify({ email, otp: otpString });
      toast.success('Email verified! You can now log in.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await otpApi.resend({ email });
      toast.success('OTP resent! Check your email.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  if (!email) return null;

  return (
    <div className="auth-page">
      <motion.div
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
          >
            <ShieldCheck size={28} />
          </div>
          <h1>Verify Your Email</h1>
          <p>
            We sent a 6-digit code to{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
          </p>
        </div>

        <div className="otp-input-group" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              className="otp-input"
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              autoFocus={index === 0}
            />
          ))}
        </div>

        <div style={{ marginTop: 24 }}>
          <Button
            fullWidth
            size="lg"
            loading={loading}
            onClick={handleVerify}
          >
            Verify Email
          </Button>
        </div>

        <div className="auth-footer" style={{ marginTop: 20 }}>
          <p>
            Didn't receive the code?{' '}
            <button
              onClick={handleResend}
              disabled={resending}
              style={{
                background: 'none',
                color: 'var(--accent)',
                fontWeight: 500,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {resending ? 'Sending...' : 'Resend OTP'}
            </button>
          </p>
          <p style={{ marginTop: 8 }}>
            <Link to="/login">Back to login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default OtpVerifyPage;
