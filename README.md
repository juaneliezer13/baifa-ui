# baifa-ui ⚡

Interfaz web frontend para **BaiFa Power Tracking** (Sistema de Rastreo Logístico y Gestión Técnica de Generadores Eléctricos Industriales).

## 🚀 Tecnologías

- **Framework:** Nuxt 4 + Vue 3 (Composition API, `<script setup lang="ts">`)
- **UI & Estilos:** Vuetify 3 + Tailwind CSS (`preflight: false`) + Material Design Icons (`@mdi/font`)
- **Contenedores:** Docker & Docker Compose (Multi-stage Node 20 Alpine)

---

## 🌐 Puertos y Conexión en Entorno Local

| Componente | Puerto Host Local | URL |
| :--- | :---: | :--- |
| **Frontend Web (`baifa-ui`)** | **`15001`** | `http://localhost:15001` |
| **Backend API (`baifa-api`)** | **`14001`** | `http://localhost:14001/api` |
| **Base de Datos MySQL** | **`14002`** | `127.0.0.1:14002` |

---

## 🐳 Ejecución Local con Docker

Asegúrate de haber levantado primero `baifa-api` (que crea la red `baifa-api_baifa_network`):

```bash
cp .env.example .env
docker compose up -d --build
```

Acceder en el navegador a: **`http://localhost:15001`**

---

## 🛠️ Desarrollo Local con Node.js

Si dispones de Node.js 20+ en el host:

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo en puerto 15001
PORT=15001 npm run dev

# Compilar para producción
npm run build
```

---

## 📚 Documentación y Notas de Versión

Toda la documentación funcional, guías de despliegue y notas de lanzamiento están centralizadas en:
- [`../baifa-docs/README.md`](../baifa-docs/README.md)
- [`../baifa-docs/releases/README.md`](../baifa-docs/releases/README.md)
