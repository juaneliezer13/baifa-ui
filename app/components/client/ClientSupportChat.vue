<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useSupportChat } from '~/composables/useSupportChat'

const { user } = useAuth()
const isClient = computed(() => user.value?.role === 'client')

const {
  isOpen,
  currentTicket,
  isAgentTyping,
  hasActiveTicket,
  isAssigned,
  openWidget,
  closeWidget,
  toggleWidget,
  createTicket,
  assignEmployee,
  sendMessage,
  resetTicket
} = useSupportChat()

// Estado local para el formulario de inicio
const ticketTitle = ref('')
const ticketCategory = ref('Soporte Técnico')
const ticketDescription = ref('')
const formError = ref('')

// Estado local para el input del chat
const chatInputText = ref('')
const messagesContainerRef = ref<HTMLElement | null>(null)

const categories = [
  'Soporte Técnico',
  'Logística y Despacho',
  'Garantías y Mantenimiento',
  'Otra Consulta'
]

// Auto-scroll del chat al llegar nuevos mensajes
const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainerRef.value) {
    messagesContainerRef.value.scrollTop = messagesContainerRef.value.scrollHeight
  }
}

watch(
  () => currentTicket.value?.messages.length,
  () => {
    scrollToBottom()
  }
)

watch(
  () => isAgentTyping.value,
  () => {
    scrollToBottom()
  }
)

const handleCreateTicket = () => {
  formError.value = ''
  if (!ticketTitle.value.trim()) {
    formError.value = 'Por favor ingresa un título o motivo para tu consulta.'
    return
  }

  createTicket(ticketTitle.value, ticketCategory.value, ticketDescription.value)
  ticketTitle.value = ''
  ticketDescription.value = ''
}

const handleSendMessage = () => {
  if (!chatInputText.value.trim()) return
  sendMessage(chatInputText.value)
  chatInputText.value = ''
  scrollToBottom()
}

const handleSimulateAdminAssign = () => {
  assignEmployee()
}

const handleReset = () => {
  resetTicket()
  formError.value = ''
  ticketTitle.value = ''
  ticketDescription.value = ''
}
</script>

<template>
  <!-- Este componente SOLO es visible para usuarios con rol de cliente -->
  <aside
    v-if="isClient"
    class="font-sans select-none"
    aria-label="Soporte y Mesa de Ayuda"
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
        <!-- Icono con efecto glow -->
        <div class="relative flex items-center justify-center">
          <v-icon icon="mdi-headset" size="20" class="group-hover:rotate-12 transition-transform duration-200" />
          <!-- Indicador de estado -->
          <span
            v-if="hasActiveTicket"
            class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-[#0b1120]"
            :class="isAssigned ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'"
          />
        </div>

        <span class="tracking-wide">Soporte Técnico</span>

        <!-- Badge si hay ticket en curso -->
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
          <!-- Info del Agente o de Soporte -->
          <div class="flex items-center gap-3 min-w-0">
            <!-- Avatar si hay operador asignado -->
            <div
              v-if="isAssigned && currentTicket?.assignedAgent"
              class="relative w-9 h-9 rounded-full bg-[#3eb134] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-md shadow-[#3eb134]/30"
            >
              {{ currentTicket.assignedAgent.avatarInitials }}
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
                <span>{{ isAssigned ? currentTicket?.assignedAgent?.name : 'Soporte BaiFa Power' }}</span>
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
                  ? (currentTicket?.assignedAgent?.role || 'Operador Asignado')
                  : 'Mesa de Ayuda y Consultas Técnicas' }}
              </p>
            </div>
          </div>

          <!-- Acciones del Header -->
          <div class="flex items-center gap-1 shrink-0">
            <!-- Botón para reiniciar / nuevo ticket -->
            <button
              v-if="hasActiveTicket"
              type="button"
              class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Nueva consulta o reiniciar ticket"
              @click="handleReset"
            >
              <v-icon icon="mdi-refresh" size="18" />
            </button>

            <!-- Botón Cerrar / Minimizar -->
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
            <!-- Tarjeta de bienvenida -->
            <div class="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg bg-[#3eb134]/15 text-[#3eb134] flex items-center justify-center shrink-0 mt-0.5">
                <v-icon icon="mdi-ticket-confirmation-outline" size="18" />
              </div>
              <div class="text-xs text-slate-300 leading-relaxed">
                <span class="font-semibold text-white block mb-0.5">Bienvenido al Centro de Soporte</span>
                Indícanos el título de tu consulta para abrir un ticket. Nuestro administrador asignará un empleado especializado desde el Helpdesk para atenderte por chat en vivo.
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
                    :key="cat"
                    type="button"
                    class="px-2.5 py-2 rounded-xl text-[11px] font-medium border text-left transition-all cursor-pointer truncate"
                    :class="ticketCategory === cat
                      ? 'bg-[#3eb134]/20 border-[#3eb134] text-white shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'"
                    @click="ticketCategory = cat"
                  >
                    {{ cat }}
                  </button>
                </div>
              </div>

              <!-- Título de la consulta (Requerido por el usuario) -->
              <div>
                <label for="support-ticket-title" class="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Título de tu Consulta <span class="text-emerald-400">*</span>
                </label>
                <input
                  id="support-ticket-title"
                  v-model="ticketTitle"
                  type="text"
                  placeholder="Ej: Duda sobre entrega de generador GEN-2026-0041"
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

              <!-- Mensaje de error de validación -->
              <div
                v-if="formError"
                class="p-2.5 rounded-lg bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-center gap-2"
              >
                <v-icon icon="mdi-alert-circle-outline" size="16" class="text-red-400 shrink-0" />
                <span>{{ formError }}</span>
              </div>

              <!-- Botón Generar Ticket -->
              <button
                type="submit"
                class="w-full py-3 rounded-xl font-semibold text-xs text-white bg-[#3eb134] hover:bg-[#349e2e] active:scale-[0.99] transition-all shadow-lg shadow-[#3eb134]/30 cursor-pointer flex items-center justify-center gap-2"
              >
                <v-icon icon="mdi-send-check-outline" size="16" />
                <span>Iniciar Consulta y Generar Ticket</span>
              </button>
            </form>
          </div>

          <!-- Nota al pie informativa -->
          <div class="pt-3 border-t border-slate-800/80 text-center text-[10px] text-slate-500">
            Soporte oficial BaiFa Power · Atención técnica especializada
          </div>
        </div>

        <!-- C. CUERPO: ESTADO 2 - TICKET GENERADO Y ESPERANDO ASIGNACIÓN -->
        <div
          v-else-if="hasActiveTicket && !isAssigned"
          class="flex-1 overflow-y-auto p-5 flex flex-col justify-between"
        >
          <div class="space-y-4">
            <!-- Tarjeta del Ticket Generado -->
            <div class="p-4 rounded-xl bg-[#0b1120] border border-amber-800/40 space-y-2.5 shadow-md">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60">
                  {{ currentTicket?.code }}
                </span>
                <span class="text-[10px] text-slate-400">
                  {{ currentTicket?.createdAt }}
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
                <span class="text-slate-500">Área:</span> {{ currentTicket?.category }}
              </div>
            </div>

            <!-- Estado de Espera / Asignación en Helpdesk -->
            <div class="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 text-center space-y-3">
              <div class="relative w-12 h-12 mx-auto flex items-center justify-center">
                <div class="absolute inset-0 rounded-full bg-amber-400/20 animate-ping" />
                <div class="relative w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                  <v-icon icon="mdi-account-clock-outline" size="22" />
                </div>
              </div>

              <div>
                <h3 class="text-xs font-bold text-white">
                  Esperando Asignación de Operador
                </h3>
                <p class="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Tu ticket ha sido registrado en el Helpdesk Interno. El administrador está asignando a un operador técnico. En cuanto se asigne, el chat se abrirá automáticamente.
                </p>
              </div>
            </div>

            <!-- Panel de Simulación para Probar el Flujo Estático -->
            <div class="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-800/40 space-y-2.5">
              <div class="flex items-center gap-2 text-[11px] font-semibold text-emerald-400">
                <v-icon icon="mdi-shield-account-outline" size="16" />
                <span>Simulación de Asignación por Admin (Demo Front)</span>
              </div>
              <p class="text-[10px] text-slate-400 leading-snug">
                Haz clic en el botón siguiente para simular que el administrador asignó a un empleado desde el Helpdesk interno:
              </p>
              <button
                type="button"
                class="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-2"
                @click="handleSimulateAdminAssign"
              >
                <v-icon icon="mdi-account-check" size="16" />
                <span>Asignar Operador y Abrir Chat</span>
              </button>
            </div>
          </div>

          <!-- Opciones inferiores -->
          <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <button
              type="button"
              class="text-slate-400 hover:text-white transition-colors cursor-pointer"
              @click="closeWidget"
            >
              Minimizar ventana
            </button>
            <button
              type="button"
              class="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
              @click="handleReset"
            >
              Cancelar consulta
            </button>
          </div>
        </div>

        <!-- D. CUERPO: ESTADO 3 - CHAT ACTIVO CON OPERADOR ASIGNADO -->
        <div
          v-else-if="isAssigned"
          class="flex-1 flex flex-col min-h-0 overflow-hidden"
        >
          <!-- Barra de información del caso -->
          <div class="px-3.5 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-[11px] shrink-0">
            <span class="text-slate-400 truncate max-w-[240px]">
              <span class="text-slate-500">Caso:</span> {{ currentTicket?.title }}
            </span>
            <span class="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full shrink-0">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Chat Activo
            </span>
          </div>

          <!-- Contenedor scrollable de Mensajes -->
          <div
            ref="messagesContainerRef"
            class="flex-1 overflow-y-auto p-4 space-y-3"
          >
            <div
              v-for="msg in currentTicket?.messages"
              :key="msg.id"
              class="flex flex-col"
              :class="{
                'items-end': msg.sender === 'client',
                'items-start': msg.sender === 'agent',
                'items-center my-1': msg.sender === 'system'
              }"
            >
              <!-- Mensaje del Sistema -->
              <div
                v-if="msg.sender === 'system'"
                class="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[10px] text-slate-300 max-w-[90%] text-center leading-relaxed"
              >
                {{ msg.text }}
              </div>

              <!-- Mensaje del Cliente o del Agente -->
              <div
                v-else
                class="max-w-[85%] flex flex-col"
                :class="msg.sender === 'client' ? 'items-end' : 'items-start'"
              >
                <!-- Nombre del remitente -->
                <span class="text-[10px] text-slate-400 mb-1 px-1 font-medium">
                  {{ msg.senderName }}
                </span>

                <!-- Burbuja de texto -->
                <div
                  class="px-3.5 py-2.5 text-xs rounded-2xl leading-relaxed shadow-sm break-words"
                  :class="msg.sender === 'client'
                    ? 'bg-[#3eb134] text-white rounded-tr-xs'
                    : 'bg-[#1e293b] text-slate-100 border border-slate-700/80 rounded-tl-xs'"
                >
                  {{ msg.text }}
                </div>

                <!-- Hora del mensaje -->
                <span class="text-[9px] text-slate-500 mt-1 px-1 font-mono">
                  {{ msg.timestamp }}
                </span>
              </div>
            </div>

            <!-- Indicador de "Escribiendo..." del agente -->
            <div
              v-if="isAgentTyping"
              class="flex items-center gap-2 text-slate-400 text-[11px] px-2 py-1"
            >
              <div class="flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style="animation-delay: 0ms;" />
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style="animation-delay: 150ms;" />
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style="animation-delay: 300ms;" />
              </div>
              <span>{{ currentTicket?.assignedAgent?.name || 'Operador' }} está escribiendo...</span>
            </div>
          </div>

          <!-- Barra Inferior de Entrada de Mensaje -->
          <footer class="p-3 bg-slate-900 border-t border-slate-800 shrink-0">
            <form class="flex items-center gap-2" @submit.prevent="handleSendMessage">
              <input
                v-model="chatInputText"
                type="text"
                placeholder="Escribe tu mensaje aquí..."
                class="flex-1 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#3eb134] focus:ring-1 focus:ring-[#3eb134] transition-all"
              />
              <button
                type="submit"
                class="p-2.5 rounded-xl bg-[#3eb134] hover:bg-[#349e2e] active:scale-95 text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                :disabled="!chatInputText.trim()"
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
