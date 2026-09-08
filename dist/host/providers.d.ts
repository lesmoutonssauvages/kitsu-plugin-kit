import { type App } from 'vue';
/** Host keys that must be provided before any consumer component mounts. */
export declare const HOST_PROVIDER_KEYS: readonly ["ComboboxStatus.sortedTaskStatusList"];
export declare const installProviders: (app: App, keys?: readonly string[]) => void;
/**
 * Applies a plugin's declarative `providers` map. Last plugin wins per key;
 * cleanup restores `undefined` when that plugin still owns the key.
 */
export declare const applyProviders: (pluginId: string, providers: Record<string, unknown> | undefined, onCleanup: (cleanup: () => void) => void) => void;
//# sourceMappingURL=providers.d.ts.map