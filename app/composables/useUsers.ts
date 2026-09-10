import { ref } from 'vue'
import type { SystemUser, CreateUserData, UpdateUserData, UserFilters } from '~~/types/user'
import type { ApiErrorResponse } from '~~/types/auth'

export const useUsers = () => {
  const api = useApi()
  const config = useRuntimeConfig()
  const { user: authUser } = useAuth()

  const users = ref<SystemUser[]>([])
  const isLoading = ref(false)
  const isSaving = ref(false)
  const isDeleting = ref(false)
  const errorMessage = ref('')
  const fieldErrors = ref<Record<string, string[]> | undefined>(undefined)
  const successMessage = ref('')

  const clearMessages = () => {
    errorMessage.value = ''
    fieldErrors.value = undefined
    successMessage.value = ''
  }

  /**
   * Obtiene la lista de usuarios desde la API REST
   */
  const fetchUsers = async (filters: UserFilters = {}): Promise<SystemUser[]> => {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const params: Record<string, any> = {}
      if (filters.search) params.search = filters.search
      if (filters.role && filters.role !== 'all') params.role = filters.role
      if (filters.status && filters.status !== 'all') params.status = filters.status

      const response = await api.get<any>('/v1/users', params)
      const list = Array.isArray(response) ? response : (response.data || [])

      // Normalizar e identificar si coincide con el usuario autenticado
      users.value = list.map((u: any) => ({
        id: Number(u.id),
        name: u.name,
        email: u.email,
        role: u.role,
        role_label: u.role_label || u.roleLabel || u.role,
        is_active: Boolean(u.is_active ?? true),
        status: (u.is_active ?? true) ? 'active' : 'inactive',
        status_label: (u.is_active ?? true) ? 'Activo' : 'Inactivo',
        registered_date: u.registered_date || (u.created_at ? u.created_at.slice(0, 10) : '2026-01-01'),
        created_at: u.created_at || '',
        updated_at: u.updated_at || '',
        is_self: Boolean(u.is_self || (authUser.value && Number(authUser.value.id) === Number(u.id)))
      }))

      return users.value
    } catch (err: unknown) {
      const apiErr = err as ApiErrorResponse
      errorMessage.value = apiErr.message || 'Error al cargar la lista de usuarios.'
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Crea un nuevo usuario en el sistema
   */
  const createUser = async (data: CreateUserData): Promise<{ success: boolean; message?: string; user?: SystemUser }> => {
    isSaving.value = true
    clearMessages()

    try {
      const response = await api.post<any>('/v1/users', data)
      const created = response.user || response.data || response

      successMessage.value = response.message || 'Usuario creado exitosamente.'
      await fetchUsers()

      return {
        success: true,
        message: successMessage.value,
        user: created
      }
    } catch (err: unknown) {
      const apiErr = err as ApiErrorResponse
      errorMessage.value = apiErr.message || 'No fue posible crear el usuario.'
      fieldErrors.value = apiErr.errors

      return {
        success: false,
        message: errorMessage.value
      }
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Actualiza los datos de un usuario existente
   * Nota: Si se intenta actualizar el propio usuario, la API retornará 403 Forbidden
   */
  const updateUser = async (id: number, data: UpdateUserData): Promise<{ success: boolean; message?: string; user?: SystemUser }> => {
    isSaving.value = true
    clearMessages()

    // Validación preventiva en cliente para la regla de auto-modificación
    if (authUser.value && Number(authUser.value.id) === Number(id)) {
      isSaving.value = false
      errorMessage.value = 'No puedes modificar tu propio usuario desde la gestión de usuarios. Utiliza la opción Mi Perfil.'
      return { success: false, message: errorMessage.value }
    }

    try {
      const response = await api.put<any>(`/v1/users/${id}`, data)
      const updated = response.user || response.data || response

      successMessage.value = response.message || 'Usuario actualizado exitosamente.'
      await fetchUsers()

      return {
        success: true,
        message: successMessage.value,
        user: updated
      }
    } catch (err: unknown) {
      const apiErr = err as ApiErrorResponse
      errorMessage.value = apiErr.message || 'No fue posible actualizar el usuario.'
      fieldErrors.value = apiErr.errors

      return {
        success: false,
        message: errorMessage.value
      }
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Alterna el estado activo / inactivo de un usuario
   */
  const toggleUserStatus = async (id: number, currentStatus: boolean): Promise<boolean> => {
    if (authUser.value && Number(authUser.value.id) === Number(id)) {
      errorMessage.value = 'No puedes modificar el estado de tu propia cuenta.'
      return false
    }

    const res = await updateUser(id, { is_active: !currentStatus })
    return res.success
  }

  /**
   * Elimina un usuario del sistema
   * Nota: Si se intenta eliminar el propio usuario, la API retornará 403 Forbidden
   */
  const deleteUser = async (id: number): Promise<{ success: boolean; message?: string }> => {
    isDeleting.value = true
    clearMessages()

    // Validación preventiva en cliente para la regla de auto-eliminación
    if (authUser.value && Number(authUser.value.id) === Number(id)) {
      isDeleting.value = false
      errorMessage.value = 'No puedes eliminar tu propia cuenta de usuario administrador.'
      return { success: false, message: errorMessage.value }
    }

    try {
      const response = await api.delete<any>(`/v1/users/${id}`)
      successMessage.value = response.message || 'Usuario eliminado exitosamente.'
      await fetchUsers()

      return {
        success: true,
        message: successMessage.value
      }
    } catch (err: unknown) {
      const apiErr = err as ApiErrorResponse
      errorMessage.value = apiErr.message || 'No fue posible eliminar el usuario.'

      return {
        success: false,
        message: errorMessage.value
      }
    } finally {
      isDeleting.value = false
    }
  }

  return {
    users,
    isLoading,
    isSaving,
    isDeleting,
    errorMessage,
    fieldErrors,
    successMessage,
    clearMessages,
    fetchUsers,
    createUser,
    updateUser,
    toggleUserStatus,
    deleteUser
  }
}
