import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion as Motion } from 'framer-motion';
import {
  Store, CheckCircle, XCircle, AlertCircle, ShieldCheck, Power,
  Search, RefreshCw, Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/adminApi';
import { getErrorMessage, formatDate } from '../../utils/helpers';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';

// ── Status filter options ──
const FILTER_OPTIONS = [
  { value: 'all', label: 'All Shops' },
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
  { value: 'blocked', label: 'Blocked' },
];

/**
 * AdminDashboard — Platform shop management console.
 *
 * Features:
 * - Search by name / owner / city / phone
 * - Filter by status (all / pending / verified / blocked)
 * - Confirmation modal for destructive Block action
 * - Optimistic updates with rollback on failure
 * - Per-row loading state (no duplicate clicks)
 * - Error state with retry
 * - Refresh button
 * - Skeleton-free fast UX (per-row spinners)
 */
const AdminDashboard = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  // ── Search & filter ──
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // ── Block confirmation modal ──
  const [confirmBlock, setConfirmBlock] = useState(null); // shop object or null

  // ── Fetch shops ──
  const fetchShops = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // ✓ FIX: adminApi now returns data directly (no res.data)
      const data = await adminApi.getAllShops();
      setShops(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getErrorMessage(err));
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  // ── Verify shop (optimistic update) ──
  const handleVerify = useCallback(async (shopId) => {
    setActionLoading((prev) => ({ ...prev, [`verify-${shopId}`]: true }));

    // Optimistic — flip to verified immediately
    const previous = shops;
    setShops((prev) =>
      prev.map((s) => (s.id === shopId ? { ...s, isVerified: true } : s))
    );

    try {
      await adminApi.verifyShop(shopId);
      toast.success('Shop verified!');
    } catch (err) {
      // Rollback on failure
      setShops(previous);
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading((prev) => ({ ...prev, [`verify-${shopId}`]: false }));
    }
  }, [shops]);

  // ── Toggle shop status (optimistic + confirmation for block) ──
  const performToggle = useCallback(async (shopId, nextActive) => {
    setActionLoading((prev) => ({ ...prev, [`toggle-${shopId}`]: true }));

    const previous = shops;
    setShops((prev) =>
      prev.map((s) => (s.id === shopId ? { ...s, isActive: nextActive } : s))
    );

    try {
      await adminApi.toggleShopStatus(shopId);
      toast.success(nextActive ? 'Shop unblocked!' : 'Shop blocked!');
    } catch (err) {
      setShops(previous);
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading((prev) => ({ ...prev, [`toggle-${shopId}`]: false }));
    }
  }, [shops]);

  const handleToggleClick = useCallback((shop) => {
    if (shop.isActive) {
      // Blocking is destructive — confirm first
      setConfirmBlock(shop);
    } else {
      // Unblocking is safe — do it directly
      performToggle(shop.id, true);
    }
  }, [performToggle]);

  const handleConfirmBlock = useCallback(() => {
    if (!confirmBlock) return;
    const shopId = confirmBlock.id;
    setConfirmBlock(null);
    performToggle(shopId, false);
  }, [confirmBlock, performToggle]);

  // ── Filtered + searched shops ──
  const filteredShops = useMemo(() => {
    let result = shops;

    if (statusFilter === 'pending') {
      result = result.filter((s) => !s.isVerified);
    } else if (statusFilter === 'verified') {
      result = result.filter((s) => s.isVerified);
    } else if (statusFilter === 'blocked') {
      result = result.filter((s) => !s.isActive);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((s) =>
        [s.shopName, s.ownerName, s.city, s.phone]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(q))
      );
    }

    return result;
  }, [shops, statusFilter, searchQuery]);

  // ── Stats ──
  const stats = useMemo(() => ({
    total: shops.length,
    verified: shops.filter((s) => s.isVerified).length,
    active: shops.filter((s) => s.isActive).length,
    pending: shops.filter((s) => !s.isVerified).length,
  }), [shops]);

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1>Shop Management</h1>
          <p>Verify and manage registered print shops</p>
        </div>
        <Spinner size="lg" label="Loading shops" />
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div>
        <div className="page-header">
          <h1>Shop Management</h1>
          <p>Verify and manage registered print shops</p>
        </div>
        <EmptyState
          variant="error"
          icon={AlertCircle}
          title="Failed to load shops"
          description={error}
          action="Retry"
          onAction={fetchShops}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <h1>Shop Management</h1>
          <p>Verify and manage registered print shops</p>
        </div>
        <Button
          variant="secondary"
          icon={RefreshCw}
          onClick={fetchShops}
          aria-label="Refresh shop list"
        >
          Refresh
        </Button>
      </div>

      {/* ── Stats ── */}
      <div className="stats-row">
        {[
          { label: 'Total Shops', value: stats.total, color: 'var(--text-primary)' },
          { label: 'Verified', value: stats.verified, color: 'var(--success)' },
          { label: 'Active', value: stats.active, color: 'var(--info)' },
          { label: 'Pending', value: stats.pending, color: 'var(--warning)' },
        ].map((stat) => (
          <div className="stat-card" key={stat.label}>
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value" style={{ color: stat.color }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Search & Filter toolbar ── */}
      {shops.length > 0 && (
        <div
          className="admin-toolbar"
          style={{
            display: 'flex',
            gap: 12,
            marginBottom: 20,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
            <Search
              size={16}
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-tertiary)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="search"
              className="input-field"
              placeholder="Search by name, owner, city, or phone…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search shops"
              style={{ paddingLeft: 40 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`btn ${statusFilter === opt.value ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => setStatusFilter(opt.value)}
                aria-pressed={statusFilter === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Table ── */}
      {shops.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No shops registered"
          description="No print shops have registered yet. They'll appear here as soon as they sign up."
        />
      ) : filteredShops.length === 0 ? (
        <EmptyState
          icon={Filter}
          title="No matching shops"
          description={
            searchQuery
              ? `No shops match "${searchQuery}". Try a different search.`
              : 'No shops in this category.'
          }
          action="Clear filters"
          onAction={() => { setSearchQuery(''); setStatusFilter('all'); }}
        />
      ) : (
        <Motion.div
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
                {filteredShops.map((shop) => {
                  const isVerifying = actionLoading[`verify-${shop.id}`];
                  const isToggling = actionLoading[`toggle-${shop.id}`];
                  const isRowBusy = isVerifying || isToggling;

                  return (
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
                            <Badge variant="success" dot>Verified</Badge>
                          ) : (
                            <Badge variant="warning" dot>Pending</Badge>
                          )}
                          {shop.isActive ? (
                            <Badge variant="success" dot>Active</Badge>
                          ) : (
                            <Badge variant="danger" dot>Blocked</Badge>
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
                              loading={isVerifying}
                              disabled={isRowBusy}
                              onClick={() => handleVerify(shop.id)}
                              aria-label={`Verify ${shop.shopName}`}
                            >
                              Verify
                            </Button>
                          )}
                          <Button
                            variant={shop.isActive ? 'danger' : 'secondary'}
                            size="sm"
                            icon={Power}
                            loading={isToggling}
                            disabled={isRowBusy}
                            onClick={() => handleToggleClick(shop)}
                            aria-label={`${shop.isActive ? 'Block' : 'Unblock'} ${shop.shopName}`}
                          >
                            {shop.isActive ? 'Block' : 'Unblock'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Result count */}
          {filteredShops.length !== shops.length && (
            <p className="text-sm text-muted" style={{ marginTop: 12, textAlign: 'right' }}>
              Showing {filteredShops.length} of {shops.length} shops
            </p>
          )}
        </Motion.div>
      )}

      {/* ── Block Confirmation Modal ── */}
      <Modal
        isOpen={Boolean(confirmBlock)}
        onClose={() => setConfirmBlock(null)}
        title="Block this shop?"
        description="Blocking prevents the shop from receiving new print jobs."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmBlock(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmBlock}>
              Block Shop
            </Button>
          </>
        }
      >
        {confirmBlock && (
          <p className="text-sm">
            <strong>{confirmBlock.shopName}</strong> in{' '}
            <strong>{confirmBlock.city}</strong> will be blocked from receiving
            print jobs. You can unblock them anytime.
          </p>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;