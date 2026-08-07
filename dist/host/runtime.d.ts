import type { KitsuHost } from './types.js';
/**
 * Prefetches every injected plugin without blocking the caller. Used when the
 * store first receives the plugin list; navigation uses `ensurePlugin` instead
 * so one dead Vite URL cannot freeze the router.
 */
export declare const activatePlugins: () => void;
/**
 * Wires the plugin runtime into Kitsu: shared modules, i18n, the catch-all
 * routes, the navigation guard, and a non-blocking prefetch of injected
 * plugins once the list reaches the store.
 */
export declare const installPluginRuntime: (host: KitsuHost) => void;
//# sourceMappingURL=runtime.d.ts.map