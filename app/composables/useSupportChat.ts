import { ref, computed } from 'vue'
import type { SupportTicket, SupportMessage, SupportAgent } from '~~/types/support'

// Agente de soporte predeterminado para simulación en frontend
const DEFAULT_AGENT: SupportAgent = {
  id: 104,
  name: 'Carlos Ramírez',
  role: 'Especialista Técnico Helpdesk',
  avatarInitials: 'CR',
  status: 'online'
}

// Respuestas simuladas contextuales para soporte estático
const MOCK_AGENT_REPLIES = [
  'Comprendo perfectamente tu situación. Estoy revisando la telemetría y los registros asociados en el sistema.',
  'Gracias por los detalles. He tomado nota y estamos coordinando con el equipo de operaciones en sitio.',
  '¿El generador presenta alguna luz indicadora o alarma en el panel Deep Sea / SmartGen?',
  'Excelente, procedo a registrar este apunte en la bitácora técnica de tu equipo.'
]

export const useSupportChat = () => {
  // Estado global reactivo para el cliente durante la sesión
  const isOpen = useState<boolean>('support_chat_open', () => false)
  const currentTicket = useState<SupportTicket | null>('support_current_ticket', () => null)
  const isAgentTyping = useState<boolean>('support_agent_typing', () => false)
  const isAutoAssigning = useState<boolean>('support_auto_assigning', () => false)

  const hasActiveTicket = computed(() => currentTicket.value !== null)
  const isAssigned = computed(() => {
    return currentTicket.value?.status === 'assigned' || currentTicket.value?.status === 'in_progress'
  })

  const openWidget = () => {
    isOpen.value = true
  }

  const closeWidget = () => {
    isOpen.value = false
  }

  const toggleWidget = () => {
    isOpen.value = !isOpen.value
  }

  const formatCurrentTime = (): string => {
    const now = new Date()
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  /**
   * Crea un ticket de soporte internamente a partir del título suministrado.
   * Inicialmente queda en estado 'pending_assignment' a la espera de que el
   * helpdesk interno del administrador le asigne un operador.
   */
  const createTicket = (title: string, category = 'General', description = '') => {
    const ticketCode = `TKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
    const timestamp = formatCurrentTime()

    const initialMessages: SupportMessage[] = [
      {
        id: `msg-${Date.now()}-1`,
        sender: 'system',
        senderName: 'Sistema BaiFa',
        text: `Ticket #${ticketCode} creado con éxito: "${title.trim()}". Tu solicitud está en cola del Helpdesk Interno.`,
        timestamp
      }
    ]

    currentTicket.value = {
      id: `ticket-${Date.now()}`,
      code: ticketCode,
      title: title.trim(),
      category,
      description: description.trim(),
      status: 'pending_assignment',
      clientName: 'Cliente BaiFa',
      createdAt: timestamp,
      messages: initialMessages
    }
  }

  /**
   * Simula la asignación de un empleado/operador al ticket por parte del Helpdesk / Admin.
   * Una vez asignado, se abre la sala de chat activa con el empleado.
   */
  const assignEmployee = (agent: SupportAgent = DEFAULT_AGENT) => {
    if (!currentTicket.value) return

    currentTicket.value.status = 'assigned'
    currentTicket.value.assignedAgent = agent

    const timestamp = formatCurrentTime()

    // Notificación del sistema de operador asignado
    currentTicket.value.messages.push({
      id: `msg-${Date.now()}-assign`,
      sender: 'system',
      senderName: 'Helpdesk',
      text: `${agent.name} (${agent.role}) ha sido asignado a tu consulta. El chat en vivo está ahora abierto.`,
      timestamp
    })

    // Saludo inicial del agente
    isAgentTyping.value = true
    setTimeout(() => {
      if (currentTicket.value) {
        currentTicket.value.messages.push({
          id: `msg-${Date.now()}-welcome`,
          sender: 'agent',
          senderName: agent.name,
          text: `¡Hola! Soy ${agent.name} de soporte técnico BaiFa Power. Estoy atendiendo tu caso sobre "${currentTicket.value.title}". ¿Podrías indicarme más detalles o número de serial de tu equipo si aplica?`,
          timestamp: formatCurrentTime()
        })
      }
      isAgentTyping.value = false
    }, 1000)
  }

  /**
   * Envía un mensaje desde el cliente al chat activo.
   */
  const sendMessage = (text: string) => {
    if (!currentTicket.value || !text.trim() || !isAssigned.value) return

    const timestamp = formatCurrentTime()
    currentTicket.value.messages.push({
      id: `msg-${Date.now()}`,
      sender: 'client',
      senderName: 'Tú',
      text: text.trim(),
      timestamp
    })

    // Simulación de respuesta interactiva del agente en frontend
    isAgentTyping.value = true
    setTimeout(() => {
      if (currentTicket.value && isAssigned.value) {
        const randomReply = MOCK_AGENT_REPLIES[Math.floor(Math.random() * MOCK_AGENT_REPLIES.length)]
        currentTicket.value.messages.push({
          id: `msg-${Date.now()}-reply`,
          sender: 'agent',
          senderName: currentTicket.value.assignedAgent?.name || 'Soporte',
          text: randomReply,
          timestamp: formatCurrentTime()
        })
      }
      isAgentTyping.value = false
    }, 1800)
  }

  /**
   * Reinicia o finaliza el ticket actual para permitir una nueva consulta.
   */
  const resetTicket = () => {
    currentTicket.value = null
    isAgentTyping.value = false
    isAutoAssigning.value = false
  }

  return {
    isOpen,
    currentTicket,
    isAgentTyping,
    isAutoAssigning,
    hasActiveTicket,
    isAssigned,
    openWidget,
    closeWidget,
    toggleWidget,
    createTicket,
    assignEmployee,
    sendMessage,
    resetTicket
  }
}
