import { forwardRef } from 'react';
import Button from './Button';

// Exported for UI building / validation
export const EMPTY_STATE_VARIANTS = ['default', 'info', 'warning', 'error', 'success'];
export const EMPTY_STATE_SIZES = ['sm', 'md', 'lg'];

// Default icon size per variant size
const ICON_SIZE = { sm: 24, md: 28, lg: 36 };

/**
 * EmptyState — Friendly placeholder for "no data" / zero states.
 *
 * Features:
 * - Optional icon OR image illustration (image wins if both provided)
 * - 5 semantic variants (default, info, warning, error, success) — colors icon
 * - 3 sizes (sm, md, lg)
 * - Flexible action API:
 *     • String + onAction   → renders a primary Button
 *     • Custom JSX in action → rendered as-is (e.g., <Link><Button/></Link>)
 * - Optional secondary action (ghost button) for alternate flows
 * - Forwards refs
 * - Dev-time validation for ambiguous prop usage
 *
 * @example
 *   // Simple
 *   <EmptyState
 *     icon={Store}
 *     title="No shops yet"
 *     description="Register your first shop to get started"
 *     action="Register Shop"
 *     onAction={() => navigate('/register')}
 *   />
 *
 *   // Custom action (Link-wrapped button)
 *   <EmptyState
 *     icon={Store}
 *     title="No shops yet"
 *     description="..."
 *     action={
 *       <Link to="/register">
 *         <Button icon={Plus}>Register</Button>
 *       </Link>
 *     }
 *   />
 *
 *   // Error state with secondary action
 *   <EmptyState
 *     variant="error"
 *     icon={AlertCircle}
 *     title="Failed to load"
 *     description="Something went wrong"
 *     action="Retry"
 *     onAction={refetch}
 *     secondaryAction="Back to home"
 *     onSecondaryAction={() => navigate('/')}
 *   />
 */
const EmptyState = forwardRef(({
  icon: Icon,
  image,
  imageAlt = '',
  title,
  description,
  variant = 'default',
  size = 'md',
  action,
  onAction,
  actionVariant = 'primary',
  secondaryAction,
  onSecondaryAction,
  className = '',
  children,
  ...props
}, ref) => {
  // ── Dev-time validation ──
  if (import.meta.env.DEV) {
    if (!EMPTY_STATE_VARIANTS.includes(variant)) {
      console.warn(
        `[EmptyState] Unknown variant "${variant}". ` +
        `Falling back to "default". Valid: ${EMPTY_STATE_VARIANTS.join(', ')}.`
      );
    }
    if (!EMPTY_STATE_SIZES.includes(size)) {
      console.warn(
        `[EmptyState] Unknown size "${size}". ` +
        `Falling back to "md". Valid: ${EMPTY_STATE_SIZES.join(', ')}.`
      );
    }
    // Detect the ambiguous "string action without onAction" case
    if (typeof action === 'string' && !onAction) {
      console.warn(
        '[EmptyState] `action` is a string but `onAction` is missing — nothing will happen on click. ' +
        'Either pass `onAction`, or pass a JSX element (e.g. <Link>) as `action`.'
      );
    }
    // Detect the reverse ambiguity: onAction without a string action
    if (onAction && typeof action !== 'string') {
      console.warn(
        '[EmptyState] `onAction` is provided but `action` is not a string. ' +
        '`onAction` is only used when `action` is a string. For custom actions, ' +
        'pass JSX directly to `action`.'
      );
    }
  }

  const safeVariant = EMPTY_STATE_VARIANTS.includes(variant) ? variant : 'default';
  const safeSize = EMPTY_STATE_SIZES.includes(size) ? size : 'md';
  const iconSize = ICON_SIZE[safeSize];

  const rootClasses = [
    'empty-state',
    safeVariant !== 'default' && `empty-state-${safeVariant}`,
    safeSize !== 'md' && `empty-state-${safeSize}`,
    className,
  ].filter(Boolean).join(' ');

  // ── Illustration: image > icon ──
  const mediaNode = image ? (
    <img
      src={image}
      alt={imageAlt}
      className="empty-state-image"
      loading="lazy"
    />
  ) : Icon ? (
    <div className={`empty-state-icon empty-state-icon-${safeVariant}`}>
      <Icon size={iconSize} aria-hidden="true" />
    </div>
  ) : null;

  // ── Action area: string+onAction → Button, else render JSX as-is ──
  const primaryActionNode =
    typeof action === 'string' && onAction ? (
      <Button variant={actionVariant} onClick={onAction}>
        {action}
      </Button>
    ) : action ? (
      action
    ) : null;

  const secondaryActionNode =
    typeof secondaryAction === 'string' && onSecondaryAction ? (
      <Button variant="ghost" onClick={onSecondaryAction}>
        {secondaryAction}
      </Button>
    ) : secondaryAction ? (
      secondaryAction
    ) : null;

  const hasActions = Boolean(primaryActionNode || secondaryActionNode);

  return (
    <div ref={ref} className={rootClasses} {...props}>
      {mediaNode}

      {title && <h3 className="empty-state-title">{title}</h3>}
      {description && <p className="empty-state-description">{description}</p>}

      {/* Optional custom children (for advanced layouts) */}
      {children}

      {hasActions && (
        <div className="empty-state-actions">
          {primaryActionNode}
          {secondaryActionNode}
        </div>
      )}
    </div>
  );
});

EmptyState.displayName = 'EmptyState';
export default EmptyState;