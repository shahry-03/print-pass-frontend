import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Store,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Printer,
  Globe,
  Smartphone,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, Input } from '../components/ui';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState({
    shopName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
  });

  const errors = {
    shopName: touched.shopName && !form.shopName.trim() ? 'Shop name required' : '',
    ownerName: touched.ownerName && !form.ownerName.trim() ? 'Owner name required' : '',
    email: touched.email && !/^\S+@\S+\.\S+$/.test(form.email) ? 'Valid email required' : '',
    phone:
      touched.phone && !/^\+?[0-9]{10,15}$/.test(form.phone.replace(/\s/g, ''))
        ? 'Valid phone (10-15 digits)'
        : '',
    address: touched.address && !form.address.trim() ? 'Address required' : '',
    password: touched.password && form.password.length < 8 ? 'Password must be at least 8 characters' : '',
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBlur = (name: string) => setTouched((prev) => ({ ...prev, [name]: true }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched = Object.keys(form).reduce<Record<string, boolean>>((acc, key) => ({ ...acc, [key]: true }), {});
    setTouched(allTouched);

    const syncErrors = {
      shopName: !form.shopName.trim() ? 'Shop name required' : '',
      ownerName: !form.ownerName.trim() ? 'Owner name required' : '',
      email: !/^\S+@\S+\.\S+$/.test(form.email) ? 'Valid email required' : '',
      phone: !/^\+?[0-9]{10,15}$/.test(form.phone.replace(/\s/g, '')) ? 'Valid phone (10-15 digits)' : '',
      address: !form.address.trim() ? 'Address required' : '',
      password: form.password.length < 8 ? 'Password must be at least 8 characters' : '',
    };
    if (Object.values(syncErrors).some(Boolean)) {
      toast.error('Please fix the highlighted fields');
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      toast.success('Registration successful! Verify your email next.');
      navigate('/verify-otp', { state: { email: form.email } });
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'shopName' as const, label: 'Shop Name', icon: <Store size={18} />, placeholder: 'e.g., City Prints', type: 'text' },
    { name: 'ownerName' as const, label: 'Contact Person', icon: <User size={18} />, placeholder: 'Your full name', type: 'text' },
    { name: 'email' as const, label: 'Email', icon: <Mail size={18} />, placeholder: 'you@example.com', type: 'email' },
    { name: 'phone' as const, label: 'Phone', icon: <Phone size={18} />, placeholder: '+91 98765 43210', type: 'tel' },
    { name: 'address' as const, label: 'Shop Address', icon: <MapPin size={18} />, placeholder: 'Street, area', type: 'text' },
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-3 sm:px-4 py-6 sm:py-12 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-primary-50/40 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 hidden md:block w-96 h-96 bg-primary-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 hidden md:block w-80 h-80 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-full max-w-2xl"
      >
        <Card className="rounded-2xl sm:rounded-3xl backdrop-blur-md p-5 sm:p-10">
          <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
            <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center shadow-lg shadow-primary-500/30 mb-4">
              <Store size={30} className="text-white" aria-hidden />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Register your shop</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md">
              Create an account to receive print jobs. You&apos;ll verify your email with a one-time code.
            </p>
          </div>

          <div className="mb-6 sm:mb-8 rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/90 dark:bg-emerald-950/25 px-4 py-3 flex items-start gap-3 text-left text-sm text-emerald-800 dark:text-emerald-200">
            <Shield className="w-5 h-5 shrink-0 mt-0.5" aria-hidden />
            <span>Your details are sent securely. We&apos;ll email you a {6}-digit OTP after you submit.</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" noValidate>
            {fields.map((field, idx) => {
              const err = errors[field.name];
              const isTouched = touched[field.name];
              const fieldId = `register-${field.name}-${idx}`;
              return (
                <div key={field.name}>
                  <label htmlFor={fieldId} className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">
                    {field.label}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden>
                      {field.icon}
                    </span>
                    <Input
                      id={fieldId}
                      name={field.name}
                      type={field.type}
                      value={form[field.name]}
                      onChange={handleChange}
                      onBlur={() => handleBlur(field.name)}
                      autoComplete={field.name === 'email' ? 'email' : field.name === 'phone' ? 'tel' : 'off'}
                      aria-invalid={!!err && !!isTouched}
                      className="ui-input pl-11 pr-4 py-2.5 sm:py-3 text-sm"
                      placeholder={field.placeholder}
                    />
                  </div>
                  <AnimatePresence>
                    {err && isTouched && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
                        id={`${fieldId}-err`}
                      >
                        <AlertCircle size={12} aria-hidden />
                        {err}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            <div>
              <label htmlFor="register-password" className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden />
                <Input
                  id="register-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  autoComplete="new-password"
                  aria-invalid={!!errors.password && !!touched.password}
                  className="ui-input pl-11 pr-12 py-2.5 sm:py-3 text-sm"
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && touched.password && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle size={12} aria-hidden />
                  {errors.password}
                </p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.99 }}
              className="btn-press ui-btn-primary w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-all text-sm mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Continue to verification
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          <div className="relative my-6 sm:my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white dark:bg-slate-800 text-slate-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => toast('Google sign-up coming soon')}
              className="btn-press flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
            >
              <Globe size={18} aria-hidden />
              Google
            </button>
            <button
              type="button"
              onClick={() => toast('Apple sign-up coming soon')}
              className="btn-press flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
            >
              <Smartphone size={18} aria-hidden />
              Apple
            </button>
          </div>

          <p className="mt-6 sm:mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline inline-flex items-center gap-1">
              Sign in
              <ArrowRight size={12} />
            </Link>
          </p>

          <p className="mt-4 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <Printer size={14} aria-hidden />
              Back to home
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
