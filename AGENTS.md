# 🤖 Directrices Técnicas, de Arquitectura y Estándar para Agentes de IA — baifa-ui (Frontend)

Este repositorio contiene la aplicación cliente web frontend **baifa-ui** para el sistema de rastreo y logística de generadores eléctricos (**BaiFa Power Tracking**). Cualquier modelo de lenguaje o agente autónomo (Antigravity, Claude, Cursor, LLMs) que trabaje en este código DEBE adherirse estrictamente a estas directrices.

---

## 🏭 0. Contexto de Negocio del Proyecto (BaiFa Power Tracking)

* **Propósito:** Interfaz web para el rastreo logístico y gestión técnica de generadores eléctricos (BaiFa Power).
* **Stack Principal:** Nuxt 4 + Vue 3 (Composition API `<script setup lang="ts">`) + Vuetify 3 + Tailwind CSS.
* **Puertos Locales Estándar:**
  - **Frontend Web (`baifa-ui`):** Puerto **`15001`** (`http://localhost:15001`)
  - **Backend API (`baifa-api`):** Puerto **`14001`** (`http://localhost:14001/api`)
  - **Base de Datos MySQL (`baifa_api_db`):** Puerto **`14002`** (`127.0.0.1:14002`)
* **Paleta y Tema:** Dark mode permanente (`#0b1120` fondo, `#0f172a` superficies, `#3eb134` verde corporativo BaiFa, `#f97316` naranja logístico).
* **Roles de Usuario (RBAC):**
  - **`admin` (Superadministrador):** Panel completo, gestión de usuarios del sistema y directorio fiscal de clientes.
  - **`manager` (Jefe / Gerente):** Supervisión operativa, inventario y reportes.
  - **`employee` (Operador):** Actualización de estados e inspección de generadores en ruta.
  - **`client` (Cliente Empresarial):** Portal de autogestión y seguimiento de generadores adquiridos.
* **Hoja de Ruta (5 Etapas — `release/v1.0.7`):**
  - **Etapa 1:** ✅ **Completada** — Login, Logout, Registro de cliente con RIF/Razón Social, Recuperación/Reset de contraseña, Módulo de Usuarios y Directorio Fiscal de Clientes.
  - **Etapa 2:** ✅ **Completada** — Catálogo de Generadores, ficha técnica (kVA, diésel), seriales y fotografía.
  - **Etapa 3:** ✅ **Completada** — Trazabilidad, puntos de control (checkpoints) y consulta pública estilo MRW.
  - **Etapa 4:** ✅ **Completada** — Línea de tiempo cronológica (Timeline) e historial inmutable.
  - **Etapa 5:** ✅ **Completada** — Portal exclusivo para clientes y módulo de reportes con exportación CSV.
* **Documentación Centralizada del Proyecto:**
  - Repositorio global de documentación: [`../baifa-docs/README.md`](../baifa-docs/README.md)
  - Normas técnicas: [`../baifa-docs/NORMAS_TECNICAS.md`](../baifa-docs/NORMAS_TECNICAS.md)
  - Reglas funcionales del frontend: [`../baifa-docs/business/business_rules_frontend.md`](../baifa-docs/business/business_rules_frontend.md)
  - Diseño y prototipo Figma: [`../baifa-docs/business/diseno_figma.md`](../baifa-docs/business/diseno_figma.md)

---

## 🚫 1. Reglas Operativas Estrictas (Ejecución Manual Exclusiva)

1. **NO ejecutar tests automáticamente:**
   * ❌ **PROHIBIDO** ejecutar `npm test`, `npx vitest` u otros ejecutores de pruebas tras cada modificación.
   * ✅ **SOLO** ejecutar pruebas cuando el usuario lo ordene expresamente en el chat.
2. **NO ejecutar linters o formatters automáticos:**
   * ❌ **PROHIBIDO** ejecutar `npm run lint`, `eslint --fix` o `prettier` automáticamente tras cada cambio.
   * ✅ **SOLO** ejecutarlo cuando el usuario lo solicite expresamente.

---

## 🏛️ 2. Reglas Universales de Arquitectura: Vue.js 3 + Nuxt 4 + Vuetify 3

### 📂 Estructura de Directorios (`app/` y raíz):
* `app/components/<modulo>/`: Componentes Vue desacoplados organizados por dominio funcional (`client/`, `clients/`, `generators/`, `users/`, `common/`, `layout/`).
* `app/pages/`: Vistas y enrutamiento declarativo por archivos (`index.vue`, `login.vue`, `clients.vue`, `generators.vue`, `tracking.vue`, `users.vue`, `reports.vue`).
* `app/layouts/`: Plantillas maestras de maquetación (`default.vue`, `auth.vue`, `client.vue`, `public.vue`).
* `app/composables/`: Lógica de negocio reactiva y reutilizable (`useApi.ts`, `useAuth.ts`, `useClients.ts`, `useGenerators.ts`, `useTracking.ts`, `useUsers.ts`).
* `app/middleware/`: Guards de navegación de rutas (`auth.global.ts`).
* `types/`: Definiciones e interfaces TypeScript puras del dominio y de la API (`api.ts`, `auth.ts`, `client.ts`, `generator.ts`, `user.ts`).

### 🛡️ Regla de Oro de Coexistencia Vuetify 3 + Tailwind CSS:
* **Preflight desactivado:** `corePlugins: { preflight: false }` en `tailwind.config.ts` es obligatorio para evitar que el reset CSS de Tailwind altere los estilos base de Vuetify 3.
* **Sintaxis Obligatoria:** Todos los componentes y páginas utilizan `<script setup lang="ts">`.

---

## 🔀 3. Flujo Git y Versionado
* Rama principal de producción: `main`.
* Rama base de desarrollo activo: `develop`.
* Ramas y tags de release en GitHub: `release/vX.Y.Z` (actual: `release/v1.0.7`). Prohibido usar tags sin el prefijo `release/`.
* Tags de imagen en Docker Hub: `release-X.Y.Z` (`juaneliezer13/baifa-ui:release-1.0.7`).
