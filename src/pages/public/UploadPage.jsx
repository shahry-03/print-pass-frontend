import { useState, useRef, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { X, AlertCircle, RefreshCw, Upload } from 'lucide-react';
import { jobApi } from '../../api/jobApi';
import { getErrorMessage } from '../../utils/helpers';
import { saveVoucher, loadVoucher, clearVoucher } from '../../utils/voucherStorage';
import FileUploader from '../../components/ui/FileUploader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Logo from '../../components/common/Logo';
import ThemeToggle from '../../components/common/ThemeToggle';
import CustomerVoucher from '../../components/ui/CustomerVoucher';
import { useJobStatusPolling } from '../../hooks/useJobStatusPolling';

// ── Constants ──
const PIN_REGEX = /^\d{6}$/;

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

/**
 * UploadPage — Public customer flow for uploading documents and obtaining
 * 6-digit pickup PINs. Also supports regenerating expired PINs.
 *
 * Features:
 * - Upload with live progress + cancel support (AbortController)
 * - Reprint mode with strict numeric PIN input
 * - Persists voucher across page refresh (via voucherStorage)
 * - Auto-scrolls to voucher on success
 * - Focus management when switching modes
 * - Inline errors with role="alert" (screen-reader friendly)
 * - Clean mode transitions (state reset, no stale data)
 */
const UploadPage = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(() => loadVoucher());
  const [isReprintMode, setIsReprintMode] = useState(false);
  const [oldPin, setOldPin] = useState('');

  const abortRef = useRef(null);
  const pinInputRef = useRef(null);
  const voucherRef = useRef(null);

  // ── Automatic Background Polling for Page Count & Conversion ──
  const handleVoucherUpdate = useCallback((updatedVoucher) => {
    setResult((prev) => ({
      ...prev,
      ...updatedVoucher,
    }));
  }, []);

  useJobStatusPolling(result, handleVoucherUpdate);

  // Abort any in-flight request on unmount
  useEffect(() => () => abortRef.current?.abort(), []);

  // Auto-scroll to voucher when it appears
  useEffect(() => {
    if (result && voucherRef.current) {
      voucherRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  // Focus PIN input when entering reprint mode (after mount animation)
  useEffect(() => {
    if (isReprintMode) {
      const t = setTimeout(() => pinInputRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [isReprintMode]);

  // ── Reprint: regenerate an expired PIN ──
  const handleReprint = useCallback(async () => {
    if (!PIN_REGEX.test(oldPin)) {
      toast.error('Please enter a valid 6-digit PIN');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const jobData = await jobApi.reprintJob(oldPin);
      setResult(jobData);
      saveVoucher(jobData);
      setIsReprintMode(false);
      setOldPin('');
      toast.success('New PIN generated successfully!');
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [oldPin]);

  // ── Upload: multi-file upload + PIN ──
  const handleUpload = useCallback(async () => {
    if (!files || files.length === 0) {
      toast.error('Please select at least one file first');
      return;
    }

    setLoading(true);
    setProgress(0);
    setError(null);
    abortRef.current = new AbortController();

    try {
      const jobData = await jobApi.uploadMultipleFiles(files, {
        onUploadProgress: (e) => {
          if (e.total) {
            setProgress(Math.round((e.loaded * 100) / e.total));
          }
        },
        signal: abortRef.current.signal,
      });

      const totalFileSize = files.reduce((acc, f) => acc + (f?.size || 0), 0);
      const fileNamesList = files.map((f) => f.name);

      const enriched = {
        ...jobData,
        secretKey: jobData?.secretKey || jobData?.pin,
        fileName: files.length === 1 ? files[0].name : `${files.length} Files: ${fileNamesList.join(', ')}`,
        fileNames: fileNamesList,
        fileCount: files.length,
        fileSize: totalFileSize,
        fileType: files[0]?.type || 'application/pdf',
      };

      setResult(enriched);
      saveVoucher(enriched);
      setFiles([]);

      if (jobData?.conversionStatus?.toUpperCase() === 'PENDING') {
        toast.success('Files uploaded! Background conversion started.');
      } else {
        toast.success('Files uploaded successfully! Save your PIN.');
      }
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED' || err.name === 'AbortError') {
        toast.info('Upload cancelled');
        return;
      }
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setProgress(0);
      abortRef.current = null;
    }
  }, [files]);

  const handleCancelUpload = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  // ── Reset back to upload mode ──
  const handleReset = useCallback(() => {
    abortRef.current?.abort();
    setFiles([]);
    setResult(null);
    setError(null);
    setIsReprintMode(false);
    setOldPin('');
    setProgress(0);
    clearVoucher();
  }, []);

  // ── Called from CustomerVoucher "Regenerate" button ──
  const handleRegenerateFromVoucher = useCallback((pin) => {
    setResult(null);
    setError(null);
    clearVoucher();
    setOldPin(pin ? String(pin).trim() : '');
    setIsReprintMode(true);
  }, []);

  // ── Mode switches — clean state, no stale data ──
  const handleSwitchToReprint = useCallback(() => {
    if (loading) return;
    setFiles([]);
    setError(null);
    setIsReprintMode(true);
  }, [loading]);

  const handleSwitchToUpload = useCallback(() => {
    if (loading) return;
    setOldPin('');
    setError(null);
    setIsReprintMode(false);
  }, [loading]);

  // ── PIN input: digits only, max 6 ──
  const handlePinChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOldPin(digits);
    if (error) setError(null);
  };

  const pinIsValid = PIN_REGEX.test(oldPin);

  return (
    <div className="upload-page">
      <div className="upload-card">
        {/* Header */}
        <div className="upload-header">
          <Logo size="md" linkTo="/" />
          <ThemeToggle />
        </div>

        {result ? (
          <div ref={voucherRef}>
            <CustomerVoucher
              voucher={result}
              onReset={handleReset}
              onRegenerate={handleRegenerateFromVoucher}
            />
          </div>
        ) : isReprintMode ? (
          // ── Reprint mode ──
          <Card>
            <div className="upload-card-title">
              <h2>Regenerate PIN</h2>
              <p>Get a new active PIN for a previously uploaded file</p>
            </div>

            <div className="upload-field">
              <label htmlFor="old-pin" className="input-label">
                Enter your old 6-digit PIN
              </label>
              <input
                ref={pinInputRef}
                id="old-pin"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                value={oldPin}
                onChange={handlePinChange}
                maxLength={6}
                placeholder="000000"
                disabled={loading}
                aria-invalid={Boolean(error) || undefined}
                className="pin-regenerate-input"
              />
            </div>

            {error && (
              <div role="alert" aria-live="assertive" className="upload-error">
                <AlertCircle size={16} aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <Button
              fullWidth
              size="lg"
              loading={loading}
              loadingText="Generating…"
              disabled={!pinIsValid || loading}
              onClick={handleReprint}
            >
              Regenerate PIN
            </Button>

            <div className="upload-switch-mode">
              <button
                type="button"
                onClick={handleSwitchToUpload}
                disabled={loading}
                className="upload-switch-btn"
              >
                <Upload size={14} aria-hidden="true" />
                Upload documents instead
              </button>
            </div>
          </Card>
        ) : (
          // ── Upload mode ──
          <Card>
            <div className="upload-card-title">
              <h2>Upload Your Documents</h2>
              <p>Upload one or more files and receive a 6-digit pickup PIN for print shops</p>
            </div>

            <FileUploader
              multiple
              selectedFiles={files}
              onFilesSelect={setFiles}
              onClear={() => setFiles([])}
              loading={loading}
            />

            {/* Progress + cancel */}
            {loading && (
              <div className="upload-progress" role="status" aria-live="polite">
                <div className="upload-progress-meta">
                  <span>Uploading {files.length} {files.length === 1 ? 'file' : 'files'}…</span>
                  <span className="upload-progress-percent">{progress}%</span>
                </div>
                <div
                  className="upload-progress-track"
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="upload-progress-bar"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCancelUpload}
                  className="upload-cancel-btn"
                >
                  <X size={14} aria-hidden="true" />
                  Cancel upload
                </button>
              </div>
            )}

            {/* Inline server error (not file-level — that's handled by FileUploader) */}
            {!loading && error && (
              <div role="alert" aria-live="assertive" className="upload-error">
                <AlertCircle size={16} aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <div style={{ marginTop: 24 }}>
              <Button
                fullWidth
                size="lg"
                loading={loading}
                loadingText="Uploading…"
                disabled={files.length === 0 || loading}
                onClick={handleUpload}
              >
                {files.length > 1 ? `Upload ${files.length} Files & Get PIN` : 'Upload & Get PIN'}
              </Button>
            </div>

            <div className="upload-switch-mode">
              <button
                type="button"
                onClick={handleSwitchToReprint}
                disabled={loading}
                className="upload-switch-btn"
              >
                <RefreshCw size={14} aria-hidden="true" />
                Already have an old PIN? Regenerate it
              </button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UploadPage;