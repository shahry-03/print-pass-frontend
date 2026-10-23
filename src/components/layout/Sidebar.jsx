import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ROLES } from '../../utils/constants';
import {
  LayoutDashboard,
  ScanLine,
  ShieldCheck,
  Store,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { role } = useAuthStore();

  const shopLinks = [
    { to: '/shop', icon: Store, label: 'My Shops' },
    { to: '/shop/print', icon: ScanLine, label: 'Print Station' },
  ];

  const adminLinks = [
    { to: '/admin', icon: ShieldCheck, label: 'Manage Shops' },
  ];

  const links = role === ROLES.ADMIN ? adminLinks : shopLinks;

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} aria-label="Main Navigation">
        <nav className="sidebar-nav">
          <span className="sidebar-section-title">
            {role === ROLES.ADMIN ? 'Platform Management' : 'Shop Management'}
          </span>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/shop' || link.to === '/admin'}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={onClose}
            >
              <link.icon className="sidebar-icon" />
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

