import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText } from 'lucide-react';
import { truncateFileName } from '../../utils/helpers';

const FileUploader = ({ onFileSelect, selectedFile, accept, maxSize = 50 * 1024 * 1024 }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize,
    accept: accept || {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`file-uploader ${isDragActive ? 'drag-active' : ''}`}
    >
      <input {...getInputProps()} />
      {selectedFile ? (
        <>
          <div className="file-uploader-icon">
            <FileText size={26} />
          </div>
          <h4>{truncateFileName(selectedFile.name)}</h4>
          <p className="text-muted text-sm">
            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB — Click or drop to replace
          </p>
        </>
      ) : (
        <>
          <div className="file-uploader-icon">
            <Upload size={26} />
          </div>
          <h4>
            {isDragActive ? 'Drop your file here' : 'Drag & drop your file'}
          </h4>
          <p className="text-muted">
            or <span className="browse-link">browse</span> to choose a file
          </p>
          <p className="text-xs text-muted" style={{ marginTop: 8 }}>
            PDF, DOC, DOCX, PPT, PPTX, PNG, JPG — Max 50MB
          </p>
        </>
      )}
    </div>
  );
};

export default FileUploader;
