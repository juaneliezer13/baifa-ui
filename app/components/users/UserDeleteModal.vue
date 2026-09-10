<script setup lang="ts">
import type { SystemUser } from '~~/types/user'

const props = defineProps<{
  modelValue: boolean
  user: SystemUser | null
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
    max-width="440"
    persistent
    @update:model-value="handleClose"
  >
    <div class="bg-[#0f172a] border border-slate-700/80 rounded-2xl p-6 text-slate-200 shadow-2xl relative">
      <!-- Icono de advertencia superior -->
      <div class="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-800/40 text-red-400 flex items-center justify-center mb-4">
        <v-icon icon="mdi-alert-outline" size="26" />
      </div>

      <!-- Título y Mensaje -->
      <h3 class="text-base font-bold text-white tracking-tight">
        ¿Eliminar este usuario?
      </h3>
      <p class="text-xs text-slate-400 mt-2 leading-relaxed">
        Estás a punto de eliminar a <span class="font-semibold text-white">{{ user?.name }}</span> (<span class="text-slate-300 font-mono">{{ user?.email }}</span>). Esta acción revocará todas sus sesiones activas y no se puede deshacer.
      </p>

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
          <span>{{ isLoading ? 'Eliminando...' : 'Eliminar usuario' }}</span>
        </button>
      </div>
    </div>
  </v-dialog>
</template>
