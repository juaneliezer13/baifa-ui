<script setup lang="ts">
import { computed, onMounted } from 'vue'
import ClientDashboard from '~/components/client/ClientDashboard.vue'
import BaseStatusBadge from '~/components/common/BaseStatusBadge.vue'
import { useGenerators } from '~/composables/useGenerators'
import { useClients } from '~/composables/useClients'
import { useUsers } from '~/composables/useUsers'
import type { GeneratorStatus } from '~~/types/generator'

definePageMeta({
  layout: false
})

const { user } = useAuth()
const isClient = computed(() => user.value?.role === 'client')
const isAdmin = computed(() => user.value?.role === 'admin')

useHead({
  title: computed(() => isClient.value ? 'Portal de Clientes - Baifa' : 'Panel de Control - Baifa')
})

const { summary, generators, fetchGenerators, fetchSummary } = useGenerators()
const { clients, fetchClients } = useClients()
const { users, fetchUsers } = useUsers()

onMounted(async () => {
  if (!isClient.value) {
    const tasks: Promise<unknown>[] = [
      fetchSummary(),
      fetchGenerators(),
      fetchClients()
    ]
    if (isAdmin.value) {
      tasks.push(fetchUsers())
    }
    await Promise.all(tasks)
  }
})

// Métricas KPI superiores
interface KpiCard {
  label: string
  value: number | string
  icon: string
  color: string
  bgColor: string
}

const activeClientsCount = computed(() => {
  return clients.value.filter(c => c.is_active).length
})

const kpiCards = computed<KpiCard[]>(() => [
  {
    label: 'Generadores registrados',
    value: summary.value.total,
    icon: 'mdi-flash',
    color: 'text-[#3eb134]',
    bgColor: 'bg-[#3eb134]/10'
  },
  {
    label: 'Orden y Producción',
    value: summary.value.purchase_order + summary.value.in_production,
    icon: 'mdi-factory',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10'
  },
  {
    label: 'Tránsito y Aduanas',
    value: summary.value.origin_customs + summary.value.maritime_transit + summary.value.destination_customs,
    icon: 'mdi-ferry',
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10'
  },
  {
    label: 'En Almacén / Entregados',
    value: `${summary.value.baifa_warehouse} / ${summary.value.delivered}`,
    icon: 'mdi-check-circle-outline',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10'
  },
  {
    label: 'Clientes activos',
    value: activeClientsCount.value,
    icon: 'mdi-account-group-outline',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10'
  }
])

// Pipeline de estados
interface PipelineStep {
  label: string
  count: number
  borderClass: string
  bgClass: string
  textClass: string
}

const pipelineSteps = computed<PipelineStep[]>(() => [
  { label: 'Orden de Compra', count: summary.value.purchase_order, borderClass: 'border-violet-800/40', bgClass: 'bg-violet-950/20', textClass: 'text-violet-400' },
  { label: 'En Producción', count: summary.value.in_production, borderClass: 'border-amber-800/40', bgClass: 'bg-amber-950/20', textClass: 'text-amber-400' },
  { label: 'En Aduana de Origen', count: summary.value.origin_customs, borderClass: 'border-orange-800/40', bgClass: 'bg-orange-950/20', textClass: 'text-orange-400' },
  { label: 'En Tránsito Marítimo', count: summary.value.maritime_transit, borderClass: 'border-sky-800/40', bgClass: 'bg-sky-950/20', textClass: 'text-sky-400' },
  { label: 'En Aduana Destino', count: summary.value.destination_customs, borderClass: 'border-yellow-800/40', bgClass: 'bg-yellow-950/20', textClass: 'text-yellow-400' },
  { label: 'En Almacén BaiFa', count: summary.value.baifa_warehouse, borderClass: 'border-cyan-800/40', bgClass: 'bg-cyan-950/20', textClass: 'text-cyan-400' },
  { label: 'Entregado', count: summary.value.delivered, borderClass: 'border-emerald-800/40', bgClass: 'bg-emerald-950/20', textClass: 'text-emerald-400' }
])

// Generadores recientes (datos reales desde la API)
interface RecentGenerator {
  serial: string
  status: GeneratorStatus
  updatedAt: string
}

const recentGenerators = computed<RecentGenerator[]>(() => {
  return generators.value.slice(0, 5).map(g => ({
    serial: g.serial_number,
    status: g.status,
    updatedAt: g.updated_at ? g.updated_at.slice(0, 16).replace('T', ' ') : 'Reciente'
  }))
})

// Usuarios del sistema (datos reales desde la API)
interface DashboardUser {
  initials: string
  name: string
  email: string
  role: string
  badgeClass: string
}

const getInitials = (name: string): string => {
  if (!name) return 'U'
  return name
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const getRoleBadgeClass = (role: string): string => {
  switch (role) {
    case 'admin':
      return 'text-red-400 bg-red-950/50 border-red-800/30'
    case 'manager':
      return 'text-amber-400 bg-amber-950/50 border-amber-800/30'
    case 'employee':
      return 'text-sky-400 bg-sky-950/50 border-sky-800/30'
    case 'client':
      return 'text-emerald-400 bg-emerald-950/50 border-emerald-800/30'
    default:
      return 'text-slate-400 bg-slate-800/50 border-slate-700/30'
  }
}

const systemUsers = computed<DashboardUser[]>(() => {
  return users.value.slice(0, 5).map(u => ({
    initials: getInitials(u.name),
    name: u.name,
    email: u.email,
    role: u.role_label || u.role,
    badgeClass: getRoleBadgeClass(u.role)
  }))
})
</script>

<template>
  <NuxtLayout :name="isClient ? 'client' : 'default'">
    <!-- Portal de Autogestión exclusivo para Clientes -->
    <ClientDashboard v-if="isClient" />

    <!-- Panel de Control Operativo para Administradores y Empleados -->
    <div v-else class="space-y-8 max-w-7xl mx-auto">
      <!-- Encabezado de Página -->
      <div>
        <h1 class="text-2xl lg:text-3xl font-bold text-white tracking-tight">
          Panel de Control
        </h1>
        <p class="text-sm text-slate-400 mt-1 font-normal">
          Resumen operativo — Baifa
        </p>
      </div>

      <!-- 1. Tarjetas KPI Superiores (5 Columnas) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div
          v-for="kpi in kpiCards"
          :key="kpi.label"
          class="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-sm"
        >
          <div class="flex items-start justify-between">
            <span class="text-xs font-medium text-slate-400 leading-snug">
              {{ kpi.label }}
            </span>
            <div :class="['w-8 h-8 rounded-lg flex items-center justify-center', kpi.bgColor, kpi.color]">
              <v-icon :icon="kpi.icon" size="18" />
            </div>
          </div>
          <div class="mt-4">
            <span class="text-3xl font-bold text-white tracking-tight">
              {{ kpi.value }}
            </span>
          </div>
        </div>
      </div>

      <!-- 2. Pipeline de Generadores Activos -->
      <div class="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-sm">
        <h2 class="text-sm font-semibold text-white mb-4">
          Pipeline de generadores activos
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 items-center">
          <div
            v-for="(step, index) in pipelineSteps"
            :key="step.label"
            class="relative flex items-center"
          >
            <div
              class="w-full border rounded-xl p-3.5 transition-all"
              :class="[step.borderClass, step.bgClass]"
            >
              <span class="block text-[11px] font-medium leading-tight mb-2 truncate" :class="step.textClass" :title="step.label">
                {{ step.label }}
              </span>
              <span class="text-2xl font-bold text-white">
                {{ step.count }}
              </span>
            </div>

            <!-- Separador de flecha entre pasos -->
            <v-icon
              v-if="index < pipelineSteps.length - 1"
              icon="mdi-chevron-right"
              size="14"
              class="hidden xl:block absolute -right-3 z-10 text-slate-600"
            />
          </div>
        </div>
      </div>

      <!-- 3. Sección Inferior: Generadores Recientes + Usuarios -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Tabla de Generadores Recientes -->
        <div :class="[isAdmin ? 'lg:col-span-2' : 'lg:col-span-3', 'bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-sm flex flex-col justify-between']">
          <div>
            <div class="flex items-center justify-between mb-5">
              <h2 class="text-sm font-semibold text-white">
                Generadores recientes
              </h2>
              <NuxtLink to="/generators" class="text-xs font-semibold text-[#3eb134] hover:text-[#349b2c] transition-colors">
                Ver catálogo &rarr;
              </NuxtLink>
            </div>

            <div v-if="recentGenerators.length === 0" class="py-10 text-center text-slate-400">
              <v-icon icon="mdi-flash-off" size="32" class="text-slate-600 mb-2" />
              <p class="text-xs text-slate-400">Aún no hay generadores registrados en el sistema.</p>
            </div>

            <div v-else class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    <th class="pb-3 pr-4">Serial</th>
                    <th class="pb-3 px-4">Estado</th>
                    <th class="pb-3 pl-4 text-right">Última actualización</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60 text-xs">
                  <tr
                    v-for="gen in recentGenerators"
                    :key="gen.serial"
                    class="hover:bg-slate-800/30 transition-colors"
                  >
                    <td class="py-3.5 pr-4 font-semibold text-[#3eb134] font-mono">
                      <NuxtLink :to="`/tracking?serial=${gen.serial}`" class="hover:underline">
                        {{ gen.serial }}
                      </NuxtLink>
                    </td>
                    <td class="py-3.5 px-4">
                      <BaseStatusBadge :status="gen.status" />
                    </td>
                    <td class="py-3.5 pl-4 text-right text-slate-400 font-mono text-[11px]">
                      {{ gen.updatedAt }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Widget Usuarios del Sistema (Exclusivo Administradores) -->
        <div v-if="isAdmin" class="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-sm">
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-sm font-semibold text-white">
              Usuarios del sistema
            </h2>
            <NuxtLink to="/users" class="text-xs font-semibold text-[#3eb134] hover:text-[#349b2c] transition-colors">
              Gestionar &rarr;
            </NuxtLink>
          </div>

          <div v-if="systemUsers.length === 0" class="py-10 text-center text-slate-400">
            <v-icon icon="mdi-account-group-outline" size="32" class="text-slate-600 mb-2" />
            <p class="text-xs text-slate-400">Sin usuarios registrados.</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="u in systemUsers"
              :key="u.email"
              class="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-800/30 transition-colors"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-9 h-9 rounded-full bg-[#3eb134] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                  {{ u.initials }}
                </div>
                <div class="min-w-0">
                  <div class="text-xs font-semibold text-white truncate">
                    {{ u.name }}
                  </div>
                  <div class="text-[11px] text-slate-400 truncate">
                    {{ u.email }}
                  </div>
                </div>
              </div>

              <span
                class="text-[10px] font-medium border px-2 py-0.5 rounded-full whitespace-nowrap"
                :class="u.badgeClass"
              >
                {{ u.role }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
