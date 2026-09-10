import type { AuthService } from './AuthService'
import { RestAuthAdapter } from './RestAuthAdapter'

/**
 * Factoría para obtener el servicio de autenticación activo.
 * Por defecto instancia RestAuthAdapter, que gestiona llamadas REST
 * configurables y compatibilidad universal.
 */
let instance: AuthService | null = null

export const getAuthService = (): AuthService => {
  // En Nuxt / Vue SSR es mejor instanciar por contexto o singleton en cliente
  if (!instance || import.meta.server) {
    instance = new RestAuthAdapter()
  }
  return instance
}

export * from './AuthService'
export * from './RestAuthAdapter'
