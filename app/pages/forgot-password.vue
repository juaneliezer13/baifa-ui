<script setup lang="ts">
import { ref } from 'vue'
import AppLogo from '~/components/common/AppLogo.vue'

definePageMeta({
  layout: 'auth'
})

useHead({
  title: 'Recuperar Contraseña - Baifa'
})

const email = ref('')
const isLoading = ref(false)
const isSubmitted = ref(false)
const errorMessage = ref('')

const handleRecoverPassword = async () => {
  if (!email.value) {
    errorMessage.value = 'Por favor ingresa tu correo electrónico.'
    return
  }

  errorMessage.value = ''
  isLoading.value = true

  try {
    await new Promise((resolve) => setTimeout(resolve, 600))
    isSubmitted.value = true
  } catch (err: unknown) {
    errorMessage.value = 'Ocurrió un error al procesar la solicitud.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-sm mx-auto">
    <!-- Logotipo Verde de Baifa -->
    <div class="mb-5">
      <AppLogo variant="green" size="lg" />
    </div>

    <!-- Icono de Candado Verde -->
    <div class="w-12 h-12 rounded-xl bg-[#3eb134]/15 border border-[#3eb134]/30 text-[#3eb134] flex items-center justify-center mb-5">
      <v-icon icon="mdi-lock-outline" size="24" />
    </div>

    <!-- Título y Subtítulo -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-white tracking-tight">
        Recuperar contraseña
      </h2>
      <p class="text-sm text-slate-400 mt-1.5 font-normal leading-relaxed">
        Ingresa tu correo registrado y te enviaremos un enlace para restablecer tu contraseña.
      </p>
    </div>

    <!-- Estado Exitoso -->
    <div
      v-if="isSubmitted"
      class="p-6 rounded-2xl bg-[#0b1f13]/80 border border-[#3eb134]/30 text-center space-y-3"
    >
      <div class="w-12 h-12 mx-auto rounded-full bg-[#3eb134]/20 text-[#3eb134] flex items-center justify-center">
        <v-icon icon="mdi-email-check-outline" size="26" />
      </div>
      <h3 class="text-base font-semibold text-white">
        Correo enviado
      </h3>
      <p class="text-xs text-slate-300 leading-relaxed">
        Hemos enviado un enlace seguro a <strong class="text-[#3eb134]">{{ email }}</strong> para restablecer tu contraseña.
      </p>
      <div class="pt-3">
        <NuxtLink
          to="/login"
          class="inline-block px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#3eb134] hover:bg-[#349b2c] transition-colors shadow-md shadow-[#3eb134]/25"
        >
          Volver a Iniciar Sesión
        </NuxtLink>
      </div>
    </div>

    <!-- Formulario de Recuperación -->
    <form v-else class="space-y-4" @submit.prevent="handleRecoverPassword">
      <!-- Alerta de error -->
      <div
        v-if="errorMessage"
        class="p-3 rounded-xl bg-red-950/50 border border-red-800/50 text-red-300 text-xs flex items-center gap-2"
      >
        <v-icon icon="mdi-alert-circle-outline" size="18" class="text-red-400 shrink-0" />
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Correo Electrónico -->
      <div>
        <label for="recoveryEmail" class="block text-xs font-medium text-slate-300 mb-1.5">
          Correo electrónico
        </label>
        <input
          id="recoveryEmail"
          v-model="email"
          type="email"
          required
          placeholder="nombre@empresa.com"
          class="w-full px-3.5 py-2.5 rounded-xl bg-[#161e31] border border-slate-700/80 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#3eb134] focus:ring-1 focus:ring-[#3eb134] transition-colors"
        >
      </div>

      <!-- Botón Enviar Enlace -->
      <div class="pt-2">
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
          <span>{{ isLoading ? 'Enviando...' : 'Enviar enlace de recuperación' }}</span>
        </button>
      </div>
    </form>

    <!-- Enlace Volver -->
    <div class="mt-8 text-center text-xs">
      <NuxtLink
        to="/login"
        class="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
      >
        <v-icon icon="mdi-chevron-left" size="16" />
        <span>Volver al inicio de sesión</span>
      </NuxtLink>
    </div>
  </div>
</template>
