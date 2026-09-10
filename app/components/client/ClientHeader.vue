<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import AppLogo from '~/components/common/AppLogo.vue'

const { user, logout } = useAuth()
const isMenuOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isMenuOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})

const handleLogout = async () => {
  isMenuOpen.value = false
  await logout()
}
</script>

<template>
  <header class="w-full bg-[#0f172a] border-b border-[#1e293b] select-none sticky top-0 z-40 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <!-- Logo Baifa a la izquierda -->
      <div class="flex items-center gap-3">
        <AppLogo variant="green" size="md" />
        <span class="hidden sm:inline-block text-xs font-semibold uppercase tracking-wider text-slate-400 pl-3 border-l border-slate-700">
          Portal de Clientes
        </span>
      </div>

      <!-- Menú de Usuario a la derecha -->
      <div ref="dropdownRef" class="relative">
        <button
          type="button"
          class="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 transition-all cursor-pointer group"
          @click.stop="toggleMenu"
        >
          <!-- Avatar circular verde con iniciales -->
          <div class="w-8 h-8 rounded-full bg-[#3eb134] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm shadow-[#3eb134]/20">
            {{ user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2) : 'CE' }}
          </div>

          <!-- Nombre y Badge -->
          <div class="hidden sm:block text-left">
            <div class="text-xs font-semibold text-white group-hover:text-[#3eb134] transition-colors leading-tight">
              {{ user?.name || 'Cliente' }}
            </div>
            <div class="text-[10px] text-emerald-400 font-medium leading-tight mt-0.5">
              {{ user?.roleLabel || 'Cliente' }}
            </div>
          </div>

          <!-- Icono de despliegue -->
          <v-icon
            icon="mdi-chevron-down"
            size="18"
            class="text-slate-400 group-hover:text-slate-200 transition-transform duration-200"
            :class="{ 'rotate-180': isMenuOpen }"
          />
        </button>

        <!-- Menú Flotante Desplegable -->
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
        >
          <div
            v-if="isMenuOpen"
            class="absolute right-0 mt-2 w-64 bg-[#0f172a] border border-slate-700/80 rounded-2xl p-2 shadow-2xl space-y-1 text-slate-200 z-50"
          >
            <div class="px-3 py-2 border-b border-slate-800 mb-1">
              <div class="text-xs font-semibold text-white truncate">
                {{ user?.name || 'Cliente Ejemplo' }}
              </div>
              <div class="text-[11px] text-slate-400 truncate mt-0.5">
                {{ user?.email || 'cliente.real@empresa.com' }}
              </div>
            </div>

            <!-- Opción Ver Perfil -->
            <a
              href="#"
              class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              @click.prevent
            >
              <v-icon icon="mdi-account-outline" size="18" class="text-slate-400" />
              <span>Ver perfil</span>
            </a>

            <!-- Opción Cerrar Sesión -->
            <button
              type="button"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors cursor-pointer text-left"
              @click="handleLogout"
            >
              <v-icon icon="mdi-logout" size="18" class="text-red-400" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>
