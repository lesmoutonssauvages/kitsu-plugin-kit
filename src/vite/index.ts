import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import vue from '@vitejs/plugin-vue'
import {
  searchForWorkspaceRoot,
  type ServerOptions,
  type UserConfig
} from 'vite'

import { kitsuInlineCss } from './inline-css.js'
import { readManifestPluginId } from './manifest-id.js'
import { DEFAULT_SHARED_DEPS, kitsuSharedDeps } from './shared-deps.js'

export { kitsuInlineCss, type KitsuInlineCssOptions } from './inline-css.js'
export { readManifestPluginId } from './manifest-id.js'
export {
  DEFAULT_SHARED_DEPS,
  SHARED_GLOBAL,
  kitsuSharedDeps,
  type KitsuSharedDepsOptions
} from './shared-deps.js'

type VueOptions = Parameters<typeof vue>[0]

/**
 * Dev alias target: kit sources, not prebuilt `dist/`.
 * Uses `@lesmoutonssauvages/kitsu-plugin-kit/vite` (a declared export) so this survives the kit's
 * own lib build — `import.meta.url` + `../src/index.ts` gets evaluated at
 * bundle time and breaks in the published `dist/vite/index.js`.
 *
 * The published package ships `src/` (not `dist/`); `prepare` builds `dist/` on install.
 */
const resolveKitPackageRoot = (frontendRoot: string): string => {
  const require = createRequire(path.join(frontendRoot, 'package.json'))
  const viteEntry = require.resolve('@lesmoutonssauvages/kitsu-plugin-kit/vite')
  return path.join(path.dirname(viteEntry), '..', '..')
}

const resolveKitSourceEntry = (packageRoot: string): string => {
  const sourceEntry = path.join(packageRoot, 'src', 'index.ts')
  if (fs.existsSync(sourceEntry)) return sourceEntry
  const distEntry = path.join(packageRoot, 'dist', 'index.js')
  if (fs.existsSync(distEntry)) return distEntry
  throw new Error(
    `kitsu-plugin-kit: missing ${sourceEntry} (and no dist fallback). ` +
      `Install a kit that ships src/, or run prepare/build in the kit package.`
  )
}

/** URL Zou serves the plugin `dist/` folder from. */
export const kitsuPluginBase = (pluginId: string): string =>
  `/api/plugins/${pluginId}/frontend/`

export interface KitsuPluginConfigOptions {
  /**
   * Zou plugin id. Defaults to `id` in the parent `manifest.toml` (next to
   * the frontend package).
   */
  pluginId?: string
  /** Bundle entry, default `src/index.ts`. */
  entry?: string
  /** Packages borrowed from the host, default `DEFAULT_SHARED_DEPS`. */
  shared?: string[]
  /** Plugin root used to resolve shared packages, default the Vite root. */
  root?: string
  vue?: VueOptions
  /**
   * Dev-server overrides. Defaults open CORS so Kitsu (another origin) can
   * `import()` this entry, and listen on every interface for Docker.
   */
  server?: ServerOptions
}

/**
 * Vite config for an injected Kitsu plugin: a single ESM entry at
 * `dist/plugin.js` with its stylesheet inlined and Vue, the router, the store
 * and i18n borrowed from the host.
 *
 * `pnpm dev` serves the same entry from source so Kitsu can load it over HTTP
 * (`KITSU_PLUGIN_DEV_URLS`) with HMR on this Vite instance.
 *
 * Injects `__KITSU_PLUGIN_ID__` so `definePlugin()` can omit `id`.
 */
export const defineKitsuPluginConfig = (
  options: KitsuPluginConfigOptions = {}
): UserConfig => {
  const {
    entry = 'src/index.ts',
    shared = DEFAULT_SHARED_DEPS,
    root,
    vue: vueOptions,
    server
  } = options

  const frontendRoot = root ?? process.cwd()
  const pluginId = options.pluginId ?? readManifestPluginId(frontendRoot)
  const kitPackageRoot = resolveKitPackageRoot(frontendRoot)
  const kitSourceEntry = resolveKitSourceEntry(kitPackageRoot)

  return {
    // Overridden to `/` while serving (see plugin below): the browser loads
    // this origin directly in dev, and Zou's public path only applies to builds.
    base: kitsuPluginBase(pluginId),
    // No index.html to host static files for: Zou serves `dist/` directly.
    publicDir: false,
    define: {
      __KITSU_PLUGIN_ID__: JSON.stringify(pluginId)
    },
    // Dev: resolve the kit from source so `__KITSU_PLUGIN_ID__` is applied.
    // Prebuilt `dist/` (and the dep prebundle) skip Vite defines. Keep these
    // at top-level so Vite merges them before optimizeDeps / fs checks.
    resolve: {
      alias: {
        '@lesmoutonssauvages/kitsu-plugin-kit': kitSourceEntry
      }
    },
    optimizeDeps: {
      exclude: ['@lesmoutonssauvages/kitsu-plugin-kit']
    },
    plugins: [
      vue(vueOptions),
      kitsuSharedDeps({ root, shared }),
      kitsuInlineCss({ pluginId }),
      {
        name: 'kitsu-plugin-serve-base',
        config(_config, env) {
          if (env.command !== 'serve') return
          return { base: '/' }
        }
      }
    ],
    server: {
      host: true,
      cors: true,
      ...server,
      fs: {
        ...server?.fs,
        allow: [
          searchForWorkspaceRoot(frontendRoot),
          kitPackageRoot,
          ...(server?.fs?.allow ?? [])
        ]
      }
    },
    build: {
      target: 'es2020',
      cssCodeSplit: false,
      sourcemap: true,
      emptyOutDir: true,
      lib: {
        entry,
        formats: ['es'],
        fileName: () => 'plugin.js'
      },
      rollupOptions: {
        output: {
          chunkFileNames: 'chunks/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]'
        }
      }
    }
  }
}
