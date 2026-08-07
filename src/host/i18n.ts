import type { I18n } from 'vue-i18n'

import type { KitsuPluginMessages } from '../types.js'

/** Messages the kit itself contributes, keyed like a plugin's. */
const KIT_MESSAGES: KitsuPluginMessages = {
  en: {
    plugins: {
      load_error: 'The {name} plugin could not be loaded.',
      page_not_found: 'This page does not exist in the {name} plugin.'
    }
  },
  fr: {
    plugins: {
      load_error: "Le plugin {name} n'a pas pu être chargé.",
      page_not_found: "Cette page n'existe pas dans le plugin {name}."
    }
  }
}

const contributions = new Map<string, KitsuPluginMessages>()

type Composer = {
  mergeLocaleMessage(locale: string, messages: Record<string, unknown>): void
  setLocaleMessage(locale: string, messages: Record<string, unknown>): void
}

const globalOf = (i18n: I18n): Composer => i18n.global

const merge = (i18n: I18n, messages: KitsuPluginMessages) => {
  for (const [locale, values] of Object.entries(messages)) {
    globalOf(i18n).mergeLocaleMessage(locale, values)
  }
}

export const registerMessages = (
  i18n: I18n,
  owner: string,
  messages: KitsuPluginMessages
): void => {
  contributions.set(owner, messages)
  merge(i18n, messages)
}

export const unregisterMessages = (owner: string): void => {
  contributions.delete(owner)
}

/**
 * Kitsu loads locales lazily through `setLocaleMessage`, which replaces the
 * whole locale and so drops the keys plugins merged into it. Wrapping it here
 * keeps that detail out of the host: every replacement re-merges whatever is
 * currently registered.
 */
export const installI18n = (i18n: I18n): void => {
  const composer = globalOf(i18n)
  const original = composer.setLocaleMessage.bind(composer)

  composer.setLocaleMessage = (locale, messages) => {
    original(locale, messages)
    for (const contribution of contributions.values()) {
      const forLocale = contribution[locale]
      if (forLocale) composer.mergeLocaleMessage(locale, forLocale)
    }
  }

  registerMessages(i18n, '@kit', KIT_MESSAGES)
}
