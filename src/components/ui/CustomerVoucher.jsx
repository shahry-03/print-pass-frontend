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
    jobStatus = 'PENDING',
    expiresAt,
    createdAt,
    fileSize,
    totalPages,
    pageCount,
    conversionStatus,
  } = voucher || {};

  // Clean page count: valid positive integer
  const pages = Number.isFinite(Number(totalPages)) && Number(totalPages) > 0
    ? Math.floor(Number(totalPages))
    : (Number.isFinite(Number(pageCount)) && Number(pageCount) > 0 ? Math.floor(Number(pageCount)) : 0);

  // Normalized conversion state: 'PENDING' | 'SUCCESS' | 'FAILED'
  const convStatus = (() => {
    if (conversionStatus) {
      const s = String(conversionStatus).toUpperCase();
      if (['PENDING', 'SUCCESS', 'FAILED'].includes(s)) return s;
    }
    if (pages > 0) return 'SUCCESS';
    const ext = fileName?.split('.')?.pop()?.toLowerCase() || '';
    if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext)) {
      return 'PENDING';
    }
    return pages > 0 ? 'SUCCESS' : 'PENDING';
  })();

  // Live countdown hook
  const { formatted, isExpired, isValid, targetDate } = useCountdown(expiresAt);

  // Normalize PIN to clean 6-character array
  const rawPin = String(secretKey || '').trim();
  const digits = rawPin ? rawPin.padEnd(6, '—').slice(0, 6).split('') : ['—', '—', '—', '—', '—', '—'];

  // Screen reader friendly digit sequence: "1, 2, 3, 4, 5, 6"
  const a11yPin = rawPin ? rawPin.split('').join(', ') : 'Not available';

  const handleCopyPin = useCallback(async () => {
    if (!rawPin) return;
    const success = await copyToClipboard(rawPin);
    if (success) {
      setCopied(true);
      toast.success('Pickup PIN copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } else {
      toast.error('Could not auto-copy. Please write down your PIN.');
    }
  }, [rawPin]);

  // Mobile Web Share API
  const handleShare = useCallback(async () => {
    if (!rawPin) return;
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
  }, [rawPin, fileName, expiresAt, handleCopyPin]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const getStatusBadge = () => {
    if (isExpired) {
      return <span className="badge badge-danger">Expired</span>;
    }

    switch (jobStatus?.toUpperCase()) {
      case 'PENDING':
        return <span className="badge badge-success">Ready for Pickup</span>;
      case 'PRINTED':
        return <span className="badge badge-info">Printed</span>;
      case 'EXPIRED':
        return <span className="badge badge-danger">Expired</span>;
      default:
        return <span className="badge badge-neutral">{jobStatus}</span>;
    }
  };

  return (
    <Card className="customer-voucher-card print-target">
      {/* ── Top Header ── */}
      <div className="voucher-header">
        <div className={`voucher-status-icon ${isExpired ? 'expired' : 'success'}`}>
          {isExpired ? (
            <AlertTriangle size={32} aria-hidden="true" />
          ) : (
            <CheckCircle2 size={32} aria-hidden="true" />
          )}
        </div>
        <h2 className="voucher-title">
          {isExpired ? 'Pickup Voucher Expired' : 'Your Document is Ready'}
        </h2>
        <p className="voucher-subtitle">
          {isExpired
            ? 'The validity window for this document pickup has lapsed.'
            : 'Present this 6-digit PIN at any participating print shop counter.'}
        </p>
      </div>

      {/* ── Expired Alert & Fast Recovery ── */}
      {isExpired && (
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
        {/* Ticket Top Stub: Document Metadata */}
        <div className="voucher-ticket-stub">
          <div className="voucher-stub-file-row">
            <div className="voucher-file-icon-box">
              <FileText size={22} aria-hidden="true" />
            </div>
            <div className="voucher-file-meta-content">
              <span className="voucher-file-eyebrow">Queued Document</span>
              <div className="voucher-file-name" title={fileName}>
                {fileName}
              </div>
              <div className="voucher-file-specs-row">
                {fileSize ? (
                  <span>{typeof fileSize === 'number' ? formatFileSize(fileSize) : fileSize}</span>
                ) : null}
                {fileSize ? <span className="specs-bullet">•</span> : null}

                {/* Conversion status & Page count */}
                {convStatus === 'PENDING' ? (
                  <span className="voucher-page-tag pending" title="Conversion in progress">
                    <Spinner size="sm" inline />
                    <span>Calculating pages…</span>
                  </span>
                ) : convStatus === 'FAILED' ? (
                  <span className="voucher-page-tag failed" title="Conversion failed">
                    <AlertCircle size={12} aria-hidden="true" />
                    <span>Pages unavailable</span>
                  </span>
                ) : (
                  <span className="voucher-page-tag success">
                    <CheckCircle2 size={12} aria-hidden="true" />
                    <span>{pages} {pages === 1 ? 'Page' : 'Pages'}</span>
                  </span>
                )}

                {createdAt ? <span className="specs-bullet">•</span> : null}
                {createdAt ? <span>Uploaded {formatDateTime(createdAt)}</span> : null}
              </div>
            </div>
            {getStatusBadge()}
          </div>

          {/* Inline processing banner when pending or failed */}
          {convStatus === 'PENDING' && (
            <div className="voucher-processing-banner pending" role="status">
              <Spinner size="sm" inline />
              <div className="voucher-processing-text">
                <strong>Your document is being processed.</strong>
                <span>The page count will appear once processing is complete.</span>
              </div>
            </div>
          )}

          {convStatus === 'FAILED' && (
            <div className="voucher-processing-banner failed" role="alert">
              <AlertCircle size={16} className="text-danger" aria-hidden="true" />
              <div className="voucher-processing-text">
                <strong>File could not be processed.</strong>
                <span>File could not be processed. Please upload a valid document.</span>
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
          className={`voucher-pin-section ${isExpired ? 'expired' : ''}`}
          aria-live="polite"
        >
          <div className="voucher-pin-header">
            <span className="voucher-pin-eyebrow">6-Digit Pickup PIN</span>
            <span className="voucher-pin-privacy-tag">
              <ShieldCheck size={12} aria-hidden="true" />
              <span>Private Handshake</span>
            </span>
          </div>

          {/* Screen Reader Voiceover String */}
          <span className="sr-only">Your 6-digit pickup PIN is {a11yPin}</span>

          <div className="voucher-pin-boxes" aria-hidden="true">
            {digits.map((digit, idx) => (
              <div
                key={idx}
                className={`voucher-pin-digit ${digit === '—' ? 'empty' : ''}`}
              >
                {digit}
              </div>
            ))}
          </div>

          {/* Action Group: Copy PIN (Primary Cobalt), Share, Print */}
          <div className="voucher-utility-actions">
            <Button
              variant={copied ? 'success' : 'primary'}
              size="md"
              icon={copied ? Check : Copy}
              onClick={handleCopyPin}
              disabled={!rawPin || isExpired}
              aria-label="Copy PIN code to clipboard"
              className="voucher-copy-btn"
            >
              {copied ? 'Copied PIN' : 'Copy PIN'}
            </Button>

            {'share' in navigator && (
              <Button
                variant="outline"
                size="md"
                icon={Share2}
                onClick={handleShare}
                disabled={!rawPin || isExpired}
                aria-label="Share pickup pass"
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
              className="hidden-mobile-print"
            >
              Print Pass
            </Button>
          </div>
        </div>

        {/* ── Dynamic Expiration Indicator ── */}
        <div className={`voucher-countdown-box ${isExpired ? 'box-expired' : ''}`}>
          <div className="voucher-countdown-row">
            <div className="voucher-countdown-label">
              <Clock
                size={16}
                className={isExpired ? 'text-danger' : 'text-primary'}
                aria-hidden="true"
              />
              <span>PIN Validity</span>
            </div>
            <div className={`voucher-countdown-value ${isExpired ? 'expired' : ''}`}>
              {isExpired ? 'Expired' : `Valid for ${formatted}`}
            </div>
          </div>

          {isValid && targetDate && (
            <div className="voucher-expiry-subtext">
              {isExpired ? (
                <span>Expired on {formatDateTime(expiresAt)}</span>
              ) : (
                <span>Valid until {formatDateTime(expiresAt)}</span>
              )}
            </div>
          )}
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
            onClick={onReset}
            className="voucher-reset-btn"
          >
            Upload Another Document
          </Button>
        )}
        <Button
          as={Link}
          to="/"
          variant="ghost"
          icon={ArrowLeft}
        >
          Back to Home
        </Button>
      </div>
    </Card>
  );
};

export default CustomerVoucher;