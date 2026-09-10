import type { FetchError } from 'ofetch'
import type { ApiErrorResponse } from '~~/types/auth'

/**
 * Cliente HTTP base para Baifa
 * Envoltorio tipado de $fetch con gestión automática de baseURL, headers y errores.
 */
export const useApi = () => {
  const config = useRuntimeConfig()
  const token = useCookie<string | null>('baifa_auth_token')

  const baseURL = config.public.apiBase as string

  const getHeaders = (customHeaders?: HeadersInit): HeadersInit => {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }

    if (token.value) {
      headers.Authorization = `Bearer ${token.value}`
    }

    if (customHeaders) {
      Object.assign(headers, customHeaders)
    }

    return headers
  }

  const parseError = (err: unknown): ApiErrorResponse => {
    const fetchError = err as FetchError

    if (!fetchError.response) {
      return {
        message: 'No fue posible establecer conexión con el servidor. Verifica tu conexión a internet o el estado del backend.',
        statusCode: 0
      }
    }

    const data = fetchError.response._data as Record<string, any> | undefined
    const statusCode = fetchError.response.status

    let message = data?.message || fetchError.message || 'Ocurrió un error inesperado en la petición.'
    const errors: Record<string, string[]> = {}

    // Normalización de errores de validación (Laravel, Express, NestJS, FastAPI, etc.)
    if (data?.errors && typeof data.errors === 'object') {
      for (const [key, value] of Object.entries(data.errors)) {
        if (Array.isArray(value)) {
          errors[key] = value.map(v => String(v))
        } else if (typeof value === 'string') {
          errors[key] = [value]
        }
      }
    } else if (Array.isArray(data?.detail)) {
      // Formato típico FastAPI / Pydantic
      for (const item of data.detail) {
        const field = item.loc ? item.loc[item.loc.length - 1] : 'general'
        if (!errors[field]) errors[field] = []
        errors[field].push(item.msg || 'Error de validación')
      }
    }

    return {
      message,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
      statusCode
    }
  }

  const buildUrl = (endpoint: string): string => {
    if (/^https?:\/\//i.test(endpoint)) return endpoint
    const base = baseURL.replace(/\/+$/, '')
    const path = endpoint.replace(/^\/+/, '')
    return `${base}/${path}`
  }

  const request = async <T = any>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
      body?: any
      params?: Record<string, any>
      headers?: HeadersInit
      timeout?: number
    } = {}
  ): Promise<T> => {
    try {
      const fullUrl = buildUrl(endpoint)
      const response = await $fetch<T>(fullUrl, {
        method: options.method || 'GET',
        headers: getHeaders(options.headers),
        body: options.body,
        params: options.params,
        timeout: options.timeout || 4000
      })

      return response
    } catch (err: unknown) {
      const parsed = parseError(err)
      throw parsed
    }
  }

  return {
    baseURL,
    request,
    get: <T = any>(endpoint: string, params?: Record<string, any>, headers?: HeadersInit) =>
      request<T>(endpoint, { method: 'GET', params, headers }),
    post: <T = any>(endpoint: string, body?: any, headers?: HeadersInit) =>
      request<T>(endpoint, { method: 'POST', body, headers }),
    put: <T = any>(endpoint: string, body?: any, headers?: HeadersInit) =>
      request<T>(endpoint, { method: 'PUT', body, headers }),
    patch: <T = any>(endpoint: string, body?: any, headers?: HeadersInit) =>
      request<T>(endpoint, { method: 'PATCH', body, headers }),
    delete: <T = any>(endpoint: string, headers?: HeadersInit) =>
      request<T>(endpoint, { method: 'DELETE', headers })
  }
}
