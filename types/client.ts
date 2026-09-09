/**
 * Estándar TypeScript 2026 - Directorio Fiscal de Clientes
 */

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
