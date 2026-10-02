<script setup lang="ts">
import { ref, watch } from 'vue'
import type { GeneratorItem, GeneratorStatus } from '~~/types/generator'

const props = defineProps<{
  modelValue: boolean
  generator: GeneratorItem | null
  isLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'updateStatus', payload: {
    id: number
    status: GeneratorStatus
    checkpoint_name: string
    checkpointName?: string
    event_date?: string
    notes?: string
  }): void
}>()

const newStatus = ref<GeneratorStatus>('in_transit')
const checkpointName = ref('')
const eventDate = ref('')
const notes = ref('')

const statusOptions: { value: GeneratorStatus; label: string; icon: string; defaultCheckpoint: string }[] = [
  { value: 'warehouse', label: 'En Almacén', icon: 'mdi-warehouse', defaultCheckpoint: 'Almacén Central Valencia' },
  { value: 'in_transit', label: 'En Tránsito', icon: 'mdi-truck-fast-outline', defaultCheckpoint: 'Despacho en Ruta' },
  { value: 'checkpoint', label: 'En Punto de Control', icon: 'mdi-map-marker-radius-outline', defaultCheckpoint: 'Punto de Control en Ruta' },
  { value: 'delivered', label: 'Entregado en Locación', icon: 'mdi-check-circle-outline', defaultCheckpoint: 'Entrega en Locación del Cliente' },
  { value: 'installed', label: 'Instalado y Operativo', icon: 'mdi-lightning-bolt-circle', defaultCheckpoint: 'Instalación y Puesta en Servicio' }
]

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen && props.generator) {
      newStatus.value = props.generator.status || 'warehouse'
      checkpointName.value = ''
      eventDate.value = ''
      notes.value = props.generator.notes || ''
    }
  },
  { immediate: true }
)

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleSubmit = () => {
  if (!props.generator) return

  const defaultOption = statusOptions.find(o => o.value === newStatus.value)
  const resolvedName = checkpointName.value.trim() || defaultOption?.defaultCheckpoint || 'Punto de Control'

  emit('updateStatus', {
    id: props.generator.id,
    status: newStatus.value,
    checkpoint_name: resolvedName,
    checkpointName: resolvedName,
    event_date: eventDate.value ? eventDate.value.replace('T', ' ') : undefined,
    notes: notes.value.trim() || undefined
  })
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="480"
    persistent
    @update:model-value="handleClose"
  >
    <div class="bg-[#0b1324] border border-slate-700/80 rounded-2xl p-6 text-slate-200 shadow-2xl relative">
      <!-- Encabezado -->
      <div class="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div>
          <h2 class="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <v-icon icon="mdi-map-marker-path" size="22" class="text-yellow-400" />
            <span>Actualizar Estado Logístico</span>
          </h2>
          <p class="text-xs text-slate-400 mt-0.5">
            Generador: <span class="font-mono text-white font-semibold">{{ generator?.serial_number }}</span>
          </p>
        </div>
        <button
          type="button"
          class="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          @click="handleClose"
        >
          <v-icon icon="mdi-close" size="18" />
        </button>
      </div>

      <!-- Formulario -->
      <form class="space-y-4 pt-4" @submit.prevent="handleSubmit">
        <!-- Nuevo Estado -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">
            Nuevo Estado <span class="text-red-400">*</span>
          </label>
          <select
            v-model="newStatus"
            required
            class="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-[#3eb134] focus:ring-1 focus:ring-[#3eb134] transition-all cursor-pointer"
          >
            <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <!-- Nombre del Punto de Control -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">
            Nombre del Punto de Control / Hito Logístico <span class="text-red-400">*</span>
          </label>
          <input
            v-model="checkpointName"
            type="text"
            required
            placeholder="Ej: Almacén Valencia, Alcabala Guacara, Puerto Cabello..."
            class="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#3eb134] focus:ring-1 focus:ring-[#3eb134] transition-all"
          >
        </div>

        <!-- Fecha y Hora del Evento -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">
            Fecha y Hora del Evento <span class="text-slate-500 font-normal">(opcional)</span>
          </label>
          <input
            v-model="eventDate"
            type="datetime-local"
            class="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#3eb134] focus:ring-1 focus:ring-[#3eb134] transition-all"
          >
          <p class="text-[11px] text-slate-500 mt-1">Si se omite, se registrará con la fecha y hora de este instante.</p>
        </div>

        <!-- Notas del cambio de estado -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">
            Notas del Avance / Observaciones <span class="text-slate-500 font-normal">(opcional)</span>
          </label>
          <textarea
            v-model="notes"
            rows="3"
            placeholder="Transportista, placa de vehículo, chofer, novedades en ruta..."
            class="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#3eb134] focus:ring-1 focus:ring-[#3eb134] transition-all resize-none"
          />
        </div>

        <!-- Botones de Acción -->
        <div class="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-3">
          <button
            type="button"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
            @click="handleClose"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="isLoading"
            class="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#3eb134] hover:bg-[#349e2e] active:scale-[0.99] transition-all shadow-md shadow-[#3eb134]/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            <v-progress-circular
              v-if="isLoading"
              indeterminate
              size="16"
              width="2"
              color="white"
            />
            <v-icon v-else icon="mdi-check" size="16" />
            <span>{{ isLoading ? 'Actualizando...' : 'Actualizar Estado' }}</span>
          </button>
        </div>
      </form>
    </div>
  </v-dialog>
</template>
