import type { Component } from 'vue';
/**
 * Applies a plugin's declarative `slots` map. Keys may include position
 * suffixes (`name:before`, `name:after`). Cleanup unregisters on deactivate.
 */
export declare const applySlots: (pluginId: string, slots: Partial<Record<string, Component>> | undefined, onCleanup: (cleanup: () => void) => void) => void;
//# sourceMappingURL=apply-slots.d.ts.map