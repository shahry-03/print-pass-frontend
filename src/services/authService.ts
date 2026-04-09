import api from './api';
import type { LoginRequest, LoginResponse, ProfileUpdatePayload, UserProfile } from '../types';

export const authService = {
  /** Authenticate user with email + password, returns JWT */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/v1/auth/login', data);
    return response.data;
  },

  /** Get user profile */
  getProfile: async (token: string): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('/api/v1/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /** Update user profile */
  updateProfile: async (token: string, data: ProfileUpdatePayload): Promise<UserProfile> => {
    const response = await api.put<UserProfile>('/api/v1/auth/profile', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
