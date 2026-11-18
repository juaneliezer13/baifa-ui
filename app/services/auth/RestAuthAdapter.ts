import type { AuthService } from './AuthService'
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  RegisterResponse,
  UserProfile,
  ApiErrorResponse,
  AuthEndpointsConfig,
  ForgotPasswordData,
  ForgotPasswordResponse,
  ResetPasswordData,
  ResetPasswordResponse,
  UpdateProfileData,
  UpdateProfileResponse
} from '~~/types/auth'

/**
 * Adaptador REST para autenticación y registro contra Laravel Sanctum (baifa-api).
 */
export class RestAuthAdapter implements AuthService {
  private api: ReturnType<typeof useApi>
  private endpoints: AuthEndpointsConfig

  constructor() {
    this.api = useApi()
    const config = useRuntimeConfig()
    this.endpoints = config.public.authEndpoints as AuthEndpointsConfig
  }

  /**
   * Normaliza la estructura del usuario devuelta por el backend a UserProfile
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
      manager: 'Jefe / Gerente',
      administrator: 'Administrador',
      employee: 'Empleado',
      operator: 'Empleado',
      viewer: 'Visualizador',
      client: 'Cliente'
    }

    return {
      id: rawUser.id,
      name: rawUser.name || 'Usuario',
      email: rawUser.email || '',
      role,
      roleLabel: roleLabelMap[role] || rawUser.role_label || rawUser.roleLabel || 'Usuario',
      clientId: rawUser.client_id || rawUser.clientId || rawUser.client?.id || null,
      client: rawUser.client || null,
      createdAt: rawUser.created_at || rawUser.createdAt
    }
  }

  /**
   * Ejecuta el inicio de sesión contra el backend
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const cleanEmail = credentials.email.trim().toLowerCase()
    const cleanPassword = credentials.password.trim()

    try {
      const payload = {
        email: cleanEmail,
        password: cleanPassword,
        device_name: credentials.deviceName || 'web'
      }

      const response = await this.api.post<any>(this.endpoints.login, payload)

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
      company_fiscal_name: data.company_fiscal_name.trim(),
      company_short_name: data.company_short_name?.trim() || data.company_fiscal_name.trim(),
      rif: data.rif.trim().toUpperCase(),
      phone: data.phone?.trim() || undefined,
      role: 'client'
    }

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
    } catch {
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
      // Si la revocación en el servidor falla, continuamos para limpiar la sesión local.
    }
  }

  /**
   * Solicita el restablecimiento de contraseña
   */
  async forgotPassword(data: ForgotPasswordData): Promise<ForgotPasswordResponse> {
    const cleanEmail = data.email.trim().toLowerCase()

    try {
      const endpoint = this.endpoints.forgotPassword || '/v1/auth/forgot-password'
      const response = await this.api.post<any>(endpoint, { email: cleanEmail })
      return {
        success: true,
        message: response.message || 'Se ha enviado un enlace de restablecimiento a tu correo electrónico.'
      }
    } catch (err: unknown) {
      const apiErr = err as ApiErrorResponse
      return {
        success: false,
        message: apiErr.message || 'No fue posible procesar la solicitud de recuperación.',
        errors: apiErr.errors
      }
    }
  }

  /**
   * Restablece la contraseña con token y nueva contraseña
   */
  async resetPassword(data: ResetPasswordData): Promise<ResetPasswordResponse> {
    const cleanEmail = data.email.trim().toLowerCase()

    try {
      const endpoint = this.endpoints.resetPassword || '/v1/auth/reset-password'
      const response = await this.api.post<any>(endpoint, {
        token: data.token,
        email: cleanEmail,
        password: data.password,
        password_confirmation: data.password_confirmation
      })
      return {
        success: true,
        message: response.message || 'Tu contraseña ha sido restablecida exitosamente.'
      }
    } catch (err: unknown) {
      const apiErr = err as ApiErrorResponse
      return {
        success: false,
        message: apiErr.message || 'No fue posible restablecer la contraseña.',
        errors: apiErr.errors
      }
    }
  }

  /**
   * Actualiza los datos de perfil, contraseña y/o empresa asociada del usuario autenticado
   */
  async updateProfile(data: UpdateProfileData): Promise<UpdateProfileResponse> {
    try {
      const response = await this.api.put<any>('/v1/auth/profile', data)
      const rawUser = response.user || response.data?.user || response.data
      return {
        success: true,
        message: response.message || 'Tu perfil ha sido actualizado exitosamente.',
        user: rawUser ? this.normalizeUser(rawUser) : undefined
      }
    } catch (err: unknown) {
      const apiErr = err as ApiErrorResponse
      return {
        success: false,
        message: apiErr.message || 'No fue posible actualizar los datos del perfil.',
        errors: apiErr.errors
      }
    }
  }
}
