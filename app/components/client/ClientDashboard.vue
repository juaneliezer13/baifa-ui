<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useGenerators } from '~/composables/useGenerators'

const { user } = useAuth()
const { generators, fetchGenerators, isLoading, getStatusConfig } = useGenerators()

onMounted(async () => {
  await fetchGenerators()
})

const inTransitCount = computed(() =>
  generators.value.filter(g => g.status === 'in_transit' || g.status === 'checkpoint').length
)

const installedCount = computed(() =>
  generators.value.filter(g => g.status === 'delivered' || g.status === 'installed').length
)

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
    title: 'Unidades en ruta',
    description: 'Equipos despachados actualmente en tránsito o en puntos de control logísticos.',
    badge: `${inTransitCount.value} en ruta`,
    badgeColor: 'text-sky-400 bg-sky-950/40 border-sky-800/40',
    icon: 'mdi-truck-fast-outline',
    iconColor: 'text-sky-400 bg-sky-950/50'
  },
  {
    id: 'installed',
    to: '/generators',
    title: 'Equipos entregados',
    description: 'Generadores entregados en locación o instalados y operativos en tus instalaciones.',
    badge: `${installedCount.value} activos`,
    badgeColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40',
    icon: 'mdi-check-decagram-outline',
    iconColor: 'text-emerald-400 bg-emerald-950/50'
  }
])

const displayEquipments = computed(() => {
  return generators.value.slice(0, 5).map((g) => {
    const config = getStatusConfig(g.status)
    return {
      serial: g.serial_number,
      model: g.model + (g.capacity_kva ? ` (${g.capacity_kva} kVA)` : ''),
      location: g.notes || (g.estimated_arrival_date ? `ETA Estimada: ${g.estimated_arrival_date}` : 'Instalación del cliente'),
      status: g.status_label || config.label,
      statusColor: config.bgClass
    }
  })
})
</script>

<template>
  <div class="space-y-8 max-w-6xl mx-auto py-2">
    <!-- 1. Banner Superior de Bienvenida para el Cliente -->
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#061a0e] via-[#0b2414] to-[#041009] border border-slate-800/80 p-8 sm:p-10 shadow-lg">
      <!-- Glow decorativo de fondo -->
      <div class="pointer-events-none absolute -right-20 -top-20 w-80 h-80 bg-[#3eb134]/20 rounded-full blur-3xl" />

      <div class="relative z-10 max-w-2xl">
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
            Plantas eléctricas asignadas a tu cuenta empresarial
          </p>
        </div>
        <NuxtLink
          to="/generators"
          class="text-xs font-semibold text-[#3eb134] hover:text-[#349b2c] transition-colors cursor-pointer"
        >
          Ver todos
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
          class="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-[#161e31] border border-slate-800 hover:border-slate-700 transition-colors gap-3"
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
                Serial: {{ item.serial }}
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between sm:justify-end gap-4">
            <div class="text-xs text-slate-400 hidden md:block">
              {{ item.location }}
            </div>
            <span class="text-xs font-semibold px-3 py-1 rounded-full border leading-none" :class="item.statusColor">
              {{ item.status }}
            </span>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
