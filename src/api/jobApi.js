import api from './axios';

export const jobApi = {
  uploadFile: (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/jobs/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000, // 2 min for large files
      onUploadProgress,
    });
  },
  reprintJob: (oldPin) => api.post(`/jobs/reprint/${oldPin}`),
  getFileByPin: (pin) => api.get(`/jobs/${pin}`),
  printJob: (pin) => api.post(`/jobs/${pin}/print`),
};
