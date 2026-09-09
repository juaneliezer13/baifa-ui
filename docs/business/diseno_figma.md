# 🎨 Sistema de Diseño Oficial extraído del Prototipo de Figma (Figma Make)

* **URL del Prototipo Oficial:** [https://layer-ethics-21492417.figma.site](https://layer-ethics-21492417.figma.site)
* **Nombre de la Aplicación:** *Baifa*
* **Tema Visual:** Dark Modern UI (Slate 950 / Deep Navy con acentos Verde Baifa #3eb134)
* **Capturas de Pantalla en Alta Resolución:** [docs/screenshots/](../screenshots/)

---

## 📸 Galería de Pantallas y Modales Capturados

| Vista / Pantalla | Archivo de Captura | Descripción Visual |
| :--- | :--- | :--- |
| **01. Panel de Control (Dashboard)** | [docs/screenshots/01_dashboard.png](../screenshots/01_dashboard.png) | Vista general con 5 tarjetas KPI superiores, pipeline de 5 fases, tabla de generadores recientes y widget de usuarios activos. |
| **02. Generadores (Listado)** | [docs/screenshots/02_generadores_lista.png](../screenshots/02_generadores_lista.png) | Tabla completa con buscador, filtros por estatus (chips), botón primario + Registrar generador y acciones por fila. |
| **03. Modal Registrar Generador** | [docs/screenshots/03_modal_registrar_generador.png](../screenshots/03_modal_registrar_generador.png) | Diálogo modal con campos: Serial (*), Cliente (*), Fecha estimada (*), URL foto referencial, notas de warehouse y botones Cancelar / Registrar. |
| **04. Modal Actualizar Estado** | [docs/screenshots/04_modal_actualizar_estado.png](../screenshots/04_modal_actualizar_estado.png) | Modal para operadores: Badge de estado actual, selector del nuevo estado (*), campo de notas de checkpoint (*) y botón Guardar cambio. |
| **05. Clientes (Directorio Fiscal)** | [docs/screenshots/05_clientes_lista.png](../screenshots/05_clientes_lista.png) | Tabla fiscal: Razón Social, RIF, Teléfono oficina, Persona de contacto, Email, Teléfono directo, Badge Activo/Inactivo y acciones. |
| **06. Modal Nuevo Cliente** | [docs/screenshots/06_modal_nuevo_cliente.png](../screenshots/06_modal_nuevo_cliente.png) | Modal estructurado en dos bloques: Datos de la empresa (Razón social, Nombre corto, RIF, Teléfono) y Persona de Contacto (Nombre, Email, Teléfono). |
| **07. Rastrear Generador (Buscador)** | [docs/screenshots/07_rastrear_generador.png](../screenshots/07_rastrear_generador.png) | Buscador centrado con chips de seriales de ejemplo (GEN-2026-0041, GEN-2026-0039, etc.). |
| **08. Rastrear Generador (Timeline)** | [docs/screenshots/07_rastrear_timeline_detalle.png](../screenshots/07_rastrear_timeline_detalle.png) | Ficha expandida con foto del generador, métricas (Cliente, ETA, Registro) y Timeline vertical con paradas, notas y autor del cambio. |
| **09. Usuarios del Sistema** | [docs/screenshots/08_usuarios.png](../screenshots/08_usuarios.png) | Listado de colaboradores con avatar circular, email, cargo/rol badge y estado. |
| **10. Modal Nuevo Usuario** | [docs/screenshots/08_modal_nuevo_usuario.png](../screenshots/08_modal_nuevo_usuario.png) | Modal de asignación de roles con tarjeta explicativa dinámica de permisos según el rol seleccionado. |
| **11. Tablero de Reportes** | [docs/screenshots/09_reportes.png](../screenshots/09_reportes.png) | Segmentación por Generadores / Clientes / Usuarios con tarjetas de porcentaje y tablas separadas de activos vs inactivos. |

---

## 🎨 Especificación de Tokens de Diseño

### 1. Tipografía
* **Familia Primaria:** 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif.
* **Escala de Tamaños:**
  * Títulos de Página: 	ext-2xl a 	ext-3xl (ont-bold, color #f1f5f9).
  * Subtítulos de Página: 	ext-sm (ont-normal, color #64748b - Slate 500).
  * Títulos de Tarjetas / Modales: 	ext-lg (ont-semibold o ont-bold, color #f8fafc).
  * Texto de Cuerpo / Tablas: 	ext-sm (ont-normal, color #cbd5e1 - Slate 300).
  * Etiquetas de Campos / Metadatos: 	ext-xs (ont-semibold, uppercase, tracking-wider, color #64748b).

### 2. Paleta de Colores Oficial (Tema Oscuro Slate / Navy)
* **Fondo Principal de la Aplicación (ody / -main):** #0b1120 (gb(11, 17, 32)).
* **Barra Lateral (Sidebar / -navigation-drawer):** #0f172a (gb(15, 23, 42)), con borde derecho 1px solid #1e293b.
* **Fondo de Tarjetas (Cards):** #131d31 / #0f172a con borde 1px solid #1e293b y ounded-xl (12px - 16px).
* **Fondo de Diálogos Modales:** #111827 (gb(17, 24, 39)) con borde 1px solid rgba(255, 255, 255, 0.08) y ounded-2xl (16px).
* **Fondo de Inputs y Selectores:** #161e31 con borde #334155 (order-slate-700) y radio 10px. Focus con anillo #f97316.
* **Color de Acento Primario (Brand Orange):** #f97316 (gb(249, 115, 22)).

### 3. Paleta Semántica de Estatus (Chips y Badges)
| Estado | Fondo Chip | Texto Chip | Punto Indicador |
| :--- | :--- | :--- | :--- |
| **En Warehouse** | gba(168, 85, 247, 0.12) | #c084fc (Purple 400) | #c084fc |
| **En Tránsito** | gba(56, 189, 248, 0.12) | #38bdf8 (Sky 400) | #38bdf8 |
| **En Punto de Control** | gba(251, 191, 36, 0.12) | #fbbf24 (Amber 400) | #fbbf24 |
| **Entregado** | gba(52, 211, 153, 0.12) | #34d399 (Emerald 400) | #34d399 |
| **Instalado** | gba(74, 222, 128, 0.12) | #4ade80 (Green 400) | #4ade80 |
| **Activo** | gba(16, 185, 129, 0.15) | #34d399 (Emerald 400) | N/A |
| **Inactivo** | gba(100, 116, 139, 0.15) | #94a3b8 (Slate 400) | N/A |

### 4. Estilos de Botones
* **Botón Primario de Acción (+ Registrar generador, + Nuevo cliente, Crear cliente, Guardar cambio):**
  * Fondo: #f97316 (Orange 500). Hover: #ea580c (Orange 600).
  * Texto: Blanco #ffffff, ont-semibold, tamaño 14px.
  * Radio: 10px (ounded-xl).
  * Sombra: shadow-md shadow-orange-500/20.
* **Botón Secundario (Cancelar):**
  * Fondo: #1e293b (Slate 800). Borde: 1px solid rgba(255, 255, 255, 0.08).
  * Texto: #cbd5e1 (Slate 300).
* **Botón de Acción en Filas (Actualizar):**
  * Pill con borde suave y texto naranja #f97316 o badge interactivo.

### 5. Estructura de la Barra de Navegación Lateral (Sidebar)
* **Encabezado:**
  * Logo: Cuadro verde #3eb134 de 36x36px con bordes redondeados (10px) e icono de rayo blanco (mdi-flash) junto al texto **Baifa** (\text-base font-bold text-white).
* **Menú de 6 Secciones:**
  1. Dashboard (mdi-view-dashboard-outline)
  2. Rastrear (mdi-magnify)
  3. Generadores (mdi-engine-outline / mdi-flash-outline)
  4. Clientes (mdi-account-group-outline)
  5. Usuarios (mdi-shield-account-outline)
  6. Reportes (mdi-chart-bar)
* **Estado Activo en Menú:** Fondo naranja translúcido gba(249, 115, 22, 0.12), texto #f97316, radio 12px y un punto indicador naranja (•) en el extremo derecho.
* **Pie del Menú:**
  * Avatar circular con fondo naranja e iniciales (ej. AM).
  * Nombre de usuario en texto blanco (Adriana Morales).
  * Badge del rol de usuario en rojo oscuro / vino (Superadministrador).
