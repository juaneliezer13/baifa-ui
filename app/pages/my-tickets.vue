<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useTickets } from '~/composables/useTickets'
import { useSupportChat } from '~/composables/useSupportChat'
import type { SupportTicket, SupportTicketStatus } from '~~/types/support'

definePageMeta({
  layout: false
})

useHead({
  title: 'Mis Consultas y Tickets de Soporte - BaiFa Power'
})

const { user } = useAuth()
const isClient = computed(() => user.value?.role === 'client')
const { openWidget } = useSupportChat()

const {
  tickets,
  selectedTicket,
  ticketMessages,
  ticketLogs,
  isLoading,
  errorMessage,
  fetchMyTickets,
  fetchTicketDetail,
  sendTicketMessage
} = useTickets()

// Filtros reactivos
const selectedCategory = ref<string>('all')
const selectedStatus = ref<string>('all')
const searchFilter = ref<string>('')

// Modal de detalle de consulta
const isDetailModalOpen = ref(false)
const activeTab = ref<'chat' | 'logs'>('chat')
const newChatMessage = ref('')
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

const loadTickets = async () => {
  const params: Record<string, any> = {}
  if (selectedCategory.value !== 'all') {
    params.category = selectedCategory.value
  }
  if (selectedStatus.value !== 'all') {
    params.status = selectedStatus.value
  }
  if (searchFilter.value.trim()) {
    params.search = searchFilter.value.trim()
  }

  await fetchMyTickets(params)
}

watch([selectedCategory, selectedStatus], () => {
  loadTickets()
})

let searchDebounceTimer: any = null
const handleSearchInput = () => {
  clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    loadTickets()
  }, 350)
}

const openDetailModal = async (ticket: SupportTicket) => {
  await fetchTicketDetail(ticket.id)
  isDetailModalOpen.value = true
  activeTab.value = 'chat'
}

const closeDetailModal = () => {
  isDetailModalOpen.value = false
  newChatMessage.value = ''
}

const handleSendMessage = async () => {
  if (!selectedTicket.value || !newChatMessage.value.trim() || isSendingMessage.value) return
  isSendingMessage.value = true
  const msg = newChatMessage.value
  newChatMessage.value = ''
  await sendTicketMessage(selectedTicket.value.id, msg)
  isSendingMessage.value = false
}

onMounted(() => {
  loadTickets()
})
</script>

<template>
  <NuxtLayout name="client">
    <div class="space-y-6 max-w-7xl mx-auto pb-12">
      <!-- Encabezado -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl lg:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <v-icon icon="mdi-headset" class="text-[#3eb134]" size="28" />
            <span>Mis Consultas y Soporte</span>
          </h1>
          <p class="text-sm text-slate-400 mt-1">
            Historial de requerimientos técnicos, seguimiento de helpdesk y bitácora de atención
          </p>
        </div>

        <button
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-[#3eb134] hover:bg-[#349e2e] active:scale-[0.99] transition-all shadow-lg shadow-[#3eb134]/25 cursor-pointer shrink-0 self-start sm:self-auto"
          @click="openWidget"
        >
          <v-icon icon="mdi-plus" size="18" />
          <span>Nueva Consulta</span>
        </button>
      </div>

      <!-- Barra de Filtros y Búsqueda -->
      <div class="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 space-y-3.5 shadow-sm">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <!-- Búsqueda textual -->
          <div class="relative sm:col-span-1">
            <input
              v-model="searchFilter"
              type="text"
              placeholder="Buscar por código o título..."
              class="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#3eb134] transition-all"
              @input="handleSearchInput"
            />
            <v-icon icon="mdi-magnify" size="18" class="absolute left-3 top-2.5 text-slate-500" />
          </div>

          <!-- Filtro por Área / Categoría -->
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

          <!-- Filtro por Estado -->
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
        </div>
      </div>

      <!-- Alerta de Error -->
      <div
        v-if="errorMessage"
        class="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center justify-between"
      >
        <div class="flex items-center gap-2.5">
          <v-icon icon="mdi-alert-circle-outline" size="18" class="text-red-400" />
          <span>{{ errorMessage }}</span>
        </div>
      </div>

      <!-- Estado de Carga -->
      <div v-if="isLoading" class="py-16 text-center space-y-3">
        <v-icon icon="mdi-loading" size="32" class="text-[#3eb134] animate-spin" />
        <p class="text-xs text-slate-400">Cargando tus consultas de soporte...</p>
      </div>

      <!-- Sin Resultados -->
      <div
        v-else-if="tickets.length === 0"
        class="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-12 text-center space-y-4"
      >
        <div class="w-16 h-16 mx-auto rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-center text-slate-400">
          <v-icon icon="mdi-headset-off" size="32" />
        </div>
        <div class="max-w-md mx-auto">
          <h3 class="text-base font-bold text-white">No se encontraron consultas registradas</h3>
          <p class="text-xs text-slate-400 mt-1 leading-relaxed">
            No tienes tickets que coincidan con los filtros seleccionados. Si tienes dudas técnicas o sobre tu equipo, puedes abrir una nueva consulta ahora.
          </p>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-[#3eb134] hover:bg-[#349e2e] transition-all cursor-pointer"
          @click="openWidget"
        >
          <v-icon icon="mdi-plus" size="16" />
          <span>Generar Consulta</span>
        </button>
      </div>

      <!-- Listado de Tarjetas de Consultas -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="ticket in tickets"
          :key="ticket.id"
          class="bg-[#0f172a] border border-[#1e293b] hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 group cursor-pointer shadow-sm hover:shadow-md"
          @click="openDetailModal(ticket)"
        >
          <div class="space-y-3">
            <!-- Código y Estatus -->
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-slate-800 text-[#3eb134] border border-slate-700">
                #{{ ticket.code }}
              </span>

              <span
                class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border"
                :class="{
                  'bg-amber-950/50 border-amber-800/60 text-amber-300': ticket.status === 'pending',
                  'bg-sky-950/50 border-sky-800/60 text-sky-300': ticket.status === 'in_progress',
                  'bg-emerald-950/50 border-emerald-800/60 text-emerald-300': ticket.status === 'finished',
                  'bg-red-950/50 border-red-800/60 text-red-300': ticket.status === 'cancelled',
                }"
              >
                {{ ticket.status_label }}
              </span>
            </div>

            <!-- Título de la Consulta -->
            <h3 class="text-sm font-bold text-white group-hover:text-[#3eb134] transition-colors line-clamp-2 leading-snug">
              {{ ticket.title }}
            </h3>

            <!-- Categoría -->
            <div class="text-[11px] text-slate-400 flex items-center gap-1.5">
              <v-icon icon="mdi-tag-outline" size="14" class="text-slate-500" />
              <span>{{ ticket.category_label }}</span>
            </div>

            <!-- Comentario Final si aplica -->
            <div
              v-if="ticket.final_comment"
              class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 italic line-clamp-2"
            >
              "{{ ticket.final_comment }}"
            </div>
          </div>

          <!-- Pie de tarjeta: Operador y Fecha -->
          <div class="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span class="flex items-center gap-1">
              <v-icon icon="mdi-account-outline" size="14" />
              <span class="truncate max-w-[130px]">
                {{ ticket.assigned_agent?.name || 'Por asignar' }}
              </span>
            </span>

            <span>
              {{ ticket.created_at ? ticket.created_at.slice(0, 10) : '' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL DE DETALLE DE CONSULTA Y CHAT PARA EL CLIENTE -->
    <v-dialog v-model="isDetailModalOpen" max-width="680" persistent>
      <div class="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] text-slate-200">
        <!-- Header del Modal -->
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
            class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            @click="closeDetailModal"
          >
            <v-icon icon="mdi-close" size="20" />
          </button>
        </div>

        <!-- Pestañas: Chat / Bitácora -->
        <div class="flex items-center border-b border-slate-800 bg-slate-900/60 px-4 shrink-0 text-xs font-semibold">
          <button
            type="button"
            class="py-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5"
            :class="activeTab === 'chat'
              ? 'border-[#3eb134] text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'"
            @click="activeTab = 'chat'"
          >
            <v-icon icon="mdi-chat-outline" size="16" />
            <span>Chat con Soporte</span>
          </button>

          <button
            type="button"
            class="py-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5"
            :class="activeTab === 'logs'
              ? 'border-[#3eb134] text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'"
            @click="activeTab = 'logs'"
          >
            <v-icon icon="mdi-timeline-clock-outline" size="16" />
            <span>Bitácora de Evolución</span>
          </button>
        </div>

        <!-- CONTENIDO: PESTAÑA CHAT -->
        <div v-if="activeTab === 'chat'" class="flex-1 flex flex-col min-h-0 overflow-hidden">
          <!-- Información del operador -->
          <div class="px-4 py-2 bg-slate-900/40 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
            <span>
              Operador: <strong class="text-white">{{ selectedTicket?.assigned_agent?.name || 'En espera de asignación' }}</strong>
            </span>
            <span v-if="selectedTicket?.closed_at" class="text-slate-500">
              Cerrado: {{ selectedTicket.closed_at.slice(0, 16).replace('T', ' ') }}
            </span>
          </div>

          <!-- Comentario Final de resolución si está cerrado -->
          <div
            v-if="selectedTicket?.final_comment"
            class="mx-4 mt-3 p-3 rounded-xl bg-slate-800/70 border border-slate-700 text-xs text-slate-200 shrink-0"
          >
            <span class="font-semibold block text-[#3eb134] mb-0.5">Comentario Final / Resolución:</span>
            {{ selectedTicket.final_comment }}
          </div>

          <!-- Lista de Mensajes -->
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            <div
              v-for="msg in ticketMessages"
              :key="msg.id"
              class="flex flex-col"
              :class="{
                'items-end': msg.sender_type === 'client',
                'items-start': msg.sender_type === 'agent',
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
                :class="msg.sender_type === 'client' ? 'items-end' : 'items-start'"
              >
                <span class="text-[10px] text-slate-400 mb-0.5 px-1 font-medium">
                  {{ msg.sender_name }}
                </span>
                <div
                  class="px-3.5 py-2 text-xs rounded-2xl leading-relaxed shadow-sm break-words"
                  :class="msg.sender_type === 'client'
                    ? 'bg-[#3eb134] text-white rounded-tr-xs'
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

          <!-- Entrada para enviar mensajes si el ticket sigue activo -->
          <footer
            v-if="selectedTicket && ['pending', 'in_progress'].includes(selectedTicket.status)"
            class="p-3 bg-slate-900 border-t border-slate-800 shrink-0"
          >
            <form class="flex items-center gap-2" @submit.prevent="handleSendMessage">
              <input
                v-model="newChatMessage"
                type="text"
                placeholder="Escribe tu mensaje..."
                class="flex-1 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#3eb134] transition-all"
              />
              <button
                type="submit"
                class="p-2.5 rounded-xl bg-[#3eb134] hover:bg-[#349e2e] text-white transition-all cursor-pointer disabled:opacity-40 shrink-0"
                :disabled="!newChatMessage.trim() || isSendingMessage"
              >
                <v-icon icon="mdi-send" size="16" />
              </button>
            </form>
          </footer>
          <div
            v-else
            class="p-3 bg-slate-900 border-t border-slate-800 text-center text-xs text-slate-500 shrink-0"
          >
            Este ticket se encuentra cerrado. Para realizar una nueva consulta técnica, abre un nuevo ticket.
          </div>
        </div>

        <!-- CONTENIDO: PESTAÑA BITÁCORA -->
        <div v-else-if="activeTab === 'logs'" class="flex-1 overflow-y-auto p-5 space-y-4">
          <div v-if="ticketLogs.length === 0" class="text-center py-8 text-xs text-slate-500">
            No hay registros de bitácora disponibles para este ticket.
          </div>

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
  </NuxtLayout>
</template>
