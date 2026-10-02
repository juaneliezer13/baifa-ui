import { ref } from 'vue'
import type {
  GeneratorItem,
  CheckpointItem,
  CreateCheckpointData
} from '~~/types/generator'
import type { ApiErrorResponse } from '~~/types/auth'

export const useTracking = () => {
  const api = useApi()

  const trackedGenerator = ref<GeneratorItem | null>(null)
  const checkpoints = ref<CheckpointItem[]>([])
  const isLoading = ref(false)
  const isSavingCheckpoint = ref(false)
  const searchError = ref('')
  const successMessage = ref('')

  const clearMessages = () => {
    searchError.value = ''
    successMessage.value = ''
  }

  const clearTracking = () => {
    trackedGenerator.value = null
    checkpoints.value = []
    clearMessages()
  }

  /**
   * Consulta pública/privada de trazabilidad por serial de fábrica
   */
  const trackBySerial = async (serialNumber: string): Promise<GeneratorItem | null> => {
    const trimmedSerial = serialNumber.trim()
    if (!trimmedSerial) {
      searchError.value = 'Por favor, ingresa el serial del generador.'
      return null
    }

    isLoading.value = true
    clearMessages()

    try {
      const response = await api.get<{ generator: any }>(`/v1/tracking/${encodeURIComponent(trimmedSerial)}`)
      const g = response.generator

      if (!g) {
        searchError.value = `No se encontró ningún generador registrado con el serial: ${trimmedSerial}`
        trackedGenerator.value = null
        checkpoints.value = []
        return null
      }

      // Mapear generador
      const mappedGen: GeneratorItem = {
        id: Number(g.id),
        serial_number: g.serial_number,
        serial: g.serial_number,
        name: g.name || null,
        model: g.model,
        capacity_kva: g.capacity_kva !== null && g.capacity_kva !== undefined ? Number(g.capacity_kva) : null,
        capacityKva: g.capacity_kva !== null && g.capacity_kva !== undefined ? Number(g.capacity_kva) : null,
        status: g.status,
        status_label: g.status_label,
        status_color: g.status_color,
        client_id: g.client_id ? Number(g.client_id) : null,
        client: g.client ? {
          id: Number(g.client.id),
          company_fiscal_name: g.client.company_fiscal_name,
          company_short_name: g.client.company_short_name,
          rif: g.client.rif,
          contact_name: g.client.contact_name,
          contact_phone: g.client.contact_phone || null
        } : null,
        estimated_arrival_date: g.estimated_arrival_date || null,
        estimatedArrival: g.estimated_arrival_date || '',
        photo_path: g.photo_path || null,
        photo_url: g.photo_url || null,
        notes: g.notes || null,
        created_at: g.created_at || '',
        updated_at: g.updated_at || '',
        checkpoints: Array.isArray(g.checkpoints) ? g.checkpoints : []
      }

      trackedGenerator.value = mappedGen
      checkpoints.value = mappedGen.checkpoints || []

      return trackedGenerator.value
    } catch (err: unknown) {
      const apiErr = err as ApiErrorResponse
      trackedGenerator.value = null
      checkpoints.value = []

      if (apiErr.statusCode === 404) {
        searchError.value = `No se encontró ningún generador registrado con el serial: ${trimmedSerial}`
      } else if (apiErr.statusCode === 403) {
        searchError.value = 'No tienes autorización para consultar la trazabilidad de este equipo.'
      } else {
        searchError.value = apiErr.message || 'Error al consultar el rastreo del generador.'
      }

      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Obtiene la lista cronológica de checkpoints para un generador
   */
  const fetchCheckpoints = async (generatorId: number): Promise<CheckpointItem[]> => {
    isLoading.value = true
    try {
      const response = await api.get<any>(`/v1/generators/${generatorId}/checkpoints`)
      const list = Array.isArray(response) ? response : (response.data || [])
      checkpoints.value = list
      return checkpoints.value
    } catch (err: unknown) {
      const apiErr = err as ApiErrorResponse
      searchError.value = apiErr.message || 'Error al obtener los puntos de control del equipo.'
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Registra un nuevo punto de control inmutable (Etapa 3 / Etapa 4)
   */
  const addCheckpoint = async (
    generatorId: number,
    data: CreateCheckpointData
  ): Promise<{ success: boolean; message?: string; checkpoint?: CheckpointItem }> => {
    isSavingCheckpoint.value = true
    clearMessages()

    try {
      const response = await api.post<any>(`/v1/generators/${generatorId}/checkpoints`, {
        status: data.status,
        checkpoint_name: data.checkpoint_name,
        event_date: data.event_date || undefined,
        notes: data.notes || undefined
      })

      successMessage.value = response.message || 'Punto de control registrado exitosamente.'

      // Actualizar el generador en seguimiento y su lista de checkpoints
      if (response.generator && trackedGenerator.value && trackedGenerator.value.id === generatorId) {
        trackedGenerator.value.status = response.generator.status
        trackedGenerator.value.status_label = response.generator.status_label
        trackedGenerator.value.status_color = response.generator.status_color
        if (response.generator.notes) {
          trackedGenerator.value.notes = response.generator.notes
        }
      }

      if (response.checkpoint) {
        checkpoints.value.push(response.checkpoint)
      } else {
        await fetchCheckpoints(generatorId)
      }

      return {
        success: true,
        message: successMessage.value,
        checkpoint: response.checkpoint
      }
    } catch (err: unknown) {
      const apiErr = err as ApiErrorResponse
      searchError.value = apiErr.message || 'Error al registrar el punto de control.'
      return {
        success: false,
        message: searchError.value
      }
    } finally {
      isSavingCheckpoint.value = false
    }
  }

  return {
    trackedGenerator,
    checkpoints,
    isLoading,
    isSavingCheckpoint,
    searchError,
    successMessage,
    clearMessages,
    clearTracking,
    trackBySerial,
    fetchCheckpoints,
    addCheckpoint
  }
}
