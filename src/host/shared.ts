import * as vue from 'vue'
import * as vueI18n from 'vue-i18n'
import * as vueRouter from 'vue-router'
import * as vuex from 'vuex'

import { SHARED_GLOBAL } from '../shared-global.js'

/**
 * Publishes the packages an injected plugin borrows instead of bundling. A
 * second copy of any of these in the page would get its own reactivity scope
 * and injection keys, so the plugin would see an empty store and a dead
 * router.
 *
 * Plugin builds rewrite their imports of these packages into lookups here, so
 * this has to run before the first plugin module is imported.
 */
export const publishSharedModules = (): void => {
  ;(globalThis as Record<string, unknown>)[SHARED_GLOBAL] = {
    modules: {
      vue,
      'vue-router': vueRouter,
      vuex,
      'vue-i18n': vueI18n
    }
  }
}
