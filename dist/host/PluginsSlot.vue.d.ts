import type { Component } from 'vue';
type __VLS_Props = {
    slotName: string;
    /** Wrapper element or component (e.g. `'div'`). Omit for a fragment. */
    is?: string | Component;
};
declare var __VLS_13: {}, __VLS_30: {};
type __VLS_Slots = {} & {
    default?: (props: typeof __VLS_13) => any;
} & {
    default?: (props: typeof __VLS_30) => any;
};
declare const __VLS_base: import("vue", { with: { "resolution-mode": "import" } }).DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue", { with: { "resolution-mode": "import" } }).ComponentOptionsMixin, import("vue", { with: { "resolution-mode": "import" } }).ComponentOptionsMixin, {}, string, import("vue", { with: { "resolution-mode": "import" } }).PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {}, {}, {}, {}, string, import("vue", { with: { "resolution-mode": "import" } }).ComponentProvideOptions, false, {}, any>;
declare const __VLS_export: __VLS_WithSlots<typeof __VLS_base, __VLS_Slots>;
declare const _default: typeof __VLS_export;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
//# sourceMappingURL=PluginsSlot.vue.d.ts.map