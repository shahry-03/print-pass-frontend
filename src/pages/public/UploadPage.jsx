import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Copy, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { jobApi } from '../../api/jobApi';
import { getErrorMessage, copyToClipboard, formatDateTime } from '../../utils/helpers';
import FileUploader from '../../components/ui/FileUploader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Logo from '../../components/common/Logo';
import ThemeToggle from '../../components/common/ThemeToggle';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
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
      setResult(res.data);
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
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setProgress(percentCompleted);
      });
      setResult(res.data);
      toast.success('File uploaded successfully!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPin = async () => {
    const success = await copyToClipboard(result.secretKey);
    if (success) toast.success('PIN copied to clipboard!');
    else toast.error('Failed to copy');
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
  };

  return (
    <div className="upload-page">
      <div className="upload-card">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <Logo size="md" linkTo="/" />
          <ThemeToggle />
        </div>

        {!result ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {isReprintMode ? (
              <Card>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <h2>Regenerate PIN</h2>
                  <p>Get a new PIN for a previously uploaded file</p>
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
                    placeholder="e.g. A1B2C3"
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
                      textTransform: 'uppercase'
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
                  <h2>Upload Your File</h2>
                  <p>Upload a document and get a 6-digit PIN for printing</p>
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
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ ease: "easeOut", duration: 0.2 }}
                          style={{ height: '100%', backgroundColor: 'var(--accent)', borderRadius: 4 }}
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
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="pin-result-card">
              <div className="success-icon">
                <CheckCircle size={32} />
              </div>

              <h2>File Uploaded!</h2>
              <p style={{ marginBottom: 24 }}>
                Share this PIN at any verified print shop
              </p>

              {/* PIN Display */}
              <div className="pin-display">
                {result.secretKey.split('').map((digit, i) => (
                  <motion.div
                    key={i}
                    className="pin-digit"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    {digit}
                  </motion.div>
                ))}
              </div>

              <Button
                variant="secondary"
                icon={Copy}
                onClick={handleCopyPin}
                style={{ margin: '16px auto' }}
              >
                Copy PIN
              </Button>

              <div style={{
                marginTop: 24,
                padding: 16,
                background: 'var(--bg-glass)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
              }}>
                <p><strong>File:</strong> {result.fileName}</p>
                <p><strong>Expires:</strong> {formatDateTime(result.expiresAt)}</p>
                <p><strong>Status:</strong> {result.jobStatus}</p>
              </div>

              <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
                <Button
                  variant="secondary"
                  onClick={handleReset}
                >
                  Upload Another
                </Button>
                <Link to="/">
                  <Button variant="ghost" icon={ArrowLeft}>
                    Back to Home
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
