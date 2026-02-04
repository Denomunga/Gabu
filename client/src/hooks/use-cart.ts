import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@shared/schema';

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      addItem: (product) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.id === product.id);

        if (existingItem) {
          const updatedItems = currentItems.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
          set({
            items: updatedItems,
            total: updatedItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
          });
        } else {
          const updatedItems = [...currentItems, { ...product, quantity: 1 }];
          set({
            items: updatedItems,
            total: updatedItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
          });
        }
      },
      removeItem: (productId) => {
        const updatedItems = get().items.filter((item) => item.id !== productId);
        set({
          items: updatedItems,
          total: updatedItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
        });
      },
      updateQuantity: (productId, quantity) => {
        if (quantity < 1) return;
        const updatedItems = get().items.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        );
        set({
          items: updatedItems,
          total: updatedItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
        });
      },
      clearCart: () => set({ items: [], total: 0 }),
    }),
    {
      name: 'medical-store-cart',
    }
  )
);
