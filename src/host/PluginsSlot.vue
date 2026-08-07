<template>
  <component
    :is="entry.component"
    v-for="entry in entries"
    :key="entry.pluginId"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { slotRegistry } from './slots.js'

const props = defineProps<{ slotName: string }>()

// Read directly from slotRegistry.value so Vue tracks the ref dependency.
const entries = computed(() => slotRegistry.value[props.slotName] ?? [])
</script>
