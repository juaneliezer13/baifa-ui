<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useTickets } from '~/composables/useTickets'
import { useUsers } from '~/composables/useUsers'
import type { SupportTicket, SupportTicketStatus } from '~~/types/support'

definePageMeta({
  layout: 'default'
})

useHead({
  title: 'Tickera y Helpdesk - BaiFa Power'
})

const { user } = useAuth()
const isAdmin = computed(() => user.value?.role === 'admin')
const isInternal = computed(() => ['admin', 'manager', 'employee'].includes(user.value?.role || ''))

const {
  tickets,
  selectedTicket,
  ticketMessages,
  ticketLogs,
  isLoading,
  isSaving,
  errorMessage,
  successMessage,
  clearMessages,
  fetchTickets,
  fetchTicketDetail,
  assignTicket,
  updateTicketStatus,
  sendTicketMessage
} = useTickets()

const { users, fetchUsers } = useUsers()

// Filtros
const selectedStatus = ref<string>('all')
const selectedCategory = ref<string>('all')
const selectedAssignment = ref<string>('all')
const searchFilter = ref<string>('')

// Modales de Acción
const isDetailModalOpen = ref(false)
const isAssignModalOpen = ref(false)
const isStatusModalOpen = ref(false)
const activeTab = ref<'chat' | 'logs'>('chat')

// Datos de formularios modales
const targetTicket = ref<SupportTicket | null>(null)
const selectedAssignUserId = ref<number | null>(null)
const assignComment = ref<string>('')

const newStatus = ref<SupportTicketStatus>('in_progress')
const finalComment = ref<string>('')
const statusComment = ref<string>('')
const statusFormError = ref<string>('')

const newAgentMessage = ref<string>('')
const isSendingMessage = ref(false)

const categories = [
  { value: 'all', label: 'Todas las Áreas' },
  { value: 'soporte_tecnico', label: 'Soporte Técnico' },
  { value: 'logistica', label: 'Logística y Despacho' },
  { value: 'garantias', label: 'Garantías y Mantenimiento' },
  { value: 'otra_consulta', label: 'Otra Consulta' }
]

const statusFilters = [
  { value: 'all', label: 'Todos los Estados' },
  { value: 'pending', label: 'En Espera' },
  { value: 'in_progress', label: 'En Proceso' },
  { value: 'finished', label: 'Finalizados' },
  { value: 'cancelled', label: 'Cancelados' }
]

const assignmentFilters = [
  { value: 'all', label: 'Todas las Asignaciones' },
  { value: 'me', label: 'Asignados a Mí' },
  { value: 'unassigned', label: 'Sin Asignar' }
]

// Métricas KPI
const kpis = computed(() => {
  const pending = tickets.value.filter(t => t.status === 'pending').length
  const inProgress = tickets.value.filter(t => t.status === 'in_progress').length
  const finished = tickets.value.filter(t => t.status === 'finished').length
  const cancelled = tickets.value.filter(t => t.status === 'cancelled').length
  const total = tickets.value.length

  return { pending, inProgress, finished, cancelled, total }
})

// Lista de operadores elegibles (empleados y administradores)
const eligibleOperators = computed(() => {
  return users.value.filter(u => ['admin', 'manager', 'employee'].includes(u.role))
})

const loadTickets = async () => {
  const params: Record<string, any> = {}
  if (selectedStatus.value !== 'all') params.status = selectedStatus.value
  if (selectedCategory.value !== 'all') params.category = selectedCategory.value
  if (selectedAssignment.value !== 'all') params.assigned_to = selectedAssignment.value
  if (searchFilter.value.trim()) params.search = searchFilter.value.trim()

  await fetchTickets(params)
}

watch([selectedStatus, selectedCategory, selectedAssignment], () => {
  loadTickets()
})

let searchDebounce: any = null
const handleSearchInput = () => {
  clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    loadTickets()
  }, 350)
}

// Acción: Autoasignarse ("Tomar Ticket")
const handleTakeTicket = async (ticket: SupportTicket) => {
  const ok = await assignTicket(ticket.id, {
    comment: 'Ticket tomado de la tickera por el operador.'
  })
  if (ok) {
    loadTickets()
  }
}

// Abrir modal de asignación
const openAssignModal = (ticket: SupportTicket) => {
  targetTicket.value = ticket
  selectedAssignUserId.value = ticket.assigned_agent?.id || user.value?.id || null
  assignComment.value = ''
  isAssignModalOpen.value = true
}

const handleConfirmAssign = async () => {
  if (!targetTicket.value) return
  const ok = await assignTicket(targetTicket.value.id, {
    assigned_to_user_id: selectedAssignUserId.value || undefined,
    comment: assignComment.value.trim() || undefined
  })
  if (ok) {
    isAssignModalOpen.value = false
    loadTickets()
  }
}

// Abrir modal de cambio de estatus
const openStatusModal = (ticket: SupportTicket) => {
  targetTicket.value = ticket
  newStatus.value = ticket.status === 'pending' ? 'in_progress' : ticket.status
  finalComment.value = ''
  statusComment.value = ''
  statusFormError.value = ''
  isStatusModalOpen.value = true
}

const handleConfirmStatusChange = async () => {
  if (!targetTicket.value) return
  statusFormError.value = ''

  if (['finished', 'cancelled'].includes(newStatus.value) && !finalComment.value.trim()) {
    statusFormError.value = 'El comentario final explicativo es obligatorio para finalizar o cancelar el ticket.'
    return
  }

  const ok = await updateTicketStatus(targetTicket.value.id, {
    status: newStatus.value,
    final_comment: finalComment.value.trim() || undefined,
    comment: statusComment.value.trim() || undefined
  })

  if (ok) {
    isStatusModalOpen.value = false
    loadTickets()
  }
}

// Abrir modal de detalle/chat
const openDetailModal = async (ticket: SupportTicket) => {
  await fetchTicketDetail(ticket.id)
  isDetailModalOpen.value = true
  activeTab.value = 'chat'
}

const handleSendAgentMessage = async () => {
  if (!selectedTicket.value || !newAgentMessage.value.trim() || isSendingMessage.value) return
  isSendingMessage.value = true
  const msg = newAgentMessage.value
  newAgentMessage.value = ''
  await sendTicketMessage(selectedTicket.value.id, msg)
  isSendingMessage.value = false
}

onMounted(async () => {
  await loadTickets()
  if (isAdmin.value) {
    await fetchUsers()
  }
})
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <!-- Encabezado de la Sección -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl lg:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <v-icon icon="mdi-ticket-confirmation-outline" class="text-[#3eb134]" size="28" />
          <span>Tickera / Helpdesk de Soporte</span>
        </h1>
        <p class="text-sm text-slate-400 mt-1">
          Bandeja de atención técnica, asignación de operadores, chat en vivo y evolución de casos
        </p>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 cursor-pointer self-start sm:self-auto"
        @click="loadTickets"
      >
        <v-icon icon="mdi-refresh" size="16" :class="{ 'animate-spin': isLoading }" />
        <span>Actualizar Tickera</span>
      </button>
    </div>

    <!-- Alertas -->
    <div
      v-if="successMessage"
      class="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center justify-between"
    >
      <div class="flex items-center gap-2.5">
        <v-icon icon="mdi-check-circle-outline" size="18" class="text-emerald-400" />
        <span>{{ successMessage }}</span>
      </div>
      <button type="button" class="text-emerald-400 hover:text-white" @click="clearMessages">
        <v-icon icon="mdi-close" size="16" />
      </button>
    </div>

    <div
      v-if="errorMessage"
      class="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center justify-between"
    >
      <div class="flex items-center gap-2.5">
        <v-icon icon="mdi-alert-circle-outline" size="18" class="text-red-400" />
        <span>{{ errorMessage }}</span>
      </div>
      <button type="button" class="text-red-400 hover:text-white" @click="clearMessages">
        <v-icon icon="mdi-close" size="16" />
      </button>
    </div>

    <!-- 1. Tarjetas KPI Superiores -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      <div class="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 flex flex-col justify-between">
        <div class="flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>En Espera</span>
          <v-icon icon="mdi-clock-outline" size="18" class="text-amber-400" />
        </div>
        <div class="mt-3">
          <span class="text-2xl font-bold text-white tracking-tight">{{ kpis.pending }}</span>
          <span class="text-[11px] text-slate-500 ml-1.5">por asignar</span>
        </div>
      </div>

      <div class="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 flex flex-col justify-between">
        <div class="flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>En Proceso</span>
          <v-icon icon="mdi-account-clock-outline" size="18" class="text-sky-400" />
        </div>
        <div class="mt-3">
          <span class="text-2xl font-bold text-white tracking-tight">{{ kpis.inProgress }}</span>
          <span class="text-[11px] text-slate-500 ml-1.5">en atención</span>
        </div>
      </div>

      <div class="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 flex flex-col justify-between">
        <div class="flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>Finalizados</span>
          <v-icon icon="mdi-check-decagram-outline" size="18" class="text-emerald-400" />
        </div>
        <div class="mt-3">
          <span class="text-2xl font-bold text-white tracking-tight">{{ kpis.finished }}</span>
          <span class="text-[11px] text-slate-500 ml-1.5">resueltos</span>
        </div>
      </div>

      <div class="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 flex flex-col justify-between">
        <div class="flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>Cancelados</span>
          <v-icon icon="mdi-close-circle-outline" size="18" class="text-red-400" />
        </div>
        <div class="mt-3">
          <span class="text-2xl font-bold text-white tracking-tight">{{ kpis.cancelled }}</span>
          <span class="text-[11px] text-slate-500 ml-1.5">anulados</span>
        </div>
      </div>

      <div class="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 flex flex-col justify-between">
        <div class="flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>Total Tickets</span>
          <v-icon icon="mdi-ticket-percent-outline" size="18" class="text-[#3eb134]" />
        </div>
        <div class="mt-3">
          <span class="text-2xl font-bold text-white tracking-tight">{{ kpis.total }}</span>
          <span class="text-[11px] text-slate-500 ml-1.5">registrados</span>
        </div>
      </div>
    </div>

    <!-- 2. Filtros y Búsqueda -->
    <div class="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 shadow-sm">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <!-- Buscador -->
        <div class="relative">
          <input
            v-model="searchFilter"
            type="text"
            placeholder="Buscar por código, título, cliente..."
            class="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#3eb134] transition-all"
            @input="handleSearchInput"
          />
          <v-icon icon="mdi-magnify" size="18" class="absolute left-3 top-2.5 text-slate-500" />
        </div>

        <!-- Filtro Estado -->
        <div>
          <select
            v-model="selectedStatus"
            class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-[#3eb134] transition-all cursor-pointer"
          >
            <option v-for="st in statusFilters" :key="st.value" :value="st.value">
              {{ st.label }}
            </option>
          </select>
        </div>

        <!-- Filtro Categoría -->
        <div>
          <select
            v-model="selectedCategory"
            class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-[#3eb134] transition-all cursor-pointer"
          >
            <option v-for="cat in categories" :key="cat.value" :value="cat.value">
              {{ cat.label }}
            </option>
          </select>
        </div>

        <!-- Filtro Asignación -->
        <div>
          <select
            v-model="selectedAssignment"
            class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-[#3eb134] transition-all cursor-pointer"
          >
            <option v-for="af in assignmentFilters" :key="af.value" :value="af.value">
              {{ af.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- 3. Tabla / Listado de la Tickera -->
    <div class="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-sm">
      <div v-if="isLoading" class="py-16 text-center space-y-3">
        <v-icon icon="mdi-loading" size="32" class="text-[#3eb134] animate-spin" />
        <p class="text-xs text-slate-400">Cargando tickets de la tickera...</p>
      </div>

      <div v-else-if="tickets.length === 0" class="py-12 text-center space-y-2">
        <v-icon icon="mdi-ticket-outline" size="36" class="text-slate-600" />
        <h3 class="text-sm font-semibold text-white">No hay tickets que mostrar</h3>
        <p class="text-xs text-slate-400">Prueba ajustando los filtros de búsqueda o estatus.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              <th class="pb-3 pr-4">Ticket</th>
              <th class="pb-3 px-4">Cliente / Solicitante</th>
              <th class="pb-3 px-4">Asunto & Área</th>
              <th class="pb-3 px-4">Operador Asignado</th>
              <th class="pb-3 px-4">Estatus</th>
              <th class="pb-3 pl-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60 text-xs">
            <tr
              v-for="ticket in tickets"
              :key="ticket.id"
              class="hover:bg-slate-800/30 transition-colors"
            >
              <!-- Código -->
              <td class="py-3.5 pr-4 font-mono font-bold text-[#3eb134]">
                #{{ ticket.code }}
              </td>

              <!-- Cliente -->
              <td class="py-3.5 px-4">
                <div class="font-semibold text-white">
                  {{ ticket.user?.name || 'Cliente' }}
                </div>
                <div class="text-[11px] text-slate-400 truncate max-w-[160px]">
                  {{ ticket.client?.company_fiscal_name || ticket.user?.email }}
                </div>
              </td>

              <!-- Asunto & Área -->
              <td class="py-3.5 px-4 max-w-[220px]">
                <div class="font-medium text-white truncate" :title="ticket.title">
                  {{ ticket.title }}
                </div>
                <div class="text-[10px] text-slate-400 mt-0.5">
                  {{ ticket.category_label }}
                </div>
              </td>

              <!-- Operador Asignado -->
              <td class="py-3.5 px-4">
                <div v-if="ticket.assigned_agent" class="flex items-center gap-1.5">
                  <div class="w-5 h-5 rounded-full bg-slate-700 text-[#3eb134] text-[9px] font-bold flex items-center justify-center">
                    {{ ticket.assigned_agent.name[0] }}
                  </div>
                  <span class="text-white text-xs">{{ ticket.assigned_agent.name }}</span>
                </div>
                <span
                  v-else
                  class="text-[10px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/50 px-2 py-0.5 rounded-full"
                >
                  Sin Asignar
                </span>
              </td>

              <!-- Estatus -->
              <td class="py-3.5 px-4">
                <span
                  class="text-[10px] font-semibold px-2.5 py-0.5 rounded-full border whitespace-nowrap"
                  :class="{
                    'bg-amber-950/50 border-amber-800/60 text-amber-300': ticket.status === 'pending',
                    'bg-sky-950/50 border-sky-800/60 text-sky-300': ticket.status === 'in_progress',
                    'bg-emerald-950/50 border-emerald-800/60 text-emerald-300': ticket.status === 'finished',
                    'bg-red-950/50 border-red-800/60 text-red-300': ticket.status === 'cancelled',
                  }"
                >
                  {{ ticket.status_label }}
                </span>
              </td>

              <!-- Acciones -->
              <td class="py-3.5 pl-4 text-right space-x-1.5 whitespace-nowrap">
                <!-- Tomar Ticket (si no está asignado a mí) -->
                <button
                  v-if="ticket.assigned_agent?.id !== user?.id && ['pending', 'in_progress'].includes(ticket.status)"
                  type="button"
                  class="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white bg-sky-600 hover:bg-sky-500 transition-colors cursor-pointer"
                  title="Tomar este ticket de la tickera"
                  @click="handleTakeTicket(ticket)"
                >
                  Tomar
                </button>

                <!-- Asignar (Admin) -->
                <button
                  v-if="isAdmin"
                  type="button"
                  class="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 cursor-pointer"
                  title="Asignar a operador"
                  @click="openAssignModal(ticket)"
                >
                  Asignar
                </button>

                <!-- Cambiar Estatus -->
                <button
                  type="button"
                  class="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-amber-300 bg-amber-950/60 border border-amber-800/60 hover:bg-amber-900/60 transition-colors cursor-pointer"
                  title="Cambiar estatus (Finalizar o Cancelar)"
                  @click="openStatusModal(ticket)"
                >
                  Estatus
                </button>

                <!-- Ver Chat / Bitácora -->
                <button
                  type="button"
                  class="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 hover:bg-emerald-900/60 transition-colors cursor-pointer"
                  title="Abrir chat y ver bitácora"
                  @click="openDetailModal(ticket)"
                >
                  Chat
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL DE ASIGNACIÓN DE OPERADOR (ADMIN) -->
    <v-dialog v-model="isAssignModalOpen" max-width="480" persistent>
      <div class="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 text-slate-200 space-y-4 shadow-2xl">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 class="text-sm font-bold text-white flex items-center gap-2">
            <v-icon icon="mdi-account-plus" class="text-sky-400" size="20" />
            <span>Asignar Ticket #{{ targetTicket?.code }}</span>
          </h2>
          <button type="button" class="text-slate-400 hover:text-white" @click="isAssignModalOpen = false">
            <v-icon icon="mdi-close" size="18" />
          </button>
        </div>

        <div class="space-y-3">
          <div>
            <label class="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Operador Técnico
            </label>
            <select
              v-model="selectedAssignUserId"
              class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
            >
              <option v-for="op in eligibleOperators" :key="op.id" :value="op.id">
                {{ op.name }} ({{ op.role }}) - {{ op.email }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Nota u Observación (Opcional)
            </label>
            <input
              v-model="assignComment"
              type="text"
              placeholder="Ej: Caso prioritario asignado por Admin..."
              class="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
          <button
            type="button"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            @click="isAssignModalOpen = false"
          >
            Cancelar
          </button>
          <button
            type="button"
            :disabled="isSaving"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 disabled:opacity-50"
            @click="handleConfirmAssign"
          >
            {{ isSaving ? 'Asignando...' : 'Confirmar Asignación' }}
          </button>
        </div>
      </div>
    </v-dialog>

    <!-- MODAL DE CAMBIO DE ESTATUS (FINALIZAR / CANCELAR CON COMENTARIO OBLIGATORIO) -->
    <v-dialog v-model="isStatusModalOpen" max-width="500" persistent>
      <div class="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 text-slate-200 space-y-4 shadow-2xl">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 class="text-sm font-bold text-white flex items-center gap-2">
            <v-icon icon="mdi-list-status" class="text-amber-400" size="20" />
            <span>Actualizar Estatus de Ticket #{{ targetTicket?.code }}</span>
          </h2>
          <button type="button" class="text-slate-400 hover:text-white" @click="isStatusModalOpen = false">
            <v-icon icon="mdi-close" size="18" />
          </button>
        </div>

        <div class="space-y-3.5">
          <!-- Selector de Estado -->
          <div>
            <label class="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Nuevo Estatus
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                class="py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center"
                :class="newStatus === 'in_progress'
                  ? 'bg-sky-950/80 border-sky-500 text-sky-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400'"
                @click="newStatus = 'in_progress'"
              >
                En Proceso
              </button>
              <button
                type="button"
                class="py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center"
                :class="newStatus === 'finished'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400'"
                @click="newStatus = 'finished'"
              >
                Finalizado
              </button>
              <button
                type="button"
                class="py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center"
                :class="newStatus === 'cancelled'
                  ? 'bg-red-950/80 border-red-500 text-red-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400'"
                @click="newStatus = 'cancelled'"
              >
                Cancelado
              </button>
            </div>
          </div>

          <!-- Comentario Final Obligatorio si es finalizado o cancelado -->
          <div v-if="['finished', 'cancelled'].includes(newStatus)">
            <label class="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Comentario Final Obligatorio <span class="text-emerald-400">*</span>
            </label>
            <textarea
              v-model="finalComment"
              rows="3"
              placeholder="Explica detalladamente la resolución o el motivo de cancelación..."
              class="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#3eb134] resize-none"
            />
          </div>

          <div v-else>
            <label class="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Observaciones (Opcional)
            </label>
            <input
              v-model="statusComment"
              type="text"
              placeholder="Nota sobre el cambio de estado..."
              class="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#3eb134]"
            />
          </div>

          <div
            v-if="statusFormError"
            class="p-2.5 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs"
          >
            {{ statusFormError }}
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
          <button
            type="button"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            @click="isStatusModalOpen = false"
          >
            Cancelar
          </button>
          <button
            type="button"
            :disabled="isSaving"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#3eb134] hover:bg-[#349e2e] disabled:opacity-50"
            @click="handleConfirmStatusChange"
          >
            {{ isSaving ? 'Guardando...' : 'Aplicar Cambio' }}
          </button>
        </div>
      </div>
    </v-dialog>

    <!-- MODAL DE CHAT EN VIVO Y BITÁCORA PARA EL PERSONAL INTERNO -->
    <v-dialog v-model="isDetailModalOpen" max-width="700" persistent>
      <div class="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] text-slate-200">
        <!-- Header -->
        <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-[#122815] border-b border-[#1e293b] p-4 flex items-center justify-between shrink-0">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-[#3eb134] border border-slate-700">
                #{{ selectedTicket?.code }}
              </span>
              <span
                class="text-[11px] font-semibold px-2 py-0.5 rounded-full border"
                :class="{
                  'bg-amber-950/50 border-amber-800/60 text-amber-300': selectedTicket?.status === 'pending',
                  'bg-sky-950/50 border-sky-800/60 text-sky-300': selectedTicket?.status === 'in_progress',
                  'bg-emerald-950/50 border-emerald-800/60 text-emerald-300': selectedTicket?.status === 'finished',
                  'bg-red-950/50 border-red-800/60 text-red-300': selectedTicket?.status === 'cancelled',
                }"
              >
                {{ selectedTicket?.status_label }}
              </span>
            </div>
            <h2 class="text-sm font-bold text-white truncate mt-1">
              {{ selectedTicket?.title }}
            </h2>
          </div>

          <button
            type="button"
            class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            @click="isDetailModalOpen = false"
          >
            <v-icon icon="mdi-close" size="20" />
          </button>
        </div>

        <!-- Pestañas -->
        <div class="flex items-center border-b border-slate-800 bg-slate-900/60 px-4 shrink-0 text-xs font-semibold">
          <button
            type="button"
            class="py-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5"
            :class="activeTab === 'chat' ? 'border-[#3eb134] text-white' : 'border-transparent text-slate-400 hover:text-slate-200'"
            @click="activeTab = 'chat'"
          >
            <v-icon icon="mdi-chat-outline" size="16" />
            <span>Chat con el Cliente</span>
          </button>

          <button
            type="button"
            class="py-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5"
            :class="activeTab === 'logs' ? 'border-[#3eb134] text-white' : 'border-transparent text-slate-400 hover:text-slate-200'"
            @click="activeTab = 'logs'"
          >
            <v-icon icon="mdi-timeline-clock-outline" size="16" />
            <span>Bitácora de Evolución</span>
          </button>
        </div>

        <!-- CHAT -->
        <div v-if="activeTab === 'chat'" class="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div class="px-4 py-2 bg-slate-900/40 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
            <span>Cliente: <strong class="text-white">{{ selectedTicket?.user?.name }}</strong> ({{ selectedTicket?.client?.company_fiscal_name || selectedTicket?.user?.email }})</span>
            <span>Operador: <strong class="text-[#3eb134]">{{ selectedTicket?.assigned_agent?.name || 'Sin Asignar' }}</strong></span>
          </div>

          <!-- Mensajes -->
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            <div
              v-for="msg in ticketMessages"
              :key="msg.id"
              class="flex flex-col"
              :class="{
                'items-end': msg.sender_type === 'agent',
                'items-start': msg.sender_type === 'client',
                'items-center my-1': msg.sender_type === 'system'
              }"
            >
              <div
                v-if="msg.sender_type === 'system'"
                class="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[10px] text-slate-300 max-w-[90%] text-center"
              >
                {{ msg.message }}
              </div>

              <div
                v-else
                class="max-w-[85%] flex flex-col"
                :class="msg.sender_type === 'agent' ? 'items-end' : 'items-start'"
              >
                <span class="text-[10px] text-slate-400 mb-0.5 px-1 font-medium">
                  {{ msg.sender_name }} ({{ msg.sender_type === 'agent' ? 'Operador' : 'Cliente' }})
                </span>
                <div
                  class="px-3.5 py-2 text-xs rounded-2xl leading-relaxed shadow-sm break-words"
                  :class="msg.sender_type === 'agent'
                    ? 'bg-sky-600 text-white rounded-tr-xs'
                    : 'bg-[#1e293b] text-slate-100 border border-slate-700/80 rounded-tl-xs'"
                >
                  {{ msg.message }}
                </div>
                <span class="text-[9px] text-slate-500 mt-0.5 px-1 font-mono">
                  {{ msg.created_at ? msg.created_at.slice(11, 16) : '' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Barra de respuesta para el operador -->
          <footer
            v-if="selectedTicket && ['pending', 'in_progress'].includes(selectedTicket.status)"
            class="p-3 bg-slate-900 border-t border-slate-800 shrink-0"
          >
            <form class="flex items-center gap-2" @submit.prevent="handleSendAgentMessage">
              <input
                v-model="newAgentMessage"
                type="text"
                placeholder="Responder al cliente en el chat..."
                class="flex-1 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#3eb134] transition-all"
              />
              <button
                type="submit"
                class="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white transition-all cursor-pointer disabled:opacity-40 shrink-0"
                :disabled="!newAgentMessage.trim() || isSendingMessage"
              >
                <v-icon icon="mdi-send" size="16" />
              </button>
            </form>
          </footer>
        </div>

        <!-- BITÁCORA -->
        <div v-else-if="activeTab === 'logs'" class="flex-1 overflow-y-auto p-5 space-y-3">
          <div
            v-for="log in ticketLogs"
            :key="log.id"
            class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1"
          >
            <div class="flex items-center justify-between text-[11px]">
              <span class="font-semibold text-white">
                {{ log.user_name || 'Sistema' }}
                <span class="text-slate-500 font-normal">({{ log.user_role || 'Automático' }})</span>
              </span>
              <span class="text-slate-500 font-mono">
                {{ log.created_at ? log.created_at.slice(0, 16).replace('T', ' ') : '' }}
              </span>
            </div>

            <p class="text-xs text-slate-300">
              {{ log.comment }}
            </p>

            <div v-if="log.previous_status && log.new_status" class="text-[10px] text-slate-400 mt-1">
              Estado: <span class="text-slate-500 line-through">{{ log.previous_status }}</span> ➔ <span class="text-[#3eb134] font-semibold">{{ log.new_status }}</span>
            </div>
          </div>
        </div>
      </div>
    </v-dialog>
  </div>
</template>
