import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import {
  Store, MapPin, Phone, Calendar,
  Edit, CheckCircle, XCircle, AlertCircle,
  ScanLine, Plus, ShieldCheck, Activity, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { shopApi } from '../../api/shopApi';
import { getErrorMessage, formatDate } from '../../utils/helpers';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

/**
 * ShopDashboard — Owner's view of their registered print shops.
 *
 * Features:
 * - Loading / error / empty / populated states (all covered)
 * - Refresh button (manual re-fetch)
 * - Memoized metrics + callbacks
 * - Polymorphic Button `as={Link}` (cleaner than nested <Link><Button>)
 * - Badge `dot` prop (removes inline style hacks)
 * - Retry on fetch failure
 */
const ShopDashboard = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Fetch shops ──
  const fetchShops = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // ✓ FIX: shopApi.getMyShops() returns data directly (no `.data`)
      const data = await shopApi.getMyShops();
      setShops(Array.isArray(data) ? data : []);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  // ── Derived metrics (memoized) ──
  const metrics = useMemo(() => {
    if (!shops.length) return null;
    return {
      total: shops.length,
      verified: shops.filter((s) => s.isVerified).length,
      active: shops.filter((s) => s.isActive).length,
    };
  }, [shops]);

  // ── Loading state ──
  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1>My Shops</h1>
          <p>Manage your registered print locations and terminal status</p>
        </div>
        <Spinner size="lg" label="Loading your shops" />
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div>
        <div className="page-header">
          <h1>My Shops</h1>
          <p>Manage your registered print locations and terminal status</p>
        </div>
        <EmptyState
          variant="error"
          icon={AlertCircle}
          title="Failed to load your shops"
          description={error}
          action="Retry"
          onAction={fetchShops}
        />
      </div>
    );
  }

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1>My Shops</h1>
            <p>Manage your registered print locations and terminal status</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Button
              variant="ghost"
              icon={RefreshCw}
              onClick={fetchShops}
              aria-label="Refresh shop list"
            >
              Refresh
            </Button>
            <Button
              as={Link}
              to="/shop/print"
              variant="secondary"
              icon={ScanLine}
            >
              Launch Print Station
            </Button>
            <Button
              as={Link}
              to="/register"
              icon={Plus}
            >
              Register Another Shop
            </Button>
          </div>
        </div>
      </div>

      {/* ── Metric Summary Strip ── */}
      {metrics && (
        <div className="stats-strip">
          <div className="stat-metric-card">
            <div className="stat-metric-icon">
              <Store size={22} aria-hidden="true" />
            </div>
            <div>
              <div className="stat-metric-label">Registered Shops</div>
              <div className="stat-metric-value">{metrics.total}</div>
            </div>
          </div>

          <div className="stat-metric-card">
            <div className="stat-metric-icon success">
              <ShieldCheck size={22} aria-hidden="true" />
            </div>
            <div>
              <div className="stat-metric-label">Verified Locations</div>
              <div className="stat-metric-value">{metrics.verified}</div>
            </div>
          </div>

          <div className="stat-metric-card">
            <div className="stat-metric-icon info">
              <Activity size={22} aria-hidden="true" />
            </div>
            <div>
              <div className="stat-metric-label">Active Terminals</div>
              <div className="stat-metric-value">{metrics.active}</div>
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
            <Button as={Link} to="/register" icon={Plus}>
              Register Your Shop
            </Button>
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
              className="shop-card-wrapper"
            >
              {/* Header Row */}
              <div className="shop-card-header">
                <div className="shop-card-title-group">
                  <h2 className="shop-card-title">{shop.shopName}</h2>
                  <div className="shop-card-owner-badge">
                    <span className="shop-card-owner-avatar" aria-hidden="true">
                      {shop.ownerName ? shop.ownerName.charAt(0).toUpperCase() : 'O'}
                    </span>
                    <span>Owner: <strong>{shop.ownerName}</strong></span>
                  </div>
                </div>

                {/* Status Badges — using new `dot` prop */}
                <div className="shop-card-badges">
                  {shop.isVerified ? (
                    <Badge variant="success" dot>Verified</Badge>
                  ) : (
                    <Badge variant="warning" dot>Pending Review</Badge>
                  )}
                  {shop.isActive ? (
                    <Badge variant="success" dot>Active</Badge>
                  ) : (
                    <Badge variant="danger" dot>Inactive</Badge>
                  )}
                </div>
              </div>

              {/* Metadata List */}
              <div className="shop-card-info-list">
                <div className="shop-card-info-row">
                  <MapPin size={16} aria-hidden="true" />
                  <span>{shop.address}, <strong>{shop.city}</strong></span>
                </div>
                <div className="shop-card-info-row">
                  <Phone size={16} aria-hidden="true" />
                  <span className="mono">{shop.phone}</span>
                </div>
                <div className="shop-card-info-row">
                  <Calendar size={16} aria-hidden="true" />
                  <span>Registered on {formatDate(shop.createdAt)}</span>
                </div>
              </div>

              {/* Action Footer — polymorphic Button as Link */}
              <div className="shop-card-actions">
                <Button
                  as={Link}
                  to={`/shop/${shop.id}/edit`}
                  state={{ shop }}
                  variant="secondary"
                  size="sm"
                  icon={Edit}
                >
                  Edit Details
                </Button>

                <Button
                  as={Link}
                  to="/shop/print"
                  variant="ghost"
                  size="sm"
                  icon={ScanLine}
                >
                  Open Terminal
                </Button>
              </div>
            </Motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopDashboard;