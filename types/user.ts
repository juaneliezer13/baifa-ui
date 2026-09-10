/**
 * Tipos de datos para la Gestión y CRUD de Usuarios del Sistema - Baifa
 */

export type SystemUserRole = 'admin' | 'manager' | 'employee' | 'client'

export interface SystemUser {
  id: number
  name: string
  email: string
  role: SystemUserRole
  role_label: string
  is_active: boolean
  status: 'active' | 'inactive'
  status_label: string
  registered_date: string
  created_at: string
  updated_at?: string
  is_self?: boolean
}

export interface CreateUserData {
  name: string
  email: string
  password: string
  role: SystemUserRole
  is_active?: boolean
}

export interface UpdateUserData {
  name?: string
  email?: string
  password?: string
  role?: SystemUserRole
  is_active?: boolean
}

export interface UserFilters {
  search?: string
  role?: string
  status?: string
}
