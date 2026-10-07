import { ref } from 'vue'
import { useApi } from '~/composables/useApi'
import type {
  SupportTicket,
  SupportMessage,
  TicketLog,
  AssignTicketDTO,
  UpdateTicketStatusDTO
} from '~~/types/support'

export const useTickets = () => {
  const api = useApi()

  const tickets = ref<SupportTicket[]>([])
  const selectedTicket = ref<SupportTicket | null>(null)
  const ticketLogs = ref<TicketLog[]>([])
  const ticketMessages = ref<SupportMessage[]>([])
  const isLoading = ref(false)
  const isSaving = ref(false)
  const errorMessage = ref<string | null>(null)
  const successMessage = ref<string | null>(null)

  // Metadatos de paginación
  const pagination = ref({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 15
  })

  const clearMessages = () => {
    errorMessage.value = null
    successMessage.value = null
  }

  /**
   * Listado general para personal interno (Tickera / Helpdesk)
   */
  const fetchTickets = async (params: Record<string, any> = {}) => {
    isLoading.value = true
    errorMessage.value = null
    try {
      const response = await api.get<{
        data: SupportTicket[]
        meta?: { current_page: number; last_page: number; total: number; per_page: number }
      }>('/v1/support/tickets', params)

      tickets.value = response.data || []
      if (response.meta) {
        pagination.value = {
          currentPage: response.meta.current_page,
          lastPage: response.meta.last_page,
          total: response.meta.total,
          perPage: response.meta.per_page
        }
      }
    } catch (err: any) {
      errorMessage.value = err.message || 'No fue posible cargar el listado de tickets.'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Listado de consultas históricas exclusivas del cliente ("Mis Consultas")
   */
  const fetchMyTickets = async (params: Record<string, any> = {}) => {
    isLoading.value = true
    errorMessage.value = null
    try {
      const response = await api.get<{
        data: SupportTicket[]
        meta?: { current_page: number; last_page: number; total: number; per_page: number }
      }>('/v1/support/my-tickets', params)

      tickets.value = response.data || []
      if (response.meta) {
        pagination.value = {
          currentPage: response.meta.current_page,
          lastPage: response.meta.last_page,
          total: response.meta.total,
          perPage: response.meta.per_page
        }
      }
    } catch (err: any) {
      errorMessage.value = err.message || 'No fue posible cargar tus consultas registradas.'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Obtiene el detalle de un ticket específico
   */
  const fetchTicketDetail = async (id: number): Promise<SupportTicket | null> => {
    isLoading.value = true
    errorMessage.value = null
    try {
      const response = await api.get<{ data: SupportTicket }>(`/v1/support/tickets/${id}`)
      selectedTicket.value = response.data
      ticketMessages.value = response.data.messages || []
      ticketLogs.value = response.data.logs || []
      return response.data
    } catch (err: any) {
      errorMessage.value = err.message || 'Error al obtener los detalles del ticket.'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Asignar ticket a un empleado o autoasignárselo ("tomar ticket")
   */
  const assignTicket = async (id: number, payload: AssignTicketDTO = {}): Promise<boolean> => {
    isSaving.value = true
    errorMessage.value = null
    clearMessages()
    try {
      const response = await api.patch<{ data: SupportTicket }>(`/v1/support/tickets/${id}/assign`, payload)
      selectedTicket.value = response.data
      successMessage.value = 'Ticket asignado exitosamente.'

      // Actualizar en la lista local si existe
      const index = tickets.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tickets.value[index] = response.data
      }

      return true
    } catch (err: any) {
      errorMessage.value = err.message || 'No se pudo completar la asignación del ticket.'
      return false
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Cambiar estatus del ticket (En proceso, Finalizado o Cancelado con comentario obligatorio)
   */
  const updateTicketStatus = async (id: number, payload: UpdateTicketStatusDTO): Promise<boolean> => {
    isSaving.value = true
    errorMessage.value = null
    clearMessages()
    try {
      const response = await api.patch<{ data: SupportTicket }>(`/v1/support/tickets/${id}/status`, payload)
      selectedTicket.value = response.data
      successMessage.value = `El estado del ticket cambió a: ${response.data.status_label}`

      // Actualizar en la lista local si existe
      const index = tickets.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tickets.value[index] = response.data
      }

      return true
    } catch (err: any) {
      errorMessage.value = err.message || 'No se pudo actualizar el estado del ticket.'
      return false
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Enviar un mensaje al chat del ticket
   */
  const sendTicketMessage = async (id: number, messageText: string): Promise<SupportMessage | null> => {
    if (!messageText.trim()) return null
    errorMessage.value = null
    try {
      const response = await api.post<{ data: SupportMessage }>(`/v1/support/tickets/${id}/messages`, {
        message: messageText.trim()
      })

      if (response.data) {
        ticketMessages.value.push(response.data)
      }

      return response.data
    } catch (err: any) {
      errorMessage.value = err.message || 'Error al enviar el mensaje al chat.'
      return null
    }
  }

  /**
   * Cargar mensajes del chat
   */
  const fetchMessages = async (id: number) => {
    try {
      const response = await api.get<{ data: SupportMessage[] }>(`/v1/support/tickets/${id}/messages`)
      ticketMessages.value = response.data || []
    } catch (err: any) {
      // Silencioso o log
    }
  }

  /**
   * Cargar bitácora de evolución
   */
  const fetchLogs = async (id: number) => {
    try {
      const response = await api.get<{ data: TicketLog[] }>(`/v1/support/tickets/${id}/logs`)
      ticketLogs.value = response.data || []
    } catch (err: any) {
      // Silencioso o log
    }
  }

  return {
    tickets,
    selectedTicket,
    ticketLogs,
    ticketMessages,
    pagination,
    isLoading,
    isSaving,
    errorMessage,
    successMessage,
    clearMessages,
    fetchTickets,
    fetchMyTickets,
    fetchTicketDetail,
    assignTicket,
    updateTicketStatus,
    sendTicketMessage,
    fetchMessages,
    fetchLogs
  }
}
