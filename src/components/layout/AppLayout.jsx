import { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

/**
 * AppLayout — Main application shell for authenticated routes.
 *
 * Features:
 * - Auto-closes the mobile sidebar on route change
 * - Closes sidebar on Escape key
 * - Locks body scroll while the mobile sidebar is open
 * - Skip-to-content link for keyboard users
 * - Memoized handlers to prevent unnecessary child re-renders
 * - Passes `isSidebarOpen` to Navbar for `aria-expanded` support
 */
const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // ── Stable handlers (prevent Navbar/Sidebar re-renders) ──
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  // ── 1. Auto-close sidebar on route change (mobile UX) ──
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // ── 2. Close sidebar on Escape key (a11y) ──
  useEffect(() => {
    if (!sidebarOpen) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  // ── 3. Lock body scroll while mobile sidebar is open ──
  useEffect(() => {
    if (!sidebarOpen) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [sidebarOpen]);

  return (
    <div className="app-layout">
      {/* Skip-to-content link (visible only on keyboard focus) */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      <Navbar
        onMenuToggle={toggleSidebar}
        isSidebarOpen={sidebarOpen}
      />

      <div className="app-body">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={closeSidebar}
        />

        <main
          id="main-content"
          className="app-content"
          tabIndex={-1}
        >
          <div className="app-content-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;