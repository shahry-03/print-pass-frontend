import { useState, useEffect, useCallback } from 'react';

/**
 * Safely parse diverse timestamp formats returned by backend APIs:
 * - ISO-8601 with timezone: "2026-10-24T04:40:16Z", "2026-10-24T04:40:16+05:00"
 * - ISO-8601 local format: "2026-10-24T04:40:16"
 * - Epoch timestamp (milliseconds or seconds)
 * - Array format: [2026, 10, 24, 4, 40, 16]
 */
export const parseExpirationDate = (expiresAt) => {
  if (!expiresAt) return null;

  if (expiresAt instanceof Date) {
    return isNaN(expiresAt.getTime()) ? null : expiresAt;
  }

  if (typeof expiresAt === 'number') {
    // If timestamp in seconds (10 digits), convert to ms
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

    // Direct parse
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return d;
    }

    // Fallback: replace space with T if format is "YYYY-MM-DD HH:MM:SS"
    if (trimmed.includes(' ') && !trimmed.includes('T')) {
      const dWithT = new Date(trimmed.replace(' ', 'T'));
      if (!isNaN(dWithT.getTime())) {
        return dWithT;
      }
    }
  }

  return null;
};

/**
 * Custom hook to calculate a drift-free live countdown from an expiration timestamp.
 *
 * @param {string|number|Date|Array} expiresAt - Expiration instant
 * @returns {Object} { formatted, isExpired, isValid, timeLeft, targetDate }
 */
export const useCountdown = (expiresAt) => {
  const calculateState = useCallback(() => {
    const targetDate = parseExpirationDate(expiresAt);

    if (!targetDate) {
      return {
        isExpired: false,
        isValid: false,
        formatted: '—',
        timeLeft: null,
        targetDate: null,
      };
    }

    const diff = targetDate.getTime() - Date.now();

    if (diff <= 0) {
      return {
        isExpired: true,
        isValid: true,
        formatted: 'Expired',
        timeLeft: { days: 0, hours: 0, minutes: 0, seconds: 0 },
        targetDate,
      };
    }

    const totalSeconds = Math.floor(diff / 1000);
    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;
    const totalHours = Math.floor(totalMinutes / 60);
    const hours = totalHours % 24;
    const days = Math.floor(totalHours / 24);

    let formatted = '';
    if (days > 0) {
      formatted = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else if (hours > 0) {
      formatted = `${hours}h ${minutes}m ${seconds}s`;
    } else {
      formatted = `${minutes}m ${seconds}s`;
    }

    return {
      isExpired: false,
      isValid: true,
      formatted,
      timeLeft: { days, hours, minutes, seconds },
      targetDate,
    };
  }, [expiresAt]);

  const [state, setState] = useState(calculateState);

  useEffect(() => {
    // Immediate calculation on prop change
    setState(calculateState());

    const target = parseExpirationDate(expiresAt);
    if (!target) return;

    // If already expired, no interval needed
    if (target.getTime() <= Date.now()) return;

    const interval = setInterval(() => {
      const nextState = calculateState();
      setState(nextState);

      if (nextState.isExpired) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, calculateState]);

  return state;
};

export default useCountdown;
