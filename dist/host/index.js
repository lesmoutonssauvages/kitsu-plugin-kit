import { t as e } from "../context-bss97D_5.js";
import { n as t } from "../shared-global-CrQAd8Bc.js";
import * as n from "vue";
import { Fragment as r, computed as i, createBlock as a, createCommentVNode as o, createElementBlock as s, createElementVNode as c, createTextVNode as ee, defineComponent as l, markRaw as u, mergeProps as te, normalizeProps as ne, normalizeStyle as d, openBlock as f, reactive as re, ref as ie, renderList as p, renderSlot as m, resolveDynamicComponent as h, shallowRef as ae, toDisplayString as g, unref as _, useAttrs as oe, watch as se, withCtx as ce } from "vue";
import * as le from "vue-router";
import { RouterView as ue, useRoute as de } from "vue-router";
import { devPlugins as fe } from "virtual:kitsu-plugins-dev";
import * as pe from "vue-i18n";
import * as me from "vuex";
//#region src/host/providers.ts
var v = /* @__PURE__ */ new Map(), y = /* @__PURE__ */ new Map(), b = (e) => {
	let t = v.get(e);
	return t || (t = ae(void 0), v.set(e, t)), t;
}, he = ["ComboboxStatus.sortedTaskStatusList"], ge = (e, t = he) => {
	for (let n of t) e.provide(n, b(n));
}, _e = (e, t, n) => {
	if (t) for (let [r, i] of Object.entries(t)) {
		let t = b(r);
		y.set(r, e), t.value = i !== null && (typeof i == "object" || typeof i == "function") ? u(i) : i, n(() => {
			y.get(r) === e && (y.delete(r), t.value = void 0);
		});
	}
}, x = {
	studio: "plugin",
	production: "production-plugin",
	episode: "episode-production-plugin"
}, S = (e, t, n) => {
	let r = x[t];
	if (!r) throw Error(`Unknown Kitsu plugin route scope "${t}".`);
	return `${e}-${r}-${n}`;
}, C = re({}), w = null, ve = (e) => {
	w = e;
}, T = () => w, ye = () => (w?.store.getters.plugins ?? []).filter((e) => e.injected), E = (e) => (w?.store.getters.plugins ?? []).find((t) => t.plugin_id === e), D = {
	color: "var(--text)",
	padding: "1em 0"
}, be = {
	color: "var(--red, #ff3860)",
	padding: "1em 0"
}, xe = {
	color: "var(--text-alt)",
	display: "block",
	fontSize: "0.9em",
	marginTop: "0.3em"
}, O = () => {
	let e = de();
	return i(() => String(e.params.plugin_id ?? ""));
}, k = (e, t) => {
	let n = T()?.i18n?.global?.t;
	return n ? n(e, { name: t }) : e;
}, A = (e) => E(e)?.name ?? e, Se = /* @__PURE__ */ l({
	name: "KitsuPluginHost",
	__name: "PluginHost",
	setup(e) {
		let t = O(), n = i(() => C[t.value]), r = i(() => A(t.value));
		return (e, t) => (f(), s("div", null, [n.value?.status === "error" ? (f(), s("p", {
			key: 0,
			class: "kitsu-plugin-message",
			style: d(_(be))
		}, [ee(g(_(k)("plugins.load_error", r.value)) + " ", 1), c("span", { style: d(_(xe)) }, g(n.value.error ?? ""), 5)], 4)) : n.value?.status === "active" ? (f(), a(_(ue), { key: 2 })) : (f(), s("p", {
			key: 1,
			class: "kitsu-plugin-message",
			style: d(_(D))
		}, g(_(k)("main.loading", r.value)), 5))]));
	}
}), Ce = /* @__PURE__ */ l({
	name: "KitsuPluginPending",
	__name: "PluginPending",
	setup(e) {
		let t = O(), n = i(() => C[t.value]?.status !== "loading"), r = i(() => A(t.value));
		return (e, t) => n.value ? (f(), s("p", {
			key: 0,
			class: "kitsu-plugin-message",
			style: d(_(D))
		}, g(_(k)("plugins.page_not_found", r.value)), 5)) : o("", !0);
	}
}), we = {
	en: { plugins: {
		load_error: "The {name} plugin could not be loaded.",
		page_not_found: "This page does not exist in the {name} plugin."
	} },
	fr: { plugins: {
		load_error: "Le plugin {name} n'a pas pu être chargé.",
		page_not_found: "Cette page n'existe pas dans le plugin {name}."
	} }
}, j = /* @__PURE__ */ new Map(), M = (e) => e.global, Te = (e, t) => {
	for (let [n, r] of Object.entries(t)) M(e).mergeLocaleMessage(n, r);
}, N = (e, t, n) => {
	j.set(t, n), Te(e, n);
}, Ee = (e) => {
	j.delete(e);
}, De = (e) => {
	let t = M(e), n = t.setLocaleMessage.bind(t);
	t.setLocaleMessage = (e, r) => {
		n(e, r);
		for (let n of j.values()) {
			let r = n[e];
			r && t.mergeLocaleMessage(e, r);
		}
	}, N(e, "@kit", we);
}, Oe = "pluginPage", P = /* @__PURE__ */ new Map(), F = (e) => typeof e == "string" && e.length > 0, I = (e, t) => {
	let n = e?.[t];
	if (F(n)) return n;
	if (Array.isArray(n) && F(n[0])) return n[0];
}, L = (e) => e && typeof e == "object" && !Array.isArray(e) ? e : {}, ke = (e) => F(I(e, "episode_id")) ? "episode" : F(I(e, "production_id")) ? "production" : "studio", Ae = (e) => {
	let t = e;
	return typeof t.name == "string" && t.name ? t.name : t.path === "" ? "index" : null;
}, R = (e, t = /* @__PURE__ */ new Set()) => {
	for (let n of e ?? []) {
		let e = Ae(n);
		e && t.add(e);
		let r = n.children;
		r && R(r, t);
	}
	return t;
}, je = (e, t) => {
	let n = P.get(e);
	n || (n = /* @__PURE__ */ new Set(), P.set(e, n));
	let r = [];
	for (let e of t) n.has(e) || (n.add(e), r.push(e));
	return () => {
		let t = P.get(e);
		if (t) {
			for (let e of r) t.delete(e);
			t.size === 0 && P.delete(e);
		}
	};
}, z = (e, t, n) => {
	if (typeof t != "object" || !t || !("name" in t) || t.name == null || "path" in t && t.path) return t;
	let r = t.name;
	if (typeof r != "string" || e.hasRoute(r)) return t;
	let i = L(n?.params ?? e.currentRoute.value.params), a = L("params" in t ? t.params : void 0), o = {
		...i,
		...a
	}, s = I(o, "plugin_id");
	if (!s || !P.get(s)?.has(r)) return t;
	let c = ke(o);
	return {
		...t,
		name: S(s, c, r),
		params: {
			...o,
			plugin_id: s
		}
	};
}, Me = (e) => {
	let t = e.resolve.bind(e), n = e.push.bind(e), r = e.replace.bind(e);
	e.resolve = (n, r) => t(z(e, n, r), r), e.push = (t) => n(z(e, t)), e.replace = (t) => r(z(e, t));
}, B = (e) => e, V = (e) => e, Ne = (e) => e === void 0 ? [] : Array.isArray(e) ? e : [e], H = (e, t, n) => {
	let r = B(e), i = { ...r }, a = r.name ?? (r.path === "" ? "index" : null);
	a && (i.name = S(t, n, a), i.meta = {
		...i.meta,
		[Oe]: a
	});
	let o = r.redirect;
	if (typeof o == "object" && o.name) {
		let e = S(t, n, o.name);
		i.redirect = (r) => r.params.plugin_id === t ? {
			...o,
			name: e,
			params: {
				...r.params,
				...o.params
			}
		} : {
			name: x[n],
			params: r.params
		};
	}
	return r.children && (i.children = r.children.map((e) => H(e, t, n))), V(i);
}, Pe = (e, t, n) => {
	let r = B(e);
	return V({
		...r,
		beforeEnter: [(e) => e.params.plugin_id === t ? void 0 : {
			name: n,
			params: e.params,
			replace: !0
		}, ...Ne(r.beforeEnter)]
	});
}, Fe = (t, n) => {
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
		addMessages: (e) => {
			N(t.i18n, r, e), i.push(() => Ee(r));
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
			for (let e of Object.values(a)) R(e, s);
			i.push(je(r, s));
			for (let [n, s] of Object.entries(a)) {
				let a = x[n];
				if (!a) throw Error(`Unknown plugin route scope "${n}"`);
				if (t.router.hasRoute(a)) for (let c of s ?? []) {
					let s = B(Pe(H(c, r, n), r, a));
					s.meta = {
						...s.meta,
						[e]: o
					}, i.push(t.router.addRoute(a, V(s)));
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
}, U = ie({}), Ie = (e, t, n) => {
	let r = [...U.value[e] ?? [], {
		pluginId: t,
		component: u(n)
	}];
	r.sort((e, t) => e.pluginId.localeCompare(t.pluginId)), U.value = {
		...U.value,
		[e]: r
	};
}, Le = (e, t, n) => {
	let r = U.value[e];
	if (!r) return;
	let i = r.filter((e) => e.pluginId !== t || e.component !== n), a = { ...U.value };
	i.length === 0 ? delete a[e] : a[e] = i, U.value = a;
}, Re = (e, t, n) => {
	if (t) for (let [r, i] of Object.entries(t)) i && (Ie(r, e, i), n(() => Le(r, e, i)));
}, ze = () => {
	globalThis[t] = { modules: {
		vue: n,
		"vue-router": le,
		vuex: me,
		"vue-i18n": pe
	} };
}, W = 4e3, G = /* @__PURE__ */ new Map(), K = /* @__PURE__ */ new Map(), Be = ((e) => {
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
}), Ve = (e) => {
	let t = Be[e.plugin_id];
	if (t) return q(import(
		/* @vite-ignore */
		t
), W, `dev server did not answer at ${t} within ${W}ms`);
	let n = fe[e.plugin_id];
	if (n) return n();
	let r = encodeURIComponent(e.version ?? "");
	return q(import(
		/* @vite-ignore */
		`/api/plugins/${e.plugin_id}/frontend/plugin.js?v=${r}`
), W, `plugin bundle at /api/plugins/${e.plugin_id}/frontend/plugin.js did not load`);
}, He = async (e, t) => {
	let n = e.plugin_id, r = T();
	if (r) {
		C[n] = {
			status: "loading",
			error: null
		};
		try {
			let i = (t ?? await Ve(e))?.default;
			if (typeof i?.activate != "function") throw Error("the bundle does not default-export a plugin definition");
			let a = Fe(r, e);
			try {
				Re(n, i.slots, (e) => {
					a.context.onCleanup(e);
				}), _e(n, i.providers, (e) => {
					a.context.onCleanup(e);
				}), await i.activate(a.context);
			} catch (e) {
				throw await a.dispose(), e;
			}
			G.set(n, {
				definition: i,
				...a
			}), C[n] = {
				status: "active",
				error: null
			};
		} catch (e) {
			console.error(`[plugins] "${n}" failed to activate:`, e), C[n] = {
				status: "error",
				error: e instanceof Error ? e.message : String(e)
			};
		}
	}
}, J = (e) => {
	let t = e.plugin_id;
	if (!e.injected || G.has(t) || C[t]?.status === "error") return Promise.resolve();
	let n = K.get(t);
	return n || (n = He(e).finally(() => {
		K.delete(t);
	}), K.set(t, n)), n;
}, Ue = () => {
	for (let e of ye()) J(e);
}, We = Object.values(x), Ge = Object.fromEntries(Object.entries(x).map(([e, t]) => [t, e])), Y = "-pending", X = (e) => typeof e == "string" && e.endsWith(Y), Ke = /\/plugins\/([^/]+)(?:\/|$)/, qe = (e) => {
	let t = e.params.plugin_id;
	return typeof t == "string" && t ? t : Array.isArray(t) && typeof t[0] == "string" ? t[0] : e.path.match(Ke)?.[1] ?? null;
}, Z = (e) => e.meta.kitsuPlugin?.pluginId ?? null, Je = (e, t, n) => {
	let r = e.router.getRoutes().find((e) => e.name === n);
	if (!r) return null;
	for (let n of e.router.getRoutes()) if (Z(n) === t && n.name && !X(n.name) && n.path === r.path) return String(n.name);
	return null;
}, Ye = (e, t, n) => {
	let r = Ge[String(n.name)];
	if (!r) return null;
	let i = x[r], a = S(t, r, "index"), o = e.router.hasRoute(a) ? a : Je(e, t, i);
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
}, Q = (e) => {
	for (let t of We) {
		if (!e.router.hasRoute(t)) continue;
		let n = `${t}${Y}`;
		e.router.hasRoute(n) || e.router.addRoute(t, {
			path: ":pluginPath(.*)+",
			name: n,
			component: Ce
		});
	}
}, $ = (e) => {
	e.router.beforeResolve(async (t) => {
		let n = qe(t);
		if (!n) return !0;
		if (Q(e), t.name === "not-found") return e.router.resolve(t.fullPath).name === "not-found" || {
			path: t.fullPath,
			replace: !0,
			force: !0
		};
		let r = E(n);
		if (!r?.injected) return !0;
		await J(r);
		let i = Ye(e, n, t);
		if (i) return i;
		let a = e.router.resolve(t.fullPath);
		return a.name && a.name !== t.name && a.name !== "not-found" && !X(a.name) && (Z(a) ?? n) === n ? {
			path: t.fullPath,
			replace: !0,
			force: !0
		} : !0;
	});
}, Xe = (e) => {
	ve(e), ze(), De(e.i18n), Me(e.router), Q(e), $(e), se(() => e.store.getters.plugins, () => {
		Ue();
	}, { immediate: !0 });
}, Ze = /* @__PURE__ */ l({
	inheritAttrs: !1,
	__name: "PluginsSlot",
	props: {
		slotName: {},
		is: {}
	},
	setup(e) {
		let t = e, n = oe(), o = i(() => U.value[`${t.slotName}:before`] ?? []), c = i(() => U.value[`${t.slotName}:after`] ?? []);
		return (t, i) => e.is ? (f(), a(h(e.is), ne(te({ key: 0 }, _(n))), {
			default: ce(() => [
				(f(!0), s(r, null, p(o.value, (e) => (f(), a(h(e.component), { key: `before-${e.pluginId}` }))), 128)),
				m(t.$slots, "default"),
				(f(!0), s(r, null, p(c.value, (e) => (f(), a(h(e.component), { key: `after-${e.pluginId}` }))), 128))
			]),
			_: 3
		}, 16)) : (f(), s(r, { key: 1 }, [
			(f(!0), s(r, null, p(o.value, (e) => (f(), a(h(e.component), { key: `before-${e.pluginId}` }))), 128)),
			m(t.$slots, "default"),
			(f(!0), s(r, null, p(c.value, (e) => (f(), a(h(e.component), { key: `after-${e.pluginId}` }))), 128))
		], 64));
	}
}), Qe = { install(e, t) {
	ge(e), Xe({
		app: e,
		...t
	});
} };
//#endregion
export { Se as PluginHost, Ze as PluginsSlot, Qe as kitsuPlugins };

//# sourceMappingURL=index.js.map