/**
 * Extract a user-friendly error message from an API error response.
 */
export const getErrorMessage = (error) => {
  if (error.response?.data) {
    const data = error.response.data;
    // Backend ErrorResponse format
    if (data.message) return data.message;
    // Validation errors with details map
    if (data.details) {
      const firstError = Object.values(data.details)[0];
      return firstError || 'Validation failed';
    }
  }
  if (error.message === 'Network Error') {
    return 'Unable to connect to server. Please check your connection.';
  }
  return error.message || 'An unexpected error occurred';
};

/**
 * Format a date string to locale-friendly format.
 */
export const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format a datetime string.
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Copy text to clipboard.
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

/**
 * Truncate a filename if too long.
 */
export const truncateFileName = (name, maxLength = 30) => {
  if (!name || name.length <= maxLength) return name;
  const ext = name.split('.').pop();
  const base = name.slice(0, maxLength - ext.length - 4);
  return `${base}...${ext}`;
};
