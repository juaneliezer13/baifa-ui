# ==============================================================================
# Dockerfile Multietapa para baifa-ui (Nuxt 4 + Vue 3 + Vuetify 3)
# ==============================================================================

# Etapa 1: Construcción (Builder)
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: Ejecución en Producción (Runner)
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/.output ./.output
COPY package*.json ./

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
