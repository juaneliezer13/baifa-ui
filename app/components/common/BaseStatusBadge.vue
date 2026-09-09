<script setup lang="ts">
import { computed } from 'vue'
import type { GeneratorStatus } from '~~/types/generator'

export type BadgeStatus = GeneratorStatus | 'active' | 'inactive'

interface Props {
  status: BadgeStatus
  label?: string
}

const { status, label } = defineProps<Props>()

interface StatusConfig {
  text: string
  bgClass: string
  textClass: string
  dotClass?: string
  showDot: boolean
}

const configMap: Record<BadgeStatus, StatusConfig> = {
  warehouse: {
    text: 'En Warehouse',
    bgClass: 'bg-purple-500/15 border border-purple-500/30',
    textClass: 'text-purple-300',
    dotClass: 'bg-purple-400',
    showDot: true
  },
  in_transit: {
    text: 'En Tránsito',
    bgClass: 'bg-sky-500/15 border border-sky-500/30',
    textClass: 'text-sky-300',
    dotClass: 'bg-sky-400',
    showDot: true
  },
  checkpoint: {
    text: 'En Punto de Control',
    bgClass: 'bg-amber-500/15 border border-amber-500/30',
    textClass: 'text-amber-300',
    dotClass: 'bg-amber-400',
    showDot: true
  },
  delivered: {
    text: 'Entregado',
    bgClass: 'bg-emerald-500/15 border border-emerald-500/30',
    textClass: 'text-emerald-300',
    dotClass: 'bg-emerald-400',
    showDot: true
  },
  installed: {
    text: 'Instalado',
    bgClass: 'bg-green-500/15 border border-green-500/30',
    textClass: 'text-green-300',
    dotClass: 'bg-green-400',
    showDot: true
  },
  active: {
    text: 'Activo',
    bgClass: 'bg-emerald-500/15 border border-emerald-500/30',
    textClass: 'text-emerald-300',
    showDot: false
  },
  inactive: {
    text: 'Inactivo',
    bgClass: 'bg-slate-500/15 border border-slate-500/30',
    textClass: 'text-slate-400',
    showDot: false
  }
}

const currentConfig = computed(() => {
  return configMap[status] || {
    text: label || status,
    bgClass: 'bg-slate-500/15 border border-slate-500/30',
    textClass: 'text-slate-300',
    showDot: false
  }
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium tracking-wide transition-colors"
    :class="[currentConfig.bgClass, currentConfig.textClass]"
  >
    <span
      v-if="currentConfig.showDot"
      class="w-1.5 h-1.5 rounded-full"
      :class="currentConfig.dotClass"
    />
    <span>{{ label || currentConfig.text }}</span>
  </span>
</template>
