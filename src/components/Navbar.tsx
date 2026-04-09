import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useThemeStore } from '../store';
import {
  Printer,
  Menu,
  X,
  Sun,
  Moon,
  LogIn,
  LogOut,
  LayoutDashboard,
  Shield,
  Upload,
  Settings,
  History,
  User,
} from 'lucide-react';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, role, email, logout } = useAuthStore();
  const { isDark, toggle: toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (to: string) =>
    to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`);

  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  // Build nav links based on auth state and role
  const links = [
    { to: '/upload', label: 'Upload File', icon: <Upload size={18} />, show: true },
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, show: isAuthenticated && role === 'PRINT_SHOP' },
    { to: '/shop-settings', label: 'Shop Settings', icon: <Settings size={18} />, show: isAuthenticated && role === 'PRINT_SHOP' },
    { to: '/job-history', label: 'Job History', icon: <History size={18} />, show: isAuthenticated && role === 'PRINT_SHOP' },
    { to: '/profile', label: 'Profile', icon: <User size={18} />, show: isAuthenticated },
    { to: '/admin', label: 'Admin Panel', icon: <Shield size={18} />, show: isAuthenticated && role === 'ADMIN' },
  ];

  return (
    <nav className="sticky top-0 z-50 glass border-b border-slate-200/50 dark:border-slate-700/50 backdrop-blur supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:dark:bg-slate-900/60">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2 group" onClick={() => setMobileOpen(false)}>
            <div className="w-9 h-9 rounded-xl gradient-hero flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-shadow">
              <Printer size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              PrintPass
            </span>
          </Link>

          {/* ── Desktop Links ── */}
          <div className="hidden md:flex items-center gap-1">
            {links.filter((l) => l.show).map((link) => {
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'text-primary-700 dark:text-primary-300 bg-primary-100/90 dark:bg-primary-900/40 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* ── Right Side ── */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="max-w-[220px] truncate text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                  {email}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white gradient-hero hover:opacity-90 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all"
              >
                <LogIn size={16} />
                Login
              </Link>
            )}
          </div>

          {/* ── Mobile Hamburger ── */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            id="mobile-nav-menu"
            className="md:hidden overflow-hidden border-t border-slate-200/50 dark:border-slate-700/50"
          >
            <div className="px-3 py-3 space-y-1.5">
              {links.filter((l) => l.show).map((link) => {
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'text-primary-700 dark:text-primary-300 bg-primary-100/90 dark:bg-primary-900/40'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                );
              })}

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                {isAuthenticated ? (
                  <>
                    <p className="px-4 py-2 text-xs text-slate-400 truncate">{email}</p>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                  >
                    <LogIn size={16} />
                    Login
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
