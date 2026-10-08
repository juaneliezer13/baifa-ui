<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLogo from '~/components/common/AppLogo.vue'

const route = useRoute()

const loginRedirectUrl = computed(() => {
  const currentPath = route.fullPath || '/tracking'
  return `/login?redirect=${encodeURIComponent(currentPath)}`
})
</script>

<template>
  <v-app class="bg-[#0b1120] text-slate-200 font-sans min-h-screen">
    <div class="flex flex-col min-h-screen bg-[#0b1120]">
      <!-- 1. Barra de Navegación Superior para Visitantes / Consulta Pública -->
      <header class="w-full bg-[#0f172a] border-b border-[#1e293b] select-none sticky top-0 z-40 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <!-- Logo Baifa a la izquierda -->
          <div class="flex items-center gap-3">
            <AppLogo variant="green" size="md" />
            <div class="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-700">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Trazabilidad Pública
              </span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                En Vivo
              </span>
            </div>
          </div>

          <!-- Acceso / Iniciar Sesión a la derecha -->
          <div class="flex items-center gap-3">
            <NuxtLink
              :to="loginRedirectUrl"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#3eb134] hover:bg-[#349e2e] active:scale-[0.98] transition-all shadow-md shadow-[#3eb134]/20 cursor-pointer"
            >
              <v-icon icon="mdi-login" size="16" />
              <span>Iniciar Sesión</span>
            </NuxtLink>
          </div>
        </div>
      </header>

      <!-- 2. Área de Contenido Principal -->
      <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <slot />
      </main>

      <!-- 3. Footer Sencillo -->
      <footer class="border-t border-[#1e293b] py-6 text-center text-xs text-slate-500">
        © 2026 BaiFa Power · Todos los derechos reservados.
      </footer>
    </div>
  </v-app>
</template>
