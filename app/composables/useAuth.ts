import { ref, computed } from 'vue'
import { getAuthService } from '~/services/auth'
import type {
  UserProfile,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  RegisterResponse
} from '~~/types/auth'

export const useAuth = () => {
  const token = useCookie<string | null>('baifa_auth_token', {
    maxAge: 60 * 60 * 24 * 7, // 7 días
    path: '/'
  })

  const user = useCookie<UserProfile | null>('baifa_auth_user', {
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
  })

  const isLoading = ref(false)
  const errorMessage = ref('')
  const fieldErrors = ref<Record<string, string[]> | undefined>(undefined)

  const isAuthenticated = computed(() => Boolean(token.value))

  const authService = getAuthService()

  /**
   * Iniciar sesión contra el backend configurado
   */
  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    isLoading.value = true
    errorMessage.value = ''
    fieldErrors.value = undefined

    try {
      const response = await authService.login(credentials)

      if (response.success && response.token) {
        token.value = response.token
        user.value = response.user || null
      } else {
        errorMessage.value = response.message || 'Credenciales inválidas.'
        fieldErrors.value = response.errors
      }

      return response
    } catch (err: unknown) {
      const errorMsg = (err as any)?.message || 'Ocurrió un error inesperado al iniciar sesión.'
      errorMessage.value = errorMsg
      return {
        success: false,
        message: errorMsg
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Registrar una nueva cuenta de cliente
   */
  const register = async (data: RegisterData): Promise<RegisterResponse> => {
    isLoading.value = true
    errorMessage.value = ''
    fieldErrors.value = undefined

    try {
      const response = await authService.register(data)

      if (response.success) {
        // Si el backend auto-inicia sesión emitiendo token en el registro:
        if (response.token) {
          token.value = response.token
          user.value = response.user || null
        }
      } else {
        errorMessage.value = response.message || 'No fue posible registrar la cuenta.'
        fieldErrors.value = response.errors
      }

      return response
    } catch (err: unknown) {
      const errorMsg = (err as any)?.message || 'Ocurrió un error inesperado al enviar la solicitud.'
      errorMessage.value = errorMsg
      return {
        success: false,
        message: errorMsg
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Cerrar sesión activa en el backend y limpiar estado local
   */
  const logout = async () => {
    isLoading.value = true
    try {
      await authService.logout()
    } finally {
      token.value = null
      user.value = null
      errorMessage.value = ''
      fieldErrors.value = undefined
      isLoading.value = false
      await navigateTo('/login')
    }
  }

  /**
   * Refrescar perfil del usuario actual desde el backend
   */
  const fetchUser = async (): Promise<UserProfile | null> => {
    if (!token.value) return null
    try {
      const profile = await authService.getProfile()
      if (profile) {
        user.value = profile
      }
      return profile
    } catch {
      return null
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    isLoading,
    errorMessage,
    fieldErrors,
    login,
    register,
    logout,
    fetchUser
  }
}
