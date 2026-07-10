import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';

interface WishlistStore {
  items: Product[];
  toggleItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggleItem: (product) => {
        const currentItems = get().items;
        const exists = currentItems.some((item) => item._id === product._id);
        
        if (exists) {
          set({
            items: currentItems.filter((item) => item._id !== product._id),
          });
        } else {
          set({
            items: [...currentItems, product],
          });
        }
      },
      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item._id !== productId),
        });
      },
      isFavorite: (productId) => {
        return get().items.some((item) => item._id === productId);
      },
    }),
    {
      name: 'threadly-wishlist-storage',
    }
  )
);
