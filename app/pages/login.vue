<script setup lang="ts">
import { ref } from 'vue'
import AppLogo from '~/components/common/AppLogo.vue'

definePageMeta({
  layout: 'auth'
})

useHead({
  title: 'Iniciar Sesión - Baifa'
})

const { login, isLoading, errorMessage, fieldErrors } = useAuth()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const localError = ref('')

const autofillDemo = (type: 'admin' | 'baifa' = 'baifa') => {
  if (type === 'baifa') {
    email.value = 'admin@baifa.com.ve'
    password.value = '12345678'
  } else {
    email.value = 'admin@admin'
    password.value = '12345678'
  }
  localError.value = ''
}

const handleLogin = async () => {
  if (!email.value || !password.value) {
    localError.value = 'Por favor ingresa tu correo y contraseña.'
    return
  }

  localError.value = ''

  const result = await login({
    email: email.value,
    password: password.value,
    deviceName: 'web'
  })

  if (result.success) {
    await navigateTo('/')
  }
}
</script>

<template>
  <div class="w-full max-w-sm mx-auto">
    <!-- Logotipo Verde de Baifa -->
    <div class="mb-6">
      <AppLogo variant="green" size="lg" />
    </div>

    <!-- Título y Subtítulo -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-white tracking-tight">
        Iniciar sesión
      </h2>
      <p class="text-sm text-slate-400 mt-1.5 font-normal">
        Accede a tu cuenta en BaiFa
      </p>
    </div>

    <!-- Alerta de error -->
    <div
      v-if="localError || errorMessage"
      class="mb-5 p-3 rounded-xl bg-red-950/50 border border-red-800/50 text-red-300 text-xs flex items-center gap-2"
    >
      <v-icon icon="mdi-alert-circle-outline" size="18" class="text-red-400 shrink-0" />
      <span>{{ localError || errorMessage }}</span>
    </div>

    <!-- Formulario -->
    <form class="space-y-4" @submit.prevent="handleLogin">
      <!-- Campo Correo Electrónico -->
      <div>
        <label for="email" class="block text-xs font-medium text-slate-300 mb-1.5">
          Correo electrónico
        </label>
        <input
          id="email"
          v-model="email"
          type="text"
          required
          autocomplete="username"
          placeholder="usuario@baifa.com.ve"
          class="w-full px-3.5 py-2.5 rounded-xl bg-[#161e31] border border-slate-700/80 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#3eb134] focus:ring-1 focus:ring-[#3eb134] transition-colors"
          :class="{ 'border-red-500': fieldErrors?.email }"
        >
        <p v-if="fieldErrors?.email" class="text-xs text-red-400 mt-1">
          {{ fieldErrors.email.join(', ') }}
        </p>
      </div>

      <!-- Campo Contraseña -->
      <div>
        <label for="password" class="block text-xs font-medium text-slate-300 mb-1.5">
          Contraseña
        </label>
        <div class="relative">
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            required
            autocomplete="current-password"
            placeholder="••••••••"
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

      <!-- Recordarme y ¿Olvidaste tu contraseña? -->
      <div class="flex items-center justify-between text-xs pt-1">
        <label class="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white">
          <input
            v-model="rememberMe"
            type="checkbox"
            class="rounded border-slate-700 bg-[#161e31] text-[#3eb134] focus:ring-[#3eb134]"
          >
          <span>Recordarme</span>
        </label>
        <NuxtLink
          to="/forgot-password"
          class="text-[#3eb134] hover:text-[#349b2c] transition-colors underline-offset-2 hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </NuxtLink>
      </div>

      <!-- Botón de Envío -->
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
          <span>{{ isLoading ? 'Iniciando sesión...' : 'Ingresar al sistema' }}</span>
        </button>
      </div>
    </form>

    <!-- Credenciales Demo / Asistente Rápido -->
    <div class="mt-6 p-3.5 rounded-xl bg-[#0e1726]/80 border border-slate-800/80 text-xs text-slate-400">
      <div class="flex items-center justify-between mb-2">
        <span class="font-medium text-slate-300">Credenciales de prueba</span>
        <button
          type="button"
          class="text-[#3eb134] hover:text-[#349b2c] font-medium transition-colors cursor-pointer"
          @click="autofillDemo('baifa')"
        >
          Autocompletar
        </button>
      </div>
      <div class="space-y-1 font-mono text-[11px]">
        <div>Email: <span class="text-slate-300">admin@baifa.com.ve</span> (o admin@admin)</div>
        <div>Contraseña: <span class="text-slate-300">12345678</span></div>
      </div>
    </div>

    <!-- Enlace a Registro (Solicitar acceso) -->
    <div class="mt-8 text-center text-xs text-slate-400">
      <span>¿No tienes cuenta?</span>
      <NuxtLink to="/register" class="text-[#3eb134] hover:text-[#349b2c] font-semibold ml-1.5 transition-colors">
        Solicitar acceso
      </NuxtLink>
    </div>
  </div>
</template>
