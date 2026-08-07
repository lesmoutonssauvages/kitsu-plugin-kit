/// <reference types="vite/client" />

/**
 * Vite 8's `vite/client` no longer ships a `*.vue` shim. Without this,
 * TypeScript (and ESLint's type-aware rules) resolve `.vue` imports as the
 * intrinsic `error` type — vue-tsc still understands them via Volar.
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}
