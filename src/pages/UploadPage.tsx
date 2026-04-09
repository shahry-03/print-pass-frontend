import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  Copy,
  Check,
  Clock,
  X,
  CloudUpload,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { jobService } from '../services';
import { getErrorMessage } from '../utils/httpError';
import type { JobResponse } from '../types';
import { Button, Card } from '../components/ui';

const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<JobResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await jobService.uploadFile(file);
      setResult(res);
      toast.success('File uploaded! Share your PIN with the print shop.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Upload failed'));
    } finally {
      setUploading(false);
    }
  };

  const copyPin = () => {
    if (result?.secretKey) {
      navigator.clipboard.writeText(result.secretKey);
      setCopied(true);
      toast.success('PIN copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setCopied(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-3 sm:px-4 py-6 sm:py-12">
      <div className="absolute top-20 right-20 hidden md:block w-80 h-80 bg-primary-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-20 hidden md:block w-72 h-72 bg-purple-400/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-xl"
      >
        <Card className="p-5 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="text-center mb-6 sm:mb-8">
                  <div className="flex justify-center mb-4">
                    <div className="w-14 h-14 rounded-2xl gradient-hero flex items-center justify-center shadow-lg shadow-primary-500/30">
                      <CloudUpload size={28} className="text-white" />
                    </div>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Upload Your File</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    No account needed — just upload and get your PIN
                  </p>
                </div>

                {/* Drop Zone */}
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="File upload area. Drop a file or press Enter to browse."
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-2xl p-5 sm:p-10 text-center cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 ${
                    isDragging
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-slate-300 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-500'
                  }`}
                  onClick={() => document.getElementById('file-input')?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      document.getElementById('file-input')?.click();
                    }
                  }}
                >
                  <input
                    id="file-input"
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.ppt,.pptx,.xls,.xlsx"
                  />
                  <Upload size={36} className={`mx-auto mb-3 sm:mb-4 ${isDragging ? 'text-primary-500' : 'text-slate-400'}`} />
                  <p className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300">
                    {isDragging ? 'Drop your file here' : 'Drag & drop your file, or click to browse'}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    PDF, DOCX, Images, Presentations — up to 50MB
                  </p>
                </div>

                {/* File preview */}
                {file && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  className="mt-5 sm:mt-6 flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                      <FileText size={20} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{file.name}</p>
                      <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                    </div>
                    <button onClick={() => setFile(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                      <X size={18} />
                    </button>
                  </motion.div>
                )}

                {/* Upload button */}
                <Button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  variant="primary"
                  className="w-full mt-5 sm:mt-6 flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
                >
                  {uploading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Upload size={18} />
                      Upload & Get PIN
                    </>
                  )}
                </Button>
              </motion.div>
            ) : (
              /* ─── Result: PIN Display ─── */
              <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <div className="flex justify-center mb-5 sm:mb-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Check size={32} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">Upload Successful!</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 sm:mb-8">
                  Share this PIN with the print shop to get your file printed
                </p>

                {/* PIN display */}
                <div className="relative inline-block">
                  <div className="flex gap-1.5 sm:gap-2 mb-4">
                    {result.secretKey.split('').map((char, i) => (
                      <div
                        key={i}
                        className="w-12 h-14 sm:w-14 sm:h-16 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center"
                      >
                        <span className="text-xl sm:text-2xl font-black text-white dark:text-slate-900">{char}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={copyPin}
                  variant="soft"
                  className="mx-auto flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy PIN'}
                </Button>

                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Clock size={14} />
                  <span>File: <strong className="text-slate-700 dark:text-slate-200">{result.fileName}</strong></span>
                </div>

                <div className="mt-2 flex items-center justify-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                  <Clock size={12} />
                  Expires in 24 hours
                </div>

                <button
                  onClick={reset}
                  className="mt-8 text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
                >
                  Upload another file
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
};

export default UploadPage;
