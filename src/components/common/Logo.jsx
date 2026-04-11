import { Printer } from 'lucide-react';
import { Link } from 'react-router-dom';

const Logo = ({ size = 'md', linkTo = '/' }) => {
  return (
    <Link to={linkTo} className="navbar-brand">
      <div className="navbar-brand-icon" style={size === 'lg' ? { width: 40, height: 40, fontSize: '1rem' } : {}}>
        <Printer size={size === 'lg' ? 22 : 18} />
      </div>
      <span>PrintPass</span>
    </Link>
  );
};

export default Logo;
