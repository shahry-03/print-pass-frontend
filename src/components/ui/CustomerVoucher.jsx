import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2, Copy, Check, Clock, FileText,
  AlertTriangle, ArrowLeft, RefreshCw, Printer, ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from './Button';
import Card from './Card';
import useCountdown from '../../hooks/useCountdown';
import { copyToClipboard, formatDateTime } from '../../utils/helpers';

/**
 * CustomerVoucher Component
 *
 * Displays the post-upload voucher with:
 * - 6-digit pickup PIN
 * - Uploaded file name
 * - Live expiration countdown
 * - Job status
 * - Copy PIN action
 * - Expired state handling with PIN regeneration
 */
const CustomerVoucher = ({
  voucher,
  onReset,
  onRegenerate,
}) => {
  const [copied, setCopied] = useState(false);

  const {
    id,
    secretKey = '',
    fileName = 'Uploaded Document',
    jobStatus = 'PENDING',
    expiresAt,
    createdAt,
  } = voucher || {};

  // Live countdown hook
  const { formatted, isExpired, isValid, targetDate } = useCountdown(expiresAt);

  const digits = String(secretKey || '').trim().split('');

  const handleCopyPin = async () => {
    if (!secretKey) return;
    const success = await copyToClipboard(secretKey);
    if (success) {
      setCopied(true);
      toast.success('PIN copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } else {
      toast.error('Failed to copy PIN. Please copy it manually.');
    }
  };

  const getStatusBadge = () => {
    if (isExpired) {
      return (
        <span className="badge badge-danger">
          Expired
        </span>
      );
    }

    switch (jobStatus?.toUpperCase()) {
      case 'PENDING':
        return (
          <span className="badge badge-success">
            Ready for Pickup
          </span>
        );
      case 'PRINTED':
        return (
          <span className="badge badge-info">
            Printed
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="badge badge-danger">
            Expired
          </span>
        );
      default:
        return (
          <span className="badge badge-neutral">
            {jobStatus}
          </span>
        );
    }
  };

  return (
    <Card className="customer-voucher-card">
      {/* ── Top Header ── */}
      <div className="voucher-header">
        <div className="voucher-success-icon-wrap">
          {isExpired ? (
            <AlertTriangle size={32} className="voucher-warn-icon" />
          ) : (
            <CheckCircle2 size={32} className="voucher-check-icon" />
          )}
        </div>
        <h2 className="voucher-title">
          {isExpired ? 'Pickup Voucher Expired' : 'Upload Successful!'}
        </h2>
        <p className="voucher-subtitle">
          {isExpired
            ? 'This document pickup window has closed'
            : 'Share this 6-digit PIN at any partner print shop counter'}
        </p>
      </div>

      {/* ── Expired Alert Banner ── */}
      {isExpired && (
        <div className="voucher-alert-expired">
          <AlertTriangle size={18} className="voucher-alert-icon" />
          <div className="voucher-alert-content">
            <strong>Validity Period Ended</strong>
            <p>
              This pickup PIN has expired and can no longer be redeemed. You can
              regenerate a new active PIN using this reference code without re-uploading.
            </p>
            {onRegenerate && (
              <Button
                size="sm"
                variant="secondary"
                icon={RefreshCw}
                onClick={() => onRegenerate(secretKey)}
                style={{ marginTop: 8 }}
              >
                Regenerate PIN Now
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ── 6-Digit PIN Display ── */}
      <div className={`voucher-pin-section ${isExpired ? 'expired' : ''}`}>
        <div className="voucher-pin-header">
          <span className="voucher-pin-eyebrow">Customer Pickup PIN</span>
          {getStatusBadge()}
        </div>

        <div className="voucher-pin-boxes" aria-label={`PIN: ${secretKey}`}>
          {digits.length > 0 ? (
            digits.map((digit, idx) => (
              <div key={idx} className="voucher-pin-digit">
                {digit}
              </div>
            ))
          ) : (
            <div className="voucher-pin-digit">—</div>
          )}
        </div>

        {/* Copy PIN Action */}
        <div className="voucher-copy-wrap">
          <Button
            variant={copied ? 'success' : 'secondary'}
            size="sm"
            icon={copied ? Check : Copy}
            onClick={handleCopyPin}
            disabled={!secretKey}
            className="voucher-copy-btn"
          >
            {copied ? 'Copied to Clipboard' : 'Copy 6-Digit PIN'}
          </Button>
        </div>
      </div>

      {/* ── Live Countdown & Expiration Status ── */}
      <div className="voucher-countdown-box">
        <div className="voucher-countdown-row">
          <div className="voucher-countdown-label">
            <Clock size={16} className={isExpired ? 'text-danger' : 'text-accent'} />
            <span>Time Remaining</span>
          </div>
          <div className={`voucher-countdown-value ${isExpired ? 'expired' : ''}`}>
            {formatted}
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

      {/* ── Document Details ── */}
      <div className="voucher-details-panel">
        <div className="voucher-detail-item">
          <FileText size={18} className="voucher-detail-icon" />
          <div className="voucher-detail-text">
            <span className="voucher-detail-label">Uploaded Document</span>
            <span className="voucher-detail-filename" title={fileName}>
              {fileName}
            </span>
          </div>
        </div>

        {createdAt && (
          <div className="voucher-detail-item">
            <ShieldCheck size={18} className="voucher-detail-icon" />
            <div className="voucher-detail-text">
              <span className="voucher-detail-label">Uploaded At</span>
              <span className="voucher-detail-val">
                {formatDateTime(createdAt)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Guidance Note ── */}
      <div className="voucher-guidance-note">
        <Printer size={15} style={{ flexShrink: 0, marginTop: 2, color: 'var(--text-tertiary)' }} />
        <p>
          Visit any participating print shop, provide your 6-digit PIN, and your pages will
          print immediately. No cables or flash drives needed.
        </p>
      </div>

      {/* ── Footer Actions ── */}
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
        <Link to="/">
          <Button variant="ghost" icon={ArrowLeft}>
            Back to Home
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default CustomerVoucher;
