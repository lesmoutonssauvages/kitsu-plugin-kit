/**
 * Global the host publishes its shared module instances on, and that plugin
 * bundles read them back from. Defined apart from the Vite plugin that emits
 * the lookups so the browser side can use it without pulling in Node code.
 */
export const SHARED_GLOBAL = '__KITSU_SHARED__'

/**
 * Packages a plugin must never bundle: two copies of Vue (or of the router,
 * store, i18n instances) inside one page break reactivity and injection.
 */
export const DEFAULT_SHARED_DEPS = ['vue', 'vue-router', 'vuex', 'vue-i18n']
