import axios, { AxiosInstance, AxiosError } from 'axios'
import { ApiError, AuthResponse, User } from '@/types'

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:8080/api'

class ApiClient {
  private client: AxiosInstance
  private token: string | null = localStorage.getItem('authToken')

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add token
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          this.logout()
        }
        return Promise.reject(error)
      }
    )
  }

  setToken(token: string) {
    this.token = token
    localStorage.setItem('authToken', token)
  }

  getToken(): string | null {
    return this.token
  }

  logout() {
    this.token = null
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  }

  isAuthenticated(): boolean {
    return !!this.token
  }

  // Generic GET request
  async get<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  // Generic POST request
  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  // Generic PUT request
  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  // Generic DELETE request
  async delete<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }

  // Form data POST (for file uploads)
  async postFormData<T>(url: string, data: FormData): Promise<T> {
    const response = await this.client.post<T>(url, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  // Download file
  async downloadFile(url: string, filename: string) {
    const response = await this.client.get(url, {
      responseType: 'blob',
    })
    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    link.click()
    window.URL.revokeObjectURL(downloadUrl)
  }
}

export const apiClient = new ApiClient()

// User API
export const userApi = {
  register: (data: any) => apiClient.post('/users', data),
  login: (email: string, password: string) =>
    apiClient.post<AuthResponse>('/users/login', { email, password }),
  getAll: () => apiClient.get('/users'),
  getById: (id: number) => apiClient.get<any>(`/users/${id}`),
  getCurrentUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },
  setCurrentUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user))
  },
}

// Shop API
export const shopApi = {
  create: (data: any) => apiClient.post('/shops', data),
  getAll: () => apiClient.get('/shops'),
  getById: (id: number) => apiClient.get(`/shops/${id}`),
  getByVendor: (vendorId: number) => apiClient.get(`/shops?vendorId=${vendorId}`),
}

// Job API
export const jobApi = {
  create: (data: FormData) => apiClient.postFormData('/jobs', data),
  getAll: () => apiClient.get('/jobs'),
  getById: (id: number) => apiClient.get(`/jobs/${id}`),
  verifyPin: (pin: string) => apiClient.get(`/jobs/verify/${pin}`),
  updateStatus: (jobId: number, newStatus: string) =>
    apiClient.put(`/jobs/${jobId}/status`, null, {
      params: { newStatus },
    }),
  downloadFile: (fileName: string) =>
    apiClient.downloadFile(`/jobs/download/${fileName}`, fileName),
}

export type { ApiError }

