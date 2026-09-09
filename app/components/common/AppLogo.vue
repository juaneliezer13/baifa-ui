<script setup lang="ts">
interface Props {
  variant?: 'green' | 'white'
  size?: 'sm' | 'md' | 'lg'
}

const {
  variant = 'green',
  size = 'md'
} = defineProps<Props>()

const colorClass = computed(() => {
  return variant === 'green' ? 'text-[#3eb134]' : 'text-white'
})

const sizeClass = computed(() => {
  switch (size) {
    case 'sm':
      return 'text-xl'
    case 'lg':
      return 'text-4xl'
    case 'md':
    default:
      return 'text-2xl'
  }
})
</script>

<template>
  <div class="inline-flex items-center select-none">
    <div class="flex items-baseline leading-none font-black italic tracking-tighter" :class="[colorClass, sizeClass]">
      <span>BaiFa</span>
      <span class="text-[0.45em] ml-0.5 font-bold not-italic">®</span>
    </div>
  </div>
</template>
