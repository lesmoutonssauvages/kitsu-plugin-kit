import fs from 'node:fs'
import path from 'node:path'

/** `id = "sherlock"` or `id = 'sherlock'` on its own line. */
const MANIFEST_ID_RE = /^\s*id\s*=\s*(?:"([^"]+)"|'([^']+)')\s*$/m

/** Zou plugin id from the parent `manifest.toml` (next to the frontend package). */
export const readManifestPluginId = (frontendRoot: string): string => {
  const manifestPath = path.resolve(frontendRoot, '..', 'manifest.toml')
  let text: string
  try {
    text = fs.readFileSync(manifestPath, 'utf8')
  } catch {
    throw new Error(
      `defineKitsuPluginConfig: cannot read ${manifestPath}; pass pluginId or place manifest.toml next to the frontend folder.`
    )
  }
  const match = text.match(MANIFEST_ID_RE)
  const id = match?.[1] ?? match?.[2]
  if (!id) {
    throw new Error(
      `defineKitsuPluginConfig: no id = "…" found in ${manifestPath}`
    )
  }
  return id
}
