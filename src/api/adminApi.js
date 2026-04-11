import api from './axios';

export const adminApi = {
  getAllShops: () => api.get('/admin/shops'),
  verifyShop: (shopId) => api.patch(`/admin/shops/${shopId}/verify`),
  toggleShopStatus: (shopId) => api.patch(`/admin/shops/${shopId}/toggle-status`),
};
