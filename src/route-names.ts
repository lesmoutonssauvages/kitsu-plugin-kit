export type KitsuPluginScope = 'studio' | 'production' | 'episode'

/**
 * Kitsu route each plugin scope hangs from. Keep these in sync with the
 * matching `name`s in `kitsu/src/router/routes.js`.
 */
export const PLUGIN_SCOPE_PARENTS: Record<KitsuPluginScope, string> = {
  studio: 'plugin',
  production: 'production-plugin',
  episode: 'episode-production-plugin'
}

/**
 * Global name the host gives to a plugin route declared as `name` in scope
 * `scope`, e.g. ('my-plugin', 'production', 'bank') -> my-plugin-production-plugin-bank.
 */
export const pluginRouteName = (
  pluginId: string,
  scope: KitsuPluginScope,
  name: string
): string => {
  const parent = PLUGIN_SCOPE_PARENTS[scope]
  if (!parent) {
    throw new Error(`Unknown Kitsu plugin route scope "${scope}".`)
  }
  return `${pluginId}-${parent}-${name}`
}
