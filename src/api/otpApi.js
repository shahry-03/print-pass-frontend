import api from './axios';

export const otpApi = {
  verify: (data) => api.post('/otp/verify', data),
  resend: (data) => api.post('/otp/resend', data),
};
