import type { KitsuPluginManifest } from '../types.js';
import type { KitsuHost, PluginStates } from './types.js';
/**
 * Shared between the runtime and the host components. Kept apart from both so
 * the components do not have to import the runtime, which would make the two
 * modules circular.
 */
export declare const pluginStates: PluginStates;
export declare const setHost: (value: KitsuHost) => void;
export declare const getHost: () => KitsuHost | null;
export declare const listInjectedPlugins: () => KitsuPluginManifest[];
export declare const findPlugin: (pluginId: string) => KitsuPluginManifest | undefined;
//# sourceMappingURL=state.d.ts.map