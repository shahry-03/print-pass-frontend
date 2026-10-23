import { useState } from 'react';
import toast from 'react-hot-toast';
import { jobApi } from '../../api/jobApi';
import { getErrorMessage } from '../../utils/helpers';
import { saveVoucher, loadVoucher, clearVoucher } from '../../utils/voucherStorage';
import FileUploader from '../../components/ui/FileUploader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Logo from '../../components/common/Logo';
import ThemeToggle from '../../components/common/ThemeToggle';
import CustomerVoucher from '../../components/ui/CustomerVoucher';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  // Persist voucher details across page refreshes via sessionStorage
  const [result, setResult] = useState(() => loadVoucher());
  const [isReprintMode, setIsReprintMode] = useState(false);
  const [oldPin, setOldPin] = useState('');

  const handleReprint = async () => {
    if (!oldPin || oldPin.length !== 6) {
      toast.error('Please enter a valid 6-digit PIN');
      return;
    }

    setLoading(true);
    try {
      const res = await jobApi.reprintJob(oldPin);
      const jobData = res.data;
      setResult(jobData);
      saveVoucher(jobData);
      setIsReprintMode(false);
      setOldPin('');
      toast.success('New PIN generated successfully!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setLoading(true);
    setProgress(0);
    try {
      const res = await jobApi.uploadFile(file, (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });
      const jobData = {
        ...res.data,
        fileSize: file?.size || null,
      };
      setResult(jobData);
      saveVoucher(jobData);
      toast.success('File uploaded successfully!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    clearVoucher();
    setIsReprintMode(false);
    setOldPin('');
    setProgress(0);
  };

  const handleRegenerateFromVoucher = (pin) => {
    setResult(null);
    clearVoucher();
    setOldPin(pin ? String(pin).trim() : '');
    setIsReprintMode(true);
  };

  return (
    <div className="upload-page">
      <div className="upload-card">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <Logo size="md" linkTo="/" />
          <ThemeToggle />
        </div>

        {result ? (
          <CustomerVoucher
            voucher={result}
            onReset={handleReset}
            onRegenerate={handleRegenerateFromVoucher}
          />
        ) : (
          <div>
            {isReprintMode ? (
              <Card>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <h2>Regenerate PIN</h2>
                  <p>Get a new active PIN for a previously uploaded file</p>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: 8, color: 'var(--text-secondary)' }}>
                    Enter Old 6-Digit PIN
                  </label>
                  <input
                    type="text"
                    value={oldPin}
                    onChange={(e) => setOldPin(e.target.value.toUpperCase())}
                    maxLength={6}
                    placeholder="e.g. 482915"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-elevated)',
                      color: 'var(--text-primary)',
                      fontSize: '1.25rem',
                      letterSpacing: '0.2em',
                      textAlign: 'center',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}
                  />
                </div>

                <Button
                  fullWidth
                  size="lg"
                  loading={loading}
                  disabled={oldPin.length !== 6 || loading}
                  onClick={handleReprint}
                >
                  Regenerate PIN
                </Button>

                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <button
                    type="button"
                    className="text-accent text-sm fw-500"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                    onClick={() => setIsReprintMode(false)}
                  >
                    Upload a new file instead
                  </button>
                </div>
              </Card>
            ) : (
              <Card>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <h2>Upload Your Document</h2>
                  <p>Upload a file and receive a 6-digit pickup PIN for print shops</p>
                </div>

                <FileUploader
                  onFileSelect={setFile}
                  selectedFile={file}
                />

                <div style={{ marginTop: 24 }}>
                  {loading && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Uploading...</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent)' }}>{progress}%</span>
                      </div>
                      <div style={{ width: '100%', height: 8, backgroundColor: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${progress}%`,
                            height: '100%',
                            backgroundColor: 'var(--accent)',
                            borderRadius: 4,
                            transition: 'width 0.2s ease',
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <Button
                    fullWidth
                    size="lg"
                    loading={loading}
                    disabled={!file || loading}
                    onClick={handleUpload}
                  >
                    {loading ? 'Uploading...' : 'Upload & Get PIN'}
                  </Button>
                </div>

                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <button
                    type="button"
                    className="text-accent text-sm fw-500"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                    onClick={() => setIsReprintMode(true)}
                  >
                    Already have an old PIN? Regenerate it
                  </button>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
