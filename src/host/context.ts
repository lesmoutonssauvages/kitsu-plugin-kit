import type {
  NavigationGuard,
  RouteLocationNormalized,
  RouteParamsRaw,
  RouteRecordRaw
} from 'vue-router'

import { PLUGIN_CONTEXT_META_KEY } from '../context.js'
import {
  PLUGIN_SCOPE_PARENTS,
  pluginRouteName,
  type KitsuPluginScope
} from '../route-names.js'
import type {
  KitsuPluginContext,
  KitsuPluginManifest,
  KitsuPluginRoutes,
  KitsuStoreModuleDefinition
} from '../types.js'
import { registerMessages, unregisterMessages } from './i18n.js'
import {
  PLUGIN_PAGE_META_KEY,
  collectPluginPages,
  registerPluginPages
} from './navigation.js'
import type { KitsuHost } from './types.js'

/**
 * The few fields reshaped below. `RouteRecordRaw` is a union whose members
 * disagree on most of them, so reading them off the record directly is not
 * workable; plugins keep declaring plain `RouteRecordRaw`.
 */
interface RawRoute {
  path?: string
  name?: string
  redirect?:
    | string
    | { name?: string; params?: RouteParamsRaw }
    | ((to: RouteLocationNormalized) => unknown)
  children?: RouteRecordRaw[]
  beforeEnter?: NavigationGuard | NavigationGuard[]
  meta?: Record<string, unknown>
  [key: string]: unknown
}

const asRaw = (record: RouteRecordRaw) => record as unknown as RawRoute
const asRecord = (raw: RawRoute) => raw as unknown as RouteRecordRaw

const asArray = <T>(value: T | T[] | undefined): T[] =>
  value === undefined ? [] : Array.isArray(value) ? value : [value]

const remapRoute = (
  record: RouteRecordRaw,
  pluginId: string,
  scope: KitsuPluginScope
): RouteRecordRaw => {
  const source = asRaw(record)
  const mapped: RawRoute = { ...source }

  // An empty-path child of a named parent is unreachable through the parent's
  // name, which is how Kitsu links to plugin pages. Naming it makes the host
  // able to redirect there, and silences Vue Router's warning about it.
  const name = source.name ?? (source.path === '' ? 'index' : null)
  if (name) {
    mapped.name = pluginRouteName(pluginId, scope, name)
    mapped.meta = { ...mapped.meta, [PLUGIN_PAGE_META_KEY]: name }
  }

  // A plain named redirect would drop production_id / episode_id, so turn it
  // into a function that carries the current params over. Redirects are
  // followed while matching, before `beforeEnter` runs, so the plugin id has
  // to be checked here too: the parent's `:plugin_id` is a wildcard, and
  // hijacking a sibling plugin's URL would bounce between the two forever.
  const redirect = source.redirect
  if (typeof redirect === 'object' && redirect.name) {
    const target = pluginRouteName(pluginId, scope, redirect.name)
    mapped.redirect = (to: RouteLocationNormalized) =>
      to.params.plugin_id === pluginId
        ? {
            ...redirect,
            name: target,
            params: { ...to.params, ...redirect.params }
          }
        : { name: PLUGIN_SCOPE_PARENTS[scope], params: to.params }
  }

  if (source.children) {
    mapped.children = source.children.map(child =>
      remapRoute(child, pluginId, scope)
    )
  }

  return asRecord(mapped)
}

/**
 * The plugin routes hang from a parent whose `:plugin_id` segment matches any
 * plugin, so a sibling plugin's URL would otherwise render this plugin's
 * views. Send those back to the plugin root instead.
 */
const scopeToPlugin = (
  record: RouteRecordRaw,
  pluginId: string,
  parent: string
): RouteRecordRaw => {
  const source = asRaw(record)
  return asRecord({
    ...source,
    beforeEnter: [
      (to: RouteLocationNormalized) =>
        to.params.plugin_id === pluginId
          ? undefined
          : { name: parent, params: to.params, replace: true },
      ...asArray(source.beforeEnter)
    ]
  })
}

export interface PluginContextHandle {
  context: KitsuPluginContext
  dispose: () => Promise<void>
}

export const createPluginContext = (
  host: KitsuHost,
  plugin: KitsuPluginManifest
): PluginContextHandle => {
  const pluginId = plugin.plugin_id
  const cleanups: Array<() => void | Promise<void>> = []
  let storeModuleName: string | null = null

  const context: KitsuPluginContext = {
    pluginId,
    manifest: plugin,
    app: host.app,
    router: host.router,
    store: host.store,
    i18n: host.i18n,
    head: host.head,

    get productionId() {
      return (
        (host.router.currentRoute.value.params.production_id as
          string | undefined) ?? null
      )
    },

    get episodeId() {
      return (
        (host.router.currentRoute.value.params.episode_id as
          string | undefined) ?? null
      )
    },

    get storeModuleName() {
      return storeModuleName
    },

    onCleanup: cleanup => {
      cleanups.push(cleanup)
    },

    addMessages: messages => {
      registerMessages(host.i18n, pluginId, messages)
      cleanups.push(() => unregisterMessages(pluginId))
    },

    registerStoreModule: (name: string, module: KitsuStoreModuleDefinition) => {
      const source = module as { getters?: Record<string, unknown> }
      const wrapped = {
        ...(module as Record<string, unknown>),
        namespaced: true,
        getters: {
          ...source.getters,
          pluginId: () => pluginId
        }
      }
      storeModuleName = name
      if (host.store.hasModule(name)) host.store.unregisterModule(name)
      host.store.registerModule(name, wrapped)
      cleanups.push(() => {
        if (storeModuleName === name) storeModuleName = null
        if (host.store.hasModule(name)) host.store.unregisterModule(name)
      })
    },

    addRoutes: (routes: KitsuPluginRoutes) => {
      const scopes: KitsuPluginRoutes = { ...routes }
      scopes.episode ??= scopes.production

      const pages = new Set<string>()
      for (const records of Object.values(scopes)) {
        collectPluginPages(records, pages)
      }
      cleanups.push(registerPluginPages(pluginId, pages))

      for (const [scope, records] of Object.entries(scopes)) {
        const parent = PLUGIN_SCOPE_PARENTS[scope as KitsuPluginScope]
        if (!parent) {
          throw new Error(`Unknown plugin route scope "${scope}"`)
        }
        if (!host.router.hasRoute(parent)) continue

        for (const record of records ?? []) {
          const mapped = asRaw(
            scopeToPlugin(
              remapRoute(record, pluginId, scope as KitsuPluginScope),
              pluginId,
              parent
            )
          )
          mapped.meta = {
            ...mapped.meta,
            [PLUGIN_CONTEXT_META_KEY]: context
          }
          cleanups.push(host.router.addRoute(parent, asRecord(mapped)))
        }
      }
    }
  }

  const dispose = async () => {
    for (const cleanup of cleanups.reverse()) {
      try {
        await cleanup()
      } catch (error) {
        console.error(`[plugins] "${pluginId}" cleanup failed:`, error)
      }
    }
    cleanups.length = 0
  }

  return { context, dispose }
}
