# 📋 Libro de Reglas de Negocio, Alcance y Hoja de Ruta - baifa-ui

Este documento es la **fuente única de verdad** de todos los requerimientos, flujos de usuario, pantallas, reglas funcionales y acuerdos comerciales para el desarrollo de la interfaz web frontend de **Baifa Power Tracking**.

---

## 🧭 Hoja de Ruta Comercial Aceptada (5 Etapas Progresivas)

El frontend se desarrolla y entrega bajo una **Metodología de Entregas Progresivas y Funcionales** dividida en 5 etapas consecutivas (Total acordado: **,500.00 USD** | Tiempo estimado: **12 a 16 semanas**):

| Etapa | Módulo / Entregable Principal | Alcance Funcional en Frontend | Inversión Acordada | Anticipo (60%) | Cierre (40%) | Estado |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| **1** | **Accesos y Directorio** | Vistas de Autenticación, Control de Roles, Guards de Navegación y Directorio Fiscal de Clientes. | .00 USD | .00 | .00 | 🟡 **[En Progreso]** |
| **2** | **Catálogo de Inventario** | Catálogo de Inventario, Ficha de Generadores, seriales únicos y cargador/preview de fotos. | .00 USD | .00 | .00 | 🔴 **[Planificado]** |
| **3** | **Puntos de Control** | Modales de Checkpoints, Órdenes de Envío y actualización manual de ruta. | .00 USD | .00 | .00 | 🔴 **[Planificado]** |
| **4** | **Bitácora Histórica** | Línea de tiempo cronológica (Timeline) interactiva con trazabilidad de movimientos. | .00 USD | .00 | .00 | 🔴 **[Planificado]** |
| **5** | **Dashboard y Reportes** | Portal de Autoconsulta para Clientes y Tablero de Reportes Generales de Supervisión con métricas y KPIs. | .00 USD | .00 | .00 | 🔴 **[Planificado]** |
| **TOTAL** | **Sistema Integral Operativo** | **Interfaz Web Completa (Vue.js 3 + Nuxt 4 + Vuetify 3)** | **,500.00 USD** | **.00** | **.00** | **10% Avance** |

---

## 📜 Protocolo de Aceptación y Reglas Comerciales
* **Criterio de Avance:** No se inicia una etapa nueva si la anterior no está probada y validada al 100% por el cliente.
* **Flujo Financiero:** Cada etapa contempla un 60% al inicio y un 40% contra entrega demostrada y aprobada.
* **Alcance Exclusivo:** El servicio contempla diseño de interfaz, experiencia de usuario (UI/UX) y desarrollo del código fuente del frontend en Vue 3 / Nuxt 4 / Vuetify 3. No incluye costos de hosting ni dominios.

---

## 📦 Detalle de Reglas de Negocio por Módulo (Frontend)

### 🔹 ETAPA 1: Control de Accesos y Directorio de Clientes

#### Módulo 1.1: Autenticación, Control de Roles y Navegación
* **RN-AUTH-01 [Jerarquía de Roles en UI]:**
  * client (Cliente): Redirección directa al portal de consulta y visualización exclusiva de sus generadores asociados.
  * employee (Empleado): Acceso operativo al catálogo y actualización manual de checkpoints.
  * manager (Jefe / Gerente): Acceso a supervisión operativa, asignación de equipos y reportes ejecutivos.
  * dmin (Administrador): Control total de interfaces (usuarios, clientes, equipos, checkpoints y auditoría).
* **RN-AUTH-02 [Registro Público]:** Formulario de registro público asigna por defecto el perfil client.
* **RN-AUTH-03 [Gestión de Sesión]:** Almacenamiento seguro del token de acceso, interceptores para adjuntar credenciales en peticiones, expiración de sesión y redirección automática a la vista de login.
* **RN-AUTH-04 [Etiquetas en Español]:** Todas las vistas deben mostrar los nombres de roles, estatus y mensajes de alerta en español amigable.

#### Módulo 1.2: Ficha Fiscal y Directorio de Clientes
* **RN-CLI-01 [Vistas de Clientes]:** Tabla con buscador interactivo, paginación, filtros por estado (Activo/Inactivo) y modales de alta/edición.
* **RN-CLI-02 [Campos Obligatorios de la Ficha Fiscal]:**
  * Razón Social (nombre legal según registro fiscal).
  * Nombre Corto / Comercial de la empresa.
  * Número de RIF (validación visual en tiempo real de formato venezolano: J, G, V, E).
  * Teléfono de oficinas.
  * Persona de Contacto: Nombre completo, Email de contacto y Teléfono directo.
  * Estatus de activación (Switch Activo / Inactivo).
* **RN-CLI-03 [Vinculación en UI]:** Selector reactivo para asociar una ficha de cliente a cuentas de usuario registradas con rol client.
* **RN-CLI-04 [Permisos en Menú y Rutas]:** Los ítems de navegación hacia el directorio de clientes solo deben ser visibles para personal interno (employee, manager, dmin).

---

### 🔹 ETAPA 2: Catálogo de Inventario y Ficha de Generadores

* **RN-GEN-01 [Formulario de Salida e Ingreso de Generadores]:**
  * Campo de Serial de fábrica único (con validación de formato).
  * Selector reactivo de Cliente asignado (cargado desde el directorio fiscal).
  * Selector de Fecha estimada de llegada (ETA) mediante componente date-picker.
  * Componente de carga y previsualización (preview) de fotografía referencial del generador.
  * Capacidad (kVA) y modelo del generador.
* **RN-GEN-02 [Indicadores Visuales de Estado (Chips / Badges)]:**
  * warehouse (En almacén)
  * in_transit (En tránsito)
  * checkpoint (En punto de control)
  * delivered (Entregado en locación)
  * installed (Instalado y operativo)
  Cada estado debe mostrar su respectivo color distintivo e icono acorde a la guía de estilos de Figma.

---

### 🔹 ETAPA 3: Puntos de Control y Órdenes de Envío

* **RN-TRK-01 [Operación 100% Manual]:** La plataforma no utiliza mapas automáticos con GPS ni telemetría automatizada. Los avances y cambios de estado son operados de forma estrictamente manual por los operadores autorizados.
* **RN-TRK-02 [Modal de Registro de Checkpoint]:** Diálogo modal reactivo para operadores con:
  * Selector del nuevo estado del equipo.
  * Nombre del punto de control (ej. *Punto de Control Valencia*, *Alcabala Guacara*).
  * Selector de fecha y hora del evento.
  * Campo de notas y observaciones (transportista, placa, incidencias).

---

### 🔹 ETAPA 4: Bitácora Histórica y Registro de Trazabilidad

* **RN-BIT-01 [Línea de Tiempo Cronológica (Timeline)]:**
  * Componente visual de línea de tiempo interactivo ordenado cronológicamente.
  * Presenta: punto de control, estado alcanzado, fecha/hora formateada, nombre del usuario que registró el evento y notas descriptivas.
  * Bloqueo de edición sobre eventos pasados para garantizar fidelidad del historial mostrado.

---

### 🔹 ETAPA 5: Portal de Clientes y Tablero de Reportes

* **RN-PRT-01 [Vista Exclusiva de Clientes]:** Pantalla limpia y amigable donde los clientes acceden a su lista de generadores sin visualización de equipos de otras empresas.
* **RN-PRT-02 [Buscador y Detalle de Tracking]:** Barra de búsqueda por serial con despliegue instantáneo de la ficha del generador y su línea de tiempo.
* **RN-REP-01 [Dashboard y Reportes de Supervisión]:**
  * Tarjetas con indicadores clave (KPIs): Generadores activos, en almacén, en tránsito, entregados y total de clientes.
  * Pipeline visual de estados.
  * Tablas filtrables con opción de exportación para roles manager y dmin.

---

## 🎨 Referencia Visual UI/UX (Figma)
* **URL del Prototipo:** [https://layer-ethics-21492417.figma.site](https://layer-ethics-21492417.figma.site)
* **Guía Detallada de Pantallas y Componentes:** [docs/business/diseno_figma.md](business/diseno_figma.md)
