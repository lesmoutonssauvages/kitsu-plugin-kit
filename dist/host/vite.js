import { t as e } from "../shared-global-CrQAd8Bc.js";
import { createRequire as t } from "node:module";
import n from "node:path";
import r from "node:fs";
import { searchForWorkspaceRoot as i } from "vite";
//#region src/host/vite.ts
var a = "virtual:kitsu-plugins-dev", o = `\0${a}`, s = [
	"src/index.ts",
	"src/index.js",
	"src/index.mjs"
], c = (e) => {
	try {
		return r.readdirSync(e, { withFileTypes: !0 }).filter((e) => e.isDirectory()).map((t) => n.join(e, t.name));
	} catch {
		return [];
	}
}, l = (e) => {
	let t = e.split(n.sep), r = t.indexOf("*");
	if (r === -1) return [e];
	let i = t.slice(0, r).join(n.sep), a = t.slice(r + 1);
	return c(i).map((e) => n.join(e, ...a));
}, u = (e) => s.map((t) => n.join(e, t)).find((e) => r.existsSync(e)) ?? null, d = (e) => {
	let i = n.join(e, "package.json");
	if (!r.existsSync(i)) return "no package.json next to src/";
	try {
		return t(i).resolve("kitsu-plugin-kit"), null;
	} catch {
		return "cannot resolve kitsu-plugin-kit; run pnpm install, then build the kit";
	}
}, f = (e) => n.basename(e) === "frontend" ? n.basename(n.dirname(e)) : n.basename(e), p = (e, t) => t.split(",").map((e) => e.trim()).filter(Boolean).flatMap((t) => {
	let r = t.indexOf("="), i = r === -1 ? null : t.slice(0, r), a = r === -1 ? t : t.slice(r + 1);
	return l(n.isAbsolute(a) ? a : n.resolve(e, a)).flatMap((e) => {
		let t = u(e);
		if (!t) return [];
		let n = d(e);
		return n ? (console.warn(`[kitsu-plugins-dev] skipping "${i ?? f(e)}" (${e}): ${n}`), []) : [{
			id: i ?? f(e),
			directory: e,
			entry: t
		}];
	});
}), m = (e) => `/@fs/${e.split(n.sep).join("/")}`, h = (e) => e.length ? [
	"export const devPlugins = {",
	e.map((e) => `  ${JSON.stringify(e.id)}: () => import(${JSON.stringify(m(e.entry))})`).join(",\n"),
	"}",
	""
].join("\n") : "export const devPlugins = {}\n", g = ({ paths: t = process.env.KITSU_PLUGIN_DEV_PATHS, urls: n = process.env.KITSU_PLUGIN_DEV_URLS } = {}) => {
	let r = [];
	return {
		name: "kitsu-plugins-dev",
		config(a, o) {
			let s = {
				define: { __KITSU_PLUGIN_DEV_URLS__: JSON.stringify(n ?? "") },
				resolve: { dedupe: [...e] },
				optimizeDeps: { exclude: ["kitsu-plugin-kit"] }
			};
			return o.command !== "serve" || !t || n ? s : (r = p(process.cwd(), t), r.length ? (console.info(`[kitsu-plugins-dev] serving from source: ${r.map((e) => e.id).join(", ")}`), {
				...s,
				server: { fs: { allow: [i(process.cwd()), ...r.map((e) => e.directory)] } },
				optimizeDeps: {
					...s.optimizeDeps,
					entries: ["index.html", ...r.map((e) => e.entry)]
				}
			}) : (console.warn(`[kitsu-plugins-dev] no plugin frontend found in "${t}"`), s));
		},
		resolveId(e) {
			return e === a ? o : null;
		},
		load(e) {
			return e === o ? h(r) : null;
		},
		configureServer() {
			n && console.info(`[kitsu-plugins-dev] loading from Vite URLs: ${n}`);
		}
	};
};
//#endregion
export { g as kitsuPluginsDev };

//# sourceMappingURL=vite.js.map