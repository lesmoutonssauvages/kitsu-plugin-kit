import type { Plugin } from 'vite';
export { DEFAULT_SHARED_DEPS, SHARED_GLOBAL } from '../shared-global.js';
export interface KitsuSharedDepsOptions {
    /** Plugin root used to resolve the shared packages, default the Vite root. */
    root?: string;
    shared?: string[];
}
/**
 * Rewrites imports of the shared packages into lookups on the host globals,
 * keeping the bundle in ESM format so code splitting and dynamic imports
 * still work.
 */
export declare const kitsuSharedDeps: ({ root, shared }?: KitsuSharedDepsOptions) => Plugin;
//# sourceMappingURL=shared-deps.d.ts.map