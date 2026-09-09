<script setup lang="ts">
import BaseStatusBadge from '~/components/common/BaseStatusBadge.vue'
import type { GeneratorStatus } from '~~/types/generator'

// Métricas KPI superiores
interface KpiCard {
  label: string
  value: number | string
  icon: string
  color: string
  bgColor: string
}

const kpiCards: KpiCard[] = [
  { label: 'Generadores activos', value: 4, icon: 'mdi-flash', color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  { label: 'En Warehouse', value: 1, icon: 'mdi-home-outline', color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
  { label: 'En Tránsito', value: 2, icon: 'mdi-truck-outline', color: 'text-sky-400', bgColor: 'bg-sky-500/10' },
  { label: 'Entregados/Instalados', value: 2, icon: 'mdi-check', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
  { label: 'Clientes activos', value: 3, icon: 'mdi-account-group-outline', color: 'text-amber-500', bgColor: 'bg-amber-500/10' }
]

// Pipeline de estados
interface PipelineStep {
  label: string
  count: number
  borderClass: string
  bgClass: string
  textClass: string
}

const pipelineSteps: PipelineStep[] = [
  { label: 'En Warehouse', count: 1, borderClass: 'border-purple-800/40', bgClass: 'bg-purple-950/20', textClass: 'text-purple-400' },
  { label: 'En Tránsito', count: 2, borderClass: 'border-sky-800/40', bgClass: 'bg-sky-950/20', textClass: 'text-sky-400' },
  { label: 'En Punto de Control', count: 1, borderClass: 'border-amber-800/40', bgClass: 'bg-amber-950/20', textClass: 'text-amber-400' },
  { label: 'Entregado', count: 0, borderClass: 'border-emerald-800/40', bgClass: 'bg-emerald-950/20', textClass: 'text-emerald-400' },
  { label: 'Instalado', count: 0, borderClass: 'border-green-800/40', bgClass: 'bg-green-950/20', textClass: 'text-green-400' }
]

// Generadores recientes
interface RecentGenerator {
  serial: string
  status: GeneratorStatus
  updatedAt: string
}

const recentGenerators: RecentGenerator[] = [
  { serial: 'GEN-2026-0041', status: 'in_transit', updatedAt: '2026-08-30 07:30' },
  { serial: 'GEN-2026-0039', status: 'checkpoint', updatedAt: '2026-08-25 14:30' },
  { serial: 'GEN-2026-0037', status: 'installed', updatedAt: '2026-08-20 16:00' },
  { serial: 'GEN-2026-0035', status: 'warehouse', updatedAt: '2026-09-01 09:00' },
  { serial: 'GEN-2026-0033', status: 'delivered', updatedAt: '2026-08-24 14:00' }
]

// Usuarios del sistema
interface SystemUser {
  initials: string
  name: string
  email: string
  role: string
  badgeClass: string
}

const systemUsers: SystemUser[] = [
  { initials: 'AM', name: 'Adriana Morales', email: 'admin@baifa.com.ve', role: 'Superadministrador', badgeClass: 'text-red-400 bg-red-950/50 border-red-800/30' },
  { initials: 'LH', name: 'Luis Herrera', email: 'lherrera@baifa.com.ve', role: 'Administrador', badgeClass: 'text-amber-400 bg-amber-950/50 border-amber-800/30' },
  { initials: 'PR', name: 'Patricia Rojas', email: 'projas@baifa.com.ve', role: 'Operador', badgeClass: 'text-sky-400 bg-sky-950/50 border-sky-800/30' },
  { initials: 'MF', name: 'Miguel Fernández', email: 'mfernandez@baifa.com.ve', role: 'Visualizador', badgeClass: 'text-slate-400 bg-slate-800/50 border-slate-700/30' }
]
</script>

<template>
  <div class="space-y-8 max-w-7xl mx-auto">
    <!-- Encabezado de Página -->
    <div>
      <h1 class="text-2xl lg:text-3xl font-bold text-white tracking-tight">
        Panel de Control
      </h1>
      <p class="text-sm text-slate-400 mt-1 font-normal">
        Resumen operativo — Baifa Logistics
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

      <div class="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
        <div
          v-for="(step, index) in pipelineSteps"
          :key="step.label"
          class="relative flex items-center"
        >
          <div
            class="w-full border rounded-xl p-4 transition-all"
            :class="[step.borderClass, step.bgClass]"
          >
            <span class="block text-xs font-medium leading-none mb-2" :class="step.textClass">
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
            size="16"
            class="hidden md:block absolute -right-3.5 z-10 text-slate-600"
          />
        </div>
      </div>
    </div>

    <!-- 3. Sección Inferior: Generadores Recientes (2/3) + Usuarios (1/3) -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Tabla de Generadores Recientes -->
      <div class="lg:col-span-2 bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <h2 class="text-sm font-semibold text-white mb-5">
            Generadores recientes
          </h2>

          <div class="overflow-x-auto">
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
                  <td class="py-3.5 pr-4 font-semibold text-orange-400">
                    {{ gen.serial }}
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

      <!-- Widget Usuarios del Sistema -->
      <div class="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-sm">
        <h2 class="text-sm font-semibold text-white mb-5">
          Usuarios del sistema
        </h2>

        <div class="space-y-4">
          <div
            v-for="user in systemUsers"
            :key="user.email"
            class="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-800/30 transition-colors"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-9 h-9 rounded-full bg-orange-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                {{ user.initials }}
              </div>
              <div class="min-w-0">
                <div class="text-xs font-semibold text-white truncate">
                  {{ user.name }}
                </div>
                <div class="text-[11px] text-slate-400 truncate">
                  {{ user.email }}
                </div>
              </div>
            </div>

            <span
              class="text-[10px] font-medium border px-2 py-0.5 rounded-full whitespace-nowrap"
              :class="user.badgeClass"
            >
              {{ user.role }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
