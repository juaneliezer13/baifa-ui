import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  corePlugins: {
    // Desactivar preflight para convivir limpiamente con Vuetify 3
    preflight: false,
  },
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        baifa: {
          bg: '#0b1120',
          sidebar: '#0f172a',
          card: '#131d31',
          input: '#161e31',
          border: '#1e293b',
          orange: '#f97316',
          orangeHover: '#ea580c',
        }
      }
    }
  }
}
