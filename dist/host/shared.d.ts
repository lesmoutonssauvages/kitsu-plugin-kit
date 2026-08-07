/**
 * Publishes the packages an injected plugin borrows instead of bundling. A
 * second copy of any of these in the page would get its own reactivity scope
 * and injection keys, so the plugin would see an empty store and a dead
 * router.
 *
 * Plugin builds rewrite their imports of these packages into lookups here, so
 * this has to run before the first plugin module is imported.
 */
export declare const publishSharedModules: () => void;
//# sourceMappingURL=shared.d.ts.map