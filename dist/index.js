import { n as e, r as t, t as n } from "./context-bss97D_5.js";
//#region src/define.ts
var r = (e) => e || (typeof __KITSU_PLUGIN_ID__ == "string" && __KITSU_PLUGIN_ID__ ? __KITSU_PLUGIN_ID__ : void 0), i = (e) => {
	let { messages: t, store: n, routes: i, slots: a, providers: o, setup: s, teardown: c } = e, l = r(e.id);
	return {
		id: l,
		slots: a,
		providers: o,
		async activate(e) {
			if (!(l ?? e.pluginId)) throw Error("definePlugin: missing plugin id. Use defineKitsuPluginConfig() (reads ../manifest.toml) or pass id explicitly.");
			if (l && l !== e.pluginId) throw Error(`plugin id mismatch: the bundle declares "${l}" but the host loaded it as "${e.pluginId}"`);
			t && e.addMessages(t), n && e.registerStoreModule(`kitsu-plugin-${e.pluginId}`, n), i && e.addRoutes(i), await s?.(e);
		},
		async deactivate(e) {
			await c?.(e);
		}
	};
};
//#endregion
export { n as PLUGIN_CONTEXT_META_KEY, i as definePlugin, e as usePluginContext, t as usePluginStore };

//# sourceMappingURL=index.js.map