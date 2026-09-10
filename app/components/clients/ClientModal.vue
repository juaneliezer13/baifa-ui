<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { ClientItem, CreateClientData, UpdateClientData } from '~~/types/client'

const props = defineProps<{
  modelValue: boolean
  clientToEdit: ClientItem | null
  isLoading: boolean
  fieldErrors?: Record<string, string[]>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', data: CreateClientData | UpdateClientData): void
}>()

const companyFiscalName = ref('')
const companyShortName = ref('')
const rif = ref('')
const officePhone = ref('')
const contactName = ref('')
const contactEmail = ref('')
const contactPhone = ref('')
const isActive = ref(true)

const isEditing = computed(() => Boolean(props.clientToEdit))

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      if (props.clientToEdit) {
        companyFiscalName.value = props.clientToEdit.company_fiscal_name || ''
        companyShortName.value = props.clientToEdit.company_short_name || ''
        rif.value = props.clientToEdit.rif || ''
        officePhone.value = props.clientToEdit.office_phone || ''
        contactName.value = props.clientToEdit.contact_name || ''
        contactEmail.value = props.clientToEdit.contact_email || ''
        contactPhone.value = props.clientToEdit.contact_phone || ''
        isActive.value = props.clientToEdit.is_active ?? true
      } else {
        companyFiscalName.value = ''
        companyShortName.value = ''
        rif.value = ''
        officePhone.value = ''
        contactName.value = ''
        contactEmail.value = ''
        contactPhone.value = ''
        isActive.value = true
      }
    }
  },
  { immediate: true }
)

const handleRifInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  rif.value = target.value.toUpperCase()
}

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleSubmit = () => {
  const payload: CreateClientData = {
    company_fiscal_name: companyFiscalName.value.trim(),
    company_short_name: companyShortName.value.trim(),
    rif: rif.value.trim().toUpperCase(),
    office_phone: officePhone.value.trim() || undefined,
    contact_name: contactName.value.trim(),
    contact_email: contactEmail.value.trim().toLowerCase(),
    contact_phone: contactPhone.value.trim() || undefined,
    is_active: isActive.value
  }

  emit('save', payload)
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="520"
    persistent
    @update:model-value="handleClose"
  >
    <div class="bg-[#0b1324] border border-slate-700/80 rounded-2xl p-6 text-slate-200 shadow-2xl relative overflow-hidden">
      <!-- Encabezado del Modal -->
      <div class="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div>
          <h2 class="text-lg font-bold text-white tracking-tight">
            {{ isEditing ? 'Editar cliente' : 'Nuevo cliente' }}
          </h2>
          <p class="text-xs text-slate-400 mt-0.5">
            {{ isEditing ? 'Actualiza los datos fiscales y de contacto de la empresa' : 'Completa la ficha fiscal para dar de alta la empresa' }}
          </p>
        </div>
        <button
          type="button"
          class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          @click="handleClose"
        >
          <v-icon icon="mdi-close" size="20" />
        </button>
      </div>

      <!-- Formulario -->
      <form class="space-y-4 mt-5" @submit.prevent="handleSubmit">
        <!-- Razón Social Fiscal -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1.5">
            Nombre de la empresa según registro fiscal <span class="text-orange-500">*</span>
          </label>
          <input
            v-model="companyFiscalName"
            type="text"
            required
            placeholder="Empresa Ejemplo S.A."
            class="w-full px-3.5 py-2.5 rounded-xl bg-[#131d33] border border-slate-700/70 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
            :class="{ 'border-red-500': fieldErrors?.company_fiscal_name }"
          >
          <p v-if="fieldErrors?.company_fiscal_name" class="text-xs text-red-400 mt-1">
            {{ fieldErrors.company_fiscal_name[0] }}
          </p>
        </div>

        <!-- Fila: Nombre corto + Número de RIF -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">
              Nombre corto de la empresa <span class="text-orange-500">*</span>
            </label>
            <input
              v-model="companyShortName"
              type="text"
              required
              placeholder="EjemploCo"
              class="w-full px-3.5 py-2.5 rounded-xl bg-[#131d33] border border-slate-700/70 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
              :class="{ 'border-red-500': fieldErrors?.company_short_name }"
            >
            <p v-if="fieldErrors?.company_short_name" class="text-xs text-red-400 mt-1">
              {{ fieldErrors.company_short_name[0] }}
            </p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">
              Número de RIF <span class="text-orange-500">*</span>
            </label>
            <input
              :value="rif"
              type="text"
              required
              placeholder="J-XXXXXXXX-X"
              class="w-full px-3.5 py-2.5 rounded-xl bg-[#131d33] border border-slate-700/70 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all uppercase"
              :class="{ 'border-red-500': fieldErrors?.rif }"
              @input="handleRifInput"
            >
            <p v-if="fieldErrors?.rif" class="text-xs text-red-400 mt-1">
              {{ fieldErrors.rif[0] }}
            </p>
          </div>
        </div>

        <!-- Teléfono de Oficinas -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1.5">
            Teléfono de oficinas
          </label>
          <input
            v-model="officePhone"
            type="text"
            placeholder="0212-000-0000"
            class="w-full px-3.5 py-2.5 rounded-xl bg-[#131d33] border border-slate-700/70 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
            :class="{ 'border-red-500': fieldErrors?.office_phone }"
          >
          <p v-if="fieldErrors?.office_phone" class="text-xs text-red-400 mt-1">
            {{ fieldErrors.office_phone[0] }}
          </p>
        </div>

        <!-- Separador: Persona de Contacto -->
        <div class="pt-2 pb-1">
          <div class="flex items-center gap-2">
            <span class="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Persona de contacto
            </span>
            <div class="flex-1 h-px bg-slate-800" />
          </div>
        </div>

        <!-- Nombre Completo del Contacto -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1.5">
            Nombre completo <span class="text-orange-500">*</span>
          </label>
          <input
            v-model="contactName"
            type="text"
            required
            placeholder="Juan Pérez"
            class="w-full px-3.5 py-2.5 rounded-xl bg-[#131d33] border border-slate-700/70 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
            :class="{ 'border-red-500': fieldErrors?.contact_name }"
          >
          <p v-if="fieldErrors?.contact_name" class="text-xs text-red-400 mt-1">
            {{ fieldErrors.contact_name[0] }}
          </p>
        </div>

        <!-- Fila: Email + Teléfono de Contacto -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">
              Email <span class="text-orange-500">*</span>
            </label>
            <input
              v-model="contactEmail"
              type="email"
              required
              placeholder="contacto@empresa.com"
              class="w-full px-3.5 py-2.5 rounded-xl bg-[#131d33] border border-slate-700/70 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
              :class="{ 'border-red-500': fieldErrors?.contact_email }"
            >
            <p v-if="fieldErrors?.contact_email" class="text-xs text-red-400 mt-1">
              {{ fieldErrors.contact_email[0] }}
            </p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">
              Teléfono
            </label>
            <input
              v-model="contactPhone"
              type="text"
              placeholder="0414-000-0000"
              class="w-full px-3.5 py-2.5 rounded-xl bg-[#131d33] border border-slate-700/70 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
              :class="{ 'border-red-500': fieldErrors?.contact_phone }"
            >
            <p v-if="fieldErrors?.contact_phone" class="text-xs text-red-400 mt-1">
              {{ fieldErrors.contact_phone[0] }}
            </p>
          </div>
        </div>

        <!-- Mensaje informativo de autogeneración / sincronización de usuario -->
        <div class="p-3 rounded-xl bg-orange-950/30 border border-orange-800/40 flex items-start gap-2.5 text-xs text-orange-200">
          <v-icon icon="mdi-account-check-outline" size="18" class="text-orange-400 mt-0.5 shrink-0" />
          <div class="leading-relaxed">
            <template v-if="!isEditing">
              Se creará automáticamente un <strong class="text-white">usuario de acceso</strong> con rol <span class="text-orange-400 font-semibold">Cliente</span> vinculado a este correo electrónico con contraseña inicial predeterminada.
            </template>
            <template v-else>
              Al modificar el correo electrónico de contacto, se <strong class="text-white">sincronizará automáticamente</strong> con la cuenta de usuario vinculada.
            </template>
          </div>
        </div>

        <!-- Botones de Acción -->
        <div class="pt-3 flex items-center justify-end gap-3">
          <button
            type="button"
            class="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-700/70 transition-colors cursor-pointer"
            @click="handleClose"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="isLoading"
            class="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 active:scale-[0.99] transition-all shadow-md shadow-orange-950/40 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            <v-progress-circular
              v-if="isLoading"
              indeterminate
              size="16"
              width="2"
              color="white"
            />
            <span>{{ isLoading ? (isEditing ? 'Guardando...' : 'Creando...') : (isEditing ? 'Guardar cambios' : 'Crear cliente') }}</span>
          </button>
        </div>
      </form>
    </div>
  </v-dialog>
</template>
