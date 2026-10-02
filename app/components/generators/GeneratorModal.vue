<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import type { GeneratorItem, GeneratorStatus, CreateGeneratorData, UpdateGeneratorData } from '~~/types/generator'
import type { ClientItem } from '~~/types/client'

const props = defineProps<{
  modelValue: boolean
  generatorToEdit: GeneratorItem | null
  isLoading: boolean
  fieldErrors?: Record<string, string[]>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', payload: { data: CreateGeneratorData | UpdateGeneratorData; photoFile: File | null }): void
}>()

const { clients, fetchClients } = useClients()

const serialNumber = ref('')
const model = ref('')
const name = ref('')
const capacityKva = ref<number | null>(null)
const clientId = ref<number | null>(null)
const status = ref<GeneratorStatus>('warehouse')
const estimatedArrivalDate = ref('')
const notes = ref('')

// Manejo de fotografía
const photoFile = ref<File | null>(null)
const photoPreview = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

const isEditing = computed(() => Boolean(props.generatorToEdit))

const statusOptions: { value: GeneratorStatus; label: string; icon: string; color: string }[] = [
  { value: 'warehouse', label: 'En Almacén', icon: 'mdi-warehouse', color: 'text-violet-400' },
  { value: 'in_transit', label: 'En Tránsito', icon: 'mdi-truck-fast-outline', color: 'text-sky-400' },
  { value: 'checkpoint', label: 'En Punto de Control', icon: 'mdi-map-marker-radius-outline', color: 'text-yellow-400' },
  { value: 'delivered', label: 'Entregado en Locación', icon: 'mdi-check-circle-outline', color: 'text-green-400' },
  { value: 'installed', label: 'Instalado y Operativo', icon: 'mdi-lightning-bolt-circle', color: 'text-emerald-300' }
]

onMounted(async () => {
  if (clients.value.length === 0) {
    await fetchClients({ status: 'active' })
  }
})

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen) {
      if (clients.value.length === 0) {
        await fetchClients({ status: 'active' })
      }

      if (props.generatorToEdit) {
        serialNumber.value = props.generatorToEdit.serial_number || ''
        model.value = props.generatorToEdit.model || ''
        name.value = props.generatorToEdit.name || ''
        capacityKva.value = props.generatorToEdit.capacity_kva ?? null
        clientId.value = props.generatorToEdit.client_id ?? null
        status.value = props.generatorToEdit.status || 'warehouse'
        estimatedArrivalDate.value = props.generatorToEdit.estimated_arrival_date || ''
        notes.value = props.generatorToEdit.notes || ''
        photoPreview.value = props.generatorToEdit.photo_url || null
        photoFile.value = null
      } else {
        serialNumber.value = ''
        model.value = ''
        name.value = ''
        capacityKva.value = null
        clientId.value = null
        status.value = 'warehouse'
        estimatedArrivalDate.value = ''
        notes.value = ''
        photoPreview.value = null
        photoFile.value = null
      }
    }
  },
  { immediate: true }
)

const handleSerialInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  serialNumber.value = target.value.toUpperCase()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    photoFile.value = file

    const reader = new FileReader()
    reader.onload = (e) => {
      photoPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const removePhoto = () => {
  photoFile.value = null
  photoPreview.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleSubmit = () => {
  const payload: CreateGeneratorData = {
    serial_number: serialNumber.value.trim().toUpperCase(),
    model: model.value.trim(),
    name: name.value.trim() || undefined,
    capacity_kva: capacityKva.value !== null && capacityKva.value !== undefined ? Number(capacityKva.value) : undefined,
    client_id: clientId.value ? Number(clientId.value) : undefined,
    status: status.value,
    estimated_arrival_date: estimatedArrivalDate.value || undefined,
    notes: notes.value.trim() || undefined
  }

  emit('save', {
    data: payload,
    photoFile: photoFile.value
  })
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="580"
    persistent
    @update:model-value="handleClose"
  >
    <div class="bg-[#0b1324] border border-slate-700/80 rounded-2xl p-6 text-slate-200 shadow-2xl relative overflow-hidden max-h-[92vh] flex flex-col">
      <!-- Encabezado del Modal -->
      <div class="flex items-center justify-between pb-4 border-b border-slate-800/80 shrink-0">
        <div>
          <h2 class="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <v-icon icon="mdi-flash-outline" size="22" class="text-[#3eb134]" />
            <span>{{ isEditing ? 'Editar Generador' : 'Registrar Nuevo Generador' }}</span>
          </h2>
          <p class="text-xs text-slate-400 mt-0.5">
            {{ isEditing ? 'Actualiza la ficha técnica y asignación del equipo' : 'Ingresa los datos de inventario y salida del generador' }}
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

      <!-- Formulario scrolleable -->
      <form class="space-y-4 pt-4 overflow-y-auto pr-1 flex-1" @submit.prevent="handleSubmit">
        <!-- Fila 1: Serial y Capacidad (kVA) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">
              Serial de Fábrica <span class="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              :value="serialNumber"
              placeholder="EJ: GEN-2026-0041"
              class="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-[#3eb134] focus:ring-1 focus:ring-[#3eb134] transition-all"
              @input="handleSerialInput"
            >
            <p v-if="fieldErrors?.serial_number" class="text-[11px] text-red-400 mt-1">
              {{ fieldErrors.serial_number[0] }}
            </p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">
              Capacidad (kVA)
            </label>
            <div class="relative">
              <input
                v-model.number="capacityKva"
                type="number"
                step="0.1"
                min="0"
                placeholder="EJ: 150"
                class="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#3eb134] focus:ring-1 focus:ring-[#3eb134] transition-all"
              >
              <span class="absolute right-3 top-2 text-xs text-slate-500 font-medium">kVA</span>
            </div>
            <p v-if="fieldErrors?.capacity_kva" class="text-[11px] text-red-400 mt-1">
              {{ fieldErrors.capacity_kva[0] }}
            </p>
          </div>
        </div>

        <!-- Fila 2: Modelo del Generador / Motor -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">
            Modelo / Tipo de Equipo <span class="text-red-400">*</span>
          </label>
          <input
            v-model="model"
            type="text"
            required
            placeholder="EJ: Cummins 150 kVA Silent Diésel"
            class="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#3eb134] focus:ring-1 focus:ring-[#3eb134] transition-all"
          >
          <p v-if="fieldErrors?.model" class="text-[11px] text-red-400 mt-1">
            {{ fieldErrors.model[0] }}
          </p>
        </div>

        <!-- Fila 3: Cliente Asignado y Estado Operativo -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">
              Cliente Asignado
            </label>
            <select
              v-model="clientId"
              class="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-[#3eb134] focus:ring-1 focus:ring-[#3eb134] transition-all cursor-pointer"
            >
              <option :value="null">-- Sin asignar (En stock Baifa) --</option>
              <option v-for="client in clients" :key="client.id" :value="client.id">
                {{ client.company_short_name }} ({{ client.rif }})
              </option>
            </select>
            <p v-if="fieldErrors?.client_id" class="text-[11px] text-red-400 mt-1">
              {{ fieldErrors.client_id[0] }}
            </p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">
              Estado Logístico <span class="text-red-400">*</span>
            </label>
            <select
              v-model="status"
              required
              class="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-[#3eb134] focus:ring-1 focus:ring-[#3eb134] transition-all cursor-pointer"
            >
              <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
            <p v-if="fieldErrors?.status" class="text-[11px] text-red-400 mt-1">
              {{ fieldErrors.status[0] }}
            </p>
          </div>
        </div>

        <!-- Fila 4: Fecha Estimada de Llegada (ETA) -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">
            Fecha Estimada de Llegada (ETA)
          </label>
          <input
            v-model="estimatedArrivalDate"
            type="date"
            class="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-[#3eb134] focus:ring-1 focus:ring-[#3eb134] transition-all"
          >
          <p v-if="fieldErrors?.estimated_arrival_date" class="text-[11px] text-red-400 mt-1">
            {{ fieldErrors.estimated_arrival_date[0] }}
          </p>
        </div>

        <!-- Fila 5: Fotografía Referencial del Generador con Preview -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">
            Fotografía Referencial del Equipo
          </label>

          <input
            ref="fileInputRef"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="hidden"
            @change="handleFileSelect"
          >

          <div
            v-if="!photoPreview"
            class="border-2 border-dashed border-slate-700 hover:border-[#3eb134]/70 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-900/50 hover:bg-slate-900/80 group"
            @click="triggerFileInput"
          >
            <v-icon icon="mdi-camera-plus-outline" size="28" class="text-slate-500 group-hover:text-[#3eb134] mb-1 transition-colors" />
            <p class="text-xs text-slate-300 font-medium">Haz clic para cargar una fotografía</p>
            <p class="text-[11px] text-slate-500 mt-0.5">Formatos admitidos: JPEG, PNG o WebP (Máx. 5 MB)</p>
          </div>

          <div v-else class="relative rounded-xl border border-slate-700 overflow-hidden bg-slate-950 flex items-center justify-center group">
            <img
              :src="photoPreview"
              alt="Previsualización del generador"
              class="w-full h-44 object-contain bg-[#070b14]"
            >
            <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-medium hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer"
                @click="triggerFileInput"
              >
                <v-icon icon="mdi-folder-image" size="16" />
                <span>Cambiar</span>
              </button>
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg bg-red-600/90 text-white text-xs font-medium hover:bg-red-500 flex items-center gap-1.5 cursor-pointer"
                @click="removePhoto"
              >
                <v-icon icon="mdi-trash-can-outline" size="16" />
                <span>Quitar</span>
              </button>
            </div>
          </div>
          <p v-if="fieldErrors?.photo" class="text-[11px] text-red-400 mt-1">
            {{ fieldErrors.photo[0] }}
          </p>
        </div>

        <!-- Fila 6: Notas de ingreso u observaciones -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">
            Notas de Ingreso / Observaciones
          </label>
          <textarea
            v-model="notes"
            rows="2"
            placeholder="Información adicional del equipo, condiciones de entrega, placa o transportista..."
            class="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#3eb134] focus:ring-1 focus:ring-[#3eb134] transition-all resize-none"
          />
        </div>

        <!-- Botones de Acción -->
        <div class="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-3 shrink-0">
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
            <v-icon v-else :icon="isEditing ? 'mdi-check' : 'mdi-plus'" size="16" />
            <span>{{ isLoading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Registrar Generador') }}</span>
          </button>
        </div>
      </form>
    </div>
  </v-dialog>
</template>
