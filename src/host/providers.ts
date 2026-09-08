import { markRaw, shallowRef, type App, type ShallowRef } from 'vue'

/**
 * Reactive holders provided at host install. Plugins write values through
 * `applyProviders`; host UI reads `.value` via `inject(key)` so HMR / activate
 * updates apply without remounting.
 */
const holders = new Map<string, ShallowRef<unknown>>()
const owners = new Map<string, string>()

const getHolder = (key: string): ShallowRef<unknown> => {
  let holder = holders.get(key)
  if (!holder) {
    holder = shallowRef(undefined)
    holders.set(key, holder)
  }
  return holder
}

/** Host keys that must be provided before any consumer component mounts. */
export const HOST_PROVIDER_KEYS = [
  'ComboboxStatus.sortedTaskStatusList'
] as const

export const installProviders = (
  app: App,
  keys: readonly string[] = HOST_PROVIDER_KEYS
): void => {
  for (const key of keys) {
    app.provide(key, getHolder(key))
  }
}

/**
 * Applies a plugin's declarative `providers` map. Last plugin wins per key;
 * cleanup restores `undefined` when that plugin still owns the key.
 */
export const applyProviders = (
  pluginId: string,
  providers: Record<string, unknown> | undefined,
  onCleanup: (cleanup: () => void) => void
): void => {
  if (!providers) return

  for (const [key, value] of Object.entries(providers)) {
    const holder = getHolder(key)
    owners.set(key, pluginId)
    holder.value =
      value !== null &&
      (typeof value === 'object' || typeof value === 'function')
        ? markRaw(value as object)
        : value
    onCleanup(() => {
      if (owners.get(key) !== pluginId) return
      owners.delete(key)
      holder.value = undefined
    })
  }
}
