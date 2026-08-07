import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import type { Plugin } from 'vite'

import { DEFAULT_SHARED_DEPS, SHARED_GLOBAL } from '../shared-global.js'

export { DEFAULT_SHARED_DEPS, SHARED_GLOBAL } from '../shared-global.js'

const VIRTUAL_PREFIX = '\0kitsu-shared:'
const IDENTIFIER_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/

// Names that are valid in `export { x }` but not in `export const x`.
const RESERVED_WORDS = new Set([
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'enum',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'function',
  'if',
  'import',
  'in',
  'instanceof',
  'new',
  'null',
  'return',
  'super',
  'switch',
  'this',
  'throw',
  'true',
  'try',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  'yield'
])

type ExportsField = string | { [condition: string]: ExportsField } | null

interface PackageManifest {
  exports?: ExportsField
  module?: string
  main?: string
}

const pickEsmEntry = (field: ExportsField): string | null => {
  if (typeof field === 'string') return field
  if (!field || typeof field !== 'object') return null
  for (const condition of ['import', 'module', 'browser', 'default']) {
    if (condition in field) {
      const entry = pickEsmEntry(field[condition] ?? null)
      if (entry) return entry
    }
  }
  return null
}

/**
 * Resolve the ESM build of `name` as seen from the plugin. The CJS entry is
 * not usable here: Node's CJS lexer misses most re-exported names (vuex ships
 * 2 of its 13 exports that way), which would silently drop imports.
 */
const resolveEsmEntry = (root: string, name: string): string => {
  const require = createRequire(path.join(root, 'noop.js'))
  const manifestPath = require.resolve(`${name}/package.json`)
  const manifest = JSON.parse(
    fs.readFileSync(manifestPath, 'utf8')
  ) as PackageManifest
  const exported =
    (manifest.exports as Record<string, ExportsField> | undefined)?.['.'] ??
    manifest.exports ??
    null
  const entry = pickEsmEntry(exported) ?? manifest.module ?? manifest.main
  if (!entry) {
    throw new Error(`no ESM entry declared by "${name}"`)
  }
  return path.join(path.dirname(manifestPath), entry)
}

const collectExportNames = async (
  root: string,
  name: string
): Promise<string[]> => {
  const entry = resolveEsmEntry(root, name)
  const module = (await import(pathToFileURL(entry).href)) as object
  return Object.keys(module).filter(
    exportName =>
      exportName !== 'default' &&
      IDENTIFIER_RE.test(exportName) &&
      !RESERVED_WORDS.has(exportName)
  )
}

const buildShim = (name: string, exportNames: string[]): string =>
  [
    `const __kitsuShared = globalThis.${SHARED_GLOBAL}`,
    `if (!__kitsuShared) {`,
    `  throw new Error('Kitsu plugin: host shared modules are missing (globalThis.${SHARED_GLOBAL}).')`,
    `}`,
    `const __kitsuModule = __kitsuShared.modules[${JSON.stringify(name)}]`,
    `if (!__kitsuModule) {`,
    `  throw new Error('Kitsu plugin: the host does not share ${name}.')`,
    `}`,
    `export default __kitsuModule.default ?? __kitsuModule`,
    ...exportNames.map(
      exportName =>
        `export const ${exportName} = __kitsuModule[${JSON.stringify(exportName)}]`
    ),
    ''
  ].join('\n')

export interface KitsuSharedDepsOptions {
  /** Plugin root used to resolve the shared packages, default the Vite root. */
  root?: string
  shared?: string[]
}

/**
 * Rewrites imports of the shared packages into lookups on the host globals,
 * keeping the bundle in ESM format so code splitting and dynamic imports
 * still work.
 */
export const kitsuSharedDeps = ({
  root,
  shared = DEFAULT_SHARED_DEPS
}: KitsuSharedDepsOptions = {}): Plugin => {
  const exportNames = new Map<string, string[]>()
  let pluginRoot = root

  return {
    name: 'kitsu-plugin-shared-deps',
    enforce: 'pre',
    // Must run in `serve` too: a separate plugin Vite instance loads sources
    // through the same shim so the browser never pulls a second Vue.

    configResolved(config) {
      pluginRoot ??= config.root
    },

    resolveId(source) {
      return shared.includes(source) ? VIRTUAL_PREFIX + source : null
    },

    async load(id) {
      if (!id.startsWith(VIRTUAL_PREFIX)) return null
      const name = id.slice(VIRTUAL_PREFIX.length)
      if (!exportNames.has(name)) {
        try {
          exportNames.set(name, await collectExportNames(pluginRoot!, name))
        } catch (error) {
          this.error(
            `Cannot share "${name}" with the Kitsu host: ${(error as Error).message}. ` +
              'Install it as a dependency of the plugin frontend, at the version the host uses.'
          )
        }
      }
      return buildShim(name, exportNames.get(name)!)
    }
  }
}
