import type { I18n } from 'vue-i18n';
import type { KitsuPluginMessages } from '../types.js';
export declare const registerMessages: (i18n: I18n, owner: string, messages: KitsuPluginMessages) => void;
export declare const unregisterMessages: (owner: string) => void;
/**
 * Kitsu loads locales lazily through `setLocaleMessage`, which replaces the
 * whole locale and so drops the keys plugins merged into it. Wrapping it here
 * keeps that detail out of the host: every replacement re-merges whatever is
 * currently registered.
 */
export declare const installI18n: (i18n: I18n) => void;
//# sourceMappingURL=i18n.d.ts.map