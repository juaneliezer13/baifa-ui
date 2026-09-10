<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUsers } from '~/composables/useUsers'
import UserModal from '~/components/users/UserModal.vue'
import UserDeleteModal from '~/components/users/UserDeleteModal.vue'
import type { SystemUser, SystemUserRole } from '~~/types/user'

useHead({
  title: 'Usuarios del sistema - Baifa'
})

const {
  users,
  isLoading,
  isSaving,
  isDeleting,
  errorMessage,
  fieldErrors,
  successMessage,
  clearMessages,
  fetchUsers,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser
} = useUsers()

// Filtros y búsqueda
const searchQuery = ref('')
const selectedRoleFilter = ref('all')
const selectedStatusFilter = ref('all')

// Estados de modales
const isModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const selectedUser = ref<SystemUser | null>(null)
const userToDelete = ref<SystemUser | null>(null)

// Notificación de aviso al intentar modificar cuenta propia
const selfWarningMessage = ref('')

onMounted(async () => {
  await fetchUsers()
})

const filteredUsers = computed(() => {
  return users.value.filter((u) => {
    // Filtro por texto
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      const matchName = u.name.toLowerCase().includes(q)
      const matchEmail = u.email.toLowerCase().includes(q)
      if (!matchName && !matchEmail) return false
    }

    // Filtro por rol
    if (selectedRoleFilter.value !== 'all' && u.role !== selectedRoleFilter.value) {
      return false
    }

    // Filtro por estado
    if (selectedStatusFilter.value !== 'all') {
      const isActive = selectedStatusFilter.value === 'active'
      if (u.is_active !== isActive) return false
    }

    return true
  })
})

const getInitials = (name: string): string => {
  if (!name) return 'U'
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const getRoleBadge = (role: string): { label: string; class: string } => {
  switch (role) {
    case 'admin':
      return {
        label: 'Superadministrador',
        class: 'text-red-400 bg-red-950/50 border-red-800/40'
      }
    case 'manager':
      return {
        label: 'Jefe / Gerente',
        class: 'text-amber-400 bg-amber-950/50 border-amber-800/40'
      }
    case 'employee':
      return {
        label: 'Operador',
        class: 'text-sky-400 bg-sky-950/50 border-sky-800/40'
      }
    case 'client':
      return {
        label: 'Cliente',
        class: 'text-emerald-400 bg-emerald-950/50 border-emerald-800/40'
      }
    default:
      return {
        label: 'Usuario',
        class: 'text-slate-400 bg-slate-800/50 border-slate-700/40'
      }
  }
}

// Abrir modal para crear
const openCreateModal = () => {
  clearMessages()
  selfWarningMessage.value = ''
  selectedUser.value = null
  isModalOpen.value = true
}

// Abrir modal para editar (con comprobación de usuario propio)
const openEditModal = (user: SystemUser) => {
  clearMessages()
  selfWarningMessage.value = ''

  if (user.is_self) {
    selfWarningMessage.value = 'No puedes modificar tu propio usuario desde la gestión de usuarios. Para modificar tus datos utiliza la opción Mi Perfil.'
    return
  }

  selectedUser.value = user
  isModalOpen.value = true
}

// Abrir modal para eliminar (con comprobación de usuario propio)
const openDeleteModal = (user: SystemUser) => {
  clearMessages()
  selfWarningMessage.value = ''

  if (user.is_self) {
    selfWarningMessage.value = 'No puedes eliminar tu propia cuenta de usuario administrador.'
    return
  }

  userToDelete.value = user
  isDeleteModalOpen.value = true
}

// Guardar usuario (Crear o Actualizar)
const handleSaveUser = async (data: {
  name: string
  email: string
  password?: string
  role: SystemUserRole
  is_active: boolean
}) => {
  if (selectedUser.value) {
    const res = await updateUser(selectedUser.value.id, data)
    if (res.success) {
      isModalOpen.value = false
      selectedUser.value = null
    }
  } else {
    if (!data.password) return
    const res = await createUser({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      is_active: data.is_active
    })
    if (res.success) {
      isModalOpen.value = false
    }
  }
}

// Confirmar eliminación
const handleConfirmDelete = async () => {
  if (!userToDelete.value) return
  const res = await deleteUser(userToDelete.value.id)
  if (res.success) {
    isDeleteModalOpen.value = false
    userToDelete.value = null
  }
}

// Cambiar estado activo/inactivo
const handleToggleStatus = async (user: SystemUser) => {
  if (user.is_self) {
    selfWarningMessage.value = 'No puedes modificar el estado de tu propia cuenta de usuario.'
    return
  }
  await toggleUserStatus(user.id, user.is_active)
}
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto select-none">
    <!-- Encabezado de Página -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl lg:text-3xl font-bold text-white tracking-tight">
          Usuarios del sistema
        </h1>
        <p class="text-sm text-slate-400 mt-1 font-normal">
          Gestión de acceso y permisos
        </p>
      </div>

      <!-- Botón Nuevo Usuario (Verde Baifa según prototipo) -->
      <button
        type="button"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-[#3eb134] hover:bg-[#349b2c] active:scale-[0.99] transition-all shadow-md shadow-[#3eb134]/25 cursor-pointer self-start sm:self-auto"
        @click="openCreateModal"
      >
        <v-icon icon="mdi-plus" size="18" />
        <span>+ Nuevo usuario</span>
      </button>
    </div>

    <!-- Alertas de Éxito / Error / Regla de Negocio Propia -->
    <div v-if="successMessage" class="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-xs text-emerald-300 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <v-icon icon="mdi-check-circle-outline" size="18" class="text-emerald-400" />
        <span>{{ successMessage }}</span>
      </div>
      <button type="button" class="text-emerald-400 hover:text-emerald-200 cursor-pointer" @click="clearMessages">
        <v-icon icon="mdi-close" size="16" />
      </button>
    </div>

    <div v-if="errorMessage" class="p-3.5 rounded-xl bg-red-950/60 border border-red-800/40 text-xs text-red-300 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <v-icon icon="mdi-alert-circle-outline" size="18" class="text-red-400" />
        <span>{{ errorMessage }}</span>
      </div>
      <button type="button" class="text-red-400 hover:text-red-200 cursor-pointer" @click="clearMessages">
        <v-icon icon="mdi-close" size="16" />
      </button>
    </div>

    <div v-if="selfWarningMessage" class="p-3.5 rounded-xl bg-amber-950/60 border border-amber-800/40 text-xs text-amber-300 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <v-icon icon="mdi-shield-alert-outline" size="18" class="text-amber-400" />
        <span>{{ selfWarningMessage }}</span>
      </div>
      <button type="button" class="text-amber-400 hover:text-amber-200 cursor-pointer" @click="selfWarningMessage = ''">
        <v-icon icon="mdi-close" size="16" />
      </button>
    </div>

    <!-- Barra de Búsqueda y Filtros -->
    <div class="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      <!-- Buscador -->
      <div class="relative flex-1">
        <v-icon
          icon="mdi-magnify"
          size="18"
          class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por nombre o correo..."
          class="w-full pl-10 pr-4 py-2 rounded-xl bg-[#161e31] border border-slate-700/80 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#3eb134] focus:ring-1 focus:ring-[#3eb134] transition-colors"
        >
      </div>

      <!-- Filtros desplegables -->
      <div class="flex items-center gap-3">
        <!-- Filtro Rol -->
        <select
          v-model="selectedRoleFilter"
          class="px-3 py-2 rounded-xl bg-[#161e31] border border-slate-700/80 text-slate-300 text-xs focus:outline-none focus:border-[#3eb134] transition-colors cursor-pointer"
        >
          <option value="all">Todos los roles</option>
          <option value="admin">Administrador</option>
          <option value="manager">Jefe / Gerente</option>
          <option value="employee">Operador</option>
          <option value="client">Cliente</option>
        </select>

        <!-- Filtro Estado -->
        <select
          v-model="selectedStatusFilter"
          class="px-3 py-2 rounded-xl bg-[#161e31] border border-slate-700/80 text-slate-300 text-xs focus:outline-none focus:border-[#3eb134] transition-colors cursor-pointer"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
        </select>
      </div>
    </div>

    <!-- Tabla Principal de Usuarios del Sistema -->
    <div class="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold bg-[#0b1120]/40">
              <th class="py-3.5 px-6">Usuario</th>
              <th class="py-3.5 px-6">Email</th>
              <th class="py-3.5 px-6">Cargo / Rol</th>
              <th class="py-3.5 px-6">Estado</th>
              <th class="py-3.5 px-6">Registrado</th>
              <th class="py-3.5 px-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60 text-xs">
            <!-- Estado de Carga -->
            <tr v-if="isLoading && users.length === 0">
              <td colspan="6" class="py-12 text-center text-slate-400">
                <v-progress-circular indeterminate size="28" width="2" color="#3eb134" class="mb-2" />
                <p class="text-xs">Cargando usuarios del sistema...</p>
              </td>
            </tr>

            <!-- Estado Vacío -->
            <tr v-else-if="filteredUsers.length === 0">
              <td colspan="6" class="py-12 text-center text-slate-400">
                <v-icon icon="mdi-account-off-outline" size="36" class="text-slate-600 mb-2" />
                <p class="text-sm font-medium text-slate-300">No se encontraron usuarios</p>
                <p class="text-xs text-slate-500 mt-1">Prueba cambiando los filtros de búsqueda.</p>
              </td>
            </tr>

            <!-- Filas de Usuarios -->
            <tr
              v-for="u in filteredUsers"
              v-else
              :key="u.id"
              class="hover:bg-slate-800/30 transition-colors"
              :class="{ 'bg-[#3eb134]/5': u.is_self }"
            >
              <!-- Columna: Usuario (Avatar e iniciales) -->
              <td class="py-4 px-6">
                <div class="flex items-center gap-3">
                  <div
                    class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm"
                    :class="u.is_self ? 'bg-[#3eb134]' : 'bg-slate-700'"
                  >
                    {{ getInitials(u.name) }}
                  </div>
                  <div>
                    <div class="font-semibold text-white flex items-center gap-2">
                      <span>{{ u.name }}</span>
                      <span
                        v-if="u.is_self"
                        class="text-[10px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full"
                      >
                        Tu cuenta
                      </span>
                    </div>
                  </div>
                </div>
              </td>

              <!-- Columna: Email -->
              <td class="py-4 px-6 text-slate-300 font-mono text-[11px]">
                {{ u.email }}
              </td>

              <!-- Columna: Cargo / Rol -->
              <td class="py-4 px-6">
                <span
                  class="text-[10px] font-medium border px-2.5 py-1 rounded-full whitespace-nowrap inline-block"
                  :class="getRoleBadge(u.role).class"
                >
                  {{ u.role_label || getRoleBadge(u.role).label }}
                </span>
              </td>

              <!-- Columna: Estado -->
              <td class="py-4 px-6">
                <span
                  class="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full border"
                  :class="u.is_active
                    ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/30'
                    : 'text-slate-400 bg-slate-900/60 border-slate-700/40'"
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :class="u.is_active ? 'bg-emerald-400' : 'bg-slate-500'"
                  />
                  <span>{{ u.is_active ? 'Activo' : 'Inactivo' }}</span>
                </span>
              </td>

              <!-- Columna: Registrado -->
              <td class="py-4 px-6 text-slate-400 font-mono text-[11px]">
                {{ u.registered_date }}
              </td>

              <!-- Columna: Acciones -->
              <td class="py-4 px-6 text-right">
                <!-- Acciones para la cuenta propia (Bloqueadas con indicación visual) -->
                <div v-if="u.is_self" class="flex items-center justify-end gap-1 text-slate-500">
                  <span class="text-[10px] text-slate-500 italic mr-1">Gestionar en Mi Perfil</span>
                  <button
                    type="button"
                    class="p-1.5 rounded-lg opacity-40 cursor-not-allowed text-slate-600 hover:text-slate-600"
                    title="No puedes editar tu propio usuario desde aquí"
                    @click="openEditModal(u)"
                  >
                    <v-icon icon="mdi-pencil-outline" size="18" />
                  </button>
                  <button
                    type="button"
                    class="p-1.5 rounded-lg opacity-40 cursor-not-allowed text-slate-600 hover:text-slate-600"
                    title="No puedes eliminar tu propia cuenta"
                    @click="openDeleteModal(u)"
                  >
                    <v-icon icon="mdi-trash-can-outline" size="18" />
                  </button>
                </div>

                <!-- Acciones para usuarios de terceros (Permitidas) -->
                <div v-else class="flex items-center justify-end gap-1.5">
                  <!-- Botón Editar -->
                  <button
                    type="button"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Modificar usuario"
                    @click="openEditModal(u)"
                  >
                    <v-icon icon="mdi-pencil-outline" size="18" />
                  </button>

                  <!-- Botón Alternar Estado Activo / Inactivo -->
                  <button
                    type="button"
                    class="p-1.5 rounded-lg transition-colors cursor-pointer"
                    :class="u.is_active ? 'text-emerald-400 hover:bg-emerald-950/40' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'"
                    :title="u.is_active ? 'Desactivar usuario' : 'Activar usuario'"
                    @click="handleToggleStatus(u)"
                  >
                    <v-icon :icon="u.is_active ? 'mdi-toggle-switch' : 'mdi-toggle-switch-off-outline'" size="20" />
                  </button>

                  <!-- Botón Eliminar -->
                  <button
                    type="button"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                    title="Eliminar usuario"
                    @click="openDeleteModal(u)"
                  >
                    <v-icon icon="mdi-trash-can-outline" size="18" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modales de Operación CRUD -->
    <UserModal
      v-model="isModalOpen"
      :user-to-edit="selectedUser"
      :is-loading="isSaving"
      :field-errors="fieldErrors"
      @save="handleSaveUser"
    />

    <UserDeleteModal
      v-model="isDeleteModalOpen"
      :user="userToDelete"
      :is-loading="isDeleting"
      @confirm="handleConfirmDelete"
    />
  </div>
</template>
