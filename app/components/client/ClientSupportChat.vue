<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useSupportChat } from '~/composables/useSupportChat'

const { user } = useAuth()
const isClient = computed(() => user.value?.role === 'client')

const {
  isOpen,
  currentTicket,
  isLoading,
  isSending,
  errorMessage,
  hasActiveTicket,
  isAssigned,
  openWidget,
  closeWidget,
  fetchActiveTicket,
  createTicket,
  sendMessage,
  refreshMessages,
  resetTicket
} = useSupportChat()

// Formulario de apertura de ticket
const ticketTitle = ref('')
const ticketCategory = ref('soporte_tecnico')
const ticketDescription = ref('')
const formError = ref('')

// Entrada del chat
const chatInputText = ref('')
const messagesContainerRef = ref<HTMLElement | null>(null)
let pollingTimer: any = null

const categories = [
  { value: 'soporte_tecnico', label: 'Soporte Técnico' },
  { value: 'logistica', label: 'Logística y Despacho' },
  { value: 'garantias', label: 'Garantías y Mantenimiento' },
  { value: 'otra_consulta', label: 'Otra Consulta' }
]

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainerRef.value) {
    messagesContainerRef.value.scrollTop = messagesContainerRef.value.scrollHeight
  }
}

watch(
  () => currentTicket.value?.messages?.length,
  () => {
    scrollToBottom()
  }
)

const handleCreateTicket = async () => {
  formError.value = ''
  if (!ticketTitle.value.trim()) {
    formError.value = 'Por favor ingresa un título o motivo para tu consulta.'
    return
  }

  const ok = await createTicket(ticketTitle.value, ticketCategory.value, ticketDescription.value)
  if (ok) {
    ticketTitle.value = ''
    ticketDescription.value = ''
  }
}

const handleSendMessage = async () => {
  if (!chatInputText.value.trim() || isSending.value) return
  const text = chatInputText.value
  chatInputText.value = ''
  await sendMessage(text)
  scrollToBottom()
}

const handleRefresh = async () => {
  await fetchActiveTicket()
  if (currentTicket.value) {
    await refreshMessages()
  }
}

const handleReset = () => {
  resetTicket()
  formError.value = ''
  ticketTitle.value = ''
  ticketDescription.value = ''
}

onMounted(() => {
  if (isClient.value) {
    fetchActiveTicket()
    // Sondeo suave cada 15 segundos si el widget está abierto
    pollingTimer = setInterval(() => {
      if (isOpen.value && currentTicket.value) {
        refreshMessages()
      }
    }, 15000)
  }
})

onUnmounted(() => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
  }
})
</script>

<template>
  <!-- Este componente SOLO es visible para usuarios con rol de cliente -->
  <aside
    v-if="isClient"
    class="font-sans select-none"
    aria-label="Soporte y Helpdesk"
  >
    <!-- 1. Botón Flotante de Soporte (cuando la ventana está cerrada) -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-90 translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-90 translate-y-2"
    >
      <button
        v-if="!isOpen"
        type="button"
        class="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#3eb134] hover:bg-[#349e2e] active:scale-95 text-white font-semibold text-xs shadow-2xl shadow-[#3eb134]/40 border border-[#3eb134]/60 transition-all duration-200 cursor-pointer group"
        @click="openWidget"
      >
        <div class="relative flex items-center justify-center">
          <v-icon icon="mdi-headset" size="20" class="group-hover:rotate-12 transition-transform duration-200" />
          <span
            v-if="hasActiveTicket"
            class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-[#0b1120]"
            :class="isAssigned ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'"
          />
        </div>

        <span class="tracking-wide">Soporte Técnico</span>

        <span
          v-if="hasActiveTicket"
          class="ml-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-black/30 border border-white/20"
        >
          {{ isAssigned ? 'Chat Activo' : 'Ticket' }}
        </span>
      </button>
    </Transition>

    <!-- 2. Ventana Flotante del Widget de Soporte y Chat -->
    <Transition
      enter-active-class="transition duration-250 ease-out"
      enter-from-class="opacity-0 scale-95 translate-y-4"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-4"
    >
      <div
        v-if="isOpen"
        class="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[410px] h-[580px] max-h-[calc(100vh-2rem)] flex flex-col bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-2xl shadow-black/80 overflow-hidden backdrop-blur-sm"
      >
        <!-- A. Encabezado Superior del Widget -->
        <header class="bg-gradient-to-r from-slate-900 via-slate-800 to-[#122815] border-b border-[#1e293b] p-3.5 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3 min-w-0">
            <!-- Avatar si hay operador asignado -->
            <div
              v-if="isAssigned && currentTicket?.assigned_agent"
              class="relative w-9 h-9 rounded-full bg-[#3eb134] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-md shadow-[#3eb134]/30"
            >
              {{ currentTicket.assigned_agent.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2) }}
              <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0f172a]" />
            </div>

            <!-- Icono general si aún no hay operador -->
            <div
              v-else
              class="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 text-[#3eb134] flex items-center justify-center shrink-0"
            >
              <v-icon icon="mdi-headset" size="20" />
            </div>

            <!-- Título y Estado -->
            <div class="min-w-0">
              <div class="text-xs font-bold text-white truncate flex items-center gap-1.5">
                <span>{{ isAssigned ? currentTicket?.assigned_agent?.name : 'Soporte BaiFa Power' }}</span>
                <span
                  v-if="hasActiveTicket"
                  class="text-[9px] px-1.5 py-0.2 rounded font-mono font-medium border"
                  :class="isAssigned ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300' : 'bg-amber-950/60 border-amber-800/60 text-amber-300'"
                >
                  {{ currentTicket?.code }}
                </span>
              </div>
              <p class="text-[11px] text-slate-400 truncate mt-0.5">
                {{ isAssigned
                  ? (currentTicket?.assigned_agent?.role_label || 'Operador Asignado')
                  : 'Mesa de Ayuda y Consultas Técnicas' }}
              </p>
            </div>
          </div>

          <!-- Acciones del Header -->
          <div class="flex items-center gap-1 shrink-0">
            <button
              v-if="hasActiveTicket"
              type="button"
              class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Actualizar estado del ticket"
              :disabled="isLoading"
              @click="handleRefresh"
            >
              <v-icon icon="mdi-refresh" size="18" :class="{ 'animate-spin': isLoading }" />
            </button>

            <button
              type="button"
              class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Minimizar soporte"
              @click="closeWidget"
            >
              <v-icon icon="mdi-close" size="18" />
            </button>
          </div>
        </header>

        <!-- B. CUERPO: ESTADO 1 - FORMULARIO DE CONSULTA / CREAR TICKET -->
        <div
          v-if="!hasActiveTicket"
          class="flex-1 overflow-y-auto p-5 flex flex-col justify-between"
        >
          <div class="space-y-4">
            <div class="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg bg-[#3eb134]/15 text-[#3eb134] flex items-center justify-center shrink-0 mt-0.5">
                <v-icon icon="mdi-ticket-confirmation-outline" size="18" />
              </div>
              <div class="text-xs text-slate-300 leading-relaxed">
                <span class="font-semibold text-white block mb-0.5">Bienvenido al Centro de Soporte</span>
                Indícanos el título de tu consulta para abrir un ticket en base de datos. Nuestro equipo asignará un operador técnico especializado desde el Helpdesk interno para atenderte.
              </div>
            </div>

            <!-- Formulario de Entrada -->
            <form class="space-y-3.5" @submit.prevent="handleCreateTicket">
              <!-- Categoría -->
              <div>
                <label class="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Área de Consulta
                </label>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="cat in categories"
                    :key="cat.value"
                    type="button"
                    class="px-2.5 py-2 rounded-xl text-[11px] font-medium border text-left transition-all cursor-pointer truncate"
                    :class="ticketCategory === cat.value
                      ? 'bg-[#3eb134]/20 border-[#3eb134] text-white shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'"
                    @click="ticketCategory = cat.value"
                  >
                    {{ cat.label }}
                  </button>
                </div>
              </div>

              <!-- Título de la consulta -->
              <div>
                <label for="support-ticket-title" class="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Título de tu Consulta <span class="text-emerald-400">*</span>
                </label>
                <input
                  id="support-ticket-title"
                  v-model="ticketTitle"
                  type="text"
                  placeholder="Ej: Falla de arranque en generador 250 kVA..."
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#3eb134] focus:ring-1 focus:ring-[#3eb134] transition-all"
                  autofocus
                />
              </div>

              <!-- Detalles opcionales -->
              <div>
                <label for="support-ticket-description" class="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Detalles o Serial del Equipo <span class="text-slate-500 text-[10px] font-normal">(Opcional)</span>
                </label>
                <textarea
                  id="support-ticket-description"
                  v-model="ticketDescription"
                  rows="3"
                  placeholder="Proporciona contexto adicional para que el operador atienda tu requerimiento más rápido..."
                  class="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#3eb134] focus:ring-1 focus:ring-[#3eb134] transition-all resize-none"
                />
              </div>

              <!-- Error -->
              <div
                v-if="formError || errorMessage"
                class="p-2.5 rounded-lg bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-center gap-2"
              >
                <v-icon icon="mdi-alert-circle-outline" size="16" class="text-red-400 shrink-0" />
                <span>{{ formError || errorMessage }}</span>
              </div>

              <!-- Botón Generar Ticket -->
              <button
                type="submit"
                :disabled="isLoading"
                class="w-full py-3 rounded-xl font-semibold text-xs text-white bg-[#3eb134] hover:bg-[#349e2e] active:scale-[0.99] transition-all shadow-lg shadow-[#3eb134]/30 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <v-icon v-if="!isLoading" icon="mdi-send-check-outline" size="16" />
                <v-icon v-else icon="mdi-loading" size="16" class="animate-spin" />
                <span>{{ isLoading ? 'Registrando Ticket...' : 'Iniciar Consulta y Generar Ticket' }}</span>
              </button>
            </form>
          </div>

          <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span>Soporte oficial BaiFa Power</span>
            <NuxtLink to="/my-tickets" class="text-[#3eb134] hover:underline" @click="closeWidget">
              Ver mis consultas anteriores
            </NuxtLink>
          </div>
        </div>

        <!-- C. CUERPO: ESTADO 2 - TICKET GENERADO Y ESPERANDO ASIGNACIÓN -->
        <div
          v-else-if="hasActiveTicket && !isAssigned"
          class="flex-1 overflow-y-auto p-5 flex flex-col justify-between"
        >
          <div class="space-y-4">
            <div class="p-4 rounded-xl bg-[#0b1120] border border-amber-800/40 space-y-2.5 shadow-md">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60">
                  {{ currentTicket?.code }}
                </span>
                <span class="text-[10px] text-slate-400">
                  {{ currentTicket?.created_at ? currentTicket.created_at.slice(0, 16).replace('T', ' ') : '' }}
                </span>
              </div>

              <div>
                <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block">
                  Consulta Registrada
                </span>
                <h2 class="text-sm font-bold text-white mt-0.5 leading-snug">
                  {{ currentTicket?.title }}
                </h2>
              </div>

              <div class="text-[11px] text-slate-400">
                <span class="text-slate-500">Área:</span> {{ currentTicket?.category_label }}
              </div>
            </div>

            <!-- Estado de Espera en Tickera -->
            <div class="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 text-center space-y-3">
              <div class="relative w-12 h-12 mx-auto flex items-center justify-center">
                <div class="absolute inset-0 rounded-full bg-amber-400/20 animate-ping" />
                <div class="relative w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                  <v-icon icon="mdi-account-clock-outline" size="22" />
                </div>
              </div>

              <div>
                <h3 class="text-xs font-bold text-white">
                  Ticket Registrado en Helpdesk
                </h3>
                <p class="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Tu solicitud está en cola de atención. El administrador asignará un operador técnico disponible (o un operador tomará tu ticket). En cuanto sea asignado, la sala de chat en vivo se activará aquí.
                </p>
              </div>

              <button
                type="button"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-300 bg-amber-950/60 border border-amber-800/60 hover:bg-amber-900/60 transition-colors cursor-pointer"
                @click="handleRefresh"
              >
                <v-icon icon="mdi-refresh" size="14" :class="{ 'animate-spin': isLoading }" />
                <span>Comprobar asignación</span>
              </button>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <button
              type="button"
              class="text-slate-400 hover:text-white transition-colors cursor-pointer"
              @click="closeWidget"
            >
              Minimizar ventana
            </button>
            <NuxtLink
              to="/my-tickets"
              class="text-[#3eb134] hover:underline"
              @click="closeWidget"
            >
              Mis Consultas
            </NuxtLink>
          </div>
        </div>

        <!-- D. CUERPO: ESTADO 3 - CHAT ACTIVO CON OPERADOR ASIGNADO -->
        <div
          v-else-if="isAssigned"
          class="flex-1 flex flex-col min-h-0 overflow-hidden"
        >
          <!-- Barra de información -->
          <div class="px-3.5 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-[11px] shrink-0">
            <span class="text-slate-400 truncate max-w-[240px]">
              <span class="text-slate-500">Caso:</span> {{ currentTicket?.title }}
            </span>
            <span class="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full shrink-0">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Chat en Vivo
            </span>
          </div>

          <!-- Mensajes -->
          <div
            ref="messagesContainerRef"
            class="flex-1 overflow-y-auto p-4 space-y-3"
          >
            <div
              v-for="msg in currentTicket?.messages"
              :key="msg.id"
              class="flex flex-col"
              :class="{
                'items-end': msg.sender_type === 'client',
                'items-start': msg.sender_type === 'agent',
                'items-center my-1': msg.sender_type === 'system'
              }"
            >
              <!-- Mensaje del Sistema -->
              <div
                v-if="msg.sender_type === 'system'"
                class="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[10px] text-slate-300 max-w-[90%] text-center leading-relaxed"
              >
                {{ msg.message }}
              </div>

              <!-- Mensaje Cliente o Agente -->
              <div
                v-else
                class="max-w-[85%] flex flex-col"
                :class="msg.sender_type === 'client' ? 'items-end' : 'items-start'"
              >
                <span class="text-[10px] text-slate-400 mb-1 px-1 font-medium">
                  {{ msg.sender_name }}
                </span>

                <div
                  class="px-3.5 py-2.5 text-xs rounded-2xl leading-relaxed shadow-sm break-words"
                  :class="msg.sender_type === 'client'
                    ? 'bg-[#3eb134] text-white rounded-tr-xs'
                    : 'bg-[#1e293b] text-slate-100 border border-slate-700/80 rounded-tl-xs'"
                >
                  {{ msg.message }}
                </div>

                <span class="text-[9px] text-slate-500 mt-1 px-1 font-mono">
                  {{ msg.timestamp || (msg.created_at ? msg.created_at.slice(11, 16) : '') }}
                </span>
              </div>
            </div>
          </div>

          <!-- Input Inferior -->
          <footer class="p-3 bg-slate-900 border-t border-slate-800 shrink-0">
            <form class="flex items-center gap-2" @submit.prevent="handleSendMessage">
              <input
                v-model="chatInputText"
                type="text"
                placeholder="Escribe tu mensaje al operador..."
                class="flex-1 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#3eb134] focus:ring-1 focus:ring-[#3eb134] transition-all"
              />
              <button
                type="submit"
                class="p-2.5 rounded-xl bg-[#3eb134] hover:bg-[#349e2e] active:scale-95 text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                :disabled="!chatInputText.trim() || isSending"
                title="Enviar mensaje"
              >
                <v-icon icon="mdi-send" size="16" />
              </button>
            </form>
          </footer>
        </div>
      </div>
    </Transition>
  </aside>
</template>
