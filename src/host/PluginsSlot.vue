<template>
  <component v-if="is" :is="is" v-bind="attrs">
    <component
      :is="entry.component"
      v-for="entry in beforeEntries"
      :key="`before-${entry.pluginId}`"
    />
    <slot />
    <component
      :is="entry.component"
      v-for="entry in afterEntries"
      :key="`after-${entry.pluginId}`"
    />
  </component>
  <template v-else>
    <component
      :is="entry.component"
      v-for="entry in beforeEntries"
      :key="`before-${entry.pluginId}`"
    />
    <slot />
    <component
      :is="entry.component"
      v-for="entry in afterEntries"
      :key="`after-${entry.pluginId}`"
    />
  </template>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import type { Component } from 'vue'

import { slotRegistry } from './slots.js'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  slotName: string
  /** Wrapper element or component (e.g. `'div'`). Omit for a fragment. */
  is?: string | Component
}>()

const attrs = useAttrs()

const beforeEntries = computed(
  () => slotRegistry.value[`${props.slotName}:before`] ?? []
)
const afterEntries = computed(
  () => slotRegistry.value[`${props.slotName}:after`] ?? []
)
</script>
