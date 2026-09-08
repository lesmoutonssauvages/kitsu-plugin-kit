import type { Component } from 'vue';
interface SlotEntry {
    pluginId: string;
    component: Component;
}
/**
 * Reactive registry: slot-name → entries sorted alphabetically by pluginId.
 * Multiple plugins can register components for the same slot; they appear
 * in the order determined by their plugin id (a-z).
 *
 * Uses a ref on a plain object (rather than reactive Map) so that Vue's
 * dependency tracking fires reliably when entries are added or removed.
 */
export declare const slotRegistry: import("vue").Ref<Record<string, SlotEntry[]>, Record<string, SlotEntry[]>>;
export declare const registerSlot: (slotName: string, pluginId: string, component: Component) => void;
export declare const unregisterSlot: (slotName: string, pluginId: string, component: Component) => void;
export {};
//# sourceMappingURL=slots.d.ts.map