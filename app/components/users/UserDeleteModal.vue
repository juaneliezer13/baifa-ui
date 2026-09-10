<script setup lang="ts">
import { computed } from 'vue'
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

const isClient = computed(() => props.user?.role === 'client')

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleConfirm = () => {
  if (isClient.value) return
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
      <!-- Icono superior -->
      <div
        class="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
        :class="isClient ? 'bg-amber-950/60 border border-amber-800/40 text-amber-400' : 'bg-red-950/60 border border-red-800/40 text-red-400'"
      >
        <v-icon :icon="isClient ? 'mdi-alert-circle-outline' : 'mdi-alert-outline'" size="26" />
      </div>

      <!-- Título -->
      <h3 class="text-base font-bold text-white tracking-tight">
        {{ isClient ? 'Acción no permitida: Usuario de tipo Cliente' : '¿Eliminar este usuario?' }}
      </h3>

      <!-- Caso: Usuario de tipo cliente -->
      <div v-if="isClient" class="mt-3 space-y-3 text-xs">
        <p class="text-slate-300 leading-relaxed">
          El usuario <span class="font-semibold text-white">{{ user?.name }}</span> (<span class="text-slate-300 font-mono">{{ user?.email }}</span>) es una cuenta de tipo <span class="text-amber-400 font-semibold">Cliente</span> asociada a una empresa.
        </p>

        <div class="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/50 text-amber-200 flex items-start gap-2.5">
          <v-icon icon="mdi-shield-alert-outline" size="18" class="text-amber-400 shrink-0 mt-0.5" />
          <div class="leading-relaxed">
            <span class="font-semibold block text-amber-300 mb-0.5">Eliminación restringida</span>
            Para poder eliminar este usuario, debe eliminar primero la empresa cliente asociada desde el módulo de <strong>Clientes</strong>. Al eliminar la empresa, el usuario se eliminará en cascada automáticamente.
          </div>
        </div>
      </div>

      <!-- Caso: Usuario normal (admin, manager, employee) -->
      <p v-else class="text-xs text-slate-400 mt-2 leading-relaxed">
        Estás a punto de eliminar a <span class="font-semibold text-white">{{ user?.name }}</span> (<span class="text-slate-300 font-mono">{{ user?.email }}</span>). Esta acción revocará todas sus sesiones activas y no se puede deshacer.
      </p>

      <!-- Botones de Acción -->
      <div class="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
          @click="handleClose"
        >
          {{ isClient ? 'Cerrar' : 'Cancelar' }}
        </button>

        <NuxtLink
          v-if="isClient"
          to="/clients"
          class="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 transition-all flex items-center gap-1.5 cursor-pointer"
          @click="handleClose"
        >
          <v-icon icon="mdi-domain" size="16" />
          <span>Ir a Gestión de Clientes</span>
        </NuxtLink>

        <button
          v-else
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
