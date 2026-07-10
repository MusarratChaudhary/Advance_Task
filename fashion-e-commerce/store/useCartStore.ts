// store/useCartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types';

interface CartStore {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;

  // Actions
  addItem: (product: Product, selectedSize?: string, selectedColor?: string) => void;
  removeItem: (productId: string, selectedSize?: string, selectedColor?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedSize?: string, selectedColor?: string) => void;
  clearCart: () => void;
  
  // Helpers
  getItemCount: () => number;
  getTotalPrice: () => number;
  isInCart: (productId: string, selectedSize?: string, selectedColor?: string) => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      totalItems: 0,
      totalPrice: 0,

      addItem: (product, selectedSize, selectedColor) => {
        const currentItems = get().items;
        
        // Check if item already exists with same variant
        const existingItemIndex = currentItems.findIndex(
          (item) =>
            item.product._id === product._id &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor
        );

        if (existingItemIndex !== -1) {
          // Update quantity if exists
          const updatedItems = [...currentItems];
          updatedItems[existingItemIndex].quantity += 1;

          set({
            items: updatedItems,
            totalItems: get().totalItems + 1,
            totalPrice: get().totalPrice + product.price,
          });
        } else {
          // Add new item
          const newItem: CartItem = {
            product,
            quantity: 1,
            selectedSize,
            selectedColor,
          };

          set({
            items: [...currentItems, newItem],
            totalItems: get().totalItems + 1,
            totalPrice: get().totalPrice + product.price,
          });
        }
      },

      removeItem: (productId, selectedSize, selectedColor) => {
        const currentItems = get().items;
        const itemToRemove = currentItems.find(
          (item) =>
            item.product._id === productId &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor
        );

        if (!itemToRemove) return;

        const updatedItems = currentItems.filter(
          (item) =>
            !(
              item.product._id === productId &&
              item.selectedSize === selectedSize &&
              item.selectedColor === selectedColor
            )
        );

        set({
          items: updatedItems,
          totalItems: get().totalItems - itemToRemove.quantity,
          totalPrice: get().totalPrice - itemToRemove.product.price * itemToRemove.quantity,
        });
      },

      updateQuantity: (productId, quantity, selectedSize, selectedColor) => {
        if (quantity < 1) return;

        const currentItems = get().items;
        const itemIndex = currentItems.findIndex(
          (item) =>
            item.product._id === productId &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor
        );

        if (itemIndex === -1) return;

        const oldQuantity = currentItems[itemIndex].quantity;
        const priceDiff = (quantity - oldQuantity) * currentItems[itemIndex].product.price;

        const updatedItems = [...currentItems];
        updatedItems[itemIndex].quantity = quantity;

        set({
          items: updatedItems,
          totalItems: get().totalItems + (quantity - oldQuantity),
          totalPrice: get().totalPrice + priceDiff,
        });
      },

      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalPrice: 0,
        });
      },

      getItemCount: () => get().totalItems,
      getTotalPrice: () => get().totalPrice,

      isInCart: (productId, selectedSize, selectedColor) => {
        return get().items.some(
          (item) =>
            item.product._id === productId &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor
        );
      },
    }),

    {
      name: 'threadly-cart-storage', // localStorage key
      partialize: (state) => ({ items: state.items }), // only persist items
    }
  )
);