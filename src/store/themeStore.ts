import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Theme Store ─────────────────────────────
// Manages dark/light mode with localStorage persistence.

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      toggle: () =>
        set((state) => {
          const next = !state.isDark;
          // Apply/remove 'dark' class on <html>
          if (next) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { isDark: next };
        }),
    }),
    {
      name: 'printpass-theme',
      onRehydrateStorage: () => (state) => {
        // Re-apply dark class on page load
        if (state?.isDark) {
          document.documentElement.classList.add('dark');
        }
      },
    }
  )
);
