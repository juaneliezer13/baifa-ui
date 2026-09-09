<script setup lang="ts">
import { useRoute } from 'vue-router'

interface NavItem {
  label: string
  to: string
  icon: string
}

const route = useRoute()

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: 'mdi-view-dashboard-outline' },
  { label: 'Rastrear', to: '/tracking', icon: 'mdi-magnify' },
  { label: 'Generadores', to: '/generators', icon: 'mdi-flash-outline' },
  { label: 'Clientes', to: '/clients', icon: 'mdi-account-group-outline' },
  { label: 'Usuarios', to: '/users', icon: 'mdi-lock-outline' },
  { label: 'Reportes', to: '/reports', icon: 'mdi-chart-bar' }
]

const isActive = (path: string): boolean => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>

<template>
  <aside class="w-64 h-full bg-[#0f172a] border-r border-[#1e293b] flex flex-col justify-between p-4 select-none shrink-0">
    <!-- Header: Logo & Branding -->
    <div>
      <div class="flex items-center gap-3 px-2 py-3 mb-6">
        <div class="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-orange-500/20">
          <v-icon icon="mdi-flash" size="22" />
        </div>
        <div>
          <h1 class="text-base font-bold text-white tracking-tight leading-tight">
            Baifa
          </h1>
          <p class="text-[11px] text-slate-400 font-normal">
            Logistics Platform
          </p>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="space-y-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-150"
          :class="[
            isActive(item.to)
              ? 'bg-orange-500/10 text-orange-500 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 font-normal'
          ]"
        >
          <div class="flex items-center gap-3">
            <v-icon :icon="item.icon" size="20" />
            <span>{{ item.label }}</span>
          </div>

          <!-- Active dot indicator -->
          <span
            v-if="isActive(item.to)"
            class="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50"
          />
        </NuxtLink>
      </nav>
    </div>

    <!-- Footer: User Profile Badge -->
    <div class="pt-4 border-t border-slate-800/80">
      <div class="flex items-center gap-3 px-2 py-2 rounded-xl bg-slate-900/40 hover:bg-slate-800/50 transition-colors cursor-pointer">
        <div class="w-9 h-9 rounded-full bg-orange-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
          AM
        </div>
        <div class="overflow-hidden min-w-0 flex-1">
          <div class="text-xs font-semibold text-white truncate leading-tight">
            Adriana Morales
          </div>
          <div class="mt-1">
            <span class="inline-block text-[10px] font-medium text-red-400 bg-red-950/60 border border-red-800/40 px-2 py-0.5 rounded-full leading-none">
              Superadministrador
            </span>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>
