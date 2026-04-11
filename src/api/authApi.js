import api from './axios';

export const authApi = {
  login: (data) => api.post('/auth/login', data),
};
