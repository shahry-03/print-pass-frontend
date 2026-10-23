import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Store, User, Phone, MapPin, Building } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { shopApi } from '../../api/shopApi';
import { getErrorMessage } from '../../utils/helpers';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Logo from '../../components/common/Logo';

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await shopApi.register(data);
      toast.success('Registration successful! Check your email for OTP.');
      navigate('/verify-otp', { state: { email: data.email } });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <motion.div
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

        <form className="register-form" onSubmit={handleSubmit(onSubmit)}>
          {/* Section 1 — Account Credentials */}
          <div className="form-section">
            <div className="form-section-header">
              <p className="form-section-title">Account Credentials</p>
              <p className="form-section-desc">Used to sign in to your shop dashboard</p>
            </div>
            <div className="form-grid-2col">
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
                    message: 'Invalid email',
                  },
                })}
              />
              <Input
                label="Password"
                type="password"
                placeholder="Min 8 chars, 1 letter & 1 number"
                icon={Lock}
                error={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                  pattern: {
                    value: /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
                    message: 'Min 8 chars, 1 letter & 1 number',
                  },
                })}
              />
            </div>
          </div>

          {/* Section 2 — Business Information */}
          <div className="form-section">
            <div className="form-section-header">
              <p className="form-section-title">Business Information</p>
              <p className="form-section-desc">Shown to customers on the platform</p>
            </div>
            <div className="form-grid-2col">
              <Input
                label="Shop Name"
                placeholder="My Print Shop"
                icon={Store}
                error={errors.shopName?.message}
                {...register('shopName', {
                  required: 'Shop name is required',
                  maxLength: { value: 100, message: 'Max 100 characters' },
                })}
              />
              <Input
                label="Owner Name"
                placeholder="John Doe"
                icon={User}
                error={errors.ownerName?.message}
                {...register('ownerName', {
                  required: 'Owner name is required',
                  maxLength: { value: 100, message: 'Max 100 characters' },
                })}
              />
              <Input
                label="Phone Number"
                placeholder="+92XXXXXXXXXX"
                icon={Phone}
                error={errors.phone?.message}
                {...register('phone', {
                  required: 'Phone is required',
                  pattern: {
                    value: /^\+?[0-9]{10,15}$/,
                    message: 'Invalid phone number',
                  },
                })}
              />
            </div>
          </div>

          {/* Section 3 — Shop Location */}
          <div className="form-section">
            <div className="form-section-header">
              <p className="form-section-title">Shop Location</p>
              <p className="form-section-desc">Helps students find your shop nearby</p>
            </div>
            <div className="form-grid-2col">
              <div className="form-grid-full">
                <Input
                  label="Address"
                  placeholder="Shop #12, Main Market"
                  icon={MapPin}
                  error={errors.address?.message}
                  {...register('address', {
                    required: 'Address is required',
                    maxLength: { value: 255, message: 'Max 255 characters' },
                  })}
                />
              </div>
              <Input
                label="City"
                placeholder="Karachi"
                icon={Building}
                error={errors.city?.message}
                {...register('city', {
                  required: 'City is required',
                  maxLength: { value: 100, message: 'Max 100 characters' },
                })}
              />
            </div>
          </div>

          <Button
            type="submit"
            fullWidth
            loading={loading}
            size="lg"
          >
            Create Account
          </Button>
        </form>

        <div className="register-footer">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;

