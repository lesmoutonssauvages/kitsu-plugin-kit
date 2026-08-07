import { n as e, r as t, t as n } from "./context-BaodsMri.js";
//#region src/define.ts
var r = (e) => e || (typeof __KITSU_PLUGIN_ID__ == "string" && __KITSU_PLUGIN_ID__ ? __KITSU_PLUGIN_ID__ : void 0), i = (e) => {
	let { messages: t, store: n, routes: i, slots: a, taskStatusSort: o, setup: s, teardown: c } = e, l = r(e.id);
	return {
		id: l,
		async activate(e) {
			if (!(l ?? e.pluginId)) throw Error("definePlugin: missing plugin id. Use defineKitsuPluginConfig() (reads ../manifest.toml) or pass id explicitly.");
			if (l && l !== e.pluginId) throw Error(`plugin id mismatch: the bundle declares "${l}" but the host loaded it as "${e.pluginId}"`);
			if (t && e.addMessages(t), n && e.registerStoreModule(`kitsu-plugin-${e.pluginId}`, n), i && e.addRoutes(i), a) for (let [t, n] of Object.entries(a)) n && e.registerSlot(t, n);
			o && e.registerTaskStatusSort(o), await s?.(e);
		},
		async deactivate(e) {
			await c?.(e);
		}
	};
};
//#endregion
export { n as PLUGIN_CONTEXT_META_KEY, i as definePlugin, e as usePluginContext, t as usePluginStore };

//# sourceMappingURL=index.js.map