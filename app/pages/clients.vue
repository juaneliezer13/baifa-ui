<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useClients } from '~/composables/useClients'
import ClientModal from '~/components/clients/ClientModal.vue'
import ClientDeleteModal from '~/components/clients/ClientDeleteModal.vue'
import type { ClientItem, CreateClientData, UpdateClientData } from '~~/types/client'

useHead({
  title: 'Clientes - Baifa'
})

const {
  clients,
  isLoading,
  isSaving,
  isDeleting,
  errorMessage,
  fieldErrors,
  successMessage,
  clearMessages,
  fetchClients,
  createClient,
  updateClient,
  toggleClientStatus,
  deleteClient
} = useClients()

// Filtros y búsqueda
const searchQuery = ref('')
const selectedStatusFilter = ref<'all' | 'active' | 'inactive'>('all')

// Modales
const isModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const selectedClient = ref<ClientItem | null>(null)
const clientToDelete = ref<ClientItem | null>(null)

onMounted(async () => {
  await fetchClients()
})

// Filtrado reactivo en memoria para respuesta instantánea
const filteredClients = computed(() => {
  return clients.value.filter((c) => {
    // Filtro por texto (búsqueda en nombre corto, razón social, rif o persona de contacto)
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase().trim()
      const matchShort = c.company_short_name.toLowerCase().includes(q)
      const matchFiscal = c.company_fiscal_name.toLowerCase().includes(q)
      const matchRif = c.rif.toLowerCase().includes(q)
      const matchContact = c.contact_name.toLowerCase().includes(q)
      const matchEmail = c.contact_email.toLowerCase().includes(q)
      if (!matchShort && !matchFiscal && !matchRif && !matchContact && !matchEmail) {
        return false
      }
    }

    // Filtro por estado
    if (selectedStatusFilter.value !== 'all') {
      const isActive = selectedStatusFilter.value === 'active'
      if (c.is_active !== isActive) return false
    }

    return true
  })
})

const openCreateModal = () => {
  selectedClient.value = null
  clearMessages()
  isModalOpen.value = true
}

const openEditModal = (client: ClientItem) => {
  selectedClient.value = client
  clearMessages()
  isModalOpen.value = true
}

const openDeleteModal = (client: ClientItem) => {
  clientToDelete.value = client
  clearMessages()
  isDeleteModalOpen.value = true
}

const handleSaveClient = async (payload: CreateClientData | UpdateClientData) => {
  if (selectedClient.value) {
    const res = await updateClient(selectedClient.value.id, payload)
    if (res.success) {
      isModalOpen.value = false
    }
  } else {
    const res = await createClient(payload as CreateClientData)
    if (res.success) {
      isModalOpen.value = false
    }
  }
}

const handleConfirmDelete = async () => {
  if (!clientToDelete.value) return
  const res = await deleteClient(clientToDelete.value.id)
  if (res.success) {
    isDeleteModalOpen.value = false
    clientToDelete.value = null
  }
}

const handleToggleStatus = async (client: ClientItem) => {
  await toggleClientStatus(client.id)
}
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-10">
    <!-- Encabezado Principal y Botón de Acción -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl lg:text-3xl font-bold text-white tracking-tight">
          Clientes
        </h1>
        <p class="text-sm text-slate-400 mt-1">
          {{ clients.length }} {{ clients.length === 1 ? 'cliente registrado' : 'clientes registrados' }}
        </p>
      </div>

      <button
        type="button"
        class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-lg shadow-orange-950/40 cursor-pointer self-start sm:self-auto"
        @click="openCreateModal"
      >
        <v-icon icon="mdi-plus" size="18" />
        <span>Nuevo cliente</span>
      </button>
    </div>

    <!-- Alertas de Éxito y Error -->
    <div
      v-if="successMessage"
      class="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-center justify-between shadow-lg"
    >
      <div class="flex items-center gap-2">
        <v-icon icon="mdi-check-circle-outline" size="18" class="text-emerald-400" />
        <span>{{ successMessage }}</span>
      </div>
      <button class="text-emerald-400 hover:text-white" @click="clearMessages">
        <v-icon icon="mdi-close" size="16" />
      </button>
    </div>

    <div
      v-if="errorMessage"
      class="p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center justify-between shadow-lg"
    >
      <div class="flex items-center gap-2">
        <v-icon icon="mdi-alert-circle-outline" size="18" class="text-red-400" />
        <span>{{ errorMessage }}</span>
      </div>
      <button class="text-red-400 hover:text-white" @click="clearMessages">
        <v-icon icon="mdi-close" size="16" />
      </button>
    </div>

    <!-- Barra de Búsqueda y Filtros -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <!-- Buscador -->
      <div class="relative flex-1 max-w-md">
        <v-icon
          icon="mdi-magnify"
          size="20"
          class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar cliente..."
          class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0f172a] border border-[#1e293b] text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
        >
        <button
          v-if="searchQuery"
          type="button"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          @click="searchQuery = ''"
        >
          <v-icon icon="mdi-close-circle" size="16" />
        </button>
      </div>

      <!-- Filtro de Estado -->
      <div class="flex items-center gap-1.5 p-1 rounded-xl bg-[#0f172a] border border-[#1e293b] self-start sm:self-auto text-xs">
        <button
          type="button"
          class="px-3 py-1.5 rounded-lg font-medium transition-all"
          :class="selectedStatusFilter === 'all' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'"
          @click="selectedStatusFilter = 'all'"
        >
          Todos ({{ clients.length }})
        </button>
        <button
          type="button"
          class="px-3 py-1.5 rounded-lg font-medium transition-all"
          :class="selectedStatusFilter === 'active' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'"
          @click="selectedStatusFilter = 'active'"
        >
          Activos
        </button>
        <button
          type="button"
          class="px-3 py-1.5 rounded-lg font-medium transition-all"
          :class="selectedStatusFilter === 'inactive' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'"
          @click="selectedStatusFilter = 'inactive'"
        >
          Inactivos
        </button>
      </div>
    </div>

    <!-- Tabla del Directorio Fiscal (Figma 05_clientes_lista.png) -->
    <div class="bg-[#0b1324] border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr class="border-b border-[#1e293b] bg-[#0c1427]/60 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              <th scope="col" class="py-3.5 px-5">Empresa</th>
              <th scope="col" class="py-3.5 px-4">RIF</th>
              <th scope="col" class="py-3.5 px-4">Teléfono oficina</th>
              <th scope="col" class="py-3.5 px-4">Persona de contacto</th>
              <th scope="col" class="py-3.5 px-4">Email</th>
              <th scope="col" class="py-3.5 px-4">Teléfono contacto</th>
              <th scope="col" class="py-3.5 px-4 text-center">Estado</th>
              <th scope="col" class="py-3.5 px-5 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-[#1e293b]/70 text-xs">
            <!-- Estado de Carga -->
            <tr v-if="isLoading && clients.length === 0">
              <td colspan="8" class="py-12 text-center text-slate-400">
                <v-progress-circular indeterminate size="28" width="2" color="orange" class="mb-3" />
                <p class="text-sm">Cargando directorio de clientes...</p>
              </td>
            </tr>

            <!-- Estado Vacío -->
            <tr v-else-if="filteredClients.length === 0">
              <td colspan="8" class="py-14 text-center text-slate-400">
                <div class="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <v-icon icon="mdi-account-group-outline" size="28" />
                </div>
                <p class="text-sm font-semibold text-slate-200">No se encontraron clientes</p>
                <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {{ searchQuery ? 'No hay resultados que coincidan con la búsqueda actual.' : 'Aún no hay empresas clientes registradas en el sistema.' }}
                </p>
                <button
                  v-if="!searchQuery"
                  type="button"
                  class="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-orange-600 hover:bg-orange-500 text-white transition-all shadow-md"
                  @click="openCreateModal"
                >
                  Registrar primer cliente
                </button>
              </td>
            </tr>

            <!-- Filas de Datos -->
            <tr
              v-for="client in filteredClients"
              :key="client.id"
              class="hover:bg-[#131d33]/50 transition-colors group"
            >
              <!-- Empresa (Nombre Corto + Razón Social) -->
              <td class="py-4 px-5">
                <div class="font-bold text-sm text-white tracking-tight">
                  {{ client.company_short_name }}
                </div>
                <div class="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  {{ client.company_fiscal_name }}
                </div>
              </td>

              <!-- RIF -->
              <td class="py-4 px-4 font-mono text-xs text-slate-300 font-medium">
                {{ client.rif }}
              </td>

              <!-- Teléfono de Oficina -->
              <td class="py-4 px-4 text-slate-300 font-mono text-xs">
                {{ client.office_phone || '—' }}
              </td>

              <!-- Persona de Contacto -->
              <td class="py-4 px-4 font-semibold text-slate-200 text-sm">
                {{ client.contact_name }}
              </td>

              <!-- Email de Contacto -->
              <td class="py-4 px-4 text-slate-300 text-xs">
                <span class="hover:underline cursor-pointer" :title="client.contact_email">
                  {{ client.contact_email }}
                </span>
              </td>

              <!-- Teléfono de Contacto -->
              <td class="py-4 px-4 text-slate-300 font-mono text-xs">
                {{ client.contact_phone || '—' }}
              </td>

              <!-- Estado -->
              <td class="py-4 px-4 text-center">
                <span
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors"
                  :class="client.is_active
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                    : 'bg-slate-800/80 text-slate-400 border border-slate-700/60'"
                >
                  {{ client.status_label }}
                </span>
              </td>

              <!-- Acciones (Editar, Alternar Estado, Eliminar) -->
              <td class="py-4 px-5 text-right whitespace-nowrap">
                <div class="flex items-center justify-end gap-1.5">
                  <!-- Editar -->
                  <button
                    type="button"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
                    title="Editar datos del cliente"
                    @click="openEditModal(client)"
                  >
                    <v-icon icon="mdi-pencil-outline" size="18" />
                  </button>

                  <!-- Alternar Estado -->
                  <button
                    type="button"
                    class="p-1.5 rounded-lg transition-colors cursor-pointer"
                    :class="client.is_active ? 'text-emerald-400 hover:bg-emerald-950/50' : 'text-slate-500 hover:bg-slate-800/80'"
                    :title="client.is_active ? 'Desactivar empresa y usuario' : 'Activar empresa y usuario'"
                    @click="handleToggleStatus(client)"
                  >
                    <v-icon :icon="client.is_active ? 'mdi-toggle-switch' : 'mdi-toggle-switch-off-outline'" size="20" />
                  </button>

                  <!-- Eliminar -->
                  <button
                    type="button"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                    title="Eliminar empresa y usuario asociado"
                    @click="openDeleteModal(client)"
                  >
                    <v-icon icon="mdi-delete-outline" size="18" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modales -->
    <ClientModal
      v-model="isModalOpen"
      :client-to-edit="selectedClient"
      :is-loading="isSaving"
      :field-errors="fieldErrors"
      @save="handleSaveClient"
    />

    <ClientDeleteModal
      v-model="isDeleteModalOpen"
      :client="clientToDelete"
      :is-loading="isDeleting"
      @confirm="handleConfirmDelete"
    />
  </div>
</template>
