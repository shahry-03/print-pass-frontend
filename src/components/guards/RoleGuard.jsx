import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ROLES } from '../../utils/constants';

const RoleGuard = ({ children, allowedRoles }) => {
  const { isAuthenticated, role } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    // Redirect to their own dashboard
    if (role === ROLES.ADMIN) return <Navigate to="/admin" replace />;
    if (role === ROLES.PRINT_SHOP) return <Navigate to="/shop" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleGuard;
