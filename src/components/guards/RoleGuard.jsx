import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ROLES } from '../../utils/constants';

// Centralized mapping — add new roles here once, use everywhere.
// Exported so LoginPage (and others) can reuse the same redirect logic.
export const ROLE_DASHBOARD_MAP = {
  [ROLES.ADMIN]: '/admin',
  [ROLES.PRINT_SHOP]: '/shop',
};

const DEFAULT_FALLBACK = '/';

/**
 * RoleGuard — Guards routes by both authentication AND user role.
 *
 * Behavior:
 * 1. (Optional) If `isInitialized` exists on the auth store and is `false`,
 *    renders nothing while auth hydration is in progress. This prevents
 *    a flash-redirect to /login on hard refresh when session is being
 *    re-validated (only applies if you add `isInitialized` to authStore).
 * 2. Not authenticated → redirect to `redirectTo` (default /login),
 *    preserving the intended destination via `state.from`.
 * 3. `allowedRoles` is empty/missing → treated as auth-only guard
 *    (equivalent to ProtectedRoute) with a loud dev warning.
 * 4. Authenticated but wrong role → redirect to the user's own dashboard
 *    (via ROLE_DASHBOARD_MAP), or `fallbackTo` if provided.
 * 5. Otherwise → render children.
 *
 * Usage:
 *   <RoleGuard allowedRoles={[ROLES.ADMIN]}>
 *     <AdminDashboard />
 *   </RoleGuard>
 *
 * ⚠️ Route configuration warning:
 *   Ensure the route mapped in ROLE_DASHBOARD_MAP for a given role is
 *   NOT itself guarded by an `allowedRoles` that excludes that role.
 *   Otherwise, a user will be caught in a redirect loop. This component
 *   breaks the loop at runtime as a safety net, but the root cause is a
 *   misconfiguration that should be fixed.
 */
const RoleGuard = ({
  children,
  allowedRoles = [],
  redirectTo = '/login',
  fallbackTo, // optional override for the wrong-role redirect target
}) => {
  // Selector-based subscriptions — only re-render on relevant changes
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.role);
  // Optional: if the store exposes `isInitialized`, wait for it.
  // When undefined (current setup), this check is a no-op.
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const location = useLocation();

  // ── Guard validity: distinguish "role-restricted" vs "auth-only" ──
  const hasRoleRestriction = Array.isArray(allowedRoles) && allowedRoles.length > 0;

  // ── Dev-time: loud warning for misconfiguration ──
  if (import.meta.env.DEV && !hasRoleRestriction) {
    console.warn(
      '[RoleGuard] `allowedRoles` is empty or invalid. ' +
      'Falling back to authentication-only check. ' +
      'If this is intentional, use <ProtectedRoute> instead of <RoleGuard>.'
    );
  }

  // ── 0. Auth hydration (only if store exposes isInitialized) ──
  if (isInitialized === false) {
    return null; // or <FullPageSpinner /> in future
  }

  // ── 1. Not authenticated → send to login, remember intended path ──
  if (!isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{ from: location }}
      />
    );
  }

  // ── 2. Auth-only fallback (empty allowedRoles) ──
  // Prevents legitimate users from being silently locked out by misconfiguration.
  if (!hasRoleRestriction) {
    return children;
  }

  // ── 3. Wrong role → send to their own dashboard ──
  if (!allowedRoles.includes(role)) {
    const target = fallbackTo ?? ROLE_DASHBOARD_MAP[role] ?? DEFAULT_FALLBACK;

    // Infinite redirect loop safeguard:
    // If we're already ON the target path and STILL being redirected there,
    // the redirect would fire again on the next render — breaking the loop
    // by rendering nothing (safer than an infinite redirect storm).
    if (target === location.pathname) {
      if (import.meta.env.DEV) {
        console.error(
          `[RoleGuard] Infinite redirect loop detected!\n` +
          `  Role: "${role}"\n` +
          `  Current path: "${location.pathname}"\n` +
          `  Redirect target: "${target}"\n` +
          `  Fix: ensure ROLE_DASHBOARD_MAP["${role}"] is not guarded by a role that excludes "${role}".`
        );
      }
      return null; // Break the loop instead of navigating to the same path
    }

    return <Navigate to={target} replace />;
  }

  // ── 4. All good ──
  return children;
};

export default RoleGuard;