import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authApi } from '../../api/authApi';
import { useAuthStore } from '../../store/authStore';
import { ROLES } from '../../utils/constants';
import { getErrorMessage } from '../../utils/helpers';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Logo from '../../components/common/Logo';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authApi.login(data);
      const { token, role, email, expiresIn } = res.data;

      setAuth({ token, role, email, expiresIn });
      toast.success('Welcome back!');

      // Redirect based on role
      if (role === ROLES.ADMIN) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/shop', { replace: true });
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

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
          <h1>Welcome back</h1>
          <p>Sign in to your PrintPass account</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Email Address"
            type="email"
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
            placeholder="••••••••"
            icon={Lock}
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
            })}
          />

          <Button
            type="submit"
            fullWidth
            loading={loading}
            size="lg"
          >
            Sign In
          </Button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register">Register your shop</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
