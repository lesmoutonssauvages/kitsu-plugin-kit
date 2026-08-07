import { markRaw, ref } from 'vue'
import type { Component } from 'vue'

interface SlotEntry {
  pluginId: string
  component: Component
}

/**
 * Reactive registry: slot-name → entries sorted alphabetically by pluginId.
 * Multiple plugins can register components for the same slot; they appear
 * in the order determined by their plugin id (a-z).
 *
 * Uses a ref on a plain object (rather than reactive Map) so that Vue's
 * dependency tracking fires reliably when entries are added or removed.
 */
export const slotRegistry = ref<Record<string, SlotEntry[]>>({})

export const registerSlot = (
  slotName: string,
  pluginId: string,
  component: Component
): void => {
  const current = slotRegistry.value[slotName] ?? []
  const next = [...current, { pluginId, component: markRaw(component) }]
  next.sort((a, b) => a.pluginId.localeCompare(b.pluginId))
  // Trigger reactivity with a new object reference
  slotRegistry.value = { ...slotRegistry.value, [slotName]: next }
}

export const unregisterSlot = (
  slotName: string,
  pluginId: string,
  component: Component
): void => {
  const current = slotRegistry.value[slotName]
  if (!current) return
  const next = current.filter(
    e => !(e.pluginId === pluginId && e.component === component)
  )
  const updated = { ...slotRegistry.value }
  if (next.length === 0) {
    delete updated[slotName]
  } else {
    updated[slotName] = next
  }
  slotRegistry.value = updated
}

export const getSlotEntries = (slotName: string): SlotEntry[] =>
  slotRegistry.value[slotName] ?? []
