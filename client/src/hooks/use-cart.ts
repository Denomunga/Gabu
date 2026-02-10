import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@shared/schema';

export interface CartItem extends Product {
  quantity: number;
}


interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string | number) => void;
  updateQuantity: (productId: string | number, quantity: number) => void;
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
            total: updatedItems.reduce((acc, item,) => acc + (item.price || 0) * item.quantity, 0),
          });
        } else {
          const updatedItems = [...currentItems, { ...product, quantity: 1 }];
          set({
            items: updatedItems,
            total: updatedItems.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0),
          });
        }
      },
      removeItem: (productId) => {
        console.log("Removing item with ID:", productId, "type:", typeof productId);
        console.log("Current items:", get().items.map(item => ({ id: item.id, type: typeof item.id, name: item.name })));
        const updatedItems = get().items.filter((item) => {
          const shouldKeep = String(item.id) !== String(productId);
          if (!shouldKeep) {
            console.log("Removing item:", item.name, "with ID:", item.id, "type:", typeof item.id);
          }
          return shouldKeep;
        });
        console.log("Items after removal:", updatedItems.length);
        set({
          items: updatedItems,
          total: updatedItems.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0),
        });
      },
      updateQuantity: (productId, quantity) => {
        if (quantity < 1) return;
        const updatedItems = get().items.map((item) =>
          String(item.id) === String(productId) ? { ...item, quantity } : item
        );
        set({
          items: updatedItems,
          total: updatedItems.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0),
        });
      },
      clearCart: () => set({ items: [], total: 0 }),
    }),
    {
      name: 'medical-store-cart',
    }
  )
);
