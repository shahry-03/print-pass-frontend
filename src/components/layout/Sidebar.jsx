import { useEffect, useRef, useId } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ROLES } from '../../utils/constants';
import { ScanLine, ShieldCheck, Store } from 'lucide-react';

// ── Static link config (module-level = no recreation on render) ──
const SHOP_LINKS = [
  { to: '/shop', icon: Store, label: 'My Shops', exact: true },
  { to: '/shop/print', icon: ScanLine, label: 'Print Station', exact: false },
];

const ADMIN_LINKS = [
  { to: '/admin', icon: ShieldCheck, label: 'Manage Shops', exact: true },
];

// Must match components.css @media (max-width: 768px)
const MOBILE_MQ = '(max-width: 768px)';

/**
 * Sidebar — Role-aware navigation drawer.
 *
 * Features:
 * - Role-based link configuration (data-driven)
 * - Auto-focuses first link when opened on mobile
 * - Self-contained Escape handler (defensive; AppLayout also handles it)
 * - Proper ARIA labeling (nav labeled by section title)
 * - Decorative icons hidden from screen readers
 */
const Sidebar = ({ isOpen, onClose }) => {
  // Selector-based — only re-renders when role changes
  const role = useAuthStore((s) => s.role);

  const isAdmin = role === ROLES.ADMIN;
  const links = isAdmin ? ADMIN_LINKS : SHOP_LINKS;

  const navRef = useRef(null);
  const sectionTitleId = useId();

  // ── Focus first link when opened on mobile (a11y) ──
  useEffect(() => {
    if (!isOpen) return undefined;

    // Don't steal focus on desktop (sidebar is always visible there)
    if (!window.matchMedia(MOBILE_MQ).matches) return undefined;

    const timer = setTimeout(() => {
      navRef.current?.querySelector('a')?.focus();
    }, 50); // allow CSS transition to start

    return () => clearTimeout(timer);
  }, [isOpen]);

  // ── Self-contained Escape handler ──
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        id="main-sidebar"                          // ← Links to Navbar's aria-controls
        className={`sidebar ${isOpen ? 'open' : ''}`}
        aria-label="Main Navigation"
      >
        <nav
          ref={navRef}
          className="sidebar-nav"
          aria-labelledby={sectionTitleId}
        >
          <span id={sectionTitleId} className="sidebar-section-title">
            {isAdmin ? 'Platform Management' : 'Shop Management'}
          </span>

          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.exact}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={() => onClose?.()}
            >
              <link.icon className="sidebar-icon" aria-hidden="true" />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-status-pill">
            <span className="sidebar-status-dot" aria-hidden="true" />
            <span>Operational</span>
          </div>
          <span className="text-xs text-muted" style={{ padding: '0 8px' }}>
            v1.0.0
          </span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;