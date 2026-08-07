import { type ComputedRef } from 'vue';
import type { KitsuPluginContext } from './types.js';
/**
 * The host stamps the plugin context on the `meta` of every route it registers
 * for that plugin. Vue Router merges `meta` across matched records, so nested
 * plugin views inherit it without any provide/inject plumbing.
 */
export declare const PLUGIN_CONTEXT_META_KEY = "kitsuPlugin";
export declare const usePluginContext: () => ComputedRef<KitsuPluginContext | null>;
/**
 * The plugin's own Vuex module, without the host path prefix. `commit` /
 * `dispatch` are no-ops until the module is registered.
 */
export declare const usePluginStore: <S = unknown>() => {
    state: ComputedRef<S | undefined>;
    commit: (type: string, payload?: unknown) => void;
    dispatch: (type: string, payload?: unknown) => Promise<unknown>;
};
//# sourceMappingURL=context.d.ts.map