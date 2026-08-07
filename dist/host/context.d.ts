import type { KitsuPluginContext, KitsuPluginManifest } from '../types.js';
import type { KitsuHost } from './types.js';
export interface PluginContextHandle {
    context: KitsuPluginContext;
    dispose: () => Promise<void>;
}
export declare const createPluginContext: (host: KitsuHost, plugin: KitsuPluginManifest) => PluginContextHandle;
//# sourceMappingURL=context.d.ts.map