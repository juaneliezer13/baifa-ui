/**
 * Estándar TypeScript 2026 - Catálogo de Generadores y Checkpoints para BaiFa Power
 */

export type GeneratorStatus = 'warehouse' | 'in_transit' | 'checkpoint' | 'delivered' | 'installed'

export interface GeneratorClientSummary {
  id: number
  company_fiscal_name: string
  company_short_name: string
  rif: string
  contact_name: string
  contact_phone?: string | null
}

export interface GeneratorItem {
  id: number
  serial_number: string
  serial?: string // Compatibilidad
  name?: string | null
  model: string
  capacity_kva?: number | null
  capacityKva?: number | null // Compatibilidad
  status: GeneratorStatus
  status_label?: string
  status_color?: string
  client_id?: number | null
  clientId?: number | null // Compatibilidad
  client?: GeneratorClientSummary | null
  estimated_arrival_date?: string | null
  estimatedArrival?: string // Compatibilidad
  photo_path?: string | null
  photo_url?: string | null
  notes?: string | null
  checkpoints?: CheckpointItem[]
  latest_checkpoint?: CheckpointItem | null
  is_public_view?: boolean
  requires_auth_for_details?: boolean
  created_at?: string
  updated_at?: string
}

export interface CreateGeneratorData {
  serial_number: string
  client_id?: number | null
  name?: string
  model: string
  capacity_kva?: number | null
  status?: GeneratorStatus
  estimated_arrival_date?: string | null
  photo?: File | null
  notes?: string | null
}

export type UpdateGeneratorData = Partial<CreateGeneratorData>

export interface GeneratorSummaryMetrics {
  total: number
  warehouse: number
  in_transit: number
  checkpoint: number
  delivered: number
  installed: number
}

export interface GeneratorFilters {
  search?: string
  status?: 'all' | GeneratorStatus
  client_id?: number
}

export interface CheckpointItem {
  id: number
  generator_id: number
  status: GeneratorStatus
  status_label: string
  status_color: string
  checkpoint_name: string
  event_date?: string | null
  event_date_iso?: string | null
  notes?: string | null
  user_id?: number | null
  changed_by?: string
  changed_by_role?: string
  is_verified?: boolean
  created_at?: string
}

export interface CreateCheckpointData {
  status: GeneratorStatus
  checkpoint_name: string
  event_date?: string | null
  notes?: string | null
}

export interface CheckpointEvent {
  id: number
  generator_id: number
  status: GeneratorStatus
  checkpoint_name: string
  notes?: string | null
  changed_by: string
  changed_at: string
}
