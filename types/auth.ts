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
}
