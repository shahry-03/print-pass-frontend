import { useEffect, useRef, useState } from 'react';
import { jobApi } from '../api/jobApi';
import { saveVoucher } from '../utils/voucherStorage';

const POLLING_INTERVAL_MS = 3000;
const MAX_POLLING_DURATION_MS = 180000; // 3 minutes timeout limit to avoid infinite polling
const MAX_CONSECUTIVE_ERRORS = 5;

/**
 * Custom hook to poll public job conversion status every 3 seconds.
 * 
 * - Only polls if pin exists and initial status is PENDING.
 * - Stops immediately on SUCCESS or FAILED.
 * - Handles temporary network glitches without prematurely marking as failed.
 * - Enforces timeout and prevents overlapping requests.
 * - Cleans up intervals/aborts on unmount, PIN change, or completion.
 *
 * @param {Object} voucher - Current active voucher/job data
 * @param {Function} [onUpdate] - Optional callback when updated data is received
 * @returns {{ isPolling: boolean, pollingError: string|null, isTimedOut: boolean }}
 */
export const useJobStatusPolling = (voucher, onUpdate) => {
  const pin = voucher?.secretKey;
  const initialStatus = voucher?.conversionStatus?.toUpperCase();
  const shouldPoll = Boolean(pin && initialStatus === 'PENDING');

  const [isPolling, setIsPolling] = useState(false);
  const [pollingError, setPollingError] = useState(null);
  const [isTimedOut, setIsTimedOut] = useState(false);

  // Store latest onUpdate in a ref to prevent effect churn
  const onUpdateRef = useRef(onUpdate);
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  // Track active PIN and voucher for safety
  const voucherRef = useRef(voucher);
  useEffect(() => {
    voucherRef.current = voucher;
  }, [voucher]);

  useEffect(() => {
    if (!shouldPoll || !pin) {
      setIsPolling(false);
      return undefined;
    }

    let isMounted = true;
    let inFlight = false;
    let consecutiveErrors = 0;
    const startTime = Date.now();
    let abortController = new AbortController();

    setIsPolling(true);
    setPollingError(null);
    setIsTimedOut(false);

    const checkStatus = async () => {
      // Prevent overlapping polls or calls after unmount
      if (!isMounted || inFlight) return;

      // Check timeout
      if (Date.now() - startTime >= MAX_POLLING_DURATION_MS) {
        if (isMounted) {
          setIsPolling(false);
          setIsTimedOut(true);
          setPollingError('Processing took longer than expected. Please check with the print shop.');
        }
        clearInterval(pollInterval);
        return;
      }

      inFlight = true;

      try {
        const data = await jobApi.getJobStatus(pin, abortController.signal);

        if (!isMounted) return;

        // Reset error count on successful communication
        consecutiveErrors = 0;
        setPollingError(null);

        const currentConv = data?.conversionStatus?.toUpperCase();
        const currentPages = Number.isFinite(Number(data?.totalPages)) ? Math.floor(Number(data.totalPages)) : 0;

        // Merge latest response with existing client metadata
        const updatedVoucher = {
          ...voucherRef.current,
          ...data,
          totalPages: currentPages > 0 ? currentPages : voucherRef.current?.totalPages || 0,
          conversionStatus: currentConv || voucherRef.current?.conversionStatus,
        };

        // Persist to storage
        saveVoucher(updatedVoucher);

        // Notify parent component
        if (typeof onUpdateRef.current === 'function') {
          onUpdateRef.current(updatedVoucher);
        }

        // Stop polling on terminal states
        if (currentConv === 'SUCCESS' || currentConv === 'FAILED') {
          setIsPolling(false);
          clearInterval(pollInterval);
        }
      } catch (err) {
        if (!isMounted || err?.name === 'CanceledError' || err?.name === 'AbortError') {
          return;
        }

        consecutiveErrors += 1;
        // Do not fail immediately on intermittent network blip.
        // Only surface warning after multiple failed attempts.
        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
          if (isMounted) {
            setPollingError('Connection issues while checking document status. Retrying...');
          }
        }
      } finally {
        inFlight = false;
      }
    };

    // Run check every POLLING_INTERVAL_MS
    const pollInterval = setInterval(checkStatus, POLLING_INTERVAL_MS);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      abortController.abort();
    };
  }, [pin, shouldPoll]);

  return { isPolling, pollingError, isTimedOut };
};

export default useJobStatusPolling;
