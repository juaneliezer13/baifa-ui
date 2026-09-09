# Reglas y Guía de Desarrollo para Agentes de IA - Baifa UI (Frontend)

Este archivo establece las directrices de trabajo para el desarrollo del frontend de **Baifa Power Tracking**.

---

## 1. Contexto del Proyecto y Dominio de Negocio
- **Proyecto:** Baifa Power Tracking - Frontend Web SPA/SSR.
- **Tecnologías Core:** Vue.js 3, Nuxt 4, Vuetify 3 (uetify-nuxt-module), Material Design Icons (@mdi/font).
- **Arquitectura:** Frontend totalmente desacoplado del backend (aifa-api), comunicándose vía API REST con autenticación Bearer Token (Sanctum).
- **Reglas de Negocio Generales:** Compartidas con el backend y documentadas detalladamente en:
  - [docs/business_rules.md](file:///mnt/c/Users/Usuario/Proyectos/baifa-ui/docs/business_rules.md) (Módulos 1 al 5, tarifas, checkpoints y reglas fiscales).
  - [docs/business/diseno_figma.md](file:///mnt/c/Users/Usuario/Proyectos/baifa-ui/docs/business/diseno_figma.md) (Prototipo y flujos de usuario extraídos de Figma).
  - [docs/openapi.yaml](file:///mnt/c/Users/Usuario/Proyectos/baifa-ui/docs/openapi.yaml) (Especificación OpenAPI de los endpoints del backend).

---

## 2. Reglas de Negocio Clave
1. **Roles de Usuario:**
   - \client\: Acceso exclusivo al portal de tracking de sus generadores asociados y reporte de historial.
   - \employee\: Acceso a registro manual de puntos de control / checkpoints y consulta operativa.
   - \manager\: Gestión operativa, asignación de generadores a clientes, reportes globales.
   - \dmin\: Control total (usuarios, clientes fiscales, generadores, checkpoints, auditoría).
2. **Puntos de Control (Checkpoints):**
   - La actualización de estatus es **completamente manual** (nunca automatizada por GPS).
3. **Multi-tenant / Aislamiento:**
   - Un cliente solo puede ver los generadores explícitamente asignados a su RIF / cuenta.

---

## 3. Reglas Técnicas del Frontend (Pendientes de especificación por el usuario)
*(Esta sección se completará con las reglas específicas que proporcione el usuario en el próximo mensaje).*

---

## 4. Flujo Git
- Rama principal de producción: \main\.
- Rama base de desarrollo activo: \develop\.
- Ramas de características: \eature/nombre-de-la-funcionalidad\ partiendo de \develop\.
