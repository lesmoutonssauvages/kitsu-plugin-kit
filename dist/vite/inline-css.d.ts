import type { Plugin } from 'vite';
export interface KitsuInlineCssOptions {
    pluginId: string;
}
/**
 * Folds the plugin stylesheet into the entry chunk so the host only ever
 * fetches `plugin.js`. The tag is marked with `data-kitsu-plugin` so the host
 * can drop the styles again when it deactivates the plugin.
 */
export declare const kitsuInlineCss: ({ pluginId }: KitsuInlineCssOptions) => Plugin;
//# sourceMappingURL=inline-css.d.ts.map