import type { AuthService } from './AuthService'
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  RegisterResponse,
  UserProfile,
  ApiErrorResponse,
  AuthEndpointsConfig
} from '~~/types/auth'

/**
 * Adaptador REST agnóstico para autenticación y registro.
 * Compatible con Laravel Sanctum (baifa-api), Express/NestJS, FastAPI, Go, etc.
 */
export class RestAuthAdapter implements AuthService {
  private api: ReturnType<typeof useApi>
  private endpoints: AuthEndpointsConfig
  private authMode: 'auto' | 'api' | 'mock'

  constructor() {
    this.api = useApi()
    const config = useRuntimeConfig()
    this.endpoints = config.public.authEndpoints as AuthEndpointsConfig
    this.authMode = (config.public.authMode as 'auto' | 'api' | 'mock') || 'auto'
  }

  /**
   * Normaliza la estructura del usuario devuelta por cualquier backend a UserProfile
   */
  private normalizeUser(rawUser: any): UserProfile {
    if (!rawUser) {
      return {
        id: 0,
        name: 'Usuario',
        email: '',
        role: 'client',
        roleLabel: 'Cliente'
      }
    }

    const role = String(rawUser.role || 'client').toLowerCase()

    const roleLabelMap: Record<string, string> = {
      admin: 'Superadministrador',
      superadmin: 'Superadministrador',
      manager: 'Administrador',
      administrator: 'Administrador',
      employee: 'Operador',
      operator: 'Operador',
      viewer: 'Visualizador',
      client: 'Cliente'
    }

    return {
      id: rawUser.id,
      name: rawUser.name || 'Usuario',
      email: rawUser.email || '',
      role,
      roleLabel: roleLabelMap[role] || (rawUser.roleLabel || 'Usuario'),
      clientId: rawUser.client_id || rawUser.clientId || null,
      createdAt: rawUser.created_at || rawUser.createdAt
    }
  }

  /**
   * Ejecuta el inicio de sesión contra el backend configurado
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const cleanEmail = credentials.email.trim().toLowerCase()
    const cleanPassword = credentials.password.trim()

    // 1. Si está en modo mock puro
    if (this.authMode === 'mock') {
      return this.mockLogin(cleanEmail, cleanPassword)
    }

    // 2. Intento de llamada al backend REST
    try {
      const payload = {
        email: cleanEmail,
        password: cleanPassword,
        device_name: credentials.deviceName || 'web'
      }

      const response = await this.api.post<any>(this.endpoints.login, payload)

      // Extraer token de formatos comunes: Sanctum (access_token), JWT estándar (token), etc.
      const token = response.access_token || response.token || response.data?.token || response.jwt
      const tokenType = response.token_type || 'Bearer'
      const rawUser = response.user || response.data?.user || response.data

      if (!token) {
        throw {
          message: 'El servidor no devolvió un token de acceso válido.',
          statusCode: 500
        } as ApiErrorResponse
      }

      const user = this.normalizeUser(rawUser)

      return {
        success: true,
        token,
        tokenType,
        user,
        message: response.message || 'Inicio de sesión exitoso.'
      }
    } catch (err: unknown) {
      const apiErr = err as ApiErrorResponse

      // En modo 'auto', si el servidor no está disponible o aún no tiene sembrado el usuario demo
      if (this.authMode === 'auto') {
        const isDemoAdmin = (cleanEmail === 'admin@admin' || cleanEmail === 'admin@baifa.com.ve') && cleanPassword === '12345678'
        if (isDemoAdmin && (apiErr.statusCode === 0 || apiErr.statusCode === 422 || apiErr.statusCode === 401)) {
          console.warn('[Baifa Auth] Usando sesión demo institucional en modo auto.')
          return this.mockLogin(cleanEmail, cleanPassword)
        }
      }

      return {
        success: false,
        message: apiErr.message || 'Error de autenticación.',
        errors: apiErr.errors
      }
    }
  }

  /**
   * Registra un nuevo cliente en el backend
   */
  async register(data: RegisterData): Promise<RegisterResponse> {
    const payload = {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      password_confirmation: data.password_confirmation,
      role: 'client'
    }

    // 1. Si está en modo mock puro
    if (this.authMode === 'mock') {
      return this.mockRegister(payload)
    }

    // 2. Intento de registro en el backend REST
    try {
      const response = await this.api.post<any>(this.endpoints.register, payload)

      const token = response.access_token || response.token || response.data?.token
      const rawUser = response.user || response.data?.user

      return {
        success: true,
        token,
        user: rawUser ? this.normalizeUser(rawUser) : undefined,
        message: response.message || 'Solicitud de acceso enviada exitosamente.'
      }
    } catch (err: unknown) {
      const apiErr = err as ApiErrorResponse

      // En modo 'auto', si el servidor está apagado (status 0), simular éxito para pruebas
      if (this.authMode === 'auto' && apiErr.statusCode === 0) {
        console.warn('[Baifa Auth] Backend desconectado en modo auto. Simulando registro local.')
        return this.mockRegister(payload)
      }

      return {
        success: false,
        message: apiErr.message || 'No fue posible procesar la solicitud de registro.',
        errors: apiErr.errors
      }
    }
  }

  /**
   * Obtiene el perfil del usuario autenticado actual
   */
  async getProfile(): Promise<UserProfile | null> {
    try {
      const response = await this.api.get<any>(this.endpoints.me)
      const rawUser = response.user || response.data?.user || response.data
      return this.normalizeUser(rawUser)
    } catch (err: unknown) {
      return null
    }
  }

  /**
   * Cierra sesión e invalida el token en el backend
   */
  async logout(): Promise<void> {
    try {
      await this.api.post(this.endpoints.logout, {})
    } catch {
      // Si la revocación en el servidor falla (ej. ya caducó o no hay red),
      // continuamos para limpiar la sesión local en el cliente.
    }
  }

  /**
   * Fallback de inicio de sesión simulado
   */
  private mockLogin(email: string, pass: string): AuthResponse {
    const isValid = (email === 'admin@admin' && pass === '12345678')
      || (email === 'admin@baifa.com.ve' && pass === '12345678')

    if (isValid) {
      return {
        success: true,
        token: 'baifa-demo-bearer-token-2026',
        tokenType: 'Bearer',
        user: {
          id: 1,
          name: 'Adriana Morales',
          email: 'admin@baifa.com.ve',
          role: 'admin',
          roleLabel: 'Superadministrador'
        },
        message: 'Inicio de sesión exitoso (Demo)'
      }
    }

    return {
      success: false,
      message: 'Las credenciales proporcionadas son incorrectas.'
    }
  }

  /**
   * Fallback de registro simulado
   */
  private mockRegister(data: { name: string; email: string }): RegisterResponse {
    return {
      success: true,
      message: 'Solicitud de acceso de cliente enviada exitosamente (Demo)',
      user: {
        id: Date.now(),
        name: data.name,
        email: data.email,
        role: 'client',
        roleLabel: 'Cliente'
      }
    }
  }
}
