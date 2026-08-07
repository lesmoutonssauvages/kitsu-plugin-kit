import type { KitsuPlugin, KitsuPluginDefinition } from './types.js';
/**
 * Declarative wrapper over the raw host contract (`{ activate, deactivate }`).
 * Contributions are applied in dependency order: messages and store first, so
 * route components can already read them when they mount.
 *
 * `id` defaults to `__KITSU_PLUGIN_ID__` injected by `defineKitsuPluginConfig`
 * from the Zou `manifest.toml`.
 */
export declare const definePlugin: (definition: KitsuPluginDefinition) => KitsuPlugin;
//# sourceMappingURL=define.d.ts.map