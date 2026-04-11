import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Store, MapPin, Phone, Calendar,
  CheckCircle, XCircle, AlertCircle,
  ShieldCheck, Power,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/adminApi';
import { getErrorMessage, formatDate } from '../../utils/helpers';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

const AdminDashboard = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const res = await adminApi.getAllShops();
      setShops(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (shopId) => {
    setActionLoading((prev) => ({ ...prev, [`verify-${shopId}`]: true }));
    try {
      await adminApi.verifyShop(shopId);
      toast.success('Shop verified!');
      // Update local state
      setShops((prev) =>
        prev.map((s) =>
          s.id === shopId ? { ...s, isVerified: true } : s
        )
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading((prev) => ({ ...prev, [`verify-${shopId}`]: false }));
    }
  };

  const handleToggle = async (shopId) => {
    setActionLoading((prev) => ({ ...prev, [`toggle-${shopId}`]: true }));
    try {
      await adminApi.toggleShopStatus(shopId);
      toast.success('Shop status updated!');
      setShops((prev) =>
        prev.map((s) =>
          s.id === shopId ? { ...s, isActive: !s.isActive } : s
        )
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading((prev) => ({ ...prev, [`toggle-${shopId}`]: false }));
    }
  };

  if (loading) return <Spinner size="lg" />;

  // Stats
  const totalShops = shops.length;
  const verifiedShops = shops.filter((s) => s.isVerified).length;
  const activeShops = shops.filter((s) => s.isActive).length;
  const pendingShops = shops.filter((s) => !s.isVerified).length;

  return (
    <div>
      <div className="page-header">
        <h1>Shop Management</h1>
        <p>Verify and manage registered print shops</p>
      </div>

      {/* Stats */}
      <div className="stats-row">
        {[
          { label: 'Total Shops', value: totalShops, color: 'var(--text-primary)' },
          { label: 'Verified', value: verifiedShops, color: 'var(--success)' },
          { label: 'Active', value: activeShops, color: 'var(--info)' },
          { label: 'Pending', value: pendingShops, color: 'var(--warning)' },
        ].map((stat) => (
          <div className="stat-card" key={stat.label}>
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value" style={{ color: stat.color }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      {shops.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No shops registered"
          description="No print shops have registered yet."
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Shop Name</th>
                  <th>Owner</th>
                  <th>City</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shops.map((shop) => (
                  <tr key={shop.id}>
                    <td>
                      <strong>{shop.shopName}</strong>
                    </td>
                    <td>{shop.ownerName}</td>
                    <td>{shop.city}</td>
                    <td className="mono text-sm">{shop.phone}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {shop.isVerified ? (
                          <Badge variant="success">
                            <CheckCircle size={11} /> Verified
                          </Badge>
                        ) : (
                          <Badge variant="warning">
                            <AlertCircle size={11} /> Pending
                          </Badge>
                        )}
                        {shop.isActive ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="danger">
                            <XCircle size={11} /> Blocked
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="text-sm text-muted">
                      {formatDate(shop.createdAt)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {!shop.isVerified && (
                          <Button
                            variant="success"
                            size="sm"
                            icon={ShieldCheck}
                            loading={actionLoading[`verify-${shop.id}`]}
                            onClick={() => handleVerify(shop.id)}
                          >
                            Verify
                          </Button>
                        )}
                        <Button
                          variant={shop.isActive ? 'danger' : 'secondary'}
                          size="sm"
                          icon={Power}
                          loading={actionLoading[`toggle-${shop.id}`]}
                          onClick={() => handleToggle(shop.id)}
                        >
                          {shop.isActive ? 'Block' : 'Unblock'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminDashboard;
