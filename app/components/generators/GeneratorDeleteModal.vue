<script setup lang="ts">
import type { GeneratorItem } from '~~/types/generator'

const props = defineProps<{
  modelValue: boolean
  generator: GeneratorItem | null
  isLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
}>()

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleConfirm = () => {
  emit('confirm')
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="460"
    persistent
    @update:model-value="handleClose"
  >
    <div class="bg-[#0f172a] border border-slate-700/80 rounded-2xl p-6 text-slate-200 shadow-2xl relative">
      <!-- Icono de alerta -->
      <div class="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-800/40 text-red-400 flex items-center justify-center mb-4">
        <v-icon icon="mdi-alert-outline" size="26" />
      </div>

      <!-- Título -->
      <h3 class="text-base font-bold text-white tracking-tight">
        ¿Eliminar este generador del catálogo?
      </h3>

      <!-- Descripción -->
      <p class="text-xs text-slate-400 mt-2 leading-relaxed">
        Estás a punto de dar de baja el generador con serial <span class="font-semibold text-white font-mono">{{ generator?.serial_number }}</span>
        <span v-if="generator?.model"> ({{ generator?.model }})</span>.
      </p>

      <div v-if="generator?.client" class="mt-3 p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-300">
        <div class="flex items-center gap-2 text-slate-400">
          <v-icon icon="mdi-domain" size="16" class="text-slate-500" />
          <span>Cliente asignado: <strong class="text-white">{{ generator.client.company_short_name }}</strong></span>
        </div>
      </div>

      <!-- Botones de Acción -->
      <div class="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
          @click="handleClose"
        >
          Cancelar
        </button>
        <button
          type="button"
          :disabled="isLoading"
          class="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-500 active:scale-[0.99] transition-all shadow-md shadow-red-900/30 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          @click="handleConfirm"
        >
          <v-progress-circular
            v-if="isLoading"
            indeterminate
            size="16"
            width="2"
            color="white"
          />
          <span>{{ isLoading ? 'Eliminando...' : 'Eliminar generador' }}</span>
        </button>
      </div>
    </div>
  </v-dialog>
</template>
