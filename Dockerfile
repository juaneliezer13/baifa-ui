# Dockerfile de producción para baifa-ui (Nuxt 4 + Vuetify 3)
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Copia los artefactos ya compilados por npm run build
COPY .output ./.output
COPY package*.json ./

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]

