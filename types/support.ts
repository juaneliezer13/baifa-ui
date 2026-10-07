export type SupportTicketStatus = 'pending' | 'in_progress' | 'finished' | 'cancelled'

export type SupportTicketCategory = 'soporte_tecnico' | 'logistica' | 'garantias' | 'otra_consulta'

export interface SupportAgent {
  id: number
  name: string
  email: string
  role: string
  role_label?: string
}

export interface SupportMessage {
  id: number | string
  ticket_id: number
  user_id?: number | null
  sender_name: string
  sender_type: 'client' | 'agent' | 'system'
  message: string
  created_at?: string
  timestamp?: string
}

export interface TicketLog {
  id: number
  ticket_id: number
  user_id?: number | null
  user_name?: string
  user_role?: string
  action: string
  previous_status?: string | null
  new_status?: string | null
  comment?: string | null
  metadata?: Record<string, unknown> | null
  created_at: string
}

export interface SupportTicket {
  id: number
  code: string
  title: string
  category: string
  category_label: string
  description?: string | null
  status: SupportTicketStatus
  status_label: string
  status_color: string
  final_comment?: string | null
  closed_at?: string | null
  user?: {
    id: number
    name: string
    email: string
  }
  client?: {
    id: number
    company_fiscal_name: string
    rif: string
  } | null
  assigned_agent?: SupportAgent | null
  created_at: string
  updated_at?: string
  messages_count?: number
  messages?: SupportMessage[]
  logs?: TicketLog[]
}

export interface CreateTicketDTO {
  title: string
  category?: string
  description?: string
}

export interface AssignTicketDTO {
  assigned_to_user_id?: number
  comment?: string
}

export interface UpdateTicketStatusDTO {
  status: SupportTicketStatus
  final_comment?: string
  comment?: string
}
