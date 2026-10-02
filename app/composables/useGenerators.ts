import { ref } from 'vue'
import type {
  GeneratorItem,
  CreateGeneratorData,
  UpdateGeneratorData,
  GeneratorFilters,
  GeneratorSummaryMetrics,
  GeneratorStatus,
  CreateCheckpointData,
  CheckpointItem
} from '~~/types/generator'
import type { ApiErrorResponse } from '~~/types/auth'

export const useGenerators = () => {
  const api = useApi()

  const generators = ref<GeneratorItem[]>([])
  const summary = ref<GeneratorSummaryMetrics>({
    total: 0,
    warehouse: 0,
    in_transit: 0,
    checkpoint: 0,
    delivered: 0,
    installed: 0
  })

  const isLoading = ref(false)
  const isSaving = ref(false)
  const isDeleting = ref(false)
  const errorMessage = ref('')
  const fieldErrors = ref<Record<string, string[]> | undefined>(undefined)
  const successMessage = ref('')

  const clearMessages = () => {
    errorMessage.value = ''
    fieldErrors.value = undefined
    successMessage.value = ''
  }

  /**
   * Helper para obtener la configuración visual y texto de cada estado acorde a Figma
   */
  const getStatusConfig = (status: GeneratorStatus | string) => {
    switch (status) {
      case 'warehouse':
        return {
          label: 'En Almacén',
          color: 'violet',
          bgClass: 'bg-violet-500/10 border border-violet-500/20 text-violet-400',
          chipColor: 'deep-purple-darken-1',
          icon: 'mdi-warehouse'
        }
      case 'in_transit':
        return {
          label: 'En Tránsito',
          color: 'sky',
          bgClass: 'bg-sky-500/10 border border-sky-500/20 text-sky-400',
          chipColor: 'light-blue-darken-1',
          icon: 'mdi-truck-fast-outline'
        }
      case 'checkpoint':
        return {
          label: 'En Punto de Control',
          color: 'yellow',
          bgClass: 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400',
          chipColor: 'amber-darken-2',
          icon: 'mdi-map-marker-radius-outline'
        }
      case 'delivered':
        return {
          label: 'Entregado en Locación',
          color: 'green',
          bgClass: 'bg-green-500/10 border border-green-500/20 text-green-400',
          chipColor: 'green-darken-1',
          icon: 'mdi-check-circle-outline'
        }
      case 'installed':
        return {
          label: 'Instalado y Operativo',
          color: 'emerald',
          bgClass: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300',
          chipColor: 'emerald-darken-2',
          icon: 'mdi-lightning-bolt-circle'
        }
      default:
        return {
          label: status,
          color: 'slate',
          bgClass: 'bg-slate-500/10 border border-slate-500/20 text-slate-400',
          chipColor: 'grey',
          icon: 'mdi-help-circle-outline'
        }
    }
  }

  /**
   * Obtiene el listado de generadores desde la API
   */
  const fetchGenerators = async (filters: GeneratorFilters = {}): Promise<GeneratorItem[]> => {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const params: Record<string, any> = {}
      if (filters.search) params.search = filters.search
      if (filters.status && filters.status !== 'all') params.status = filters.status
      if (filters.client_id) params.client_id = filters.client_id

      const response = await api.get<any>('/v1/generators', params)
      const list = Array.isArray(response) ? response : (response.data || [])

      generators.value = list.map((g: any) => ({
        id: Number(g.id),
        serial_number: g.serial_number,
        serial: g.serial_number,
        name: g.name || null,
        model: g.model,
        capacity_kva: g.capacity_kva !== null && g.capacity_kva !== undefined ? Number(g.capacity_kva) : null,
        capacityKva: g.capacity_kva !== null && g.capacity_kva !== undefined ? Number(g.capacity_kva) : null,
        status: g.status as GeneratorStatus,
        status_label: g.status_label || getStatusConfig(g.status).label,
        status_color: g.status_color || getStatusConfig(g.status).color,
        client_id: g.client_id ? Number(g.client_id) : null,
        clientId: g.client_id ? Number(g.client_id) : null,
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
        updated_at: g.updated_at || ''
      }))

      return generators.value
    } catch (err: unknown) {
      const apiErr = err as ApiErrorResponse
      errorMessage.value = apiErr.message || 'Error al cargar el catálogo de generadores.'
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Obtiene el resumen de métricas numéricas por estado
   */
  const fetchSummary = async (): Promise<GeneratorSummaryMetrics> => {
    try {
      const response = await api.get<any>('/v1/generators/summary')
      summary.value = {
        total: Number(response.total || 0),
        warehouse: Number(response.warehouse || 0),
        in_transit: Number(response.in_transit || 0),
        checkpoint: Number(response.checkpoint || 0),
        delivered: Number(response.delivered || 0),
        installed: Number(response.installed || 0)
      }
      return summary.value
    } catch (err: unknown) {
      // Fallback local calculando a partir de la lista cargada
      const total = generators.value.length
      const counts = { warehouse: 0, in_transit: 0, checkpoint: 0, delivered: 0, installed: 0 }
      generators.value.forEach(g => {
        if (g.status in counts) {
          counts[g.status as keyof typeof counts]++
        }
      })
      summary.value = { total, ...counts }
      return summary.value
    }
  }

  /**
   * Registra un nuevo generador eléctrico en el catálogo
   */
  const createGenerator = async (
    data: CreateGeneratorData | FormData
  ): Promise<{ success: boolean; message?: string; generator?: GeneratorItem }> => {
    isSaving.value = true
    clearMessages()

    try {
      let body: any = data

      // Si es objeto plano y contiene archivo photo, convertir a FormData
      if (!(data instanceof FormData)) {
        const formData = new FormData()
        formData.append('serial_number', data.serial_number)
        formData.append('model', data.model)
        if (data.name) formData.append('name', data.name)
        if (data.capacity_kva !== null && data.capacity_kva !== undefined) {
          formData.append('capacity_kva', String(data.capacity_kva))
        }
        if (data.status) formData.append('status', data.status)
        if (data.client_id) formData.append('client_id', String(data.client_id))
        if (data.estimated_arrival_date) formData.append('estimated_arrival_date', data.estimated_arrival_date)
        if (data.notes) formData.append('notes', data.notes)
        if (data.photo) formData.append('photo', data.photo)
        body = formData
      }

      const response = await api.post<any>('/v1/generators', body)
      const created = response.generator || response.data || response

      successMessage.value = response.message || 'Generador registrado exitosamente.'
      await fetchGenerators()
      await fetchSummary()

      return {
        success: true,
        message: successMessage.value,
        generator: created
      }
    } catch (err: unknown) {
      const apiErr = err as ApiErrorResponse
      errorMessage.value = apiErr.message || 'No fue posible registrar el generador.'
      fieldErrors.value = apiErr.errors

      return {
        success: false,
        message: errorMessage.value
      }
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Actualiza los datos o imagen de un generador existente
   */
  const updateGenerator = async (
    id: number,
    data: UpdateGeneratorData | FormData
  ): Promise<{ success: boolean; message?: string; generator?: GeneratorItem }> => {
    isSaving.value = true
    clearMessages()

    try {
      let body: any = data

      if (!(data instanceof FormData)) {
        const formData = new FormData()
        if (data.serial_number) formData.append('serial_number', data.serial_number)
        if (data.model) formData.append('model', data.model)
        if (data.name !== undefined) formData.append('name', data.name || '')
        if (data.capacity_kva !== undefined) {
          formData.append('capacity_kva', data.capacity_kva !== null ? String(data.capacity_kva) : '')
        }
        if (data.status) formData.append('status', data.status)
        if (data.client_id !== undefined) {
          formData.append('client_id', data.client_id ? String(data.client_id) : '')
        }
        if (data.estimated_arrival_date !== undefined) {
          formData.append('estimated_arrival_date', data.estimated_arrival_date || '')
        }
        if (data.notes !== undefined) formData.append('notes', data.notes || '')
        if (data.photo) formData.append('photo', data.photo)
        body = formData
      }

      // En Laravel, peticiones multipart con PUT a veces requieren POST con _method=PUT o POST directo
      const response = await api.post<any>(`/v1/generators/${id}`, body)
      const updated = response.generator || response.data || response

      successMessage.value = response.message || 'Generador actualizado exitosamente.'
      await fetchGenerators()
      await fetchSummary()

      return {
        success: true,
        message: successMessage.value,
        generator: updated
      }
    } catch (err: unknown) {
      const apiErr = err as ApiErrorResponse
      errorMessage.value = apiErr.message || 'No fue posible actualizar el generador.'
      fieldErrors.value = apiErr.errors

      return {
        success: false,
        message: errorMessage.value
      }
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Elimina un generador del catálogo
   */
  const deleteGenerator = async (id: number): Promise<{ success: boolean; message?: string }> => {
    isDeleting.value = true
    clearMessages()

    try {
      const response = await api.delete<any>(`/v1/generators/${id}`)
      successMessage.value = response.message || 'Generador eliminado exitosamente.'

      generators.value = generators.value.filter(g => g.id !== id)
      await fetchSummary()

      return { success: true, message: successMessage.value }
    } catch (err: unknown) {
      const apiErr = err as ApiErrorResponse
      errorMessage.value = apiErr.message || 'Error al eliminar el generador.'
      return { success: false, message: errorMessage.value }
    } finally {
      isDeleting.value = false
    }
  }

  /**
   * Registra un nuevo punto de control (avance de ruta) y actualiza el estado del generador
   */
  const addCheckpoint = async (
    generatorId: number,
    data: CreateCheckpointData
  ): Promise<{ success: boolean; message?: string; checkpoint?: CheckpointItem }> => {
    isSaving.value = true
    clearMessages()

    try {
      const response = await api.post<any>(`/v1/generators/${generatorId}/checkpoints`, {
        status: data.status,
        checkpoint_name: data.checkpoint_name,
        event_date: data.event_date || undefined,
        notes: data.notes || undefined
      })

      successMessage.value = response.message || 'Punto de control registrado exitosamente.'
      await fetchGenerators()
      await fetchSummary()

      return {
        success: true,
        message: successMessage.value,
        checkpoint: response.checkpoint
      }
    } catch (err: unknown) {
      const apiErr = err as ApiErrorResponse
      errorMessage.value = apiErr.message || 'No fue posible registrar el punto de control.'
      fieldErrors.value = apiErr.errors

      return {
        success: false,
        message: errorMessage.value
      }
    } finally {
      isSaving.value = false
    }
  }

  return {
    generators,
    summary,
    isLoading,
    isSaving,
    isDeleting,
    errorMessage,
    fieldErrors,
    successMessage,
    clearMessages,
    getStatusConfig,
    fetchGenerators,
    fetchSummary,
    createGenerator,
    updateGenerator,
    deleteGenerator,
    addCheckpoint
  }
}
