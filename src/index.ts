export {
  PLUGIN_CONTEXT_META_KEY,
  usePluginContext,
  usePluginStore
} from './context.js'
export { definePlugin } from './define.js'
export type { KitsuPluginScope } from './route-names.js'
export type {
  KitsuHostStore,
  KitsuPlugin,
  KitsuPluginContext,
  KitsuPluginDefinition,
  KitsuPluginManifest,
  KitsuPluginMessages,
  KitsuPluginRoutes,
  KitsuStoreModuleDefinition
} from './types.js'
// Host UI helpers (`PluginsSlot`, …) are exported from
// `kitsu-plugin-kit/host` so this entry's .d.ts stays plain TypeScript only.
