<script setup lang="ts">
useHead({
  title: 'Generadores - Baifa'
})
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <div>
      <h1 class="text-2xl lg:text-3xl font-bold text-white tracking-tight">
        Generadores
      </h1>
      <p class="text-sm text-slate-400 mt-1">
        Gestión de inventario de generadores, estados y checkpoints
      </p>
    </div>

    <div class="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-8 text-center text-slate-400">
      <v-icon icon="mdi-flash-outline" size="48" class="text-orange-500 mb-3" />
      <p class="text-base text-slate-300 font-medium">Módulo de Generadores</p>
      <p class="text-xs text-slate-500 mt-1">Pantalla lista para implementar el catálogo y modales de actualización.</p>
    </div>
  </div>
</template>
