import { useEffect, useRef, useId } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ROLES } from '../../utils/constants';
import {
  ScanLine, ShieldCheck, Store, ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import Logo from '../common/Logo';

// ── Static link config ──
const SHOP_LINKS = [
  { to: '/shop', icon: Store, label: 'My Shops', exact: true },
  { to: '/shop/print', icon: ScanLine, label: 'Print Station', exact: false },
];

const ADMIN_LINKS = [
  { to: '/admin', icon: ShieldCheck, label: 'Manage Shops', exact: true },
];

const MOBILE_MQ = '(max-width: 768px)';

/**
 * Sidebar — Role-aware, collapsible desktop navigation drawer with mobile slide-out.
 */
const Sidebar = ({
  isOpen,
  isCollapsed = false,
  onClose,
  onToggleCollapse,
}) => {
  const role = useAuthStore((s) => s.role);
  const isAdmin = role === ROLES.ADMIN;
  const links = isAdmin ? ADMIN_LINKS : SHOP_LINKS;

  const navRef = useRef(null);
  const sectionTitleId = useId();

  // ── Focus first link when opened on mobile (a11y) ──
  useEffect(() => {
    if (!isOpen) return undefined;
    if (!window.matchMedia(MOBILE_MQ).matches) return undefined;

    const timer = setTimeout(() => {
      navRef.current?.querySelector('a')?.focus();
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen]);

  // ── Escape handler ──
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
        id="main-sidebar"
        className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}
        aria-label="Main Navigation"
      >
        {/* Mobile Header (Only visible on mobile slide-out) */}
        <div className="sidebar-mobile-header">
          <Logo size="sm" linkTo={isAdmin ? '/admin' : '/shop'} />
          <button
            type="button"
            className="sidebar-mobile-close"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <nav
          ref={navRef}
          className="sidebar-nav"
          aria-labelledby={sectionTitleId}
        >
          <span id={sectionTitleId} className="sidebar-section-title">
            {isAdmin ? 'Admin' : 'Shop Management'}
          </span>

          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.exact}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              title={isCollapsed ? link.label : undefined}
              onClick={() => onClose?.()}
            >
              <link.icon className="sidebar-icon" aria-hidden="true" />
              <span className="sidebar-link-text">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer with Collapse Toggle & Status */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-content">
            <div className="sidebar-status-pill">
              <span className="sidebar-status-dot" aria-hidden="true" />
              <span className="sidebar-status-text">Operational</span>
            </div>
            <span className="sidebar-version-tag">
              v1.0.0
            </span>
          </div>

          {/* Desktop Collapse / Expand Toggle Button */}
          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight size={16} aria-hidden="true" />
            ) : (
              <ChevronLeft size={16} aria-hidden="true" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;