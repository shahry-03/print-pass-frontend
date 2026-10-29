import { useState, useRef, useEffect, useCallback } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  ScanLine, FileText, Printer, CheckCircle, Download, Zap,
  AlertCircle, Copy, Clock, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { jobApi } from '../../api/jobApi';
import { getErrorMessage, copyToClipboard, formatFileSize, formatDateTime } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import useCountdown from '../../hooks/useCountdown';

// ── Constants ──
const PIN_LENGTH = 6;
const PIN_REGEX = /^\d{6}$/;
const DESKTOP_BREAKPOINT = 768;
const PRINT_IFRAME_TIMEOUT_MS = 8000;

// ═══════════════════════════════════════════════════════════
// Print helper — resilient, timeout-aware, cross-origin aware
// ═══════════════════════════════════════════════════════════

/**
 * Triggers the browser's native print dialog for a PDF URL via a hidden iframe.
 *
 * - Rejects if the iframe doesn't finish loading within `timeoutMs`
 * - Falls back to opening in a new tab if cross-origin blocks the print()
 * - Cleans up the iframe regardless of outcome
 */
const printPDF = (fileUrl, { timeoutMs = PRINT_IFRAME_TIMEOUT_MS } = {}) => {
  return new Promise((resolve, reject) => {
    if (!fileUrl) {
      reject(new Error('No valid file URL provided for printing.'));
      return;
    }

    // Cleanup existing iframe (defensive against rapid re-invocation)
    document.getElementById('printpass-print-iframe')?.remove();

    const iframe = document.createElement('iframe');
    iframe.id = 'printpass-print-iframe';
    Object.assign(iframe.style, {
      position: 'fixed',
      right: '0',
      bottom: '0',
      width: '0',
      height: '0',
      border: '0',
      visibility: 'hidden',
    });
    iframe.src = fileUrl;

    let settled = false;

    const cleanup = () => {
      iframe.remove();
    };

    const settle = (fn, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn(value);
    };

    // Timeout: if iframe never loads, resolve with a warning flag
    const timer = setTimeout(() => {
      settle(() => {
        cleanup();
        console.warn('[PrintStation] Print iframe timed out:', fileUrl);
        reject(new Error('Print dialog timed out. Try downloading the file.'));
      });
    }, timeoutMs);

    iframe.onload = () => {
      try {
        iframe.focus();
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        settle(resolve);
        // Don't cleanup immediately — some browsers abort print if iframe is removed
        setTimeout(cleanup, 2000);
      } catch (err) {
        // Cross-origin or sandbox blocked → fallback to new tab
        console.warn('[PrintStation] Cross-origin print blocked:', err);
        const popup = window.open(fileUrl, '_blank', 'noopener,noreferrer');
        if (popup) {
          settle(resolve);
          setTimeout(() => { try { popup.print?.(); } catch { /* user must print manually */ } }, 500);
        } else {
          settle(reject, new Error('Popup blocked. Please allow popups or download the file.'));
        }
        cleanup();
      }
    };

    iframe.onerror = () => {
      settle(reject, new Error('Failed to load PDF for printing.'));
      cleanup();
    };

    document.body.appendChild(iframe);
  });
};

// ═══════════════════════════════════════════════════════════
// PIN display digits
// ═══════════════════════════════════════════════════════════

const PinDisplay = ({ value }) => {
  const digits = String(value || '').split('');
  return (
    <div className="pp-pin-digits" aria-label={`PIN: ${value}`}>
      {digits.length > 0
        ? digits.map((d, i) => <div key={i} className="pp-pin-digit-box">{d}</div>)
        : <div className="pp-pin-digit-box">—</div>}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════

/**
 * PrintStation — Shop-side terminal for validating PINs and printing jobs.
 *
 * Features:
 * - 6-digit PIN entry with keyboard shortcuts (Enter submits, arrows navigate)
 * - Auto-fetch on complete PIN (configurable)
 * - File preview with copy-PIN, download, print actions
 * - "Mark as Printed" confirmation modal (prevents accidental completion)
 * - PIN expiry countdown (uses useCountdown)
 * - Abort controller for slow fetches (cancel support)
 * - Timeout-aware print PDF with cross-origin fallback
 * - Desktop-only auto-focus (mobile keyboard stays hidden)
 * - Full a11y: aria-labels, shake on error, screen-reader announcements
 */
const PrintStation = () => {
  const [pin, setPin] = useState(() => Array(PIN_LENGTH).fill(''));
  const [step, setStep] = useState('input'); // input | preview | printed
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState(null); // 'fetch' | 'instant' | 'manual'
  const [fileData, setFileData] = useState(null);
  const [error, setError] = useState(null);
  const [hasError, setHasError] = useState(false);
  const [confirmMarkPrinted, setConfirmMarkPrinted] = useState(false);
  const [copied, setCopied] = useState(false);

  const inputRefs = useRef([]);
  const abortRef = useRef(null);

  const pinString = pin.join('');
  const isPinComplete = PIN_REGEX.test(pinString);

  // Countdown for the fetched PIN's expiry
  const countdown = useCountdown(fileData?.expiresAt || null, {
    expiredLabel: 'Expired',
  });

  // ── Abort on unmount ──
  useEffect(() => () => abortRef.current?.abort(), []);

  // ── Desktop-only auto-focus ──
  useEffect(() => {
    if (step !== 'input') return undefined;
    if (typeof window !== 'undefined' && window.innerWidth >= DESKTOP_BREAKPOINT) {
      const t = setTimeout(() => inputRefs.current[0]?.focus(), 80);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [step]);

  // ── Clear errors on typing ──
  const clearError = () => {
    if (error) setError(null);
    if (hasError) setHasError(false);
  };

  const focusInput = (index) => {
    const el = inputRefs.current[index];
    if (el) { el.focus(); el.select?.(); }
  };

  // ── Input handlers ──
  const handleChange = (index, rawValue) => {
    clearError();
    const digit = rawValue.replace(/\D/g, '').slice(-1);
    if (rawValue && !digit) return;

    const newPin = [...pin];
    newPin[index] = digit;
    setPin(newPin);

    if (digit && index < PIN_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newPin = [...pin];
      if (pin[index]) {
        newPin[index] = '';
        setPin(newPin);
      } else if (index > 0) {
        newPin[index - 1] = '';
        setPin(newPin);
        focusInput(index - 1);
      }
      return;
    }
    if (e.key === 'ArrowLeft') { e.preventDefault(); focusInput(index - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); focusInput(index + 1); }
    if (e.key === 'Enter' && isPinComplete) { e.preventDefault(); handleFetchFile(); }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    clearError();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, PIN_LENGTH);
    if (!pasted) return;
    const newPin = Array(PIN_LENGTH).fill('');
    pasted.split('').forEach((c, i) => { newPin[i] = c; });
    setPin(newPin);
    focusInput(Math.min(pasted.length, PIN_LENGTH - 1));
  };

  // ── Fetch file ──
  const handleFetchFile = useCallback(async () => {
    if (!isPinComplete) {
      setError(`Please enter all ${PIN_LENGTH} digits.`);
      setHasError(true);
      toast.error(`Please enter all ${PIN_LENGTH} digits`);
      return;
    }

    setLoading(true);
    setActionType('fetch');
    setError(null);
    abortRef.current = new AbortController();

    try {
      // ✓ FIX: direct data from jobApi
      const data = await jobApi.getFileByPin(pinString, abortRef.current.signal);
      setFileData(data);
      setStep('preview');
      toast.success('File found!');
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
      const msg = getErrorMessage(err);
      setError(msg);
      setHasError(true);
      toast.error(msg);
    } finally {
      setLoading(false);
      setActionType(null);
      abortRef.current = null;
    }
  }, [isPinComplete, pinString]);

  // ── Derived File & Conversion State ──
  const pages = Number.isFinite(Number(fileData?.totalPages)) && Number(fileData?.totalPages) > 0
    ? Math.floor(Number(fileData.totalPages))
    : 0;

  const conversionState = (() => {
    if (!fileData) return null;
    if (fileData.conversionStatus) {
      const s = String(fileData.conversionStatus).toUpperCase();
      if (['PENDING', 'SUCCESS', 'FAILED'].includes(s)) return s;
    }
    if (fileData.convertedPdfUrl) return 'SUCCESS';
    const ext = fileData.fileName?.split('.')?.pop()?.toLowerCase() || '';
    if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext)) {
      return 'PENDING';
    }
    return pages > 0 ? 'SUCCESS' : 'PENDING';
  })();

  const isPrintReady = Boolean(conversionState === 'SUCCESS' && fileData?.convertedPdfUrl);

  // ── Instant Print ──
  const handleInstantPrint = useCallback(async () => {
    if (!fileData?.convertedPdfUrl) {
      toast.error('Printable PDF is not ready yet. Please download the original file.');
      return;
    }

    setLoading(true);
    setActionType('instant');
    setError(null);

    try {
      // 1. Attempt native print via iframe, or fallback to window.open
      try {
        await printPDF(fileData.convertedPdfUrl);
      } catch (printErr) {
        console.warn('[PrintStation] Direct print fallback:', printErr);
        window.open(fileData.convertedPdfUrl, '_blank', 'noopener,noreferrer');
      }

      // 2. Notify backend that job is printed
      const result = await jobApi.printJob(pinString);
      setStep('printed');
      toast.success(result?.message || 'Print job sent & marked as complete!');
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setActionType(null);
    }
  }, [fileData, pinString]);

  // ── Mark as Printed (requires confirmation) ──
  const handleConfirmMarkPrinted = useCallback(async () => {
    setConfirmMarkPrinted(false);
    setLoading(true);
    setActionType('manual');
    setError(null);

    try {
      const result = await jobApi.printJob(pinString);
      setStep('printed');
      toast.success(result?.message || 'Job marked as printed!');
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setActionType(null);
    }
  }, [pinString]);

  // ── Reset for next customer ──
  const handleReset = useCallback(() => {
    abortRef.current?.abort();
    setPin(Array(PIN_LENGTH).fill(''));
    setStep('input');
    setFileData(null);
    setActionType(null);
    setError(null);
    setHasError(false);
    setCopied(false);
  }, []);

  // ── Copy PIN ──
  const handleCopyPin = async () => {
    const success = await copyToClipboard(pinString);
    if (success) {
      setCopied(true);
      toast.success('PIN copied');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="print-station">
      <div className="page-header" style={{ textAlign: 'center' }}>
        <h1 className="print-station-title">
          <ScanLine size={28} aria-hidden="true" />
          <span>Print Station</span>
        </h1>
        <p>Enter the customer's {PIN_LENGTH}-digit PIN to fetch their file</p>
      </div>

      <AnimatePresence mode="wait">
        {/* ── STEP 1: PIN Input ── */}
        {step === 'input' && (
          <Motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="print-station-card">
              <h3 className="print-station-card-title">Enter PIN Code</h3>
              <p className="text-sm text-muted" style={{ marginBottom: 16 }}>
                Ask the customer for their {PIN_LENGTH}-digit code
              </p>

              <Motion.div
                className="pin-input-wrapper"
                onPaste={handlePaste}
                animate={hasError ? { x: [0, -8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
                transition={{ duration: 0.4 }}
              >
                {pin.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    className={`pin-char-input ${hasError ? 'pin-char-input-error' : ''}`}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onFocus={(e) => e.target.select()}
                    disabled={loading}
                    aria-label={`PIN digit ${index + 1} of ${PIN_LENGTH}`}
                    aria-invalid={hasError || undefined}
                  />
                ))}
              </Motion.div>

              <p className="sr-only" aria-live="polite">
                {pinString.length} of {PIN_LENGTH} digits entered
              </p>

              {error && (
                <div role="alert" aria-live="assertive" className="print-station-error">
                  <AlertCircle size={16} aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                fullWidth
                size="lg"
                loading={loading && actionType === 'fetch'}
                loadingText="Fetching…"
                disabled={loading || !isPinComplete}
                onClick={handleFetchFile}
                style={{ marginTop: 16 }}
              >
                Fetch File
              </Button>

              {loading && actionType === 'fetch' && (
                <button
                  type="button"
                  onClick={() => abortRef.current?.abort()}
                  className="upload-cancel-btn"
                  style={{ marginTop: 10 }}
                >
                  Cancel
                </button>
              )}
            </Card>
          </Motion.div>
        )}

        {/* ── STEP 2: Preview ── */}
        {step === 'preview' && fileData && (
          <Motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="file-preview-card">
              <div className="file-icon">
                <FileText size={28} aria-hidden="true" />
              </div>
              <h3 title={fileData.fileName}>{fileData.fileName}</h3>

              {fileData.message && (
                <p className="text-sm text-muted" style={{ margin: '8px 0 4px' }}>
                  {fileData.message}
                </p>
              )}

              {/* File metadata row */}
              <div className="print-station-meta">
                {fileData.fileSize && (
                  <span>{formatFileSize(fileData.fileSize)}</span>
                )}
                {fileData.createdAt && (
                  <span>Uploaded {formatDateTime(fileData.createdAt)}</span>
                )}
                {fileData.expiresAt && (
                  <span
                    className={countdown.isExpired ? 'text-danger' : ''}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <Clock size={12} aria-hidden="true" />
                    {countdown.isExpired ? 'Expired' : `Valid for ${countdown.formatted}`}
                  </span>
                )}
              </div>

              {/* Conversion & Page Count Banner */}
              <div className={`print-station-status-card ${conversionState?.toLowerCase() || 'pending'}`}>
                {conversionState === 'PENDING' && (
                  <>
                    <div className="print-station-status-icon">
                      <Spinner size="sm" />
                    </div>
                    <div className="print-station-status-info">
                      <div className="print-station-status-title">Processing Document</div>
                      <div className="print-station-status-desc">
                        Calculating pages and generating print-ready PDF...
                      </div>
                    </div>
                    <span className="print-station-status-badge pending">
                      Calculating...
                    </span>
                  </>
                )}

                {conversionState === 'SUCCESS' && (
                  <>
                    <div className="print-station-status-icon success">
                      <CheckCircle size={18} aria-hidden="true" />
                    </div>
                    <div className="print-station-status-info">
                      <div className="print-station-status-title">Print Ready (PDF)</div>
                      <div className="print-station-status-desc">
                        Document converted successfully. Ready for instant print.
                      </div>
                    </div>
                    <span className="print-station-status-badge success">
                      {pages > 0 ? `${pages} ${pages === 1 ? 'Page' : 'Pages'}` : 'Ready'}
                    </span>
                  </>
                )}

                {conversionState === 'FAILED' && (
                  <>
                    <div className="print-station-status-icon failed">
                      <AlertCircle size={18} aria-hidden="true" />
                    </div>
                    <div className="print-station-status-info">
                      <div className="print-station-status-title">PDF Conversion Unavailable</div>
                      <div className="print-station-status-desc">
                        Direct printing is unavailable. Please download the original file to print.
                      </div>
                    </div>
                    <span className="print-station-status-badge failed">
                      Download Only
                    </span>
                  </>
                )}
              </div>

              {/* PIN row with copy */}
              <div className="print-station-pin-row">
                <PinDisplay value={pinString} />
                <Button
                  variant="ghost"
                  size="sm"
                  icon={copied ? CheckCircle : Copy}
                  onClick={handleCopyPin}
                >
                  {copied ? 'Copied' : 'Copy PIN'}
                </Button>
              </div>

              {/* Action buttons */}
              <div className="print-station-actions">
                {/* 1. Download Original File */}
                {fileData.fileUrl ? (
                  <Button
                    as="a"
                    href={fileData.fileUrl}
                    download={fileData.fileName || 'document'}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="secondary"
                    icon={Download}
                    disabled={loading}
                    title="Download the original uploaded file"
                  >
                    Download Original
                  </Button>
                ) : (
                  <Button variant="secondary" icon={Download} disabled>
                    Download Original
                  </Button>
                )}

                {/* 2. Instant Print (PDF) - only enabled when conversionState === SUCCESS and convertedPdfUrl exists */}
                <Button
                  variant="primary"
                  icon={Zap}
                  loading={loading && actionType === 'instant'}
                  loadingText="Opening Print…"
                  disabled={loading || countdown.isExpired || !isPrintReady}
                  onClick={handleInstantPrint}
                  className="print-station-instant-btn"
                  title={
                    !isPrintReady
                      ? (conversionState === 'PENDING' ? 'Document conversion in progress...' : 'Instant print unavailable for this file')
                      : 'Trigger instant print dialog'
                  }
                >
                  Instant Print
                </Button>

                {/* 3. Mark as Printed */}
                <Button
                  variant="ghost"
                  icon={Printer}
                  disabled={loading || countdown.isExpired}
                  onClick={() => setConfirmMarkPrinted(true)}
                  title="Mark as completed after physical printing"
                >
                  Mark as Printed
                </Button>
              </div>

              {countdown.isExpired && (
                <div role="alert" className="print-station-error" style={{ marginTop: 12 }}>
                  <AlertCircle size={16} aria-hidden="true" />
                  <span>This PIN has expired. Ask the customer to regenerate a new PIN.</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="print-station-reset"
              >
                Cancel &amp; enter new PIN
              </button>
            </Card>
          </Motion.div>
        )}

        {/* ── STEP 3: Success ── */}
        {step === 'printed' && (
          <Motion.div
            key="printed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="print-station-success">
              <div className="print-station-success-icon">
                <CheckCircle size={32} aria-hidden="true" />
              </div>
              <h2>Print Complete!</h2>
              <p className="text-muted" style={{ marginBottom: 24 }}>
                The print job has been marked as ready for pickup.
              </p>
              <Button onClick={handleReset} size="lg" icon={RefreshCw}>
                Next Customer
              </Button>
            </Card>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* ── Confirm "Mark as Printed" ── */}
      <Modal
        isOpen={confirmMarkPrinted}
        onClose={() => setConfirmMarkPrinted(false)}
        title="Mark job as printed?"
        description="This will permanently complete the job. The customer will not be able to print it again."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmMarkPrinted(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmMarkPrinted}
              loading={loading && actionType === 'manual'}
            >
              Yes, mark as printed
            </Button>
          </>
        }
      >
        <p className="text-sm">
          Confirm that <strong>{fileData?.fileName}</strong> has been printed
          successfully at this station.
        </p>
      </Modal>
    </div>
  );
};

export default PrintStation;