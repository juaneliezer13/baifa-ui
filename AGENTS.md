# 🤖 Reglas y Guía de Desarrollo para Agentes de IA - Baifa UI (Frontend)

Este repositorio contiene la aplicación cliente web frontend **baifa-ui** para el sistema logístico de generadores eléctricos (BaiFa Power Tracking). Cualquier modelo de lenguaje o agente autónomo (Antigravity, Claude, Cursor, LLMs) que trabaje en este código DEBE adherirse estrictamente a estas directrices.

---

## 1. Stack Tecnológico y Arquitectura
- **Framework:** Nuxt 4 (Vue.js 3, Composition API, `<script setup lang="ts">`).
- **Librería de Componentes UI:** Vuetify 3 (`vuetify-nuxt-module`).
- **Iconografía:** Material Design Icons (`@mdi/font`).
- **Arquitectura:** Aplicación SPA / SSR desacoplada, consumiendo endpoints REST mediante clientes HTTP reactivos (`useFetch` / `$fetch`).

---

## 2. Documentación y Especificación de Negocio (Frontend)
- [`docs/business_rules.md`](docs/business_rules.md): Libro de reglas funcionales de negocio por etapa y rol de usuario.
- [`docs/business/diseno_figma.md`](docs/business/diseno_figma.md): Especificación del prototipo oficial en Figma (vistas, modales, campos y estilos visuales).

---

## 3. Reglas de Negocio Clave en Interfaz
1. **Roles y Control de Acceso en Navegación:**
   - `client`: Acceso exclusivo al portal de autoconsulta de sus generadores asociados y línea de tiempo de tracking.
   - `employee`: Operador logístico. Acceso al catálogo y actualización de checkpoints.
   - `manager`: Supervisión operativa, métricas de inventario y reportes.
   - `admin`: Control y configuración integral de interfaces.
2. **Actualización Estrictamente Manual:**
   - La plataforma NO utiliza mapas automatizados por GPS ni telemetría externa. La captura y cambio de checkpoints es 100% manual por parte de los operadores.
3. **Aislamiento de Información:**
   - El cliente solo puede visualizar datos de equipos asociados a su empresa.

---

## 4. Reglas Técnicas del Frontend (En espera de directrices del usuario)
*(Esta sección se completará con las reglas técnicas específicas que proporcione el usuario en el próximo mensaje).*

---

## 5. Flujo Git
- Rama principal de producción: `main`.
- Rama base de desarrollo activo: `develop`.
- Ramas de características: `feature/nombre-de-la-funcionalidad` originadas desde `develop`.
