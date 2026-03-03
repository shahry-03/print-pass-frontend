// User Related Types
export type UserRole = 'STUDENT' | 'VENDOR' | 'ADMIN'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  walletBalance: number
}

export interface UserRequest {
  name: string
  email: string
  password: string
  role: UserRole
}

export interface UserResponse {
  id: number
  name: string
  email: string
  role: UserRole
  walletBalance: number
}

export interface AuthRequest {
  email: string
  password: string
}

// Shop Related Types
export interface ShopRequest {
  vendorId: number
  shopName: string
  location: string
  perPageCost: number
}

export interface ShopResponse {
  id: number
  vendorId: number
  shopName: string
  location: string
  perPageCost: number
  isOpen: boolean
}

// Job Related Types
export type JobStatus = 'PENDING' | 'PROCESSING' | 'READY' | 'COMPLETED' | 'CANCELLED'

export interface JobRequest {
  studentId: number
  shopId: number
  documentName: string
  totalPages: number
  isColor: boolean
}

export interface JobResponse {
  id: number
  studentId: number
  shopId: number
  documentName: string
  totalPages: number
  totalCost: number
  status: JobStatus
  pin: string
}

export interface JobCreateRequest extends Omit<JobRequest, 'studentId'> {
  file: File
}

// API Error Response
export interface ApiError {
  message: string
  status: number
  timestamp?: string
}

// Pagination Response
export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  currentPage: number
}

// Authentication Response
export interface AuthResponse {
  token: string
  user: UserResponse
}

