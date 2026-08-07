/**
 * Vuex 4 does not expose its typings through package.json `exports`, so a
 * plain `import from 'vuex'` does not type-check. The host only forwards the
 * module to plugin bundles and never calls into it through this import, so
 * declare it opaque here instead of forcing a `declare module 'vuex'` shim on
 * every consumer of the kit.
 */
declare module 'vuex' {
  const vuex: unknown
  export default vuex
}
