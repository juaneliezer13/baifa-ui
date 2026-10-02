<script setup lang="ts">
import type { GeneratorStatus } from '~~/types/generator'

const props = defineProps<{
  status: GeneratorStatus | string
}>()

const { getStatusConfig } = useGenerators()
const config = computed(() => getStatusConfig(props.status))
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide transition-all shadow-sm"
    :class="config.bgClass"
  >
    <v-icon :icon="config.icon" size="14" class="shrink-0" />
    <span>{{ config.label }}</span>
  </span>
</template>
