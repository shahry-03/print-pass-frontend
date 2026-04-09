import api from './api';
import type { OtpVerifyRequest, OtpRequest } from '../types';

export const otpService = {
  /** Verify OTP for email verification */
  verifyOtp: async (data: OtpVerifyRequest): Promise<void> => {
    await api.post('/api/v1/otp/verify', data);
  },

  /** Resend OTP to email */
  resendOtp: async (data: OtpRequest): Promise<void> => {
    await api.post('/api/v1/otp/resend', data);
  },
};
