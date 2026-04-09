import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/ui/LoadingSpinner';

// ── Lazy-loaded Pages ──
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const OtpVerifyPage = lazy(() => import('./pages/OtpVerifyPage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));
const VendorDashboardPage = lazy(() => import('./pages/VendorDashboardPage'));
const ShopSettingsPage = lazy(() => import('./pages/ShopSettingsPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const JobHistoryPage = lazy(() => import('./pages/JobHistoryPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));

/**
 * PrintPass — Main Application Router
 *
 * Public routes:  /, /login, /register, /verify-otp, /upload
 * Vendor routes:  /dashboard, /shop-settings, /job-history, /profile  (PRINT_SHOP only)
 * Admin routes:   /admin                       (ADMIN only)
 */
const App = () => (
  <BrowserRouter>
    <Suspense fallback={<LoadingSpinner text="Loading page..." />}>
      <Routes>
        <Route element={<Layout />}>
          {/* ── Public ── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<OtpVerifyPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* ── Vendor (PRINT_SHOP) ── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['PRINT_SHOP']}>
                <VendorDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shop-settings"
            element={
              <ProtectedRoute allowedRoles={['PRINT_SHOP']}>
                <ShopSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/job-history"
            element={
              <ProtectedRoute allowedRoles={['PRINT_SHOP']}>
                <JobHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['PRINT_SHOP', 'ADMIN']}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* ── Admin ── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* ── 404 ── */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default App;
