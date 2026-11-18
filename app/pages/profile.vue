<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import {
  validatePersonName,
  validateEmail,
  validateCompanyName,
  formatRifOrCedula,
  validateRifOrCedula,
  formatPhone,
  validatePhone
} from '~/utils/validators'

definePageMeta({
  layout: false
})

const { user, fetchUser, updateProfile } = useAuth()

const isClient = computed(() => user.value?.role === 'client')

useHead({
  title: 'Mi Perfil - Baifa Power'
})

// Estado de carga y alertas independientes por sección
const isSavingProfile = ref(false)
const isSavingPassword = ref(false)
const profileSuccessMessage = ref('')
const profileErrorMessage = ref('')
const passwordSuccessMessage = ref('')
const passwordErrorMessage = ref('')

// Campos del formulario de Datos Personales y Empresa
const name = ref('')
const email = ref('')
const companyFiscalName = ref('')
const companyShortName = ref('')
const rif = ref('')
const officePhone = ref('')
const contactPhone = ref('')

// Campos del formulario de Cambio de Contraseña
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const profileFieldErrors = reactive<{
  name: string
  email: string
  company_fiscal_name: string
  company_short_name: string
  rif: string
  office_phone: string
  contact_phone: string
}>({
  name: '',
  email: '',
  company_fiscal_name: '',
  company_short_name: '',
  rif: '',
  office_phone: '',
  contact_phone: ''
})

const passwordFieldErrors = reactive<{
  current_password: string
  password: string
  password_confirmation: string
}>({
  current_password: '',
  password: '',
  password_confirmation: ''
})

const populateFormFromUser = () => {
  if (!user.value) return
  name.value = user.value.name || ''
  email.value = user.value.email || ''

  if (user.value.client) {
    companyFiscalName.value = user.value.client.company_fiscal_name || ''
    companyShortName.value = user.value.client.company_short_name || ''
    rif.value = user.value.client.rif || ''
    officePhone.value = user.value.client.office_phone || ''
    contactPhone.value = user.value.client.contact_phone || ''
  }
}

onMounted(async () => {
  populateFormFromUser()
  await fetchUser()
  populateFormFromUser()
})

watch(
  () => user.value,
  () => {
    populateFormFromUser()
  }
)

const userInitials = computed(() => {
  const n = user.value?.name || 'Usuario'
  return n
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
})

const roleConfig = computed(() => {
  switch (user.value?.role) {
    case 'admin':
      return {
        label: 'Superadministrador',
        badgeClass: 'text-red-400 bg-red-950/60 border-red-800/40',
        icon: 'mdi-shield-crown-outline',
        scopeTitle: 'Control Total del Sistema (Administrador)',
        permissions: [
          'Gestión integral de usuarios del sistema y asignación de roles (/users)',
          'Administración completa del directorio fiscal de clientes (/clients)',
          'Control del catálogo de generadores eléctricos y puntos de control (/generators, /tracking)',
          'Acceso al tablero de reportes ejecutivos y exportación CSV (/reports)'
        ]
      }
    case 'manager':
      return {
        label: 'Jefe / Gerente',
        badgeClass: 'text-amber-400 bg-amber-950/60 border-amber-800/40',
        icon: 'mdi-briefcase-check-outline',
        scopeTitle: 'Supervisión Operativa y Gerencial',
        permissions: [
          'Supervisión de métricas operativas globales y pipeline logístico',
          'Administración del directorio fiscal de clientes (/clients)',
          'Gestión completa del inventario de generadores y puntos de control (/generators, /tracking)',
          'Acceso al tablero de reportes ejecutivos y exportación CSV (/reports)'
        ]
      }
    case 'employee':
      return {
        label: 'Empleado',
        badgeClass: 'text-sky-400 bg-sky-950/60 border-sky-800/40',
        icon: 'mdi-account-hard-hat-outline',
        scopeTitle: 'Acceso Operativo Limitado (Empleado / Operador)',
        permissions: [
          'Actualización manual de estados logísticos y registro de puntos de control en ruta (/tracking)',
          'Registro y actualización operativa de fichas de generadores (/generators)',
          'Consulta en modo lectura del directorio fiscal de empresas clientes (/clients)',
          'Restricción de seguridad: sin acceso a gestión de usuarios, reportes ejecutivos ni eliminación de registros'
        ]
      }
    case 'client':
    default:
      return {
        label: 'Cliente Empresarial',
        badgeClass: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40',
        icon: 'mdi-domain',
        scopeTitle: 'Portal Exclusivo de Autogestión para Clientes',
        permissions: [
          'Visualización privada y exclusiva de los generadores asignados a tu empresa',
          'Consulta detallada de trazabilidad y bitácora histórica de puntos de control (/tracking)',
          'Recepción de notificaciones automáticas por correo en cada avance logístico',
          'Actualización de tus datos de contacto corporativo y credenciales de seguridad'
        ]
      }
  }
})

// Handlers de auto-formateo
const handleRifInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const formatted = formatRifOrCedula(target.value)
  rif.value = formatted
  target.value = formatted
  profileFieldErrors.rif = ''
}

const handleOfficePhoneInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const formatted = formatPhone(target.value)
  officePhone.value = formatted
  target.value = formatted
  profileFieldErrors.office_phone = ''
}

const handleContactPhoneInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const formatted = formatPhone(target.value)
  contactPhone.value = formatted
  target.value = formatted
  profileFieldErrors.contact_phone = ''
}

const clearProfileErrors = () => {
  profileFieldErrors.name = ''
  profileFieldErrors.email = ''
  profileFieldErrors.company_fiscal_name = ''
  profileFieldErrors.company_short_name = ''
  profileFieldErrors.rif = ''
  profileFieldErrors.office_phone = ''
  profileFieldErrors.contact_phone = ''
  profileErrorMessage.value = ''
}

const handleSaveProfile = async () => {
  clearProfileErrors()
  profileSuccessMessage.value = ''

  const nameErr = validatePersonName(name.value, 'El nombre completo')
  const emailErr = validateEmail(email.value, true)

  if (nameErr) profileFieldErrors.name = nameErr
  if (emailErr) profileFieldErrors.email = emailErr

  if (isClient.value && user.value?.client) {
    const fiscalErr = validateCompanyName(companyFiscalName.value, 3, 'La razón social')
    const shortErr = validateCompanyName(companyShortName.value, 2, 'El nombre comercial')
    const rifErr = validateRifOrCedula(rif.value, true)
    const officePhoneErr = validatePhone(officePhone.value, false)
    const contactPhoneErr = validatePhone(contactPhone.value, false)

    if (fiscalErr) profileFieldErrors.company_fiscal_name = fiscalErr
    if (shortErr) profileFieldErrors.company_short_name = shortErr
    if (rifErr) profileFieldErrors.rif = rifErr
    if (officePhoneErr) profileFieldErrors.office_phone = officePhoneErr
    if (contactPhoneErr) profileFieldErrors.contact_phone = contactPhoneErr
  }

  if (
    profileFieldErrors.name ||
    profileFieldErrors.email ||
    profileFieldErrors.company_fiscal_name ||
    profileFieldErrors.company_short_name ||
    profileFieldErrors.rif ||
    profileFieldErrors.office_phone ||
    profileFieldErrors.contact_phone
  ) {
    return
  }

  isSavingProfile.value = true

  try {
    const payload: Record<string, any> = {
      name: name.value.trim(),
      email: email.value.trim().toLowerCase()
    }

    if (isClient.value && user.value?.client) {
      payload.company_fiscal_name = companyFiscalName.value.trim()
      payload.company_short_name = companyShortName.value.trim()
      payload.rif = rif.value.trim().toUpperCase()
      payload.office_phone = officePhone.value.trim() || null
      payload.contact_phone = contactPhone.value.trim() || null
    }

    const res = await updateProfile(payload)
    if (res.success) {
      profileSuccessMessage.value = res.message || 'Tus datos de perfil han sido actualizados exitosamente.'
    } else {
      profileErrorMessage.value = res.message || 'No fue posible actualizar el perfil.'
      if (res.errors) {
        if (res.errors.name) profileFieldErrors.name = res.errors.name[0]
        if (res.errors.email) profileFieldErrors.email = res.errors.email[0]
        if (res.errors.company_fiscal_name) profileFieldErrors.company_fiscal_name = res.errors.company_fiscal_name[0]
        if (res.errors.company_short_name) profileFieldErrors.company_short_name = res.errors.company_short_name[0]
        if (res.errors.rif) profileFieldErrors.rif = res.errors.rif[0]
        if (res.errors.office_phone) profileFieldErrors.office_phone = res.errors.office_phone[0]
        if (res.errors.contact_phone) profileFieldErrors.contact_phone = res.errors.contact_phone[0]
      }
    }
  } finally {
    isSavingProfile.value = false
  }
}

const handleSavePassword = async () => {
  passwordFieldErrors.current_password = ''
  passwordFieldErrors.password = ''
  passwordFieldErrors.password_confirmation = ''
  passwordErrorMessage.value = ''
  passwordSuccessMessage.value = ''

  if (!currentPassword.value) {
    passwordFieldErrors.current_password = 'Ingresa tu contraseña actual.'
  }

  if (!newPassword.value || newPassword.value.length < 8) {
    passwordFieldErrors.password = 'La nueva contraseña debe tener al menos 8 caracteres.'
  }

  if (!confirmPassword.value || newPassword.value !== confirmPassword.value) {
    passwordFieldErrors.password_confirmation = 'La confirmación de la contraseña no coincide.'
  }

  if (
    passwordFieldErrors.current_password ||
    passwordFieldErrors.password ||
    passwordFieldErrors.password_confirmation
  ) {
    return
  }

  isSavingPassword.value = true

  try {
    const res = await updateProfile({
      current_password: currentPassword.value,
      password: newPassword.value,
      password_confirmation: confirmPassword.value
    })

    if (res.success) {
      passwordSuccessMessage.value = 'Tu contraseña ha sido actualizada exitosamente.'
      currentPassword.value = ''
      newPassword.value = ''
      confirmPassword.value = ''
    } else {
      passwordErrorMessage.value = res.message || 'No fue posible actualizar la contraseña.'
      if (res.errors?.current_password) {
        passwordFieldErrors.current_password = res.errors.current_password[0]
      }
      if (res.errors?.password) {
        passwordFieldErrors.password = res.errors.password[0]
      }
    }
  } finally {
    isSavingPassword.value = false
  }
}
</script>

<template>
  <NuxtLayout :name="isClient ? 'client' : 'default'">
    <div class="space-y-6 max-w-5xl mx-auto pb-12">
      <!-- Encabezado de Página -->
      <div>
        <h1 class="text-2xl lg:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <v-icon icon="mdi-account-cog-outline" class="text-[#3eb134]" size="30" />
          <span>Mi Perfil</span>
        </h1>
        <p class="text-sm text-slate-400 mt-1">
          Gestiona tu información personal, datos de contacto y credenciales de seguridad
        </p>
      </div>

      <!-- 1. Tarjeta Resumen de Identidad y Permisos del Rol -->
      <div class="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3eb134] via-emerald-500 to-sky-500 opacity-70" />

        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-[#3eb134] text-white font-extrabold text-xl flex items-center justify-center shrink-0 shadow-lg shadow-[#3eb134]/25">
              {{ userInitials }}
            </div>
            <div>
              <div class="flex flex-wrap items-center gap-2.5">
                <h2 class="text-xl font-bold text-white tracking-tight">
                  {{ user?.name || 'Usuario BaiFa' }}
                </h2>
                <span
                  class="text-xs font-semibold border px-3 py-0.5 rounded-full"
                  :class="roleConfig.badgeClass"
                >
                  {{ roleConfig.label }}
                </span>
              </div>
              <p class="text-xs font-mono text-slate-400 mt-1">
                {{ user?.email }}
              </p>
              <div v-if="user?.client" class="text-xs text-[#3eb134] font-medium mt-1">
                {{ user.client.company_fiscal_name }} · <span class="font-mono text-slate-300">RIF: {{ user.client.rif }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 self-start md:self-center">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
              <span class="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Sesión Activa</span>
            </span>
          </div>
        </div>

        <!-- Alcance del Rol Actual -->
        <div class="mt-6 pt-5 border-t border-slate-800/80">
          <div class="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            <v-icon :icon="roleConfig.icon" size="16" class="text-[#3eb134]" />
            <span>{{ roleConfig.scopeTitle }}</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div
              v-for="(perm, idx) in roleConfig.permissions"
              :key="idx"
              class="flex items-start gap-2 text-xs text-slate-400 bg-slate-900/60 border border-slate-800/80 rounded-xl p-3"
            >
              <v-icon icon="mdi-check-circle-outline" size="15" class="text-[#3eb134] shrink-0 mt-0.5" />
              <span>{{ perm }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Grid de Formularios: Datos de Perfil + Cambio de Contraseña -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Columna Izquierda: Datos Personales y Empresa (lg:col-span-7) -->
        <div class="lg:col-span-7 bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-xl">
          <div class="pb-4 border-b border-slate-800/80 mb-5">
            <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <v-icon icon="mdi-card-account-details-outline" size="20" class="text-[#3eb134]" />
              <span>Información Personal{{ isClient ? ' y Corporativa' : '' }}</span>
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">
              Actualiza tu nombre, correo electrónico{{ isClient ? ' y datos fiscales de tu empresa' : '' }}
            </p>
          </div>

          <!-- Alertas de Datos de Perfil -->
          <div
            v-if="profileSuccessMessage"
            class="mb-4 p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800/50 text-emerald-300 text-xs flex items-center justify-between"
          >
            <div class="flex items-center gap-2">
              <v-icon icon="mdi-check-circle-outline" size="18" class="text-emerald-400 shrink-0" />
              <span>{{ profileSuccessMessage }}</span>
            </div>
            <button type="button" class="text-emerald-400 hover:text-white" @click="profileSuccessMessage = ''">
              <v-icon icon="mdi-close" size="16" />
            </button>
          </div>

          <div
            v-if="profileErrorMessage"
            class="mb-4 p-3.5 rounded-xl bg-red-950/50 border border-red-800/50 text-red-300 text-xs flex items-center justify-between"
          >
            <div class="flex items-center gap-2">
              <v-icon icon="mdi-alert-circle-outline" size="18" class="text-red-400 shrink-0" />
              <span>{{ profileErrorMessage }}</span>
            </div>
            <button type="button" class="text-red-400 hover:text-white" @click="profileErrorMessage = ''">
              <v-icon icon="mdi-close" size="16" />
            </button>
          </div>

          <form class="space-y-4" novalidate @submit.prevent="handleSaveProfile">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Nombre Completo -->
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1.5">
                  Nombre completo <span class="text-[#3eb134]">*</span>
                </label>
                <input
                  v-model="name"
                  type="text"
                  required
                  placeholder="Tu nombre y apellido"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-[#161e31] border border-slate-700/80 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#3eb134] focus:ring-1 focus:ring-[#3eb134] transition-colors"
                  :class="{ 'border-red-500': profileFieldErrors.name }"
                  @input="profileFieldErrors.name = ''"
                >
                <p v-if="profileFieldErrors.name" class="text-[11px] text-red-400 mt-1">
                  {{ profileFieldErrors.name }}
                </p>
              </div>

              <!-- Correo Electrónico -->
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1.5">
                  Correo electrónico <span class="text-[#3eb134]">*</span>
                </label>
                <input
                  v-model="email"
                  type="email"
                  required
                  placeholder="usuario@baifa.com.ve"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-[#161e31] border border-slate-700/80 text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-[#3eb134] focus:ring-1 focus:ring-[#3eb134] transition-colors"
                  :class="{ 'border-red-500': profileFieldErrors.email }"
                  @input="profileFieldErrors.email = ''"
                >
                <p v-if="profileFieldErrors.email" class="text-[11px] text-red-400 mt-1">
                  {{ profileFieldErrors.email }}
                </p>
              </div>
            </div>

            <!-- Bloque Adicional para Usuarios de tipo Cliente -->
            <div v-if="isClient && user?.client" class="pt-4 border-t border-slate-800/80 space-y-4">
              <div class="text-[11px] font-bold text-[#3eb134] uppercase tracking-wider flex items-center gap-1.5">
                <v-icon icon="mdi-domain" size="15" />
                <span>Ficha Fiscal de tu Empresa</span>
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1.5">
                  Razón Social <span class="text-[#3eb134]">*</span>
                </label>
                <input
                  v-model="companyFiscalName"
                  type="text"
                  required
                  class="w-full px-3.5 py-2.5 rounded-xl bg-[#161e31] border border-slate-700/80 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#3eb134]"
                  :class="{ 'border-red-500': profileFieldErrors.company_fiscal_name }"
                  @input="profileFieldErrors.company_fiscal_name = ''"
                >
                <p v-if="profileFieldErrors.company_fiscal_name" class="text-[11px] text-red-400 mt-1">
                  {{ profileFieldErrors.company_fiscal_name }}
                </p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-medium text-slate-300 mb-1.5">
                    Nombre Comercial / Corto <span class="text-[#3eb134]">*</span>
                  </label>
                  <input
                    v-model="companyShortName"
                    type="text"
                    required
                    class="w-full px-3.5 py-2.5 rounded-xl bg-[#161e31] border border-slate-700/80 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#3eb134]"
                    :class="{ 'border-red-500': profileFieldErrors.company_short_name }"
                    @input="profileFieldErrors.company_short_name = ''"
                  >
                  <p v-if="profileFieldErrors.company_short_name" class="text-[11px] text-red-400 mt-1">
                    {{ profileFieldErrors.company_short_name }}
                  </p>
                </div>

                <div>
                  <label class="block text-xs font-medium text-slate-300 mb-1.5">
                    RIF Fiscal <span class="text-[#3eb134]">*</span>
                  </label>
                  <input
                    :value="rif"
                    type="text"
                    required
                    placeholder="J-12345678-9"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-[#161e31] border border-slate-700/80 text-white text-xs font-mono uppercase placeholder-slate-500 focus:outline-none focus:border-[#3eb134]"
                    :class="{ 'border-red-500': profileFieldErrors.rif }"
                    @input="handleRifInput"
                  >
                  <p v-if="profileFieldErrors.rif" class="text-[11px] text-red-400 mt-1">
                    {{ profileFieldErrors.rif }}
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-medium text-slate-300 mb-1.5">
                    Teléfono de Oficina
                  </label>
                  <input
                    :value="officePhone"
                    type="tel"
                    placeholder="0212-5551234"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-[#161e31] border border-slate-700/80 text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-[#3eb134]"
                    :class="{ 'border-red-500': profileFieldErrors.office_phone }"
                    @input="handleOfficePhoneInput"
                  >
                  <p v-if="profileFieldErrors.office_phone" class="text-[11px] text-red-400 mt-1">
                    {{ profileFieldErrors.office_phone }}
                  </p>
                </div>

                <div>
                  <label class="block text-xs font-medium text-slate-300 mb-1.5">
                    Teléfono Directo / Móvil
                  </label>
                  <input
                    :value="contactPhone"
                    type="tel"
                    placeholder="0414-1234567"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-[#161e31] border border-slate-700/80 text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-[#3eb134]"
                    :class="{ 'border-red-500': profileFieldErrors.contact_phone }"
                    @input="handleContactPhoneInput"
                  >
                  <p v-if="profileFieldErrors.contact_phone" class="text-[11px] text-red-400 mt-1">
                    {{ profileFieldErrors.contact_phone }}
                  </p>
                </div>
              </div>
            </div>

            <div class="pt-3 flex justify-end">
              <button
                type="submit"
                :disabled="isSavingProfile"
                class="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#3eb134] hover:bg-[#349b2c] active:scale-[0.99] transition-all shadow-md shadow-[#3eb134]/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                <v-progress-circular v-if="isSavingProfile" indeterminate size="16" width="2" color="white" />
                <v-icon v-else icon="mdi-content-save-outline" size="17" />
                <span>{{ isSavingProfile ? 'Guardando...' : 'Guardar datos de perfil' }}</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Columna Derecha: Seguridad y Contraseña (lg:col-span-5) -->
        <div class="lg:col-span-5 bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-xl">
          <div class="pb-4 border-b border-slate-800/80 mb-5">
            <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <v-icon icon="mdi-shield-key-outline" size="20" class="text-orange-400" />
              <span>Cambiar Contraseña</span>
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">
              Actualiza tu clave de acceso de forma segura
            </p>
          </div>

          <!-- Alertas de Contraseña -->
          <div
            v-if="passwordSuccessMessage"
            class="mb-4 p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800/50 text-emerald-300 text-xs flex items-center justify-between"
          >
            <div class="flex items-center gap-2">
              <v-icon icon="mdi-check-circle-outline" size="18" class="text-emerald-400 shrink-0" />
              <span>{{ passwordSuccessMessage }}</span>
            </div>
            <button type="button" class="text-emerald-400 hover:text-white" @click="passwordSuccessMessage = ''">
              <v-icon icon="mdi-close" size="16" />
            </button>
          </div>

          <div
            v-if="passwordErrorMessage"
            class="mb-4 p-3.5 rounded-xl bg-red-950/50 border border-red-800/50 text-red-300 text-xs flex items-center justify-between"
          >
            <div class="flex items-center gap-2">
              <v-icon icon="mdi-alert-circle-outline" size="18" class="text-red-400 shrink-0" />
              <span>{{ passwordErrorMessage }}</span>
            </div>
            <button type="button" class="text-red-400 hover:text-white" @click="passwordErrorMessage = ''">
              <v-icon icon="mdi-close" size="16" />
            </button>
          </div>

          <form class="space-y-4" novalidate @submit.prevent="handleSavePassword">
            <!-- Contraseña Actual -->
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1.5">
                Contraseña actual <span class="text-orange-400">*</span>
              </label>
              <div class="relative">
                <input
                  v-model="currentPassword"
                  :type="showCurrentPassword ? 'text' : 'password'"
                  required
                  placeholder="••••••••"
                  class="w-full px-3.5 pr-10 py-2.5 rounded-xl bg-[#161e31] border border-slate-700/80 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                  :class="{ 'border-red-500': passwordFieldErrors.current_password }"
                  @input="passwordFieldErrors.current_password = ''"
                >
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                  @click="showCurrentPassword = !showCurrentPassword"
                >
                  <v-icon :icon="showCurrentPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'" size="17" />
                </button>
              </div>
              <p v-if="passwordFieldErrors.current_password" class="text-[11px] text-red-400 mt-1">
                {{ passwordFieldErrors.current_password }}
              </p>
            </div>

            <!-- Nueva Contraseña -->
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1.5">
                Nueva contraseña <span class="text-orange-400">*</span>
              </label>
              <div class="relative">
                <input
                  v-model="newPassword"
                  :type="showNewPassword ? 'text' : 'password'"
                  required
                  placeholder="Mínimo 8 caracteres"
                  class="w-full px-3.5 pr-10 py-2.5 rounded-xl bg-[#161e31] border border-slate-700/80 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                  :class="{ 'border-red-500': passwordFieldErrors.password }"
                  @input="passwordFieldErrors.password = ''"
                >
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                  @click="showNewPassword = !showNewPassword"
                >
                  <v-icon :icon="showNewPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'" size="17" />
                </button>
              </div>
              <p v-if="passwordFieldErrors.password" class="text-[11px] text-red-400 mt-1">
                {{ passwordFieldErrors.password }}
              </p>
            </div>

            <!-- Confirmar Nueva Contraseña -->
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1.5">
                Confirmar nueva contraseña <span class="text-orange-400">*</span>
              </label>
              <div class="relative">
                <input
                  v-model="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  required
                  placeholder="Repite la nueva contraseña"
                  class="w-full px-3.5 pr-10 py-2.5 rounded-xl bg-[#161e31] border border-slate-700/80 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                  :class="{ 'border-red-500': passwordFieldErrors.password_confirmation }"
                  @input="passwordFieldErrors.password_confirmation = ''"
                >
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  <v-icon :icon="showConfirmPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'" size="17" />
                </button>
              </div>
              <p v-if="passwordFieldErrors.password_confirmation" class="text-[11px] text-red-400 mt-1">
                {{ passwordFieldErrors.password_confirmation }}
              </p>
            </div>

            <div class="pt-3 flex justify-end">
              <button
                type="submit"
                :disabled="isSavingPassword"
                class="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 active:scale-[0.99] transition-all shadow-md shadow-orange-600/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <v-progress-circular v-if="isSavingPassword" indeterminate size="16" width="2" color="white" />
                <v-icon v-else icon="mdi-lock-check-outline" size="17" />
                <span>{{ isSavingPassword ? 'Actualizando...' : 'Actualizar contraseña' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
