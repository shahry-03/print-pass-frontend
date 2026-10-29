import { forwardRef, useCallback } from 'react';

// Exported so consumers can build UIs around the valid options
export const BUTTON_VARIANTS = [
  'primary', 'secondary', 'outline', 'ghost', 'danger', 'success',
];
export const BUTTON_SIZES = ['sm', 'md', 'lg'];

const ICON_SIZE = { sm: 14, md: 18, lg: 20 };
const SPINNER_CLASS = { sm: 'spinner spinner-sm', md: 'spinner', lg: 'spinner' };

/**
 * Button — Polymorphic, accessible, production-ready button.
 *
 * Features:
 * - Safe `type="button"` default (prevents accidental form submits)
 * - 6 variants, 3 sizes
 * - `icon` + `iconPosition="left" | "right"`
 * - `iconOnly` mode (requires `aria-label` / `aria-labelledby`)
 * - Layout-stable loading (spinner replaces icon slot, no width jump)
 * - `loadingText` for text swap during async work
 * - `aria-busy` for screen-reader loading announcements
 * - Polymorphic `as` prop with SAFE disabled behavior (blocks clicks too)
 * - Dev-time validation for variants / sizes / a11y labels / prop conflicts
 * - Forwards refs
 *
 * @example
 *   <Button onClick={save} loading={saving}>Save</Button>
 *   <Button variant="secondary" icon={Download} iconPosition="right">Download</Button>
 *   <Button iconOnly icon={X} aria-label="Close" />
 *   <Button as={Link} to="/upload">Go to Upload</Button>
 */
const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  iconOnly = false,
  loadingText,
  as: Component = 'button',
  className = '',
  onClick,
  ...props
}, ref) => {
  const isDisabled = disabled || loading;
  const isNative = Component === 'button';

  // ── Dev-time validation ──
  if (import.meta.env.DEV) {
    if (!BUTTON_VARIANTS.includes(variant)) {
      console.warn(
        `[Button] Unknown variant "${variant}". ` +
        `Falling back to "primary". Valid: ${BUTTON_VARIANTS.join(', ')}.`
      );
    }
    if (!BUTTON_SIZES.includes(size)) {
      console.warn(
        `[Button] Unknown size "${size}". ` +
        `Falling back to "md". Valid: ${BUTTON_SIZES.join(', ')}.`
      );
    }
    if (iconOnly && !props['aria-label'] && !props['aria-labelledby']) {
      console.warn(
        '[Button] `iconOnly` requires `aria-label` or `aria-labelledby` ' +
        'for screen-reader accessibility.'
      );
    }
    if (iconOnly && loadingText) {
      console.warn(
        '[Button] `loadingText` is ignored when `iconOnly` is true. ' +
        'Remove one of them.'
      );
    }
    if (iconOnly && children) {
      console.warn(
        '[Button] `iconOnly` is true but `children` was provided. ' +
        'Children will not be rendered.'
      );
    }
  }

  const safeVariant = BUTTON_VARIANTS.includes(variant) ? variant : 'primary';
  const safeSize = BUTTON_SIZES.includes(size) ? size : 'md';

  const classes = [
    'btn',
    `btn-${safeVariant}`,
    safeSize !== 'md' && `btn-${safeSize}`,
    fullWidth && 'btn-full',
    iconOnly && 'btn-icon',
    !isNative && isDisabled && 'btn-disabled',
    className,
  ].filter(Boolean).join(' ');

  // ── Icon / spinner node ──
  const iconNode = loading ? (
    <span className={SPINNER_CLASS[safeSize]} aria-hidden="true" />
  ) : Icon ? (
    <Icon size={ICON_SIZE[safeSize] || ICON_SIZE.md} aria-hidden="true" />
  ) : null;

  // ── Content (loadingText swaps only when not iconOnly) ──
  const contentNode = !iconOnly && loading && loadingText ? loadingText : children;

  // ── Guarded click handler: blocks clicks when disabled (especially for non-native) ──
  const handleClick = useCallback(
    (event) => {
      if (isDisabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      onClick?.(event);
    },
    [isDisabled, onClick]
  );

  // ── Native vs polymorphic disabled handling ──
  const nativeProps = isNative
    ? { type, disabled: isDisabled }
    : isDisabled
      ? { 'aria-disabled': true, tabIndex: -1 }
      : {};

  return (
    <Component
      ref={ref}
      className={classes}
      aria-busy={loading || undefined}
      onClick={handleClick}
      {...nativeProps}
      {...props}
    >
      {iconOnly ? (
        iconNode
      ) : (
        <>
          {iconPosition === 'left' && iconNode}
          {contentNode}
          {iconPosition === 'right' && iconNode}
        </>
      )}
    </Component>
  );
});

Button.displayName = 'Button';
export default Button;