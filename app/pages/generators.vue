<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGenerators } from '~/composables/useGenerators'
import { useAuth } from '~/composables/useAuth'
import GeneratorModal from '~/components/generators/GeneratorModal.vue'
import GeneratorDeleteModal from '~/components/generators/GeneratorDeleteModal.vue'
import GeneratorStatusModal from '~/components/generators/GeneratorStatusModal.vue'
import GeneratorStatusBadge from '~/components/generators/GeneratorStatusBadge.vue'
import type {
  GeneratorItem,
  GeneratorStatus,
  CreateGeneratorData,
  UpdateGeneratorData
} from '~~/types/generator'

definePageMeta({
  layout: false
})

const { user } = useAuth()
const isClient = computed(() => user.value?.role === 'client')

useHead({
  title: computed(() => isClient.value ? 'Mis Generadores - Baifa Power' : 'Generadores - Baifa Power')
})
const {
  generators,
  summary,
  isLoading,
  isSaving,
  isDeleting,
  errorMessage,
  fieldErrors,
  successMessage,
  clearMessages,
  fetchGenerators,
  fetchSummary,
  createGenerator,
  updateGenerator,
  deleteGenerator
} = useGenerators()

// Filtros y búsqueda
const searchQuery = ref('')
const selectedStatusFilter = ref<'all' | GeneratorStatus>('all')

// Modales
const isModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isStatusModalOpen = ref(false)
const selectedGenerator = ref<GeneratorItem | null>(null)
const generatorToDelete = ref<GeneratorItem | null>(null)
const generatorToUpdateStatus = ref<GeneratorItem | null>(null)

// Modal de previsualización de foto en grande
const previewImage = ref<string | null>(null)

// Permisos
const canManage = computed(() => {
  return ['admin', 'manager', 'employee'].includes(user.value?.role || '')
})

onMounted(async () => {
  await Promise.all([fetchGenerators(), fetchSummary()])
})

// Filtrado reactivo en memoria
const filteredGenerators = computed(() => {
  return generators.value.filter((g) => {
    // Filtro por texto
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase().trim()
      const matchSerial = g.serial_number.toLowerCase().includes(q)
      const matchModel = g.model.toLowerCase().includes(q)
      const matchName = g.name ? g.name.toLowerCase().includes(q) : false
      const matchClient = g.client?.company_short_name?.toLowerCase().includes(q) ||
        g.client?.company_fiscal_name?.toLowerCase().includes(q) ||
        g.client?.rif?.toLowerCase().includes(q)

      if (!matchSerial && !matchModel && !matchName && !matchClient) {
        return false
      }
    }

    // Filtro por estado
    if (selectedStatusFilter.value !== 'all') {
      if (g.status !== selectedStatusFilter.value) return false
    }

    return true
  })
})

const openCreateModal = () => {
  selectedGenerator.value = null
  clearMessages()
  isModalOpen.value = true
}

const openEditModal = (gen: GeneratorItem) => {
  selectedGenerator.value = gen
  clearMessages()
  isModalOpen.value = true
}

const openStatusModal = (gen: GeneratorItem) => {
  generatorToUpdateStatus.value = gen
  clearMessages()
  isStatusModalOpen.value = true
}

const openDeleteModal = (gen: GeneratorItem) => {
  generatorToDelete.value = gen
  clearMessages()
  isDeleteModalOpen.value = true
}

const openImagePreview = (url?: string | null) => {
  if (url) {
    previewImage.value = url
  }
}

const handleSaveGenerator = async (payload: {
  data: CreateGeneratorData | UpdateGeneratorData
  photoFile: File | null
}) => {
  if (selectedGenerator.value) {
    const res = await updateGenerator(selectedGenerator.value.id, {
      ...payload.data,
      photo: payload.photoFile
    })
    if (res.success) {
      isModalOpen.value = false
    }
  } else {
    const res = await createGenerator({
      ...(payload.data as CreateGeneratorData),
      photo: payload.photoFile
    })
    if (res.success) {
      isModalOpen.value = false
    }
  }
}

const handleUpdateStatus = async (payload: {
  id: number
  status: GeneratorStatus
  checkpointName?: string
  notes?: string
}) => {
  const res = await updateGenerator(payload.id, {
    status: payload.status,
    notes: payload.notes
  })
  if (res.success) {
    isStatusModalOpen.value = false
  }
}

const handleConfirmDelete = async () => {
  if (!generatorToDelete.value) return

  const res = await deleteGenerator(generatorToDelete.value.id)
  if (res.success) {
    isDeleteModalOpen.value = false
    generatorToDelete.value = null
  }
}
</script>

<template>
  <NuxtLayout :name="isClient ? 'client' : 'default'">
    <div class="space-y-6 max-w-7xl mx-auto pb-12">
      <!-- Encabezado de la Sección -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl lg:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <v-icon icon="mdi-flash" class="text-orange-500" size="28" />
            <span>{{ isClient ? 'Mis Generadores' : 'Generadores Eléctricos' }}</span>
          </h1>
          <p class="text-sm text-slate-400 mt-1">
            {{ isClient
              ? 'Plantas eléctricas y equipos industriales asignados a tu cuenta empresarial'
              : 'Catálogo de inventario, equipos asignados y control de estados de despacho' }}
          </p>
        </div>

      <!-- Botón de Registro de Generador -->
      <button
        v-if="canManage"
        type="button"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-[#3eb134] hover:bg-[#349e2e] active:scale-[0.99] transition-all shadow-lg shadow-[#3eb134]/20 cursor-pointer shrink-0 self-start sm:self-auto"
        @click="openCreateModal"
      >
        <v-icon icon="mdi-plus" size="18" />
        <span>Registrar Generador</span>
      </button>
    </div>

    <!-- Alertas de Éxito / Error -->
    <div
      v-if="successMessage"
      class="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center justify-between shadow-lg"
    >
      <div class="flex items-center gap-2.5">
        <v-icon icon="mdi-check-circle-outline" size="20" class="text-emerald-400" />
        <span>{{ successMessage }}</span>
      </div>
      <button
        type="button"
        class="text-emerald-400 hover:text-white"
        @click="clearMessages"
      >
        <v-icon icon="mdi-close" size="16" />
      </button>
    </div>

    <div
      v-if="errorMessage"
      class="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center justify-between shadow-lg"
    >
      <div class="flex items-center gap-2.5">
        <v-icon icon="mdi-alert-circle-outline" size="20" class="text-red-400" />
        <span>{{ errorMessage }}</span>
      </div>
      <button
        type="button"
        class="text-red-400 hover:text-white"
        @click="clearMessages"
      >
        <v-icon icon="mdi-close" size="16" />
      </button>
    </div>

    <!-- Tarjetas de Métricas de Inventario -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      <!-- Total Generadores -->
      <div class="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 flex flex-col justify-between">
        <div class="flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>Total Equipos</span>
          <v-icon icon="mdi-engine" size="18" class="text-slate-400" />
        </div>
        <div class="mt-3">
          <span class="text-2xl font-bold text-white tracking-tight">{{ summary.total }}</span>
          <span class="text-[11px] text-slate-500 ml-1.5">registrados</span>
        </div>
      </div>

      <!-- En Almacén -->
      <div class="bg-[#0f172a] border border-violet-500/20 rounded-2xl p-4 flex flex-col justify-between">
        <div class="flex items-center justify-between text-violet-400 text-xs font-medium">
          <span>En Almacén</span>
          <v-icon icon="mdi-warehouse" size="18" class="text-violet-400" />
        </div>
        <div class="mt-3">
          <span class="text-2xl font-bold text-violet-300 tracking-tight">{{ summary.warehouse }}</span>
          <span class="text-[11px] text-slate-500 ml-1.5">disponibles</span>
        </div>
      </div>

      <!-- En Tránsito -->
      <div class="bg-[#0f172a] border border-sky-500/20 rounded-2xl p-4 flex flex-col justify-between">
        <div class="flex items-center justify-between text-sky-400 text-xs font-medium">
          <span>En Tránsito</span>
          <v-icon icon="mdi-truck-fast-outline" size="18" class="text-sky-400" />
        </div>
        <div class="mt-3">
          <span class="text-2xl font-bold text-sky-300 tracking-tight">{{ summary.in_transit }}</span>
          <span class="text-[11px] text-slate-500 ml-1.5">en ruta</span>
        </div>
      </div>

      <!-- En Punto de Control -->
      <div class="bg-[#0f172a] border border-yellow-500/20 rounded-2xl p-4 flex flex-col justify-between">
        <div class="flex items-center justify-between text-yellow-400 text-xs font-medium">
          <span>En Checkpoint</span>
          <v-icon icon="mdi-map-marker-radius-outline" size="18" class="text-yellow-400" />
        </div>
        <div class="mt-3">
          <span class="text-2xl font-bold text-yellow-300 tracking-tight">{{ summary.checkpoint }}</span>
          <span class="text-[11px] text-slate-500 ml-1.5">en parada</span>
        </div>
      </div>

      <!-- Entregados e Instalados -->
      <div class="bg-[#0f172a] border border-emerald-500/20 rounded-2xl p-4 flex flex-col justify-between col-span-2 sm:col-span-1">
        <div class="flex items-center justify-between text-emerald-400 text-xs font-medium">
          <span>Entregados / Inst.</span>
          <v-icon icon="mdi-check-all" size="18" class="text-emerald-400" />
        </div>
        <div class="mt-3">
          <span class="text-2xl font-bold text-emerald-300 tracking-tight">{{ summary.delivered + summary.installed }}</span>
          <span class="text-[11px] text-slate-500 ml-1.5">completados</span>
        </div>
      </div>
    </div>

    <!-- Barra de Filtros y Búsqueda -->
    <div class="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 space-y-3">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <!-- Campo de Búsqueda -->
        <div class="relative flex-1">
          <v-icon
            icon="mdi-magnify"
            size="18"
            class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por serial, modelo o empresa cliente..."
            class="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#3eb134] focus:ring-1 focus:ring-[#3eb134] transition-all"
          >
          <button
            v-if="searchQuery"
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            @click="searchQuery = ''"
          >
            <v-icon icon="mdi-close" size="14" />
          </button>
        </div>

        <!-- Chips de Filtro por Estado -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 shrink-0">
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0"
            :class="selectedStatusFilter === 'all'
              ? 'bg-[#3eb134] text-white'
              : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'"
            @click="selectedStatusFilter = 'all'"
          >
            Todos
          </button>
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0"
            :class="selectedStatusFilter === 'warehouse'
              ? 'bg-violet-600 text-white'
              : 'bg-slate-800/80 text-violet-400 hover:text-white hover:bg-slate-700'"
            @click="selectedStatusFilter = 'warehouse'"
          >
            Almacén
          </button>
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0"
            :class="selectedStatusFilter === 'in_transit'
              ? 'bg-sky-600 text-white'
              : 'bg-slate-800/80 text-sky-400 hover:text-white hover:bg-slate-700'"
            @click="selectedStatusFilter = 'in_transit'"
          >
            En Tránsito
          </button>
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0"
            :class="selectedStatusFilter === 'checkpoint'
              ? 'bg-yellow-600 text-white'
              : 'bg-slate-800/80 text-yellow-400 hover:text-white hover:bg-slate-700'"
            @click="selectedStatusFilter = 'checkpoint'"
          >
            Checkpoint
          </button>
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0"
            :class="selectedStatusFilter === 'delivered'
              ? 'bg-green-600 text-white'
              : 'bg-slate-800/80 text-green-400 hover:text-white hover:bg-slate-700'"
            @click="selectedStatusFilter = 'delivered'"
          >
            Entregados
          </button>
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0"
            :class="selectedStatusFilter === 'installed'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-800/80 text-emerald-300 hover:text-white hover:bg-slate-700'"
            @click="selectedStatusFilter = 'installed'"
          >
            Instalados
          </button>
        </div>
      </div>
    </div>

    <!-- Tabla de Generadores -->
    <div class="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl">
      <!-- Loading State -->
      <div v-if="isLoading" class="p-12 text-center text-slate-400">
        <v-progress-circular indeterminate color="#3eb134" size="36" class="mb-3" />
        <p class="text-xs text-slate-400 font-medium">Cargando inventario de generadores...</p>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="filteredGenerators.length === 0"
        class="p-12 text-center text-slate-400"
      >
        <div class="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center mx-auto mb-3 text-slate-500">
          <v-icon icon="mdi-flash-off" size="28" />
        </div>
        <p class="text-base text-slate-200 font-semibold">No se encontraron generadores</p>
        <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          {{ searchQuery || selectedStatusFilter !== 'all'
            ? 'No hay registros que coincidan con los criterios de búsqueda aplicados.'
            : 'Aún no se han registrado equipos generadores en el sistema.' }}
        </p>
        <button
          v-if="canManage && !searchQuery && selectedStatusFilter === 'all'"
          type="button"
          class="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#3eb134] hover:bg-[#349e2e] transition-colors cursor-pointer inline-flex items-center gap-2"
          @click="openCreateModal"
        >
          <v-icon icon="mdi-plus" size="16" />
          <span>Registrar primer generador</span>
        </button>
      </div>

      <!-- Tabla de Datos -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-800/80 bg-slate-900/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th class="py-3 px-4">Equipo / Modelo</th>
              <th class="py-3 px-4">Serial de Fábrica</th>
              <th v-if="!isClient" class="py-3 px-4">Cliente Asignado</th>
              <th class="py-3 px-4">Estado Logístico</th>
              <th class="py-3 px-4">ETA Estimada</th>
              <th v-if="canManage" class="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60 text-xs">
            <tr
              v-for="gen in filteredGenerators"
              :key="gen.id"
              class="hover:bg-slate-900/40 transition-colors"
            >
              <!-- Equipo / Foto / Modelo / kVA -->
              <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <!-- Thumbnail con opción de ampliar -->
                  <div
                    class="w-11 h-11 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer group relative"
                    @click="openImagePreview(gen.photo_url)"
                  >
                    <img
                      v-if="gen.photo_url"
                      :src="gen.photo_url"
                      :alt="gen.serial_number"
                      class="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    >
                    <v-icon
                      v-else
                      icon="mdi-engine"
                      size="22"
                      class="text-slate-500"
                    />
                    <div
                      v-if="gen.photo_url"
                      class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <v-icon icon="mdi-magnify-plus-outline" size="14" class="text-white" />
                    </div>
                  </div>

                  <div>
                    <div class="font-semibold text-white tracking-tight">
                      {{ gen.model }}
                    </div>
                    <div class="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span v-if="gen.capacity_kva" class="text-orange-400 font-medium">
                        {{ gen.capacity_kva }} kVA
                      </span>
                      <span v-if="gen.name" class="text-slate-500">• {{ gen.name }}</span>
                    </div>
                  </div>
                </div>
              </td>

              <!-- Serial de Fábrica -->
              <td class="py-3 px-4">
                <span class="px-2.5 py-1 rounded-md bg-slate-800/90 border border-slate-700 text-slate-200 font-mono text-xs font-semibold">
                  {{ gen.serial_number }}
                </span>
              </td>

              <!-- Cliente Asignado -->
              <td v-if="!isClient" class="py-3 px-4">
                <div v-if="gen.client" class="space-y-0.5">
                  <div class="font-medium text-white">
                    {{ gen.client.company_short_name }}
                  </div>
                  <div class="text-[11px] text-slate-500 font-mono">
                    {{ gen.client.rif }}
                  </div>
                </div>
                <div v-else class="inline-flex items-center gap-1 text-[11px] text-slate-500">
                  <v-icon icon="mdi-package-variant-closed" size="14" />
                  <span>En stock Baifa</span>
                </div>
              </td>

              <!-- Estado Logístico -->
              <td class="py-3 px-4">
                <GeneratorStatusBadge :status="gen.status" />
              </td>

              <!-- ETA Estimada -->
              <td class="py-3 px-4">
                <div v-if="gen.estimated_arrival_date" class="text-slate-300 font-mono text-[11px] flex items-center gap-1.5">
                  <v-icon icon="mdi-calendar-clock" size="14" class="text-slate-500" />
                  <span>{{ gen.estimated_arrival_date }}</span>
                </div>
                <span v-else class="text-slate-600 text-[11px]">N/D</span>
              </td>

              <!-- Acciones -->
              <td v-if="canManage" class="py-3 px-4 text-right">
                <div class="inline-flex items-center gap-1">
                  <!-- Cambiar Estado (Checkpoint) -->
                  <button
                    type="button"
                    title="Actualizar estado / Checkpoint"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-yellow-400 hover:bg-slate-800 transition-colors cursor-pointer"
                    @click="openStatusModal(gen)"
                  >
                    <v-icon icon="mdi-map-marker-path" size="18" />
                  </button>

                  <!-- Editar -->
                  <button
                    type="button"
                    title="Editar ficha del generador"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-[#3eb134] hover:bg-slate-800 transition-colors cursor-pointer"
                    @click="openEditModal(gen)"
                  >
                    <v-icon icon="mdi-pencil-outline" size="18" />
                  </button>

                  <!-- Eliminar -->
                  <button
                    type="button"
                    title="Eliminar generador"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
                    @click="openDeleteModal(gen)"
                  >
                    <v-icon icon="mdi-trash-can-outline" size="18" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modales de Operación -->
    <GeneratorModal
      v-model="isModalOpen"
      :generator-to-edit="selectedGenerator"
      :is-loading="isSaving"
      :field-errors="fieldErrors"
      @save="handleSaveGenerator"
    />

    <GeneratorStatusModal
      v-model="isStatusModalOpen"
      :generator="generatorToUpdateStatus"
      :is-loading="isSaving"
      @update-status="handleUpdateStatus"
    />

    <GeneratorDeleteModal
      v-model="isDeleteModalOpen"
      :generator="generatorToDelete"
      :is-loading="isDeleting"
      @confirm="handleConfirmDelete"
    />

    <!-- Modal de Previsualización de Imagen Completa -->
    <v-dialog v-model="previewImage" max-width="640">
      <div class="bg-[#0b1324] border border-slate-700/80 rounded-2xl p-4 text-slate-200 relative shadow-2xl">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <span class="text-xs font-semibold text-slate-300">Fotografía Referencial del Generador</span>
          <button
            type="button"
            class="text-slate-400 hover:text-white"
            @click="previewImage = null"
          >
            <v-icon icon="mdi-close" size="18" />
          </button>
        </div>
        <div class="mt-3 rounded-xl overflow-hidden bg-black flex items-center justify-center max-h-[75vh]">
          <img
            v-if="previewImage"
            :src="previewImage"
            alt="Fotografía completa del generador"
            class="w-full h-auto object-contain"
          >
        </div>
      </div>
    </v-dialog>
  </div>
  </NuxtLayout>
</template>
