import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

/**
 * ProtectedRoute — Guards routes that require authentication.
 *
 * Features:
 * - Redirects unauthenticated users to a configurable login path
 * - Preserves the intended destination via `state.from` so the login
 *   page can send the user back to where they were going
 * - Uses a Zustand selector to re-render only when `isAuthenticated` changes
 *   (avoids unnecessary re-renders when other auth fields update)
 *
 * Note: For role-based access, use `<RoleGuard allowedRoles={[...]}>` instead.
 *
 * @example
 * <Route
 *   path="/upload-history"
 *   element={
 *     <ProtectedRoute>
 *       <UploadHistoryPage />
 *     </ProtectedRoute>
 *   }
 * />
 */
const ProtectedRoute = ({
  children,
  redirectTo = '/login',
}) => {
  // Selector-based access — better re-render performance
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        replace
        // Preserve where the user was trying to go
        state={{ from: location }}
      />
    );
  }

  return children;
};

export default ProtectedRoute;