<script setup lang="ts">
import { useRoute } from 'vue-router'

interface NavItem {
  label: string
  to: string
  icon: string
}

const route = useRoute()
const { user, logout } = useAuth()

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

const handleLogout = async () => {
  await logout()
}
</script>

<template>
  <aside class="w-64 h-full bg-[#0f172a] border-r border-[#1e293b] flex flex-col justify-between p-4 select-none shrink-0">
    <!-- Header: Logo & Branding -->
    <div>
      <div class="flex items-center gap-3 px-2 py-3 mb-6">
        <div class="w-9 h-9 bg-[#3eb134] rounded-xl flex items-center justify-center text-white shadow-md shadow-[#3eb134]/25">
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
              ? 'bg-[#3eb134]/10 text-[#3eb134] font-semibold'
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
            class="w-1.5 h-1.5 rounded-full bg-[#3eb134] shadow-sm shadow-[#3eb134]/50"
          />
        </NuxtLink>
      </nav>
    </div>

    <!-- Footer: User Profile Card con Menú Desplegable -->
    <div class="pt-4 border-t border-slate-800/80">
      <v-menu location="top start" :offset="10">
        <template #activator="{ props: menuProps }">
          <div
            v-bind="menuProps"
            class="flex items-center gap-3 px-2 py-2 rounded-xl bg-slate-900/40 hover:bg-slate-800/70 border border-transparent hover:border-slate-700/50 transition-colors cursor-pointer group"
          >
            <div class="w-9 h-9 rounded-full bg-[#3eb134] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
              {{ user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2) : 'AM' }}
            </div>
            <div class="overflow-hidden min-w-0 flex-1">
              <div class="text-xs font-semibold text-white truncate leading-tight group-hover:text-[#3eb134] transition-colors">
                {{ user?.name || 'Adriana Morales' }}
              </div>
              <div class="mt-1">
                <span class="inline-block text-[10px] font-medium text-red-400 bg-red-950/60 border border-red-800/40 px-2 py-0.5 rounded-full leading-none">
                  {{ user?.roleLabel || 'Superadministrador' }}
                </span>
              </div>
            </div>
            <v-icon icon="mdi-unfold-more-horizontal" size="18" class="text-slate-500 group-hover:text-slate-300 transition-colors" />
          </div>
        </template>

        <!-- Contenedor flotante del menú desplegable -->
        <div class="w-60 bg-[#0f172a] border border-slate-700/70 rounded-2xl p-2 shadow-2xl space-y-1 text-slate-200">
          <div class="px-3 py-2 border-b border-slate-800 mb-1">
            <div class="text-xs font-semibold text-white truncate">
              {{ user?.name || 'Adriana Morales' }}
            </div>
            <div class="text-[11px] text-slate-400 truncate mt-0.5">
              {{ user?.email || 'admin@baifa.com.ve' }}
            </div>
          </div>

          <!-- Opción: Ver Perfil (link inactivo sin navegación) -->
          <a
            href="#"
            class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            @click.prevent
          >
            <v-icon icon="mdi-account-outline" size="18" class="text-slate-400" />
            <span>Ver perfil</span>
          </a>

          <!-- Opción: Cerrar Sesión (destruye cookies y redirige a login) -->
          <button
            type="button"
            class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors cursor-pointer text-left"
            @click="handleLogout"
          >
            <v-icon icon="mdi-logout" size="18" class="text-red-400" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </v-menu>
    </div>
  </aside>
</template>
