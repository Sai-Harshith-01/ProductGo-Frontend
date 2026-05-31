import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem(product, qty = 1) {
        const items = get().items;
        const idx = items.findIndex((i) => i.productId === product._id);
        if (idx > -1) {
          const updated = [...items];
          updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + qty };
          set({ items: updated });
        } else {
          set({
            items: [
              ...items,
              {
                productId: product._id,
                name:      product.name,
                price:     product.price,
                image:     product.images?.[0] ?? null,
                category:  product.category ?? '',
                quantity:  qty,
              },
            ],
          });
        }
      },

      removeItem(productId) {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },

      updateQty(productId, qty) {
        if (qty <= 0) {
          set({ items: get().items.filter((i) => i.productId !== productId) });
        } else {
          set({
            items: get().items.map((i) =>
              i.productId === productId ? { ...i, quantity: qty } : i
            ),
          });
        }
      },

      clearCart: () => set({ items: [] }),

      total: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
      count: () => get().items.reduce((n, i) => n + i.quantity, 0),
    }),
    { name: 'cart-storage' }
  )
);
