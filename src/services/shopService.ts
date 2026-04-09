import api from './api';
import type { ShopRegisterRequest, ShopUpdateRequest, ShopResponse } from '../types';

export const shopService = {
  /** Register a new print shop (creates user + shop profile) */
  register: async (data: ShopRegisterRequest): Promise<ShopResponse> => {
    const response = await api.post<ShopResponse>('/api/v1/shops/register', data);
    return response.data;
  },

  /** Get all shops belonging to the current authenticated user */
  getMyShops: async (): Promise<ShopResponse[]> => {
    const response = await api.get<ShopResponse[]>('/api/v1/shops/my-shops');
    return response.data;
  },

  /** Update a shop's profile information */
  updateShop: async (shopId: string, data: ShopUpdateRequest): Promise<ShopResponse> => {
    const response = await api.put<ShopResponse>(`/api/v1/shops/${shopId}`, data);
    return response.data;
  },
};
