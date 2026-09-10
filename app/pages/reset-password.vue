<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppLogo from '~/components/common/AppLogo.vue'

definePageMeta({
  layout: 'auth'
})

useHead({
  title: 'Restablecer Contraseña - Baifa'
})

const route = useRoute()
const { resetPassword, isLoading, errorMessage, fieldErrors } = useAuth()

const token = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const showPassword = ref(false)
const showPasswordConfirm = ref(false)
const localError = ref('')
const isSuccess = ref(false)

onMounted(() => {
  if (route.query.token) {
    token.value = String(route.query.token)
  }
  if (route.query.email) {
    email.value = String(route.query.email)
  }
})

const handleResetPassword = async () => {
  localError.value = ''

  if (!token.value) {
    localError.value = 'El token de restablecimiento no está presente. Por favor utiliza el enlace enviado a tu correo.'
    return
  }

  if (!email.value) {
    localError.value = 'El correo electrónico es obligatorio.'
    return
  }

  // Pre-validar cuentas institucionales de prueba
  const cleanEmail = email.value.trim().toLowerCase()
  const blocked = ['admin@baifa.com.ve', 'cliente.real@empresa.com']
  if (blocked.includes(cleanEmail)) {
    localError.value = 'Por motivos de seguridad, el restablecimiento de contraseña no está disponible para las cuentas institucionales de prueba.'
    return
  }

  if (password.value.length < 8) {
    localError.value = 'La nueva contraseña debe tener al menos 8 caracteres.'
    return
  }

  if (password.value !== passwordConfirm.value) {
    localError.value = 'Las contraseñas ingresadas no coinciden.'
    return
  }

  const res = await resetPassword({
    token: token.value,
    email: cleanEmail,
    password: password.value,
    password_confirmation: passwordConfirm.value
  })

  if (res.success) {
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

    <!-- Icono Verde de Llave / Seguridad -->
    <div class="w-12 h-12 rounded-xl bg-[#3eb134]/15 border border-[#3eb134]/30 text-[#3eb134] flex items-center justify-center mb-5">
      <v-icon icon="mdi-shield-key-outline" size="24" />
    </div>

    <!-- Título y Subtítulo -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-white tracking-tight">
        Restablecer contraseña
      </h2>
      <p class="text-sm text-slate-400 mt-1.5 font-normal leading-relaxed">
        Ingresa tu nueva clave de acceso para actualizar tu cuenta.
      </p>
    </div>

    <!-- Estado Exitoso -->
    <div
      v-if="isSuccess"
      class="p-6 rounded-2xl bg-[#0b1f13]/80 border border-[#3eb134]/30 text-center space-y-3"
    >
      <div class="w-12 h-12 mx-auto rounded-full bg-[#3eb134]/20 text-[#3eb134] flex items-center justify-center">
        <v-icon icon="mdi-check-decagram-outline" size="28" />
      </div>
      <h3 class="text-base font-semibold text-white">
        ¡Contraseña restablecida!
      </h3>
      <p class="text-xs text-slate-300 leading-relaxed">
        Tu contraseña ha sido actualizada con éxito. Ya puedes ingresar al sistema con tu nueva contraseña.
      </p>
      <div class="pt-3">
        <NuxtLink
          to="/login"
          class="inline-block px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#3eb134] hover:bg-[#349b2c] transition-colors shadow-md shadow-[#3eb134]/25"
        >
          Iniciar sesión ahora
        </NuxtLink>
      </div>
    </div>

    <!-- Formulario de Restablecimiento -->
    <form v-else class="space-y-4" @submit.prevent="handleResetPassword">
      <!-- Alerta de advertencia si falta el token -->
      <div
        v-if="!token && !isLoading"
        class="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-amber-300 text-xs flex items-center gap-2"
      >
        <v-icon icon="mdi-alert-outline" size="18" class="text-amber-400 shrink-0" />
        <span>No se detectó un token en el enlace. Asegúrate de abrir el enlace completo que recibiste en tu correo.</span>
      </div>

      <!-- Alerta de error -->
      <div
        v-if="localError || errorMessage"
        class="p-3 rounded-xl bg-red-950/50 border border-red-800/50 text-red-300 text-xs flex items-center gap-2"
      >
        <v-icon icon="mdi-alert-circle-outline" size="18" class="text-red-400 shrink-0" />
        <span>{{ localError || errorMessage }}</span>
      </div>

      <!-- Correo Electrónico -->
      <div>
        <label for="resetEmail" class="block text-xs font-medium text-slate-300 mb-1.5">
          Correo electrónico
        </label>
        <input
          id="resetEmail"
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

      <!-- Nueva Contraseña -->
      <div>
        <label for="newPassword" class="block text-xs font-medium text-slate-300 mb-1.5">
          Nueva contraseña
        </label>
        <div class="relative">
          <input
            id="newPassword"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            required
            placeholder="Mínimo 8 caracteres"
            class="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-[#161e31] border border-slate-700/80 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#3eb134] focus:ring-1 focus:ring-[#3eb134] transition-colors"
            :class="{ 'border-red-500': fieldErrors?.password }"
          >
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            tabindex="-1"
            @click="showPassword = !showPassword"
          >
            <v-icon :icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'" size="18" />
          </button>
        </div>
        <p v-if="fieldErrors?.password" class="text-xs text-red-400 mt-1">
          {{ fieldErrors.password.join(', ') }}
        </p>
      </div>

      <!-- Confirmar Nueva Contraseña -->
      <div>
        <label for="confirmPassword" class="block text-xs font-medium text-slate-300 mb-1.5">
          Confirmar nueva contraseña
        </label>
        <div class="relative">
          <input
            id="confirmPassword"
            v-model="passwordConfirm"
            :type="showPasswordConfirm ? 'text' : 'password'"
            required
            placeholder="Repite la contraseña"
            class="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-[#161e31] border border-slate-700/80 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#3eb134] focus:ring-1 focus:ring-[#3eb134] transition-colors"
            :class="{ 'border-red-500': fieldErrors?.password_confirmation }"
          >
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            tabindex="-1"
            @click="showPasswordConfirm = !showPasswordConfirm"
          >
            <v-icon :icon="showPasswordConfirm ? 'mdi-eye-off-outline' : 'mdi-eye-outline'" size="18" />
          </button>
        </div>
        <p v-if="fieldErrors?.password_confirmation" class="text-xs text-red-400 mt-1">
          {{ fieldErrors.password_confirmation.join(', ') }}
        </p>
      </div>

      <!-- Botón Actualizar Contraseña -->
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
          <span>{{ isLoading ? 'Actualizando contraseña...' : 'Actualizar contraseña' }}</span>
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
