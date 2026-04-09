// =============================================
// PrintPass — TypeScript Type Definitions
// Maps 1:1 with backend DTOs and enums
// =============================================

// ─── Enums ───────────────────────────────────

export type Role = 'PRINT_SHOP' | 'ADMIN';

export type JobStatus = 'PENDING' | 'PROCESSING' | 'READY' | 'COMPLETED' | 'CANCELLED';

// ─── Auth ────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: string;
  email: string;
  expiresIn: number;
}

// ─── Shop ────────────────────────────────────

export interface ShopRegisterRequest {
  email: string;
  password: string;
  shopName: string;
  ownerName: string;
  phone: string;
  address: string;
  city: string;
}

export interface ShopUpdateRequest {
  shopName: string;
  ownerName: string;
  phone: string;
  address: string;
  city: string;
}

export interface ShopResponse {
  id: string;
  shopName: string;
  ownerName: string;
  phone: string;
  address: string;
  city: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

// ─── Jobs ────────────────────────────────────

export interface JobResponse {
  id: string;
  secretKey: string;
  fileName: string;
  jobStatus: JobStatus;
  expiresAt: string;
  createdAt: string;
}

/** Job row returned from authenticated history endpoint */
export interface JobHistoryEntry {
  id: string;
  fileName: string;
  jobStatus: string;
  createdAt: string;
  expiresAt: string;
  fileUrl?: string | null;
}

// ─── Profile ─────────────────────────────────

export interface UserProfile {
  name?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface ProfileUpdatePayload {
  name: string;
  phone: string;
  address: string;
}

export interface PrintResponse {
  fileName: string;
  fileUrl: string | null;
  message: string;
}

// ─── OTP ─────────────────────────────────────

export interface OtpRequest {
  email: string;
}

export interface OtpVerifyRequest {
  email: string;
  otp: string;
}

// ─── API Error ───────────────────────────────

export interface ApiError {
  message: string;
  status: number;
  timestamp?: string;
}
