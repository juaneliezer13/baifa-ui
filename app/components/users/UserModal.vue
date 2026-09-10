<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { SystemUser, SystemUserRole } from '~~/types/user'

const props = defineProps<{
  modelValue: boolean
  userToEdit: SystemUser | null
  isLoading: boolean
  fieldErrors?: Record<string, string[]>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', data: { name: string; email: string; password?: string; role: SystemUserRole; is_active: boolean }): void
}>()

const name = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const role = ref<SystemUserRole>('employee')
const isActive = ref(true)

const isEditing = computed(() => Boolean(props.userToEdit))
const isClientUser = computed(() => isEditing.value && props.userToEdit?.role === 'client')

// Opciones de roles según el prototipo y modelo de negocio
// Nota: Los usuarios de tipo 'client' se crean exclusivamente desde el módulo de Clientes
const roleOptions = computed<{ value: SystemUserRole; label: string }[]>(() => {
  if (isClientUser.value) {
    return [
      { value: 'client', label: 'Cliente (Vinculado a empresa)' }
    ]
  }
  return [
    { value: 'admin', label: 'Administrador' },
    { value: 'manager', label: 'Jefe / Gerente' },
    { value: 'employee', label: 'Operador' },
  ]
})

// Descripción dinámica de permisos según el prototipo
const roleDescriptions: Record<SystemUserRole, string> = {
  admin: 'Acceso total al sistema, configuración operativa y gestión integral de usuarios y generadores.',
  manager: 'Supervisión operativa, consulta de métricas, inventario y aprobación de solicitudes de clientes.',
  employee: 'Puede actualizar estados de generadores y consultar clientes. Sin acceso a gestión de usuarios.',
  client: 'Acceso exclusivo al portal de autogestión, consulta de pedidos propios y seguimiento de maquinaria.',
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      if (props.userToEdit) {
        name.value = props.userToEdit.name
        email.value = props.userToEdit.email
        password.value = ''
        role.value = props.userToEdit.role as SystemUserRole
        isActive.value = props.userToEdit.is_active
      } else {
        name.value = ''
        email.value = ''
        password.value = ''
        role.value = 'employee'
        isActive.value = true
      }
      showPassword.value = false
    }
  }
)

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleSubmit = () => {
  if (!name.value || !email.value) return
  if (!isEditing.value && !password.value) return

  emit('save', {
    name: name.value.trim(),
    email: email.value.trim().toLowerCase(),
    password: password.value ? password.value : undefined,
    role: role.value,
    is_active: isActive.value,
  })
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="520"
    persistent
    @update:model-value="handleClose"
  >
    <div class="bg-[#0f172a] border border-slate-700/80 rounded-2xl p-6 text-slate-200 shadow-2xl relative">
      <!-- Encabezado del Modal -->
      <div class="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 class="text-lg font-bold text-white tracking-tight">
            {{ isEditing ? 'Editar usuario' : 'Nuevo usuario' }}
          </h2>
          <p class="text-xs text-slate-400 mt-0.5">
            {{ isEditing ? 'Modifica los datos y permisos del usuario' : 'Ingresa los datos para registrar un usuario operativo o administrativo' }}
          </p>
        </div>

        <button
          type="button"
          class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          @click="handleClose"
        >
          <v-icon icon="mdi-close" size="20" />
        </button>
      </div>

      <!-- Formulario -->
      <form class="mt-5 space-y-4" @submit.prevent="handleSubmit">
        <!-- Campo: Nombre completo -->
        <div>
          <label for="name" class="block text-xs font-medium text-slate-300 mb-1.5">
            Nombre completo <span class="text-[#3eb134]">*</span>
          </label>
          <input
            id="name"
            v-model="name"
            type="text"
            required
            placeholder="Ej: Adriana Morales"
            class="w-full px-3.5 py-2.5 rounded-xl bg-[#161e31] border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#3eb134] focus:ring-1 focus:ring-[#3eb134] transition-colors"
            :class="{ 'border-red-500': fieldErrors?.name }"
          >
          <p v-if="fieldErrors?.name" class="text-xs text-red-400 mt-1">
            {{ fieldErrors.name.join(', ') }}
          </p>
        </div>

        <!-- Campo: Correo electrónico -->
        <div>
          <label for="email" class="block text-xs font-medium text-slate-300 mb-1.5">
            Email <span class="text-[#3eb134]">*</span>
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="usuario@baifa.com.ve"
            class="w-full px-3.5 py-2.5 rounded-xl bg-[#161e31] border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#3eb134] focus:ring-1 focus:ring-[#3eb134] transition-colors"
            :class="{ 'border-red-500': fieldErrors?.email }"
          >
          <p v-if="fieldErrors?.email" class="text-xs text-red-400 mt-1">
            {{ fieldErrors.email.join(', ') }}
          </p>
        </div>

        <!-- Campo: Contraseña -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label for="userPassword" class="block text-xs font-medium text-slate-300">
              Contraseña <span v-if="!isEditing" class="text-[#3eb134]">*</span>
            </label>
            <span v-if="isEditing" class="text-[11px] text-slate-500">
              Dejar en blanco para mantener actual
            </span>
          </div>

          <div class="relative">
            <input
              id="userPassword"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              :required="!isEditing"
              placeholder="••••••••"
              class="w-full px-3.5 pr-10 py-2.5 rounded-xl bg-[#161e31] border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#3eb134] focus:ring-1 focus:ring-[#3eb134] transition-colors"
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

        <!-- Campo: Cargo / Rol -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label for="role" class="block text-xs font-medium text-slate-300">
              Cargo / Rol <span class="text-[#3eb134]">*</span>
            </label>
            <span v-if="isClientUser" class="text-[11px] text-amber-400 font-medium">
              Rol permanente
            </span>
          </div>

          <select
            id="role"
            v-model="role"
            :disabled="isClientUser"
            class="w-full px-3.5 py-2.5 rounded-xl bg-[#161e31] border border-slate-700 text-white text-sm focus:outline-none focus:border-[#3eb134] focus:ring-1 focus:ring-[#3eb134] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <option
              v-for="opt in roleOptions"
              :key="opt.value"
              :value="opt.value"
              class="bg-[#0f172a] text-white"
            >
              {{ opt.label }}
            </option>
          </select>
          <p v-if="isClientUser" class="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
            <v-icon icon="mdi-information-outline" size="14" class="text-amber-400 shrink-0" />
            <span>Los usuarios de tipo cliente están vinculados a una empresa cliente. Su correo se sincroniza automáticamente con el contacto de la empresa.</span>
          </p>
        </div>

        <!-- Tarjeta dinámica de permisos del rol -->
        <div class="p-3.5 rounded-xl bg-[#161e31]/80 border border-slate-700/60 text-xs">
          <div class="font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
            <v-icon icon="mdi-shield-check-outline" size="16" class="text-[#3eb134]" />
            <span>Permisos del rol seleccionado:</span>
          </div>
          <p class="text-slate-400 leading-relaxed">
            {{ roleDescriptions[role] }}
          </p>
        </div>

        <!-- Estado Activo / Inactivo -->
        <div class="pt-1">
          <label class="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              v-model="isActive"
              type="checkbox"
              class="w-4 h-4 rounded border-slate-700 bg-[#161e31] text-[#3eb134] focus:ring-[#3eb134]"
            >
            <span class="text-xs font-medium text-slate-300">Usuario activo en la plataforma</span>
          </label>
        </div>

        <!-- Botones de Acción -->
        <div class="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
          <button
            type="button"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
            @click="handleClose"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="isLoading"
            class="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#3eb134] hover:bg-[#349b2c] transition-all shadow-md shadow-[#3eb134]/25 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            <v-progress-circular
              v-if="isLoading"
              indeterminate
              size="16"
              width="2"
              color="white"
            />
            <span>{{ isLoading ? 'Guardando...' : (isEditing ? 'Guardar cambios' : 'Crear usuario') }}</span>
          </button>
        </div>
      </form>
    </div>
  </v-dialog>
</template>
