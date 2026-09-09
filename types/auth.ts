/**
 * Estándar TypeScript 2026 - Modelos y Tipos de Autenticación
 */

export type UserRole = 'client' | 'employee' | 'manager' | 'admin'

export interface UserProfile {
  id: number
  name: string
  email: string
  role: UserRole
  roleLabel: string
  clientId?: number | null
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
}
