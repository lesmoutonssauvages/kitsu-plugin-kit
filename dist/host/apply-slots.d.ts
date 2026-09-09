import type { Component } from 'vue';
/**
 * Applies a plugin's declarative `slots` map. Bare keys replace host content;
 * `:before` / `:after` suffixes wrap around it. Cleanup unregisters on
 * deactivate.
 */
export declare const applySlots: (pluginId: string, slots: Partial<Record<string, Component>> | undefined, onCleanup: (cleanup: () => void) => void) => void;
//# sourceMappingURL=apply-slots.d.ts.map