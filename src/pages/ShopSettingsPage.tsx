import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Store,
  User,
  Phone,
  MapPin,
  Building2,
  Save,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/httpError';
import { shopService } from '../services';
import type { ShopResponse, ShopUpdateRequest } from '../types';
import { Link } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  FormField,
  IconField,
  Input,
  LoadingSpinner,
  PageHeader,
} from '../components/ui';

const ShopSettingsPage = () => {
  const [shops, setShops] = useState<ShopResponse[]>([]);
  const [selectedShop, setSelectedShop] = useState<ShopResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ShopUpdateRequest>({
    shopName: '',
    ownerName: '',
    phone: '',
    address: '',
    city: '',
  });

  const loadShops = useCallback(async () => {
    setLoading(true);
    try {
      const data = await shopService.getMyShops();
      setShops(data);
      if (data.length > 0) selectShop(data[0]);
    } catch {
      toast.error('Failed to load shops');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShops();
  }, [loadShops]);

  const selectShop = (shop: ShopResponse) => {
    setSelectedShop(shop);
    setForm({
      shopName: shop.shopName,
      ownerName: shop.ownerName,
      phone: shop.phone,
      address: shop.address,
      city: shop.city,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShop) return;
    setSaving(true);
    try {
      const updated = await shopService.updateShop(selectedShop.id, form);
      setShops((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setSelectedShop(updated);
      toast.success('Shop updated successfully!');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Update failed'));
    } finally {
      setSaving(false);
    }
  };

  const fields: Array<{
    name: keyof ShopUpdateRequest;
    label: string;
    icon: ReactNode;
  }> = [
    { name: 'shopName', label: 'Shop Name', icon: <Store size={18} /> },
    { name: 'ownerName', label: 'Owner Name', icon: <User size={18} /> },
    { name: 'phone', label: 'Phone', icon: <Phone size={18} /> },
    { name: 'address', label: 'Address', icon: <MapPin size={18} /> },
    { name: 'city', label: 'City', icon: <Building2 size={18} /> },
  ];

  if (loading) return <LoadingSpinner text="Loading shop settings..." />;

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <PageHeader
          title="Shop Settings"
          subtitle="Edit your print shop profile"
          icon={<Settings size={28} className="text-primary-500" />}
        />
      </motion.div>

      {/* Shop selector (if multiple) */}
      {shops.length > 1 && (
        <div className="mb-5 sm:mb-6 flex gap-2 overflow-x-auto pb-2">
          {shops.map((shop) => (
            <Button
              key={shop.id}
              onClick={() => selectShop(shop)}
              variant="ghost"
              className={`shrink-0 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                selectedShop?.id === shop.id
                  ? 'gradient-hero text-white shadow-lg shadow-primary-500/25 hover:opacity-95'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {shop.shopName}
            </Button>
          ))}
        </div>
      )}

      {!loading && shops.length === 0 && (
        <EmptyState
          icon={<Store />}
          title="No shops on your account"
          description="Register a print shop or contact support if you believe this is an error."
        >
          <Link
            to="/register"
            className="btn-press ui-btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-opacity"
          >
            Register a shop
          </Link>
        </EmptyState>
      )}

      {selectedShop && (
        <motion.div
          key={selectedShop.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-5 sm:p-8 rounded-2xl">
          {/* Status badges */}
          <div className="flex flex-wrap gap-2 mb-5 sm:mb-6">
            {selectedShop.isVerified ? (
              <Badge variant="success">Verified</Badge>
            ) : (
              <Badge variant="warning">Pending Verification</Badge>
            )}
            {selectedShop.isActive ? (
              <Badge variant="info">Active</Badge>
            ) : (
              <Badge variant="danger">Inactive</Badge>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-4 sm:space-y-5">
            {fields.map((f) => (
              <FormField key={f.name} id={f.name} label={f.label}>
                <IconField icon={f.icon}>
                  <Input
                    id={f.name}
                    name={f.name}
                    value={form[f.name]}
                    onChange={handleChange}
                    required
                    className="pl-11 pr-4 py-2.5 sm:py-3 text-sm"
                  />
                </IconField>
              </FormField>
            ))}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="submit"
                disabled={saving}
                variant="primary"
                className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold disabled:opacity-60 disabled:cursor-not-allowed text-sm"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={() => selectedShop && selectShop(selectedShop)}
                variant="ghost"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                Reset
              </Button>
            </div>
          </form>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default ShopSettingsPage;
