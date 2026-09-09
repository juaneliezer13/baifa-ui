import { computed } from 'vue'
import type { UserProfile } from '~~/types/auth'

export const useAuth = () => {
  const token = useCookie<string | null>('baifa_auth_token', {
    maxAge: 60 * 60 * 24 * 7, // 7 días
    path: '/'
  })

  const user = useCookie<UserProfile | null>('baifa_auth_user', {
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
  })

  const isAuthenticated = computed(() => Boolean(token.value))

  const login = async (credentials: { email: string; password: string }) => {
    // Simulación de latencia de red
    await new Promise((resolve) => setTimeout(resolve, 400))

    const cleanEmail = credentials.email.trim().toLowerCase()
    const cleanPassword = credentials.password.trim()

    if (cleanEmail === 'admin@admin' && cleanPassword === '12345678') {
      token.value = 'mock-jwt-token-baifa-superadmin-2026'
      user.value = {
        id: 1,
        name: 'Adriana Morales',
        email: 'admin@baifa.com.ve',
        role: 'admin',
        roleLabel: 'Superadministrador'
      }
      return { success: true }
    }

    return {
      success: false,
      message: 'Credenciales inválidas. Por favor verifica tu usuario o contraseña.'
    }
  }

  const logout = async () => {
    token.value = null
    user.value = null
    await navigateTo('/login')
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout
  }
}
