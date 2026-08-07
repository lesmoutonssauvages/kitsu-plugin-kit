import vue from '@vitejs/plugin-vue';
import type { ServerOptions, UserConfig } from 'vite';
export { kitsuInlineCss, type KitsuInlineCssOptions } from './inline-css.js';
export { readManifestPluginId } from './manifest-id.js';
export { DEFAULT_SHARED_DEPS, SHARED_GLOBAL, kitsuSharedDeps, type KitsuSharedDepsOptions } from './shared-deps.js';
type VueOptions = Parameters<typeof vue>[0];
/** URL Zou serves the plugin `dist/` folder from. */
export declare const kitsuPluginBase: (pluginId: string) => string;
export interface KitsuPluginConfigOptions {
    /**
     * Zou plugin id. Defaults to `id` in the parent `manifest.toml` (next to
     * the frontend package).
     */
    pluginId?: string;
    /** Bundle entry, default `src/index.ts`. */
    entry?: string;
    /** Packages borrowed from the host, default `DEFAULT_SHARED_DEPS`. */
    shared?: string[];
    /** Plugin root used to resolve shared packages, default the Vite root. */
    root?: string;
    vue?: VueOptions;
    /**
     * Dev-server overrides. Defaults open CORS so Kitsu (another origin) can
     * `import()` this entry, and listen on every interface for Docker.
     */
    server?: ServerOptions;
}
/**
 * Vite config for an injected Kitsu plugin: a single ESM entry at
 * `dist/plugin.js` with its stylesheet inlined and Vue, the router, the store
 * and i18n borrowed from the host.
 *
 * `pnpm dev` serves the same entry from source so Kitsu can load it over HTTP
 * (`KITSU_PLUGIN_DEV_URLS`) with HMR on this Vite instance.
 *
 * Injects `__KITSU_PLUGIN_ID__` so `definePlugin()` can omit `id`.
 */
export declare const defineKitsuPluginConfig: (options?: KitsuPluginConfigOptions) => UserConfig;
//# sourceMappingURL=index.d.ts.map