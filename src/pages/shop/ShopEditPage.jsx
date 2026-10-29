import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import {
  Store, User, Phone, MapPin, Building, ArrowLeft, AlertCircle, RefreshCw,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { shopApi } from '../../api/shopApi';
import { getErrorMessage } from '../../utils/helpers';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

// ── Constants (must match shopApi validation) ──
const PHONE_REGEX = /^\+?[0-9]{10,15}$/;
const DESKTOP_BREAKPOINT = 768;

// Strips spaces, dashes, parentheses (matches shopApi sanitization)
const sanitizePhone = (v) => String(v || '').replace(/[\s\-()]/g, '');

/**
 * ShopEditPage — Edit an existing print shop's profile details.
 *
 * Features:
 * - Resilient loading: uses navigation state for instant render, but falls
 *   back to fetching from API when state is missing (page refresh, direct URL).
 * - Phone validation matches shopApi sanitization (accepts spaces/dashes).
 * - `isDirty` guard — Save disabled when no changes, Cancel warns before
 *   discarding, `beforeunload` warns on tab close.
 * - Reset button to restore original values.
 * - Proper autocomplete attributes.
 * - Desktop-only auto-focus.
 */
const ShopEditPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // ── Shop state (from nav state OR fetched from API) ──
  const [shop, setShop] = useState(() => location.state?.shop || null);
  const [fetching, setFetching] = useState(!location.state?.shop);
  const [fetchError, setFetchError] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
    setFocus,
  } = useForm({
    defaultValues: {
      shopName: shop?.shopName || '',
      ownerName: shop?.ownerName || '',
      phone: shop?.phone || '',
      address: shop?.address || '',
      city: shop?.city || '',
    },
    mode: 'onTouched',
  });

  // ── Fetch shop if not provided via navigation state (page refresh, direct URL) ──
  useEffect(() => {
    if (shop) {
      setFetching(false);
      return undefined;
    }

    let cancelled = false;
    const controller = new AbortController();

    (async () => {
      try {
        const shops = await shopApi.getMyShops(controller.signal);
        if (cancelled) return;

        const found = Array.isArray(shops)
          ? shops.find((s) => String(s.id) === String(id))
          : null;

        if (!found) {
          setFetchError('This shop could not be found.');
          return;
        }

        setShop(found);
        reset({
          shopName: found.shopName || '',
          ownerName: found.ownerName || '',
          phone: found.phone || '',
          address: found.address || '',
          city: found.city || '',
        });
      } catch (err) {
        if (cancelled) return;
        if (err.name === 'CanceledError' || err.name === 'AbortError') return;
        setFetchError(getErrorMessage(err));
      } finally {
        if (!cancelled) setFetching(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [id, shop, reset]);

  // ── Desktop-only auto-focus ──
  useEffect(() => {
    if (fetching || !shop) return;
    if (typeof window !== 'undefined' && window.innerWidth >= DESKTOP_BREAKPOINT) {
      setFocus('shopName');
    }
  }, [fetching, shop, setFocus]);

  // ── Warn before closing tab with unsaved changes ──
  useEffect(() => {
    if (!isDirty) return undefined;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  // ── Submit ──
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await shopApi.updateShop(id, data);
      toast.success('Shop updated successfully!');
      reset(data); // Clear isDirty so beforeunload doesn't fire
      navigate('/shop', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // ── Cancel (warn if dirty) ──
  const handleCancel = useCallback(() => {
    if (isDirty && !window.confirm('You have unsaved changes. Discard them?')) {
      return;
    }
    navigate('/shop');
  }, [isDirty, navigate]);

  // ── Reset to original values ──
  const handleReset = useCallback(() => {
    if (!shop) return;
    reset({
      shopName: shop.shopName || '',
      ownerName: shop.ownerName || '',
      phone: shop.phone || '',
      address: shop.address || '',
      city: shop.city || '',
    });
  }, [shop, reset]);

  // ═══════════════════════════════════════════════════════════
  // Loading / Error states
  // ═══════════════════════════════════════════════════════════

  if (fetching) {
    return (
      <div className="shop-edit-page">
        <Spinner size="lg" label="Loading shop details" />
      </div>
    );
  }

  if (fetchError || !shop) {
    return (
      <div className="shop-edit-page">
        <EmptyState
          variant="error"
          icon={AlertCircle}
          title="Couldn't load this shop"
          description={fetchError || 'This shop could not be found.'}
          action="Back to My Shops"
          onAction={() => navigate('/shop', { replace: true })}
        />
      </div>
    );
  }

  return (
    <div className="shop-edit-page">
      <Motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="shop-edit-back">
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={handleCancel}
          >
            Back to My Shops
          </Button>
        </div>

        <Card className="shop-edit-card">
          <div className="shop-edit-header">
            <h1>Edit Shop Profile</h1>
            <p>
              Update information for <strong>{shop.shopName}</strong>
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
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
            </div>

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
                // ✓ FIX: sanitize BEFORE validate (matches shopApi)
                setValueAs: sanitizePhone,
                validate: (v) => PHONE_REGEX.test(v) || 'Invalid phone number',
              })}
            />

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

            <div className="shop-edit-actions">
              <Button
                type="button"
                variant="ghost"
                icon={RefreshCw}
                onClick={handleReset}
                disabled={!isDirty || loading}
              >
                Reset
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading || isSubmitting}
                loadingText="Saving…"
                disabled={!isDirty || loading}
                className="shop-edit-save"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </Motion.div>
    </div>
  );
};

export default ShopEditPage;