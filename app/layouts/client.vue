<script setup lang="ts">
import ClientHeader from '~/components/client/ClientHeader.vue'
import ClientSupportChat from '~/components/client/ClientSupportChat.vue'
</script>

<template>
  <v-app class="bg-[#0b1120] text-slate-200 font-sans min-h-screen">
    <div class="flex flex-col min-h-screen bg-[#0b1120]">
      <!-- 1. Barra de Navegación Superior Horizontal (Sin menú lateral) -->
      <ClientHeader />

      <!-- 2. Área de Contenido Principal -->
      <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <slot />
      </main>

      <!-- 3. Footer Sencillo para Clientes -->
      <footer class="border-t border-[#1e293b] py-6 text-center text-xs text-slate-500">
        © 2026 BaiFa Power · Todos los derechos reservados.
      </footer>

      <!-- 4. Botón y Chat Flotante de Soporte Técnico (Exclusivo para el Cliente) -->
      <ClientSupportChat />
    </div>
  </v-app>
</template>
