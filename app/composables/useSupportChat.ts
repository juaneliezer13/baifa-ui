import { ref, computed } from 'vue'
import { useApi } from '~/composables/useApi'
import type { SupportTicket, SupportMessage, CreateTicketDTO } from '~~/types/support'

export const useSupportChat = () => {
  const api = useApi()

  // Estado global reactivo durante la sesión
  const isOpen = useState<boolean>('support_chat_open', () => false)
  const currentTicket = useState<SupportTicket | null>('support_current_ticket', () => null)
  const isLoading = useState<boolean>('support_loading', () => false)
  const isSending = useState<boolean>('support_sending', () => false)
  const errorMessage = useState<string | null>('support_error', () => null)

  const hasActiveTicket = computed(() => {
    return currentTicket.value !== null &&
      (currentTicket.value.status === 'pending' || currentTicket.value.status === 'in_progress')
  })

  const isAssigned = computed(() => {
    return currentTicket.value?.status === 'in_progress' && currentTicket.value?.assigned_agent !== null
  })

  const openWidget = async () => {
    isOpen.value = true
    await fetchActiveTicket()
  }

  const closeWidget = () => {
    isOpen.value = false
  }

  const toggleWidget = async () => {
    if (!isOpen.value) {
      await openWidget()
    } else {
      closeWidget()
    }
  }

  /**
   * Consulta el ticket activo en curso del cliente desde el backend.
   */
  const fetchActiveTicket = async () => {
    isLoading.value = true
    errorMessage.value = null
    try {
      const response = await api.get<{
        data: SupportTicket | null
        has_active: boolean
      }>('/v1/support/active-ticket')

      currentTicket.value = response.data || null
    } catch (err: any) {
      // Si falla la conexión, no bloquear al usuario
      errorMessage.value = err.message || 'No fue posible sincronizar el ticket activo.'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Genera un nuevo ticket de soporte en la base de datos a través de la API.
   */
  const createTicket = async (title: string, category = 'soporte_tecnico', description = ''): Promise<boolean> => {
    isLoading.value = true
    errorMessage.value = null
    try {
      const payload: CreateTicketDTO = {
        title: title.trim(),
        category,
        description: description.trim() || undefined
      }

      const response = await api.post<{ data: SupportTicket }>('/v1/support/tickets', payload)
      currentTicket.value = response.data
      return true
    } catch (err: any) {
      errorMessage.value = err.message || 'No se pudo generar el ticket de soporte.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Envía un mensaje desde el cliente al chat del ticket activo en backend.
   */
  const sendMessage = async (text: string): Promise<boolean> => {
    if (!currentTicket.value || !text.trim()) return false

    isSending.value = true
    errorMessage.value = null
    try {
      const response = await api.post<{ data: SupportMessage }>(
        `/v1/support/tickets/${currentTicket.value.id}/messages`,
        { message: text.trim() }
      )

      if (!currentTicket.value.messages) {
        currentTicket.value.messages = []
      }

      if (response.data) {
        currentTicket.value.messages.push(response.data)
      }

      return true
    } catch (err: any) {
      errorMessage.value = err.message || 'Error al enviar el mensaje al chat.'
      return false
    } finally {
      isSending.value = false
    }
  }

  /**
   * Refresca los mensajes del ticket activo
   */
  const refreshMessages = async () => {
    if (!currentTicket.value) return

    try {
      const response = await api.get<{ data: SupportMessage[] }>(
        `/v1/support/tickets/${currentTicket.value.id}/messages`
      )

      if (currentTicket.value) {
        currentTicket.value.messages = response.data || []
      }
    } catch (err) {
      // Silencioso en sondeos periódicos
    }
  }

  /**
   * Reinicia la vista para permitir crear un nuevo ticket (si el actual no está activo).
   */
  const resetTicket = () => {
    currentTicket.value = null
    errorMessage.value = null
  }

  return {
    isOpen,
    currentTicket,
    isLoading,
    isSending,
    errorMessage,
    hasActiveTicket,
    isAssigned,
    openWidget,
    closeWidget,
    toggleWidget,
    fetchActiveTicket,
    createTicket,
    sendMessage,
    refreshMessages,
    resetTicket
  }
}
