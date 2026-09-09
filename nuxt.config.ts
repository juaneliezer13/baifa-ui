// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  app: {
    head: {
      title: 'Baifa - Logistics Platform',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Sistema de Rastreo Logístico y Gestión de Generadores Eléctricos - BaiFa' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap' }
      ]
    }
  },

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
        defaultTheme: 'dark',
        themes: {
          dark: {
            dark: true,
            colors: {
              background: '#0b1120',
              surface: '#0f172a',
              primary: '#f97316',
              'primary-darken-1': '#ea580c',
              secondary: '#1e293b',
              'surface-variant': '#131d31',
              error: '#ef4444',
              info: '#38bdf8',
              success: '#34d399',
              warning: '#fbbf24',
            }
          }
        }
      }
    }
  }
})
