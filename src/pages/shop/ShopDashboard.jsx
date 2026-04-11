import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Store, MapPin, Phone, Calendar,
  Edit, CheckCircle, XCircle, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { shopApi } from '../../api/shopApi';
import { getErrorMessage, formatDate } from '../../utils/helpers';
import Card from '../../components/ui/Card';
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

  return (
    <div>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1>My Shops</h1>
            <p>Manage your registered print shops</p>
          </div>
        </div>
      </div>

      {shops.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No shops yet"
          description="You haven't registered any print shops. Your shops will appear here after registration."
        />
      ) : (
        <div className="dashboard-grid">
          {shops.map((shop, i) => (
            <motion.div
              key={shop.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card interactive>
                <div className="shop-card-header">
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: 4 }}>{shop.shopName}</h3>
                    <span className="text-sm text-muted">{shop.ownerName}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {shop.isVerified ? (
                      <Badge variant="success">
                        <CheckCircle size={12} /> Verified
                      </Badge>
                    ) : (
                      <Badge variant="warning">
                        <AlertCircle size={12} /> Pending
                      </Badge>
                    )}
                    {shop.isActive ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="danger">
                        <XCircle size={12} /> Inactive
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="shop-card-info">
                  <div className="shop-card-info-row">
                    <MapPin size={16} />
                    <span>{shop.address}, {shop.city}</span>
                  </div>
                  <div className="shop-card-info-row">
                    <Phone size={16} />
                    <span>{shop.phone}</span>
                  </div>
                  <div className="shop-card-info-row">
                    <Calendar size={16} />
                    <span>Registered {formatDate(shop.createdAt)}</span>
                  </div>
                </div>

                <div className="shop-card-actions">
                  <Link to={`/shop/${shop.id}/edit`} state={{ shop }}>
                    <Button variant="secondary" size="sm" icon={Edit}>
                      Edit
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopDashboard;
