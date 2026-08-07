import { n as e, t } from "../shared-global-CrQAd8Bc.js";
import { createRequire as n } from "node:module";
import r from "node:path";
import i from "@vitejs/plugin-vue";
import a from "node:fs";
import { pathToFileURL as o } from "node:url";
//#region src/vite/inline-css.ts
var s = ({ pluginId: e }) => ({
	name: "kitsu-plugin-inline-css",
	apply: "build",
	enforce: "post",
	generateBundle(t, n) {
		let r = Object.values(n).filter((e) => e.type === "asset" && e.fileName.endsWith(".css"));
		if (!r.length) return;
		let i = Object.values(n).find((e) => e.type === "chunk" && e.isEntry);
		if (!i || i.type !== "chunk") return;
		let a = r.map((e) => e.type === "asset" ? String(e.source) : "").join("\n");
		i.code = [
			";(() => {",
			"  if (typeof document === 'undefined') return",
			`  const id = ${JSON.stringify(e)}`,
			"  if (document.querySelector('style[data-kitsu-plugin=\"' + id + '\"]')) return",
			"  const style = document.createElement('style')",
			"  style.setAttribute('data-kitsu-plugin', id)",
			`  style.textContent = ${JSON.stringify(a)}`,
			"  document.head.append(style)",
			"})();",
			""
		].join("\n") + i.code, r.forEach((e) => {
			delete n[e.fileName];
		});
	}
}), c = /^\s*id\s*=\s*(?:"([^"]+)"|'([^']+)')\s*$/m, l = (e) => {
	let t = r.resolve(e, "..", "manifest.toml"), n;
	try {
		n = a.readFileSync(t, "utf8");
	} catch {
		throw Error(`defineKitsuPluginConfig: cannot read ${t}; pass pluginId or place manifest.toml next to the frontend folder.`);
	}
	let i = n.match(c), o = i?.[1] ?? i?.[2];
	if (!o) throw Error(`defineKitsuPluginConfig: no id = "…" found in ${t}`);
	return o;
}, u = "\0kitsu-shared:", d = /^[A-Za-z_$][A-Za-z0-9_$]*$/, f = /* @__PURE__ */ new Set(/* @__PURE__ */ "break.case.catch.class.const.continue.debugger.default.delete.do.else.enum.export.extends.false.finally.for.function.if.import.in.instanceof.new.null.return.super.switch.this.throw.true.try.typeof.var.void.while.with.yield".split(".")), p = (e) => {
	if (typeof e == "string") return e;
	if (!e || typeof e != "object") return null;
	for (let t of [
		"import",
		"module",
		"browser",
		"default"
	]) if (t in e) {
		let n = p(e[t] ?? null);
		if (n) return n;
	}
	return null;
}, m = (e, t) => {
	let i = n(r.join(e, "noop.js")).resolve(`${t}/package.json`), o = JSON.parse(a.readFileSync(i, "utf8")), s = p(o.exports?.["."] ?? o.exports ?? null) ?? o.module ?? o.main;
	if (!s) throw Error(`no ESM entry declared by "${t}"`);
	return r.join(r.dirname(i), s);
}, h = async (e, t) => {
	let n = m(e, t), r = await import(o(n).href);
	return Object.keys(r).filter((e) => e !== "default" && d.test(e) && !f.has(e));
}, g = (t, n) => [
	`const __kitsuShared = globalThis.${e}`,
	"if (!__kitsuShared) {",
	`  throw new Error('Kitsu plugin: host shared modules are missing (globalThis.${e}).')`,
	"}",
	`const __kitsuModule = __kitsuShared.modules[${JSON.stringify(t)}]`,
	"if (!__kitsuModule) {",
	`  throw new Error('Kitsu plugin: the host does not share ${t}.')`,
	"}",
	"export default __kitsuModule.default ?? __kitsuModule",
	...n.map((e) => `export const ${e} = __kitsuModule[${JSON.stringify(e)}]`),
	""
].join("\n"), _ = ({ root: e, shared: n = t } = {}) => {
	let r = /* @__PURE__ */ new Map(), i = e;
	return {
		name: "kitsu-plugin-shared-deps",
		enforce: "pre",
		configResolved(e) {
			i ??= e.root;
		},
		resolveId(e) {
			return n.includes(e) ? u + e : null;
		},
		async load(e) {
			if (!e.startsWith(u)) return null;
			let t = e.slice(14);
			if (!r.has(t)) try {
				r.set(t, await h(i, t));
			} catch (e) {
				this.error(`Cannot share "${t}" with the Kitsu host: ${e.message}. Install it as a dependency of the plugin frontend, at the version the host uses.`);
			}
			return g(t, r.get(t));
		}
	};
}, v = (e) => {
	let t = n(r.join(e, "package.json")).resolve("kitsu-plugin-kit/vite");
	return r.join(r.dirname(t), "..", "..", "src", "index.ts");
}, y = (e) => `/api/plugins/${e}/frontend/`, b = (e = {}) => {
	let { entry: n = "src/index.ts", shared: r = t, root: a, vue: o, server: c } = e, u = a ?? process.cwd(), d = e.pluginId ?? l(u);
	return {
		base: y(d),
		publicDir: !1,
		define: { __KITSU_PLUGIN_ID__: JSON.stringify(d) },
		plugins: [
			i(o),
			_({
				root: a,
				shared: r
			}),
			s({ pluginId: d }),
			{
				name: "kitsu-plugin-serve-base",
				config(e, t) {
					if (t.command === "serve") return { base: "/" };
				}
			},
			{
				name: "kitsu-plugin-kit-dev-source",
				config(e, t) {
					if (t.command === "serve") return { resolve: { alias: { "kitsu-plugin-kit": v(u) } } };
				}
			}
		],
		server: {
			host: !0,
			cors: !0,
			...c
		},
		build: {
			target: "es2020",
			cssCodeSplit: !1,
			sourcemap: !0,
			emptyOutDir: !0,
			lib: {
				entry: n,
				formats: ["es"],
				fileName: () => "plugin.js"
			},
			rollupOptions: { output: {
				chunkFileNames: "chunks/[name]-[hash].js",
				assetFileNames: "assets/[name]-[hash][extname]"
			} }
		}
	};
};
//#endregion
export { t as DEFAULT_SHARED_DEPS, e as SHARED_GLOBAL, b as defineKitsuPluginConfig, s as kitsuInlineCss, y as kitsuPluginBase, _ as kitsuSharedDeps, l as readManifestPluginId };

//# sourceMappingURL=index.js.map