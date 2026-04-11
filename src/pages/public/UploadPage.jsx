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
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setLoading(true);
    try {
      const res = await jobApi.uploadFile(file);
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
                <Button
                  fullWidth
                  size="lg"
                  loading={loading}
                  disabled={!file}
                  onClick={handleUpload}
                >
                  Upload & Get PIN
                </Button>
              </div>
            </Card>
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
