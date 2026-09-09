<script setup lang="ts">
interface Props {
  variant?: 'green' | 'white'
  size?: 'sm' | 'md' | 'lg'
  showSubtitle?: boolean
}

const {
  variant = 'green',
  size = 'md',
  showSubtitle = false
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
  <div class="inline-flex items-center gap-2 select-none">
    <div class="flex items-baseline leading-none font-black italic tracking-tighter" :class="[colorClass, sizeClass]">
      <span>BaiFa</span>
      <span class="text-[0.45em] ml-0.5 font-bold not-italic">®</span>
    </div>

    <div v-if="showSubtitle" class="flex items-center gap-2 pl-2 border-l border-slate-700/80">
      <span class="text-[10px] tracking-widest text-slate-400 font-semibold uppercase not-italic leading-none">
        Logistics Platform
      </span>
    </div>
  </div>
</template>
