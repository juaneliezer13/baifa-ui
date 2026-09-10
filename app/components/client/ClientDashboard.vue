<script setup lang="ts">
import { ref } from 'vue'

const { user } = useAuth()

const activeNotification = ref('')
const serialQuery = ref('')

const clientCards = [
  {
    id: 'orders',
    title: 'Mis pedidos',
    description: 'Consulta el estado de despacho, facturación y tiempos estimados de entrega de tus unidades.',
    badge: '2 activos',
    badgeColor: 'text-[#3eb134] bg-[#3eb134]/10 border-[#3eb134]/30',
    icon: 'mdi-package-variant-closed',
    iconColor: 'text-[#3eb134] bg-[#3eb134]/15'
  },
  {
    id: 'cart',
    title: 'Mi lista de compras',
    description: 'Generadores, tableros de transferencia y repuestos guardados para solicitar cotización formal.',
    badge: '4 ítems',
    badgeColor: 'text-amber-400 bg-amber-950/40 border-amber-800/40',
    icon: 'mdi-cart-outline',
    iconColor: 'text-amber-400 bg-amber-950/50'
  },
  {
    id: 'catalog',
    title: 'Ver generadores',
    description: 'Explora nuestro portafolio de plantas eléctricas diésel, insonorizadas y abiertas con tecnología de punta.',
    badge: 'Catálogo Baifa',
    badgeColor: 'text-sky-400 bg-sky-950/40 border-sky-800/40',
    icon: 'mdi-engine-outline',
    iconColor: 'text-sky-400 bg-sky-950/50'
  },
  {
    id: 'support',
    title: 'Soporte y Mantenimiento',
    description: 'Programa servicios de mantenimiento preventivo, visitas técnicas en sitio y repuestos originales.',
    badge: 'Garantía activa',
    badgeColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40',
    icon: 'mdi-shield-check-outline',
    iconColor: 'text-emerald-400 bg-emerald-950/50'
  }
]

const recentEquipments = [
  {
    serial: 'GEN-2026-0037',
    model: 'BF-C170S (170 kVA Soundproof)',
    location: 'Sede Principal - Valencia',
    status: 'Instalado / Operativo',
    statusColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-800/40'
  },
  {
    serial: 'GEN-2026-0041',
    model: 'BF-C250S (250 kVA Industrial)',
    location: 'En Tránsito — Destino Caracas',
    status: 'En Tránsito',
    statusColor: 'text-sky-400 bg-sky-950/50 border-sky-800/40'
  }
]

const handleAction = (title: string) => {
  activeNotification.value = `Has seleccionado "${title}". Esta sección se encuentra en preparación para la próxima actualización.`
  setTimeout(() => {
    activeNotification.value = ''
  }, 4000)
}
</script>

<template>
  <div class="space-y-8 max-w-6xl mx-auto py-2">
    <!-- Notificación flotante informativa -->
    <div
      v-if="activeNotification"
      class="p-4 rounded-2xl bg-slate-800/90 border border-[#3eb134]/40 text-white text-xs flex items-center justify-between shadow-xl backdrop-blur-md animate-fade-in"
    >
      <div class="flex items-center gap-3">
        <v-icon icon="mdi-information-outline" size="20" class="text-[#3eb134]" />
        <span>{{ activeNotification }}</span>
      </div>
      <button
        type="button"
        class="text-slate-400 hover:text-white transition-colors"
        @click="activeNotification = ''"
      >
        <v-icon icon="mdi-close" size="16" />
      </button>
    </div>

    <!-- 1. Banner Superior de Bienvenida para el Cliente -->
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#061a0e] via-[#0b2414] to-[#041009] border border-slate-800/80 p-8 sm:p-10 shadow-lg">
      <!-- Glow decorativo de fondo -->
      <div class="pointer-events-none absolute -right-20 -top-20 w-80 h-80 bg-[#3eb134]/20 rounded-full blur-3xl" />

      <div class="relative z-10 max-w-2xl">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3eb134]/15 border border-[#3eb134]/30 text-[#3eb134] text-xs font-semibold uppercase tracking-wider mb-3">
          <v-icon icon="mdi-account-check-outline" size="16" />
          <span>Portal de Autogestión</span>
        </div>

        <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-2">
          Bienvenido{{ user?.client?.company_short_name ? `, ${user.client.company_short_name}` : ' a BaiFa' }}
        </h1>

        <p class="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
          Hola <strong class="text-white">{{ user?.name || 'Estimado Cliente' }}</strong><span v-if="user?.client?.company_fiscal_name"> (<span class="text-[#3eb134] font-medium">{{ user.client.company_fiscal_name }}</span> · RIF: <span class="font-mono text-slate-300">{{ user.client.rif }}</span>)</span>, desde este panel puedes consultar tus compras, solicitar nuevos generadores y hacer seguimiento a tus equipos en operación con total confianza.
        </p>
      </div>
    </div>

    <!-- 2. Tarjetas de Acción del Dashboard Principal (Mis pedidos, Mi lista de compras, Ver generadores) -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-white tracking-tight">
          Accesos directos
        </h2>
        <span class="text-xs text-slate-400">Panel simplificado de cliente</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          v-for="card in clientCards"
          :key="card.id"
          class="bg-[#0f172a] border border-[#1e293b] hover:border-[#3eb134]/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 shadow-sm group cursor-pointer"
          @click="handleAction(card.title)"
        >
          <div>
            <!-- Header de la tarjeta con icono y badge -->
            <div class="flex items-center justify-between mb-4">
              <div class="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105" :class="card.iconColor">
                <v-icon :icon="card.icon" size="22" />
              </div>
              <span class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border" :class="card.badgeColor">
                {{ card.badge }}
              </span>
            </div>

            <!-- Título y descripción -->
            <h3 class="text-base font-bold text-white group-hover:text-[#3eb134] transition-colors mb-1.5">
              {{ card.title }}
            </h3>
            <p class="text-xs text-slate-400 leading-relaxed font-normal">
              {{ card.description }}
            </p>
          </div>

          <!-- Botón de acción al pie -->
          <div class="pt-5 mt-auto flex items-center justify-between text-xs font-semibold text-[#3eb134] group-hover:text-[#349b2c]">
            <span>Acceder</span>
            <v-icon icon="mdi-arrow-right" size="16" class="transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Ficha de Mis Equipos Registrados y Trazabilidad -->
    <div class="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-sm">
      <div class="flex items-center justify-between mb-5">
        <div>
          <h2 class="text-base font-bold text-white tracking-tight">
            Mis generadores asociados
          </h2>
          <p class="text-xs text-slate-400 mt-0.5">
            Plantas eléctricas asignadas a tu cuenta empresarial
          </p>
        </div>
        <button
          type="button"
          class="text-xs font-semibold text-[#3eb134] hover:text-[#349b2c] transition-colors cursor-pointer"
          @click="handleAction('Ver generadores')"
        >
          Ver todos
        </button>
      </div>

      <div class="space-y-3">
        <div
          v-for="item in recentEquipments"
          :key="item.serial"
          class="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-[#161e31] border border-slate-800 hover:border-slate-700 transition-colors gap-3"
        >
          <div class="flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-xl bg-[#3eb134]/15 text-[#3eb134] flex items-center justify-center shrink-0">
              <v-icon icon="mdi-flash" size="22" />
            </div>
            <div>
              <div class="text-sm font-bold text-white">
                {{ item.model }}
              </div>
              <div class="text-xs font-mono text-[#3eb134] mt-0.5">
                Serial: {{ item.serial }}
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between sm:justify-end gap-4">
            <div class="text-xs text-slate-400 hidden md:block">
              {{ item.location }}
            </div>
            <span class="text-xs font-semibold px-3 py-1 rounded-full border leading-none" :class="item.statusColor">
              {{ item.status }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
