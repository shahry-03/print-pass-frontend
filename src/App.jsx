import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useThemeStore } from './store/themeStore';
import { useAuthStore } from './store/authStore';
import { ROLES } from './utils/constants';

// Layout
import AppLayout from './components/layout/AppLayout';

// Guards
import ProtectedRoute from './components/guards/ProtectedRoute';
import RoleGuard from './components/guards/RoleGuard';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import OtpVerifyPage from './pages/public/OtpVerifyPage';
import UploadPage from './pages/public/UploadPage';

// Shop Pages
import ShopDashboard from './pages/shop/ShopDashboard';
import ShopEditPage from './pages/shop/ShopEditPage';
import PrintStation from './pages/shop/PrintStation';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  const initTheme = useThemeStore((s) => s.initTheme);
  const { isAuthenticated, role } = useAuthStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            boxShadow: 'var(--shadow-md)',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: 'white' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: 'white' },
          },
        }}
      />

      <Routes>
        {/* ── Public Routes ── */}
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={role === ROLES.ADMIN ? '/admin' : '/shop'} replace />
            ) : (
              <LoginPage />
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to={role === ROLES.ADMIN ? '/admin' : '/shop'} replace />
            ) : (
              <RegisterPage />
            )
          }
        />
        <Route path="/verify-otp" element={<OtpVerifyPage />} />
        <Route path="/upload" element={<UploadPage />} />

        {/* ── Shop Owner Routes ── */}
        <Route
          element={
            <RoleGuard allowedRoles={[ROLES.PRINT_SHOP]}>
              <AppLayout />
            </RoleGuard>
          }
        >
          <Route path="/shop" element={<ShopDashboard />} />
          <Route path="/shop/:id/edit" element={<ShopEditPage />} />
          <Route path="/shop/print" element={<PrintStation />} />
        </Route>

        {/* ── Admin Routes ── */}
        <Route
          element={
            <RoleGuard allowedRoles={[ROLES.ADMIN]}>
              <AppLayout />
            </RoleGuard>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* ── 404 Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
