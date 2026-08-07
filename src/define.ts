import type {
  KitsuPlugin,
  KitsuPluginContext,
  KitsuPluginDefinition
} from './types.js'

declare const __KITSU_PLUGIN_ID__: string | undefined

const resolvePluginId = (explicit?: string): string | undefined => {
  if (explicit) return explicit
  return typeof __KITSU_PLUGIN_ID__ === 'string' && __KITSU_PLUGIN_ID__
    ? __KITSU_PLUGIN_ID__
    : undefined
}

/**
 * Declarative wrapper over the raw host contract (`{ activate, deactivate }`).
 * Contributions are applied in dependency order: messages and store first, so
 * route components can already read them when they mount.
 *
 * `id` defaults to `__KITSU_PLUGIN_ID__` injected by `defineKitsuPluginConfig`
 * from the Zou `manifest.toml`.
 */
export const definePlugin = (
  definition: KitsuPluginDefinition
): KitsuPlugin => {
  const { messages, store, routes, slots, taskStatusSort, setup, teardown } =
    definition
  const id = resolvePluginId(definition.id)

  const plugin: KitsuPlugin = {
    id,

    async activate(context: KitsuPluginContext) {
      const resolvedId = id ?? context.pluginId
      if (!resolvedId) {
        throw new Error(
          'definePlugin: missing plugin id. Use defineKitsuPluginConfig() (reads ../manifest.toml) or pass id explicitly.'
        )
      }
      if (id && id !== context.pluginId) {
        throw new Error(
          `plugin id mismatch: the bundle declares "${id}" but the host loaded it as "${context.pluginId}"`
        )
      }
      if (messages) context.addMessages(messages)
      if (store) {
        context.registerStoreModule(`kitsu-plugin-${context.pluginId}`, store)
      }
      if (routes) context.addRoutes(routes)
      if (slots) {
        for (const [slotName, component] of Object.entries(slots)) {
          if (component) context.registerSlot(slotName, component)
        }
      }
      if (taskStatusSort) context.registerTaskStatusSort(taskStatusSort)
      await setup?.(context)
    },

    async deactivate(context: KitsuPluginContext) {
      await teardown?.(context)
    }
  }

  // When the plugin runs on its own Vite instance, accept the entry so the
  // host can deactivate/reactivate instead of leaving a half-updated module.
  if (import.meta.hot) {
    const hotId = id
    if (!hotId) {
      console.warn(
        '[plugins] HMR disabled: missing plugin id (defineKitsuPluginConfig / definePlugin id)'
      )
    } else {
      import.meta.hot.accept(module => {
        const reload = (
          globalThis as {
            __KITSU_PLUGIN_RELOAD__?: (
              pluginId: string,
              next: unknown
            ) => Promise<void>
          }
        ).__KITSU_PLUGIN_RELOAD__
        void reload?.(hotId, module)
      })
    }
  }

  return plugin
}
