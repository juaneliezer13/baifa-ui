<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useTracking } from '~/composables/useTracking'
import { useGenerators } from '~/composables/useGenerators'
import GeneratorStatusModal from '~/components/generators/GeneratorStatusModal.vue'
import GeneratorStatusBadge from '~/components/generators/GeneratorStatusBadge.vue'
import type { GeneratorStatus, CreateCheckpointData } from '~~/types/generator'

definePageMeta({
  layout: false,
  alias: ['/tracking/:serial']
})

const route = useRoute()
const { user } = useAuth()

const {
  trackedGenerator,
  checkpoints,
  isLoading,
  isSavingCheckpoint,
  searchError,
  successMessage,
  clearMessages,
  trackBySerial,
  addCheckpoint
} = useTracking()

const { getStatusConfig } = useGenerators()

const isClient = computed(() => user.value?.role === 'client')
const canManage = computed(() => ['admin', 'manager', 'employee'].includes(user.value?.role || ''))
const isGuest = computed(() => !user.value)
const isPublicView = computed(() => isGuest.value || Boolean(trackedGenerator.value?.is_public_view))

const currentLayout = computed(() => {
  if (isGuest.value) return 'public'
  return isClient.value ? 'client' : 'default'
})

const loginRedirectUrl = computed(() => {
  const currentPath = route.fullPath || '/tracking'
  return `/login?redirect=${encodeURIComponent(currentPath)}`
})

const getUrlSerial = (): string => {
  const param = route.params.serial
  if (typeof param === 'string' && param.trim()) return param.trim()
  const query = route.query.serial
  if (typeof query === 'string' && query.trim()) return query.trim()
  return ''
}

useHead({
  title: computed(() => {
    if (trackedGenerator.value?.serial_number) {
      return `Rastreo ${trackedGenerator.value.serial_number} - Baifa Power`
    }
    return isClient.value ? 'Rastrear Mi Generador - Baifa Power' : 'Rastrear Generador - Baifa Power'
  })
})

// Estado local
const searchInput = ref('')
const isStatusModalOpen = ref(false)
const previewImage = ref<string | null>(null)

// Ejemplos de seriales acorde a diseño Figma y datos reales
const exampleSerials = ['GEN-2026-0041', 'GEN-2026-0039', 'GEN-2026-0037', 'GEN-2026-0035']

const handleSearch = async (serialToSearch?: string) => {
  const serial = (serialToSearch || searchInput.value).trim()
  if (!serial) return

  searchInput.value = serial
  await trackBySerial(serial)
}

const selectExample = async (serial: string) => {
  searchInput.value = serial
  await handleSearch(serial)
}

// Búsqueda automática si viene en URL (/tracking/:serial o ?serial=XYZ)
onMounted(async () => {
  const initialSerial = getUrlSerial()
  if (initialSerial) {
    searchInput.value = initialSerial
    await handleSearch(initialSerial)
  }
})

watch(
  () => [route.params.serial, route.query.serial],
  async () => {
    const newSerial = getUrlSerial()
    if (newSerial && newSerial !== searchInput.value) {
      searchInput.value = newSerial
      await handleSearch(newSerial)
    }
  }
)

const handleOpenStatusModal = () => {
  clearMessages()
  isStatusModalOpen.value = true
}

const handleCheckpointSubmitted = async (payload: {
  id: number
  status: GeneratorStatus
  checkpoint_name?: string
  checkpointName?: string
  event_date?: string
  notes?: string
}) => {
  if (!trackedGenerator.value) return

  const resolvedName = payload.checkpoint_name || payload.checkpointName || 'Punto de Control'
  const checkpointData: CreateCheckpointData = {
    status: payload.status,
    checkpoint_name: resolvedName,
    event_date: payload.event_date,
    notes: payload.notes
  }

  const res = await addCheckpoint(trackedGenerator.value.id, checkpointData)
  if (res.success) {
    isStatusModalOpen.value = false
  }
}

// Formateador de fechas
const formatEventDate = (dateStr?: string | null): string => {
  if (!dateStr) return 'N/D'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`
  } catch {
    return dateStr
  }
}

const formatSimpleDate = (dateStr?: string | null): string => {
  if (!dateStr) return 'No definida'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toISOString().split('T')[0]
  } catch {
    return dateStr
  }
}

const getDotColorClass = (status: GeneratorStatus | string): string => {
  switch (status) {
    case 'warehouse':
      return 'bg-violet-400 ring-violet-400/30'
    case 'in_transit':
      return 'bg-sky-400 ring-sky-400/30'
    case 'checkpoint':
      return 'bg-yellow-400 ring-yellow-400/30'
    case 'delivered':
      return 'bg-green-400 ring-green-400/30'
    case 'installed':
      return 'bg-emerald-400 ring-emerald-400/30'
    default:
      return 'bg-orange-500 ring-orange-500/30'
  }
}
</script>

<template>
  <NuxtLayout :name="currentLayout">
    <div class="space-y-6 max-w-7xl mx-auto pb-12">
      <!-- Encabezado de la Sección -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl lg:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <v-icon icon="mdi-crosshairs-gps" class="text-orange-500" size="28" />
            <span>{{ isGuest ? 'Consulta de Rastreo Pública' : (isClient ? 'Rastrear Mi Generador' : 'Rastrear Generador') }}</span>
          </h1>
          <p class="text-sm text-slate-400 mt-1">
            <span v-if="isGuest">Rastreo en tiempo real y estado logístico del generador por serial de fábrica</span>
            <span v-else>Consulta el estado, avance de ruta y bitácora de un generador por su serial de fábrica</span>
          </p>
        </div>
      </div>

      <!-- Tarjeta de Búsqueda de Serial (Figma Make Reference) -->
      <div class="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-xl">
        <form @submit.prevent="handleSearch()">
          <div class="relative flex items-center">
            <v-icon
              icon="mdi-magnify"
              size="20"
              class="absolute left-4 text-slate-400 pointer-events-none"
            />
            <input
              v-model="searchInput"
              type="text"
              placeholder="Ingresa el serial del generador — Ej: GEN-2026-0041"
              class="w-full pl-12 pr-28 py-3.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
            >
            <div class="absolute right-2 flex items-center gap-1.5">
              <button
                v-if="searchInput"
                type="button"
                title="Limpiar búsqueda"
                class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                @click="searchInput = ''; clearMessages()"
              >
                <v-icon icon="mdi-close" size="16" />
              </button>
              <button
                type="submit"
                :disabled="isLoading || !searchInput.trim()"
                class="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-orange-500/20"
              >
                <v-progress-circular
                  v-if="isLoading"
                  indeterminate
                  size="14"
                  width="2"
                  color="white"
                />
                <span v-else>Buscar</span>
              </button>
            </div>
          </div>
        </form>

        <!-- Chips de Seriales de Ejemplo -->
        <div class="flex items-center flex-wrap gap-2 mt-4 text-xs">
          <span class="text-slate-400 font-medium">Ejemplos:</span>
          <button
            v-for="serial in exampleSerials"
            :key="serial"
            type="button"
            class="px-2.5 py-1 rounded-lg font-mono text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 hover:border-orange-500/50 hover:text-orange-400 transition-colors cursor-pointer"
            @click="selectExample(serial)"
          >
            {{ serial }}
          </button>
        </div>
      </div>

      <!-- Alertas de Éxito / Error -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform -translate-y-2 opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform -translate-y-2 opacity-0"
      >
        <div
          v-if="searchError"
          class="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center justify-between shadow-lg"
        >
          <div class="flex items-center gap-2.5">
            <v-icon icon="mdi-alert-circle-outline" size="20" class="text-red-400 shrink-0" />
            <span>{{ searchError }}</span>
          </div>
          <button
            type="button"
            class="text-red-400 hover:text-white"
            @click="clearMessages"
          >
            <v-icon icon="mdi-close" size="16" />
          </button>
        </div>
      </Transition>

      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform -translate-y-2 opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
      >
        <div
          v-if="successMessage"
          class="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center justify-between shadow-lg"
        >
          <div class="flex items-center gap-2.5">
            <v-icon icon="mdi-check-circle-outline" size="20" class="text-emerald-400 shrink-0" />
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
      </Transition>

      <!-- Estado Inicial (Sin generador consultado) -->
      <div
        v-if="!trackedGenerator && !isLoading && !searchError"
        class="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-12 text-center text-slate-400 shadow-xl"
      >
        <div class="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto mb-4">
          <v-icon icon="mdi-radar" size="36" />
        </div>
        <h3 class="text-lg font-semibold text-white">Consulta la trazabilidad de un generador</h3>
        <p class="text-xs text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
          Ingresa el serial de fábrica de la unidad (ej. <span class="font-mono text-orange-400">GEN-2026-0041</span>)
          para consultar su estatus logístico en tiempo real, empresa asignada y la línea de tiempo de puntos de control.
        </p>
      </div>

      <!-- Estado de Carga -->
      <div
        v-if="isLoading"
        class="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-12 text-center text-slate-400 shadow-xl"
      >
        <v-progress-circular indeterminate size="44" width="3" color="orange" class="mb-4" />
        <p class="text-sm text-slate-300 font-medium">Buscando información de trazabilidad...</p>
        <p class="text-xs text-slate-500 mt-1 font-mono">{{ searchInput }}</p>
      </div>

      <!-- Ficha del Generador y Línea de Tiempo (Cuando se encuentra el generador) -->
      <div v-if="trackedGenerator && !isLoading" class="space-y-6">
        <!-- Banner Superior Informativo de Consulta Pública (Estilo MRW) -->
        <div
          v-if="isPublicView"
          class="bg-[#0f172a] border border-orange-500/30 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div class="flex items-start sm:items-center gap-3.5">
            <div class="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <v-icon icon="mdi-shield-check-outline" size="22" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-orange-400 uppercase tracking-wider">
                  Modo Consulta Pública (Huésped)
                </span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  Estilo MRW
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">
                Estás visualizando los datos logísticos esenciales del generador. La información fiscal del cliente y la bitácora extendida están protegidas.
              </p>
            </div>
          </div>

          <NuxtLink
            v-if="!user"
            :to="loginRedirectUrl"
            class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors shrink-0 shadow-md shadow-orange-500/20 cursor-pointer"
          >
            <v-icon icon="mdi-login" size="15" />
            <span>Iniciar Sesión</span>
          </NuxtLink>
        </div>

        <!-- 1. Tarjeta Resumen del Generador (Acorde a Figma 07_rastrear_timeline_detalle.png) -->
        <div class="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <!-- Brillo decorativo superior -->
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 opacity-60" />

          <!-- Encabezado de la Ficha: Serial y Estado -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span class="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block">
                Serial del generador
              </span>
              <h2 class="text-2xl sm:text-3xl font-extrabold text-orange-500 font-mono tracking-tight mt-0.5">
                {{ trackedGenerator.serial_number }}
              </h2>
              <p class="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span class="font-semibold text-slate-200">{{ trackedGenerator.model }}</span>
                <span v-if="trackedGenerator.capacity_kva" class="text-slate-400 font-medium">
                  • {{ trackedGenerator.capacity_kva }} kVA
                </span>
                <span v-if="trackedGenerator.name" class="text-slate-500">
                  • {{ trackedGenerator.name }}
                </span>
              </p>
            </div>

            <div class="flex items-center gap-3 self-start sm:self-auto">
              <!-- Badge de Estatus Principal -->
              <GeneratorStatusBadge :status="trackedGenerator.status" />

              <!-- Botón Operativo para registrar nuevo Checkpoint -->
              <button
                v-if="canManage && !isPublicView"
                type="button"
                class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold text-xs text-white bg-[#3eb134] hover:bg-[#349e2e] active:scale-[0.99] transition-all shadow-md shadow-[#3eb134]/20 cursor-pointer"
                @click="handleOpenStatusModal"
              >
                <v-icon icon="mdi-map-marker-plus" size="16" />
                <span>Registrar Checkpoint</span>
              </button>
            </div>
          </div>

          <!-- Métricas y Datos Clave en 3-4 Columnas -->
          <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-800/80">
            <!-- Cliente -->
            <div v-if="!isPublicView" class="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5">
              <span class="text-[11px] font-medium text-slate-400 block">Cliente Asignado</span>
              <div class="font-bold text-white text-sm mt-1 truncate">
                {{ trackedGenerator.client?.company_short_name || trackedGenerator.client?.company_fiscal_name || 'En stock Baifa' }}
              </div>
              <div class="text-[11px] text-slate-500 font-mono mt-0.5">
                {{ trackedGenerator.client?.rif || 'Inventario central' }}
              </div>
            </div>
            <div v-else class="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5">
              <span class="text-[11px] font-medium text-slate-400 block">Cliente / Destino</span>
              <div class="font-bold text-slate-300 text-sm mt-1 flex items-center gap-1.5">
                <v-icon icon="mdi-lock-outline" size="15" class="text-amber-400" />
                <span>Privado / Protegido</span>
              </div>
              <div class="text-[11px] text-slate-500 mt-0.5">
                Inicia sesión para ver razón social
              </div>
            </div>

            <!-- Llegada estimada (ETA) -->
            <div class="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5">
              <span class="text-[11px] font-medium text-slate-400 block">Llegada estimada (ETA)</span>
              <div class="font-bold text-white text-sm font-mono mt-1 flex items-center gap-1.5">
                <v-icon icon="mdi-calendar-clock" size="16" class="text-orange-400" />
                <span>{{ formatSimpleDate(trackedGenerator.estimated_arrival_date) }}</span>
              </div>
              <div class="text-[11px] text-slate-500 mt-0.5">Fecha prevista de entrega</div>
            </div>

            <!-- Registrado / Seguridad Logística -->
            <div v-if="!isPublicView" class="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5">
              <span class="text-[11px] font-medium text-slate-400 block">Registrado en Sistema</span>
              <div class="font-bold text-white text-sm font-mono mt-1 flex items-center gap-1.5">
                <v-icon icon="mdi-check-decagram-outline" size="16" class="text-emerald-400" />
                <span>{{ formatSimpleDate(trackedGenerator.created_at) }}</span>
              </div>
              <div class="text-[11px] text-slate-500 mt-0.5">Ingreso al catálogo</div>
            </div>
            <div v-else class="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5">
              <span class="text-[11px] font-medium text-slate-400 block">Seguridad Logística</span>
              <div class="font-bold text-emerald-400 text-sm mt-1 flex items-center gap-1.5">
                <v-icon icon="mdi-shield-check" size="16" />
                <span>Trazabilidad Activa</span>
              </div>
              <div class="text-[11px] text-slate-500 mt-0.5">Monitoreo en tiempo real</div>
            </div>

            <!-- Capacidad Eléctrica -->
            <div class="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5 col-span-1 sm:col-span-3 lg:col-span-1">
              <span class="text-[11px] font-medium text-slate-400 block">Potencia y Tipo</span>
              <div class="font-bold text-amber-400 text-sm mt-1 flex items-center gap-1.5">
                <v-icon icon="mdi-lightning-bolt" size="16" />
                <span>{{ trackedGenerator.capacity_kva ? `${trackedGenerator.capacity_kva} kVA` : 'Capacidad Estándar' }}</span>
              </div>
              <div class="text-[11px] text-slate-500 mt-0.5 truncate">{{ trackedGenerator.model }}</div>
            </div>
          </div>
        </div>

        <!-- 2. Sección Dividida: Fotografía Referencial + Historial de Tránsito (Timeline) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <!-- Columna Izquierda: Fotografía del Generador (lg:col-span-4) -->
          <div class="lg:col-span-4 bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 shadow-xl">
            <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <v-icon icon="mdi-camera-outline" size="16" class="text-orange-400" />
              <span>Fotografía del Equipo</span>
            </h3>

            <!-- Contenedor de la Imagen con zoom preview -->
            <div
              class="w-full aspect-[4/3] rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-center overflow-hidden relative group cursor-pointer"
              @click="previewImage = trackedGenerator.photo_url || null"
            >
              <img
                v-if="trackedGenerator.photo_url"
                :src="trackedGenerator.photo_url"
                :alt="trackedGenerator.serial_number"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              >
              <!-- Fallback si no hay foto -->
              <div v-else class="text-center p-6 text-slate-500">
                <v-icon icon="mdi-engine" size="56" class="text-slate-600 mb-2" />
                <p class="text-xs text-slate-400 font-medium">Sin fotografía cargada</p>
                <p class="text-[10px] text-slate-600 mt-1">Fotografía referencial del equipo</p>
              </div>

              <!-- Overlay Hover para ampliar -->
              <div
                v-if="trackedGenerator.photo_url"
                class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <div class="px-3 py-1.5 rounded-lg bg-black/70 text-white text-xs flex items-center gap-1.5 backdrop-blur-sm">
                  <v-icon icon="mdi-magnify-plus-outline" size="16" />
                  <span>Ampliar foto</span>
                </div>
              </div>
            </div>

            <!-- Datos adicionales del equipo debajo de la foto -->
            <div class="mt-4 pt-4 border-t border-slate-800/80 space-y-2 text-xs">
              <div class="flex justify-between items-center text-slate-400">
                <span>Modelo:</span>
                <span class="font-mono text-slate-200 font-medium">{{ trackedGenerator.model }}</span>
              </div>
              <div class="flex justify-between items-center text-slate-400">
                <span>Serial:</span>
                <span class="font-mono text-orange-400 font-semibold">{{ trackedGenerator.serial_number }}</span>
              </div>
              <div v-if="trackedGenerator.notes && !isPublicView" class="pt-2 text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <span class="font-semibold text-slate-300 block mb-0.5">Observación de inventario:</span>
                {{ trackedGenerator.notes }}
              </div>
            </div>
          </div>

          <!-- Columna Derecha: HISTORIAL DE TRÁNSITO (Timeline) (lg:col-span-8) -->
          <div class="lg:col-span-8 bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-xl">
            <div class="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <v-icon icon="mdi-timeline-clock-outline" size="18" class="text-orange-400" />
                <span>Historial de Tránsito</span>
              </h3>
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                {{ checkpoints.length }} {{ checkpoints.length === 1 ? 'punto registrado' : 'puntos registrados' }}
              </span>
            </div>

            <!-- Estado Vacío del Historial -->
            <div
              v-if="checkpoints.length === 0"
              class="py-10 text-center text-slate-400"
            >
              <v-icon icon="mdi-map-marker-distance" size="40" class="text-slate-600 mb-2" />
              <p class="text-sm font-medium text-slate-300">Aún no se han registrado puntos de control</p>
              <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Los eventos de traslado, alcabalas y puntos de llegada aparecerán ordenados cronológicamente aquí.
              </p>
              <button
                v-if="canManage && !isPublicView"
                type="button"
                class="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#3eb134] hover:bg-[#349e2e] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                @click="handleOpenStatusModal"
              >
                <v-icon icon="mdi-plus" size="16" />
                <span>Registrar primer punto</span>
              </button>
            </div>

            <!-- Línea de Tiempo Cronológica (Acorde a Figma Make) -->
            <div v-else class="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
              <div
                v-for="(cp, idx) in checkpoints"
                :key="cp.id || idx"
                class="relative group"
              >
                <!-- Punto / Indicador Circular en la línea -->
                <div
                  class="absolute -left-[30px] top-0.5 w-4 h-4 rounded-full ring-4 transition-transform group-hover:scale-125"
                  :class="getDotColorClass(cp.status)"
                />

                <div class="bg-slate-900/50 hover:bg-slate-900/90 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-4 transition-all">
                  <!-- Encabezado del Evento: Estado y Fecha/Hora -->
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-slate-800/60">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-white text-sm tracking-tight">
                        {{ cp.status_label || getStatusConfig(cp.status).label }}
                      </span>
                      <span
                        v-if="cp.checkpoint_name && cp.checkpoint_name !== cp.status_label"
                        class="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-amber-300 border border-amber-500/20"
                      >
                        📍 {{ cp.checkpoint_name }}
                      </span>
                    </div>

                    <div class="font-mono text-xs text-slate-400 flex items-center gap-1">
                      <v-icon icon="mdi-clock-outline" size="13" class="text-slate-500" />
                      <span>{{ formatEventDate(cp.event_date || cp.created_at) }}</span>
                    </div>
                  </div>

                  <!-- Notas u Observaciones del Despacho -->
                  <p v-if="cp.notes" class="text-xs text-slate-300 mt-2.5 leading-relaxed">
                    {{ cp.notes }}
                  </p>
                  <p v-else class="text-[11px] text-slate-500 italic mt-2">
                    Sin observaciones adicionales registradas.
                  </p>

                  <!-- Pie del Evento: Usuario Responsable y Certificación Inmutable -->
                  <div class="mt-3 pt-2.5 border-t border-slate-800/40 flex items-center justify-between text-[11px] text-slate-400">
                    <div v-if="cp.changed_by" class="flex items-center gap-1.5">
                      <v-icon icon="mdi-account-circle-outline" size="14" class="text-slate-500" />
                      <span>por <strong class="text-slate-300">{{ cp.changed_by }}</strong></span>
                      <span v-if="cp.changed_by_role" class="text-slate-500">• {{ cp.changed_by_role }}</span>
                    </div>
                    <div v-else class="flex items-center gap-1.5 text-slate-400">
                      <v-icon icon="mdi-shield-check-outline" size="14" class="text-emerald-400" />
                      <span>Verificado por <strong class="text-slate-300">Baifa Power Logistics</strong></span>
                    </div>

                    <div class="flex items-center gap-1 text-[10px] text-slate-500" title="Registro inmutable de bitácora">
                      <v-icon icon="mdi-lock-outline" size="12" class="text-slate-600" />
                      <span>Certificado</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Banner Inferior de Llamado a la Acción (Estilo MRW) -->
        <div
          v-if="isPublicView"
          class="bg-gradient-to-br from-[#0f172a] via-[#111c35] to-[#0f172a] border border-orange-500/30 rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden shadow-2xl"
        >
          <!-- Brillo ambiental de fondo -->
          <div class="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div class="relative max-w-2xl mx-auto space-y-4">
            <div class="w-14 h-14 rounded-2xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center mx-auto shadow-inner">
              <v-icon icon="mdi-shield-account-outline" size="30" />
            </div>

            <div>
              <h3 class="text-xl font-extrabold text-white tracking-tight">
                ¿Deseas consultar la información completa de este equipo?
              </h3>
              <p class="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Para visualizar la razón social del cliente, RIF fiscal, datos de contacto del despacho, documentos técnicos de aduana y el historial extendido de operarios de la bitácora, inicia sesión con una cuenta autorizada en la plataforma.
              </p>
            </div>

            <div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <NuxtLink
                :to="loginRedirectUrl"
                class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 active:scale-[0.98] transition-all shadow-lg shadow-orange-500/25 cursor-pointer"
              >
                <v-icon icon="mdi-login" size="18" />
                <span>Iniciar sesión para ver más detalles</span>
              </NuxtLink>

              <NuxtLink
                to="/register"
                class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 transition-colors cursor-pointer"
              >
                <v-icon icon="mdi-account-plus-outline" size="18" />
                <span>Crear cuenta</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de Registro de Checkpoint / Actualizar Estado -->
      <GeneratorStatusModal
        v-model="isStatusModalOpen"
        :generator="trackedGenerator"
        :is-loading="isSavingCheckpoint"
        @update-status="handleCheckpointSubmitted"
      />

      <!-- Modal de Previsualización de Imagen en Grande -->
      <v-dialog v-model="previewImage" max-width="800">
        <div class="bg-[#0b1324] border border-slate-700/80 rounded-2xl p-4 text-center">
          <div class="flex justify-between items-center mb-3 px-2">
            <span class="text-xs font-mono text-slate-300">{{ trackedGenerator?.serial_number }}</span>
            <button
              type="button"
              class="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              @click="previewImage = null"
            >
              <v-icon icon="mdi-close" size="16" />
            </button>
          </div>
          <img
            v-if="previewImage"
            :src="previewImage"
            alt="Fotografía del generador"
            class="w-full max-h-[75vh] object-contain rounded-xl mx-auto"
          >
        </div>
      </v-dialog>
    </div>
  </NuxtLayout>
</template>
