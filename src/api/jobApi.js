import api from './axios';

// ═══════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════

/**
 * Validates and normalizes a 6-digit PIN.
 * Accepts both string and number inputs, coerces to trimmed string.
 * 
 * @param {string|number} pin - Raw PIN input
 * @param {string} actionName - Used for readable error messages
 * @returns {string} Validated 6-digit PIN string
 */
const validatePin = (pin, actionName) => {
  const strPin = String(pin ?? '').trim();
  if (!/^\d{6}$/.test(strPin)) {
    throw new Error(`A valid 6-digit PIN is required for ${actionName}.`);
  }
  return strPin;
};

/**
 * Safely wraps a dynamic path segment.
 * Though validatePin() already blocks dangerous chars, this adds defense-in-depth.
 */
const safePath = (segment) => encodeURIComponent(String(segment));

/**
 * Ensures the file is a valid, non-empty File/Blob instance.
 */
const validateFile = (file) => {
  if (!(file instanceof File) && !(file instanceof Blob)) {
    throw new Error('A valid File or Blob object is required for upload.');
  }
  if (file.size === 0) {
    throw new Error('Selected file is empty. Please upload a valid document.');
  }
};

// ═══════════════════════════════════════════════════════════
// Job API Service
// ═══════════════════════════════════════════════════════════

export const jobApi = {
  /**
   * Upload a document to the server.
   * 
   * @param {File|Blob} file - The file object to upload
   * @param {Object} [options] - Upload configuration
   * @param {Function} [options.onUploadProgress] - Progress callback for the loading bar
   * @param {AbortSignal} [options.signal] - Optional AbortSignal to cancel the upload
   * @param {Object} [options.metadata] - Optional extra fields (e.g., { copies: 2, isColorPrint: true })
   * @returns {Promise<Object>} Job data containing PIN, filename, expiry
   */
  uploadFile: async (file, options = {}) => {
    const { onUploadProgress, signal, metadata = {} } = options;
    validateFile(file);

    const formData = new FormData();
    formData.append('file', file);

    // Append any additional metadata fields to the payload
    Object.entries(metadata).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    // Content-Type is intentionally NOT set — axios.js interceptor handles FormData
    const response = await api.post('/jobs/upload', formData, {
      timeout: 120000, // 2 minutes for large files
      onUploadProgress,
      signal,
    });

    return response.data;
  },

  /**
   * Regenerate a new PIN for a previously uploaded document.
   * 
   * @param {string|number} oldPin - The expired or existing 6-digit PIN
   * @param {AbortSignal} [signal] - Optional AbortSignal
   * @returns {Promise<Object>} New PIN details
   */
  reprintJob: async (oldPin, signal) => {
    const validPin = validatePin(oldPin, 'reprint');

    const response = await api.post(`/jobs/reprint/${safePath(validPin)}`, null, { signal });
    return response.data;
  },

  /**
   * Fetch file details and secure download URL using a PIN.
   * 
   * @param {string|number} pin - The 6-digit pickup PIN
   * @param {AbortSignal} [signal] - Optional AbortSignal
   * @returns {Promise<Object>} File metadata and download URL
   */
  getFileByPin: async (pin, signal) => {
    const validPin = validatePin(pin, 'file retrieval');

    const response = await api.get(`/jobs/${safePath(validPin)}`, { signal });
    return response.data;
  },

  /**
   * Fetch public job conversion status and page count using a PIN.
   * Public endpoint — does not send Authorization token.
   * 
   * @param {string|number} pin - The 6-digit pickup PIN
   * @param {AbortSignal} [signal] - Optional AbortSignal
   * @returns {Promise<Object>} Job status response with conversionStatus, totalPages, etc.
   */
  getJobStatus: async (pin, signal) => {
    const validPin = validatePin(pin, 'status check');

    const response = await api.get(`/jobs/status/${safePath(validPin)}`, {
      signal,
      isPublic: true,
      headers: {
        // Explicitly strip Authorization header if preset
        Authorization: undefined,
      },
    });
    return response.data;
  },

  /**
   * Upload multiple documents to the server.
   * 
   * @param {Array<File|Blob>} files - List of file objects to upload
   * @param {Object} [options] - Upload configuration
   * @param {Function} [options.onUploadProgress] - Progress callback
   * @param {AbortSignal} [options.signal] - Optional AbortSignal
   * @param {Object} [options.metadata] - Optional extra fields
   * @returns {Promise<Object>} Job response containing secretKey (PIN)
   */
  uploadMultipleFiles: async (files, options = {}) => {
    const { onUploadProgress, signal, metadata = {} } = options;
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error('Please select at least one file to upload.');
    }
    files.forEach(validateFile);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    // Append any additional metadata fields
    Object.entries(metadata).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    // Content-Type is intentionally NOT set — axios interceptor handles FormData boundary
    const response = await api.post('/jobs/upload-multiple', formData, {
      timeout: 180000, // 3 minutes for multi-file batches
      onUploadProgress,
      signal,
    });

    return response.data;
  },

  /**
   * Download all files of a job as a single ZIP archive.
   * 
   * @param {string|number} pinOrUrl - The 6-digit PIN or relative download URL
   * @param {AbortSignal} [signal] - Optional AbortSignal
   * @returns {Promise<Blob>} ZIP archive binary blob
   */
  downloadAllZip: async (pinOrUrl, signal) => {
    let url;
    if (typeof pinOrUrl === 'string' && pinOrUrl.includes('/download-all/')) {
      // Normalize URL relative to axios baseURL (stripping /api/v1 if included)
      url = pinOrUrl.replace(/^\/?api\/v1/, '');
    } else {
      const validPin = validatePin(pinOrUrl, 'ZIP download');
      url = `/jobs/download-all/${safePath(validPin)}`;
    }

    const response = await api.get(url, {
      responseType: 'blob',
      timeout: 120000,
      signal,
    });

    return response.data;
  },

  /**
   * Mark a job as printed and trigger the final backend state change.
   * 
   * @param {string|number} pin - The 6-digit pickup PIN
   * @param {AbortSignal} [signal] - Optional AbortSignal
   * @returns {Promise<Object>} Confirmation of the print action
   */
  printJob: async (pin, signal) => {
    const validPin = validatePin(pin, 'printing');

    const response = await api.post(`/jobs/${safePath(validPin)}/print`, null, { signal });
    return response.data;
  },
};