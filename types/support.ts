export type SupportTicketStatus = 'pending_assignment' | 'assigned' | 'in_progress' | 'resolved'

export interface SupportAgent {
  id: number
  name: string
  role: string
  avatarInitials: string
  status: 'online' | 'offline'
}

export interface SupportMessage {
  id: string
  sender: 'client' | 'agent' | 'system'
  senderName: string
  text: string
  timestamp: string
}

export interface SupportTicket {
  id: string
  code: string
  title: string
  category: string
  description?: string
  status: SupportTicketStatus
  clientName: string
  assignedAgent?: SupportAgent
  createdAt: string
  messages: SupportMessage[]
}
