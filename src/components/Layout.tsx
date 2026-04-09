import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Navbar from './Navbar';
import Footer from './Footer';
import { authService, adminService, jobService, shopService } from '../services';
import { useAuthStore, useThemeStore } from '../store';

/** Main layout wrapper: Navbar + page content + Footer + toast container */
const Layout = () => {
  const isDark = useThemeStore((s) => s.isDark);
  const queryClient = useQueryClient();
  const { isAuthenticated, role, token } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const timer = window.setTimeout(() => {
      queryClient.prefetchQuery({
        queryKey: ['profile'],
        queryFn: () => authService.getProfile(token),
      });

      if (role === 'PRINT_SHOP') {
        queryClient.prefetchQuery({
          queryKey: ['shops', 'my'],
          queryFn: () => shopService.getMyShops(),
        });
        queryClient.prefetchQuery({
          queryKey: ['jobs', 'history'],
          queryFn: () => jobService.getJobHistory(token),
        });
      }

      if (role === 'ADMIN') {
        queryClient.prefetchQuery({
          queryKey: ['admin', 'shops'],
          queryFn: () => adminService.getAllShops(),
        });
      }
    }, 180);

    return () => window.clearTimeout(timer);
  }, [isAuthenticated, role, token, queryClient]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" className="flex-1 outline-none" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: isDark ? '!bg-slate-800 !text-slate-100 !border !border-slate-700' : '',
          style: {
            borderRadius: '12px',
            background: isDark ? '#1e293b' : 'var(--color-surface, #fff)',
            color: isDark ? '#f1f5f9' : '#1e293b',
            boxShadow: isDark
              ? '0 10px 40px rgba(0,0,0,0.45)'
              : '0 10px 40px rgba(0,0,0,0.1)',
            fontSize: '14px',
            border: isDark ? '1px solid #334155' : undefined,
          },
        }}
      />
    </div>
  );
};

export default Layout;
