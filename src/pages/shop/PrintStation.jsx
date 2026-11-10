import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  ScanLine, FileText, Printer, CheckCircle, Download, Zap,
  AlertCircle, Copy, Clock, Archive, RotateCcw, ShieldCheck,
  Search, Sparkles, Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { jobApi } from '../../api/jobApi';
import {
  getErrorMessage, copyToClipboard, formatDateTime, truncateFileName,
} from '../../utils/helpers';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import useCountdown from '../../hooks/useCountdown';
import { loadVoucher, saveVoucher } from '../../utils/voucherStorage';

// ── Constants ──
const PIN_LENGTH = 6;
const PIN_REGEX = /^\d{6}$/;
const DESKTOP_BREAKPOINT = 768;

/**
 * Format badge resolver (e.g. PDF, DOCX, PNG)
 */
const getFileFormatBadge = (fileName = '') => {
  const parts = fileName.split('.');
  if (parts.length > 1) {
    return parts.pop().toUpperCase().slice(0, 5);
  }
  return 'FILE';
};

/**
 * Visual color scheme for file types
 */
const getFileColorTheme = (fileName = '') => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf') {
    return { bg: 'rgba(239, 68, 68, 0.12)', color: '#DC2626', border: 'rgba(239, 68, 68, 0.25)' };
  }
  if (['doc', 'docx'].includes(ext)) {
    return { bg: 'rgba(49, 94, 246, 0.12)', color: '#315EF6', border: 'rgba(49, 94, 246, 0.25)' };
  }
  if (['xls', 'xlsx'].includes(ext)) {
    return { bg: 'rgba(16, 185, 129, 0.12)', color: '#059669', border: 'rgba(16, 185, 129, 0.25)' };
  }
  if (['ppt', 'pptx'].includes(ext)) {
    return { bg: 'rgba(245, 158, 11, 0.12)', color: '#D97706', border: 'rgba(245, 158, 11, 0.25)' };
  }
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
    return { bg: 'rgba(168, 85, 247, 0.12)', color: '#9333EA', border: 'rgba(168, 85, 247, 0.25)' };
  }
  return { bg: 'var(--secondary)', color: 'var(--text-secondary)', border: 'var(--border)' };
};

/**
 * PrintStation — Professional Commercial SaaS Shop Terminal.
 *
 * Preserves 100% of existing business logic, validation, API endpoints,
 * polling sync, customer voucher reset, and print workflows.
 */
const PrintStation = () => {
  const [pin, setPinState] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState(null); // 'fetch' | 'instant' | 'manual'
  const [fileData, setFileData] = useState(null);
  const [error, setError] = useState(null);
  const [printError, setPrintError] = useState(null);
  const [hasError, setHasError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [zipDownloading, setZipDownloading] = useState(false);

  const inputRefs = useRef([]);
  const abortRef = useRef(null);

  const pinString = typeof pin === 'string' ? pin : Array.isArray(pin) ? pin.join('') : String(pin ?? '');
  const pinDigits = useMemo(() => {
    return Array.from({ length: PIN_LENGTH }, (_, i) => pinString[i] || '');
  }, [pinString]);

  const isPinComplete = PIN_REGEX.test(pinString);

  // setPin accepts string or array for maximum flexibility
  const setPin = useCallback((val) => {
    if (Array.isArray(val)) {
      setPinState(val.join('').slice(0, PIN_LENGTH));
    } else {
      setPinState(String(val ?? '').slice(0, PIN_LENGTH));
    }
  }, []);

  // Countdown for the fetched PIN's expiry
  const countdown = useCountdown(fileData?.expiresAt || null, {
    expiredLabel: 'Expired',
  });

  // ── Abort on unmount ──
  useEffect(() => () => abortRef.current?.abort(), []);

  // ── Desktop auto-focus on initial mount ──
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= DESKTOP_BREAKPOINT) {
      const t = setTimeout(() => inputRefs.current[0]?.focus(), 80);
      return () => clearTimeout(t);
    }
    return undefined;
  }, []);

  // ── Clear errors on typing ──
  const clearError = () => {
    if (error) setError(null);
    if (printError) setPrintError(null);
    if (hasError) setHasError(false);
  };

  const focusInput = (index) => {
    const el = inputRefs.current[index];
    if (el) { el.focus(); el.select?.(); }
  };

  // ── Input handlers ──
  const handleChange = (index, rawValue) => {
    clearError();
    // If a job was already loaded, changing the PIN clears the stale verified job
    if (fileData) setFileData(null);

    const digit = rawValue.replace(/\D/g, '').slice(-1);
    if (rawValue && !digit) return;

    const newDigits = [...pinDigits];
    newDigits[index] = digit;
    setPin(newDigits.join(''));

    if (digit && index < PIN_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      clearError();
      if (fileData) setFileData(null);
      const newDigits = [...pinDigits];
      if (newDigits[index]) {
        newDigits[index] = '';
        setPin(newDigits.join(''));
      } else if (index > 0) {
        newDigits[index - 1] = '';
        setPin(newDigits.join(''));
        focusInput(index - 1);
      }
      return;
    }
    if (e.key === 'ArrowLeft') { e.preventDefault(); focusInput(index - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); focusInput(index + 1); }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isPinComplete && !loading) {
        handleFetchFile();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    clearError();
    if (fileData) setFileData(null);
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, PIN_LENGTH);
    if (!pasted) return;
    setPin(pasted);
    focusInput(Math.min(pasted.length, PIN_LENGTH - 1));
  };

  // ── Fetch file ──
  const handleFetchFile = useCallback(async () => {
    if (!isPinComplete) {
      const msg = `Please enter all ${PIN_LENGTH} digits.`;
      setError(msg);
      setHasError(true);
      toast.error(msg);
      return;
    }

    setLoading(true);
    setActionType('fetch');
    setError(null);
    setPrintError(null);
    setHasError(false);
    abortRef.current = new AbortController();

    try {
      const data = await jobApi.getFileByPin(pinString, abortRef.current.signal);
      setFileData(data);
      toast.success('Job details verified successfully!');
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

  // ── Derived Multi-File List & Conversion State ──
  const filesList = useMemo(() => {
    if (Array.isArray(fileData?.files) && fileData.files.length > 0) {
      return fileData.files;
    }
    if (fileData?.fileName) {
      return [{
        id: 'legacy-1',
        fileName: fileData.fileName,
        totalPages: fileData.totalPages || 0,
        originalFileUrl: fileData.fileUrl || fileData.originalFileUrl,
        convertedPdfUrl: fileData.convertedPdfUrl,
      }];
    }
    return [];
  }, [fileData]);

  // ── Source of truth for single-file vs multi-file UI logic ──
  const filesArray = Array.isArray(fileData?.files) ? fileData.files : [];
  const fileCount = filesArray.length > 0 ? filesArray.length : (fileData?.fileName ? 1 : 0);
  const isSingleFile = fileCount === 1;
  const isMultiFile = fileCount > 1;

  const totalCalculatedPages = useMemo(() => {
    if (Number.isFinite(Number(fileData?.totalPages)) && Number(fileData.totalPages) > 0) {
      return Math.floor(Number(fileData.totalPages));
    }
    return filesList.reduce((sum, f) => sum + (Number(f.totalPages) || 0), 0);
  }, [fileData, filesList]);

  const conversionState = (() => {
    if (!fileData) return null;
    if (fileData.conversionStatus) {
      const s = String(fileData.conversionStatus).toUpperCase();
      if (['PENDING', 'PROCESSING', 'SUCCESS', 'PARTIAL_SUCCESS', 'FAILED'].includes(s)) return s;
    }
    if (fileData.instantPrintAllPdfUrl) return 'SUCCESS';
    if (filesList.some((f) => f.convertedPdfUrl)) return 'SUCCESS';
    return totalCalculatedPages > 0 ? 'SUCCESS' : 'PENDING';
  })();

  // ── Instant Print All (Merged PDF) ──
  const handleInstantPrintAll = useCallback(() => {
    const url = fileData?.instantPrintAllPdfUrl;
    if (!url) {
      toast.error('Print-ready merged PDF is not available.');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [fileData]);

  // ── Instant Print Individual File ──
  const handlePrintIndividualFile = useCallback((file) => {
    const printUrl = file?.convertedPdfUrl;
    if (!printUrl) {
      toast.error('Converted PDF is not available for this file.');
      return;
    }
    window.open(printUrl, '_blank', 'noopener,noreferrer');
  }, []);

  // ── Download All ZIP ──
  const handleDownloadAllZip = useCallback(async () => {
    if (zipDownloading) return;
    setZipDownloading(true);
    try {
      const zipUrl = fileData?.downloadAllZipUrl || pinString;
      const blob = await jobApi.downloadAllZip(zipUrl);
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `PrintPass_${pinString}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
      toast.success('ZIP download completed!');
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(`Download failed: ${msg}`);
    } finally {
      setZipDownloading(false);
    }
  }, [zipDownloading, fileData, pinString]);

  // ── Execute Mark as Printed (After Modal Confirmation) ──
  const executeMarkAsPrinted = useCallback(async () => {
    if (loading) return; // Prevent multiple submissions
    if (!isPinComplete) return;

    setLoading(true);
    setActionType('manual');
    setPrintError(null);

    try {
      const result = await jobApi.printJob(pinString);
      const successMsg = result?.message || 'Print completed successfully! Ready for pickup.';

      // Expire and reset customer voucher to zero if stored locally
      try {
        const stored = loadVoucher();
        if (stored && (stored.secretKey === pinString || stored.secretKey === '000000')) {
          saveVoucher({
            ...stored,
            secretKey: '000000',
            expiresAt: new Date(Date.now() - 1000).toISOString(),
            jobStatus: 'READY',
          });
        }
      } catch (storageErr) {
        console.warn('Could not update stored customer voucher:', storageErr);
      }

      // Display Success Notification
      toast.success(successMsg);

      // Close modal and clear state
      setIsConfirmModalOpen(false);
      setPin('');
      setFileData(null);
      setError(null);
      setPrintError(null);
      setHasError(false);

      // Reset UI for next customer
      if (typeof window !== 'undefined' && window.innerWidth >= DESKTOP_BREAKPOINT) {
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      setPrintError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setActionType(null);
    }
  }, [loading, isPinComplete, pinString, setPin]);

  // ── Reset for next customer ──
  const handleReset = useCallback(() => {
    abortRef.current?.abort();
    setIsConfirmModalOpen(false);
    setPin('');
    setFileData(null);
    setActionType(null);
    setError(null);
    setPrintError(null);
    setHasError(false);
    setCopied(false);
    if (typeof window !== 'undefined' && window.innerWidth >= DESKTOP_BREAKPOINT) {
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    }
  }, [setPin]);

  // ── Copy PIN ──
  const handleCopyPin = async () => {
    const success = await copyToClipboard(pinString);
    if (success) {
      setCopied(true);
      toast.success('PIN copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="ps-workspace">
      {/* ── Page Header ── */}
      <div className="ps-header">
        <div className="ps-header-left">
          <div className="ps-header-badge">
            <ScanLine size={14} className="text-primary" aria-hidden="true" />
            <span>Active Terminal</span>
          </div>
          <h1 className="ps-title">Print Station</h1>
          <p className="ps-subtitle">
            Validate customer pickup PINs, verify merged documents, and dispatch print jobs.
          </p>
        </div>

        <div className="ps-header-right">
          <div className="ps-status-pill">
            <span className="ps-status-dot" aria-hidden="true" />
            <span>Terminal Online</span>
          </div>

          {fileData && (
            <Button
              variant="secondary"
              size="sm"
              icon={RotateCcw}
              onClick={handleReset}
              disabled={loading}
              title="Clear terminal for next customer"
            >
              New Customer
            </Button>
          )}
        </div>
      </div>

      {/* ── Empty State: PIN Entry Hero Card & Workflow Guide ── */}
      {!fileData && (
        <div className="ps-pin-entry-container">
          <Card className="ps-pin-card">
            <div className="ps-pin-card-header">
              <div className="ps-pin-icon-wrap">
                <ShieldCheck size={26} aria-hidden="true" />
              </div>
              <h2 className="ps-pin-card-title">Enter Customer Pickup PIN</h2>
              <p className="ps-pin-card-subtitle">
                Enter the 6-digit pickup code shown on the customer's voucher or mobile pass.
              </p>
            </div>

            <Motion.div
              className="ps-pin-input-group"
              onPaste={handlePaste}
              animate={hasError ? { x: [0, -8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
              transition={{ duration: 0.35 }}
            >
              {pinDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  className={`ps-pin-digit-box ${digit ? 'is-filled' : ''} ${hasError ? 'is-error' : ''}`}
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
              <div role="alert" aria-live="assertive" className="ps-error-banner">
                <AlertCircle size={16} aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <div className="ps-pin-actions">
              <Button
                fullWidth
                size="lg"
                variant="primary"
                icon={Search}
                loading={loading && actionType === 'fetch'}
                loadingText="Verifying PIN..."
                disabled={loading || !isPinComplete}
                onClick={handleFetchFile}
                className="ps-fetch-btn"
              >
                Fetch Customer Job
              </Button>

              {loading && actionType === 'fetch' && (
                <button
                  type="button"
                  onClick={() => abortRef.current?.abort()}
                  className="ps-cancel-link"
                >
                  Cancel verification
                </button>
              )}
            </div>
          </Card>

          {/* Loading Skeleton */}
          {loading && actionType === 'fetch' && (
            <div className="ps-skeleton-wrapper" aria-busy="true" aria-label="Loading job details">
              <div className="ps-skeleton-metrics">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="ps-skeleton-card" />
                ))}
              </div>
              <div className="ps-skeleton-banner" />
              <div className="ps-skeleton-table" />
            </div>
          )}

          {/* Workflow Guide (Shown when idle to eliminate empty whitespace) */}
          {!loading && (
            <div className="ps-workflow-guide">
              <div className="ps-workflow-header">
                <Sparkles size={16} className="text-primary" aria-hidden="true" />
                <span>Shop Terminal Workflow</span>
              </div>
              <div className="ps-workflow-steps">
                <div className="ps-workflow-step-card">
                  <span className="ps-step-num">01</span>
                  <h4>Receive Customer PIN</h4>
                  <p>Customer presents their 6-digit code generated from their mobile receipt or voucher.</p>
                </div>
                <div className="ps-workflow-step-card">
                  <span className="ps-step-num">02</span>
                  <h4>Inspect Documents</h4>
                  <p>Review total pages, individual filenames, and automatic merged PDF status.</p>
                </div>
                <div className="ps-workflow-step-card">
                  <span className="ps-step-num">03</span>
                  <h4>Instant Print &amp; Complete</h4>
                  <p>Send all files to your printer with 1-click or export a full ZIP package.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Populated State: Verified Job Dashboard ── */}
      <AnimatePresence>
        {fileData && (
          <Motion.div
            key="ps-verified-workspace"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="ps-verified-workspace"
          >
            {/* Top Job Command Bar */}
            <div className="ps-active-job-bar">
              <div className="ps-active-job-left">
                <span className="ps-verified-chip">
                  <CheckCircle size={14} aria-hidden="true" />
                  <span>Job Verified</span>
                </span>
                <div className="ps-active-pin-badge">
                  <span className="ps-active-pin-label">PIN:</span>
                  <span className="ps-active-pin-value">{pinString}</span>
                  <button
                    type="button"
                    className="ps-pin-copy-icon-btn"
                    onClick={handleCopyPin}
                    title="Copy PIN"
                    aria-label="Copy PIN"
                  >
                    {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                  </button>
                </div>
                {fileData.message && (
                  <span className="ps-active-msg">
                    {fileData.message}
                  </span>
                )}
              </div>

              <div className="ps-active-job-right">
                {isSingleFile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Printer}
                    loading={loading && actionType === 'manual'}
                    loadingText="Finalizing..."
                    disabled={loading || countdown.isExpired}
                    onClick={() => setIsConfirmModalOpen(true)}
                    className="ps-mark-printed-btn"
                    title="Mark job as completed after physical printing"
                  >
                    Mark as Printed
                  </Button>
                )}
                <button
                  type="button"
                  onClick={handleReset}
                  className="ps-switch-pin-btn"
                  disabled={loading}
                >
                  <RotateCcw size={14} aria-hidden="true" />
                  <span>Enter Different PIN</span>
                </button>
              </div>
            </div>

            {/* Metrics Overview Grid (4 Cards - Zero overlap, balanced spacing) */}
            <div className="ps-metrics-grid">
              <div className="ps-metric-card">
                <span className="ps-metric-label">Pickup PIN</span>
                <div className="ps-metric-pin-row">
                  <span className="ps-metric-pin-digits">{pinString}</span>
                  <button
                    type="button"
                    className="ps-metric-copy-btn"
                    onClick={handleCopyPin}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <span className="ps-metric-subtext">Customer Verification Code</span>
              </div>

              <div className="ps-metric-card">
                <span className="ps-metric-label">Total Documents</span>
                <div className="ps-metric-number">
                  {filesList.length} <span className="ps-metric-unit">{filesList.length === 1 ? 'file' : 'files'}</span>
                </div>
                <span className="ps-metric-subtext">Files queued in this job</span>
              </div>

              <div className="ps-metric-card highlight">
                <span className="ps-metric-label">Total Billable Pages</span>
                <div className="ps-metric-number highlight">
                  {totalCalculatedPages > 0 ? totalCalculatedPages : '—'}
                  <span className="ps-metric-unit">pages</span>
                </div>
                <span className="ps-metric-subtext">Summed across all files</span>
              </div>

              <div className="ps-metric-card">
                <span className="ps-metric-label">Validity Expiration</span>
                <div className={`ps-metric-countdown ${countdown.isExpired ? 'expired' : ''}`}>
                  <Clock size={16} aria-hidden="true" />
                  <span>{countdown.isExpired ? 'Expired' : countdown.formatted}</span>
                </div>
                <span className="ps-metric-subtext">
                  {fileData.createdAt ? `Uploaded ${formatDateTime(fileData.createdAt)}` : 'Auto-expires in 24 hours'}
                </span>
              </div>
            </div>

            {/* Conversion Status Banner */}
            <div className={`ps-status-banner ${conversionState?.toLowerCase() || 'pending'}`}>
              <div className="ps-status-banner-icon">
                {conversionState === 'PENDING' && <Spinner size="sm" inline />}
                {conversionState === 'PROCESSING' && <Spinner size="sm" inline />}
                {conversionState === 'SUCCESS' && <CheckCircle size={18} />}
                {conversionState === 'PARTIAL_SUCCESS' && <AlertCircle size={18} />}
                {conversionState === 'FAILED' && <AlertCircle size={18} />}
              </div>
              <div className="ps-status-banner-content">
                <div className="ps-status-banner-title">
                  {conversionState === 'PENDING' && 'Waiting for conversion...'}
                  {conversionState === 'PROCESSING' && 'Converting files...'}
                  {conversionState === 'SUCCESS' && (isMultiFile ? 'Print Ready — Merged PDF Generated' : 'Print Ready — PDF Converted')}
                  {conversionState === 'PARTIAL_SUCCESS' && 'Some files could not be converted'}
                  {conversionState === 'FAILED' && 'Conversion Failed — Direct PDF Printing Unavailable'}
                </div>
                <div className="ps-status-banner-desc">
                  {conversionState === 'PENDING' && 'Your files are waiting for processing.'}
                  {conversionState === 'PROCESSING' && 'We\'re converting your files. Please keep this screen open.'}
                  {conversionState === 'SUCCESS' && (isMultiFile ? 'All documents have been converted and merged into a single print-ready PDF.' : 'Document has been converted to a print-ready PDF.')}
                  {conversionState === 'PARTIAL_SUCCESS' && 'Some files could not be converted. You can still print or download the files that were successfully converted.'}
                  {conversionState === 'FAILED' && 'Unfortunately, none of the files could be converted. Original files remain available for download below.'}
                </div>
              </div>
              <span className={`ps-status-chip ${conversionState?.toLowerCase() || 'pending'}`}>
                {conversionState === 'PENDING' && 'Waiting'}
                {conversionState === 'PROCESSING' && 'Converting'}
                {conversionState === 'SUCCESS' && `${totalCalculatedPages} Pages Ready`}
                {conversionState === 'PARTIAL_SUCCESS' && 'Partial Success'}
                {conversionState === 'FAILED' && 'Download Only'}
              </span>
            </div>

            {printError && (
              <div role="alert" aria-live="assertive" className="ps-error-banner" style={{ marginBottom: 16 }}>
                <AlertCircle size={16} aria-hidden="true" />
                <span>{printError}</span>
              </div>
            )}

            {/* Primary Action Panel (Batch Actions) - Only rendered when more than 1 file */}
            {isMultiFile && (
              <div className="ps-action-panel">
                <div className="ps-action-panel-left">
                  {/* 1. Instant Print All (Primary CTA - Royal Blue) */}
                  <Button
                    variant="primary"
                    size="lg"
                    icon={Zap}
                    disabled={loading || countdown.isExpired || !fileData.instantPrintAllPdfUrl}
                    onClick={handleInstantPrintAll}
                    className="ps-instant-print-btn"
                    title={fileData.instantPrintAllPdfUrl ? 'Open merged PDF in a new browser tab' : 'Merged PDF is unavailable'}
                  >
                    Instant Print All
                  </Button>

                  {/* 2. Download All ZIP (Secondary CTA - Surface Outline) */}
                  <Button
                    variant="secondary"
                    size="lg"
                    icon={Archive}
                    loading={zipDownloading}
                    loadingText="Downloading ZIP..."
                    disabled={loading || countdown.isExpired}
                    onClick={handleDownloadAllZip}
                    className="ps-zip-btn"
                    title="Download all customer files as a single ZIP archive"
                  >
                    Download All ZIP
                  </Button>
                </div>

                <div className="ps-action-panel-right">
                  {/* 3. Mark as Printed (Tertiary CTA) */}
                  <Button
                    variant="ghost"
                    size="lg"
                    icon={Printer}
                    loading={loading && actionType === 'manual'}
                    loadingText="Finalizing..."
                    disabled={loading || countdown.isExpired}
                    onClick={() => setIsConfirmModalOpen(true)}
                    className="ps-mark-printed-btn"
                    title="Mark job as completed after physical printing"
                  >
                    Mark as Printed
                  </Button>
                </div>
              </div>
            )}

            {/* Customer Files Management Section */}
            <div className="ps-files-card">
              <div className="ps-files-header">
                <div className="ps-files-header-left">
                  <FileText size={18} className="text-primary" aria-hidden="true" />
                  <h3 className="ps-files-heading">
                    {isSingleFile ? 'Customer Document' : 'Uploaded Documents'}
                  </h3>
                  <span className="ps-files-count-badge">{filesList.length}</span>
                </div>
                <span className="ps-files-header-hint">
                  {isSingleFile
                    ? 'Click Instant Print to open PDF preview or Download Original for source file'
                    : 'Click Instant Print for individual print preview or Download Original for source file'}
                </span>
              </div>

              {filesList.length === 0 ? (
                <div className="ps-empty-files">
                  <AlertCircle size={20} className="text-muted" />
                  <p>No documents found in this print job.</p>
                </div>
              ) : (
                <div className="ps-files-list">
                  {filesList.map((file, idx) => {
                    const theme = getFileColorTheme(file.fileName);
                    const formatBadge = getFileFormatBadge(file.fileName);

                    return (
                      <div
                        key={file.id || idx}
                        className={`ps-file-item ${isSingleFile ? 'is-single' : ''}`}
                      >
                        <div className="ps-file-main">
                          <div
                            className="ps-file-type-icon"
                            style={{ background: theme.bg, color: theme.color, borderColor: theme.border }}
                          >
                            <FileText size={18} aria-hidden="true" />
                          </div>

                          <div className="ps-file-info">
                            <div className="ps-file-name-row">
                              <span className="ps-file-name" title={file.fileName || `Document ${idx + 1}`}>
                                {truncateFileName(file.fileName || `Document ${idx + 1}`, 42)}
                              </span>
                              <span className="ps-file-ext-badge">{formatBadge}</span>
                            </div>

                            <div className="ps-file-meta-row">
                              {Number(file.totalPages) > 0 ? (
                                <span className="ps-file-pages-pill">
                                  {file.totalPages} {file.totalPages === 1 ? 'page' : 'pages'}
                                </span>
                              ) : (
                                <span className="ps-file-pages-pill pending">
                                  Pages calculating
                                </span>
                              )}

                              {file.convertedPdfUrl ? (
                                <span className="ps-file-status-pill success">
                                  Converted PDF
                                </span>
                              ) : (
                                <span className={`ps-file-status-pill ${conversionState === 'FAILED' ? 'failed' : conversionState === 'PARTIAL_SUCCESS' ? 'warning' : 'neutral'}`}>
                                  {conversionState === 'FAILED' ? 'Conversion Failed' : conversionState === 'PARTIAL_SUCCESS' ? 'Unconverted' : 'Original Document'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="ps-file-actions">
                          {file.convertedPdfUrl ? (
                            <Button
                              variant={isSingleFile ? 'primary' : 'ghost'}
                              size={isSingleFile ? 'md' : 'sm'}
                              icon={Zap}
                              onClick={() => handlePrintIndividualFile(file)}
                              title={`Instant print ${file.fileName}`}
                              className={isSingleFile ? 'ps-single-instant-btn' : ''}
                            >
                              Instant Print
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size={isSingleFile ? 'md' : 'sm'}
                              icon={Zap}
                              disabled
                              title="PDF conversion unavailable for this file"
                            >
                              PDF Unavailable
                            </Button>
                          )}

                          {file.originalFileUrl && (
                            <Button
                              as="a"
                              href={file.originalFileUrl}
                              download={file.fileName || 'file'}
                              target="_blank"
                              rel="noopener noreferrer"
                              variant="secondary"
                              size={isSingleFile ? 'md' : 'sm'}
                              icon={Download}
                              title={`Download original ${file.fileName}`}
                            >
                              Download Original
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {countdown.isExpired && (
              <div role="alert" className="ps-error-banner" style={{ marginTop: 16 }}>
                <AlertCircle size={16} aria-hidden="true" />
                <span>This PIN has expired. Ask the customer to regenerate a new PIN from their voucher.</span>
              </div>
            )}
          </Motion.div>
        )}
      </AnimatePresence>

      {/* ── Mark as Printed Confirmation Modal ── */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => !loading && setIsConfirmModalOpen(false)}
        title="Confirm Job Completion"
        description="Verify all documents have been physically printed before finalizing."
        footer={
          <>
            <Button
              variant="ghost"
              disabled={loading}
              onClick={() => setIsConfirmModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={CheckCircle}
              loading={loading && actionType === 'manual'}
              loadingText="Finalizing..."
              onClick={executeMarkAsPrinted}
            >
              Yes, Mark as Printed
            </Button>
          </>
        }
      >
        <div className="ps-modal-body">
          <div className="ps-modal-summary-box">
            <div className="ps-modal-summary-row">
              <span className="text-muted">Customer PIN</span>
              <strong className="ps-modal-pin font-mono">{pinString}</strong>
            </div>
            <div className="ps-modal-summary-row">
              <span className="text-muted">Total Documents</span>
              <strong>{filesList.length} {filesList.length === 1 ? 'file' : 'files'}</strong>
            </div>
            <div className="ps-modal-summary-row">
              <span className="text-muted">Total Pages</span>
              <strong>{totalCalculatedPages} {totalCalculatedPages === 1 ? 'page' : 'pages'}</strong>
            </div>
          </div>
          <p className="ps-modal-note">
            This will finalize the job in the system, reset the customer's PIN to zero, and mark their voucher as ready for pickup.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default PrintStation;