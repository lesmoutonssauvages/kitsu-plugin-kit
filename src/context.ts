import { computed, type ComputedRef } from 'vue'
import { useRoute } from 'vue-router'

import type { KitsuPluginContext } from './types.js'

/**
 * The host stamps the plugin context on the `meta` of every route it registers
 * for that plugin. Vue Router merges `meta` across matched records, so nested
 * plugin views inherit it without any provide/inject plumbing.
 */
export const PLUGIN_CONTEXT_META_KEY = 'kitsuPlugin'

export const usePluginContext = (): ComputedRef<KitsuPluginContext | null> => {
  const route = useRoute()
  return computed(
    () =>
      (route.meta[PLUGIN_CONTEXT_META_KEY] as KitsuPluginContext | undefined) ??
      null
  )
}

/**
 * The plugin's own Vuex module, without the host path prefix. `commit` /
 * `dispatch` are no-ops until the module is registered.
 */
export const usePluginStore = <S = unknown>(): {
  state: ComputedRef<S | undefined>
  commit: (type: string, payload?: unknown) => void
  dispatch: (type: string, payload?: unknown) => Promise<unknown>
} => {
  const context = usePluginContext()

  const moduleName = (): string | null => {
    const ctx = context.value
    const name = ctx?.storeModuleName
    if (!ctx || !name || !ctx.store.hasModule(name)) return null
    return name
  }

  const state = computed(() => {
    const ctx = context.value
    const name = moduleName()
    if (!ctx || !name) return undefined
    return ctx.store.state[name] as S | undefined
  })

  const commit = (type: string, payload?: unknown): void => {
    const ctx = context.value
    const name = moduleName()
    if (!ctx || !name) return
    ctx.store.commit(`${name}/${type}`, payload)
  }

  const dispatch = (type: string, payload?: unknown): Promise<unknown> => {
    const ctx = context.value
    const name = moduleName()
    if (!ctx || !name) return Promise.resolve()
    return ctx.store.dispatch(`${name}/${type}`, payload) as Promise<unknown>
  }

  return { state, commit, dispatch }
}
