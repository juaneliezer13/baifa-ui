<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'auth'
})

useHead({
  title: 'Iniciar Sesión - Baifa'
})

const { login } = useAuth()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const autofillDemo = () => {
  email.value = 'admin@admin'
  password.value = '12345678'
  errorMessage.value = ''
}

const handleLogin = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Por favor ingresa tu correo y contraseña.'
    return
  }

  errorMessage.value = ''
  isLoading.value = true

  try {
    const result = await login({
      email: email.value,
      password: password.value
    })

    if (result.success) {
      await navigateTo('/')
    } else {
      errorMessage.value = result.message || 'Credenciales inválidas.'
    }
  } catch (err: unknown) {
    errorMessage.value = 'Ocurrió un error al intentar iniciar sesión.'
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
        Iniciar Sesión
      </h2>
      <p class="text-xs text-slate-400 mt-1.5">
        Ingresa tus credenciales para acceder a la plataforma
      </p>
    </div>

    <!-- Píldora de ayuda con credenciales de prueba -->
    <div class="mb-5 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
      <div class="text-slate-400 truncate pr-2">
        <span class="text-slate-300 font-medium">Demo:</span> admin@admin / 12345678
      </div>
      <button
        type="button"
        class="px-2.5 py-1 text-[11px] font-semibold text-orange-400 hover:text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-lg transition-colors cursor-pointer shrink-0"
        @click="autofillDemo"
      >
        Autocompletar
      </button>
    </div>

    <!-- Alerta de error -->
    <div
      v-if="errorMessage"
      class="mb-5 p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center gap-2"
    >
      <v-icon icon="mdi-alert-circle-outline" size="18" class="text-red-400 shrink-0" />
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Formulario -->
    <form class="space-y-4" @submit.prevent="handleLogin">
      <!-- Campo Correo Electrónico -->
      <div>
        <label for="email" class="block text-xs font-medium text-slate-300 mb-1.5">
          Correo electrónico o usuario
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <v-icon icon="mdi-email-outline" size="18" />
          </div>
          <input
            id="email"
            v-model="email"
            type="text"
            required
            autocomplete="username"
            placeholder="admin@admin"
            class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#161e31] border border-slate-700/80 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
          >
        </div>
      </div>

      <!-- Campo Contraseña -->
      <div>
        <label for="password" class="block text-xs font-medium text-slate-300 mb-1.5">
          Contraseña
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <v-icon icon="mdi-lock-outline" size="18" />
          </div>
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            required
            autocomplete="current-password"
            placeholder="••••••••"
            class="w-full pl-10 pr-11 py-2.5 rounded-xl bg-[#161e31] border border-slate-700/80 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
          >
          <button
            type="button"
            class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            @click="showPassword = !showPassword"
          >
            <v-icon :icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'" size="18" />
          </button>
        </div>
      </div>

      <!-- Opciones adicionales: Recordarme / Olvidé contraseña -->
      <div class="flex items-center justify-between text-xs pt-1">
        <label class="flex items-center gap-2 cursor-pointer select-none text-slate-400 hover:text-slate-300">
          <input
            v-model="rememberMe"
            type="checkbox"
            class="rounded border-slate-700 bg-[#161e31] text-orange-500 focus:ring-orange-500"
          >
          <span>Recordar sesión</span>
        </label>
        <NuxtLink
          to="/forgot-password"
          class="text-orange-400 hover:text-orange-300 font-medium transition-colors"
        >
          ¿Olvidaste tu contraseña?
        </NuxtLink>
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
          <span>{{ isLoading ? 'Comprobando...' : 'Iniciar Sesión' }}</span>
        </button>
      </div>
    </form>

    <!-- Enlace a registro -->
    <div class="mt-6 pt-5 border-t border-slate-800 text-center text-xs text-slate-400">
      <span>¿No tienes una cuenta de cliente? </span>
      <NuxtLink to="/register" class="text-orange-400 hover:text-orange-300 font-medium transition-colors">
        Registrarse
      </NuxtLink>
    </div>
  </div>
</template>
