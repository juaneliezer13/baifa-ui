<script setup lang="ts">
import { ref } from 'vue'
import AppLogo from '~/components/common/AppLogo.vue'

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

const handleRifInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  rif.value = target.value.toUpperCase()
}

const handleRegister = async () => {
  if (!companyFiscalName.value.trim()) {
    localError.value = 'La razón social de la empresa es obligatoria.'
    return
  }

  if (!rif.value.trim()) {
    localError.value = 'El número de RIF es obligatorio.'
    return
  }

  const rifRegex = /^[JGVEPjgvep]-\d{8,9}-\d$/
  if (!rifRegex.test(rif.value.trim())) {
    localError.value = 'El RIF debe tener un formato válido venezolano (ej. J-12345678-9).'
    return
  }

  if (password.value !== passwordConfirm.value) {
    localError.value = 'Las contraseñas no coinciden.'
    return
  }

  if (password.value.length < 8) {
    localError.value = 'La contraseña debe tener al menos 8 caracteres.'
    return
  }

  localError.value = ''

  const result = await register({
    name: fullName.value.trim(),
    email: email.value.trim(),
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
    <form v-else class="space-y-4" @submit.prevent="handleRegister">
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
          <span>Datos de la Empresa</span>
        </div>

        <div class="space-y-3">
          <!-- Razón Social -->
          <div>
            <label for="companyFiscalName" class="block text-xs font-medium text-slate-300 mb-1.5">
              Razón Social de la empresa <span class="text-[#3eb134]">*</span>
            </label>
            <input
              id="companyFiscalName"
              v-model="companyFiscalName"
              type="text"
              required
              placeholder="Ej: Inversiones Metalúrgicas C.A."
              class="w-full px-3.5 py-2.5 rounded-xl bg-[#161e31] border border-slate-700/80 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#3eb134] focus:ring-1 focus:ring-[#3eb134] transition-colors"
              :class="{ 'border-red-500': fieldErrors?.company_fiscal_name }"
            >
            <p v-if="fieldErrors?.company_fiscal_name" class="text-xs text-red-400 mt-1">
              {{ fieldErrors.company_fiscal_name.join(', ') }}
            </p>
          </div>

          <!-- RIF y Teléfono en dos columnas -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label for="rif" class="block text-xs font-medium text-slate-300 mb-1.5">
                RIF <span class="text-[#3eb134]">*</span>
              </label>
              <input
                id="rif"
                :value="rif"
                type="text"
                required
                placeholder="J-12345678-9"
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#161e31] border border-slate-700/80 text-white text-sm placeholder-slate-500 uppercase font-mono focus:outline-none focus:border-[#3eb134] focus:ring-1 focus:ring-[#3eb134] transition-colors"
                :class="{ 'border-red-500': fieldErrors?.rif }"
                @input="handleRifInput"
              >
              <p v-if="fieldErrors?.rif" class="text-xs text-red-400 mt-1">
                {{ fieldErrors.rif.join(', ') }}
              </p>
            </div>

            <div>
              <label for="phone" class="block text-xs font-medium text-slate-300 mb-1.5">
                Teléfono de empresa
              </label>
              <input
                id="phone"
                v-model="phone"
                type="tel"
                placeholder="0212-5551234"
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#161e31] border border-slate-700/80 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#3eb134] focus:ring-1 focus:ring-[#3eb134] transition-colors"
                :class="{ 'border-red-500': fieldErrors?.phone }"
              >
              <p v-if="fieldErrors?.phone" class="text-xs text-red-400 mt-1">
                {{ fieldErrors.phone.join(', ') }}
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
              :class="{ 'border-red-500': fieldErrors?.name }"
            >
            <p v-if="fieldErrors?.name" class="text-xs text-red-400 mt-1">
              {{ fieldErrors.name.join(', ') }}
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
              :class="{ 'border-red-500': fieldErrors?.email }"
            >
            <p v-if="fieldErrors?.email" class="text-xs text-red-400 mt-1">
              {{ fieldErrors.email.join(', ') }}
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
                :class="{ 'border-red-500': fieldErrors?.password }"
              >
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                @click="showPassword = !showPassword"
              >
                <v-icon :icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'" size="18" />
              </button>
            </div>
            <p v-if="fieldErrors?.password" class="text-xs text-red-400 mt-1">
              {{ fieldErrors.password.join(', ') }}
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
              :class="{ 'border-red-500': fieldErrors?.password_confirmation }"
            >
            <p v-if="fieldErrors?.password_confirmation" class="text-xs text-red-400 mt-1">
              {{ fieldErrors.password_confirmation.join(', ') }}
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
