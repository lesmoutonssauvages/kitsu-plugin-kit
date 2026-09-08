import { watch } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'

// Dev only: plugin sources compiled by Kitsu's own Vite server. Provided by
// the `kitsuPluginsDev` Vite plugin; empty when plugins run their own Vite
// (`KITSU_PLUGIN_DEV_URLS`) or in production builds.
import { devPlugins } from 'virtual:kitsu-plugins-dev'

import { PLUGIN_CONTEXT_META_KEY } from '../context.js'
import {
  PLUGIN_SCOPE_PARENTS,
  pluginRouteName,
  type KitsuPluginScope
} from '../route-names.js'
import type { KitsuPlugin, KitsuPluginManifest } from '../types.js'
import { PluginPending } from './components.js'
import { createPluginContext, type PluginContextHandle } from './context.js'
import { applySlots } from './apply-slots.js'
import { applyProviders } from './providers.js'
import { installI18n } from './i18n.js'
import { installPluginNavigation } from './navigation.js'
import { publishSharedModules } from './shared.js'
import {
  findPlugin,
  getHost,
  listInjectedPlugins,
  pluginStates,
  setHost
} from './state.js'
import type { KitsuHost } from './types.js'

declare const __KITSU_PLUGIN_DEV_URLS__: string

/** Dev Vite URLs that are down must not freeze the host router forever. */
const IMPORT_TIMEOUT_MS = 4_000

interface ActiveEntry extends PluginContextHandle {
  definition: KitsuPlugin
}

const active = new Map<string, ActiveEntry>()
const inFlight = new Map<string, Promise<void>>()

/** `my-plugin=http://127.0.0.1:5173/src/index.ts,other=...` → map */
const parseDevUrls = (spec: string): Record<string, string> => {
  const urls: Record<string, string> = {}
  for (const item of spec.split(',')) {
    const trimmed = item.trim()
    if (!trimmed) continue
    const separator = trimmed.indexOf('=')
    if (separator === -1) continue
    urls[trimmed.slice(0, separator)] = trimmed.slice(separator + 1)
  }
  return urls
}

const DEV_URLS = parseDevUrls(
  typeof __KITSU_PLUGIN_DEV_URLS__ === 'string' ? __KITSU_PLUGIN_DEV_URLS__ : ''
)

const withTimeout = <T>(
  promise: Promise<T>,
  ms: number,
  message: string
): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms)
    promise.then(
      value => {
        clearTimeout(timer)
        resolve(value)
      },
      error => {
        clearTimeout(timer)
        reject(error instanceof Error ? error : new Error(String(error)))
      }
    )
  })

const importPluginModule = (plugin: KitsuPluginManifest) => {
  const fromUrl = DEV_URLS[plugin.plugin_id]
  if (fromUrl) {
    return withTimeout(
      import(/* @vite-ignore */ fromUrl),
      IMPORT_TIMEOUT_MS,
      `dev server did not answer at ${fromUrl} within ${IMPORT_TIMEOUT_MS}ms`
    )
  }

  const loadFromSource = devPlugins[plugin.plugin_id]
  if (loadFromSource) return loadFromSource()

  const version = encodeURIComponent(plugin.version ?? '')
  return withTimeout(
    import(
      /* @vite-ignore */
      `/api/plugins/${plugin.plugin_id}/frontend/plugin.js?v=${version}`
    ),
    IMPORT_TIMEOUT_MS,
    `plugin bundle at /api/plugins/${plugin.plugin_id}/frontend/plugin.js did not load`
  )
}

const activatePlugin = async (
  plugin: KitsuPluginManifest,
  module?: unknown
): Promise<void> => {
  const pluginId = plugin.plugin_id
  const host = getHost()
  if (!host) return

  pluginStates[pluginId] = { status: 'loading', error: null }

  try {
    const loaded = (module ?? (await importPluginModule(plugin))) as {
      default?: KitsuPlugin
    }
    const definition = loaded?.default

    if (typeof definition?.activate !== 'function') {
      throw new Error('the bundle does not default-export a plugin definition')
    }

    const handle = createPluginContext(host, plugin)
    try {
      applySlots(pluginId, definition.slots, cleanup => {
        handle.context.onCleanup(cleanup)
      })
      applyProviders(pluginId, definition.providers, cleanup => {
        handle.context.onCleanup(cleanup)
      })
      await definition.activate(handle.context)
    } catch (error) {
      await handle.dispose()
      throw error
    }

    active.set(pluginId, { definition, ...handle })
    pluginStates[pluginId] = { status: 'active', error: null }
  } catch (error) {
    console.error(`[plugins] "${pluginId}" failed to activate:`, error)
    pluginStates[pluginId] = {
      status: 'error',
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * Activates one injected plugin if needed. Concurrent calls share the same
 * in-flight promise. Failed loads are not retried until the entry is cleared
 * (HMR) so a downed Vite server cannot block every navigation.
 */
const ensurePlugin = (plugin: KitsuPluginManifest): Promise<void> => {
  const pluginId = plugin.plugin_id
  if (!plugin.injected) return Promise.resolve()
  if (active.has(pluginId)) return Promise.resolve()
  if (pluginStates[pluginId]?.status === 'error') return Promise.resolve()

  let pending = inFlight.get(pluginId)
  if (!pending) {
    pending = activatePlugin(plugin).finally(() => {
      inFlight.delete(pluginId)
    })
    inFlight.set(pluginId, pending)
  }
  return pending
}

const deactivatePlugin = async (pluginId: string): Promise<void> => {
  const entry = active.get(pluginId)
  if (!entry) return

  active.delete(pluginId)
  try {
    await entry.definition.deactivate?.(entry.context)
  } catch (error) {
    console.error(`[plugins] "${pluginId}" failed to deactivate:`, error)
  }
  await entry.dispose()

  document
    .querySelectorAll(`style[data-kitsu-plugin="${pluginId}"]`)
    .forEach(node => node.remove())

  delete pluginStates[pluginId]
}

/**
 * Prefetches every injected plugin without blocking the caller. Used when the
 * store first receives the plugin list; navigation uses `ensurePlugin` instead
 * so one dead Vite URL cannot freeze the router.
 */
export const activatePlugins = (): void => {
  for (const plugin of listInjectedPlugins()) {
    void ensurePlugin(plugin)
  }
}

const PARENT_NAMES = Object.values(PLUGIN_SCOPE_PARENTS)

const SCOPE_BY_PARENT = Object.fromEntries(
  Object.entries(PLUGIN_SCOPE_PARENTS).map(([scope, name]) => [name, scope])
) as Record<string, KitsuPluginScope>

const PENDING_SUFFIX = '-pending'

const isPendingName = (name: unknown): boolean =>
  typeof name === 'string' && name.endsWith(PENDING_SUFFIX)

/** `/…/plugins/<id>/…` — used when the first match was the global 404. */
const PLUGIN_PATH_RE = /\/plugins\/([^/]+)(?:\/|$)/

const pluginIdOf = (to: {
  params: Record<string, unknown>
  path: string
}): string | null => {
  const fromParams = to.params.plugin_id
  if (typeof fromParams === 'string' && fromParams) return fromParams
  if (Array.isArray(fromParams) && typeof fromParams[0] === 'string') {
    return fromParams[0]
  }
  return to.path.match(PLUGIN_PATH_RE)?.[1] ?? null
}

/** Plugin a matched route was registered for, if any. */
const ownerOf = (location: { meta: Record<string, unknown> }): string | null =>
  (location.meta[PLUGIN_CONTEXT_META_KEY] as { pluginId?: string } | undefined)
    ?.pluginId ?? null

/**
 * Empty-path child of `parent` that belongs to this plugin. Plugins often
 * name that page `list` or `bank` rather than `index`; they still share the
 * parent's URL, so Kitsu's parent-named links must land on them.
 */
const ownedEmptyChildName = (
  host: KitsuHost,
  pluginId: string,
  parent: string
): string | null => {
  const parentRecord = host.router
    .getRoutes()
    .find(route => route.name === parent)
  if (!parentRecord) return null

  for (const route of host.router.getRoutes()) {
    if (ownerOf(route) !== pluginId) continue
    if (!route.name || isPendingName(route.name)) continue
    if (route.path === parentRecord.path) return String(route.name)
  }
  return null
}

/**
 * Kitsu links (episode combobox, section list) target the plugin *parent*
 * (`episode-production-plugin`, …). PluginHost's `<RouterView>` then has no
 * child, so the page is blank. Send that navigation to the empty-path child
 * (usually a redirect to the plugin's first page).
 *
 * Same-path name changes need `force`: parent and empty child share a URL,
 * and Vue Router otherwise treats the redirect as a no-op.
 */
const defaultPluginLocation = (
  host: KitsuHost,
  pluginId: string,
  to: RouteLocationNormalized
) => {
  const scope = SCOPE_BY_PARENT[String(to.name)]
  if (!scope) return null

  const parent = PLUGIN_SCOPE_PARENTS[scope]
  const indexName = pluginRouteName(pluginId, scope, 'index')
  const targetName = host.router.hasRoute(indexName)
    ? indexName
    : ownedEmptyChildName(host, pluginId, parent)
  if (!targetName) return null

  const record = host.router
    .getRoutes()
    .find(route => route.name === targetName)
  const redirect = record?.redirect
  if (typeof redirect === 'function') {
    const dest = redirect(to, to)
    if (dest && typeof dest === 'object') {
      return { ...dest, replace: true as const, force: true as const }
    }
  } else if (typeof redirect === 'string') {
    return { path: redirect, replace: true as const, force: true as const }
  } else if (redirect && typeof redirect === 'object') {
    return { ...redirect, replace: true as const, force: true as const }
  }

  return {
    name: targetName,
    params: to.params,
    query: to.query,
    replace: true as const,
    force: true as const
  }
}

/**
 * Adds the catch-all child that keeps plugin sub-paths out of Kitsu's global
 * 404 route, so a deep link still reaches the guard below.
 */
const installRoutes = (host: KitsuHost) => {
  for (const parent of PARENT_NAMES) {
    if (!host.router.hasRoute(parent)) continue
    const pendingName = `${parent}${PENDING_SUFFIX}`
    if (host.router.hasRoute(pendingName)) continue
    host.router.addRoute(parent, {
      path: ':pluginPath(.*)+',
      name: pendingName,
      component: PluginPending
    })
  }
}

/**
 * Plugin routes only exist once the plugin is active, so the first navigation
 * to one of them resolves to the plugin parent or to the catch-all above.
 * Re-resolving the same path after activation reaches the real route.
 *
 * Non-injected (iframe) plugins skip activation entirely. Only the plugin in
 * the URL is awaited, with a load timeout, so a downed sibling cannot hang
 * the router.
 */
const installGuard = (host: KitsuHost) => {
  host.router.beforeResolve(async to => {
    const pluginId = pluginIdOf(to)
    if (!pluginId) return true

    installRoutes(host)

    // Recover from a too-early initial navigation that landed on not-found.
    if (to.name === 'not-found') {
      const recovered = host.router.resolve(to.fullPath)
      if (recovered.name !== 'not-found') {
        return { path: to.fullPath, replace: true, force: true }
      }
      return true
    }

    const plugin = findPlugin(pluginId)
    // Legacy iframe integration: Plugin.vue renders the iframe, no routes.
    if (!plugin?.injected) return true

    await ensurePlugin(plugin)

    const fromParent = defaultPluginLocation(host, pluginId, to)
    if (fromParent) return fromParent

    const resolved = host.router.resolve(to.fullPath)
    // Rematch only when activation registered a real page for this path.
    // A match owned by another plugin is ignored: the parent's `:plugin_id`
    // is a wildcard, so a sibling's routes match this URL too, and following
    // them bounces back here forever.
    if (
      resolved.name &&
      resolved.name !== to.name &&
      resolved.name !== 'not-found' &&
      !isPendingName(resolved.name) &&
      (ownerOf(resolved) ?? pluginId) === pluginId
    ) {
      return { path: to.fullPath, replace: true, force: true }
    }

    return true
  })
}

/**
 * Wires the plugin runtime into Kitsu: shared modules, i18n, the catch-all
 * routes, the navigation guard, and a non-blocking prefetch of injected
 * plugins once the list reaches the store.
 */
export const installPluginRuntime = (host: KitsuHost): void => {
  setHost(host)

  publishSharedModules()
  installI18n(host.i18n)
  installPluginNavigation(host.router)
  installRoutes(host)
  installGuard(host)

  watch(
    () => host.store.getters.plugins as unknown,
    () => {
      activatePlugins()
    },
    { immediate: true }
  )
}

if (import.meta.hot) {
  ;(globalThis as Record<string, unknown>).__KITSU_PLUGIN_RELOAD__ = async (
    pluginId: string,
    module: unknown
  ) => {
    const host = getHost()
    const plugin = findPlugin(pluginId)
    if (!plugin || !host) return

    const { fullPath } = host.router.currentRoute.value
    await deactivatePlugin(pluginId)
    // Clear a previous error so HMR can retry.
    delete pluginStates[pluginId]
    await activatePlugin(plugin, module)
    await host.router.replace({ path: fullPath, force: true })
  }
}
