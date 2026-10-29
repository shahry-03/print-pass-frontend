import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Component, Suspense, lazy, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AlertTriangle } from 'lucide-react';
import { useThemeStore } from './store/themeStore';
import { useAuthStore } from './store/authStore';
import { ROLES } from './utils/constants';
import { ROLE_DASHBOARD_MAP } from './components/guards/RoleGuard';

// ── Eager-loaded layout, guards, and UI primitives ──
import AppLayout from './components/layout/AppLayout';
import RoleGuard from './components/guards/RoleGuard';
import Spinner from './components/ui/Spinner';
import Button from './components/ui/Button';
import EmptyState from './components/ui/EmptyState';

// ── Eager-loaded high-traffic public pages (small, above-the-fold) ──
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import OtpVerifyPage from './pages/public/OtpVerifyPage';

// ── Lazy-loaded pages (code-split for faster initial load) ──
const UploadPage = lazy(() => import('./pages/public/UploadPage'));
const ShopDashboard = lazy(() => import('./pages/shop/ShopDashboard'));
const ShopEditPage = lazy(() => import('./pages/shop/ShopEditPage'));
const PrintStation = lazy(() => import('./pages/shop/PrintStation'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

// ═══════════════════════════════════════════════════════════
// Toaster config — extracted to avoid re-creation
// ═══════════════════════════════════════════════════════════

const TOASTER_OPTIONS = {
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
    iconTheme: { primary: '#047857', secondary: '#ffffff' },
  },
  error: {
    iconTheme: { primary: '#B91C1C', secondary: '#ffffff' },
  },
};

// ═══════════════════════════════════════════════════════════
// Error Boundary — catches crashes in the entire router tree
// ═══════════════════════════════════════════════════════════

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
    // TODO: Forward to Sentry / LogRocket / backend logger in production
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: 'var(--bg-primary, #F8FAFC)',
          }}
        >
          <EmptyState
            variant="error"
            icon={AlertTriangle}
            title="Something went wrong"
            description="An unexpected error occurred. Please return home and try again."
            action="Return Home"
            onAction={this.handleReset}
          />
        </div>
      );
    }
    return this.props.children;
  }
}

// ═══════════════════════════════════════════════════════════
// Scroll-to-top on route change
// ═══════════════════════════════════════════════════════════

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Instant reset (no smooth scroll — smooth is jarring on route change)
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
};

// ═══════════════════════════════════════════════════════════
// AuthListener — reacts to `auth:unauthorized` from axios.js
// ═══════════════════════════════════════════════════════════

const AuthListener = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (event) => {
      const reason = event?.detail?.reason;

      // Defensive: ensure logged out (idempotent — logout is safe to call twice)
      const auth = useAuthStore.getState();
      if (auth.isAuthenticated) {
        auth.logout(reason);
      }

      // Contextual message
      if (reason === 'expired') {
        toast.error('Your session expired. Please sign in again.');
      } else if (reason !== 'manual') {
        toast.error('Please sign in to continue.');
      }

      // SPA navigation (no hard refresh)
      navigate('/login', { replace: true });
    };

    window.addEventListener('auth:unauthorized', handler);
    return () => window.removeEventListener('auth:unauthorized', handler);
  }, [navigate]);

  return null;
};

// ═══════════════════════════════════════════════════════════
// Guards & wrappers
// ═══════════════════════════════════════════════════════════

/**
 * Redirects authenticated users away from /login and /register.
 * Uses ROLE_DASHBOARD_MAP for consistent landing.
 */
const GuestOnly = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.role);

  if (isAuthenticated) {
    const target = ROLE_DASHBOARD_MAP[role] || '/';
    return <Navigate to={target} replace />;
  }
  return children;
};

/** Lazy-load fallback — shown inside the active layout's Outlet. */
const LoadingFallback = () => (
  <div
    style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Spinner size="lg" label="Loading page" />
  </div>
);

/** Wrap a lazy route element with its own Suspense boundary. */
const Lazy = ({ children }) => (
  <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
);

// ═══════════════════════════════════════════════════════════
// 404 Page
// ═══════════════════════════════════════════════════════════

const NotFoundPage = () => (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}
  >
    <EmptyState
      icon={AlertTriangle}
      title="Page not found"
      description="The page you're looking for doesn't exist or has been moved."
      action={
        <Button as={Link} to="/" variant="primary">
          Go to Home
        </Button>
      }
    />
  </div>
);

// ═══════════════════════════════════════════════════════════
// App
// ═══════════════════════════════════════════════════════════

function App() {
  const initTheme = useThemeStore((s) => s.initTheme);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <AuthListener />
        <Toaster position="top-right" toastOptions={TOASTER_OPTIONS} />

        <Routes>
          {/* ── Public Routes ── */}
          <Route path="/" element={<LandingPage />} />

          <Route
            path="/login"
            element={
              <GuestOnly>
                <LoginPage />
              </GuestOnly>
            }
          />

          <Route
            path="/register"
            element={
              <GuestOnly>
                <RegisterPage />
              </GuestOnly>
            }
          />

          <Route path="/verify-otp" element={<OtpVerifyPage />} />

          <Route
            path="/upload"
            element={
              <Lazy>
                <UploadPage />
              </Lazy>
            }
          />

          {/* ── Shop Owner Routes ── */}
          <Route
            element={
              <RoleGuard allowedRoles={[ROLES.PRINT_SHOP]}>
                <AppLayout />
              </RoleGuard>
            }
          >
            <Route
              path="/shop"
              element={
                <Lazy>
                  <ShopDashboard />
                </Lazy>
              }
            />
            <Route
              path="/shop/:id/edit"
              element={
                <Lazy>
                  <ShopEditPage />
                </Lazy>
              }
            />
            <Route
              path="/shop/print"
              element={
                <Lazy>
                  <PrintStation />
                </Lazy>
              }
            />
          </Route>

          {/* ── Admin Routes ── */}
          <Route
            element={
              <RoleGuard allowedRoles={[ROLES.ADMIN]}>
                <AppLayout />
              </RoleGuard>
            }
          >
            <Route
              path="/admin"
              element={
                <Lazy>
                  <AdminDashboard />
                </Lazy>
              }
            />
          </Route>

          {/* ── 404 Fallback ── */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;