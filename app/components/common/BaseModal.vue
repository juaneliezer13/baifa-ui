<script setup lang="ts">
interface Props {
  title: string
  maxWidth?: string | number
  confirmText?: string
  cancelText?: string
  loading?: boolean
  hideFooter?: boolean
}

const {
  title,
  maxWidth = 540,
  confirmText = 'Guardar',
  cancelText = 'Cancelar',
  loading = false,
  hideFooter = false
} = defineProps<Props>()

const isOpen = defineModel<boolean>({ default: false })

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
  isOpen.value = false
}
</script>

<template>
  <v-dialog
    v-model="isOpen"
    :max-width="maxWidth"
    transition="dialog-transition"
    scrim="rgba(0, 0, 0, 0.75)"
  >
    <div class="bg-[#111827] border border-slate-700/60 rounded-2xl p-6 shadow-2xl text-slate-200">
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
        <h2 class="text-base font-bold text-white tracking-tight">
          {{ title }}
        </h2>
        <button
          type="button"
          class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/80 transition-colors"
          @click="handleCancel"
        >
          <v-icon icon="mdi-close" size="20" />
        </button>
      </div>

      <!-- Body / Form Slot -->
      <div class="space-y-4">
        <slot />
      </div>

      <!-- Footer Actions -->
      <div v-if="!hideFooter" class="flex items-center justify-end gap-3 pt-5 mt-6 border-t border-slate-800">
        <button
          type="button"
          class="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 transition-all cursor-pointer"
          @click="handleCancel"
        >
          {{ cancelText }}
        </button>
        <button
          type="button"
          :disabled="loading"
          class="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          @click="handleConfirm"
        >
          <v-progress-circular
            v-if="loading"
            indeterminate
            size="16"
            width="2"
            color="white"
          />
          <span>{{ confirmText }}</span>
        </button>
      </div>
    </div>
  </v-dialog>
</template>
