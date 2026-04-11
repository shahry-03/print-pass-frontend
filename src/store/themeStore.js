import { create } from 'zustand';

const getStoredTheme = () => {
  try {
    return localStorage.getItem('pp_theme') || 'dark';
  } catch {
    return 'dark';
  }
};

export const useThemeStore = create((set) => ({
  theme: getStoredTheme(),

  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('pp_theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      return { theme: newTheme };
    }),

  initTheme: () => {
    const theme = getStoredTheme();
    document.documentElement.setAttribute('data-theme', theme);
  },
}));
