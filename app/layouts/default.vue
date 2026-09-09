<script setup lang="ts">
import AppSidebar from '~/components/layout/AppSidebar.vue'
</script>

<template>
  <v-app class="bg-[#0b1120] text-slate-200 font-sans">
    <div class="flex h-screen overflow-hidden bg-[#0b1120]">
      <!-- Sidebar fija -->
      <AppSidebar />

      <!-- Área de Contenido Principal desplazable -->
      <main class="flex-1 h-screen overflow-y-auto bg-[#0b1120] p-6 lg:p-10">
        <slot />
      </main>
    </div>
  </v-app>
</template>

<style>
/* Estilos globales y scrollbar oscuro */
html, body {
  background-color: #0b1120 !important;
  color: #e2e8f0;
  font-family: 'Inter', sans-serif;
  margin: 0;
  padding: 0;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: #0b1120;
}
::-webkit-scrollbar-thumb {
  background: #1e293b;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #334155;
}
</style>
