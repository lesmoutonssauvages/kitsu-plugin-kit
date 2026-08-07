import type { App } from 'vue';
import type { I18n } from 'vue-i18n';
import type { Router } from 'vue-router';
import type { KitsuHostStore } from '../types.js';
/** The Kitsu singletons the plugin runtime needs. */
export interface KitsuHost {
    app: App;
    router: Router;
    store: KitsuHostStore;
    i18n: I18n;
    head?: unknown;
}
export type PluginStatus = 'loading' | 'active' | 'error';
export interface PluginState {
    status: PluginStatus;
    error: string | null;
}
/** Reactive load status per plugin id, consumed by the host components. */
export type PluginStates = Record<string, PluginState | undefined>;
//# sourceMappingURL=types.d.ts.map