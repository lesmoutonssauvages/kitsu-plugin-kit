# kitsu-plugin-kit

Authoring and host runtime for **injected** Kitsu frontend plugins: Vue
bundles that run inside the Kitsu app (shared Vue / router / Vuex / i18n)
instead of an iframe. Plugins declare routes, store modules, UI slots, and
host `provide` overrides; the kit loads them into Kitsu.

Zou marks a plugin as injected when
`PLUGIN_FOLDER/<id>/frontend/dist/plugin.js` exists. The user-context field
`injected: true` is derived from that file — there is no `injected` flag in
`manifest.toml`. Without `plugin.js`, Kitsu keeps the iframe integration and
the plugin does not need this kit.

Navigation still comes from the manifest: `frontend_studio_enabled` (studio
sidebar) and `frontend_project_enabled` (production topbar).

Package layout:

| Import | Role |
| ------ | ---- |
| `kitsu-plugin-kit` | Plugin authoring (`definePlugin`, store/context helpers) |
| `kitsu-plugin-kit/vite` | Plugin Vite config (`defineKitsuPluginConfig`) |
| `kitsu-plugin-kit/host` | Kitsu host (`kitsuPlugins`, `PluginHost`, `PluginsSlot`) |
| `kitsu-plugin-kit/host/vite` | Host Vite helper (`kitsuPluginsDev`) |

This package uses **npm** (`package-lock.json`). Install with `npm install`.
After editing `src/`, run `npm run build` (or `npm run watch`), and
`npm run lint` / `npm run format` before committing. The `prepare` script
builds `dist/` on install.

## Runtime contract

The host loads `dist/plugin.js` and expects a default export shaped like:

```js
export default {
  async activate(context) {},
  async deactivate(context) {}
}
```

`definePlugin()` builds that object from a declarative definition. `slots` and
`providers` are attached to the export and applied by the host (not via
imperative APIs on `setup` context):

```ts
// src/index.ts
import { definePlugin } from 'kitsu-plugin-kit'

import ActionPanelExtraAfter from './components/ActionPanelExtraAfter.vue'
import ActionPanelExtraBefore from './components/ActionPanelExtraBefore.vue'
import en from './locales/en'
import { myModule } from './stores/main'

export default definePlugin({
  messages: { en },
  store: myModule,
  slots: {
    'action-topbar-menu:before': ActionPanelExtraBefore,
    'action-topbar-menu:after': ActionPanelExtraAfter
  },
  providers: {
    'ComboboxStatus.sortedTaskStatusList': (list, productionId) =>
      [...list].sort((a, b) => /* custom order */ 0)
  },
  routes: {
    studio: [
      { path: '', name: 'index', component: () => import('./views/Studio.vue') }
    ],
    production: [
      { path: '', redirect: { name: 'overview' } },
      {
        path: 'overview',
        name: 'overview',
        component: () => import('./views/Overview.vue')
      }
    ]
  },
  setup(context) {},
  teardown(context) {}
})
```

Everything declared here is undone on deactivation (unload, HMR): routes are
removed, the store module is unregistered, slots and host provider overrides are
cleared, and `context.onCleanup()` callbacks run in reverse order.

The Zou plugin `id` comes from the parent `manifest.toml` via
`defineKitsuPluginConfig` (injected as `__KITSU_PLUGIN_ID__`). Pass `id` to
`definePlugin` only to override.

## Routes

Routes are declared per scope and hang from the matching Kitsu route:

| Scope        | Kitsu parent route         | URL                                                       |
| ------------ | -------------------------- | --------------------------------------------------------- |
| `studio`     | `plugin`                   | `/plugins/<id>/...`                                       |
| `production` | `production-plugin`        | `/productions/:production_id/plugins/<id>/...`            |
| `episode`    | `episode-production-plugin`| `/productions/:production_id/episodes/:episode_id/plugins/<id>/...` |

`episode` defaults to the `production` routes when omitted.

Navigate with Vue Router as in any Vue app. The host namespaces page names
internally so they stay unique across plugins; authors keep the short names
declared in `definePlugin`.

```vue
<script setup lang="ts">
import { RouterLink, useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

router.push({ name: 'list' })
// route.meta.pluginPage === 'list'
</script>

<template>
  <RouterLink :to="{ name: 'new' }">Create</RouterLink>
  <RouterLink :to="{ name: 'detail', params: { ticketId: ticket.id } }">
    {{ ticket.title }}
  </RouterLink>
  <RouterLink :to="{ name: 'bank', params: { production_id: row.id } }">
    {{ row.name }}
  </RouterLink>
</template>
```

Scope follows the params: `episode_id` → episode, else `production_id` →
production, else studio. Current `plugin_id` is inherited. The current short
name is on `route.meta.pluginPage` (`route.name` stays the global name Kitsu
uses).

Do not reuse a Kitsu route name (`login`, `open-productions`, …) as a page
name: those already exist, so the host leaves them alone.

A `redirect: { name }` in `definePlugin` is resolved against the plugin's own
scope and keeps the current route params.

## Store

`store` is a namespaced Vuex module. The host registers it as
`kitsu-plugin-<id>` and adds a `pluginId` getter (the Zou plugin id). Use that
in actions for `/api/plugins/<id>/…` — do not close over the id yourself.

```ts
export const myModule: Module<MyState, unknown> = {
  namespaced: true,
  state: () => ({ items: [] }),
  actions: {
    async load({ commit, getters }) {
      const response = await fetch(`/api/plugins/${getters.pluginId}/items`)
      if (response.ok) commit('setItems', await response.json())
    }
  }
}
```

In views, `usePluginStore()` talks to that module without the host path:

```vue
<script setup lang="ts">
import { usePluginStore } from 'kitsu-plugin-kit'

const { state, commit, dispatch } = usePluginStore<MyState>()
commit('patch', { name: 'x' })
await dispatch('load')
</script>
```

A second module can still be registered in `setup` via
`context.registerStoreModule(name, module)`.

## Context

`usePluginContext()` reads the context from the current route's `meta`:

```vue
<script setup lang="ts">
import { usePluginContext } from 'kitsu-plugin-kit'

const context = usePluginContext()
// context.value.pluginId / manifest / store / productionId / storeModuleName / ...
</script>
```

## Slots

Injected plugins can mount Vue components into named host UI slots. Kitsu
exposes `action-topbar-menu` in `ActionPanel.vue` via:

```vue
<plugins-slot
  slot-name="action-topbar-menu"
  is="div"
  class="menu flexrow"
>
  <!-- host menu items -->
</plugins-slot>
```

`is` is optional. With `is`, contributions and host content are wrapped in that
element or component (attrs such as `class` apply to it). Without `is`,
`PluginsSlot` renders a fragment — no wrapper DOM node:

```vue
<plugins-slot slot-name="action-topbar-menu">
  <!-- host menu items -->
</plugins-slot>
```

Plugin keys are the slot name, optionally with a position suffix. Render order
is **before → (bare key | host content) → after**. A bare key replaces the
host default; `:before` / `:after` still wrap around that replacement:

```ts
export default definePlugin({
  slots: {
    'action-topbar-menu:before': ActionPanelExtraBefore,
    'action-topbar-menu': ActionPanelReplacement,
    'action-topbar-menu:after': ActionPanelExtraAfter
  }
})
```

Multiple plugins may fill the same key; they render in alphabetical order by
`pluginId`. Slots are applied by the host from the declarative map only (no
imperative `registerSlot` on `setup`). Registrations are removed on deactivate /
HMR.

## Providers

Plugins can override host `provide`/`inject` values via a declarative
`providers` map. Keys are plain strings (`<HostComponent>.<member>`); values
are opaque (`unknown`). The host applies them on activation — there is no
register API on `setup` context.

```ts
export default definePlugin({
  providers: {
    'ComboboxStatus.sortedTaskStatusList': (list, productionId) =>
      [...list].sort((a, b) =>
        String(a.short_name).localeCompare(String(b.short_name))
      )
  }
})
```

Example: `ComboboxStatus` injects `'ComboboxStatus.sortedTaskStatusList'` and,
when a value is present, uses it to order task statuses instead of Kitsu’s
default `sortTaskStatuses`. Last plugin to set a given key wins; on deactivate /
HMR the value is cleared.

## Build

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { defineKitsuPluginConfig } from 'kitsu-plugin-kit/vite'

export default defineConfig(defineKitsuPluginConfig())
```

`pluginId` is read from `../manifest.toml` (`id = "…"`). Pass `pluginId` only
to override. Vite also injects `__KITSU_PLUGIN_ID__` for `definePlugin`.

This produces a single `dist/plugin.js` (plus lazy chunks) with the stylesheet
inlined, served by Zou at `/api/plugins/<id>/frontend/plugin.js`.

`vue`, `vue-router`, `vuex` and `vue-i18n` are not bundled: imports are
rewritten to read the host instances from `globalThis.__KITSU_SHARED__`. They
must still be installed as plugin dependencies **at the versions the host
uses** — the build reads their export lists to generate the shims, and a
version mismatch means missing or extra names.

## Development

Each plugin runs its **own Vite instance**. Point Kitsu at those entries:

```sh
# terminal 1 — plugin frontend
cd path/to/my-plugin/frontend && npm run dev   # e.g. :5173

# terminal 2 — another plugin (optional)
cd path/to/other-plugin/frontend && npm run dev   # e.g. :5174

# terminal 3 — Kitsu
cd path/to/kitsu
KITSU_PLUGIN_DEV_URLS=\
my-plugin=http://127.0.0.1:5173/src/index.ts,\
other-plugin=http://127.0.0.1:5174/src/index.ts \
  npm run dev
```

The host `import()`s those URLs (CORS is open on the plugin servers). Vue /
router / store / i18n still come from the host via `globalThis.__KITSU_SHARED__`.
Edits hot-reload on the plugin Vite; entry changes deactivate and reactivate
the plugin in place.

Alternatively, compile plugin sources inside Kitsu's Vite (single graph):

```sh
KITSU_PLUGIN_DEV_PATHS=../../zou-plugins/*/frontend npm run dev
```

To exercise the real bundle instead, run `npm run watch` (or
`vite build --watch`) in the plugin frontend and let Zou serve `dist/`; the
host then reloads the built `plugin.js`.

**HMR note:** Zou still needs `frontend/dist/plugin.js` on disk (a built file
or a stub) so the user context returns `injected: true`. Dev URLs only replace
*what* is loaded, not the injected flag.

## Testing locally

Use these checklists against Zou on `feat/poc-injected-plugin-option` with the
plugin installed, and Kitsu running (`npm run dev`, optionally with
`KITSU_PLUGIN_DEV_URLS` / `KITSU_PLUGIN_DEV_PATHS` as above).

It is useful to also install a **legacy iframe** plugin side by side, so you can
compare iframe vs injected behaviour. The sample
[cgwire/kitsu-tickets](https://github.com/cgwire/kitsu-tickets) plugin is a
good baseline (Nuxt frontend, no `plugin.js`):

```sh
git clone https://github.com/cgwire/kitsu-tickets.git
zou install-plugin --path ./kitsu-tickets
# restart Zou, then open the tickets plugin in Kitsu — it should stay in an iframe
```

### 1. Frontend injection

1. Build the plugin frontend with `defineKitsuPluginConfig()` so
   `frontend/dist/plugin.js` exists (`npm run build` in the plugin frontend).
2. Install: `zou install-plugin --path /path/to/plugin` (use `--force` to
   upgrade), then restart Zou.
3. Confirm `PLUGIN_FOLDER/<id>/frontend/dist/plugin.js` is present and served
   (e.g. `/api/plugins/<id>/frontend/plugin.js` through Kitsu’s proxy).
4. Log in and check the user context: the plugin entry has `"injected": true`.
5. Open `/plugins/<id>/…` (studio) or the production plugin route from the
   topbar. Expect `<plugin-host>` (not an iframe) and any plugin routes /
   views mounting inside Kitsu.
6. Negative check: remove or rename `plugin.js`, restart Zou, reload context →
   `"injected": false` → iframe to `/api/plugins/<id>/frontend/`.

### 2. Slot injection (`action-topbar-menu`)

1. Declare `slots: { 'action-topbar-menu:before': … }` and/or
   `'action-topbar-menu:after'` in an injected plugin.
2. Load the plugin (step 1 above, or HMR with a stub `plugin.js`).
3. Select one or more tasks so `ActionPanel` appears.
4. Expect your UI before and/or after the host menu items (Status / Assign / …).
5. Deactivate / HMR unload → the slot content disappears.

### 3. Provider override (`ComboboxStatus.sortedTaskStatusList`)

1. Declare `providers: { 'ComboboxStatus.sortedTaskStatusList': fn }` with an
   order that is obviously different from Kitsu’s default.
2. Load the injected plugin.
3. Open any `ComboboxStatus` (ActionPanel “change status”, task UI, …).
4. Expect the dropdown order to follow your function.
5. Deactivate / HMR unload → order returns to Kitsu’s `sortTaskStatuses`.

## Constraints

- Do not name a plugin page after an existing Kitsu route (`login`, …): the
  host only rewrites names that are not already registered.
- Use relative imports inside a plugin (keeps the package portable). An `@/`
  alias is fine on the plugin's own Vite instance, but do not point it at
  Kitsu's `src`.
- Plugin styles are global. Use `<style scoped>`; the host wraps plugin views in
  a `[data-plugin]` element for extra scoping.
- SCSS is not preprocessed with Kitsu's variables in a plugin build. Use plain
  CSS with Kitsu's CSS custom properties (`--text-primary`, `--bg-card`, ...).
