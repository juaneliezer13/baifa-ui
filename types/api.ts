/**
 * Estándar TypeScript 2026 - Tipos Genéricos de Comunicación API
 */

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedMeta {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginatedMeta
}

export interface ApiValidationError {
  message: string
  errors: Record<string, string[]>
}
