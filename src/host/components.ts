/**
 * Renders an injected plugin: its routed views once active, and the load or
 * failure state until then. Kitsu's plugin page mounts this instead of the
 * iframe when the manifest says `injected`.
 */
export { default as PluginHost } from './PluginHost.vue'

/**
 * Placeholder for the catch-all child the runtime registers under each plugin
 * route. A deep link lands here until the plugin has registered its own
 * routes, so it stays blank while loading and only then reports the miss.
 */
export { default as PluginPending } from './PluginPending.vue'
