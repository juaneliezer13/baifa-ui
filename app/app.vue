<template>
  <v-app>
    <v-main>
      <v-container class="d-flex flex-column align-center justify-center fill-height">
        <v-card elevation="3" class="pa-8 rounded-lg text-center" max-width="540">
          <v-icon icon="mdi-engine" size="72" color="primary" class="mb-4" />
          <h1 class="text-h4 font-weight-bold mb-2">Baifa Power Tracking</h1>
          <p class="text-body-1 text-medium-emphasis mb-6">
            Frontend desacoplado construido con Nuxt 4 y Vuetify 3.
          </p>
          <div class="d-flex justify-center ga-3">
            <v-chip color="success" variant="flat" prepend-icon="mdi-check-circle">
              Nuxt 4 + Vuetify Listo
            </v-chip>
            <v-chip color="primary" variant="outlined" prepend-icon="mdi-shield-account">
              API REST Desacoplada
            </v-chip>
          </div>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>
