import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Store,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  MapPin,
  Phone,
  User,
  RefreshCw,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/httpError';
import { adminService } from '../services';
import type { ShopResponse } from '../types';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  IconField,
  Input,
  LoadingSpinner,
  PageHeader,
  StatCard,
} from '../components/ui';

const AdminDashboardPage = () => {
  const [shops, setShops] = useState<ShopResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllShops();
      setShops(data);
    } catch {
      toast.error('Failed to load shops');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (shopId: string) => {
    setActionLoading(shopId);
    try {
      await adminService.verifyShop(shopId);
      setShops((prev) =>
        prev.map((s) => (s.id === shopId ? { ...s, isVerified: true } : s))
      );
      toast.success('Shop verified!');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Verification failed'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (shopId: string) => {
    setActionLoading(shopId);
    try {
      await adminService.toggleShopStatus(shopId);
      setShops((prev) =>
        prev.map((s) => (s.id === shopId ? { ...s, isActive: !s.isActive } : s))
      );
      toast.success('Status toggled!');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Toggle failed'));
    } finally {
      setActionLoading(null);
    }
  };

  const filteredShops = shops.filter(
    (s) =>
      s.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <PageHeader
          title="Admin Panel"
          subtitle="Manage and verify all registered print shops"
          icon={<Shield size={28} className="text-primary-500" />}
        />
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8"
      >
        {[
          { label: 'Total Shops', value: shops.length, color: 'from-primary-500 to-purple-600' },
          { label: 'Verified', value: shops.filter((s) => s.isVerified).length, color: 'from-emerald-500 to-teal-600' },
          { label: 'Active', value: shops.filter((s) => s.isActive).length, color: 'from-blue-500 to-cyan-600' },
        ].map(({ label, value, color }) => (
          <StatCard
            key={label}
            label={label}
            value={<span className={`bg-gradient-to-r ${color} bg-clip-text text-transparent`}>{value}</span>}
          />
        ))}
      </motion.div>

      {/* Search + Refresh */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5 sm:mb-6"
      >
        <IconField icon={<Search size={18} />} className="w-full sm:flex-1 sm:max-w-md">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search shops by name, city, or owner..."
            className="pl-11 pr-4 py-2.5 sm:py-3 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          />
        </IconField>
        <Button
          onClick={loadShops}
          variant="ghost"
          className="w-full sm:w-auto p-2.5 sm:p-3 rounded-xl text-slate-400 hover:text-primary-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary-300"
          aria-label="Refresh"
        >
          <RefreshCw size={18} />
        </Button>
      </motion.div>

      {/* Shops Table */}
      {loading ? (
        <LoadingSpinner text="Loading all shops..." />
      ) : filteredShops.length === 0 ? (
        <EmptyState
          icon={searchTerm ? <Search /> : <Store />}
          title={searchTerm ? 'No matching shops' : 'No shops registered yet'}
          description={
            searchTerm
              ? 'Try a different name, city, or owner keyword — or clear the search to see all shops.'
              : 'When print shops sign up, they will show up here for verification and status management.'
          }
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {filteredShops.map((shop, i) => (
            <motion.div
              key={shop.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="p-4 sm:p-5 rounded-2xl hover:shadow-md hover:border-primary-200 dark:hover:border-primary-700 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                      <Store size={18} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">{shop.shopName}</h3>
                    <div className="flex gap-1.5">
                      {shop.isVerified ? (
                        <Badge variant="success" className="px-2 py-0.5">
                          <CheckCircle2 size={10} /> Verified
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="px-2 py-0.5">
                          <XCircle size={10} /> Unverified
                        </Badge>
                      )}
                      <Badge variant={shop.isActive ? 'info' : 'neutral'} className="px-2 py-0.5">
                        {shop.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1"><User size={12} /> {shop.ownerName}</span>
                    <span className="flex items-center gap-1"><Phone size={12} /> {shop.phone}</span>
                    <span className="flex items-center gap-1"><MapPin size={12} /> {shop.address}, {shop.city}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full sm:w-auto">
                  {!shop.isVerified && (
                    <Button
                      onClick={() => handleVerify(shop.id)}
                      disabled={actionLoading === shop.id}
                      variant="primary"
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-50 bg-gradient-to-r from-emerald-500 to-teal-600 shadow shadow-emerald-500/20"
                    >
                      {actionLoading === shop.id ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 size={14} />
                          Verify
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    onClick={() => handleToggleStatus(shop.id)}
                    disabled={actionLoading === shop.id}
                    variant="ghost"
                    className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-50 ${
                      shop.isActive
                        ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                        : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                    }`}
                  >
                    {shop.isActive ? (
                      <><ToggleRight size={14} /> Deactivate</>
                    ) : (
                      <><ToggleLeft size={14} /> Activate</>
                    )}
                  </Button>
                </div>
              </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
