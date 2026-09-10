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

const fullName = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const showPassword = ref(false)
const localError = ref('')
const isSuccess = ref(false)

const handleRegister = async () => {
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
    name: fullName.value,
    email: email.value,
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
  <div class="w-full max-w-sm mx-auto">
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
        Completa el formulario para registrarte como cliente en BaiFa
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
        ¡Solicitud enviada con éxito!
      </h3>
      <p class="text-xs text-slate-300 leading-relaxed">
        Tu solicitud de acceso como cliente ha sido recibida. El equipo de BaiFa revisará y habilitará tu cuenta.
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

      <!-- Nombre Completo -->
      <div>
        <label for="fullName" class="block text-xs font-medium text-slate-300 mb-1.5">
          Nombre completo *
        </label>
        <input
          id="fullName"
          v-model="fullName"
          type="text"
          required
          placeholder="María González"
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
          Correo electrónico *
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

      <!-- Separador de Contraseña -->
      <div class="pt-2">
        <div class="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-2">
          Contraseña
        </div>
      </div>

      <!-- Contraseña -->
      <div>
        <label for="password" class="block text-xs font-medium text-slate-300 mb-1.5">
          Contraseña *
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
          Confirmar contraseña *
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

      <!-- Botón Enviar Solicitud -->
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
          <span>{{ isLoading ? 'Enviando solicitud...' : 'Enviar solicitud de acceso' }}</span>
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
