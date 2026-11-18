<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import BaseStatusBadge from '~/components/common/BaseStatusBadge.vue'
import type { GeneratorItem, GeneratorStatus } from '~~/types/generator'
import type { ClientItem } from '~~/types/client'
import type { UserItem } from '~~/types/user'

useHead({
  title: 'Reportes - Baifa'
})

const api = useApi()
const { user } = useAuth()

type ReportTab = 'generators' | 'clients' | 'users'
const activeTab = ref<ReportTab>('generators')

const isLoading = ref(false)
const errorMessage = ref('')

// Datos cargados desde /v1/reports/overview
const generators = ref<GeneratorItem[]>([])
const clients = ref<Array<ClientItem & { generators_count?: number }>>([])
const users = ref<UserItem[]>([])

const generatorsSummary = ref({
  total: 0,
  total_kva: 0,
  in_progress: 0,
  purchase_order: 0,
  in_production: 0,
  origin_customs: 0,
  maritime_transit: 0,
  destination_customs: 0,
  baifa_warehouse: 0,
  delivered: 0
})

const clientsSummary = ref({
  total: 0,
  active: 0,
  inactive: 0,
  with_generators: 0
})

const usersSummary = ref({
  total: 0,
  active: 0,
  inactive: 0,
  admin: 0,
  manager: 0,
  employee: 0,
  client: 0
})

// Filtros por pestaña
const genSearch = ref('')
const genStatusFilter = ref<'all' | GeneratorStatus>('all')
const genClientFilter = ref<number | 'all'>('all')

const clientSearch = ref('')
const clientStatusFilter = ref<'all' | 'active' | 'inactive'>('all')

const userSearch = ref('')
const userRoleFilter = ref<'all' | 'admin' | 'manager' | 'employee' | 'client'>('all')

const canViewUsersTab = computed(() => {
  return ['admin', 'manager'].includes(user.value?.role || '')
})

const fetchReportsData = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const res = await api.get<any>('/v1/reports/overview')
    if (res.generators_summary) {
      generatorsSummary.value = res.generators_summary
    }
    if (res.clients_summary) {
      clientsSummary.value = res.clients_summary
    }
    if (res.users_summary) {
      usersSummary.value = res.users_summary
    }
    generators.value = Array.isArray(res.generators) ? res.generators : (res.generators?.data || [])
    clients.value = Array.isArray(res.clients) ? res.clients : (res.clients?.data || [])
    users.value = Array.isArray(res.users) ? res.users : (res.users?.data || [])
  } catch (err: any) {
    errorMessage.value = err?.message || 'Error al cargar los datos de reportes.'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await fetchReportsData()
})

// Porcentaje respecto al total de generadores
const getPct = (count: number): string => {
  const total = generatorsSummary.value.total
  if (!total || total <= 0) return '0% del total'
  return `${Math.round((count / total) * 100)}% del total`
}

interface StatusCardItem {
  key: GeneratorStatus
  label: string
  count: number
  percentText: string
  borderClass: string
  bgClass: string
  textClass: string
}

const statusCards = computed<StatusCardItem[]>(() => [
  {
    key: 'purchase_order',
    label: 'Orden de Compra',
    count: generatorsSummary.value.purchase_order,
    percentText: getPct(generatorsSummary.value.purchase_order),
    borderClass: 'border-violet-700/40',
    bgClass: 'bg-violet-950/25',
    textClass: 'text-violet-400'
  },
  {
    key: 'in_production',
    label: 'En Producción',
    count: generatorsSummary.value.in_production,
    percentText: getPct(generatorsSummary.value.in_production),
    borderClass: 'border-amber-700/40',
    bgClass: 'bg-amber-950/25',
    textClass: 'text-amber-400'
  },
  {
    key: 'origin_customs',
    label: 'En Aduana de Origen',
    count: generatorsSummary.value.origin_customs,
    percentText: getPct(generatorsSummary.value.origin_customs),
    borderClass: 'border-orange-700/40',
    bgClass: 'bg-orange-950/25',
    textClass: 'text-orange-400'
  },
  {
    key: 'maritime_transit',
    label: 'En Tránsito Marítimo',
    count: generatorsSummary.value.maritime_transit,
    percentText: getPct(generatorsSummary.value.maritime_transit),
    borderClass: 'border-sky-700/40',
    bgClass: 'bg-sky-950/25',
    textClass: 'text-sky-400'
  },
  {
    key: 'destination_customs',
    label: 'En Aduana Destino',
    count: generatorsSummary.value.destination_customs,
    percentText: getPct(generatorsSummary.value.destination_customs),
    borderClass: 'border-yellow-700/40',
    bgClass: 'bg-yellow-950/25',
    textClass: 'text-yellow-400'
  },
  {
    key: 'baifa_warehouse',
    label: 'En Almacén BaiFa',
    count: generatorsSummary.value.baifa_warehouse,
    percentText: getPct(generatorsSummary.value.baifa_warehouse),
    borderClass: 'border-cyan-700/40',
    bgClass: 'bg-cyan-950/25',
    textClass: 'text-cyan-400'
  },
  {
    key: 'delivered',
    label: 'Entregado',
    count: generatorsSummary.value.delivered,
    percentText: getPct(generatorsSummary.value.delivered),
    borderClass: 'border-emerald-700/40',
    bgClass: 'bg-emerald-950/25',
    textClass: 'text-emerald-400'
  }
])

const toggleStatusCardFilter = (statusKey: GeneratorStatus) => {
  genStatusFilter.value = genStatusFilter.value === statusKey ? 'all' : statusKey
}

const filteredGenerators = computed(() => {
  return generators.value.filter((g) => {
    if (genStatusFilter.value !== 'all' && g.status !== genStatusFilter.value) {
      return false
    }
    if (genClientFilter.value !== 'all' && g.client_id !== Number(genClientFilter.value)) {
      return false
    }
    if (genSearch.value.trim()) {
      const q = genSearch.value.toLowerCase().trim()
      const matchSerial = g.serial_number?.toLowerCase().includes(q)
      const matchModel = g.model?.toLowerCase().includes(q)
      const matchClient = g.client?.company_short_name?.toLowerCase().includes(q) ||
        g.client?.company_fiscal_name?.toLowerCase().includes(q) ||
        g.client?.rif?.toLowerCase().includes(q)
      if (!matchSerial && !matchModel && !matchClient) return false
    }
    return true
  })
})

// Activos / En proceso logístico vs Entregados (acorde a Figma 09_reportes.png)
const activeGenerators = computed(() => {
  return filteredGenerators.value.filter(g => g.status !== 'delivered')
})

const deliveredGenerators = computed(() => {
  return filteredGenerators.value.filter(g => g.status === 'delivered')
})

const filteredClients = computed(() => {
  return clients.value.filter((c) => {
    if (clientStatusFilter.value === 'active' && !c.is_active) return false
    if (clientStatusFilter.value === 'inactive' && c.is_active) return false
    if (clientSearch.value.trim()) {
      const q = clientSearch.value.toLowerCase().trim()
      const matchFiscal = c.company_fiscal_name?.toLowerCase().includes(q)
      const matchShort = c.company_short_name?.toLowerCase().includes(q)
      const matchRif = c.rif?.toLowerCase().includes(q)
      const matchContact = c.contact_name?.toLowerCase().includes(q) || c.contact_email?.toLowerCase().includes(q)
      if (!matchFiscal && !matchShort && !matchRif && !matchContact) return false
    }
    return true
  })
})

const filteredUsers = computed(() => {
  return users.value.filter((u) => {
    if (userRoleFilter.value !== 'all' && u.role !== userRoleFilter.value) return false
    if (userSearch.value.trim()) {
      const q = userSearch.value.toLowerCase().trim()
      const matchName = u.name?.toLowerCase().includes(q)
      const matchEmail = u.email?.toLowerCase().includes(q)
      if (!matchName && !matchEmail) return false
    }
    return true
  })
})

const formatDateTime = (iso?: string | null): string => {
  if (!iso) return 'N/D'
  return iso.slice(0, 16).replace('T', ' ')
}

// Exportación CSV compatible con Excel (UTF-8 con BOM)
const exportCurrentTabToCsv = () => {
  let filename = 'reporte_baifa.csv'
  const rows: string[][] = []

  if (activeTab.value === 'generators') {
    filename = `reporte_generadores_baifa_${new Date().toISOString().slice(0, 10)}.csv`
    rows.push(['Serial', 'Modelo', 'Capacidad (kVA)', 'Cliente', 'RIF Cliente', 'Estado Logistico', 'Llegada Estimada (ETA)', 'Ultima Actualizacion'])
    filteredGenerators.value.forEach((g) => {
      rows.push([
        g.serial_number,
        g.model,
        g.capacity_kva ? String(g.capacity_kva) : 'N/D',
        g.client?.company_fiscal_name || 'En stock BaiFa',
        g.client?.rif || 'N/A',
        g.status_label || g.status,
        g.estimated_arrival_date || 'N/D',
        formatDateTime(g.updated_at)
      ])
    })
  } else if (activeTab.value === 'clients') {
    filename = `reporte_clientes_baifa_${new Date().toISOString().slice(0, 10)}.csv`
    rows.push(['RIF', 'Razon Social', 'Nombre Comercial', 'Contacto', 'Correo Contacto', 'Telefono Oficina', 'Telefono Contacto', 'Generadores Asignados', 'Estado'])
    filteredClients.value.forEach((c) => {
      rows.push([
        c.rif,
        c.company_fiscal_name,
        c.company_short_name,
        c.contact_name,
        c.contact_email,
        c.office_phone || 'N/D',
        c.contact_phone || 'N/D',
        String(c.generators_count ?? 0),
        c.is_active ? 'Activo' : 'Inactivo'
      ])
    })
  } else {
    filename = `reporte_usuarios_baifa_${new Date().toISOString().slice(0, 10)}.csv`
    rows.push(['ID', 'Nombre Completo', 'Correo Electronico', 'Rol', 'Estado', 'Fecha Registro'])
    filteredUsers.value.forEach((u) => {
      rows.push([
        String(u.id),
        u.name,
        u.email,
        u.role_label || u.role,
        u.is_active ? 'Activo' : 'Inactivo',
        u.created_at ? u.created_at.slice(0, 10) : 'N/D'
      ])
    })
  }

  const csvContent = '\uFEFF' + rows
    .map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\r\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <!-- Encabezado y Acciones Superiores -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl lg:text-3xl font-bold text-white tracking-tight">
          Reportes
        </h1>
        <p class="text-sm text-slate-400 mt-1">
          Consultas generales del sistema, supervisión de flota y exportación ejecutiva
        </p>
      </div>

      <div class="flex items-center gap-2.5 self-start sm:self-auto">
        <button
          type="button"
          :disabled="isLoading"
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
          @click="fetchReportsData"
        >
          <v-icon icon="mdi-refresh" size="16" :class="{ 'animate-spin': isLoading }" />
          <span>Actualizar</span>
        </button>

        <button
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#3eb134] hover:bg-[#349b2c] active:scale-[0.99] transition-all shadow-md shadow-[#3eb134]/20 cursor-pointer"
          @click="exportCurrentTabToCsv"
        >
          <v-icon icon="mdi-file-delimited-outline" size="17" />
          <span>Exportar CSV</span>
        </button>
      </div>
    </div>

    <!-- Selector de Pestañas (Acorde a Figma 09_reportes.png) -->
    <div class="flex items-center gap-2.5">
      <button
        type="button"
        class="px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
        :class="activeTab === 'generators'
          ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
          : 'bg-[#131d31] text-slate-400 hover:text-white border border-slate-800'"
        @click="activeTab = 'generators'"
      >
        Generadores
      </button>

      <button
        type="button"
        class="px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
        :class="activeTab === 'clients'
          ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
          : 'bg-[#131d31] text-slate-400 hover:text-white border border-slate-800'"
        @click="activeTab = 'clients'"
      >
        Clientes
      </button>

      <button
        v-if="canViewUsersTab"
        type="button"
        class="px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
        :class="activeTab === 'users'
          ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
          : 'bg-[#131d31] text-slate-400 hover:text-white border border-slate-800'"
        @click="activeTab = 'users'"
      >
        Usuarios
      </button>
    </div>

    <!-- Alerta de Error -->
    <div
      v-if="errorMessage"
      class="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-2.5"
    >
      <v-icon icon="mdi-alert-circle-outline" size="20" class="text-red-400" />
      <span>{{ errorMessage }}</span>
    </div>

    <!-- ==================== TAB 1: GENERADORES ==================== -->
    <div v-if="activeTab === 'generators'" class="space-y-6">
      <!-- Tarjetas de los 7 Estados Logísticos con % del total -->
      <div class="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
        <button
          v-for="card in statusCards"
          :key="card.key"
          type="button"
          class="text-left border rounded-2xl p-4 transition-all cursor-pointer hover:scale-[1.01]"
          :class="[
            card.borderClass,
            card.bgClass,
            genStatusFilter === card.key ? 'ring-2 ring-orange-500' : ''
          ]"
          @click="toggleStatusCardFilter(card.key)"
        >
          <span class="block text-xs font-semibold leading-snug mb-2 truncate" :class="card.textClass" :title="card.label">
            {{ card.label }}
          </span>
          <div class="text-2xl font-bold text-white tracking-tight">
            {{ card.count }}
          </div>
          <div class="text-[11px] text-slate-400 mt-1">
            {{ card.percentText }}
          </div>
        </button>
      </div>

      <!-- Barra de Filtros para Reportes de Generadores -->
      <div class="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div class="relative flex-1">
          <v-icon icon="mdi-magnify" size="18" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            v-model="genSearch"
            type="text"
            placeholder="Filtrar reporte por serial, modelo o empresa cliente..."
            class="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-orange-500"
          >
        </div>

        <select
          v-model="genStatusFilter"
          class="px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500 cursor-pointer"
        >
          <option value="all">Todos los estados ({{ generatorsSummary.total }})</option>
          <option v-for="c in statusCards" :key="c.key" :value="c.key">
            {{ c.label }} ({{ c.count }})
          </option>
        </select>

        <select
          v-model="genClientFilter"
          class="px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500 cursor-pointer"
        >
          <option value="all">Todos los clientes</option>
          <option v-for="cl in clients" :key="cl.id" :value="cl.id">
            {{ cl.company_short_name }} ({{ cl.rif }})
          </option>
        </select>
      </div>

      <!-- Bloque 1: Generadores activos / en proceso logístico -->
      <div class="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-[#3eb134]" />
            <h2 class="text-sm font-bold text-white">
              Generadores activos en proceso ({{ activeGenerators.length }})
            </h2>
          </div>
          <span class="text-xs text-slate-400">
            Orden de compra a Almacén BaiFa
          </span>
        </div>

        <div v-if="activeGenerators.length === 0" class="py-8 text-center text-xs text-slate-500">
          No hay generadores en tránsito o proceso logístico con los filtros seleccionados.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th class="pb-3 pr-4">Serial</th>
                <th class="pb-3 px-4">Modelo / Potencia</th>
                <th class="pb-3 px-4">Cliente</th>
                <th class="pb-3 px-4">Estado</th>
                <th class="pb-3 px-4">Llegada Est.</th>
                <th class="pb-3 pl-4 text-right">Última actualización</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 text-xs">
              <tr
                v-for="gen in activeGenerators"
                :key="gen.id"
                class="hover:bg-slate-800/30 transition-colors"
              >
                <td class="py-3.5 pr-4 font-mono font-semibold text-orange-400">
                  <NuxtLink :to="`/tracking?serial=${gen.serial_number}`" class="hover:underline">
                    {{ gen.serial_number }}
                  </NuxtLink>
                </td>
                <td class="py-3.5 px-4 text-slate-200">
                  <span class="font-medium">{{ gen.model }}</span>
                  <span v-if="gen.capacity_kva" class="text-slate-400 ml-1">({{ gen.capacity_kva }} kVA)</span>
                </td>
                <td class="py-3.5 px-4 text-slate-300">
                  {{ gen.client?.company_short_name || 'Stock BaiFa' }}
                </td>
                <td class="py-3.5 px-4">
                  <BaseStatusBadge :status="gen.status" />
                </td>
                <td class="py-3.5 px-4 font-mono text-slate-300">
                  {{ gen.estimated_arrival_date || 'N/D' }}
                </td>
                <td class="py-3.5 pl-4 text-right font-mono text-slate-400">
                  {{ formatDateTime(gen.updated_at) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Bloque 2: Generadores entregados -->
      <div class="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <h2 class="text-sm font-bold text-white">
              Generadores entregados ({{ deliveredGenerators.length }})
            </h2>
          </div>
          <span class="text-xs text-slate-400">
            Unidades entregadas en destino final
          </span>
        </div>

        <div v-if="deliveredGenerators.length === 0" class="py-8 text-center text-xs text-slate-500">
          No hay generadores en estado entregado con los filtros seleccionados.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th class="pb-3 pr-4">Serial</th>
                <th class="pb-3 px-4">Modelo / Potencia</th>
                <th class="pb-3 px-4">Cliente</th>
                <th class="pb-3 px-4">Estado</th>
                <th class="pb-3 px-4">Llegada Est.</th>
                <th class="pb-3 pl-4 text-right">Última actualización</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 text-xs">
              <tr
                v-for="gen in deliveredGenerators"
                :key="gen.id"
                class="hover:bg-slate-800/30 transition-colors"
              >
                <td class="py-3.5 pr-4 font-mono font-semibold text-orange-400">
                  <NuxtLink :to="`/tracking?serial=${gen.serial_number}`" class="hover:underline">
                    {{ gen.serial_number }}
                  </NuxtLink>
                </td>
                <td class="py-3.5 px-4 text-slate-200">
                  <span class="font-medium">{{ gen.model }}</span>
                  <span v-if="gen.capacity_kva" class="text-slate-400 ml-1">({{ gen.capacity_kva }} kVA)</span>
                </td>
                <td class="py-3.5 px-4 text-slate-300">
                  {{ gen.client?.company_short_name || 'Stock BaiFa' }}
                </td>
                <td class="py-3.5 px-4">
                  <BaseStatusBadge :status="gen.status" />
                </td>
                <td class="py-3.5 px-4 font-mono text-slate-300">
                  {{ gen.estimated_arrival_date || 'N/D' }}
                </td>
                <td class="py-3.5 pl-4 text-right font-mono text-slate-400">
                  {{ formatDateTime(gen.updated_at) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ==================== TAB 2: CLIENTES ==================== -->
    <div v-else-if="activeTab === 'clients'" class="space-y-6">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4">
          <span class="text-xs font-medium text-slate-400">Total Clientes</span>
          <div class="text-2xl font-bold text-white mt-2">{{ clientsSummary.total }}</div>
        </div>
        <div class="bg-[#0f172a] border border-emerald-500/20 rounded-2xl p-4">
          <span class="text-xs font-medium text-emerald-400">Clientes Activos</span>
          <div class="text-2xl font-bold text-emerald-300 mt-2">{{ clientsSummary.active }}</div>
        </div>
        <div class="bg-[#0f172a] border border-slate-700/40 rounded-2xl p-4">
          <span class="text-xs font-medium text-slate-400">Clientes Inactivos</span>
          <div class="text-2xl font-bold text-slate-300 mt-2">{{ clientsSummary.inactive }}</div>
        </div>
        <div class="bg-[#0f172a] border border-sky-500/20 rounded-2xl p-4">
          <span class="text-xs font-medium text-sky-400">Con Equipos Asignados</span>
          <div class="text-2xl font-bold text-sky-300 mt-2">{{ clientsSummary.with_generators }}</div>
        </div>
      </div>

      <div class="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <v-icon icon="mdi-magnify" size="18" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            v-model="clientSearch"
            type="text"
            placeholder="Buscar empresa por RIF, razón social o persona de contacto..."
            class="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-orange-500"
          >
        </div>

        <select
          v-model="clientStatusFilter"
          class="px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500 cursor-pointer"
        >
          <option value="all">Todos los clientes</option>
          <option value="active">Solo activos</option>
          <option value="inactive">Solo inactivos</option>
        </select>
      </div>

      <div class="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-sm overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th class="pb-3 pr-4">RIF</th>
              <th class="pb-3 px-4">Razón Social / Nombre Corto</th>
              <th class="pb-3 px-4">Persona de Contacto</th>
              <th class="pb-3 px-4">Correo / Teléfono</th>
              <th class="pb-3 px-4 text-center">Equipos</th>
              <th class="pb-3 pl-4 text-right">Condición</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60 text-xs">
            <tr
              v-for="cl in filteredClients"
              :key="cl.id"
              class="hover:bg-slate-800/30 transition-colors"
            >
              <td class="py-3.5 pr-4 font-mono font-semibold text-orange-400">
                {{ cl.rif }}
              </td>
              <td class="py-3.5 px-4">
                <div class="font-semibold text-white">{{ cl.company_fiscal_name }}</div>
                <div class="text-[11px] text-slate-400">{{ cl.company_short_name }}</div>
              </td>
              <td class="py-3.5 px-4 text-slate-200">
                {{ cl.contact_name }}
              </td>
              <td class="py-3.5 px-4">
                <div class="text-slate-300">{{ cl.contact_email }}</div>
                <div class="text-[11px] font-mono text-slate-500">{{ cl.contact_phone || cl.office_phone }}</div>
              </td>
              <td class="py-3.5 px-4 text-center font-bold text-white">
                {{ cl.generators_count ?? 0 }}
              </td>
              <td class="py-3.5 pl-4 text-right">
                <BaseStatusBadge :status="cl.is_active ? 'active' : 'inactive'" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ==================== TAB 3: USUARIOS ==================== -->
    <div v-else-if="activeTab === 'users' && canViewUsersTab" class="space-y-6">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4">
          <span class="text-xs font-medium text-slate-400">Total Usuarios</span>
          <div class="text-2xl font-bold text-white mt-2">{{ usersSummary.total }}</div>
        </div>
        <div class="bg-[#0f172a] border border-emerald-500/20 rounded-2xl p-4">
          <span class="text-xs font-medium text-emerald-400">Usuarios Activos</span>
          <div class="text-2xl font-bold text-emerald-300 mt-2">{{ usersSummary.active }}</div>
        </div>
        <div class="bg-[#0f172a] border border-amber-500/20 rounded-2xl p-4">
          <span class="text-xs font-medium text-amber-400">Personal Interno</span>
          <div class="text-2xl font-bold text-amber-300 mt-2">
            {{ usersSummary.admin + usersSummary.manager + usersSummary.employee }}
          </div>
        </div>
        <div class="bg-[#0f172a] border border-sky-500/20 rounded-2xl p-4">
          <span class="text-xs font-medium text-sky-400">Cuentas Clientes</span>
          <div class="text-2xl font-bold text-sky-300 mt-2">{{ usersSummary.client }}</div>
        </div>
      </div>

      <div class="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <v-icon icon="mdi-magnify" size="18" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            v-model="userSearch"
            type="text"
            placeholder="Buscar usuario por nombre o correo electrónico..."
            class="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-orange-500"
          >
        </div>

        <select
          v-model="userRoleFilter"
          class="px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500 cursor-pointer"
        >
          <option value="all">Todos los roles</option>
          <option value="admin">Superadministrador</option>
          <option value="manager">Jefe / Gerente</option>
          <option value="employee">Operador</option>
          <option value="client">Cliente</option>
        </select>
      </div>

      <div class="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-sm overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th class="pb-3 pr-4">Usuario</th>
              <th class="pb-3 px-4">Correo Electrónico</th>
              <th class="pb-3 px-4">Rol en Sistema</th>
              <th class="pb-3 px-4">Estado</th>
              <th class="pb-3 pl-4 text-right">Fecha Registro</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60 text-xs">
            <tr
              v-for="u in filteredUsers"
              :key="u.id"
              class="hover:bg-slate-800/30 transition-colors"
            >
              <td class="py-3.5 pr-4 font-semibold text-white">
                {{ u.name }}
              </td>
              <td class="py-3.5 px-4 text-slate-300 font-mono">
                {{ u.email }}
              </td>
              <td class="py-3.5 px-4 text-slate-200">
                {{ u.role_label || u.role }}
              </td>
              <td class="py-3.5 px-4">
                <BaseStatusBadge :status="u.is_active ? 'active' : 'inactive'" />
              </td>
              <td class="py-3.5 pl-4 text-right font-mono text-slate-400">
                {{ u.created_at ? u.created_at.slice(0, 10) : 'N/D' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
