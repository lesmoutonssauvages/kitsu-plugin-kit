import type { App, Component } from 'vue';
import type { I18n } from 'vue-i18n';
import type { Router, RouteRecordRaw } from 'vue-router';
import type { KitsuPluginScope } from './route-names.js';
/**
 * Minimal view of the host Vuex store. The kit deliberately does not import
 * Vuex's typings: Vuex 4 omits them from its package `exports`, so every
 * consumer would need a `declare module 'vuex'` shim just to read this file.
 * Plugins that want the full typing use `useStore()` from their own Vuex.
 */
export interface KitsuHostStore {
    readonly state: Record<string, any>;
    readonly getters: Record<string, any>;
    commit(type: string, payload?: any): void;
    dispatch(type: string, payload?: any): Promise<any>;
    hasModule(path: string | string[]): boolean;
    registerModule(path: string | string[], module: any): void;
    unregisterModule(path: string | string[]): void;
}
/** A Vuex module, typed loosely for the reason above. */
export type KitsuStoreModuleDefinition = object;
/** Plugin record as served by Zou in `/api/data/user/context`. */
export interface KitsuPluginManifest {
    id: string;
    plugin_id: string;
    name: string;
    description?: string;
    version?: string;
    icon?: string;
    injected: boolean;
    frontend_studio_enabled: boolean;
    frontend_project_enabled: boolean;
    [key: string]: unknown;
}
export type KitsuPluginRoutes = Partial<Record<KitsuPluginScope, RouteRecordRaw[]>>;
export type KitsuPluginMessages = Record<string, Record<string, unknown>>;
/** Handed to the plugin by the host on activation. */
export interface KitsuPluginContext {
    readonly pluginId: string;
    readonly manifest: KitsuPluginManifest;
    readonly app: App;
    readonly router: Router;
    readonly store: KitsuHostStore;
    readonly i18n: I18n;
    readonly head: unknown;
    /** Current `production_id` route param, or null outside a production. */
    readonly productionId: string | null;
    /** Current `episode_id` route param, or null outside an episode. */
    readonly episodeId: string | null;
    /**
     * Vuex module path last registered for this plugin (`kitsu-plugin-<id>`
     * when using `definePlugin({ store })`).
     */
    readonly storeModuleName: string | null;
    /** Registers routes under the matching Kitsu route, per scope. */
    addRoutes(routes: KitsuPluginRoutes): void;
    /** Merges messages into the host i18n instance, keyed by locale. */
    addMessages(messages: KitsuPluginMessages): void;
    registerStoreModule(name: string, module: KitsuStoreModuleDefinition): void;
    /** Runs on deactivation (unload, HMR), in reverse registration order. */
    onCleanup(cleanup: () => void | Promise<void>): void;
}
export interface KitsuPluginDefinition {
    /**
     * Zou plugin id. Optional when the bundle is built with
     * `defineKitsuPluginConfig` (injects `__KITSU_PLUGIN_ID__` from
     * `manifest.toml`). Checked against the host on activation.
     */
    id?: string;
    messages?: KitsuPluginMessages;
    store?: KitsuStoreModuleDefinition;
    routes?: KitsuPluginRoutes;
    /**
     * Components for named host UI slots. The bare slot name replaces host
     * content; `:before` / `:after` suffixes wrap around it
     * (`'action-topbar-menu'`, `'action-topbar-menu:before'`,
     * `'action-topbar-menu:after'`). Applied by the host; not available via
     * context in `setup`.
     */
    slots?: Partial<Record<string, Component>>;
    /**
     * Host provide overrides, keyed by string
     * (e.g. `'ComboboxStatus.sortedTaskStatusList'`). Applied by the host;
     * not available via context in `setup`.
     */
    providers?: Record<string, unknown>;
    setup?: (context: KitsuPluginContext) => void | Promise<void>;
    teardown?: (context: KitsuPluginContext) => void | Promise<void>;
}
/** Raw contract the host expects as the bundle's default export. */
export interface KitsuPlugin {
    id?: string;
    slots?: Partial<Record<string, Component>>;
    providers?: Record<string, unknown>;
    activate(context: KitsuPluginContext): Promise<void>;
    deactivate(context: KitsuPluginContext): Promise<void>;
}
//# sourceMappingURL=types.d.ts.map