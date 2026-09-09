import { t as e } from "../context-bss97D_5.js";
import { n as t } from "../shared-global-CrQAd8Bc.js";
import * as n from "vue";
import { Fragment as r, computed as i, createBlock as a, createCommentVNode as o, createElementBlock as s, createElementVNode as c, createTextVNode as l, defineComponent as u, markRaw as d, mergeProps as ee, normalizeProps as te, normalizeStyle as f, openBlock as p, reactive as ne, ref as re, renderList as m, renderSlot as h, resolveDynamicComponent as g, shallowRef as ie, toDisplayString as _, unref as v, useAttrs as ae, watch as oe, withCtx as se } from "vue";
import * as ce from "vue-router";
import { RouterView as le, useRoute as ue } from "vue-router";
import { devPlugins as de } from "virtual:kitsu-plugins-dev";
import * as fe from "vue-i18n";
import * as pe from "vuex";
//#region src/host/providers.ts
var y = /* @__PURE__ */ new Map(), b = /* @__PURE__ */ new Map(), x = (e) => {
	let t = y.get(e);
	return t || (t = ie(void 0), y.set(e, t)), t;
}, me = ["ComboboxStatus.sortedTaskStatusList"], he = (e, t = me) => {
	for (let n of t) e.provide(n, x(n));
}, ge = (e, t, n) => {
	if (t) for (let [r, i] of Object.entries(t)) {
		let t = x(r);
		b.set(r, e), t.value = i !== null && (typeof i == "object" || typeof i == "function") ? d(i) : i, n(() => {
			b.get(r) === e && (b.delete(r), t.value = void 0);
		});
	}
}, S = {
	studio: "plugin",
	production: "production-plugin",
	episode: "episode-production-plugin"
}, C = (e, t, n) => {
	let r = S[t];
	if (!r) throw Error(`Unknown Kitsu plugin route scope "${t}".`);
	return `${e}-${r}-${n}`;
}, w = ne({}), T = null, _e = (e) => {
	T = e;
}, E = () => T, ve = () => (T?.store.getters.plugins ?? []).filter((e) => e.injected), D = (e) => (T?.store.getters.plugins ?? []).find((t) => t.plugin_id === e), O = {
	color: "var(--text)",
	padding: "1em 0"
}, ye = {
	color: "var(--red, #ff3860)",
	padding: "1em 0"
}, be = {
	color: "var(--text-alt)",
	display: "block",
	fontSize: "0.9em",
	marginTop: "0.3em"
}, k = () => {
	let e = ue();
	return i(() => String(e.params.plugin_id ?? ""));
}, A = (e, t) => {
	let n = E()?.i18n?.global?.t;
	return n ? n(e, { name: t }) : e;
}, j = (e) => D(e)?.name ?? e, xe = /* @__PURE__ */ u({
	name: "KitsuPluginHost",
	__name: "PluginHost",
	setup(e) {
		let t = k(), n = i(() => w[t.value]), r = i(() => j(t.value));
		return (e, t) => (p(), s("div", null, [n.value?.status === "error" ? (p(), s("p", {
			key: 0,
			class: "kitsu-plugin-message",
			style: f(v(ye))
		}, [l(_(v(A)("plugins.load_error", r.value)) + " ", 1), c("span", { style: f(v(be)) }, _(n.value.error ?? ""), 5)], 4)) : n.value?.status === "active" ? (p(), a(v(le), { key: 2 })) : (p(), s("p", {
			key: 1,
			class: "kitsu-plugin-message",
			style: f(v(O))
		}, _(v(A)("main.loading", r.value)), 5))]));
	}
}), Se = /* @__PURE__ */ u({
	name: "KitsuPluginPending",
	__name: "PluginPending",
	setup(e) {
		let t = k(), n = i(() => w[t.value]?.status !== "loading"), r = i(() => j(t.value));
		return (e, t) => n.value ? (p(), s("p", {
			key: 0,
			class: "kitsu-plugin-message",
			style: f(v(O))
		}, _(v(A)("plugins.page_not_found", r.value)), 5)) : o("", !0);
	}
}), Ce = {
	en: { plugins: {
		load_error: "The {name} plugin could not be loaded.",
		page_not_found: "This page does not exist in the {name} plugin."
	} },
	fr: { plugins: {
		load_error: "Le plugin {name} n'a pas pu être chargé.",
		page_not_found: "Cette page n'existe pas dans le plugin {name}."
	} }
}, M = /* @__PURE__ */ new Map(), N = (e) => e.global, we = (e, t) => {
	for (let [n, r] of Object.entries(t)) N(e).mergeLocaleMessage(n, r);
}, P = (e, t, n) => {
	M.set(t, n), we(e, n);
}, Te = (e) => {
	M.delete(e);
}, Ee = (e) => {
	let t = N(e), n = t.setLocaleMessage.bind(t);
	t.setLocaleMessage = (e, r) => {
		n(e, r);
		for (let n of M.values()) {
			let r = n[e];
			r && t.mergeLocaleMessage(e, r);
		}
	}, P(e, "@kit", Ce);
}, De = "pluginPage", F = /* @__PURE__ */ new Map(), I = (e) => typeof e == "string" && e.length > 0, L = (e, t) => {
	let n = e?.[t];
	if (I(n)) return n;
	if (Array.isArray(n) && I(n[0])) return n[0];
}, R = (e) => e && typeof e == "object" && !Array.isArray(e) ? e : {}, Oe = (e) => I(L(e, "episode_id")) ? "episode" : I(L(e, "production_id")) ? "production" : "studio", ke = (e) => {
	let t = e;
	return typeof t.name == "string" && t.name ? t.name : t.path === "" ? "index" : null;
}, z = (e, t = /* @__PURE__ */ new Set()) => {
	for (let n of e ?? []) {
		let e = ke(n);
		e && t.add(e);
		let r = n.children;
		r && z(r, t);
	}
	return t;
}, Ae = (e, t) => {
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
	let c = Oe(o);
	return {
		...t,
		name: C(s, c, r),
		params: {
			...o,
			plugin_id: s
		}
	};
}, je = (e) => {
	let t = e.resolve.bind(e), n = e.push.bind(e), r = e.replace.bind(e);
	e.resolve = (n, r) => t(B(e, n, r), r), e.push = (t) => n(B(e, t)), e.replace = (t) => r(B(e, t));
}, V = (e) => e, H = (e) => e, Me = (e) => e === void 0 ? [] : Array.isArray(e) ? e : [e], U = (e, t, n) => {
	let r = V(e), i = { ...r }, a = r.name ?? (r.path === "" ? "index" : null);
	a && (i.name = C(t, n, a), i.meta = {
		...i.meta,
		[De]: a
	});
	let o = r.redirect;
	if (typeof o == "object" && o.name) {
		let e = C(t, n, o.name);
		i.redirect = (r) => r.params.plugin_id === t ? {
			...o,
			name: e,
			params: {
				...r.params,
				...o.params
			}
		} : {
			name: S[n],
			params: r.params
		};
	}
	return r.children && (i.children = r.children.map((e) => U(e, t, n))), H(i);
}, Ne = (e, t, n) => {
	let r = V(e);
	return H({
		...r,
		beforeEnter: [(e) => e.params.plugin_id === t ? void 0 : {
			name: n,
			params: e.params,
			replace: !0
		}, ...Me(r.beforeEnter)]
	});
}, Pe = (t, n) => {
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
			P(t.i18n, r, e), i.push(() => Te(r));
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
			i.push(Ae(r, s));
			for (let [n, s] of Object.entries(a)) {
				let a = S[n];
				if (!a) throw Error(`Unknown plugin route scope "${n}"`);
				if (t.router.hasRoute(a)) for (let c of s ?? []) {
					let s = V(Ne(U(c, r, n), r, a));
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
}, W = re({}), Fe = (e, t, n) => {
	let r = [...W.value[e] ?? [], {
		pluginId: t,
		component: d(n)
	}];
	r.sort((e, t) => e.pluginId.localeCompare(t.pluginId)), W.value = {
		...W.value,
		[e]: r
	};
}, Ie = (e, t, n) => {
	let r = W.value[e];
	if (!r) return;
	let i = r.filter((e) => e.pluginId !== t || e.component !== n), a = { ...W.value };
	i.length === 0 ? delete a[e] : a[e] = i, W.value = a;
}, Le = (e, t, n) => {
	if (t) for (let [r, i] of Object.entries(t)) i && (Fe(r, e, i), n(() => Ie(r, e, i)));
}, Re = () => {
	globalThis[t] = { modules: {
		vue: n,
		"vue-router": ce,
		vuex: pe,
		"vue-i18n": fe
	} };
}, G = 4e3, K = /* @__PURE__ */ new Map(), q = /* @__PURE__ */ new Map(), ze = ((e) => {
	let t = {};
	for (let n of e.split(",")) {
		let e = n.trim();
		if (!e) continue;
		let r = e.indexOf("=");
		r !== -1 && (t[e.slice(0, r)] = e.slice(r + 1));
	}
	return t;
})(typeof __KITSU_PLUGIN_DEV_URLS__ == "string" ? __KITSU_PLUGIN_DEV_URLS__ : ""), J = (e, t, n) => new Promise((r, i) => {
	let a = setTimeout(() => i(Error(n)), t);
	e.then((e) => {
		clearTimeout(a), r(e);
	}, (e) => {
		clearTimeout(a), i(e instanceof Error ? e : Error(String(e)));
	});
}), Be = (e) => {
	let t = ze[e.plugin_id];
	if (t) return J(import(
		/* @vite-ignore */
		t
), G, `dev server did not answer at ${t} within ${G}ms`);
	let n = de[e.plugin_id];
	if (n) return n();
	let r = encodeURIComponent(e.version ?? "");
	return J(import(
		/* @vite-ignore */
		`/api/plugins/${e.plugin_id}/frontend/plugin.js?v=${r}`
), G, `plugin bundle at /api/plugins/${e.plugin_id}/frontend/plugin.js did not load`);
}, Ve = async (e, t) => {
	let n = e.plugin_id, r = E();
	if (r) {
		w[n] = {
			status: "loading",
			error: null
		};
		try {
			let i = (t ?? await Be(e))?.default;
			if (typeof i?.activate != "function") throw Error("the bundle does not default-export a plugin definition");
			let a = Pe(r, e);
			try {
				Le(n, i.slots, (e) => {
					a.context.onCleanup(e);
				}), ge(n, i.providers, (e) => {
					a.context.onCleanup(e);
				}), await i.activate(a.context);
			} catch (e) {
				throw await a.dispose(), e;
			}
			K.set(n, {
				definition: i,
				...a
			}), w[n] = {
				status: "active",
				error: null
			};
		} catch (e) {
			console.error(`[plugins] "${n}" failed to activate:`, e), w[n] = {
				status: "error",
				error: e instanceof Error ? e.message : String(e)
			};
		}
	}
}, Y = (e) => {
	let t = e.plugin_id;
	if (!e.injected || K.has(t) || w[t]?.status === "error") return Promise.resolve();
	let n = q.get(t);
	return n || (n = Ve(e).finally(() => {
		q.delete(t);
	}), q.set(t, n)), n;
}, He = () => {
	for (let e of ve()) Y(e);
}, Ue = Object.values(S), We = Object.fromEntries(Object.entries(S).map(([e, t]) => [t, e])), X = "-pending", Z = (e) => typeof e == "string" && e.endsWith(X), Ge = /\/plugins\/([^/]+)(?:\/|$)/, Ke = (e) => {
	let t = e.params.plugin_id;
	return typeof t == "string" && t ? t : Array.isArray(t) && typeof t[0] == "string" ? t[0] : e.path.match(Ge)?.[1] ?? null;
}, Q = (e) => e.meta.kitsuPlugin?.pluginId ?? null, qe = (e, t, n) => {
	let r = e.router.getRoutes().find((e) => e.name === n);
	if (!r) return null;
	for (let n of e.router.getRoutes()) if (Q(n) === t && n.name && !Z(n.name) && n.path === r.path) return String(n.name);
	return null;
}, Je = (e, t, n) => {
	let r = We[String(n.name)];
	if (!r) return null;
	let i = S[r], a = C(t, r, "index"), o = e.router.hasRoute(a) ? a : qe(e, t, i);
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
	for (let t of Ue) {
		if (!e.router.hasRoute(t)) continue;
		let n = `${t}${X}`;
		e.router.hasRoute(n) || e.router.addRoute(t, {
			path: ":pluginPath(.*)+",
			name: n,
			component: Se
		});
	}
}, Ye = (e) => {
	e.router.beforeResolve(async (t) => {
		let n = Ke(t);
		if (!n) return !0;
		if ($(e), t.name === "not-found") return e.router.resolve(t.fullPath).name === "not-found" || {
			path: t.fullPath,
			replace: !0,
			force: !0
		};
		let r = D(n);
		if (!r?.injected) return !0;
		await Y(r);
		let i = Je(e, n, t);
		if (i) return i;
		let a = e.router.resolve(t.fullPath);
		return a.name && a.name !== t.name && a.name !== "not-found" && !Z(a.name) && (Q(a) ?? n) === n ? {
			path: t.fullPath,
			replace: !0,
			force: !0
		} : !0;
	});
}, Xe = (e) => {
	_e(e), Re(), Ee(e.i18n), je(e.router), $(e), Ye(e), oe(() => e.store.getters.plugins, () => {
		He();
	}, { immediate: !0 });
}, Ze = /* @__PURE__ */ u({
	inheritAttrs: !1,
	__name: "PluginsSlot",
	props: {
		slotName: {},
		is: {}
	},
	setup(e) {
		let t = e, n = ae(), o = i(() => W.value[`${t.slotName}:before`] ?? []), c = i(() => W.value[t.slotName] ?? []), l = i(() => W.value[`${t.slotName}:after`] ?? []), u = i(() => c.value.length === 0);
		return (t, i) => e.is ? (p(), a(g(e.is), te(ee({ key: 0 }, v(n))), {
			default: se(() => [
				(p(!0), s(r, null, m(o.value, (e) => (p(), a(g(e.component), { key: `before-${e.pluginId}` }))), 128)),
				u.value ? h(t.$slots, "default", {}, void 0, void 0, 0) : (p(!0), s(r, { key: 1 }, m(c.value, (e) => (p(), a(g(e.component), { key: `instead-${e.pluginId}` }))), 128)),
				(p(!0), s(r, null, m(l.value, (e) => (p(), a(g(e.component), { key: `after-${e.pluginId}` }))), 128))
			]),
			_: 3
		}, 16)) : (p(), s(r, { key: 1 }, [
			(p(!0), s(r, null, m(o.value, (e) => (p(), a(g(e.component), { key: `before-${e.pluginId}` }))), 128)),
			u.value ? h(t.$slots, "default", {}, void 0, void 0, 0) : (p(!0), s(r, { key: 1 }, m(c.value, (e) => (p(), a(g(e.component), { key: `instead-${e.pluginId}` }))), 128)),
			(p(!0), s(r, null, m(l.value, (e) => (p(), a(g(e.component), { key: `after-${e.pluginId}` }))), 128))
		], 64));
	}
}), Qe = { install(e, t) {
	he(e), Xe({
		app: e,
		...t
	});
} };
//#endregion
export { xe as PluginHost, Ze as PluginsSlot, Qe as kitsuPlugins };

//# sourceMappingURL=index.js.map