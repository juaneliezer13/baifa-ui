/**
 * Estándar TypeScript 2026 - Catálogo de Generadores y Checkpoints
 */

export type GeneratorStatus = 'warehouse' | 'in_transit' | 'checkpoint' | 'delivered' | 'installed'

export interface GeneratorItem {
  id: number
  serial: string
  clientId: number
  clientName?: string
  status: GeneratorStatus
  estimatedArrival: string
  photoUrl?: string | null
  model?: string
  capacityKva?: number
  notes?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface CheckpointEvent {
  id: number
  generatorId: number
  status: GeneratorStatus
  checkpointName: string
  notes?: string | null
  changedBy: string
  changedAt: string
}
