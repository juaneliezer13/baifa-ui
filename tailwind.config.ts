import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  corePlugins: {
    // Desactivar preflight para evitar conflictos con los estilos base de Vuetify
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        baifa: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          900: '#0c4a6e',
        }
      }
    }
  }
}
