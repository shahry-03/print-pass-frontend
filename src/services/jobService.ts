import api from './api';
import type { JobHistoryEntry, JobResponse, PrintResponse } from '../types';

export const jobService = {
  /** Upload a file (anonymous — no auth needed). Returns PIN + job info */
  uploadFile: async (file: File): Promise<JobResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<JobResponse>('/api/v1/jobs/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /** Shop enters PIN to fetch the file details */
  getFileByPin: async (pin: string): Promise<PrintResponse> => {
    const response = await api.get<PrintResponse>(`/api/v1/jobs/${pin}`);
    return response.data;
  },

  /** Shop presses print — marks job as printed */
  printJob: async (pin: string): Promise<PrintResponse> => {
    const response = await api.post<PrintResponse>(`/api/v1/jobs/${pin}/print`);
    return response.data;
  },

  /** Get job history for authenticated user */
  getJobHistory: async (token: string): Promise<JobHistoryEntry[]> => {
    const response = await api.get<JobHistoryEntry[]>('/api/v1/jobs/history', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
