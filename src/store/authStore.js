import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user:  null,
      token: null,

      login: (user, token) => set({ user, token }),

      logout: () => {
        set({ user: null, token: null });
        // cart is cleared separately by useCartStore
      },
    }),
    { name: 'auth-storage' }
  )
);
