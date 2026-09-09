<script setup lang="ts">
/**
 * Layout exclusivo para las vistas de Autenticación
 * (Login, Registro, Recuperación de contraseña)
 */
</script>

<template>
  <v-app class="bg-[#0b1120] text-slate-200 font-sans min-h-screen">
    <div class="relative min-h-screen flex flex-col justify-between items-center px-4 py-8 bg-[#0b1120] overflow-y-auto selection:bg-orange-500 selection:text-white">
      <!-- Efecto de iluminación sutil ambiental -->
      <div class="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[550px] h-[320px] bg-orange-500/10 blur-[130px] rounded-full" />
      <div class="pointer-events-none absolute -bottom-40 left-1/2 -translate-x-1/2 w-[550px] h-[320px] bg-slate-800/30 blur-[140px] rounded-full" />

      <!-- Encabezado / Logo Baifa -->
      <header class="relative z-10 flex flex-col items-center pt-4 pb-6">
        <NuxtLink to="/" class="flex items-center gap-3 group focus:outline-none cursor-pointer">
          <div class="w-11 h-11 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform duration-200">
            <v-icon icon="mdi-flash" size="26" />
          </div>
          <div class="text-left">
            <h1 class="text-xl font-bold text-white tracking-tight leading-none group-hover:text-orange-400 transition-colors">
              Baifa
            </h1>
            <p class="text-xs text-slate-400 font-normal mt-1">
              Logistics Platform
            </p>
          </div>
        </NuxtLink>
      </header>

      <!-- Contenedor central para las tarjetas de Login / Registro / Recuperación -->
      <main class="relative z-10 w-full max-w-md my-auto py-4">
        <slot />
      </main>

      <!-- Pie de página de autenticación -->
      <footer class="relative z-10 text-center py-4 text-xs text-slate-500 space-y-2">
        <p>© 2026 Baifa Logistics Platform. Todos los derechos reservados.</p>
        <div class="flex items-center justify-center gap-3 text-[11px] text-slate-400">
          <NuxtLink to="/tracking" class="hover:text-orange-400 transition-colors">
            Rastreo Público de Generadores
          </NuxtLink>
          <span>•</span>
          <NuxtLink to="/" class="hover:text-orange-400 transition-colors">
            Inicio
          </NuxtLink>
        </div>
      </footer>
    </div>
  </v-app>
</template>
