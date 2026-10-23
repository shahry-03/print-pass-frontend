import { useState, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  ScanLine, FileText, Printer, CheckCircle, Download, Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { jobApi } from '../../api/jobApi';
import { getErrorMessage } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

/**
 * Triggers the browser's native print dialog for a remote or blob PDF URL
 * via a clean, isolated hidden iframe.
 */
const printPDF = (fileUrl) => {
  return new Promise((resolve, reject) => {
    if (!fileUrl) {
      reject(new Error('No valid file URL provided for printing.'));
      return;
    }

    // Clean up any existing print iframe
    const existingIframe = document.getElementById('printpass-silent-iframe');
    if (existingIframe) {
      existingIframe.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'printpass-silent-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    iframe.src = fileUrl;

    iframe.onload = () => {
      try {
        iframe.focus();
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        resolve();
      } catch (err) {
        // Fallback: If cross-origin or sandbox blocks direct iframe print, open in target window
        window.open(fileUrl, '_blank')?.print?.();
        resolve();
      }
    };

    iframe.onerror = (err) => {
      reject(err);
    };

    document.body.appendChild(iframe);
  });
};

const PrintStation = () => {
  const [pin, setPin] = useState(Array(6).fill(''));
  const [step, setStep] = useState('input'); // input | preview | printed
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState(null); // 'fetch' | 'instant' | 'manual'
  const [fileData, setFileData] = useState(null);
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').slice(0, 6);
    if (!/^[0-9]+$/.test(pasted)) return;
    const newPin = [...pin];
    pasted.split('').forEach((char, i) => {
      if (i < 6) newPin[i] = char;
    });
    setPin(newPin);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleFetchFile = async () => {
    const pinString = pin.join('');
    if (pinString.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setActionType('fetch');
    try {
      const res = await jobApi.getFileByPin(pinString);
      setFileData(res.data);
      setStep('preview');
      toast.success('File found!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  /**
   * Action 2: Instant Print
   * Triggers native print dialog via hidden iframe + updates API status immediately
   */
  const handleInstantPrint = async () => {
    const pinString = pin.join('');
    setLoading(true);
    setActionType('instant');

    try {
      // 1. Trigger browser print modal if fileUrl is available
      if (fileData?.fileUrl) {
        try {
          await printPDF(fileData.fileUrl);
        } catch (printErr) {
          console.warn('Native iframe print fallback:', printErr);
          window.open(fileData.fileUrl, '_blank');
        }
      }

      // 2. Automatically notify backend that job is printed
      const res = await jobApi.printJob(pinString);
      setStep('printed');
      toast.success(res.data.message || 'Print job sent & marked as complete!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  /**
   * Action 3: Mark as Printed (manual override without browser print dialog)
   */
  const handleMarkAsPrinted = async () => {
    const pinString = pin.join('');
    setLoading(true);
    setActionType('manual');
    try {
      const res = await jobApi.printJob(pinString);
      setStep('printed');
      toast.success(res.data.message || 'Job marked as printed!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  const handleReset = () => {
    setPin(Array(6).fill(''));
    setStep('input');
    setFileData(null);
    setActionType(null);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="print-station">
      <div className="page-header" style={{ textAlign: 'center' }}>
        <h1>
          <ScanLine
            size={28}
            style={{ verticalAlign: 'middle', marginRight: 8, color: 'var(--accent)' }}
          />
          Print Station
        </h1>
        <p>Enter the customer's 6-digit PIN to fetch their file</p>
      </div>

      <AnimatePresence mode="wait">
        {step === 'input' && (
          <Motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card style={{ textAlign: 'center' }}>
              <h3 style={{ marginBottom: 8 }}>Enter PIN Code</h3>
              <p className="text-sm text-muted" style={{ marginBottom: 16 }}>
                Ask the customer for their 6-digit code
              </p>

              <div className="pin-input-wrapper" onPaste={handlePaste}>
                {pin.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    className="pin-char-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              <Button
                fullWidth
                size="lg"
                loading={loading && actionType === 'fetch'}
                disabled={loading}
                onClick={handleFetchFile}
                style={{ marginTop: 16 }}
              >
                Fetch File
              </Button>
            </Card>
          </Motion.div>
        )}

        {step === 'preview' && fileData && (
          <Motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="file-preview-card">
              <div className="file-icon">
                <FileText size={28} />
              </div>
              <h3>{fileData.fileName}</h3>
              <p className="text-sm text-muted" style={{ margin: '8px 0 24px' }}>
                {fileData.message}
              </p>

              {/* ── 3 Action Buttons in Horizontal Flex Layout ── */}
              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                {/* Button 1: Download File (Outline / Secondary) */}
                {fileData.fileUrl ? (
                  <a
                    href={fileData.fileUrl}
                    download={fileData.fileName || 'document.pdf'}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="secondary"
                      icon={Download}
                      disabled={loading}
                    >
                      Download File
                    </Button>
                  </a>
                ) : (
                  <Button
                    variant="secondary"
                    icon={Download}
                    disabled
                  >
                    Download File
                  </Button>
                )}

                {/* Button 2: Instant Print (Primary Highlighted Action) */}
                <Button
                  variant="primary"
                  icon={Zap}
                  loading={loading && actionType === 'instant'}
                  disabled={loading}
                  onClick={handleInstantPrint}
                  style={{
                    boxShadow: '0 2px 10px rgba(59, 130, 246, 0.35)',
                    fontWeight: 700,
                  }}
                >
                  Instant Print
                </Button>

                {/* Button 3: Mark as Printed (Ghost / Secondary Manual Override) */}
                <Button
                  variant="ghost"
                  icon={Printer}
                  loading={loading && actionType === 'manual'}
                  disabled={loading}
                  onClick={handleMarkAsPrinted}
                >
                  Mark as Printed
                </Button>
              </div>

              <button
                onClick={handleReset}
                disabled={loading}
                className="text-sm text-muted"
                style={{
                  marginTop: 20,
                  background: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  color: 'var(--text-tertiary)',
                  opacity: loading ? 0.5 : 1,
                }}
              >
                Cancel & enter new PIN
              </button>
            </Card>
          </Motion.div>
        )}

        {step === 'printed' && (
          <Motion.div
            key="printed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card style={{ textAlign: 'center', padding: 48 }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'var(--success-bg)',
                border: '2px solid var(--success-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: 'var(--success)',
              }}>
                <CheckCircle size={32} />
              </div>
              <h2>Print Complete!</h2>
              <p className="text-muted" style={{ marginBottom: 24 }}>
                The print job has been marked as ready for pickup.
              </p>
              <Button onClick={handleReset} size="lg">
                Next Customer
              </Button>
            </Card>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PrintStation;
