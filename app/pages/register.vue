<script setup lang="ts">
import { ref, reactive } from 'vue'
import AppLogo from '~/components/common/AppLogo.vue'
import {
  formatRifOrCedula,
  validateRifOrCedula,
  formatPhone,
  validatePhone,
  validateEmail,
  validatePersonName,
  validateCompanyName
} from '~/utils/validators'

definePageMeta({
  layout: 'auth'
})

useHead({
  title: 'Solicitar Acceso - Baifa'
})

const { register, isLoading, errorMessage, fieldErrors } = useAuth()

const companyFiscalName = ref('')
const rif = ref('')
const phone = ref('')
const fullName = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const showPassword = ref(false)
const localError = ref('')
const isSuccess = ref(false)

const localFieldErrors = reactive<{
  company_fiscal_name: string
  rif: string
  phone: string
  name: string
  email: string
  password: string
  password_confirmation: string
}>({
  company_fiscal_name: '',
  rif: '',
  phone: '',
  name: '',
  email: '',
  password: '',
  password_confirmation: ''
})

const clearLocalFieldErrors = () => {
  localFieldErrors.company_fiscal_name = ''
  localFieldErrors.rif = ''
  localFieldErrors.phone = ''
  localFieldErrors.name = ''
  localFieldErrors.email = ''
  localFieldErrors.password = ''
  localFieldErrors.password_confirmation = ''
}

const handleFiscalNameBlur = () => {
  if (!companyFiscalName.value.trim()) return
  localFieldErrors.company_fiscal_name = validateCompanyName(companyFiscalName.value, 3, 'La razón social') || ''
}

const handleRifInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const formatted = formatRifOrCedula(target.value)
  rif.value = formatted
  target.value = formatted
  if (localFieldErrors.rif) {
    localFieldErrors.rif = validateRifOrCedula(rif.value) || ''
  }
}

const handleRifBlur = () => {
  if (!rif.value.trim()) return
  localFieldErrors.rif = validateRifOrCedula(rif.value) || ''
}

const handlePhoneInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const formatted = formatPhone(target.value)
  phone.value = formatted
  target.value = formatted
  if (localFieldErrors.phone) {
    localFieldErrors.phone = validatePhone(phone.value, false) || ''
  }
}

const handlePhoneBlur = () => {
  localFieldErrors.phone = validatePhone(phone.value, false) || ''
}

const handleNameBlur = () => {
  if (!fullName.value.trim()) return
  localFieldErrors.name = validatePersonName(fullName.value, 'El nombre y apellido') || ''
}

const handleEmailBlur = () => {
  if (!email.value.trim()) return
  localFieldErrors.email = validateEmail(email.value) || ''
}

const handleRegister = async () => {
  localError.value = ''
  clearLocalFieldErrors()

  const fiscalErr = validateCompanyName(companyFiscalName.value, 3, 'La razón social o nombre fiscal')
  const rifErr = validateRifOrCedula(rif.value, true)
  const phoneErr = validatePhone(phone.value, false)
  const nameErr = validatePersonName(fullName.value, 'El nombre y apellido de contacto')
  const emailErr = validateEmail(email.value, true)

  if (fiscalErr) localFieldErrors.company_fiscal_name = fiscalErr
  if (rifErr) localFieldErrors.rif = rifErr
  if (phoneErr) localFieldErrors.phone = phoneErr
  if (nameErr) localFieldErrors.name = nameErr
  if (emailErr) localFieldErrors.email = emailErr

  if (password.value.length < 8) {
    localFieldErrors.password = 'La contraseña debe tener al menos 8 caracteres.'
  }

  if (!passwordConfirm.value || password.value !== passwordConfirm.value) {
    localFieldErrors.password_confirmation = 'Las contraseñas ingresadas no coinciden.'
  }

  if (
    localFieldErrors.company_fiscal_name ||
    localFieldErrors.rif ||
    localFieldErrors.phone ||
    localFieldErrors.name ||
    localFieldErrors.email ||
    localFieldErrors.password ||
    localFieldErrors.password_confirmation
  ) {
    return
  }

  const result = await register({
    name: fullName.value.trim(),
    email: email.value.trim().toLowerCase(),
    company_fiscal_name: companyFiscalName.value.trim(),
    rif: rif.value.trim().toUpperCase(),
    phone: phone.value.trim() || undefined,
    password: password.value,
    password_confirmation: passwordConfirm.value,
    role: 'client'
  })

  if (result.success) {
    isSuccess.value = true
  }
}
</script>

<template>
  <div class="w-full max-w-md mx-auto">
    <!-- Logotipo Verde de Baifa -->
    <div class="mb-5">
      <AppLogo variant="green" size="lg" />
    </div>

    <!-- Título y Subtítulo -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-white tracking-tight">
        Solicitar acceso
      </h2>
      <p class="text-sm text-slate-400 mt-1.5 font-normal">
        Registra tu empresa y crea tu cuenta de acceso cliente en BaiFa
      </p>
    </div>

    <!-- Estado Exitoso -->
    <div
      v-if="isSuccess"
      class="p-6 rounded-2xl bg-[#0b1f13]/80 border border-[#3eb134]/30 text-center space-y-3"
    >
      <div class="w-12 h-12 mx-auto rounded-full bg-[#3eb134]/20 text-[#3eb134] flex items-center justify-center">
        <v-icon icon="mdi-check-circle-outline" size="28" />
      </div>
      <h3 class="text-base font-semibold text-white">
        ¡Registro completado con éxito!
      </h3>
      <p class="text-xs text-slate-300 leading-relaxed">
        Tu empresa <span class="font-semibold text-[#3eb134]">{{ companyFiscalName }}</span> y tu cuenta de usuario han sido creadas en el sistema.
      </p>
      <div class="pt-3">
        <NuxtLink
          to="/login"
          class="inline-block px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#3eb134] hover:bg-[#349b2c] transition-colors shadow-md shadow-[#3eb134]/25"
        >
          Ir a Iniciar Sesión
        </NuxtLink>
      </div>
    </div>

    <!-- Formulario de Registro -->
    <form v-else class="space-y-4" novalidate @submit.prevent="handleRegister">
      <!-- Alerta de error -->
      <div
        v-if="localError || errorMessage"
        class="p-3 rounded-xl bg-red-950/50 border border-red-800/50 text-red-300 text-xs flex items-center gap-2"
      >
        <v-icon icon="mdi-alert-circle-outline" size="18" class="text-red-400 shrink-0" />
        <span>{{ localError || errorMessage }}</span>
      </div>

      <!-- SECCIÓN: DATOS DE LA EMPRESA -->
      <div class="pt-1">
        <div class="text-[11px] font-bold text-[#3eb134] tracking-wider uppercase mb-3 flex items-center gap-1.5">
          <v-icon icon="mdi-domain" size="15" />
          <span>Datos de la Empresa / Cliente</span>
        </div>

        <div class="space-y-3">
          <!-- Razón Social -->
          <div>
            <label for="companyFiscalName" class="block text-xs font-medium text-slate-300 mb-1.5">
              Razón Social o Nombre Fiscal <span class="text-[#3eb134]">*</span>
            </label>
            <input
              id="companyFiscalName"
              v-model="companyFiscalName"
              type="text"
              required
              placeholder="Ej: Inversiones Metalúrgicas C.A."
              class="w-full px-3.5 py-2.5 rounded-xl bg-[#161e31] border border-slate-700/80 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#3eb134] focus:ring-1 focus:ring-[#3eb134] transition-colors"
              :class="{ 'border-red-500': localFieldErrors.company_fiscal_name || fieldErrors?.company_fiscal_name }"
              @blur="handleFiscalNameBlur"
              @input="localFieldErrors.company_fiscal_name = ''"
            >
            <p v-if="localFieldErrors.company_fiscal_name || fieldErrors?.company_fiscal_name" class="text-xs text-red-400 mt-1">
              {{ localFieldErrors.company_fiscal_name || fieldErrors?.company_fiscal_name?.join(', ') }}
            </p>
          </div>

          <!-- RIF / Cédula y Teléfono en dos columnas -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label for="rif" class="block text-xs font-medium text-slate-300 mb-1.5">
                RIF o Cédula <span class="text-[#3eb134]">*</span>
              </label>
              <input
                id="rif"
                :value="rif"
                type="text"
                required
                placeholder="J-12345678-9 o V-12345678"
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#161e31] border border-slate-700/80 text-white text-sm placeholder-slate-500 uppercase font-mono focus:outline-none focus:border-[#3eb134] focus:ring-1 focus:ring-[#3eb134] transition-colors"
                :class="{ 'border-red-500': localFieldErrors.rif || fieldErrors?.rif }"
                @input="handleRifInput"
                @blur="handleRifBlur"
              >
              <p v-if="localFieldErrors.rif || fieldErrors?.rif" class="text-xs text-red-400 mt-1">
                {{ localFieldErrors.rif || fieldErrors?.rif?.join(', ') }}
              </p>
            </div>

            <div>
              <label for="phone" class="block text-xs font-medium text-slate-300 mb-1.5">
                Teléfono de contacto
              </label>
              <input
                id="phone"
                :value="phone"
                type="tel"
                placeholder="0414-1234567 / 0212-5551234"
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#161e31] border border-slate-700/80 text-white text-sm font-mono placeholder-slate-500 focus:outline-none focus:border-[#3eb134] focus:ring-1 focus:ring-[#3eb134] transition-colors"
                :class="{ 'border-red-500': localFieldErrors.phone || fieldErrors?.phone }"
                @input="handlePhoneInput"
                @blur="handlePhoneBlur"
              >
              <p v-if="localFieldErrors.phone || fieldErrors?.phone" class="text-xs text-red-400 mt-1">
                {{ localFieldErrors.phone || fieldErrors?.phone?.join(', ') }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- SECCIÓN: PERSONA DE CONTACTO -->
      <div class="pt-3 border-t border-slate-800">
        <div class="text-[11px] font-bold text-[#3eb134] tracking-wider uppercase mb-3 flex items-center gap-1.5">
          <v-icon icon="mdi-account-tie-outline" size="15" />
          <span>Persona de Contacto</span>
        </div>

        <div class="space-y-3">
          <!-- Nombre Completo -->
          <div>
            <label for="fullName" class="block text-xs font-medium text-slate-300 mb-1.5">
              Nombre y apellido <span class="text-[#3eb134]">*</span>
            </label>
            <input
              id="fullName"
              v-model="fullName"
              type="text"
              required
              placeholder="Ej: María González"
              class="w-full px-3.5 py-2.5 rounded-xl bg-[#161e31] border border-slate-700/80 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#3eb134] focus:ring-1 focus:ring-[#3eb134] transition-colors"
              :class="{ 'border-red-500': localFieldErrors.name || fieldErrors?.name }"
              @blur="handleNameBlur"
              @input="localFieldErrors.name = ''"
            >
            <p v-if="localFieldErrors.name || fieldErrors?.name" class="text-xs text-red-400 mt-1">
              {{ localFieldErrors.name || fieldErrors?.name?.join(', ') }}
            </p>
          </div>

          <!-- Correo Electrónico -->
          <div>
            <label for="regEmail" class="block text-xs font-medium text-slate-300 mb-1.5">
              Correo electrónico corporativo <span class="text-[#3eb134]">*</span>
            </label>
            <input
              id="regEmail"
              v-model="email"
              type="email"
              required
              placeholder="nombre@empresa.com"
              class="w-full px-3.5 py-2.5 rounded-xl bg-[#161e31] border border-slate-700/80 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#3eb134] focus:ring-1 focus:ring-[#3eb134] transition-colors"
              :class="{ 'border-red-500': localFieldErrors.email || fieldErrors?.email }"
              @blur="handleEmailBlur"
              @input="localFieldErrors.email = ''"
            >
            <p v-if="localFieldErrors.email || fieldErrors?.email" class="text-xs text-red-400 mt-1">
              {{ localFieldErrors.email || fieldErrors?.email?.join(', ') }}
            </p>
          </div>
        </div>
      </div>

      <!-- SECCIÓN: CONTRASEÑA -->
      <div class="pt-3 border-t border-slate-800">
        <div class="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-3 flex items-center gap-1.5">
          <v-icon icon="mdi-lock-outline" size="15" />
          <span>Seguridad de Acceso</span>
        </div>

        <div class="space-y-3">
          <!-- Contraseña -->
          <div>
            <label for="password" class="block text-xs font-medium text-slate-300 mb-1.5">
              Contraseña <span class="text-[#3eb134]">*</span>
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                minlength="8"
                placeholder="Mínimo 8 caracteres"
                class="w-full px-3.5 pr-10 py-2.5 rounded-xl bg-[#161e31] border border-slate-700/80 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#3eb134] focus:ring-1 focus:ring-[#3eb134] transition-colors"
                :class="{ 'border-red-500': localFieldErrors.password || fieldErrors?.password }"
                @input="localFieldErrors.password = ''"
              >
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                @click="showPassword = !showPassword"
              >
                <v-icon :icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'" size="18" />
              </button>
            </div>
            <p v-if="localFieldErrors.password || fieldErrors?.password" class="text-xs text-red-400 mt-1">
              {{ localFieldErrors.password || fieldErrors?.password?.join(', ') }}
            </p>
          </div>

          <!-- Confirmar Contraseña -->
          <div>
            <label for="passwordConfirm" class="block text-xs font-medium text-slate-300 mb-1.5">
              Confirmar contraseña <span class="text-[#3eb134]">*</span>
            </label>
            <input
              id="passwordConfirm"
              v-model="passwordConfirm"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="Repite la contraseña"
              class="w-full px-3.5 py-2.5 rounded-xl bg-[#161e31] border border-slate-700/80 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#3eb134] focus:ring-1 focus:ring-[#3eb134] transition-colors"
              :class="{ 'border-red-500': localFieldErrors.password_confirmation || fieldErrors?.password_confirmation }"
              @input="localFieldErrors.password_confirmation = ''"
            >
            <p v-if="localFieldErrors.password_confirmation || fieldErrors?.password_confirmation" class="text-xs text-red-400 mt-1">
              {{ localFieldErrors.password_confirmation || fieldErrors?.password_confirmation?.join(', ') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Botón Enviar Solicitud -->
      <div class="pt-3">
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-[#3eb134] hover:bg-[#349b2c] active:scale-[0.99] transition-all duration-150 shadow-md shadow-[#3eb134]/25 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          <v-progress-circular
            v-if="isLoading"
            indeterminate
            size="18"
            width="2"
            color="white"
          />
          <span>{{ isLoading ? 'Registrando cliente...' : 'Registrar empresa y crear cuenta' }}</span>
        </button>
      </div>
    </form>

    <!-- Enlace Iniciar Sesión -->
    <div class="mt-6 text-center text-xs text-slate-400">
      <span>¿Ya tienes cuenta?</span>
      <NuxtLink to="/login" class="text-[#3eb134] hover:text-[#349b2c] font-semibold ml-1.5 transition-colors">
        Iniciar sesión
      </NuxtLink>
    </div>
  </div>
</template>
