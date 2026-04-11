import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanLine, FileText, Printer, CheckCircle, Download,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { jobApi } from '../../api/jobApi';
import { getErrorMessage } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const PrintStation = () => {
  const [pin, setPin] = useState(Array(6).fill(''));
  const [step, setStep] = useState('input'); // input | preview | printed
  const [loading, setLoading] = useState(false);
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
    try {
      const res = await jobApi.getFileByPin(pinString);
      setFileData(res.data);
      setStep('preview');
      toast.success('File found!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    const pinString = pin.join('');
    setLoading(true);
    try {
      const res = await jobApi.printJob(pinString);
      setStep('printed');
      toast.success(res.data.message || 'Print completed!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPin(Array(6).fill(''));
    setStep('input');
    setFileData(null);
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
          <motion.div
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
                loading={loading}
                onClick={handleFetchFile}
                style={{ marginTop: 16 }}
              >
                Fetch File
              </Button>
            </Card>
          </motion.div>
        )}

        {step === 'preview' && fileData && (
          <motion.div
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

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                {fileData.fileUrl && (
                  <a
                    href={fileData.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="secondary" icon={Download}>
                      Download File
                    </Button>
                  </a>
                )}
                <Button
                  loading={loading}
                  icon={Printer}
                  onClick={handlePrint}
                >
                  Mark as Printed
                </Button>
              </div>

              <button
                onClick={handleReset}
                className="text-sm text-muted"
                style={{
                  marginTop: 20,
                  background: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-tertiary)',
                }}
              >
                Cancel & enter new PIN
              </button>
            </Card>
          </motion.div>
        )}

        {step === 'printed' && (
          <motion.div
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PrintStation;
