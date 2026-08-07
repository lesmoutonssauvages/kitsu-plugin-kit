import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { findPlugin, getHost } from './state.js'

/* Styles live here rather than in a stylesheet so the host does not have to
   import one. They follow Kitsu's CSS variables, with literal fallbacks for
   the SCSS-only colours. */
export const MESSAGE_STYLE = { color: 'var(--text)', padding: '1em 0' }
export const ERROR_STYLE = { color: 'var(--red, #ff3860)', padding: '1em 0' }
export const DETAIL_STYLE = {
  color: 'var(--text-alt)',
  display: 'block',
  fontSize: '0.9em',
  marginTop: '0.3em'
}

export const usePluginId = () => {
  const route = useRoute()
  return computed(() => String(route.params.plugin_id ?? ''))
}

export const translate = (key: string, name: string): string => {
  const i18n = getHost()?.i18n
  const t = (
    i18n?.global as { t?: (k: string, v: object) => string } | undefined
  )?.t
  return t ? t(key, { name }) : key
}

export const pluginName = (pluginId: string): string =>
  findPlugin(pluginId)?.name ?? pluginId
