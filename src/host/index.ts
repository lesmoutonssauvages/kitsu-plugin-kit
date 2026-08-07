import type { App } from 'vue'

import { installPluginRuntime } from './runtime.js'
import { TASK_STATUS_SORT_KEY, taskStatusSortFn } from './task-status-sort.js'
import type { KitsuHost } from './types.js'

export type KitsuPluginsOptions = Omit<KitsuHost, 'app'>

/**
 * Vue plugin that installs the whole injected-plugin runtime, so wiring it
 * into Kitsu is a single `app.use()` in main.js.
 *
 * Register it **before** `app.use(router)`: Vue Router starts its initial
 * navigation during install, and the catch-all deep-link routes must already
 * exist or `…/plugins/:id/…` lands on the global 404.
 */
export const kitsuPlugins = {
  install(app: App, options: KitsuPluginsOptions) {
    app.provide(TASK_STATUS_SORT_KEY, taskStatusSortFn)
    installPluginRuntime({ app, ...options })
  }
}

export { PluginHost } from './components.js'
export { default as PluginsSlot } from './PluginsSlot.vue'
export { activatePlugins } from './runtime.js'
export { getSlotEntries, slotRegistry } from './slots.js'
export { TASK_STATUS_SORT_KEY, taskStatusSortFn } from './task-status-sort.js'
export type { TaskStatusSortFn } from './task-status-sort.js'
export { findPlugin, pluginStates } from './state.js'
export type {
  KitsuHost,
  PluginState,
  PluginStates,
  PluginStatus
} from './types.js'
