import type { Plugin } from 'vite'

export interface KitsuInlineCssOptions {
  pluginId: string
}

/**
 * Folds the plugin stylesheet into the entry chunk so the host only ever
 * fetches `plugin.js`. The tag is marked with `data-kitsu-plugin` so the host
 * can drop the styles again when it deactivates the plugin.
 */
export const kitsuInlineCss = ({
  pluginId
}: KitsuInlineCssOptions): Plugin => ({
  name: 'kitsu-plugin-inline-css',
  apply: 'build',
  enforce: 'post',

  generateBundle(_options, bundle) {
    const stylesheets = Object.values(bundle).filter(
      file => file.type === 'asset' && file.fileName.endsWith('.css')
    )
    if (!stylesheets.length) return

    const entry = Object.values(bundle).find(
      file => file.type === 'chunk' && file.isEntry
    )
    if (!entry || entry.type !== 'chunk') return

    const css = stylesheets
      .map(file => (file.type === 'asset' ? String(file.source) : ''))
      .join('\n')

    // Imports are hoisted, so this statement runs before the rest of the
    // module body even though it sits above the import declarations.
    entry.code =
      [
        `;(() => {`,
        `  if (typeof document === 'undefined') return`,
        `  const id = ${JSON.stringify(pluginId)}`,
        `  if (document.querySelector('style[data-kitsu-plugin="' + id + '"]')) return`,
        `  const style = document.createElement('style')`,
        `  style.setAttribute('data-kitsu-plugin', id)`,
        `  style.textContent = ${JSON.stringify(css)}`,
        `  document.head.append(style)`,
        `})();`,
        ''
      ].join('\n') + entry.code

    stylesheets.forEach(file => {
      delete bundle[file.fileName]
    })
  }
})
