<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'auth'
})

useHead({
  title: 'Registro de Cliente - Baifa'
})

const companyName = ref('')
const rif = ref('')
const contactName = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const passwordConfirm = ref('')
const acceptTerms = ref(false)
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const isSuccess = ref(false)

const handleRegister = async () => {
  if (password.value !== passwordConfirm.value) {
    errorMessage.value = 'Las contraseñas no coinciden.'
    return
  }

  if (!acceptTerms.value) {
    errorMessage.value = 'Debes aceptar los términos y condiciones del servicio.'
    return
  }

  errorMessage.value = ''
  isLoading.value = true

  try {
    // Simulación o llamada a API
    await new Promise((resolve) => setTimeout(resolve, 800))
    isSuccess.value = true
  } catch (err: unknown) {
    errorMessage.value = 'Ocurrió un error al registrar la cuenta. Inténtalo de nuevo.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
    <!-- Título y subtítulo -->
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold text-white tracking-tight">
        Crear Cuenta de Cliente
      </h2>
      <p class="text-xs text-slate-400 mt-1.5">
        Registra tu empresa para acceder al tracking de tus generadores
      </p>
    </div>

    <!-- Notificación de éxito -->
    <div
      v-if="isSuccess"
      class="p-5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-center space-y-3"
    >
      <div class="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
        <v-icon icon="mdi-check-circle-outline" size="28" />
      </div>
      <h3 class="text-sm font-semibold text-white">
        ¡Solicitud de registro enviada!
      </h3>
      <p class="text-xs text-slate-300">
        Tu cuenta corporativa ha sido creada. Nuestro equipo validará los datos fiscales de tu empresa.
      </p>
      <div class="pt-2">
        <NuxtLink
          to="/login"
          class="inline-block px-5 py-2 rounded-xl text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
        >
          Ir al Inicio de Sesión
        </NuxtLink>
      </div>
    </div>

    <!-- Formulario -->
    <form v-else class="space-y-4" @submit.prevent="handleRegister">
      <!-- Alerta de error -->
      <div
        v-if="errorMessage"
        class="p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center gap-2"
      >
        <v-icon icon="mdi-alert-circle-outline" size="18" class="text-red-400 shrink-0" />
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Datos de Empresa: Razón social y RIF -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label for="companyName" class="block text-xs font-medium text-slate-300 mb-1">
            Razón Social / Empresa
          </label>
          <input
            id="companyName"
            v-model="companyName"
            type="text"
            required
            placeholder="ej. Constructora Alfa C.A."
            class="w-full px-3.5 py-2.5 rounded-xl bg-[#161e31] border border-slate-700/80 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
          >
        </div>

        <div>
          <label for="rif" class="block text-xs font-medium text-slate-300 mb-1">
            RIF / Doc. Fiscal
          </label>
          <input
            id="rif"
            v-model="rif"
            type="text"
            required
            placeholder="J-12345678-9"
            class="w-full px-3.5 py-2.5 rounded-xl bg-[#161e31] border border-slate-700/80 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors uppercase"
          >
        </div>
      </div>

      <!-- Persona de Contacto -->
      <div>
        <label for="contactName" class="block text-xs font-medium text-slate-300 mb-1">
          Persona de Contacto
        </label>
        <input
          id="contactName"
          v-model="contactName"
          type="text"
          required
          placeholder="Nombre y apellido del representante"
          class="w-full px-3.5 py-2.5 rounded-xl bg-[#161e31] border border-slate-700/80 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
        >
      </div>

      <!-- Contacto: Email y Teléfono -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label for="regEmail" class="block text-xs font-medium text-slate-300 mb-1">
            Correo corporativo
          </label>
          <input
            id="regEmail"
            v-model="email"
            type="email"
            required
            placeholder="contacto@empresa.com"
            class="w-full px-3.5 py-2.5 rounded-xl bg-[#161e31] border border-slate-700/80 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
          >
        </div>

        <div>
          <label for="regPhone" class="block text-xs font-medium text-slate-300 mb-1">
            Teléfono directo
          </label>
          <input
            id="regPhone"
            v-model="phone"
            type="tel"
            required
            placeholder="+58 414-1234567"
            class="w-full px-3.5 py-2.5 rounded-xl bg-[#161e31] border border-slate-700/80 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
          >
        </div>
      </div>

      <!-- Contraseña y confirmación -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label for="regPassword" class="block text-xs font-medium text-slate-300 mb-1">
            Contraseña
          </label>
          <input
            id="regPassword"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            required
            minlength="8"
            placeholder="Mínimo 8 caracteres"
            class="w-full px-3.5 py-2.5 rounded-xl bg-[#161e31] border border-slate-700/80 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
          >
        </div>

        <div>
          <label for="regPasswordConfirm" class="block text-xs font-medium text-slate-300 mb-1">
            Confirmar Contraseña
          </label>
          <input
            id="regPasswordConfirm"
            v-model="passwordConfirm"
            :type="showPassword ? 'text' : 'password'"
            required
            placeholder="Repetir contraseña"
            class="w-full px-3.5 py-2.5 rounded-xl bg-[#161e31] border border-slate-700/80 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
          >
        </div>
      </div>

      <!-- Checkbox Aceptación -->
      <div class="pt-1">
        <label class="flex items-start gap-2.5 cursor-pointer select-none text-xs text-slate-400 leading-tight">
          <input
            v-model="acceptTerms"
            type="checkbox"
            required
            class="mt-0.5 rounded border-slate-700 bg-[#161e31] text-orange-500 focus:ring-orange-500"
          >
          <span>Acepto las políticas de uso y tratamiento de datos de Baifa Logistics Platform.</span>
        </label>
      </div>

      <!-- Botón de Envío -->
      <div class="pt-2">
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 active:scale-[0.99] transition-all duration-150 shadow-md shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          <v-progress-circular
            v-if="isLoading"
            indeterminate
            size="18"
            width="2"
            color="white"
          />
          <span>{{ isLoading ? 'Registrando...' : 'Crear Cuenta Corporativa' }}</span>
        </button>
      </div>
    </form>

    <!-- Enlace a login -->
    <div class="mt-6 pt-5 border-t border-slate-800 text-center text-xs text-slate-400">
      <span>¿Ya tienes una cuenta registrada? </span>
      <NuxtLink to="/login" class="text-orange-400 hover:text-orange-300 font-medium transition-colors">
        Iniciar Sesión
      </NuxtLink>
    </div>
  </div>
</template>
