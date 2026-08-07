import type {
  RouteLocationNormalizedLoaded,
  RouteLocationRaw,
  RouteRecordRaw,
  Router
} from 'vue-router'

import { pluginRouteName, type KitsuPluginScope } from '../route-names.js'

/** Short page name declared in `definePlugin`, stamped on the matched record. */
export const PLUGIN_PAGE_META_KEY = 'pluginPage'

const pagesByPlugin = new Map<string, Set<string>>()

const isFilled = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0

const paramOf = (
  params: Record<string, unknown> | undefined,
  key: string
): string | undefined => {
  const value = params?.[key]
  if (isFilled(value)) return value
  if (Array.isArray(value) && isFilled(value[0])) return value[0]
  return undefined
}

const asParamBag = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

export const inferScope = (
  params: Record<string, unknown>
): KitsuPluginScope => {
  if (isFilled(paramOf(params, 'episode_id'))) return 'episode'
  if (isFilled(paramOf(params, 'production_id'))) return 'production'
  return 'studio'
}

const shortNameOf = (record: RouteRecordRaw): string | null => {
  const raw = record as {
    name?: string | symbol
    path?: string
  }
  if (typeof raw.name === 'string' && raw.name) return raw.name
  return raw.path === '' ? 'index' : null
}

export const collectPluginPages = (
  records: RouteRecordRaw[] | undefined,
  into: Set<string> = new Set()
): Set<string> => {
  for (const record of records ?? []) {
    const name = shortNameOf(record)
    if (name) into.add(name)
    const children = (record as { children?: RouteRecordRaw[] }).children
    if (children) collectPluginPages(children, into)
  }
  return into
}

export const registerPluginPages = (
  pluginId: string,
  pages: Iterable<string>
): (() => void) => {
  let set = pagesByPlugin.get(pluginId)
  if (!set) {
    set = new Set()
    pagesByPlugin.set(pluginId, set)
  }
  const added: string[] = []
  for (const page of pages) {
    if (!set.has(page)) {
      set.add(page)
      added.push(page)
    }
  }
  return () => {
    const current = pagesByPlugin.get(pluginId)
    if (!current) return
    for (const page of added) current.delete(page)
    if (current.size === 0) pagesByPlugin.delete(pluginId)
  }
}

export const rewriteLocation = (
  router: Router,
  to: RouteLocationRaw,
  currentLocation?: Pick<RouteLocationNormalizedLoaded, 'params'>
): RouteLocationRaw => {
  if (typeof to !== 'object' || to === null) return to
  if (!('name' in to) || to.name == null) return to
  if ('path' in to && to.path) return to

  const name = to.name
  if (typeof name !== 'string') return to
  if (router.hasRoute(name)) return to

  const currentParams = asParamBag(
    currentLocation?.params ?? router.currentRoute.value.params
  )
  const targetParams = asParamBag('params' in to ? to.params : undefined)
  const merged = { ...currentParams, ...targetParams }
  const pluginId = paramOf(merged, 'plugin_id')
  if (!pluginId) return to

  const pages = pagesByPlugin.get(pluginId)
  if (!pages?.has(name)) return to

  const scope = inferScope(merged)
  return {
    ...to,
    name: pluginRouteName(pluginId, scope, name),
    params: {
      ...merged,
      plugin_id: pluginId
    }
  }
}

/**
 * `createRouter()` closes `push`/`replace` over an internal resolve, so
 * patching `router.resolve` alone would make `RouterLink` work but not
 * `router.push`. Wrap all three once at host install.
 */
export const installPluginNavigation = (router: Router): void => {
  const resolve = router.resolve.bind(router)
  const push = router.push.bind(router)
  const replace = router.replace.bind(router)

  router.resolve = (
    to: RouteLocationRaw,
    currentLocation?: RouteLocationNormalizedLoaded
  ) => resolve(rewriteLocation(router, to, currentLocation), currentLocation)

  router.push = (to: RouteLocationRaw) => push(rewriteLocation(router, to))

  router.replace = (to: RouteLocationRaw) =>
    replace(rewriteLocation(router, to))
}
