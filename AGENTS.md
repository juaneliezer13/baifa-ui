# 🤖 Directrices Técnicas, de Arquitectura y Estándar para Agentes de IA - Baifa UI (Frontend)

Este repositorio contiene la aplicación cliente web frontend **baifa-ui** para el sistema de rastreo y logística de generadores eléctricos (BaiFa Power Tracking). Cualquier modelo de lenguaje o agente autónomo (Antigravity, Claude, Cursor, LLMs) que trabaje en este código DEBE adherirse estrictamente a estas directrices.

---

## 🚫 1. Reglas Operativas Estrictas (Ejecución Manual Exclusiva)

1. **NO ejecutar tests automáticamente:**
   * ❌ **PROHIBIDO** ejecutar 
pm test, 
px vitest u otros ejecutores de pruebas tras cada modificación.
   * ✅ **SOLO** ejecutar pruebas cuando el usuario lo ordene expresamente en el chat (ej. *corre los tests*, *haz las pruebas*).
2. **NO ejecutar linters o formatters automáticos:**
   * ❌ **PROHIBIDO** ejecutar 
pm run lint, eslint --fix o prettier automáticamente tras cada cambio.
   * ✅ **SOLO** ejecutarlo cuando el usuario lo solicite expresamente (ej. *pasa el linter*, *formatea el código*).

---

## 🏛️ 2. Reglas Universales de Arquitectura: Vue.js 3 + Nuxt 4 + Vuetify 3

Buscamos un desarrollo limpio, modular, escalable y mantenible basado en la arquitectura estándar de Nuxt 4:

### 📂 Estructura de Directorios (pp/ y raíz):
* pp/components/<modulo>/: Componentes Vue desacoplados organizados por dominio funcional (uth/, clients/, generators/, 	racking/, common/).
* pp/pages/: Vistas y enrutamiento declarativo por archivos (index.vue, login.vue, clients/index.vue, etc.).
* pp/layouts/: Plantillas maestras de maquetación (default.vue, uth.vue, dashboard.vue).
* pp/composables/: Lógica de negocio reactiva y reutilizable (useAuth.ts, useClients.ts, useGenerators.ts).
* pp/middleware/: Guards de navegación de rutas (uth.ts, ole.ts).
* pp/utils/: Funciones puras de formateo (monedas, fechas, formato de RIF venezolano).
* 	ypes/: Definiciones e interfaces TypeScript puras del dominio y de la API.

### 🧩 Convenciones de Componentes:
* **Nomenclatura PascalCase:** Para todos los nombres de componentes y archivos .vue (ej. GeneratorCard.vue, CheckpointModal.vue, ClientFiscalTable.vue).
* **Principio de Responsabilidad Única (SRP):** Componentes pequeños, reutilizables y con propósito específico. Vistas en pages/ deben limitarse a coordinar componentes y composables.
* **Componentes Estructurales de Vuetify:** Emplear Vuetify para los bloques funcionales y de interacción del sistema:
  * Formularios y campos: -form, -text-field, -select, -textarea, -switch, -file-input.
  * Contenedores y navegación: -app, -main, -container, -navigation-drawer, -app-bar.
  * Tablas y Diálogos: -data-table, -dialog, -card, -chip, -snackbar, -tooltip.
* **Seguridad de Hidratación y SSR (Server-Side Rendering):**
  * Proteger el acceso a APIs del navegador (window, localStorage, document) mediante comprobación de entorno import.meta.client o envolviendo en <ClientOnly>.
  * Emplear useCookie para tokens de sesión y estados que requieran sincronización SSR / cliente.
* **Consumo de API y Manejo de Errores:**
  * Utilizar useFetch / $fetch nativo de Nuxt con interceptor centralizado para adjuntar el Bearer Token.
  * Manejar estados de carga (pending), error (error) y datos (data).
  * Respuestas amigables de error con snackbar o alertas en español (401 redirige al login, 403 acceso denegado, 422 valida formulario).

---

## 🎨 3. Regla Principal: Tailwind CSS para Efectos Gráficos y Micro-estilizado

Tailwind CSS es la librería designada para dotar a la plataforma de su identidad gráfica moderna, refinamiento visual y micro-interacciones:

### ⚖️ División Clara de Responsabilidades:
1. **Vuetify 3 (Estructura Funcional):** Aporta la accesibilidad, comportamiento complejo de componentes, inputs con validación, data tables, dialogs y menús desplegables.
2. **Tailwind CSS (Efectos Gráficos y Utilidades):** Aporta el diseño visual avanzado:
   * Fondos con gradientes sutiles (g-gradient-to-br from-slate-900 via-slate-800 to-sky-950).
   * Efectos de cristal o Glassmorphism (ackdrop-blur-md bg-white/80 dark:bg-slate-900/80 border border-white/20).
   * Sombras elegantes y profundidad (shadow-sm, shadow-xl, shadow-sky-500/10).
   * Micro-interacciones y transiciones fluidas (	ransition-all duration-300 hover:scale-[1.02] active:scale-95).
   * Layouts flexibles y rejillas finas (lex items-center gap-4, grid grid-cols-1 md:grid-cols-3).

### 🛡️ Regla de Oro de Coexistencia:
* **Preflight desactivado:** corePlugins: { preflight: false } en 	ailwind.config.ts es obligatorio para evitar que el reset CSS de Tailwind altere o desplace los estilos base de botones, inputs y tipografía de Vuetify.
* **Aplicación directa:** Aplicar las clases utilitarias de Tailwind en el atributo class=... de los componentes de Vuetify o etiquetas HTML nativas.

---

## ⚡ 4. Estándar Moderno de TypeScript para Vue.js (Estándar 2026)

Todo el código fuente del proyecto debe escribirse en TypeScript estricto con las mejores prácticas del ecosistema moderno de Vue 3:

### 1. Sintaxis Obligatoria:
* El 100% de los componentes y páginas DEBEN utilizar <script setup lang=ts>.
* Prohibido el uso de Options API o de defineComponent({ setup() }).

### 2. Tolerancia Cero a ny:
* Queda estrictamente prohibido tipar variables, argumentos o retornos con ny.
* Si un tipo es dinámico o desconocido, usar unknown junto con narrowing de tipos (	ypeof, instanceof, user-defined type guards).

### 3. Tipado Moderno de Props con Desestructuración Reactiva (Vue 3.5+):
Aprovechar la desestructuración reactiva nativa de Vue 3.5+ para props con valores por defecto:
`	s
interface Props {
  generatorId: number
  editable?: boolean
  label?: string
}

// Desestructuración reactiva nativa sin perder reactividad
const { generatorId, editable = false, label = 'Generador' } = defineProps<Props>()
`

### 4. Emits Fuertemente Tipados con Tuplas:
`	s
const emit = defineEmits<{
  save: [payload: CreateClientFiscalDTO]
  close: []
  changeStatus: [status: GeneratorStatus, notes?: string]
}>()
`

### 5. Two-Way Binding Moderno con defineModel():
Reemplazar el patrón obsoleto props: modelValue + emit('update:modelValue') por la macro nativa:
`	s
// Enlace bidireccional directo
const modelValue = defineModel<string>({ required: true })
const isModalOpen = defineModel<boolean>('isOpen', { default: false })
`

### 6. Modelos y DTOs Centralizados en 	ypes/:
* Toda entidad, DTO de solicitud o respuesta de API debe declararse en la carpeta 	ypes/ (ej. 	ypes/auth.ts, 	ypes/client.ts, 	ypes/generator.ts, 	ypes/api.ts).
* Emplear tipos genéricos para respuestas del backend:
`	s
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginatedMeta
}
`

---

## 🧭 5. Dominio de Negocio y Fuentes de Verdad
* **Reglas Funcionales y Etapas de Entrega:** [docs/business_rules.md](docs/business_rules.md) (Etapas 1 a 5, roles, checkpoints y fichas de clientes).
* **Especificación de Diseño y Prototipo en Figma:** [docs/business/diseno_figma.md](docs/business/diseno_figma.md) (Colores, estados, modales y estructura visual).

---

## 🔀 6. Flujo Git
* Rama principal de producción: main.
* Rama base de desarrollo activo: develop.
* Ramas de características: eature/nombre-de-la-funcionalidad originadas desde develop.
