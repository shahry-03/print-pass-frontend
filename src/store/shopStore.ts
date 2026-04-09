import { create } from 'zustand';

interface Shop {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  isVerified: boolean;
  createdAt: string;
}

interface ShopState {
  shops: Shop[];
  currentShop: Shop | null;
  setShops: (shops: Shop[]) => void;
  addShop: (shop: Shop) => void;
  updateShop: (id: string, updates: Partial<Shop>) => void;
  setCurrentShop: (shop: Shop | null) => void;
  clearShops: () => void;
}

export const useShopStore = create<ShopState>((set) => ({
  shops: [],
  currentShop: null,

  setShops: (shops) => set({ shops }),

  addShop: (shop) => set((state) => ({ shops: [...state.shops, shop] })),

  updateShop: (id, updates) =>
    set((state) => ({
      shops: state.shops.map((shop) =>
        shop.id === id ? { ...shop, ...updates } : shop
      ),
      currentShop: state.currentShop?.id === id ? { ...state.currentShop, ...updates } : state.currentShop,
    })),

  setCurrentShop: (shop) => set({ currentShop: shop }),

  clearShops: () => set({ shops: [], currentShop: null }),
}));
