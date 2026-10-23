import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import {
  Store, MapPin, Phone, Calendar,
  Edit, CheckCircle, XCircle, AlertCircle,
  ScanLine, Plus, ShieldCheck, Activity,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { shopApi } from '../../api/shopApi';
import { getErrorMessage, formatDate } from '../../utils/helpers';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

const ShopDashboard = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const res = await shopApi.getMyShops();
      setShops(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner size="lg" />;

  // Calculate real metrics strictly from existing shop records
  const totalShops = shops.length;
  const verifiedShops = shops.filter((s) => s.isVerified).length;
  const activeShops = shops.filter((s) => s.isActive).length;

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1>My Shops</h1>
            <p>Manage your registered print locations and terminal status</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/shop/print">
              <Button variant="secondary" icon={ScanLine}>
                Launch Print Station
              </Button>
            </Link>
            <Link to="/register">
              <Button icon={Plus}>
                Register Another Shop
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Metric Summary Strip (Computed only from real shop state) ── */}
      {shops.length > 0 && (
        <div className="stats-strip">
          <div className="stat-metric-card">
            <div className="stat-metric-icon">
              <Store size={22} />
            </div>
            <div>
              <div className="stat-metric-label">Registered Shops</div>
              <div className="stat-metric-value">{totalShops}</div>
            </div>
          </div>

          <div className="stat-metric-card">
            <div className="stat-metric-icon success">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="stat-metric-label">Verified Locations</div>
              <div className="stat-metric-value">{verifiedShops}</div>
            </div>
          </div>

          <div className="stat-metric-card">
            <div className="stat-metric-icon info">
              <Activity size={22} />
            </div>
            <div>
              <div className="stat-metric-label">Active Terminals</div>
              <div className="stat-metric-value">{activeShops}</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Shop Grid or Empty State ── */}
      {shops.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No registered shops found"
          description="You haven't registered any print shops yet. Register your first shop to start receiving print requests from students."
          action={
            <Link to="/register">
              <Button icon={Plus}>Register Your Shop</Button>
            </Link>
          }
        />
      ) : (
        <div className={`dashboard-grid ${shops.length === 1 ? 'single-card' : ''}`}>
          {shops.map((shop, i) => (
            <Motion.div
              key={shop.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
            >
              <div className="shop-card-wrapper">
                {/* Header Row */}
                <div className="shop-card-header">
                  <div className="shop-card-title-group">
                    <h2 className="shop-card-title">{shop.shopName}</h2>
                    <div className="shop-card-owner-badge">
                      <span className="shop-card-owner-avatar">
                        {shop.ownerName ? shop.ownerName.charAt(0).toUpperCase() : 'O'}
                      </span>
                      <span>Owner: <strong>{shop.ownerName}</strong></span>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="shop-card-badges">
                    {shop.isVerified ? (
                      <Badge variant="success">
                        <CheckCircle size={12} /> Verified
                      </Badge>
                    ) : (
                      <Badge variant="warning">
                        <AlertCircle size={12} /> Pending Review
                      </Badge>
                    )}
                    {shop.isActive ? (
                      <Badge variant="success">
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="danger">
                        <XCircle size={12} /> Inactive
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Metadata List */}
                <div className="shop-card-info-list">
                  <div className="shop-card-info-row">
                    <MapPin size={16} />
                    <span>{shop.address}, <strong>{shop.city}</strong></span>
                  </div>
                  <div className="shop-card-info-row">
                    <Phone size={16} />
                    <span className="mono">{shop.phone}</span>
                  </div>
                  <div className="shop-card-info-row">
                    <Calendar size={16} />
                    <span>Registered on {formatDate(shop.createdAt)}</span>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="shop-card-actions">
                  <Link to={`/shop/${shop.id}/edit`} state={{ shop }}>
                    <Button variant="secondary" size="sm" icon={Edit}>
                      Edit Details
                    </Button>
                  </Link>

                  <Link to="/shop/print">
                    <Button variant="ghost" size="sm" icon={ScanLine}>
                      Open Terminal
                    </Button>
                  </Link>
                </div>
              </div>
            </Motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopDashboard;

