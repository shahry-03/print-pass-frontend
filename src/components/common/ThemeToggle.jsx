import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

// ── Icon size presets ──
const SIZE_MAP = {
  sm: 16,
  md: 18,
  lg: 22,
};

/**
 * ThemeToggle — Accessible dark/light mode switch.
 *
 * Features:
 * - Dynamic aria-label describing the NEXT action (screen-reader friendly)
 * - Animated icon transition with rotation + fade + scale
 * - Configurable icon size
 * - Spring-based hover/tap micro-interactions
 * - Respects prefers-reduced-motion automatically (via Framer Motion)
 * - No `title` attribute to prevent double-announcement in screen readers
 */
const ThemeToggle = ({
  size = 'md',
  className = '',
  ...rest
}) => {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';
  const iconSize = SIZE_MAP[size] ?? SIZE_MAP.md;
  const nextModeLabel = isDark ? 'light' : 'dark';

  return (
    <Motion.button
      type="button"
      className={`theme-toggle ${className}`.trim()}
      onClick={toggleTheme}
      aria-label={`Switch to ${nextModeLabel} mode`}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...rest}
    >
      <AnimatePresence mode="wait" initial={false}>
        <Motion.span
          key={isDark ? 'sun' : 'moon'}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 0,
          }}
          aria-hidden="true"
        >
          {isDark ? <Sun size={iconSize} /> : <Moon size={iconSize} />}
        </Motion.span>
      </AnimatePresence>
    </Motion.button>
  );
};

export default ThemeToggle;