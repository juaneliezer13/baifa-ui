<script setup lang=ts>
interface SystemStatus {
  framework: string
  uiLibrary: string
  styling: string
  language: string
  ready: boolean
}

const status = ref<SystemStatus>({
  framework: 'Nuxt 4',
  uiLibrary: 'Vuetify 3',
  styling: 'Tailwind CSS',
  language: 'TypeScript 2026',
  ready: true
})
</script>

<template>
  <v-app>
    <v-main class=bg-slate-50 min-h-screen>
      <v-container class=flex flex-col items-center justify-center min-h-screen py-12>
        <v-card elevation=4 class=p-8 rounded-2xl text-center max-w-lg shadow-xl border border-slate-200>
          <div class=mb-4 inline-flex p-4 rounded-full bg-sky-100 text-sky-600>
            <v-icon icon=mdi-engine size=56 />
          </div>
          <h1 class=text-2xl font-bold tracking-tight text-slate-800 mb-2>
            Baifa Power Tracking
          </h1>
          <p class=text-sm text-slate-500 mb-6 leading-relaxed>
            Frontend desacoplado construido bajo los estándares modernos de 2026.
          </p>

          <div class=grid grid-cols-2 gap-3 mb-6>
            <div class=p-3 bg-slate-100 rounded-lg text-left>
              <span class=text-xs text-slate-400 uppercase font-semibold block>Framework</span>
              <span class=text-sm font-medium text-slate-700>{{ status.framework }}</span>
            </div>
            <div class=p-3 bg-slate-100 rounded-lg text-left>
              <span class=text-xs text-slate-400 uppercase font-semibold block>Componentes</span>
              <span class=text-sm font-medium text-slate-700>{{ status.uiLibrary }}</span>
            </div>
            <div class=p-3 bg-slate-100 rounded-lg text-left>
              <span class=text-xs text-slate-400 uppercase font-semibold block>Utilidades CSS</span>
              <span class=text-sm font-medium text-slate-700>{{ status.styling }}</span>
            </div>
            <div class=p-3 bg-slate-100 rounded-lg text-left>
              <span class=text-xs text-slate-400 uppercase font-semibold block>Lenguaje</span>
              <span class=text-sm font-medium text-slate-700>{{ status.language }}</span>
            </div>
          </div>

          <v-chip color=success variant=flat prepend-icon=mdi-check-decagram class=font-semibold px-4>
            Stack Frontend Configurado
          </v-chip>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>
