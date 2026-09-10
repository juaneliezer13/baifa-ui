/**
 * Directorio Fiscal de Clientes - Tipos TypeScript para BaiFa
 */

export interface ClientUserSummary {
  id: number
  name: string
  email: string
}

export interface ClientItem {
  id: number
  company_fiscal_name: string
  company_short_name: string
  rif: string
  office_phone?: string | null
  contact_name: string
  contact_email: string
  contact_phone?: string | null
  is_active: boolean
  status: 'active' | 'inactive'
  status_label: string
  user_id?: number | null
  user?: ClientUserSummary | null
  registered_date?: string
  created_at?: string
  updated_at?: string
}

export interface CreateClientData {
  company_fiscal_name: string
  company_short_name: string
  rif: string
  office_phone?: string
  contact_name: string
  contact_email: string
  contact_phone?: string
  is_active?: boolean
}

export type UpdateClientData = Partial<CreateClientData>

export interface ClientFilters {
  search?: string
  status?: 'all' | 'active' | 'inactive'
}

// Interfaces de compatibilidad
export interface ContactPerson {
  name: string
  email: string
  phone: string
}

export interface ClientFiscal {
  id: number
  companyFiscalName: string
  companyShortName: string
  rif: string
  officePhone: string
  contact: ContactPerson
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export type CreateClientFiscalDTO = Omit<ClientFiscal, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateClientFiscalDTO = Partial<CreateClientFiscalDTO>
