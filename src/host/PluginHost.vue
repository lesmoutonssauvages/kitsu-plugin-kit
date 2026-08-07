<template>
  <div>
    <p
      v-if="state?.status === 'error'"
      class="kitsu-plugin-message"
      :style="ERROR_STYLE"
    >
      {{ translate('plugins.load_error', name) }}
      <span :style="DETAIL_STYLE">{{ state.error ?? '' }}</span>
    </p>
    <p
      v-else-if="state?.status !== 'active'"
      class="kitsu-plugin-message"
      :style="MESSAGE_STYLE"
    >
      {{ translate('main.loading', name) }}
    </p>
    <RouterView v-else />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterView } from 'vue-router'

import {
  DETAIL_STYLE,
  ERROR_STYLE,
  MESSAGE_STYLE,
  pluginName,
  translate,
  usePluginId
} from './plugin-ui.js'
import { pluginStates } from './state.js'

defineOptions({ name: 'KitsuPluginHost' })

const pluginId = usePluginId()
const state = computed(() => pluginStates[pluginId.value])
const name = computed(() => pluginName(pluginId.value))
</script>
