import { forwardRef } from 'react';

// Exported so consumers can validate / build UI around known variants
export const BADGE_VARIANTS = ['neutral', 'success', 'warning', 'danger', 'info'];

/**
 * Badge — Small status / label pill.
 *
 * Features:
 * - 5 semantic variants (neutral, success, warning, danger, info)
 * - 3 sizes (sm, md, lg)
 * - Optional leading status dot (colored by variant)
 * - Polymorphic `as` prop (defaults to <span>; use <button> for dismissible)
 * - Dev-only warning when an unknown variant is passed
 * - Forwards refs (useful for tooltip/popover anchoring)
 *
 * @example
 *   <Badge variant="success">Verified</Badge>
 *   <Badge variant="success" dot>Active</Badge>
 *   <Badge variant="danger" size="sm" dot>Blocked</Badge>
 *   <Badge as="button" onClick={...} variant="warning">Pending</Badge>
 */
const Badge = forwardRef(({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
  as: Component = 'span',
  ...props
}, ref) => {
  // ── Dev-time: catch typo'd variants early ──
  if (import.meta.env.DEV && !BADGE_VARIANTS.includes(variant)) {
    console.warn(
      `[Badge] Unknown variant "${variant}". ` +
      `Falling back to "neutral". Valid variants: ${BADGE_VARIANTS.join(', ')}.`
    );
  }

  const safeVariant = BADGE_VARIANTS.includes(variant) ? variant : 'neutral';
  const sizeClass = size !== 'md' ? `badge-${size}` : '';

  const classes = [
    'badge',
    `badge-${safeVariant}`,
    sizeClass,
    className,
  ].filter(Boolean).join(' ');

  return (
    <Component ref={ref} className={classes} {...props}>
      {dot && <span className="badge-dot" aria-hidden="true" />}
      {children}
    </Component>
  );
});

Badge.displayName = 'Badge';
export default Badge;