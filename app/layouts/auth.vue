<script setup lang="ts">
import { useRoute } from 'vue-router'
import AppLogo from '~/components/common/AppLogo.vue'

const route = useRoute()

const isRegister = computed(() => route.path.includes('register'))
const isForgot = computed(() => route.path.includes('forgot-password'))

const heroTitle = computed(() => {
  if (isRegister.value) return 'Únete a BaiFa'
  if (isForgot.value) return 'Recupera el acceso a tu cuenta'
  return 'Trazabilidad total para tus generadores'
})

const heroSubtitle = computed(() => {
  if (isRegister.value) return 'Gestiona tus generadores y solicitudes desde un panel centralizado y seguro.'
  if (isForgot.value) return 'Te enviaremos un enlace seguro para restablecer tu contraseña de inmediato.'
  return 'Monitorea cada movimiento desde el warehouse hasta el punto de entrega, con actualizaciones en tiempo real.'
})

const features = [
  'Tracking de generadores por serial y punto de control',
  'Actualizaciones manuales de estado por el equipo',
  'Gestión de clientes, usuarios y permisos por cargo',
  'Reportes operativos y registro fotográfico de unidades'
]
</script>

<template>
  <v-app class="bg-[#0b1120] text-slate-200 font-sans min-h-screen">
    <div class="flex h-screen overflow-hidden bg-[#0b1120]">
      <!-- 1. Panel Izquierdo: Institucional y Hero Banner (Oculto en móviles) -->
      <aside class="relative hidden md:flex flex-1 flex-col justify-between p-10 lg:p-14 bg-gradient-to-br from-[#061a0e] via-[#092213] to-[#041009] overflow-hidden select-none border-r border-slate-800/50">
        <!-- Efectos de iluminación verde ambiental -->
        <div class="pointer-events-none absolute -top-24 -left-24 w-96 h-96 bg-[#3eb134]/15 blur-[120px] rounded-full" />
        <div class="pointer-events-none absolute bottom-0 right-0 w-[500px] h-[350px] bg-[#3eb134]/10 blur-[140px] rounded-full" />

        <!-- Encabezado Izquierdo: Logotipo Blanco -->
        <div class="relative z-10">
          <AppLogo variant="white" size="md" />
        </div>

        <!-- Bloque Central: Titular, Beneficios y Tarjeta de Producto -->
        <div class="relative z-10 max-w-lg my-auto py-8">
          <div class="inline-block text-[#3eb134] text-xs font-bold tracking-widest uppercase mb-3">
            MÁS QUE ENERGÍA, CONFIANZA
          </div>
          <h2 class="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
            {{ heroTitle }}
          </h2>
          <p class="text-sm text-slate-300 font-normal leading-relaxed mb-8">
            {{ heroSubtitle }}
          </p>

          <!-- Lista de beneficios con checks verdes -->
          <ul class="space-y-3.5 mb-10">
            <li
              v-for="feature in features"
              :key="feature"
              class="flex items-start gap-3"
            >
              <div class="w-5 h-5 rounded-full bg-[#3eb134]/20 border border-[#3eb134]/40 flex items-center justify-center text-[#3eb134] shrink-0 mt-0.5">
                <v-icon icon="mdi-check" size="13" />
              </div>
              <span class="text-sm text-slate-200 leading-snug">{{ feature }}</span>
            </li>
          </ul>

          <!-- Ficha de Producto: Generador BF-C170S -->
          <div class="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-3.5 flex items-center gap-3.5 backdrop-blur-md shadow-lg max-w-sm">
            <div class="w-14 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 shrink-0 border border-slate-700/60">
              <v-icon icon="mdi-engine-outline" size="26" class="text-[#3eb134]" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-xs font-bold text-white tracking-tight">
                BF-C170S
              </div>
              <div class="text-[11px] text-slate-400 truncate">
                Diesel Generator · Soundproof
              </div>
              <div class="text-[10px] text-slate-500 font-mono mt-0.5">
                www.baifapower.com
              </div>
            </div>
          </div>
        </div>

        <!-- Pie de página Izquierdo -->
        <div class="relative z-10 text-xs text-slate-500">
          <p>© 2026 BaiFa Power · Todos los derechos reservados.</p>
        </div>
      </aside>

      <!-- 2. Panel Derecho: Formulario Específico (Login, Registro, Recuperación) -->
      <main class="w-full md:w-[480px] lg:w-[540px] xl:w-[580px] h-full bg-[#0b1120] flex flex-col justify-center p-6 sm:p-10 lg:p-12 overflow-y-auto shrink-0">
        <slot />
      </main>
    </div>
  </v-app>
</template>
