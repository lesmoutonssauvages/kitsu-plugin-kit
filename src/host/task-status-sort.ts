import { markRaw, shallowRef } from 'vue'

import type { TaskStatusSortFn } from '../types.js'

export type { TaskStatusSortFn }

export const TASK_STATUS_SORT_KEY = Symbol.for('kitsu.taskStatusSort')

/**
 * Reactive holder provided once by the host. Plugins write through
 * `registerTaskStatusSort`; ComboboxStatus reads `.value` in a computed so
 * HMR updates apply without remounting.
 */
export const taskStatusSortFn = shallowRef<TaskStatusSortFn | null>(null)

let ownerPluginId: string | null = null

export const registerTaskStatusSort = (
  pluginId: string,
  fn: TaskStatusSortFn
): void => {
  ownerPluginId = pluginId
  taskStatusSortFn.value = markRaw(fn)
}

export const unregisterTaskStatusSort = (pluginId: string): void => {
  if (ownerPluginId !== pluginId) return
  ownerPluginId = null
  taskStatusSortFn.value = null
}
