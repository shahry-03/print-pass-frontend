import { useState, useRef, useEffect } from 'react';
import { Menu, LogOut, ChevronDown, User, Shield, ScanLine, Store } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Logo from '../common/Logo';
import ThemeToggle from '../common/ThemeToggle';

const Navbar = ({ onMenuToggle }) => {
  const { email, role, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = email ? email.charAt(0).toUpperCase() : '?';

  // Compute page context breadcrumb
  let contextName = 'Dashboard';
  if (location.pathname.startsWith('/shop/print')) {
    contextName = 'Print Station';
  } else if (location.pathname.includes('/edit')) {
    contextName = 'Edit Shop';
  } else if (location.pathname.startsWith('/admin')) {
    contextName = 'Manage Shops';
  } else if (location.pathname.startsWith('/shop')) {
    contextName = 'My Shops';
  }

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          className="btn btn-ghost btn-icon mobile-menu-btn"
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        <Logo linkTo={role === 'ADMIN' ? '/admin' : '/shop'} />

        <div className="navbar-context-divider" aria-hidden="true" />

        <div className="navbar-context">
          <span>{role === 'ADMIN' ? 'Admin' : 'Shop Portal'}</span>
          <span style={{ color: 'var(--text-tertiary)' }}>/</span>
          <span className="context-active">{contextName}</span>
        </div>
      </div>

      <div className="navbar-actions">
        {/* Quick action button for print station if in shop role */}
        {role !== 'ADMIN' && (
          <Link
            to="/shop/print"
            className="btn btn-secondary btn-sm navbar-terminal-btn"
          >
            <ScanLine size={15} />
            <span>Terminal</span>
          </Link>
        )}

        <ThemeToggle />

        {/* User profile dropdown button */}
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            className="navbar-user-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-haspopup="true"
            aria-label="User profile menu"
          >
            <div className="navbar-user-avatar">{initials}</div>
            <span className="navbar-user-email">{email}</span>
            <ChevronDown
              size={14}
              style={{
                color: 'var(--text-tertiary)',
                transform: menuOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.15s ease',
              }}
            />
          </button>

          {menuOpen && (
            <div className="user-menu-dropdown" role="menu">
              <div className="user-menu-header">
                <div className="user-menu-email">{email}</div>
                <div className="user-menu-role">
                  {role === 'ADMIN' ? 'Platform Administrator' : 'Verified Shop Owner'}
                </div>
              </div>

              {role !== 'ADMIN' ? (
                <>
                  <button
                    className="user-menu-item"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/shop');
                    }}
                  >
                    <Store size={15} />
                    <span>My Shops</span>
                  </button>
                  <button
                    className="user-menu-item"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/shop/print');
                    }}
                  >
                    <ScanLine size={15} />
                    <span>Print Station</span>
                  </button>
                </>
              ) : (
                <button
                  className="user-menu-item"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/admin');
                  }}
                >
                  <Shield size={15} />
                  <span>Admin Console</span>
                </button>
              )}

              <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />

              <button
                className="user-menu-item danger"
                role="menuitem"
                onClick={handleLogout}
              >
                <LogOut size={15} />
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

