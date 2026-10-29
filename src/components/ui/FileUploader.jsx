import {
  forwardRef, useCallback, useEffect, useId, useMemo, useState,
} from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, FileImage, X, AlertCircle } from 'lucide-react';
import { truncateFileName, formatFileSize } from '../../utils/helpers';

// ── Defaults ──
const DEFAULT_ACCEPT = {
  'application/pdf': ['.pdf'],
  'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
};

// Choose icon based on MIME type
const getFileIcon = (mimeType) => {
  if (mimeType?.startsWith('image/')) return FileImage;
  return FileText;
};

// Convert accept config into human-readable string (e.g. "PDF, PNG, DOCX")
const getAcceptText = (accept) => {
  const extensions = new Set();
  Object.values(accept).forEach((exts) => {
    exts.forEach((ext) => extensions.add(ext.replace('.', '').toUpperCase()));
  });
  return Array.from(extensions).join(', ');
};

// Convert dropzone rejection into a friendly message
const getRejectionMessage = (rejection) => {
  for (const err of rejection.errors) {
    switch (err.code) {
      case 'file-too-large':
        return `File is too large. Maximum size is ${formatFileSize(err.maxSize)}.`;
      case 'file-invalid-type':
        return 'File type not supported. Please upload a supported format.';
      case 'too-many-files':
        return 'Only one file is allowed.';
      default:
        return err.message || 'Invalid file. Please try again.';
    }
  }
  return 'Invalid file. Please try again.';
};

/**
 * FileUploader — Accessible drag-and-drop file input.
 *
 * Features:
 * - Drag-and-drop OR click to browse
 * - Visual feedback for drag-active AND drag-reject states
 * - Inline error messages for too-large / wrong-type files
 * - "Replace" and "Remove" actions after selecting a file
 * - Image preview for image files (auto-revoked blob URL)
 * - Disabled / loading states
 * - Dynamic helper text (derived from `accept` and `maxSize`)
 * - Full a11y: aria-describedby, error role="alert", keyboard support
 * - Forwards refs
 *
 * @example
 *   <FileUploader
 *     onFileSelect={setFile}
 *     selectedFile={file}
 *     onClear={() => setFile(null)}
 *     maxSize={50 * 1024 * 1024}
 *     loading={uploading}
 *   />
 */
const FileUploader = forwardRef(({
  onFileSelect,
  selectedFile,
  onClear,
  accept = DEFAULT_ACCEPT,
  maxSize = 50 * 1024 * 1024,
  disabled = false,
  loading = false,
  error: externalError,
  className = '',
  ...props
}, ref) => {
  const helperId = useId();
  const errorId = useId();

  // Internal error state (from dropzone rejections)
  const [internalError, setInternalError] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    setInternalError(null);
    if (acceptedFiles.length > 0) {
      onFileSelect?.(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const onDropRejected = useCallback((rejections) => {
    if (rejections.length > 0) {
      setInternalError(getRejectionMessage(rejections[0]));
    }
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    open,
  } = useDropzone({
    onDrop,
    onDropRejected,
    multiple: false,
    maxSize,
    accept,
    disabled: disabled || loading,
    // When a file is already selected, clicking the root shouldn't reopen
    // the picker — only the explicit "Replace" button should.
    noClick: Boolean(selectedFile),
    noKeyboard: Boolean(selectedFile),
  });

  const displayError = externalError || internalError;
  const acceptText = useMemo(() => getAcceptText(accept), [accept]);
  const FileIcon = selectedFile ? getFileIcon(selectedFile.type) : Upload;

  // ── Image preview (blob URL must be revoked on unmount/change) ──
  const isImagePreview = Boolean(
    selectedFile && selectedFile.type?.startsWith('image/')
  );
  const imagePreviewUrl = useMemo(() => {
    if (!isImagePreview) return null;
    return URL.createObjectURL(selectedFile);
  }, [selectedFile, isImagePreview]);

  useEffect(() => () => {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
  }, [imagePreviewUrl]);

  // ── Clear handler (also resets internal error) ──
  const handleClear = (e) => {
    e.stopPropagation();
    setInternalError(null);
    onClear?.();
  };

  // ── aria-describedby: helper (empty state only) + error ──
  const describedBy = [
    displayError && errorId,
    !selectedFile && !loading && helperId,
  ].filter(Boolean).join(' ') || undefined;

  const rootClasses = [
    'file-uploader',
    isDragActive && 'drag-active',
    isDragReject && 'drag-reject',
    Boolean(selectedFile) && 'has-file',
    disabled && 'is-disabled',
    loading && 'is-loading',
    displayError && 'has-error',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      {...getRootProps({ ref, 'aria-describedby': describedBy })}
      className={rootClasses}
      {...props}
    >
      <input {...getInputProps()} />

      {loading ? (
        /* ── Loading state (still shows filename) ── */
        <>
          <div className="file-uploader-icon">
            <span className="spinner" aria-hidden="true" />
          </div>
          <h4 title={selectedFile?.name}>
            {selectedFile ? truncateFileName(selectedFile.name) : 'Uploading…'}
          </h4>
          <p className="text-muted text-sm">
            {selectedFile
              ? `Uploading ${formatFileSize(selectedFile.size)} — please wait`
              : 'Please wait…'}
          </p>
        </>
      ) : selectedFile ? (
        /* ── File selected state ── */
        <>
          <div className="file-uploader-icon">
            {isImagePreview ? (
              <img
                src={imagePreviewUrl}
                alt=""
                className="file-uploader-preview"
              />
            ) : (
              <FileIcon size={26} aria-hidden="true" />
            )}
          </div>
          <h4 title={selectedFile.name}>
            {truncateFileName(selectedFile.name)}
          </h4>
          <p className="text-muted text-sm">
            {formatFileSize(selectedFile.size)}
          </p>
          <div className="file-uploader-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={(e) => { e.stopPropagation(); open(); }}
              disabled={disabled}
            >
              Replace
            </button>
            {onClear && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleClear}
                disabled={disabled}
                aria-label="Remove selected file"
              >
                <X size={14} aria-hidden="true" />
                Remove
              </button>
            )}
          </div>
        </>
      ) : (
        /* ── Empty state ── */
        <>
          <div className="file-uploader-icon">
            {isDragReject ? (
              <AlertCircle size={26} aria-hidden="true" />
            ) : (
              <Upload size={26} aria-hidden="true" />
            )}
          </div>
          <h4>
            {isDragReject
              ? 'File type not supported'
              : isDragActive
                ? 'Drop your file here'
                : 'Drag & drop your file'}
          </h4>
          <p className="text-muted">
            or <span className="browse-link">browse</span> to choose a file
          </p>
          <p id={helperId} className="text-xs text-muted file-uploader-hint">
            {acceptText} — Max {formatFileSize(maxSize)}
          </p>
        </>
      )}

      {/* ── Error message ── */}
      {displayError && (
        <div id={errorId} className="file-uploader-error" role="alert">
          <AlertCircle size={14} aria-hidden="true" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
});

FileUploader.displayName = 'FileUploader';
export default FileUploader;