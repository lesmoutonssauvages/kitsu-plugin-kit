import type { RouteLocationNormalizedLoaded, RouteLocationRaw, RouteRecordRaw, Router } from 'vue-router';
import { type KitsuPluginScope } from '../route-names.js';
/** Short page name declared in `definePlugin`, stamped on the matched record. */
export declare const PLUGIN_PAGE_META_KEY = "pluginPage";
export declare const inferScope: (params: Record<string, unknown>) => KitsuPluginScope;
export declare const collectPluginPages: (records: RouteRecordRaw[] | undefined, into?: Set<string>) => Set<string>;
export declare const registerPluginPages: (pluginId: string, pages: Iterable<string>) => (() => void);
export declare const rewriteLocation: (router: Router, to: RouteLocationRaw, currentLocation?: Pick<RouteLocationNormalizedLoaded, "params">) => RouteLocationRaw;
/**
 * `createRouter()` closes `push`/`replace` over an internal resolve, so
 * patching `router.resolve` alone would make `RouterLink` work but not
 * `router.push`. Wrap all three once at host install.
 */
export declare const installPluginNavigation: (router: Router) => void;
//# sourceMappingURL=navigation.d.ts.map