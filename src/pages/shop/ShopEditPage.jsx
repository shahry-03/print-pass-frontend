import { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { Store, User, Phone, MapPin, Building, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { shopApi } from '../../api/shopApi';
import { getErrorMessage } from '../../utils/helpers';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const ShopEditPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const shop = location.state?.shop;
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      shopName: shop?.shopName || '',
      ownerName: shop?.ownerName || '',
      phone: shop?.phone || '',
      address: shop?.address || '',
      city: shop?.city || '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await shopApi.updateShop(id, data);
      toast.success('Shop updated successfully!');
      navigate('/shop', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!shop) {
    navigate('/shop', { replace: true });
    return null;
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <Motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div style={{ marginBottom: 20 }}>
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/shop')}
          >
            Back to My Shops
          </Button>
        </div>

        <div className="card" style={{ padding: '32px 36px' }}>
          <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
            <h1 style={{ fontSize: '1.5rem', marginBottom: 4 }}>Edit Shop Profile</h1>
            <p className="text-muted text-sm">
              Update information for <strong style={{ color: 'var(--text-primary)' }}>{shop.shopName}</strong>
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
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
            </div>

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

            <div style={{ display: 'flex', gap: 12, marginTop: 12, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/shop')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                style={{ flex: 1 }}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Motion.div>
    </div>
  );
};

export default ShopEditPage;

