import { ref } from 'vue'
import type { ClientItem, CreateClientData, UpdateClientData, ClientFilters } from '~~/types/client'
import type { ApiErrorResponse } from '~~/types/auth'

export const useClients = () => {
  const api = useApi()

  const clients = ref<ClientItem[]>([])
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
   * Obtiene la lista de clientes desde la API REST
   */
  const fetchClients = async (filters: ClientFilters = {}): Promise<ClientItem[]> => {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const params: Record<string, any> = {}
      if (filters.search) params.search = filters.search
      if (filters.status && filters.status !== 'all') params.status = filters.status

      const response = await api.get<any>('/v1/clients', params)
      const list = Array.isArray(response) ? response : (response.data || [])

      clients.value = list.map((c: any) => ({
        id: Number(c.id),
        company_fiscal_name: c.company_fiscal_name,
        company_short_name: c.company_short_name,
        rif: c.rif,
        office_phone: c.office_phone || null,
        contact_name: c.contact_name,
        contact_email: c.contact_email,
        contact_phone: c.contact_phone || null,
        is_active: Boolean(c.is_active ?? true),
        status: (c.is_active ?? true) ? 'active' : 'inactive',
        status_label: c.status_label || ((c.is_active ?? true) ? 'Activo' : 'Inactivo'),
        user_id: c.user_id ? Number(c.user_id) : null,
        user: c.user ? {
          id: Number(c.user.id),
          name: c.user.name,
          email: c.user.email
        } : null,
        registered_date: c.registered_date || (c.created_at ? c.created_at.slice(0, 10) : ''),
        created_at: c.created_at || '',
        updated_at: c.updated_at || ''
      }))

      return clients.value
    } catch (err: unknown) {
      const apiErr = err as ApiErrorResponse
      errorMessage.value = apiErr.message || 'Error al cargar el directorio de clientes.'
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Registra un nuevo cliente (y autogenera su usuario asociado)
   */
  const createClient = async (data: CreateClientData): Promise<{ success: boolean; message?: string; client?: ClientItem }> => {
    isSaving.value = true
    clearMessages()

    try {
      const response = await api.post<any>('/v1/clients', data)
      const created = response.client || response.data || response

      successMessage.value = response.message || 'Cliente registrado exitosamente.'
      await fetchClients()

      return {
        success: true,
        message: successMessage.value,
        client: created
      }
    } catch (err: unknown) {
      const apiErr = err as ApiErrorResponse
      errorMessage.value = apiErr.message || 'No fue posible registrar el cliente.'
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
   * Actualiza los datos de un cliente existente
   */
  const updateClient = async (id: number, data: UpdateClientData): Promise<{ success: boolean; message?: string; client?: ClientItem }> => {
    isSaving.value = true
    clearMessages()

    try {
      const response = await api.put<any>(`/v1/clients/${id}`, data)
      const updated = response.client || response.data || response

      successMessage.value = response.message || 'Cliente actualizado exitosamente.'
      await fetchClients()

      return {
        success: true,
        message: successMessage.value,
        client: updated
      }
    } catch (err: unknown) {
      const apiErr = err as ApiErrorResponse
      errorMessage.value = apiErr.message || 'No fue posible actualizar el cliente.'
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
   * Alterna el estado activo / inactivo de un cliente
   */
  const toggleClientStatus = async (id: number): Promise<{ success: boolean; message?: string }> => {
    clearMessages()

    try {
      const response = await api.patch<any>(`/v1/clients/${id}/toggle-status`)
      successMessage.value = response.message || 'Estado del cliente actualizado exitosamente.'

      // Actualización optimista local
      const target = clients.value.find(c => c.id === id)
      if (target) {
        target.is_active = !target.is_active
        target.status = target.is_active ? 'active' : 'inactive'
        target.status_label = target.is_active ? 'Activo' : 'Inactivo'
      }

      await fetchClients()

      return { success: true, message: successMessage.value }
    } catch (err: unknown) {
      const apiErr = err as ApiErrorResponse
      errorMessage.value = apiErr.message || 'Error al cambiar el estado del cliente.'
      return { success: false, message: errorMessage.value }
    }
  }

  /**
   * Elimina un cliente (y en cascada su usuario asociado)
   */
  const deleteClient = async (id: number): Promise<{ success: boolean; message?: string }> => {
    isDeleting.value = true
    clearMessages()

    try {
      const response = await api.delete<any>(`/v1/clients/${id}`)
      successMessage.value = response.message || 'Cliente eliminado exitosamente.'

      clients.value = clients.value.filter(c => c.id !== id)
      await fetchClients()

      return { success: true, message: successMessage.value }
    } catch (err: unknown) {
      const apiErr = err as ApiErrorResponse
      errorMessage.value = apiErr.message || 'Error al eliminar el cliente.'
      return { success: false, message: errorMessage.value }
    } finally {
      isDeleting.value = false
    }
  }

  return {
    clients,
    isLoading,
    isSaving,
    isDeleting,
    errorMessage,
    fieldErrors,
    successMessage,
    clearMessages,
    fetchClients,
    createClient,
    updateClient,
    toggleClientStatus,
    deleteClient
  }
}
