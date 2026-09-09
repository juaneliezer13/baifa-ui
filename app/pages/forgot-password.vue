<script setup lang="ts">
import { ref } from 'vue'

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
    // Simulación de llamada al backend para envío de email de recuperación
    await new Promise((resolve) => setTimeout(resolve, 800))
    isSubmitted.value = true
  } catch (err: unknown) {
    errorMessage.value = 'Ocurrió un error al procesar la solicitud. Intenta nuevamente.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
    <!-- Encabezado -->
    <div class="text-center mb-6">
      <div class="w-12 h-12 mx-auto mb-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center">
        <v-icon icon="mdi-lock-reset" size="26" />
      </div>
      <h2 class="text-2xl font-bold text-white tracking-tight">
        Recuperar Contraseña
      </h2>
      <p class="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-xs mx-auto">
        Ingresa tu correo registrado y te enviaremos un enlace seguro para restablecerla
      </p>
    </div>

    <!-- Estado Exitoso -->
    <div
      v-if="isSubmitted"
      class="p-5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-center space-y-3"
    >
      <div class="w-10 h-10 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
        <v-icon icon="mdi-email-check-outline" size="22" />
      </div>
      <h3 class="text-sm font-semibold text-white">
        Correo enviado
      </h3>
      <p class="text-xs text-slate-300 leading-normal">
        Hemos enviado las instrucciones de recuperación a <strong class="text-orange-400">{{ email }}</strong>. Por favor revisa tu bandeja de entrada o carpeta de spam.
      </p>
      <div class="pt-3">
        <NuxtLink
          to="/login"
          class="inline-block px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/20 cursor-pointer"
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
        class="p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center gap-2"
      >
        <v-icon icon="mdi-alert-circle-outline" size="18" class="text-red-400 shrink-0" />
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Campo Correo -->
      <div>
        <label for="recoveryEmail" class="block text-xs font-medium text-slate-300 mb-1.5">
          Correo electrónico registrado
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <v-icon icon="mdi-email-outline" size="18" />
          </div>
          <input
            id="recoveryEmail"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            placeholder="ejemplo@baifa.com.ve"
            class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#161e31] border border-slate-700/80 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
          >
        </div>
      </div>

      <!-- Botón Enviar -->
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
          <span>{{ isLoading ? 'Enviando...' : 'Enviar enlace de recuperación' }}</span>
        </button>
      </div>
    </form>

    <!-- Enlace Volver -->
    <div class="mt-6 pt-5 border-t border-slate-800 text-center text-xs text-slate-400">
      <NuxtLink
        to="/login"
        class="inline-flex items-center gap-1.5 text-orange-400 hover:text-orange-300 font-medium transition-colors"
      >
        <v-icon icon="mdi-arrow-left" size="16" />
        <span>Regresar al Inicio de Sesión</span>
      </NuxtLink>
    </div>
  </div>
</template>
