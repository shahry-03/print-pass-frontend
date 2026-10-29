import { useState, useEffect, useRef, useMemo } from 'react';

/**
 * Safely parse diverse timestamp formats returned by backend APIs.
 */
export const parseExpirationDate = (expiresAt) => {
  if (!expiresAt) return null;

  if (expiresAt instanceof Date) {
    return isNaN(expiresAt.getTime()) ? null : expiresAt;
  }

  if (typeof expiresAt === 'number') {
    const ms = expiresAt < 1e11 ? expiresAt * 1000 : expiresAt;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }

  if (Array.isArray(expiresAt)) {
    const [year, month = 1, day = 1, hour = 0, minute = 0, second = 0] = expiresAt;
    const d = new Date(year, month - 1, day, hour, minute, second);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof expiresAt === 'string') {
    const trimmed = expiresAt.trim();
    if (!trimmed) return null;

    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) return d;

    if (trimmed.includes(' ') && !trimmed.includes('T')) {
      const dWithT = new Date(trimmed.replace(' ', 'T'));
      if (!isNaN(dWithT.getTime())) return dWithT;
    }
  }

  return null;
};

// ── Built-in formatters ──
const FORMATTERS = {
  long: ({ days, hours, minutes, seconds }) => {
    if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  },
  short: ({ days, hours, minutes }) => {
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  },
  digital: ({ days, hours, minutes, seconds }) => {
    const pad = (n) => String(n).padStart(2, '0');
    const hms = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    return days > 0 ? `${days}d ${hms}` : hms;
  },
};

const DEFAULT_INTERVAL_MS = 1000;
const DEFAULT_FORMAT = 'long';
const DEFAULT_EXPIRED_LABEL = 'Expired';

/**
 * useCountdown — Drift-free live countdown from an expiration timestamp.
 *
 * Features:
 * - Drift-free: recomputes from `Date.now()` each tick
 * - Precise expiry: last tick fires exactly at `expiresAt`
 * - `onExpire` fires exactly once — INCLUDING when mounted already-expired
 * - `onTick` fires each tick with remaining ms
 * - `paused` support + visibility-change refresh
 * - Configurable `intervalMs`, `format` ('long' | 'short' | 'digital' | fn)
 * - `serverOffsetMs` for client/server clock skew
 * - `totalSeconds` uses ceil() so display is natural (never shows "0s" while > 0ms remain)
 *
 * @param {string|number|Date|Array} expiresAt - Expiration instant
 * @param {Object} [options]
 * @param {number}   [options.intervalMs=1000]
 * @param {string|Function} [options.format='long']
 * @param {boolean}  [options.paused=false]
 * @param {Function} [options.onExpire]           - Called once on expiry (incl. initial mount)
 * @param {Function} [options.onTick]             - Called each tick with remainingMs
 * @param {number}   [options.serverOffsetMs=0]
 * @param {string}   [options.expiredLabel='Expired']
 *
 * @returns {Object} { formatted, isExpired, isValid, timeLeft, totalRemainingMs, targetDate }
 */
export const useCountdown = (expiresAt, options = {}) => {
  const {
    intervalMs = DEFAULT_INTERVAL_MS,
    format = DEFAULT_FORMAT,
    paused = false,
    onExpire,
    onTick,
    serverOffsetMs = 0,
    expiredLabel = DEFAULT_EXPIRED_LABEL,
  } = options;

  const [targetDate, setTargetDate] = useState(() => parseExpirationDate(expiresAt));
  const [now, setNow] = useState(() => Date.now() + serverOffsetMs);

  // Refs keep callbacks stable without re-creating the effect
  const onExpireRef = useRef(onExpire);
  const onTickRef = useRef(onTick);
  const expireFiredRef = useRef(false);

  useEffect(() => { onExpireRef.current = onExpire; }, [onExpire]);
  useEffect(() => { onTickRef.current = onTick; }, [onTick]);

  // ── Re-sync when expiresAt or server offset changes ──
  useEffect(() => {
    setTargetDate(parseExpirationDate(expiresAt));
    setNow(Date.now() + serverOffsetMs);
    expireFiredRef.current = false;
  }, [expiresAt, serverOffsetMs]);

  // ── On resume from paused, refresh `now` immediately ──
  useEffect(() => {
    if (!paused) {
      setNow(Date.now() + serverOffsetMs);
    }
  }, [paused, serverOffsetMs]);

  // ── Drift-free ticker ──
  useEffect(() => {
    if (!targetDate || paused) return undefined;

    const targetMs = targetDate.getTime();
    const initialRemaining = targetMs - (Date.now() + serverOffsetMs);

    // ✓ FIX: Fire onExpire once even if we mount already-expired
    if (initialRemaining <= 0) {
      if (!expireFiredRef.current) {
        expireFiredRef.current = true;
        onExpireRef.current?.();
      }
      return undefined;
    }

    let timer;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      const current = Date.now() + serverOffsetMs;
      setNow(current);

      const remaining = targetMs - current;

      if (remaining <= 0) {
        if (!expireFiredRef.current) {
          expireFiredRef.current = true;
          onExpireRef.current?.();
        }
        return;
      }

      onTickRef.current?.(remaining);

      // Wake up exactly at expiry for the last tick
      timer = setTimeout(tick, Math.min(intervalMs, remaining));
    };

    timer = setTimeout(tick, Math.min(intervalMs, initialRemaining));

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        setNow(Date.now() + serverOffsetMs);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [targetDate, paused, intervalMs, serverOffsetMs]);

  // ── Derived state ──
  return useMemo(() => {
    if (!targetDate) {
      return {
        isExpired: false,
        isValid: false,
        formatted: '—',
        timeLeft: null,
        totalRemainingMs: null,
        targetDate: null,
      };
    }

    const remaining = targetDate.getTime() - now;

    if (remaining <= 0) {
      return {
        isExpired: true,
        isValid: true,
        formatted: expiredLabel,
        timeLeft: { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 },
        totalRemainingMs: 0,
        targetDate,
      };
    }

    // ✓ FIX: Use Math.ceil so users never see "0s remaining" while time is left.
    //   (Math.floor(999/1000) === 0 — would show "0s" for a full second.)
    const totalSeconds = Math.max(0, Math.ceil(remaining / 1000));
    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;
    const totalHours = Math.floor(totalMinutes / 60);
    const hours = totalHours % 24;
    const days = Math.floor(totalHours / 24);

    const timeLeft = { days, hours, minutes, seconds, totalSeconds };
    const formatter =
      typeof format === 'function'
        ? format
        : FORMATTERS[format] || FORMATTERS[DEFAULT_FORMAT];

    return {
      isExpired: false,
      isValid: true,
      formatted: formatter(timeLeft),
      timeLeft,
      totalRemainingMs: remaining,
      targetDate,
    };
  }, [targetDate, now, format, expiredLabel]);
};

export default useCountdown;