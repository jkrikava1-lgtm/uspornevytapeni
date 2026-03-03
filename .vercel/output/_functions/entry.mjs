import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_CDkNoGEa.mjs';
import { manifest } from './manifest_Q5yAicsH.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/auth.astro.mjs');
const _page2 = () => import('./pages/api/callback.astro.mjs');
const _page3 = () => import('./pages/cena.astro.mjs');
const _page4 = () => import('./pages/chytre-funkce/desuperheater.astro.mjs');
const _page5 = () => import('./pages/chytre-funkce/fotovoltaika.astro.mjs');
const _page6 = () => import('./pages/chytre-funkce/inverter.astro.mjs');
const _page7 = () => import('./pages/chytre-funkce/online-ovladani.astro.mjs');
const _page8 = () => import('./pages/chytre-funkce/ovladani-systemu.astro.mjs');
const _page9 = () => import('./pages/dotace.astro.mjs');
const _page10 = () => import('./pages/katalog.astro.mjs');
const _page11 = () => import('./pages/kontakty.astro.mjs');
const _page12 = () => import('./pages/navrh-reseni/novostavba.astro.mjs');
const _page13 = () => import('./pages/navrh-reseni/stavajici-dum.astro.mjs');
const _page14 = () => import('./pages/navrh-reseni/velky-vykon.astro.mjs');
const _page15 = () => import('./pages/o-nas.astro.mjs');
const _page16 = () => import('./pages/poptavka.astro.mjs');
const _page17 = () => import('./pages/porovnani-nakladu.astro.mjs');
const _page18 = () => import('./pages/reference.astro.mjs');
const _page19 = () => import('./pages/tepelna-cerpadla/voda-voda.astro.mjs');
const _page20 = () => import('./pages/tepelna-cerpadla/vzduch-voda.astro.mjs');
const _page21 = () => import('./pages/tepelna-cerpadla/zeme-voda.astro.mjs');
const _page22 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/api/auth.ts", _page1],
    ["src/pages/api/callback.ts", _page2],
    ["src/pages/cena.astro", _page3],
    ["src/pages/chytre-funkce/desuperheater.astro", _page4],
    ["src/pages/chytre-funkce/fotovoltaika.astro", _page5],
    ["src/pages/chytre-funkce/inverter.astro", _page6],
    ["src/pages/chytre-funkce/online-ovladani.astro", _page7],
    ["src/pages/chytre-funkce/ovladani-systemu.astro", _page8],
    ["src/pages/dotace.astro", _page9],
    ["src/pages/katalog.astro", _page10],
    ["src/pages/kontakty.astro", _page11],
    ["src/pages/navrh-reseni/novostavba.astro", _page12],
    ["src/pages/navrh-reseni/stavajici-dum.astro", _page13],
    ["src/pages/navrh-reseni/velky-vykon.astro", _page14],
    ["src/pages/o-nas.astro", _page15],
    ["src/pages/poptavka.astro", _page16],
    ["src/pages/porovnani-nakladu.astro", _page17],
    ["src/pages/reference.astro", _page18],
    ["src/pages/tepelna-cerpadla/voda-voda.astro", _page19],
    ["src/pages/tepelna-cerpadla/vzduch-voda.astro", _page20],
    ["src/pages/tepelna-cerpadla/zeme-voda.astro", _page21],
    ["src/pages/index.astro", _page22]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "be2ebdd3-f196-4144-83d8-2b22122a65be",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
