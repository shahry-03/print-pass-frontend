import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

/**
 * Wraps routes that require authentication.
 * Optionally restricts by role (e.g., 'ADMIN' only).
 */
const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, role } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
