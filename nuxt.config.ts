// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  app: {
    head: {
      title: 'Baifa',
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

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000/api',
      authMode: process.env.NUXT_PUBLIC_AUTH_MODE || 'auto',
      authEndpoints: {
        login: process.env.NUXT_PUBLIC_AUTH_LOGIN_ENDPOINT || '/v1/auth/login',
        register: process.env.NUXT_PUBLIC_AUTH_REGISTER_ENDPOINT || '/v1/auth/register',
        me: process.env.NUXT_PUBLIC_AUTH_ME_ENDPOINT || '/v1/auth/me',
        logout: process.env.NUXT_PUBLIC_AUTH_LOGOUT_ENDPOINT || '/v1/auth/logout',
        forgotPassword: process.env.NUXT_PUBLIC_AUTH_FORGOT_PASSWORD_ENDPOINT || '/v1/auth/forgot-password',
        resetPassword: process.env.NUXT_PUBLIC_AUTH_RESET_PASSWORD_ENDPOINT || '/v1/auth/reset-password'
      }
    }
  },

  modules: [
    'vuetify-nuxt-module',
    '@nuxtjs/tailwindcss'
  ],

  vuetify: {
    moduleOptions: {
      prefixComposables: true
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
              primary: '#3eb134',
              'primary-darken-1': '#349b2c',
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
