<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGenerators } from '~/composables/useGenerators'
import { formatSerialNumber } from '~/utils/validators'
import type { GeneratorStatus } from '~~/types/generator'

const { user } = useAuth()
const { generators, fetchGenerators, isLoading, getStatusConfig } = useGenerators()

const quickSerialSearch = ref('')

onMounted(async () => {
  await fetchGenerators()
})

const handleQuickSearch = async () => {
  const formatted = formatSerialNumber(quickSerialSearch.value)
  if (!formatted) return
  await navigateTo(`/tracking?serial=${encodeURIComponent(formatted)}`)
}

const inProcessCount = computed(() =>
  generators.value.filter(g => g.status !== 'delivered').length
)

const deliveredCount = computed(() =>
  generators.value.filter(g => g.status === 'delivered').length
)

const statusOrder: GeneratorStatus[] = [
  'purchase_order',
  'in_production',
  'origin_customs',
  'maritime_transit',
  'destination_customs',
  'baifa_warehouse',
  'delivered'
]

const getProgressPercent = (status: GeneratorStatus): number => {
  const idx = statusOrder.indexOf(status)
  if (idx === -1) return 15
  return Math.round(((idx + 1) / statusOrder.length) * 100)
}

const clientCards = computed(() => [
  {
    id: 'generators',
    to: '/generators',
    title: 'Mis generadores',
    description: 'Consulta el inventario de plantas eléctricas y equipos asignados a tu empresa.',
    badge: `${generators.value.length} ${generators.value.length === 1 ? 'equipo' : 'equipos'}`,
    badgeColor: 'text-[#3eb134] bg-[#3eb134]/10 border-[#3eb134]/30',
    icon: 'mdi-engine-outline',
    iconColor: 'text-[#3eb134] bg-[#3eb134]/15'
  },
  {
    id: 'tracking',
    to: '/tracking',
    title: 'Rastrear por serial',
    description: 'Consulta en tiempo real la línea de tiempo y los puntos de control de tus unidades.',
    badge: 'Trazabilidad',
    badgeColor: 'text-orange-400 bg-orange-950/40 border-orange-800/40',
    icon: 'mdi-crosshairs-gps',
    iconColor: 'text-orange-400 bg-orange-950/50'
  },
  {
    id: 'transit',
    to: '/generators',
    title: 'Unidades en gestión / tránsito',
    description: 'Equipos en orden de compra, producción, aduanas, tránsito marítimo o almacén BaiFa.',
    badge: `${inProcessCount.value} en proceso`,
    badgeColor: 'text-sky-400 bg-sky-950/40 border-sky-800/40',
    icon: 'mdi-ferry',
    iconColor: 'text-sky-400 bg-sky-950/50'
  },
  {
    id: 'delivered',
    to: '/generators',
    title: 'Equipos entregados',
    description: 'Generadores entregados exitosamente en las instalaciones de tu empresa.',
    badge: `${deliveredCount.value} entregados`,
    badgeColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40',
    icon: 'mdi-check-decagram-outline',
    iconColor: 'text-emerald-400 bg-emerald-950/50'
  }
])

const displayEquipments = computed(() => {
  return generators.value.map((g) => {
    const config = getStatusConfig(g.status)
    return {
      serial: g.serial_number,
      model: g.model + (g.capacity_kva ? ` (${g.capacity_kva} kVA)` : ''),
      location: g.notes || (g.estimated_arrival_date ? `ETA Estimada: ${g.estimated_arrival_date}` : 'Seguimiento activo BaiFa'),
      eta: g.estimated_arrival_date || 'Por confirmar',
      status: g.status_label || config.label,
      statusColor: config.bgClass,
      progress: getProgressPercent(g.status)
    }
  })
})
</script>

<template>
  <div class="space-y-8 max-w-6xl mx-auto py-2">
    <!-- 1. Banner Superior de Bienvenida para el Cliente + Buscador Rápido por Serial -->
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#061a0e] via-[#0b2414] to-[#041009] border border-slate-800/80 p-8 sm:p-10 shadow-lg">
      <!-- Glow decorativo de fondo -->
      <div class="pointer-events-none absolute -right-20 -top-20 w-80 h-80 bg-[#3eb134]/20 rounded-full blur-3xl" />

      <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div class="max-w-2xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3eb134]/15 border border-[#3eb134]/30 text-[#3eb134] text-xs font-semibold uppercase tracking-wider mb-3">
            <v-icon icon="mdi-account-check-outline" size="16" />
            <span>Portal de Autogestión</span>
          </div>

          <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-2">
            Bienvenido{{ user?.client?.company_short_name ? `, ${user.client.company_short_name}` : ' a BaiFa' }}
          </h1>

          <p class="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            Hola <strong class="text-white">{{ user?.name || 'Estimado Cliente' }}</strong><span v-if="user?.client?.company_fiscal_name"> (<span class="text-[#3eb134] font-medium">{{ user.client.company_fiscal_name }}</span> · RIF: <span class="font-mono text-slate-300">{{ user.client.rif }}</span>)</span>, desde este panel puedes consultar el estado logístico y hacer seguimiento a tus equipos asignados en tiempo real.
          </p>
        </div>

        <!-- Buscador rápido de serial integrado en el portal (Etapa 5 RN-PRT-02) -->
        <form
          class="w-full lg:w-80 bg-[#0b1320]/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl shrink-0"
          @submit.prevent="handleQuickSearch"
        >
          <label class="block text-[11px] font-bold uppercase tracking-wider text-[#3eb134] mb-2">
            Rastreo rápido por serial
          </label>
          <div class="flex items-center gap-2">
            <input
              v-model="quickSerialSearch"
              type="text"
              placeholder="Ej: GEN-2026-0041"
              class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono uppercase placeholder-slate-500 focus:outline-none focus:border-[#3eb134]"
            >
            <button
              type="submit"
              class="px-3.5 py-2 rounded-xl bg-[#3eb134] hover:bg-[#349b2c] text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
            >
              Ir
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 2. Tarjetas de Acción del Dashboard Principal -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-white tracking-tight">
          Accesos directos
        </h2>
        <span class="text-xs text-slate-400">Panel de cliente</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <NuxtLink
          v-for="card in clientCards"
          :key="card.id"
          :to="card.to"
          class="bg-[#0f172a] border border-[#1e293b] hover:border-[#3eb134]/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 shadow-sm group cursor-pointer"
        >
          <div>
            <!-- Header de la tarjeta con icono y badge -->
            <div class="flex items-center justify-between mb-4">
              <div class="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105" :class="card.iconColor">
                <v-icon :icon="card.icon" size="22" />
              </div>
              <span class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border" :class="card.badgeColor">
                {{ card.badge }}
              </span>
            </div>

            <!-- Título y descripción -->
            <h3 class="text-base font-bold text-white group-hover:text-[#3eb134] transition-colors mb-1.5">
              {{ card.title }}
            </h3>
            <p class="text-xs text-slate-400 leading-relaxed font-normal">
              {{ card.description }}
            </p>
          </div>

          <!-- Botón de acción al pie -->
          <div class="pt-5 mt-auto flex items-center justify-between text-xs font-semibold text-[#3eb134] group-hover:text-[#349b2c]">
            <span>Consultar</span>
            <v-icon icon="mdi-arrow-right" size="16" class="transition-transform group-hover:translate-x-1" />
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- 3. Ficha de Mis Equipos Registrados y Trazabilidad -->
    <div class="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-sm">
      <div class="flex items-center justify-between mb-5">
        <div>
          <h2 class="text-base font-bold text-white tracking-tight">
            Mis generadores asociados
          </h2>
          <p class="text-xs text-slate-400 mt-0.5">
            Plantas eléctricas asignadas a tu cuenta empresarial y su progreso en las 7 etapas logísticas
          </p>
        </div>
        <NuxtLink
          to="/generators"
          class="text-xs font-semibold text-[#3eb134] hover:text-[#349b2c] transition-colors cursor-pointer"
        >
          Ver catálogo completo &rarr;
        </NuxtLink>
      </div>

      <div v-if="isLoading" class="py-10 text-center text-slate-400">
        <v-progress-circular indeterminate size="28" width="2" color="#3eb134" class="mb-2" />
        <p class="text-xs text-slate-400">Cargando generadores asignados...</p>
      </div>

      <div v-else-if="displayEquipments.length === 0" class="py-10 text-center text-slate-400">
        <v-icon icon="mdi-flash-off" size="36" class="text-slate-600 mb-2" />
        <p class="text-sm font-semibold text-slate-300">No tienes generadores asignados actualmente</p>
        <p class="text-xs text-slate-500 mt-1">Cuando se asigne un equipo a tu empresa aparecerá reflejado aquí.</p>
      </div>

      <div v-else class="space-y-3">
        <NuxtLink
          v-for="item in displayEquipments"
          :key="item.serial"
          :to="`/tracking?serial=${item.serial}`"
          class="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-[#161e31] border border-slate-800 hover:border-[#3eb134]/40 transition-colors gap-4"
        >
          <div class="flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-xl bg-[#3eb134]/15 text-[#3eb134] flex items-center justify-center shrink-0">
              <v-icon icon="mdi-flash" size="22" />
            </div>
            <div>
              <div class="text-sm font-bold text-white">
                {{ item.model }}
              </div>
              <div class="text-xs font-mono text-[#3eb134] mt-0.5">
                Serial: {{ item.serial }} <span class="text-slate-500 ml-2 font-sans">• ETA: {{ item.eta }}</span>
              </div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row sm:items-center justify-between md:justify-end gap-4">
            <div class="w-full sm:w-44">
              <div class="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span class="truncate max-w-[120px]">{{ item.location }}</span>
                <span class="font-mono font-semibold text-slate-300">{{ item.progress }}%</span>
              </div>
              <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  class="h-full bg-[#3eb134] rounded-full transition-all duration-300"
                  :style="{ width: `${item.progress}%` }"
                />
              </div>
            </div>

            <span class="text-xs font-semibold px-3 py-1 rounded-full border leading-none self-start sm:self-auto shrink-0" :class="item.statusColor">
              {{ item.status }}
            </span>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
