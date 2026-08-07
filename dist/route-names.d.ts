export type KitsuPluginScope = 'studio' | 'production' | 'episode';
/**
 * Kitsu route each plugin scope hangs from. Keep these in sync with the
 * matching `name`s in `kitsu/src/router/routes.js`.
 */
export declare const PLUGIN_SCOPE_PARENTS: Record<KitsuPluginScope, string>;
/**
 * Global name the host gives to a plugin route declared as `name` in scope
 * `scope`, e.g. ('my-plugin', 'production', 'bank') -> my-plugin-production-plugin-bank.
 */
export declare const pluginRouteName: (pluginId: string, scope: KitsuPluginScope, name: string) => string;
//# sourceMappingURL=route-names.d.ts.map