// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  typescript: {
    strict: true
  },

  modules: [
    'vuetify-nuxt-module',
    '@nuxtjs/tailwindcss'
  ],

  vuetify: {
    moduleOptions: {
      /* opciones específicas del módulo */
    },
    vuetifyOptions: {
      theme: {
        defaultTheme: 'light'
      }
    }
  }
})
