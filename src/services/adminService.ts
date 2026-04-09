import api from './api';
import type { ShopResponse } from '../types';

export const adminService = {
  /** Get all shops (admin only) */
  getAllShops: async (): Promise<ShopResponse[]> => {
    const response = await api.get<ShopResponse[]>('/api/v1/admin/shops');
    return response.data;
  },

  /** Verify a shop (admin only) */
  verifyShop: async (shopId: string): Promise<void> => {
    await api.patch(`/api/v1/admin/shops/${shopId}/verify`);
  },

  /** Toggle shop active/inactive status (admin only) */
  toggleShopStatus: async (shopId: string): Promise<void> => {
    await api.patch(`/api/v1/admin/shops/${shopId}/toggle-status`);
  },
};
