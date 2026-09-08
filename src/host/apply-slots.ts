import type { Component } from 'vue'

import { registerSlot, unregisterSlot } from './slots.js'

/**
 * Applies a plugin's declarative `slots` map. Keys may include position
 * suffixes (`name:before`, `name:after`). Cleanup unregisters on deactivate.
 */
export const applySlots = (
  pluginId: string,
  slots: Partial<Record<string, Component>> | undefined,
  onCleanup: (cleanup: () => void) => void
): void => {
  if (!slots) return

  for (const [slotName, component] of Object.entries(slots)) {
    if (!component) continue
    registerSlot(slotName, pluginId, component)
    onCleanup(() => unregisterSlot(slotName, pluginId, component))
  }
}
