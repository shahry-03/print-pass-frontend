import { Menu, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import Logo from '../common/Logo';
import ThemeToggle from '../common/ThemeToggle';

const Navbar = ({ onMenuToggle }) => {
  const { email, role, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = email
    ? email.charAt(0).toUpperCase()
    : '?';

  return (
    <nav className="navbar">
      <div className="flex" style={{ alignItems: 'center', gap: 12 }}>
        <button className="btn btn-ghost btn-icon mobile-menu-btn" onClick={onMenuToggle}>
          <Menu size={20} />
        </button>
        <Logo linkTo={role === 'ADMIN' ? '/admin' : '/shop'} />
      </div>

      <div className="navbar-actions">
        <ThemeToggle />

        <div className="navbar-user">
          <div className="navbar-user-avatar">{initials}</div>
          <span className="text-sm">{email}</span>
        </div>

        <button
          className="btn btn-ghost btn-icon"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
