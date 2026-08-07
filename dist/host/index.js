import { t as e } from "../context-BaodsMri.js";
import { n as t } from "../shared-global-CrQAd8Bc.js";
import * as n from "vue";
import { Fragment as r, computed as i, createBlock as a, createCommentVNode as o, createElementBlock as s, createElementVNode as c, createTextVNode as ee, defineComponent as l, markRaw as u, normalizeStyle as d, openBlock as f, reactive as p, ref as te, renderList as ne, resolveDynamicComponent as re, shallowRef as ie, toDisplayString as m, unref as h, watch as ae } from "vue";
import * as oe from "vue-router";
import { RouterView as se, useRoute as g } from "vue-router";
import { devPlugins as ce } from "virtual:kitsu-plugins-dev";
import * as le from "vue-i18n";
import * as ue from "vuex";
//#region src/route-names.ts
var _ = {
	studio: "plugin",
	production: "production-plugin",
	episode: "episode-production-plugin"
}, v = (e, t, n) => {
	let r = _[t];
	if (!r) throw Error(`Unknown Kitsu plugin route scope "${t}".`);
	return `${e}-${r}-${n}`;
}, y = p({}), b = null, de = (e) => {
	b = e;
}, x = () => b, fe = () => (b?.store.getters.plugins ?? []).filter((e) => e.injected), S = (e) => (b?.store.getters.plugins ?? []).find((t) => t.plugin_id === e), C = {
	color: "var(--text)",
	padding: "1em 0"
}, pe = {
	color: "var(--red, #ff3860)",
	padding: "1em 0"
}, me = {
	color: "var(--text-alt)",
	display: "block",
	fontSize: "0.9em",
	marginTop: "0.3em"
}, w = () => {
	let e = g();
	return i(() => String(e.params.plugin_id ?? ""));
}, T = (e, t) => {
	let n = x()?.i18n?.global?.t;
	return n ? n(e, { name: t }) : e;
}, E = (e) => S(e)?.name ?? e, he = /* @__PURE__ */ l({
	name: "KitsuPluginHost",
	__name: "PluginHost",
	setup(e) {
		let t = w(), n = i(() => y[t.value]), r = i(() => E(t.value));
		return (e, t) => (f(), s("div", null, [n.value?.status === "error" ? (f(), s("p", {
			key: 0,
			class: "kitsu-plugin-message",
			style: d(h(pe))
		}, [ee(m(h(T)("plugins.load_error", r.value)) + " ", 1), c("span", { style: d(h(me)) }, m(n.value.error ?? ""), 5)], 4)) : n.value?.status === "active" ? (f(), a(h(se), { key: 2 })) : (f(), s("p", {
			key: 1,
			class: "kitsu-plugin-message",
			style: d(h(C))
		}, m(h(T)("main.loading", r.value)), 5))]));
	}
}), ge = /* @__PURE__ */ l({
	name: "KitsuPluginPending",
	__name: "PluginPending",
	setup(e) {
		let t = w(), n = i(() => y[t.value]?.status !== "loading"), r = i(() => E(t.value));
		return (e, t) => n.value ? (f(), s("p", {
			key: 0,
			class: "kitsu-plugin-message",
			style: d(h(C))
		}, m(h(T)("plugins.page_not_found", r.value)), 5)) : o("", !0);
	}
}), D = te({}), _e = (e, t, n) => {
	let r = [...D.value[e] ?? [], {
		pluginId: t,
		component: u(n)
	}];
	r.sort((e, t) => e.pluginId.localeCompare(t.pluginId)), D.value = {
		...D.value,
		[e]: r
	};
}, ve = (e, t, n) => {
	let r = D.value[e];
	if (!r) return;
	let i = r.filter((e) => e.pluginId !== t || e.component !== n), a = { ...D.value };
	i.length === 0 ? delete a[e] : a[e] = i, D.value = a;
}, ye = (e) => D.value[e] ?? [], O = Symbol.for("kitsu.taskStatusSort"), k = ie(null), A = null, be = (e, t) => {
	A = e, k.value = u(t);
}, xe = (e) => {
	A === e && (A = null, k.value = null);
}, j = {
	en: { plugins: {
		load_error: "The {name} plugin could not be loaded.",
		page_not_found: "This page does not exist in the {name} plugin."
	} },
	fr: { plugins: {
		load_error: "Le plugin {name} n'a pas pu être chargé.",
		page_not_found: "Cette page n'existe pas dans le plugin {name}."
	} }
}, M = /* @__PURE__ */ new Map(), N = (e) => e.global, Se = (e, t) => {
	for (let [n, r] of Object.entries(t)) N(e).mergeLocaleMessage(n, r);
}, P = (e, t, n) => {
	M.set(t, n), Se(e, n);
}, Ce = (e) => {
	M.delete(e);
}, we = (e) => {
	let t = N(e), n = t.setLocaleMessage.bind(t);
	t.setLocaleMessage = (e, r) => {
		n(e, r);
		for (let n of M.values()) {
			let r = n[e];
			r && t.mergeLocaleMessage(e, r);
		}
	}, P(e, "@kit", j);
}, Te = "pluginPage", F = /* @__PURE__ */ new Map(), I = (e) => typeof e == "string" && e.length > 0, L = (e, t) => {
	let n = e?.[t];
	if (I(n)) return n;
	if (Array.isArray(n) && I(n[0])) return n[0];
}, R = (e) => e && typeof e == "object" && !Array.isArray(e) ? e : {}, Ee = (e) => I(L(e, "episode_id")) ? "episode" : I(L(e, "production_id")) ? "production" : "studio", De = (e) => {
	let t = e;
	return typeof t.name == "string" && t.name ? t.name : t.path === "" ? "index" : null;
}, z = (e, t = /* @__PURE__ */ new Set()) => {
	for (let n of e ?? []) {
		let e = De(n);
		e && t.add(e);
		let r = n.children;
		r && z(r, t);
	}
	return t;
}, Oe = (e, t) => {
	let n = F.get(e);
	n || (n = /* @__PURE__ */ new Set(), F.set(e, n));
	let r = [];
	for (let e of t) n.has(e) || (n.add(e), r.push(e));
	return () => {
		let t = F.get(e);
		if (t) {
			for (let e of r) t.delete(e);
			t.size === 0 && F.delete(e);
		}
	};
}, B = (e, t, n) => {
	if (typeof t != "object" || !t || !("name" in t) || t.name == null || "path" in t && t.path) return t;
	let r = t.name;
	if (typeof r != "string" || e.hasRoute(r)) return t;
	let i = R(n?.params ?? e.currentRoute.value.params), a = R("params" in t ? t.params : void 0), o = {
		...i,
		...a
	}, s = L(o, "plugin_id");
	if (!s || !F.get(s)?.has(r)) return t;
	let c = Ee(o);
	return {
		...t,
		name: v(s, c, r),
		params: {
			...o,
			plugin_id: s
		}
	};
}, ke = (e) => {
	let t = e.resolve.bind(e), n = e.push.bind(e), r = e.replace.bind(e);
	e.resolve = (n, r) => t(B(e, n, r), r), e.push = (t) => n(B(e, t)), e.replace = (t) => r(B(e, t));
}, V = (e) => e, H = (e) => e, Ae = (e) => e === void 0 ? [] : Array.isArray(e) ? e : [e], U = (e, t, n) => {
	let r = V(e), i = { ...r }, a = r.name ?? (r.path === "" ? "index" : null);
	a && (i.name = v(t, n, a), i.meta = {
		...i.meta,
		[Te]: a
	});
	let o = r.redirect;
	if (typeof o == "object" && o.name) {
		let e = v(t, n, o.name);
		i.redirect = (r) => r.params.plugin_id === t ? {
			...o,
			name: e,
			params: {
				...r.params,
				...o.params
			}
		} : {
			name: _[n],
			params: r.params
		};
	}
	return r.children && (i.children = r.children.map((e) => U(e, t, n))), H(i);
}, je = (e, t, n) => {
	let r = V(e);
	return H({
		...r,
		beforeEnter: [(e) => e.params.plugin_id === t ? void 0 : {
			name: n,
			params: e.params,
			replace: !0
		}, ...Ae(r.beforeEnter)]
	});
}, Me = (t, n) => {
	let r = n.plugin_id, i = [], a = null, o = {
		pluginId: r,
		manifest: n,
		app: t.app,
		router: t.router,
		store: t.store,
		i18n: t.i18n,
		head: t.head,
		get productionId() {
			return t.router.currentRoute.value.params.production_id ?? null;
		},
		get episodeId() {
			return t.router.currentRoute.value.params.episode_id ?? null;
		},
		get storeModuleName() {
			return a;
		},
		onCleanup: (e) => {
			i.push(e);
		},
		registerSlot: (e, t) => {
			_e(e, r, t), i.push(() => ve(e, r, t));
		},
		registerTaskStatusSort: (e) => {
			be(r, e), i.push(() => xe(r));
		},
		addMessages: (e) => {
			P(t.i18n, r, e), i.push(() => Ce(r));
		},
		registerStoreModule: (e, n) => {
			let o = n, s = {
				...n,
				namespaced: !0,
				getters: {
					...o.getters,
					pluginId: () => r
				}
			};
			a = e, t.store.hasModule(e) && t.store.unregisterModule(e), t.store.registerModule(e, s), i.push(() => {
				a === e && (a = null), t.store.hasModule(e) && t.store.unregisterModule(e);
			});
		},
		addRoutes: (n) => {
			let a = { ...n };
			a.episode ??= a.production;
			let s = /* @__PURE__ */ new Set();
			for (let e of Object.values(a)) z(e, s);
			i.push(Oe(r, s));
			for (let [n, s] of Object.entries(a)) {
				let a = _[n];
				if (!a) throw Error(`Unknown plugin route scope "${n}"`);
				if (t.router.hasRoute(a)) for (let c of s ?? []) {
					let s = V(je(U(c, r, n), r, a));
					s.meta = {
						...s.meta,
						[e]: o
					}, i.push(t.router.addRoute(a, H(s)));
				}
			}
		}
	};
	return {
		context: o,
		dispose: async () => {
			for (let e of i.reverse()) try {
				await e();
			} catch (e) {
				console.error(`[plugins] "${r}" cleanup failed:`, e);
			}
			i.length = 0;
		}
	};
}, Ne = () => {
	globalThis[t] = { modules: {
		vue: n,
		"vue-router": oe,
		vuex: ue,
		"vue-i18n": le
	} };
}, W = 4e3, G = /* @__PURE__ */ new Map(), K = /* @__PURE__ */ new Map(), Pe = ((e) => {
	let t = {};
	for (let n of e.split(",")) {
		let e = n.trim();
		if (!e) continue;
		let r = e.indexOf("=");
		r !== -1 && (t[e.slice(0, r)] = e.slice(r + 1));
	}
	return t;
})(typeof __KITSU_PLUGIN_DEV_URLS__ == "string" ? __KITSU_PLUGIN_DEV_URLS__ : ""), q = (e, t, n) => new Promise((r, i) => {
	let a = setTimeout(() => i(Error(n)), t);
	e.then((e) => {
		clearTimeout(a), r(e);
	}, (e) => {
		clearTimeout(a), i(e instanceof Error ? e : Error(String(e)));
	});
}), Fe = (e) => {
	let t = Pe[e.plugin_id];
	if (t) return q(import(
		/* @vite-ignore */
		t
), W, `dev server did not answer at ${t} within ${W}ms`);
	let n = ce[e.plugin_id];
	if (n) return n();
	let r = encodeURIComponent(e.version ?? "");
	return q(import(
		/* @vite-ignore */
		`/api/plugins/${e.plugin_id}/frontend/plugin.js?v=${r}`
), W, `plugin bundle at /api/plugins/${e.plugin_id}/frontend/plugin.js did not load`);
}, Ie = async (e, t) => {
	let n = e.plugin_id, r = x();
	if (r) {
		y[n] = {
			status: "loading",
			error: null
		};
		try {
			let i = (t ?? await Fe(e))?.default;
			if (typeof i?.activate != "function") throw Error("the bundle does not default-export a plugin definition");
			let a = Me(r, e);
			await i.activate(a.context), G.set(n, {
				definition: i,
				...a
			}), y[n] = {
				status: "active",
				error: null
			};
		} catch (e) {
			console.error(`[plugins] "${n}" failed to activate:`, e), y[n] = {
				status: "error",
				error: e instanceof Error ? e.message : String(e)
			};
		}
	}
}, J = (e) => {
	let t = e.plugin_id;
	if (!e.injected || G.has(t) || y[t]?.status === "error") return Promise.resolve();
	let n = K.get(t);
	return n || (n = Ie(e).finally(() => {
		K.delete(t);
	}), K.set(t, n)), n;
}, Y = () => {
	for (let e of fe()) J(e);
}, Le = Object.values(_), Re = Object.fromEntries(Object.entries(_).map(([e, t]) => [t, e])), X = "-pending", Z = (e) => typeof e == "string" && e.endsWith(X), ze = /\/plugins\/([^/]+)(?:\/|$)/, Be = (e) => {
	let t = e.params.plugin_id;
	return typeof t == "string" && t ? t : Array.isArray(t) && typeof t[0] == "string" ? t[0] : e.path.match(ze)?.[1] ?? null;
}, Q = (e) => e.meta.kitsuPlugin?.pluginId ?? null, Ve = (e, t, n) => {
	let r = e.router.getRoutes().find((e) => e.name === n);
	if (!r) return null;
	for (let n of e.router.getRoutes()) if (Q(n) === t && !(!n.name || Z(n.name)) && n.path === r.path) return String(n.name);
	return null;
}, He = (e, t, n) => {
	let r = Re[String(n.name)];
	if (!r) return null;
	let i = _[r], a = v(t, r, "index"), o = e.router.hasRoute(a) ? a : Ve(e, t, i);
	if (!o) return null;
	let s = e.router.getRoutes().find((e) => e.name === o)?.redirect;
	if (typeof s == "function") {
		let e = s(n, n);
		if (e && typeof e == "object") return {
			...e,
			replace: !0,
			force: !0
		};
	} else if (typeof s == "string") return {
		path: s,
		replace: !0,
		force: !0
	};
	else if (s && typeof s == "object") return {
		...s,
		replace: !0,
		force: !0
	};
	return {
		name: o,
		params: n.params,
		query: n.query,
		replace: !0,
		force: !0
	};
}, $ = (e) => {
	for (let t of Le) {
		if (!e.router.hasRoute(t)) continue;
		let n = `${t}${X}`;
		e.router.hasRoute(n) || e.router.addRoute(t, {
			path: ":pluginPath(.*)+",
			name: n,
			component: ge
		});
	}
}, Ue = (e) => {
	e.router.beforeResolve(async (t) => {
		let n = Be(t);
		if (!n) return !0;
		if ($(e), t.name === "not-found") return e.router.resolve(t.fullPath).name === "not-found" || {
			path: t.fullPath,
			replace: !0,
			force: !0
		};
		let r = S(n);
		if (!r?.injected) return !0;
		await J(r);
		let i = He(e, n, t);
		if (i) return i;
		let a = e.router.resolve(t.fullPath);
		return a.name && a.name !== t.name && a.name !== "not-found" && !Z(a.name) && (Q(a) ?? n) === n ? {
			path: t.fullPath,
			replace: !0,
			force: !0
		} : !0;
	});
}, We = (e) => {
	de(e), Ne(), we(e.i18n), ke(e.router), $(e), Ue(e), ae(() => e.store.getters.plugins, () => {
		Y();
	}, { immediate: !0 });
}, Ge = /* @__PURE__ */ l({
	__name: "PluginsSlot",
	props: { slotName: {} },
	setup(e) {
		let t = e, n = i(() => D.value[t.slotName] ?? []);
		return (e, t) => (f(!0), s(r, null, ne(n.value, (e) => (f(), a(re(e.component), { key: e.pluginId }))), 128));
	}
}), Ke = { install(e, t) {
	e.provide(O, k), We({
		app: e,
		...t
	});
} };
//#endregion
export { he as PluginHost, Ge as PluginsSlot, O as TASK_STATUS_SORT_KEY, Y as activatePlugins, S as findPlugin, ye as getSlotEntries, Ke as kitsuPlugins, y as pluginStates, D as slotRegistry, k as taskStatusSortFn };

//# sourceMappingURL=index.js.map