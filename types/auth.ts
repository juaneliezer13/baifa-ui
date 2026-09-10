/**
 * Estándar TypeScript 2026 - Modelos y Tipos de Autenticación y Registro
 * Adaptable para cualquier backend REST (Laravel Sanctum, Node.js, FastAPI, Go, etc.)
 */

export type UserRole = 'client' | 'employee' | 'manager' | 'admin' | string

export interface UserProfile {
  id: number | string
  name: string
  email: string
  role: UserRole
  roleLabel: string
  clientId?: number | string | null
  createdAt?: string
}

export interface AuthSession {
  token: string
  user: UserProfile
  expiresAt?: string
}

export interface LoginCredentials {
  email: string
  password: string
  deviceName?: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  password_confirmation: string
  company_fiscal_name: string
  company_short_name?: string
  rif: string
  phone?: string
  role?: string
}

export interface AuthResponse {
  success: boolean
  token?: string
  tokenType?: string
  user?: UserProfile
  message?: string
  errors?: Record<string, string[]>
}

export interface RegisterResponse {
  success: boolean
  token?: string
  user?: UserProfile
  message?: string
  errors?: Record<string, string[]>
}

export interface ForgotPasswordData {
  email: string
}

export interface ForgotPasswordResponse {
  success: boolean
  message: string
  reset_url?: string
  token?: string
  errors?: Record<string, string[]>
}

export interface ResetPasswordData {
  token: string
  email: string
  password: string
  password_confirmation: string
}

export interface ResetPasswordResponse {
  success: boolean
  message: string
  errors?: Record<string, string[]>
}

export interface ApiErrorResponse {
  message: string
  errors?: Record<string, string[]>
  statusCode?: number
}

export interface AuthEndpointsConfig {
  login: string
  register: string
  me: string
  logout: string
  forgotPassword?: string
  resetPassword?: string
}
