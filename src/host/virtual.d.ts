/**
 * Emitted by the `kitsuPluginsDev` Vite plugin: a map of plugin id to a
 * dynamic import of that plugin's source entry. Empty in production builds,
 * where plugins are fetched from Zou as prebuilt bundles.
 */
declare module 'virtual:kitsu-plugins-dev' {
  export const devPlugins: Record<string, () => Promise<unknown>>
}
