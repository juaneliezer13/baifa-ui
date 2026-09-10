import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  RegisterResponse,
  UserProfile,
  ForgotPasswordData,
  ForgotPasswordResponse,
  ResetPasswordData,
  ResetPasswordResponse
} from '~~/types/auth'

/**
 * Contrato de servicio de autenticación agnóstico.
 * Permite desacoplar los componentes de la interfaz de la implementación concreta
 * del backend (REST Sanctum, Node.js JWT, GraphQL, Mock, etc.).
 */
export interface AuthService {
  /**
   * Iniciar sesión con credenciales
   */
  login(credentials: LoginCredentials): Promise<AuthResponse>

  /**
   * Registrar una nueva cuenta de cliente
   */
  register(data: RegisterData): Promise<RegisterResponse>

  /**
   * Obtener el perfil del usuario autenticado
   */
  getProfile(): Promise<UserProfile | null>

  /**
   * Cerrar la sesión activa e invalidar token si aplica
   */
  logout(): Promise<void>

  /**
   * Solicitar correo de restablecimiento de contraseña
   */
  forgotPassword(data: ForgotPasswordData): Promise<ForgotPasswordResponse>

  /**
   * Restablecer contraseña con token y nueva clave
   */
  resetPassword(data: ResetPasswordData): Promise<ResetPasswordResponse>
}
