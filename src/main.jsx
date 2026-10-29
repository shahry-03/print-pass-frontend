import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// ── Single CSS entry point ──
// globals.css imports tokens → base → utilities → layout → components
// → pages → print (all inside @layer for cascade control).
// Do NOT import components.css separately — it would double-load styles.
import './styles/globals.css';

import App from './App.jsx';
import { APP_META } from './utils/constants';

// ═══════════════════════════════════════════════════════════
// 1. Console hygiene — runs FIRST so it's active for all code below
// ═══════════════════════════════════════════════════════════

if (import.meta.env.PROD) {
  // Strip verbose logs in production. Keep warn/error for support.
  const noop = () => {};
  console.log = noop;
  console.info = noop;
  console.debug = noop;
}

// ═══════════════════════════════════════════════════════════
// 2. Global error handlers — attach BEFORE React mounts
//    so even early crashes are caught
// ═══════════════════════════════════════════════════════════

/**
 * Single choke-point for forwarding errors to monitoring.
 * Swap `console.error` for Sentry.captureException / LogRocket / etc.
 */
const forwardToMonitoring = (kind, error, context = {}) => {
  // TODO: Replace with Sentry / Bugsnag / your backend logger in prod
  // Sentry.captureException(error, { tags: { kind }, extra: context });
  if (import.meta.env.DEV) {
    console.error(`[${kind}]`, error, context);
  }
};

// Uncaught synchronous errors
window.addEventListener('error', (event) => {
  // Ignore benign ResizeObserver loop warnings (browser quirks, not real bugs)
  if (event.message?.includes('ResizeObserver loop')) return;

  forwardToMonitoring('uncaughtError', event.error || event.message, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
});

// Unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;

  // Silence expected cancellations (user navigated away, aborted upload, etc.)
  if (
    reason?.name === 'AbortError' ||
    reason?.name === 'CanceledError' ||
    reason?.code === 'ERR_CANCELED'
  ) {
    event.preventDefault();
    return;
  }

  forwardToMonitoring('unhandledRejection', reason);
});

// ═══════════════════════════════════════════════════════════
// 3. Root element validation — fail fast with clear message
// ═══════════════════════════════════════════════════════════

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error(
    '[PrintPass] Fatal: #root element not found. ' +
    'Ensure index.html contains <div id="root"></div>.'
  );
}

// ═══════════════════════════════════════════════════════════
// 4. Service worker cleanup (defensive)
//    If a stale SW from a previous deploy is registered, unregister it
//    so users don't get served broken/cached assets after updates.
// ═══════════════════════════════════════════════════════════

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker
    .getRegistrations?.()
    .then((regs) => regs.forEach((reg) => reg.unregister().catch(() => {})))
    .catch(() => {});
}

// ═══════════════════════════════════════════════════════════
// 5. Render
// ═══════════════════════════════════════════════════════════

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// ═══════════════════════════════════════════════════════════
// 6. Dev startup log — helps debug "what build is the user on?"
// ═══════════════════════════════════════════════════════════

if (import.meta.env.DEV) {
  console.info(
    `%c${APP_META.NAME} v${APP_META.VERSION}`,
    'color: #3B82F6; font-weight: 700; font-size: 14px;',
    `\n  Mode:     ${import.meta.env.MODE}`,
    `\n  Dev:      ${import.meta.env.DEV}`,
    `\n  Base URL: ${import.meta.env.VITE_API_URL || '(default → localhost:8080)'}`
  );
}