<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import type { ClientItem, CreateClientData, UpdateClientData } from '~~/types/client'
import {
  formatRifOrCedula,
  validateRifOrCedula,
  formatPhone,
  validatePhone,
  validateEmail,
  validatePersonName,
  validateCompanyName
} from '~/utils/validators'

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

const localErrors = reactive<{
  company_fiscal_name: string
  company_short_name: string
  rif: string
  office_phone: string
  contact_name: string
  contact_email: string
  contact_phone: string
}>({
  company_fiscal_name: '',
  company_short_name: '',
  rif: '',
  office_phone: '',
  contact_name: '',
  contact_email: '',
  contact_phone: ''
})

const clearLocalErrors = () => {
  localErrors.company_fiscal_name = ''
  localErrors.company_short_name = ''
  localErrors.rif = ''
  localErrors.office_phone = ''
  localErrors.contact_name = ''
  localErrors.contact_email = ''
  localErrors.contact_phone = ''
}

const isEditing = computed(() => Boolean(props.clientToEdit))

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      clearLocalErrors()
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

const handleFiscalNameBlur = () => {
  if (!companyFiscalName.value.trim()) return
  localErrors.company_fiscal_name = validateCompanyName(companyFiscalName.value, 3, 'La razón social') || ''
}

const handleShortNameBlur = () => {
  if (!companyShortName.value.trim()) return
  localErrors.company_short_name = validateCompanyName(companyShortName.value, 2, 'El nombre corto') || ''
}

const handleRifInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const formatted = formatRifOrCedula(target.value)
  rif.value = formatted
  target.value = formatted
  if (localErrors.rif) {
    localErrors.rif = validateRifOrCedula(rif.value) || ''
  }
}

const handleRifBlur = () => {
  if (!rif.value.trim()) return
  localErrors.rif = validateRifOrCedula(rif.value) || ''
}

const handleOfficePhoneInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const formatted = formatPhone(target.value)
  officePhone.value = formatted
  target.value = formatted
  if (localErrors.office_phone) {
    localErrors.office_phone = validatePhone(officePhone.value, false) || ''
  }
}

const handleOfficePhoneBlur = () => {
  localErrors.office_phone = validatePhone(officePhone.value, false) || ''
}

const handleContactNameBlur = () => {
  if (!contactName.value.trim()) return
  localErrors.contact_name = validatePersonName(contactName.value, 'El nombre de contacto') || ''
}

const handleContactPhoneInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const formatted = formatPhone(target.value)
  contactPhone.value = formatted
  target.value = formatted
  if (localErrors.contact_phone) {
    localErrors.contact_phone = validatePhone(contactPhone.value, false) || ''
  }
}

const handleContactPhoneBlur = () => {
  localErrors.contact_phone = validatePhone(contactPhone.value, false) || ''
}

const handleEmailBlur = () => {
  if (!contactEmail.value.trim()) return
  localErrors.contact_email = validateEmail(contactEmail.value) || ''
}

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleSubmit = () => {
  clearLocalErrors()

  const fiscalErr = validateCompanyName(companyFiscalName.value, 3, 'La razón social de la empresa')
  const shortErr = validateCompanyName(companyShortName.value, 2, 'El nombre corto de la empresa')
  const rifErr = validateRifOrCedula(rif.value, true)
  const officePhoneErr = validatePhone(officePhone.value, false)
  const contactNameErr = validatePersonName(contactName.value, 'El nombre de la persona de contacto')
  const emailErr = validateEmail(contactEmail.value, true)
  const contactPhoneErr = validatePhone(contactPhone.value, false)

  if (fiscalErr) localErrors.company_fiscal_name = fiscalErr
  if (shortErr) localErrors.company_short_name = shortErr
  if (rifErr) localErrors.rif = rifErr
  if (officePhoneErr) localErrors.office_phone = officePhoneErr
  if (contactNameErr) localErrors.contact_name = contactNameErr
  if (emailErr) localErrors.contact_email = emailErr
  if (contactPhoneErr) localErrors.contact_phone = contactPhoneErr

  if (fiscalErr || shortErr || rifErr || officePhoneErr || contactNameErr || emailErr || contactPhoneErr) {
    return
  }

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
      <form class="space-y-4 mt-5" novalidate @submit.prevent="handleSubmit">
        <!-- Razón Social Fiscal -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1.5">
            Nombre de la empresa según registro fiscal <span class="text-orange-500">*</span>
          </label>
          <input
            v-model="companyFiscalName"
            type="text"
            required
            placeholder="Inversiones Industriales C.A."
            class="w-full px-3.5 py-2.5 rounded-xl bg-[#131d33] border border-slate-700/70 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
            :class="{ 'border-red-500': localErrors.company_fiscal_name || fieldErrors?.company_fiscal_name }"
            @blur="handleFiscalNameBlur"
            @input="localErrors.company_fiscal_name = ''"
          >
          <p v-if="localErrors.company_fiscal_name || fieldErrors?.company_fiscal_name" class="text-xs text-red-400 mt-1">
            {{ localErrors.company_fiscal_name || fieldErrors?.company_fiscal_name?.[0] }}
          </p>
        </div>

        <!-- Fila: Nombre corto + Número de RIF / Cédula -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">
              Nombre corto de la empresa <span class="text-orange-500">*</span>
            </label>
            <input
              v-model="companyShortName"
              type="text"
              required
              placeholder="InvIndustriales"
              class="w-full px-3.5 py-2.5 rounded-xl bg-[#131d33] border border-slate-700/70 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
              :class="{ 'border-red-500': localErrors.company_short_name || fieldErrors?.company_short_name }"
              @blur="handleShortNameBlur"
              @input="localErrors.company_short_name = ''"
            >
            <p v-if="localErrors.company_short_name || fieldErrors?.company_short_name" class="text-xs text-red-400 mt-1">
              {{ localErrors.company_short_name || fieldErrors?.company_short_name?.[0] }}
            </p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">
              Número de RIF o Cédula <span class="text-orange-500">*</span>
            </label>
            <input
              :value="rif"
              type="text"
              required
              placeholder="J-12345678-9 o V-12345678"
              class="w-full px-3.5 py-2.5 rounded-xl bg-[#131d33] border border-slate-700/70 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all uppercase"
              :class="{ 'border-red-500': localErrors.rif || fieldErrors?.rif }"
              @input="handleRifInput"
              @blur="handleRifBlur"
            >
            <p v-if="localErrors.rif || fieldErrors?.rif" class="text-xs text-red-400 mt-1">
              {{ localErrors.rif || fieldErrors?.rif?.[0] }}
            </p>
          </div>
        </div>

        <!-- Teléfono de Oficinas -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1.5">
            Teléfono de oficinas
          </label>
          <input
            :value="officePhone"
            type="tel"
            placeholder="0212-5551234"
            class="w-full px-3.5 py-2.5 rounded-xl bg-[#131d33] border border-slate-700/70 text-white font-mono placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
            :class="{ 'border-red-500': localErrors.office_phone || fieldErrors?.office_phone }"
            @input="handleOfficePhoneInput"
            @blur="handleOfficePhoneBlur"
          >
          <p v-if="localErrors.office_phone || fieldErrors?.office_phone" class="text-xs text-red-400 mt-1">
            {{ localErrors.office_phone || fieldErrors?.office_phone?.[0] }}
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
            :class="{ 'border-red-500': localErrors.contact_name || fieldErrors?.contact_name }"
            @blur="handleContactNameBlur"
            @input="localErrors.contact_name = ''"
          >
          <p v-if="localErrors.contact_name || fieldErrors?.contact_name" class="text-xs text-red-400 mt-1">
            {{ localErrors.contact_name || fieldErrors?.contact_name?.[0] }}
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
              :class="{ 'border-red-500': localErrors.contact_email || fieldErrors?.contact_email }"
              @blur="handleEmailBlur"
              @input="localErrors.contact_email = ''"
            >
            <p v-if="localErrors.contact_email || fieldErrors?.contact_email" class="text-xs text-red-400 mt-1">
              {{ localErrors.contact_email || fieldErrors?.contact_email?.[0] }}
            </p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">
              Teléfono móvil / directo
            </label>
            <input
              :value="contactPhone"
              type="tel"
              placeholder="0414-1234567"
              class="w-full px-3.5 py-2.5 rounded-xl bg-[#131d33] border border-slate-700/70 text-white font-mono placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
              :class="{ 'border-red-500': localErrors.contact_phone || fieldErrors?.contact_phone }"
              @input="handleContactPhoneInput"
              @blur="handleContactPhoneBlur"
            >
            <p v-if="localErrors.contact_phone || fieldErrors?.contact_phone" class="text-xs text-red-400 mt-1">
              {{ localErrors.contact_phone || fieldErrors?.contact_phone?.[0] }}
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
