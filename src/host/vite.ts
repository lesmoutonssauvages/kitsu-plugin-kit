import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { searchForWorkspaceRoot, type Plugin } from 'vite'

import { DEFAULT_SHARED_DEPS } from '../shared-global.js'

const VIRTUAL_ID = 'virtual:kitsu-plugins-dev'
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`
const ENTRY_CANDIDATES = ['src/index.ts', 'src/index.js', 'src/index.mjs']

interface DiscoveredPlugin {
  id: string
  directory: string
  entry: string
}

const listDirectories = (parent: string): string[] => {
  try {
    return fs
      .readdirSync(parent, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => path.join(parent, entry.name))
  } catch {
    return []
  }
}

// Expands a single `*` segment, which covers the usual
// `<plugins>/*/frontend` layout without pulling in a glob dependency.
const expand = (pattern: string): string[] => {
  const segments = pattern.split(path.sep)
  const star = segments.indexOf('*')
  if (star === -1) return [pattern]

  const parent = segments.slice(0, star).join(path.sep)
  const rest = segments.slice(star + 1)
  return listDirectories(parent).map(directory => path.join(directory, ...rest))
}

const findEntry = (directory: string): string | null =>
  ENTRY_CANDIDATES.map(name => path.join(directory, name)).find(file =>
    fs.existsSync(file)
  ) ?? null

/**
 * A plugin imports `kitsu-plugin-kit` and its own dependencies by bare
 * specifier, which resolve from the plugin package and not from Kitsu.
 * Mounting only `src` (a common mistake in containers) leaves the sources
 * visible but impossible to compile, so say so here instead of failing on the
 * first import.
 */
const unusableReason = (directory: string): string | null => {
  const manifest = path.join(directory, 'package.json')
  if (!fs.existsSync(manifest)) return 'no package.json next to src/'
  try {
    createRequire(manifest).resolve('kitsu-plugin-kit')
    return null
  } catch {
    return 'cannot resolve kitsu-plugin-kit; run pnpm install, then build the kit'
  }
}

// zou-plugins/my-plugin/frontend -> my-plugin
const inferId = (directory: string): string =>
  path.basename(directory) === 'frontend'
    ? path.basename(path.dirname(directory))
    : path.basename(directory)

/**
 * Parses KITSU_PLUGIN_DEV_PATHS: a comma-separated list of frontend
 * directories, each optionally prefixed with `<id>=` when the plugin id
 * cannot be inferred from the path.
 */
const discover = (root: string, spec: string): DiscoveredPlugin[] =>
  spec
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .flatMap(item => {
      const separator = item.indexOf('=')
      const id = separator === -1 ? null : item.slice(0, separator)
      const target = separator === -1 ? item : item.slice(separator + 1)
      const pattern = path.isAbsolute(target)
        ? target
        : path.resolve(root, target)

      return expand(pattern).flatMap(directory => {
        const entry = findEntry(directory)
        if (!entry) return []

        const reason = unusableReason(directory)
        if (reason) {
          console.warn(
            `[kitsu-plugins-dev] skipping "${id ?? inferId(directory)}" (${directory}): ${reason}`
          )
          return []
        }

        return [{ id: id ?? inferId(directory), directory, entry }]
      })
    })

const toFsUrl = (file: string): string =>
  `/@fs/${file.split(path.sep).join('/')}`

const generate = (plugins: DiscoveredPlugin[]): string => {
  if (!plugins.length) return 'export const devPlugins = {}\n'

  const entries = plugins.map(
    plugin =>
      `  ${JSON.stringify(plugin.id)}: () => import(${JSON.stringify(
        toFsUrl(plugin.entry)
      )})`
  )

  // Entry HMR is wired inside `definePlugin` so the same path works when the
  // plugin is loaded from its own Vite instance via KITSU_PLUGIN_DEV_URLS.
  return ['export const devPlugins = {', entries.join(',\n'), '}', ''].join(
    '\n'
  )
}

export interface KitsuPluginsDevOptions {
  /** Defaults to the KITSU_PLUGIN_DEV_PATHS environment variable. */
  paths?: string
  /**
   * Comma-separated `id=url` pairs pointing at each plugin's own Vite server
   * entry (e.g. `my-plugin=http://127.0.0.1:5173/src/index.ts`). Takes
   * precedence over filesystem discovery when both are set.
   * Defaults to KITSU_PLUGIN_DEV_URLS.
   */
  urls?: string
}

/**
 * Discovers plugin frontends for development.
 *
 * Prefer a separate Vite instance per plugin (`KITSU_PLUGIN_DEV_URLS`): the
 * host then `import()`s each entry over HTTP and that Vite owns HMR. The
 * optional `KITSU_PLUGIN_DEV_PATHS` mode still compiles plugin sources inside
 * Kitsu's own Vite when a single graph is more convenient.
 *
 * Always installs the virtual module the host runtime imports (empty when
 * nothing is configured).
 */
export const kitsuPluginsDev = ({
  paths = process.env.KITSU_PLUGIN_DEV_PATHS,
  urls = process.env.KITSU_PLUGIN_DEV_URLS
}: KitsuPluginsDevOptions = {}): Plugin => {
  let plugins: DiscoveredPlugin[] = []

  return {
    name: 'kitsu-plugins-dev',

    config(_config, env) {
      const shared = {
        define: {
          __KITSU_PLUGIN_DEV_URLS__: JSON.stringify(urls ?? '')
        },
        resolve: {
          // The kit and the plugin frontends have their own node_modules;
          // without this they would get a second router, store and i18n.
          dedupe: [...DEFAULT_SHARED_DEPS]
        },
        // The host runtime imports the virtual module above, which esbuild
        // cannot follow if the kit gets prebundled.
        optimizeDeps: { exclude: ['kitsu-plugin-kit'] }
      }

      // URL mode does not need filesystem discovery.
      if (env.command !== 'serve' || !paths || urls) return shared

      plugins = discover(process.cwd(), paths)
      if (!plugins.length) {
        console.warn(
          `[kitsu-plugins-dev] no plugin frontend found in "${paths}"`
        )
        return shared
      }

      console.info(
        `[kitsu-plugins-dev] serving from source: ${plugins
          .map(plugin => plugin.id)
          .join(', ')}`
      )

      return {
        ...shared,
        server: {
          // Setting `allow` drops Vite's workspace-root default, so restate it.
          fs: {
            allow: [
              searchForWorkspaceRoot(process.cwd()),
              ...plugins.map(plugin => plugin.directory)
            ]
          }
        },
        // Pre-bundle the plugins' own dependencies with Kitsu's, otherwise the
        // first navigation to a plugin page triggers a re-optimize and reload.
        optimizeDeps: {
          ...shared.optimizeDeps,
          entries: ['index.html', ...plugins.map(plugin => plugin.entry)]
        }
      }
    },

    resolveId(source) {
      return source === VIRTUAL_ID ? RESOLVED_VIRTUAL_ID : null
    },

    load(id) {
      return id === RESOLVED_VIRTUAL_ID ? generate(plugins) : null
    },

    configureServer() {
      if (urls) {
        console.info(`[kitsu-plugins-dev] loading from Vite URLs: ${urls}`)
      }
    }
  }
}
