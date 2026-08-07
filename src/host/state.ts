import { reactive } from 'vue'

import type { KitsuPluginManifest } from '../types.js'
import type { KitsuHost, PluginStates } from './types.js'

/**
 * Shared between the runtime and the host components. Kept apart from both so
 * the components do not have to import the runtime, which would make the two
 * modules circular.
 */
export const pluginStates: PluginStates = reactive({})

let host: KitsuHost | null = null

export const setHost = (value: KitsuHost): void => {
  host = value
}

export const getHost = (): KitsuHost | null => host

export const listInjectedPlugins = (): KitsuPluginManifest[] =>
  (
    (host?.store.getters.plugins as KitsuPluginManifest[] | undefined) ?? []
  ).filter(plugin => plugin.injected)

export const findPlugin = (pluginId: string): KitsuPluginManifest | undefined =>
  (
    (host?.store.getters.plugins as KitsuPluginManifest[] | undefined) ?? []
  ).find(plugin => plugin.plugin_id === pluginId)
