import type { AuthService } from './AuthService'
import { RestAuthAdapter } from './RestAuthAdapter'

/**
 * Factoría para obtener el servicio de autenticación activo.
 * Se instancia por invocación de composable para enlazar siempre
 * el contexto reactivo actual de cookies (useCookie) en Nuxt 4.
 */
export const getAuthService = (): AuthService => {
  return new RestAuthAdapter()
}

export * from './AuthService'
export * from './RestAuthAdapter'
