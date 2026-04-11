import api from './axios';

export const shopApi = {
  register: (data) => api.post('/shops/register', data),
  getMyShops: () => api.get('/shops/my-shops'),
  updateShop: (shopId, data) => api.put(`/shops/${shopId}`, data),
};
