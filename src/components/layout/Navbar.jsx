import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Menu, LogOut, ChevronDown, Shield, ScanLine, Store } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ROLES } from '../../utils/constants';
import { ROLE_DASHBOARD_MAP } from '../guards/RoleGuard';
import Logo from '../common/Logo';
import ThemeToggle from '../common/ThemeToggle';

/**
 * Breadcrumb resolver — extracted for testability.
 * 
 * ⚠️ Ordering matters:
 *   - `/shop/print` must come BEFORE `/shop` (more specific first)
 *   - If adding routes like `/admin/shops/new`, put them before `/admin`
 */
const getBreadcrumb = (pathname) => {
  if (pathname.startsWith('/shop/print')) return 'Print Station';
  if (pathname.includes('/edit')) return 'Edit Shop';
  if (pathname.startsWith('/admin')) return 'Manage Shops';
  if (pathname.startsWith('/shop')) return 'My Shops';
  return 'Dashboard';
};

const Navbar = ({ onMenuToggle, isSidebarOpen = false }) => {
  // ── Selector-based auth subscriptions ──
  const email = useAuthStore((s) => s.email);
  const role = useAuthStore((s) => s.role);
  const logout = useAuthStore((s) => s.logout);

  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0); // Roving tabindex tracker

  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const itemRefs = useRef([]);

  const isAdmin = role === ROLES.ADMIN;
  const homeLink = isAdmin
    ? ROLE_DASHBOARD_MAP[ROLES.ADMIN]
    : ROLE_DASHBOARD_MAP[ROLES.PRINT_SHOP];

  const contextName = useMemo(
    () => getBreadcrumb(location.pathname),
    [location.pathname]
  );

  const initials = email ? email.charAt(0).toUpperCase() : '?';

  // ── Menu items (data-driven) — declared before effects that reference count ──
  const menuItems = isAdmin
    ? [{ icon: Shield, label: 'Admin Console', path: '/admin' }]
    : [
        { icon: Store, label: 'My Shops', path: '/shop' },
        { icon: ScanLine, label: 'Print Station', path: '/shop/print' },
      ];

  const totalItems = menuItems.length + 1; // +1 for Sign Out

  // ── Close dropdown on route change ──
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // ── Reset roving index + focus first item when menu opens ──
  useEffect(() => {
    if (!menuOpen) return;

    setActiveIndex(0);
    requestAnimationFrame(() => itemRefs.current[0]?.focus());
  }, [menuOpen]);

  // ── Close on outside click ──
  useEffect(() => {
    if (!menuOpen) return undefined;

    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // ── Escape closes menu, restores focus to trigger ──
  useEffect(() => {
    if (!menuOpen) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  // ── Arrow-key nav with roving tabindex ──
  const handleMenuKeyDown = (e) => {
    const items = itemRefs.current.filter(Boolean);
    const currentIndex = items.indexOf(document.activeElement);

    const focusItem = (idx) => {
      setActiveIndex(idx);
      items[idx]?.focus();
    };

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        focusItem((currentIndex + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusItem((currentIndex - 1 + items.length) % items.length);
        break;
      case 'Home':
        e.preventDefault();
        focusItem(0);
        break;
      case 'End':
        e.preventDefault();
        focusItem(items.length - 1);
        break;
      default:
        break;
    }
  };

  // ── Open menu with ArrowDown / Enter / Space from trigger ──
  const handleTriggerKeyDown = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setMenuOpen(true);
    }
  };

  // ── Memoized actions ──
  const handleNavigate = useCallback(
    (path) => {
      setMenuOpen(false);
      triggerRef.current?.focus();
      navigate(path);
    },
    [navigate]
  );

  const handleLogout = useCallback(() => {
    setMenuOpen(false);
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  return (
    <header className="navbar">
      {/* ── Left section ── */}
      <div className="navbar-left">
        <button
          type="button"
          className="btn btn-ghost btn-icon mobile-menu-btn"
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
          aria-expanded={isSidebarOpen}
          aria-controls="main-sidebar"
        >
          <Menu size={20} aria-hidden="true" />
        </button>

        <Logo linkTo={homeLink} />

        <div className="navbar-context-divider" aria-hidden="true" />

        <nav className="navbar-context" aria-label="Breadcrumb">
          <span>{isAdmin ? 'Admin' : 'Shop Portal'}</span>
          <span style={{ color: 'var(--text-tertiary)' }} aria-hidden="true">/</span>
          <span className="context-active" aria-current="page">
            {contextName}
          </span>
        </nav>
      </div>

      {/* ── Right section ── */}
      <div className="navbar-actions">
        {!isAdmin && (
          <Link
            to="/shop/print"
            className="btn btn-secondary btn-sm navbar-terminal-btn"
          >
            <ScanLine size={15} aria-hidden="true" />
            <span>Terminal</span>
          </Link>
        )}

        <ThemeToggle />

        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            ref={triggerRef}
            type="button"
            className="navbar-user-btn"
            onClick={() => setMenuOpen((prev) => !prev)}
            onKeyDown={handleTriggerKeyDown}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-controls="user-dropdown"
            aria-label={`User menu for ${email || 'current user'}`}
          >
            <div className="navbar-user-avatar" aria-hidden="true">
              {initials}
            </div>
            <span className="navbar-user-email">{email}</span>
            <ChevronDown
              size={14}
              aria-hidden="true"
              style={{
                color: 'var(--text-tertiary)',
                transform: menuOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.15s ease',
              }}
            />
          </button>

          {menuOpen && (
            <div
              id="user-dropdown"
              className="user-menu-dropdown"
              role="menu"
              aria-label="User menu"
              onKeyDown={handleMenuKeyDown}
            >
              <div className="user-menu-header">
                <div className="user-menu-email">{email || 'Guest'}</div>
                <div className="user-menu-role">
                  {isAdmin ? 'Platform Administrator' : 'Verified Shop Owner'}
                </div>
              </div>

              {/* Dynamic menu items with roving tabindex */}
              {menuItems.map((item, idx) => (
                <button
                  key={item.label}
                  ref={(el) => { itemRefs.current[idx] = el; }}
                  type="button"
                  className="user-menu-item"
                  role="menuitem"
                  tabIndex={idx === activeIndex ? 0 : -1}
                  onClick={() => handleNavigate(item.path)}
                >
                  <item.icon size={15} aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              ))}

              <div
                role="separator"
                aria-hidden="true"
                style={{ height: 1, background: 'var(--border)', margin: '4px 0' }}
              />

              {/* Sign Out — last index in roving tabindex */}
              <button
                ref={(el) => { itemRefs.current[menuItems.length] = el; }}
                type="button"
                className="user-menu-item danger"
                role="menuitem"
                tabIndex={menuItems.length === activeIndex ? 0 : -1}
                onClick={handleLogout}
              >
                <LogOut size={15} aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;