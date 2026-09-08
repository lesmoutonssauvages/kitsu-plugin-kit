import { computed as e } from "vue";
import { useRoute as t } from "vue-router";
//#region src/context.ts
var n = "kitsuPlugin", r = () => {
	let n = t();
	return e(() => n.meta.kitsuPlugin ?? null);
}, i = () => {
	let t = r(), n = () => {
		let e = t.value, n = e?.storeModuleName;
		return !e || !n || !e.store.hasModule(n) ? null : n;
	};
	return {
		state: e(() => {
			let e = t.value, r = n();
			if (e && r) return e.store.state[r];
		}),
		commit: (e, r) => {
			let i = t.value, a = n();
			i && a && i.store.commit(`${a}/${e}`, r);
		},
		dispatch: (e, r) => {
			let i = t.value, a = n();
			return !i || !a ? Promise.resolve() : i.store.dispatch(`${a}/${e}`, r);
		}
	};
};
//#endregion
export { r as n, i as r, n as t };

//# sourceMappingURL=context-bss97D_5.js.map