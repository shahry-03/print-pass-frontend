import { forwardRef, useCallback } from 'react';

export const CARD_PADDINGS = ['none', 'sm', 'md', 'lg'];

// Native elements that need role/tabIndex when acting as buttons
const NON_INTERACTIVE_ELEMENTS = new Set([
  'div', 'article', 'section', 'aside', 'main', 'header', 'footer',
]);

/**
 * Card — Polymorphic, accessible surface container.
 *
 * Features:
 * - Polymorphic `as` prop (div, article, section, Link, etc.)
 * - Padding variants: none | sm | md | lg (default = CSS .card)
 * - Glass + interactive surfaces
 * - `interactive` + `onClick` = full keyboard a11y (Enter/Space, tabIndex, role)
 * - `disabled` state with guarded click AND keyboard (blocks Link navigation)
 * - Built-in `loading` skeleton state (layout-stable)
 * - `aria-busy` / `aria-disabled` for screen readers
 * - Forwards refs
 * - Dev-time validation for paddings / prop misuse
 *
 * ⚠️ Usage note — nested interactive elements:
 *   When using `<Card as={Link} …>` or `<Card as="a" …>` (or any interactive
 *   Card with onClick), DO NOT nest other interactive elements inside
 *   (buttons, links, inputs) — it violates the HTML spec and confuses
 *   assistive technologies. Extract them outside the Card instead.
 *
 * @example
 *   <Card>Basic card</Card>
 *   <Card glass interactive onClick={open}>Clickable card</Card>
 *   <Card as={Link} to="/shops/1">Link card</Card>
 *   <Card padding="none"><img … /></Card>
 *   <Card loading>…</Card>
 */
const Card = forwardRef(({
  children,
  as: Component = 'div',
  glass = false,
  interactive = false,
  loading = false,
  disabled = false,
  padding = 'default',
  className = '',
  onClick,
  onKeyDown,
  tabIndex,
  role,
  ...props
}, ref) => {
  // ── Dev-time validation ──
  if (import.meta.env.DEV) {
    if (padding !== 'default' && !CARD_PADDINGS.includes(padding)) {
      console.warn(
        `[Card] Unknown padding "${padding}". ` +
        `Falling back to "default". Valid: default, ${CARD_PADDINGS.join(', ')}.`
      );
    }
    if (disabled && !interactive) {
      console.warn('[Card] `disabled` has no effect unless `interactive` is true.');
    }
  }

  const safePadding = (padding !== 'default' && !CARD_PADDINGS.includes(padding))
    ? 'default'
    : padding;

  const isDisabled = disabled || loading;
  const isNativeString = typeof Component === 'string';
  const needsButtonA11y = isNativeString && NON_INTERACTIVE_ELEMENTS.has(Component);
  const isClickable = interactive && Boolean(onClick);

  // ✓ Role applies when interactive+onClick, EVEN when disabled
  //   (a disabled button is still semantically a button)
  const isAsButton = isClickable && needsButtonA11y;

  const classes = [
    'card',
    glass && 'card-glass',
    interactive && 'card-interactive',
    isDisabled && interactive && 'card-disabled',
    safePadding !== 'default' && `card-p-${safePadding}`,
    className,
  ].filter(Boolean).join(' ');

  // ── Guarded click ──
  const handleClick = useCallback((event) => {
    if (isDisabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
  }, [isDisabled, onClick]);

  // ── Guarded keydown: blocks ALL keyboard interaction when disabled ──
  const handleKeyDown = useCallback((event) => {
    // When disabled: block activation keys AND skip onKeyDown passthrough.
    // Keeps a consistent "inert" contract for assistive tech.
    if (isDisabled) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
      }
      return;
    }

    if (isAsButton && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick?.(event);
      return;
    }

    onKeyDown?.(event);
  }, [isDisabled, isAsButton, onClick, onKeyDown]);

  // ✓ tabIndex: 0 when enabled, -1 when disabled (skips Tab order),
  //   so a disabled interactive card is announced but not focusable.
  const computedTabIndex = tabIndex ?? (
    isAsButton
      ? (isDisabled ? -1 : 0)
      : undefined
  );

  const computedRole = role ?? (isAsButton ? 'button' : undefined);

  return (
    <Component
      ref={ref}
      className={classes}
      onClick={interactive || onClick ? handleClick : undefined}
      onKeyDown={isAsButton ? handleKeyDown : onKeyDown}
      tabIndex={computedTabIndex}
      role={computedRole}
      aria-disabled={isDisabled && interactive ? true : undefined}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <div className="card-skeleton" aria-hidden="true">
          <div className="skeleton skeleton-line skeleton-title" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line skeleton-short" />
        </div>
      ) : (
        children
      )}
    </Component>
  );
});

Card.displayName = 'Card';
export default Card;