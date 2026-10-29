import { forwardRef } from 'react';

// Exported for consumers / validation
export const SPINNER_SIZES = ['sm', 'md', 'lg', 'xl'];
export const SPINNER_VARIANTS = ['primary', 'neutral', 'success', 'danger', 'on-primary'];

const SIZE_CLASS = {
  sm: 'spinner-sm',
  md: '',
  lg: 'spinner-lg',
  xl: 'spinner-xl',
};

/**
 * Spinner — Accessible loading indicator.
 *
 * Features:
 * - `role="status"` + `aria-label` → screen readers announce "Loading" on mount
 * - `decorative` mode (when parent already conveys meaning — e.g. inside a button)
 * - `inline` mode (no wrapper padding — for use inside cards/buttons)
 * - `fullscreen` mode (fixed overlay with backdrop blur)
 * - 4 sizes (sm, md, lg, xl)
 * - 5 variants (primary, neutral, success, danger, on-primary)
 * - Forwards refs
 * - Dev-time validation
 *
 * @example
 *   <Spinner />                                // Page loader
 *   <Spinner size="lg" />                      // Larger page loader
 *   <Spinner inline size="sm" />               // Inside a card
 *   <Spinner fullscreen label="Loading app" /> // Full-screen overlay
 *   <Spinner variant="success" size="sm" />    // Inline status
 */
const Spinner = forwardRef(({
  size = 'md',
  variant = 'primary',
  label = 'Loading',
  inline = false,
  fullscreen = false,
  decorative = false,
  className = '',
  ...props
}, ref) => {
  // ── Dev-time validation ──
  if (import.meta.env.DEV) {
    if (!SPINNER_SIZES.includes(size)) {
      console.warn(
        `[Spinner] Unknown size "${size}". Falling back to "md". Valid: ${SPINNER_SIZES.join(', ')}.`
      );
    }
    if (!SPINNER_VARIANTS.includes(variant)) {
      console.warn(
        `[Spinner] Unknown variant "${variant}". Falling back to "primary". Valid: ${SPINNER_VARIANTS.join(', ')}.`
      );
    }
  }

  const safeSize = SPINNER_SIZES.includes(size) ? size : 'md';
  const safeVariant = SPINNER_VARIANTS.includes(variant) ? variant : 'primary';

  const spinnerClasses = [
    'spinner',
    SIZE_CLASS[safeSize],
    safeVariant !== 'primary' && `spinner-${safeVariant}`,
    className,
  ].filter(Boolean).join(' ');

  const wrapperClasses = [
    'spinner-wrapper',
    inline && 'spinner-wrapper-inline',
    fullscreen && 'spinner-wrapper-fullscreen',
  ].filter(Boolean).join(' ');

  // ── Accessibility: decorative OR announce via role="status" ──
  const a11yProps = decorative
    ? { 'aria-hidden': 'true' }
    : {
        role: 'status',
        'aria-live': 'polite',
        'aria-label': label,
        'aria-busy': 'true',
      };

  return (
    <div ref={ref} className={wrapperClasses} {...a11yProps} {...props}>
      <div className={spinnerClasses} aria-hidden="true" />
    </div>
  );
});

Spinner.displayName = 'Spinner';
export default Spinner;