<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'green' | 'white' | 'dark' | 'light'
  size?: 'sm' | 'md' | 'lg'
}

const {
  variant = 'green',
  size = 'md'
} = defineProps<Props>()

const logoSrc = computed(() => {
  return variant === 'white' || variant === 'light'
    ? '/images/logo-baifa-white.png'
    : '/images/logo-baifa-green.png'
})

const sizeClass = computed(() => {
  switch (size) {
    case 'sm':
      return 'h-6'
    case 'lg':
      return 'h-11'
    case 'md':
    default:
      return 'h-8'
  }
})
</script>

<template>
  <div class="inline-flex items-center select-none">
    <img
      :src="logoSrc"
      alt="BaiFa® Power"
      class="w-auto object-contain"
      :class="sizeClass"
    >
  </div>
</template>
