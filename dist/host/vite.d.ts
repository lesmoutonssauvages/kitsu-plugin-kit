import { type Plugin } from 'vite';
export interface KitsuPluginsDevOptions {
    /** Defaults to the KITSU_PLUGIN_DEV_PATHS environment variable. */
    paths?: string;
    /**
     * Comma-separated `id=url` pairs pointing at each plugin's own Vite server
     * entry (e.g. `my-plugin=http://127.0.0.1:5173/src/index.ts`). Takes
     * precedence over filesystem discovery when both are set.
     * Defaults to KITSU_PLUGIN_DEV_URLS.
     */
    urls?: string;
}
/**
 * Discovers plugin frontends for development.
 *
 * Prefer a separate Vite instance per plugin (`KITSU_PLUGIN_DEV_URLS`): the
 * host then `import()`s each entry over HTTP and that Vite owns HMR. The
 * optional `KITSU_PLUGIN_DEV_PATHS` mode still compiles plugin sources inside
 * Kitsu's own Vite when a single graph is more convenient.
 *
 * Always installs the virtual module the host runtime imports (empty when
 * nothing is configured).
 */
export declare const kitsuPluginsDev: ({ paths, urls }?: KitsuPluginsDevOptions) => Plugin;
//# sourceMappingURL=vite.d.ts.map