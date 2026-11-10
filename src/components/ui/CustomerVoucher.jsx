import { useState, useCallback, useId } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2, Copy, Check, Clock, FileText,
  AlertTriangle, ArrowLeft, RefreshCw, Printer, ShieldCheck,
  Share2, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from './Button';
import Card from './Card';
import Spinner from './Spinner';
import useCountdown from '../../hooks/useCountdown';
import { copyToClipboard, formatDateTime, formatFileSize } from '../../utils/helpers';

/**
 * CustomerVoucher Component
 * Handles post-upload token delivery, pickup PIN display, live expiry countdown,
 * instant mobile sharing, and PIN renewal.
 */
const CustomerVoucher = ({
  voucher,
  onReset,
  onRegenerate,
  isRegenerating = false,
}) => {
  const [copied, setCopied] = useState(false);
  const pinRegionId = useId();

  const {
    secretKey = '',
    fileName = 'Uploaded Document',
    fileNames,
    fileCount,
    files: voucherFiles,
    jobStatus = 'PENDING',
    expiresAt,
    createdAt,
    fileSize,
    totalPages,
    pageCount,
    conversionStatus,
  } = voucher || {};

  const totalUploadedFiles = Number.isFinite(Number(fileCount)) && Number(fileCount) > 0
    ? Number(fileCount)
    : (Array.isArray(fileNames) && fileNames.length > 0
      ? fileNames.length
      : (Array.isArray(voucherFiles) && voucherFiles.length > 0 ? voucherFiles.length : 1));

  // Clean page count: valid positive integer
  const pages = Number.isFinite(Number(totalPages)) && Number(totalPages) > 0
    ? Math.floor(Number(totalPages))
    : (Number.isFinite(Number(pageCount)) && Number(pageCount) > 0 ? Math.floor(Number(pageCount)) : 0);

  // Normalized conversion state: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED'
  const convStatus = (() => {
    if (conversionStatus) {
      const s = String(conversionStatus).toUpperCase();
      if (['PENDING', 'PROCESSING', 'SUCCESS', 'PARTIAL_SUCCESS', 'FAILED'].includes(s)) return s;
    }
    if (pages > 0) return 'SUCCESS';
    return 'PENDING';
  })();

  const isPrinted = jobStatus?.toUpperCase() === 'READY' || jobStatus?.toUpperCase() === 'PRINTED';

  // Live countdown hook
  const { formatted, isExpired, isValid, targetDate } = useCountdown(expiresAt);
  const isPinExpired = isExpired || isPrinted;

  // Normalize PIN to clean 6-character array (reset to '000000' once printed)
  const rawPin = isPrinted ? '000000' : String(secretKey || '').trim();
  const digits = rawPin ? rawPin.padEnd(6, '—').slice(0, 6).split('') : ['—', '—', '—', '—', '—', '—'];

  // Screen reader friendly digit sequence: "1, 2, 3, 4, 5, 6"
  const a11yPin = rawPin ? rawPin.split('').join(', ') : 'Not available';

  const handleCopyPin = useCallback(async () => {
    if (!rawPin || isPinExpired) return;
    const success = await copyToClipboard(rawPin);
    if (success) {
      setCopied(true);
      toast.success('Pickup PIN copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } else {
      toast.error('Could not auto-copy. Please write down your PIN.');
    }
  }, [rawPin, isPinExpired]);

  // Mobile Web Share API
  const handleShare = useCallback(async () => {
    if (!rawPin || isPinExpired) return;
    const shareData = {
      title: 'PrintPass Pickup PIN',
      text: `My PrintPass document pickup PIN is: ${rawPin} (File: ${fileName}). Valid until ${formatDateTime(expiresAt)}`,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') handleCopyPin();
      }
    } else {
      handleCopyPin();
    }
  }, [rawPin, isPinExpired, fileName, expiresAt, handleCopyPin]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const getStatusBadge = () => {
    if (isPrinted) {
      return (
        <span className="badge badge-info">
          <span className="badge-dot" aria-hidden="true" />
          Printed
        </span>
      );
    }

    if (isExpired) {
      return (
        <span className="badge badge-danger">
          <span className="badge-dot" aria-hidden="true" />
          Expired
        </span>
      );
    }

    if (convStatus === 'PARTIAL_SUCCESS') {
      return (
        <span className="badge badge-warning">
          <span className="badge-dot" aria-hidden="true" />
          Partial Success
        </span>
      );
    }

    if (convStatus === 'FAILED') {
      return (
        <span className="badge badge-danger">
          <span className="badge-dot" aria-hidden="true" />
          Conversion Failed
        </span>
      );
    }

    if (convStatus === 'PROCESSING') {
      return (
        <span className="badge badge-info">
          <Spinner size="xs" inline />
          Converting
        </span>
      );
    }

    if (convStatus === 'PENDING') {
      return (
        <span className="badge badge-neutral">
          <Spinner size="xs" inline />
          Queued
        </span>
      );
    }

    switch (jobStatus?.toUpperCase()) {
      case 'PENDING':
        return (
          <span className="badge badge-success">
            <span className="badge-dot" aria-hidden="true" />
            Ready for Pickup
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="badge badge-warning">
            <Spinner size="xs" inline />
            In Progress
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="badge badge-danger">
            <span className="badge-dot" aria-hidden="true" />
            Expired
          </span>
        );
      default:
        return <span className="badge badge-neutral">{jobStatus}</span>;
    }
  };

  return (
    <Card className="customer-voucher-card print-target">
      {/* ── Top Header ── */}
      <div className="voucher-header">
        <div className={`voucher-status-icon ${isPinExpired ? 'expired' : 'success'}`}>
          {isPinExpired ? (
            <AlertTriangle size={30} aria-hidden="true" />
          ) : (
            <CheckCircle2 size={30} aria-hidden="true" />
          )}
        </div>
        <h2 className="voucher-title">
          {isPinExpired
            ? 'Pickup Voucher Expired'
            : 'Your Document is Ready'}
        </h2>
        <p className="voucher-subtitle">
          {isPrinted
            ? (totalUploadedFiles > 1
                ? 'Your documents have been printed successfully and are ready for pickup at the counter. The pickup PIN has expired and been reset to zero.'
                : 'Your document has been printed successfully and is ready for pickup at the counter. The pickup PIN has expired and been reset to zero.')
            : isExpired
              ? 'The validity window for this document pickup has lapsed. The pickup PIN has expired.'
              : 'Present this 6-digit PIN at any participating print shop counter.'}
        </p>
      </div>

      {/* ── Expired Alert & Fast Recovery (for timed-out jobs prior to printing) ── */}
      {isExpired && !isPrinted && (
        <div className="voucher-alert-expired" role="alert">
          <AlertTriangle size={20} className="voucher-alert-icon" aria-hidden="true" />
          <div className="voucher-alert-content">
            <strong>Pass Window Expired</strong>
            <p>
              This document was locked for security. You can instantly restore pickup
              access without re-uploading your file.
            </p>
            {onRegenerate && (
              <Button
                size="sm"
                variant="secondary"
                icon={RefreshCw}
                loading={isRegenerating}
                loadingText="Regenerating..."
                onClick={() => onRegenerate(rawPin)}
                className="voucher-regen-btn"
              >
                Regenerate New PIN
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ── Ticket Container ── */}
      <div className="voucher-ticket-body">
        {/* Ticket Top Stub: Queued Documents Card */}
        <div className="voucher-ticket-stub">
          <div className="voucher-stub-header">
            <div className="voucher-stub-heading-group">
              <span className="voucher-stub-eyebrow">QUEUED DOCUMENTS</span>
              <span className="voucher-stub-count-badge">
                {totalUploadedFiles} {totalUploadedFiles === 1 ? 'document' : 'documents'}
              </span>
            </div>
            <div className="voucher-stub-badge-box">
              {getStatusBadge()}
            </div>
          </div>

          <div className="voucher-stub-file-card">
            <div className="voucher-file-icon-box">
              <FileText size={22} aria-hidden="true" />
            </div>
            <div className="voucher-file-details">
              <div className="voucher-file-name" title={fileName}>
                {fileName}
              </div>
              <div className="voucher-file-specs-grid">
                {fileSize ? (
                  <span className="voucher-spec-pill">
                    {typeof fileSize === 'number' ? formatFileSize(fileSize) : fileSize}
                  </span>
                ) : null}

                {/* Conversion status & Page count */}
                {convStatus === 'PENDING' ? (
                  <span className="voucher-spec-pill pending" title="Waiting for conversion">
                    <Spinner size="xs" inline />
                    <span>Waiting for conversion…</span>
                  </span>
                ) : convStatus === 'PROCESSING' ? (
                  <span className="voucher-spec-pill pending" title="Converting files">
                    <Spinner size="xs" inline />
                    <span>Converting files…</span>
                  </span>
                ) : convStatus === 'FAILED' ? (
                  <span className="voucher-spec-pill failed" title="Conversion failed">
                    <AlertCircle size={12} aria-hidden="true" />
                    <span>Conversion failed</span>
                  </span>
                ) : convStatus === 'PARTIAL_SUCCESS' ? (
                  <span className="voucher-spec-pill warning" title="Some files converted, others failed">
                    <AlertTriangle size={12} aria-hidden="true" />
                    <span>{pages} {pages === 1 ? 'Page' : 'Pages'} (Partial)</span>
                  </span>
                ) : (
                  <span className="voucher-spec-pill success">
                    <CheckCircle2 size={12} aria-hidden="true" />
                    <span>{pages} {pages === 1 ? 'Page' : 'Pages'}</span>
                  </span>
                )}

                {createdAt ? (
                  <span className="voucher-spec-pill date" title={`Uploaded ${formatDateTime(createdAt)}`}>
                    <Clock size={11} aria-hidden="true" />
                    <span>{formatDateTime(createdAt)}</span>
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Inline processing banners for PENDING, PROCESSING, SUCCESS, PARTIAL_SUCCESS, FAILED */}
          {convStatus === 'PENDING' && (
            <div className="voucher-processing-banner pending" role="status">
              <Spinner size="sm" inline />
              <div className="voucher-processing-text">
                <strong>Waiting for conversion...</strong>
                <span>Your files are waiting for processing. You can keep this page open or save your PIN.</span>
              </div>
            </div>
          )}

          {convStatus === 'PROCESSING' && (
            <div className="voucher-processing-banner processing" role="status">
              <Spinner size="sm" inline />
              <div className="voucher-processing-text">
                <strong>Converting files...</strong>
                <span>We're converting your files. You can keep this page open.</span>
              </div>
            </div>
          )}

          {convStatus === 'SUCCESS' && !isPrinted && (
            <div className="voucher-processing-banner success" role="status">
              <CheckCircle2 size={16} className="text-success" aria-hidden="true" />
              <div className="voucher-processing-text">
                <strong>
                  {totalUploadedFiles > 1
                    ? 'All files converted successfully!'
                    : 'Document converted successfully!'}
                </strong>
                <span>
                  {totalUploadedFiles > 1
                    ? `Your documents are ready for printing (${pages} ${pages === 1 ? 'page' : 'pages'} total).`
                    : `Your document is ready for printing (${pages} ${pages === 1 ? 'page' : 'pages'}).`}
                </span>
              </div>
            </div>
          )}

          {convStatus === 'PARTIAL_SUCCESS' && (
            <div className="voucher-processing-banner warning" role="alert">
              <AlertTriangle size={16} className="text-warning" aria-hidden="true" />
              <div className="voucher-processing-text">
                <strong>Some files could not be converted</strong>
                <span>Some files could not be converted. You can still print or download the files that were successfully converted ({pages} {pages === 1 ? 'page' : 'pages'} available).</span>
              </div>
            </div>
          )}

          {convStatus === 'FAILED' && (
            <div className="voucher-processing-banner failed" role="alert">
              <AlertCircle size={16} className="text-danger" aria-hidden="true" />
              <div className="voucher-processing-text">
                <strong>Unfortunately, none of your files could be converted</strong>
                <span>All files failed conversion. You can still ask the shopkeeper to print your original documents or re-upload your files as PDF.</span>
              </div>
            </div>
          )}
        </div>

        {/* Ticket Perforation Line & Cutout Notches */}
        <div className="voucher-ticket-divider" aria-hidden="true">
          <span className="voucher-ticket-notch voucher-ticket-notch-left" />
          <span className="voucher-ticket-perforation" />
          <span className="voucher-ticket-notch voucher-ticket-notch-right" />
        </div>

        {/* ── 6-Digit PIN Centerpiece ── */}
        <div
          id={pinRegionId}
          className={`voucher-pin-section ${isPinExpired ? 'expired' : ''}`}
          aria-live="polite"
        >
          <div className="voucher-pin-header">
            <span className="voucher-pin-eyebrow">
              {isPrinted ? 'Pickup PIN (Expired)' : '6-Digit Pickup PIN'}
            </span>
            <span className="voucher-pin-privacy-tag">
              <ShieldCheck size={12} aria-hidden="true" />
              <span>{isPrinted ? 'PIN Reset' : 'Private Handshake'}</span>
            </span>
          </div>

          {/* Expired / Active PIN notification banner */}
          {isPinExpired ? (
            <div className="voucher-pin-expired-notice">
              <ShieldCheck size={13} aria-hidden="true" />
              <span>
                {isPrinted
                  ? 'PIN automatically reset to zero following counter pickup.'
                  : 'PIN validity window has lapsed and can no longer be used.'}
              </span>
            </div>
          ) : (
            <div className="voucher-pin-save-reminder">
              <ShieldCheck size={14} aria-hidden="true" />
              <span>Save this PIN! Provide it at the print shop counter to retrieve your print job.</span>
            </div>
          )}

          {/* Screen Reader Voiceover String */}
          <span className="sr-only">Your 6-digit pickup PIN is {a11yPin}</span>

          <div className="voucher-pin-boxes" aria-hidden="true">
            {digits.map((digit, idx) => (
              <div
                key={idx}
                className={`voucher-pin-digit ${digit === '—' ? 'empty' : ''} ${isPinExpired ? 'expired' : ''}`}
              >
                {digit}
              </div>
            ))}
          </div>

          {/* Action Group: Primary Copy/Expired, Secondary Share + Print */}
          <div className="voucher-utility-actions">
            <Button
              variant={isPinExpired ? 'secondary' : copied ? 'success' : 'primary'}
              size="lg"
              icon={isPinExpired ? AlertTriangle : copied ? Check : Copy}
              onClick={handleCopyPin}
              disabled={!rawPin || isPinExpired}
              aria-label={isPinExpired ? 'PIN expired' : copied ? 'PIN copied to clipboard' : 'Copy PIN code to clipboard'}
              className="voucher-primary-action-btn"
            >
              {isPinExpired ? 'PIN Expired' : copied ? 'Copied to Clipboard!' : 'Copy PIN'}
            </Button>

            <div className="voucher-secondary-actions-row">
              {'share' in navigator && (
                <Button
                  variant="outline"
                  size="md"
                  icon={Share2}
                  onClick={handleShare}
                  disabled={!rawPin || isPinExpired}
                  aria-label="Share pickup pass"
                  className="voucher-secondary-action-btn"
                >
                  Share
                </Button>
              )}

              <Button
                variant="outline"
                size="md"
                icon={Printer}
                onClick={handlePrint}
                aria-label="Print voucher receipt"
                className="voucher-secondary-action-btn"
              >
                Print Pass
              </Button>
            </div>
          </div>
        </div>

        {/* ── Dynamic Expiration Indicator ── */}
        <div className={`voucher-countdown-box ${isPinExpired ? 'box-expired' : ''}`}>
          <div className="voucher-countdown-card">
            <div className="voucher-countdown-left">
              <div className="voucher-countdown-heading-row">
                <div className={`voucher-countdown-icon-box ${isPinExpired ? 'expired' : 'active'}`}>
                  <Clock size={15} aria-hidden="true" />
                </div>
                <div className="voucher-countdown-title-wrap">
                  <span className="voucher-countdown-title">PIN Validity</span>
                  <span className={`voucher-countdown-tag ${isPinExpired ? 'expired' : 'active'}`}>
                    {isPinExpired ? (isPrinted ? 'Printed' : 'Expired') : 'Auto-Purge 24h'}
                  </span>
                </div>
              </div>
              <div className="voucher-countdown-timestamp">
                {isPinExpired ? (
                  <span>
                    {isPrinted
                      ? 'Document printed at counter. PIN reset for security.'
                      : (isValid && targetDate
                          ? `Expired on ${formatDateTime(expiresAt)}`
                          : 'The pickup validity window has ended.')}
                  </span>
                ) : (
                  isValid && targetDate && (
                    <span>Valid until <strong>{formatDateTime(expiresAt)}</strong></span>
                  )
                )}
              </div>
            </div>

            <div className="voucher-countdown-right">
              <span className="voucher-countdown-eyebrow">
                {isPinExpired ? 'STATUS' : 'TIME REMAINING'}
              </span>
              <div
                className={`voucher-countdown-timer-pill ${isPinExpired ? 'expired' : 'active'}`}
                aria-label={isPinExpired ? 'PIN status: Expired' : `Time remaining: ${formatted}`}
              >
                {isPinExpired ? 'Expired' : formatted}
              </div>
            </div>
          </div>
        </div>

        {/* ── 3-Step Pickup Instructions ── */}
        <div className="voucher-steps-guide">
          <div className="voucher-steps-header">
            <span>How to Collect Your Document</span>
          </div>
          <ol className="voucher-steps-list">
            <li>
              <span className="voucher-step-marker">1</span>
              <span>Walk into any participating print shop.</span>
            </li>
            <li>
              <span className="voucher-step-marker">2</span>
              <span>Provide your 6-digit PIN to the counter clerk.</span>
            </li>
            <li>
              <span className="voucher-step-marker">3</span>
              <span>Collect your fresh prints immediately. No cables or USBs.</span>
            </li>
          </ol>
        </div>
      </div>

      {/* ── Navigation Actions ── */}
      <div className="voucher-actions-footer">
        {onReset && (
          <Button
            variant="secondary"
            size="lg"
            onClick={onReset}
            className="voucher-footer-btn voucher-reset-btn"
          >
            Upload Another Document
          </Button>
        )}
        <Button
          as={Link}
          to="/"
          variant="ghost"
          size="md"
          icon={ArrowLeft}
          className="voucher-footer-btn voucher-home-btn"
        >
          Back to Home
        </Button>
      </div>
    </Card>
  );
};

export default CustomerVoucher;