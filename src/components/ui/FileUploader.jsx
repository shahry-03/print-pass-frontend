import {
  forwardRef, useCallback, useId, useMemo, useState,
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
 * FileUploader — Accessible drag-and-drop file input with multi-file support.
 *
 * Features:
 * - Drag-and-drop OR click to browse multiple files
 * - Individual file removal and file list preview
 * - Visual feedback for drag-active and drag-reject states
 * - Inline error messages for invalid files
 * - Combined file count and size indicators
 * - Backward compatible with single-file mode (`multiple={false}`)
 */
const FileUploader = forwardRef(({
  onFileSelect,
  selectedFile,
  onFilesSelect,
  selectedFiles = [],
  onFileRemove,
  onClear,
  multiple = true,
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

  // Normalized files array
  const files = useMemo(() => {
    if (multiple) {
      if (Array.isArray(selectedFiles) && selectedFiles.length > 0) return selectedFiles;
      if (selectedFile) return [selectedFile];
      return [];
    }
    return selectedFile ? [selectedFile] : [];
  }, [multiple, selectedFiles, selectedFile]);

  const hasFiles = files.length > 0;
  const totalSize = useMemo(() => files.reduce((acc, f) => acc + (f?.size || 0), 0), [files]);

  // Internal error state (from dropzone rejections)
  const [internalError, setInternalError] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    setInternalError(null);
    if (acceptedFiles.length > 0) {
      if (multiple) {
        // Filter out duplicates by name + size
        const existingKeys = new Set(files.map((f) => `${f.name}_${f.size}`));
        const newUnique = acceptedFiles.filter((f) => !existingKeys.has(`${f.name}_${f.size}`));
        const updated = [...files, ...newUnique];
        onFilesSelect?.(updated);
        onFileSelect?.(updated[0]);
      } else {
        onFileSelect?.(acceptedFiles[0]);
        onFilesSelect?.([acceptedFiles[0]]);
      }
    }
  }, [multiple, files, onFilesSelect, onFileSelect]);

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
    multiple,
    maxSize,
    accept,
    disabled: disabled || loading,
    noClick: false,
    noKeyboard: false,
  });

  const displayError = externalError || internalError;
  const acceptText = useMemo(() => getAcceptText(accept), [accept]);

  // Clear all handler
  const handleClearAll = (e) => {
    e.stopPropagation();
    setInternalError(null);
    onClear?.();
    if (onFilesSelect) onFilesSelect([]);
  };

  // Individual file removal
  const handleRemoveOne = (index, e) => {
    e.stopPropagation();
    if (onFileRemove) {
      onFileRemove(index);
    } else if (onFilesSelect) {
      const updated = files.filter((_, i) => i !== index);
      onFilesSelect(updated);
      if (updated.length === 0 && onClear) onClear();
    }
  };

  const describedBy = [
    displayError && errorId,
    !hasFiles && !loading && helperId,
  ].filter(Boolean).join(' ') || undefined;

  const rootClasses = [
    'file-uploader',
    isDragActive && 'drag-active',
    isDragReject && 'drag-reject',
    hasFiles && 'has-file',
    disabled && 'is-disabled',
    loading && 'is-loading',
    displayError && 'has-error',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="file-uploader-container">
      {/* ── Dropzone Area ── */}
      <div
        {...getRootProps({ ref, 'aria-describedby': describedBy })}
        className={rootClasses}
        {...props}
      >
        <input {...getInputProps()} />

        {loading ? (
          /* ── Loading state ── */
          <>
            <div className="file-uploader-icon">
              <span className="spinner" aria-hidden="true" />
            </div>
            <h4>Uploading {files.length} {files.length === 1 ? 'file' : 'files'}…</h4>
            <p className="text-muted text-sm">
              Uploading {formatFileSize(totalSize)} — please wait
            </p>
          </>
        ) : hasFiles && multiple ? (
          /* ── Multi-file compact drop invitation when files are already selected ── */
          <>
            <div className="file-uploader-icon" style={{ marginBottom: 8, width: 44, height: 44 }}>
              <Upload size={20} aria-hidden="true" />
            </div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: 4 }}>
              {isDragActive ? 'Drop additional files here' : 'Add more files or drag & drop'}
            </h4>
            <p className="text-muted text-xs" style={{ margin: 0 }}>
              Click to browse or drop more documents
            </p>
          </>
        ) : hasFiles && !multiple ? (
          /* ── Single-file selected state (backward compatibility) ── */
          <>
            <div className="file-uploader-icon">
              <FileText size={26} aria-hidden="true" />
            </div>
            <h4 title={files[0].name}>{truncateFileName(files[0].name)}</h4>
            <p className="text-muted text-sm">{formatFileSize(files[0].size)}</p>
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
                  onClick={handleClearAll}
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
                <AlertCircle size={28} aria-hidden="true" />
              ) : (
                <Upload size={28} aria-hidden="true" />
              )}
            </div>
            <h4>
              {isDragReject
                ? 'File type not supported'
                : isDragActive
                  ? 'Drop your files here'
                  : multiple
                    ? 'Drag & drop your documents here'
                    : 'Drag & drop your document here'}
            </h4>
            <p className="text-muted text-sm" style={{ marginBottom: 14 }}>
              Choose files from your phone, tablet, or computer
            </p>
            <div className="file-uploader-btn-wrap" style={{ marginBottom: 12 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm file-uploader-browse-btn"
                onClick={(e) => { e.stopPropagation(); open(); }}
                disabled={disabled}
              >
                Browse Files
              </button>
            </div>
            <p id={helperId} className="text-xs text-muted file-uploader-hint">
              Supports {acceptText} • Max {formatFileSize(maxSize)} per file
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

      {/* ── Multi-file selected items list ── */}
      {multiple && hasFiles && !loading && (
        <div className="file-uploader-list-wrapper">
          <div className="file-uploader-list-header">
            <div className="file-uploader-list-count">
              <span>{files.length} {files.length === 1 ? 'file' : 'files'} selected</span>
              <span className="file-uploader-size-tag">({formatFileSize(totalSize)})</span>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm text-muted"
              onClick={handleClearAll}
              disabled={disabled}
              title="Remove all files"
            >
              Clear all
            </button>
          </div>

          <div className="file-uploader-selected-items">
            {files.map((f, idx) => {
              const Icon = getFileIcon(f.type);
              return (
                <div key={`${f.name}_${idx}`} className="file-uploader-item-card">
                  <div className="file-uploader-item-icon">
                    <Icon size={18} aria-hidden="true" />
                  </div>
                  <div className="file-uploader-item-info">
                    <span className="file-uploader-item-name" title={f.name}>
                      {truncateFileName(f.name, 36)}
                    </span>
                    <span className="file-uploader-item-size">
                      {formatFileSize(f.size)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="file-uploader-item-remove"
                    onClick={(e) => handleRemoveOne(idx, e)}
                    disabled={disabled}
                    aria-label={`Remove ${f.name}`}
                    title="Remove file"
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});

FileUploader.displayName = 'FileUploader';
export default FileUploader;