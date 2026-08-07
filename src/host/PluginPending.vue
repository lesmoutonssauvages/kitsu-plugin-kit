<template>
  <p v-if="isSettled" class="kitsu-plugin-message" :style="MESSAGE_STYLE">
    {{ translate('plugins.page_not_found', name) }}
  </p>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import {
  MESSAGE_STYLE,
  pluginName,
  translate,
  usePluginId
} from './plugin-ui.js'
import { pluginStates } from './state.js'

defineOptions({ name: 'KitsuPluginPending' })

const pluginId = usePluginId()
const isSettled = computed(
  () => pluginStates[pluginId.value]?.status !== 'loading'
)
const name = computed(() => pluginName(pluginId.value))
</script>
