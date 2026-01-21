var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// _worker.js/index.js
import("node:buffer").then(({ Buffer: Buffer2 }) => {
  globalThis.Buffer = Buffer2;
}).catch(() => null);
var __ALSes_PROMISE__ = import("node:async_hooks").then(({ AsyncLocalStorage }) => {
  globalThis.AsyncLocalStorage = AsyncLocalStorage;
  const envAsyncLocalStorage = new AsyncLocalStorage();
  const requestContextAsyncLocalStorage = new AsyncLocalStorage();
  globalThis.process = {
    env: new Proxy(
      {},
      {
        ownKeys: /* @__PURE__ */ __name(() => Reflect.ownKeys(envAsyncLocalStorage.getStore()), "ownKeys"),
        getOwnPropertyDescriptor: /* @__PURE__ */ __name((_, ...args) => Reflect.getOwnPropertyDescriptor(envAsyncLocalStorage.getStore(), ...args), "getOwnPropertyDescriptor"),
        get: /* @__PURE__ */ __name((_, property) => Reflect.get(envAsyncLocalStorage.getStore(), property), "get"),
        set: /* @__PURE__ */ __name((_, property, value) => Reflect.set(envAsyncLocalStorage.getStore(), property, value), "set")
      }
    )
  };
  globalThis[Symbol.for("__cloudflare-request-context__")] = new Proxy(
    {},
    {
      ownKeys: /* @__PURE__ */ __name(() => Reflect.ownKeys(requestContextAsyncLocalStorage.getStore()), "ownKeys"),
      getOwnPropertyDescriptor: /* @__PURE__ */ __name((_, ...args) => Reflect.getOwnPropertyDescriptor(requestContextAsyncLocalStorage.getStore(), ...args), "getOwnPropertyDescriptor"),
      get: /* @__PURE__ */ __name((_, property) => Reflect.get(requestContextAsyncLocalStorage.getStore(), property), "get"),
      set: /* @__PURE__ */ __name((_, property, value) => Reflect.set(requestContextAsyncLocalStorage.getStore(), property, value), "set")
    }
  );
  return { envAsyncLocalStorage, requestContextAsyncLocalStorage };
}).catch(() => null);
var ne = Object.create;
var U = Object.defineProperty;
var re = Object.getOwnPropertyDescriptor;
var ae = Object.getOwnPropertyNames;
var ie = Object.getPrototypeOf;
var oe = Object.prototype.hasOwnProperty;
var I = /* @__PURE__ */ __name((e, t) => () => (e && (t = e(e = 0)), t), "I");
var V = /* @__PURE__ */ __name((e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports), "V");
var ce = /* @__PURE__ */ __name((e, t, n, s) => {
  if (t && typeof t == "object" || typeof t == "function") for (let a of ae(t)) !oe.call(e, a) && a !== n && U(e, a, { get: /* @__PURE__ */ __name(() => t[a], "get"), enumerable: !(s = re(t, a)) || s.enumerable });
  return e;
}, "ce");
var $ = /* @__PURE__ */ __name((e, t, n) => (n = e != null ? ne(ie(e)) : {}, ce(t || !e || !e.__esModule ? U(n, "default", { value: e, enumerable: true }) : n, e)), "$");
var g;
var u = I(() => {
  g = { collectedLocales: [] };
});
var f;
var l = I(() => {
  f = { version: 3, routes: { none: [{ src: "^(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))/$", headers: { Location: "/$1" }, status: 308, continue: true }, { src: "^/_next/__private/trace$", dest: "/404", status: 404, continue: true }, { src: "^/404/?$", status: 404, continue: true, missing: [{ type: "header", key: "x-prerender-revalidate" }] }, { src: "^/500$", status: 500, continue: true }, { src: "^/?$", has: [{ type: "header", key: "rsc", value: "1" }], dest: "/index.rsc", headers: { vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" }, continue: true, override: true }, { src: "^/((?!.+\\.rsc).+?)(?:/)?$", has: [{ type: "header", key: "rsc", value: "1" }], dest: "/$1.rsc", headers: { vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" }, continue: true, override: true }], filesystem: [{ src: "^/index(\\.action|\\.rsc)$", dest: "/", continue: true }, { src: "^/_next/data/(.*)$", dest: "/_next/data/$1", check: true }, { src: "^/\\.prefetch\\.rsc$", dest: "/__index.prefetch.rsc", check: true }, { src: "^/(.+)/\\.prefetch\\.rsc$", dest: "/$1.prefetch.rsc", check: true }, { src: "^/\\.rsc$", dest: "/index.rsc", check: true }, { src: "^/(.+)/\\.rsc$", dest: "/$1.rsc", check: true }], miss: [{ src: "^/_next/static/.+$", status: 404, check: true, dest: "/_next/static/not-found.txt", headers: { "content-type": "text/plain; charset=utf-8" } }], rewrite: [{ src: "^/_next/data/(.*)$", dest: "/404", status: 404 }], resource: [{ src: "^/.*$", status: 404 }], hit: [{ src: "^/_next/static/(?:[^/]+/pages|pages|chunks|runtime|css|image|media|ptIN3xPX3ZOVReY2wRwAp)/.+$", headers: { "cache-control": "public,max-age=31536000,immutable" }, continue: true, important: true }, { src: "^/index(?:/)?$", headers: { "x-matched-path": "/" }, continue: true, important: true }, { src: "^/((?!index$).*?)(?:/)?$", headers: { "x-matched-path": "/$1" }, continue: true, important: true }], error: [{ src: "^/.*$", dest: "/_not-found", status: 404, headers: { "x-next-error-status": "404" } }, { src: "^/.*$", dest: "/500", status: 500, headers: { "x-next-error-status": "500" } }] }, overrides: { "500.html": { path: "500", contentType: "text/html; charset=utf-8" }, "_app.rsc.json": { path: "_app.rsc", contentType: "application/json" }, "_error.rsc.json": { path: "_error.rsc", contentType: "application/json" }, "_document.rsc.json": { path: "_document.rsc", contentType: "application/json" }, "_next/static/not-found.txt": { contentType: "text/plain" } }, framework: { version: "14.2.20" }, crons: [] };
});
var m;
var d = I(() => {
  m = { "/500.html": { type: "override", path: "/500.html", headers: { "content-type": "text/html; charset=utf-8" } }, "/_app.rsc.json": { type: "override", path: "/_app.rsc.json", headers: { "content-type": "application/json" } }, "/_document.rsc.json": { type: "override", path: "/_document.rsc.json", headers: { "content-type": "application/json" } }, "/_error.rsc.json": { type: "override", path: "/_error.rsc.json", headers: { "content-type": "application/json" } }, "/_next/static/chunks/30-1bbc4d24ca4b5b03.js": { type: "static" }, "/_next/static/chunks/app/_not-found/page-207c9c1548b74dee.js": { type: "static" }, "/_next/static/chunks/app/coming-soon/page-b35a7c362765abf3.js": { type: "static" }, "/_next/static/chunks/app/corde/page-fa9c12a1b67a1810.js": { type: "static" }, "/_next/static/chunks/app/layout-fd7af70c72473285.js": { type: "static" }, "/_next/static/chunks/app/login/page-17ca060e7ecf7fbc.js": { type: "static" }, "/_next/static/chunks/app/not-found-8887e26d46e1f3aa.js": { type: "static" }, "/_next/static/chunks/app/page-3b8403e368f4f672.js": { type: "static" }, "/_next/static/chunks/app/social/page-d88ad24c06d9dbce.js": { type: "static" }, "/_next/static/chunks/fd9d1056-49ca28257eb7a92c.js": { type: "static" }, "/_next/static/chunks/framework-3664cab31236a9fa.js": { type: "static" }, "/_next/static/chunks/main-app-17503da640fcbefb.js": { type: "static" }, "/_next/static/chunks/main-ca29d94456760ca6.js": { type: "static" }, "/_next/static/chunks/pages/_app-72b849fbd24ac258.js": { type: "static" }, "/_next/static/chunks/pages/_error-7ba65e1336b92748.js": { type: "static" }, "/_next/static/chunks/polyfills-42372ed130431b0a.js": { type: "static" }, "/_next/static/chunks/webpack-bb9564f38ca4e156.js": { type: "static" }, "/_next/static/css/39d6ddb6ef6e82b8.css": { type: "static" }, "/_next/static/not-found.txt": { type: "static" }, "/_next/static/ptIN3xPX3ZOVReY2wRwAp/_buildManifest.js": { type: "static" }, "/_next/static/ptIN3xPX3ZOVReY2wRwAp/_ssgManifest.js": { type: "static" }, "/llms.txt": { type: "static" }, "/robots.txt": { type: "static" }, "/_not-found": { type: "function", entrypoint: "__next-on-pages-dist__/functions/_not-found.func.js" }, "/_not-found.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/_not-found.func.js" }, "/coming-soon": { type: "function", entrypoint: "__next-on-pages-dist__/functions/coming-soon.func.js" }, "/coming-soon.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/coming-soon.func.js" }, "/corde": { type: "function", entrypoint: "__next-on-pages-dist__/functions/corde.func.js" }, "/corde.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/corde.func.js" }, "/index": { type: "function", entrypoint: "__next-on-pages-dist__/functions/index.func.js" }, "/": { type: "function", entrypoint: "__next-on-pages-dist__/functions/index.func.js" }, "/index.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/index.func.js" }, "/login": { type: "function", entrypoint: "__next-on-pages-dist__/functions/login.func.js" }, "/login.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/login.func.js" }, "/social": { type: "function", entrypoint: "__next-on-pages-dist__/functions/social.func.js" }, "/social.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/social.func.js" }, "/500": { type: "override", path: "/500.html", headers: { "content-type": "text/html; charset=utf-8" } }, "/_app.rsc": { type: "override", path: "/_app.rsc.json", headers: { "content-type": "application/json" } }, "/_error.rsc": { type: "override", path: "/_error.rsc.json", headers: { "content-type": "application/json" } }, "/_document.rsc": { type: "override", path: "/_document.rsc.json", headers: { "content-type": "application/json" } } };
});
var q = V((ze, F) => {
  "use strict";
  u();
  l();
  d();
  function _(e, t) {
    e = String(e || "").trim();
    let n = e, s, a = "";
    if (/^[^a-zA-Z\\\s]/.test(e)) {
      s = e[0];
      let o = e.lastIndexOf(s);
      a += e.substring(o + 1), e = e.substring(1, o);
    }
    let r = 0;
    return e = de(e, (o) => {
      if (/^\(\?[P<']/.test(o)) {
        let c = /^\(\?P?[<']([^>']+)[>']/.exec(o);
        if (!c) throw new Error(`Failed to extract named captures from ${JSON.stringify(o)}`);
        let h = o.substring(c[0].length, o.length - 1);
        return t && (t[r] = c[1]), r++, `(${h})`;
      }
      return o.substring(0, 3) === "(?:" || r++, o;
    }), e = e.replace(/\[:([^:]+):\]/g, (o, c) => _.characterClasses[c] || o), new _.PCRE(e, a, n, a, s);
  }
  __name(_, "_");
  function de(e, t) {
    let n = 0, s = 0, a = false;
    for (let i = 0; i < e.length; i++) {
      let r = e[i];
      if (a) {
        a = false;
        continue;
      }
      switch (r) {
        case "(":
          s === 0 && (n = i), s++;
          break;
        case ")":
          if (s > 0 && (s--, s === 0)) {
            let o = i + 1, c = n === 0 ? "" : e.substring(0, n), h = e.substring(o), p = String(t(e.substring(n, o)));
            e = c + p + h, i = n;
          }
          break;
        case "\\":
          a = true;
          break;
        default:
          break;
      }
    }
    return e;
  }
  __name(de, "de");
  (function(e) {
    class t extends RegExp {
      static {
        __name(this, "t");
      }
      constructor(s, a, i, r, o) {
        super(s, a), this.pcrePattern = i, this.pcreFlags = r, this.delimiter = o;
      }
    }
    e.PCRE = t, e.characterClasses = { alnum: "[A-Za-z0-9]", word: "[A-Za-z0-9_]", alpha: "[A-Za-z]", blank: "[ \\t]", cntrl: "[\\x00-\\x1F\\x7F]", digit: "\\d", graph: "[\\x21-\\x7E]", lower: "[a-z]", print: "[\\x20-\\x7E]", punct: "[\\]\\[!\"#$%&'()*+,./:;<=>?@\\\\^_`{|}~-]", space: "\\s", upper: "[A-Z]", xdigit: "[A-Fa-f0-9]" };
  })(_ || (_ = {}));
  _.prototype = _.PCRE.prototype;
  F.exports = _;
});
var Y = V((H) => {
  "use strict";
  u();
  l();
  d();
  H.parse = Pe;
  H.serialize = ve;
  var be = Object.prototype.toString, M = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
  function Pe(e, t) {
    if (typeof e != "string") throw new TypeError("argument str must be a string");
    for (var n = {}, s = t || {}, a = s.decode || Se, i = 0; i < e.length; ) {
      var r = e.indexOf("=", i);
      if (r === -1) break;
      var o = e.indexOf(";", i);
      if (o === -1) o = e.length;
      else if (o < r) {
        i = e.lastIndexOf(";", r - 1) + 1;
        continue;
      }
      var c = e.slice(i, r).trim();
      if (n[c] === void 0) {
        var h = e.slice(r + 1, o).trim();
        h.charCodeAt(0) === 34 && (h = h.slice(1, -1)), n[c] = Ee(h, a);
      }
      i = o + 1;
    }
    return n;
  }
  __name(Pe, "Pe");
  function ve(e, t, n) {
    var s = n || {}, a = s.encode || Ce;
    if (typeof a != "function") throw new TypeError("option encode is invalid");
    if (!M.test(e)) throw new TypeError("argument name is invalid");
    var i = a(t);
    if (i && !M.test(i)) throw new TypeError("argument val is invalid");
    var r = e + "=" + i;
    if (s.maxAge != null) {
      var o = s.maxAge - 0;
      if (isNaN(o) || !isFinite(o)) throw new TypeError("option maxAge is invalid");
      r += "; Max-Age=" + Math.floor(o);
    }
    if (s.domain) {
      if (!M.test(s.domain)) throw new TypeError("option domain is invalid");
      r += "; Domain=" + s.domain;
    }
    if (s.path) {
      if (!M.test(s.path)) throw new TypeError("option path is invalid");
      r += "; Path=" + s.path;
    }
    if (s.expires) {
      var c = s.expires;
      if (!ke(c) || isNaN(c.valueOf())) throw new TypeError("option expires is invalid");
      r += "; Expires=" + c.toUTCString();
    }
    if (s.httpOnly && (r += "; HttpOnly"), s.secure && (r += "; Secure"), s.priority) {
      var h = typeof s.priority == "string" ? s.priority.toLowerCase() : s.priority;
      switch (h) {
        case "low":
          r += "; Priority=Low";
          break;
        case "medium":
          r += "; Priority=Medium";
          break;
        case "high":
          r += "; Priority=High";
          break;
        default:
          throw new TypeError("option priority is invalid");
      }
    }
    if (s.sameSite) {
      var p = typeof s.sameSite == "string" ? s.sameSite.toLowerCase() : s.sameSite;
      switch (p) {
        case true:
          r += "; SameSite=Strict";
          break;
        case "lax":
          r += "; SameSite=Lax";
          break;
        case "strict":
          r += "; SameSite=Strict";
          break;
        case "none":
          r += "; SameSite=None";
          break;
        default:
          throw new TypeError("option sameSite is invalid");
      }
    }
    return r;
  }
  __name(ve, "ve");
  function Se(e) {
    return e.indexOf("%") !== -1 ? decodeURIComponent(e) : e;
  }
  __name(Se, "Se");
  function Ce(e) {
    return encodeURIComponent(e);
  }
  __name(Ce, "Ce");
  function ke(e) {
    return be.call(e) === "[object Date]" || e instanceof Date;
  }
  __name(ke, "ke");
  function Ee(e, t) {
    try {
      return t(e);
    } catch {
      return e;
    }
  }
  __name(Ee, "Ee");
});
u();
l();
d();
u();
l();
d();
u();
l();
d();
var b = "INTERNAL_SUSPENSE_CACHE_HOSTNAME.local";
u();
l();
d();
u();
l();
d();
u();
l();
d();
u();
l();
d();
var D = $(q());
function C(e, t, n) {
  if (t == null) return { match: null, captureGroupKeys: [] };
  let s = n ? "" : "i", a = [];
  return { match: (0, D.default)(`%${e}%${s}`, a).exec(t), captureGroupKeys: a };
}
__name(C, "C");
function P(e, t, n, { namedOnly: s } = {}) {
  return e.replace(/\$([a-zA-Z0-9_]+)/g, (a, i) => {
    let r = n.indexOf(i);
    return s && r === -1 ? a : (r === -1 ? t[parseInt(i, 10)] : t[r + 1]) || "";
  });
}
__name(P, "P");
function L(e, { url: t, cookies: n, headers: s, routeDest: a }) {
  switch (e.type) {
    case "host":
      return { valid: t.hostname === e.value };
    case "header":
      return e.value !== void 0 ? A(e.value, s.get(e.key), a) : { valid: s.has(e.key) };
    case "cookie": {
      let i = n[e.key];
      return i && e.value !== void 0 ? A(e.value, i, a) : { valid: i !== void 0 };
    }
    case "query":
      return e.value !== void 0 ? A(e.value, t.searchParams.get(e.key), a) : { valid: t.searchParams.has(e.key) };
  }
}
__name(L, "L");
function A(e, t, n) {
  let { match: s, captureGroupKeys: a } = C(e, t);
  return n && s && a.length ? { valid: !!s, newRouteDest: P(n, s, a, { namedOnly: true }) } : { valid: !!s };
}
__name(A, "A");
u();
l();
d();
function B(e) {
  let t = new Headers(e.headers);
  return e.cf && (t.set("x-vercel-ip-city", encodeURIComponent(e.cf.city)), t.set("x-vercel-ip-country", e.cf.country), t.set("x-vercel-ip-country-region", e.cf.regionCode), t.set("x-vercel-ip-latitude", e.cf.latitude), t.set("x-vercel-ip-longitude", e.cf.longitude)), t.set("x-vercel-sc-host", b), new Request(e, { headers: t });
}
__name(B, "B");
u();
l();
d();
function R(e, t, n) {
  let s = t instanceof Headers ? t.entries() : Object.entries(t);
  for (let [a, i] of s) {
    let r = a.toLowerCase(), o = n?.match ? P(i, n.match, n.captureGroupKeys) : i;
    r === "set-cookie" ? e.append(r, o) : e.set(r, o);
  }
}
__name(R, "R");
function v(e) {
  return /^https?:\/\//.test(e);
}
__name(v, "v");
function w(e, t) {
  for (let [n, s] of t.entries()) {
    let a = /^nxtP(.+)$/.exec(n), i = /^nxtI(.+)$/.exec(n);
    a?.[1] ? (e.set(n, s), e.set(a[1], s)) : i?.[1] ? e.set(i[1], s.replace(/(\(\.+\))+/, "")) : (!e.has(n) || !!s && !e.getAll(n).includes(s)) && e.append(n, s);
  }
}
__name(w, "w");
function O(e, t) {
  let n = new URL(t, e.url);
  return w(n.searchParams, new URL(e.url).searchParams), n.pathname = n.pathname.replace(/\/index.html$/, "/").replace(/\.html$/, ""), new Request(n, e);
}
__name(O, "O");
function S(e) {
  return new Response(e.body, e);
}
__name(S, "S");
function j(e) {
  return e.split(",").map((t) => {
    let [n, s] = t.split(";"), a = parseFloat((s ?? "q=1").replace(/q *= */gi, ""));
    return [n.trim(), isNaN(a) ? 1 : a];
  }).sort((t, n) => n[1] - t[1]).map(([t]) => t === "*" || t === "" ? [] : t).flat();
}
__name(j, "j");
u();
l();
d();
function N(e) {
  switch (e) {
    case "none":
      return "filesystem";
    case "filesystem":
      return "rewrite";
    case "rewrite":
      return "resource";
    case "resource":
      return "miss";
    default:
      return "miss";
  }
}
__name(N, "N");
async function k(e, { request: t, assetsFetcher: n, ctx: s }, { path: a, searchParams: i }) {
  let r, o = new URL(t.url);
  w(o.searchParams, i);
  let c = new Request(o, t);
  try {
    switch (e?.type) {
      case "function":
      case "middleware": {
        let h = await import(e.entrypoint);
        try {
          r = await h.default(c, s);
        } catch (p) {
          let y = p;
          throw y.name === "TypeError" && y.message.endsWith("default is not a function") ? new Error(`An error occurred while evaluating the target edge function (${e.entrypoint})`) : p;
        }
        break;
      }
      case "override": {
        r = S(await n.fetch(O(c, e.path ?? a))), e.headers && R(r.headers, e.headers);
        break;
      }
      case "static": {
        r = await n.fetch(O(c, a));
        break;
      }
      default:
        r = new Response("Not Found", { status: 404 });
    }
  } catch (h) {
    return console.error(h), new Response("Internal Server Error", { status: 500 });
  }
  return S(r);
}
__name(k, "k");
function G(e, t) {
  let n = "^//?(?:", s = ")/(.*)$";
  return !e.startsWith(n) || !e.endsWith(s) ? false : e.slice(n.length, -s.length).split("|").every((i) => t.has(i));
}
__name(G, "G");
u();
l();
d();
function he(e, { protocol: t, hostname: n, port: s, pathname: a }) {
  return !(t && e.protocol.replace(/:$/, "") !== t || !new RegExp(n).test(e.hostname) || s && !new RegExp(s).test(e.port) || a && !new RegExp(a).test(e.pathname));
}
__name(he, "he");
function pe(e, t) {
  if (e.method !== "GET") return;
  let { origin: n, searchParams: s } = new URL(e.url), a = s.get("url"), i = Number.parseInt(s.get("w") ?? "", 10), r = Number.parseInt(s.get("q") ?? "75", 10);
  if (!a || Number.isNaN(i) || Number.isNaN(r) || !t?.sizes?.includes(i) || r < 0 || r > 100) return;
  let o = new URL(a, n);
  if (o.pathname.endsWith(".svg") && !t?.dangerouslyAllowSVG) return;
  let c = a.startsWith("//"), h = a.startsWith("/") && !c;
  if (!h && !t?.domains?.includes(o.hostname) && !t?.remotePatterns?.find((x) => he(o, x))) return;
  let p = e.headers.get("Accept") ?? "", y = t?.formats?.find((x) => p.includes(x))?.replace("image/", "");
  return { isRelative: h, imageUrl: o, options: { width: i, quality: r, format: y } };
}
__name(pe, "pe");
function fe(e, t, n) {
  let s = new Headers();
  if (n?.contentSecurityPolicy && s.set("Content-Security-Policy", n.contentSecurityPolicy), n?.contentDispositionType) {
    let i = t.pathname.split("/").pop(), r = i ? `${n.contentDispositionType}; filename="${i}"` : n.contentDispositionType;
    s.set("Content-Disposition", r);
  }
  e.headers.has("Cache-Control") || s.set("Cache-Control", `public, max-age=${n?.minimumCacheTTL ?? 60}`);
  let a = S(e);
  return R(a.headers, s), a;
}
__name(fe, "fe");
async function K(e, { buildOutput: t, assetsFetcher: n, imagesConfig: s }) {
  let a = pe(e, s);
  if (!a) return new Response("Invalid image resizing request", { status: 400 });
  let { isRelative: i, imageUrl: r } = a, c = await (i && r.pathname in t ? n.fetch.bind(n) : fetch)(r);
  return fe(c, r, s);
}
__name(K, "K");
u();
l();
d();
u();
l();
d();
u();
l();
d();
async function E(e) {
  return import(e);
}
__name(E, "E");
var me = "x-vercel-cache-tags";
var ge = "x-next-cache-soft-tags";
var ye = Symbol.for("__cloudflare-request-context__");
async function J(e) {
  let t = `https://${b}/v1/suspense-cache/`;
  if (!e.url.startsWith(t)) return null;
  try {
    let n = new URL(e.url), s = await Re();
    if (n.pathname === "/v1/suspense-cache/revalidate") {
      let i = n.searchParams.get("tags")?.split(",") ?? [];
      for (let r of i) await s.revalidateTag(r);
      return new Response(null, { status: 200 });
    }
    let a = n.pathname.replace("/v1/suspense-cache/", "");
    if (!a.length) return new Response("Invalid cache key", { status: 400 });
    switch (e.method) {
      case "GET": {
        let i = z(e, ge), r = await s.get(a, { softTags: i });
        return r ? new Response(JSON.stringify(r.value), { status: 200, headers: { "Content-Type": "application/json", "x-vercel-cache-state": "fresh", age: `${(Date.now() - (r.lastModified ?? Date.now())) / 1e3}` } }) : new Response(null, { status: 404 });
      }
      case "POST": {
        let i = globalThis[ye], r = /* @__PURE__ */ __name(async () => {
          let o = await e.json();
          o.data.tags === void 0 && (o.tags ??= z(e, me) ?? []), await s.set(a, o);
        }, "r");
        return i ? i.ctx.waitUntil(r()) : await r(), new Response(null, { status: 200 });
      }
      default:
        return new Response(null, { status: 405 });
    }
  } catch (n) {
    return console.error(n), new Response("Error handling cache request", { status: 500 });
  }
}
__name(J, "J");
async function Re() {
  return process.env.__NEXT_ON_PAGES__KV_SUSPENSE_CACHE ? W("kv") : W("cache-api");
}
__name(Re, "Re");
async function W(e) {
  let t = `./__next-on-pages-dist__/cache/${e}.js`, n = await E(t);
  return new n.default();
}
__name(W, "W");
function z(e, t) {
  return e.headers.get(t)?.split(",")?.filter(Boolean);
}
__name(z, "z");
function X() {
  globalThis[Z] || (we(), globalThis[Z] = true);
}
__name(X, "X");
function we() {
  let e = globalThis.fetch;
  globalThis.fetch = async (...t) => {
    let n = new Request(...t), s = await _e(n);
    return s || (s = await J(n), s) ? s : (xe(n), e(n));
  };
}
__name(we, "we");
async function _e(e) {
  if (e.url.startsWith("blob:")) try {
    let n = `./__next-on-pages-dist__/assets/${new URL(e.url).pathname}.bin`, s = (await E(n)).default, a = { async arrayBuffer() {
      return s;
    }, get body() {
      return new ReadableStream({ start(i) {
        let r = Buffer.from(s);
        i.enqueue(r), i.close();
      } });
    }, async text() {
      return Buffer.from(s).toString();
    }, async json() {
      let i = Buffer.from(s);
      return JSON.stringify(i.toString());
    }, async blob() {
      return new Blob(s);
    } };
    return a.clone = () => ({ ...a }), a;
  } catch {
  }
  return null;
}
__name(_e, "_e");
function xe(e) {
  e.headers.has("user-agent") || e.headers.set("user-agent", "Next.js Middleware");
}
__name(xe, "xe");
var Z = Symbol.for("next-on-pages fetch patch");
u();
l();
d();
var Q = $(Y());
var T = class {
  static {
    __name(this, "T");
  }
  constructor(t, n, s, a, i) {
    this.routes = t;
    this.output = n;
    this.reqCtx = s;
    this.url = new URL(s.request.url), this.cookies = (0, Q.parse)(s.request.headers.get("cookie") || ""), this.path = this.url.pathname || "/", this.headers = { normal: new Headers(), important: new Headers() }, this.searchParams = new URLSearchParams(), w(this.searchParams, this.url.searchParams), this.checkPhaseCounter = 0, this.middlewareInvoked = [], this.wildcardMatch = i?.find((r) => r.domain === this.url.hostname), this.locales = new Set(a.collectedLocales);
  }
  url;
  cookies;
  wildcardMatch;
  path;
  status;
  headers;
  searchParams;
  body;
  checkPhaseCounter;
  middlewareInvoked;
  locales;
  checkRouteMatch(t, { checkStatus: n, checkIntercept: s }) {
    let a = C(t.src, this.path, t.caseSensitive);
    if (!a.match || t.methods && !t.methods.map((r) => r.toUpperCase()).includes(this.reqCtx.request.method.toUpperCase())) return;
    let i = { url: this.url, cookies: this.cookies, headers: this.reqCtx.request.headers, routeDest: t.dest };
    if (!t.has?.find((r) => {
      let o = L(r, i);
      return o.newRouteDest && (i.routeDest = o.newRouteDest), !o.valid;
    }) && !t.missing?.find((r) => L(r, i).valid) && !(n && t.status !== this.status)) {
      if (s && t.dest) {
        let r = /\/(\(\.+\))+/, o = r.test(t.dest), c = r.test(this.path);
        if (o && !c) return;
      }
      return { routeMatch: a, routeDest: i.routeDest };
    }
  }
  processMiddlewareResp(t) {
    let n = "x-middleware-override-headers", s = t.headers.get(n);
    if (s) {
      let c = new Set(s.split(",").map((h) => h.trim()));
      for (let h of c.keys()) {
        let p = `x-middleware-request-${h}`, y = t.headers.get(p);
        this.reqCtx.request.headers.get(h) !== y && (y ? this.reqCtx.request.headers.set(h, y) : this.reqCtx.request.headers.delete(h)), t.headers.delete(p);
      }
      t.headers.delete(n);
    }
    let a = "x-middleware-rewrite", i = t.headers.get(a);
    if (i) {
      let c = new URL(i, this.url), h = this.url.hostname !== c.hostname;
      this.path = h ? `${c}` : c.pathname, w(this.searchParams, c.searchParams), t.headers.delete(a);
    }
    let r = "x-middleware-next";
    t.headers.get(r) ? t.headers.delete(r) : !i && !t.headers.has("location") ? (this.body = t.body, this.status = t.status) : t.headers.has("location") && t.status >= 300 && t.status < 400 && (this.status = t.status), R(this.reqCtx.request.headers, t.headers), R(this.headers.normal, t.headers), this.headers.middlewareLocation = t.headers.get("location");
  }
  async runRouteMiddleware(t) {
    if (!t) return true;
    let n = t && this.output[t];
    if (!n || n.type !== "middleware") return this.status = 500, false;
    let s = await k(n, this.reqCtx, { path: this.path, searchParams: this.searchParams, headers: this.headers, status: this.status });
    return this.middlewareInvoked.push(t), s.status === 500 ? (this.status = s.status, false) : (this.processMiddlewareResp(s), true);
  }
  applyRouteOverrides(t) {
    !t.override || (this.status = void 0, this.headers.normal = new Headers(), this.headers.important = new Headers());
  }
  applyRouteHeaders(t, n, s) {
    !t.headers || (R(this.headers.normal, t.headers, { match: n, captureGroupKeys: s }), t.important && R(this.headers.important, t.headers, { match: n, captureGroupKeys: s }));
  }
  applyRouteStatus(t) {
    !t.status || (this.status = t.status);
  }
  applyRouteDest(t, n, s) {
    if (!t.dest) return this.path;
    let a = this.path, i = t.dest;
    this.wildcardMatch && /\$wildcard/.test(i) && (i = i.replace(/\$wildcard/g, this.wildcardMatch.value)), this.path = P(i, n, s);
    let r = /\/index\.rsc$/i.test(this.path), o = /^\/(?:index)?$/i.test(a), c = /^\/__index\.prefetch\.rsc$/i.test(a);
    r && !o && !c && (this.path = a);
    let h = /\.rsc$/i.test(this.path), p = /\.prefetch\.rsc$/i.test(this.path), y = this.path in this.output;
    h && !p && !y && (this.path = this.path.replace(/\.rsc/i, ""));
    let x = new URL(this.path, this.url);
    return w(this.searchParams, x.searchParams), v(this.path) || (this.path = x.pathname), a;
  }
  applyLocaleRedirects(t) {
    if (!t.locale?.redirect || !/^\^(.)*$/.test(t.src) && t.src !== this.path || this.headers.normal.has("location")) return;
    let { locale: { redirect: s, cookie: a } } = t, i = a && this.cookies[a], r = j(i ?? ""), o = j(this.reqCtx.request.headers.get("accept-language") ?? ""), p = [...r, ...o].map((y) => s[y]).filter(Boolean)[0];
    if (p) {
      !this.path.startsWith(p) && (this.headers.normal.set("location", p), this.status = 307);
      return;
    }
  }
  getLocaleFriendlyRoute(t, n) {
    return !this.locales || n !== "miss" ? t : G(t.src, this.locales) ? { ...t, src: t.src.replace(/\/\(\.\*\)\$$/, "(?:/(.*))?$") } : t;
  }
  async checkRoute(t, n) {
    let s = this.getLocaleFriendlyRoute(n, t), { routeMatch: a, routeDest: i } = this.checkRouteMatch(s, { checkStatus: t === "error", checkIntercept: t === "rewrite" }) ?? {}, r = { ...s, dest: i };
    if (!a?.match || r.middlewarePath && this.middlewareInvoked.includes(r.middlewarePath)) return "skip";
    let { match: o, captureGroupKeys: c } = a;
    if (this.applyRouteOverrides(r), this.applyLocaleRedirects(r), !await this.runRouteMiddleware(r.middlewarePath)) return "error";
    if (this.body !== void 0 || this.headers.middlewareLocation) return "done";
    this.applyRouteHeaders(r, o, c), this.applyRouteStatus(r);
    let p = this.applyRouteDest(r, o, c);
    if (r.check && !v(this.path)) if (p === this.path) {
      if (t !== "miss") return this.checkPhase(N(t));
      this.status = 404;
    } else if (t === "miss") {
      if (!(this.path in this.output) && !(this.path.replace(/\/$/, "") in this.output)) return this.checkPhase("filesystem");
      this.status === 404 && (this.status = void 0);
    } else return this.checkPhase("none");
    return !r.continue || r.status && r.status >= 300 && r.status <= 399 ? "done" : "next";
  }
  async checkPhase(t) {
    if (this.checkPhaseCounter++ >= 50) return console.error(`Routing encountered an infinite loop while checking ${this.url.pathname}`), this.status = 500, "error";
    this.middlewareInvoked = [];
    let n = true;
    for (let i of this.routes[t]) {
      let r = await this.checkRoute(t, i);
      if (r === "error") return "error";
      if (r === "done") {
        n = false;
        break;
      }
    }
    if (t === "hit" || v(this.path) || this.headers.normal.has("location") || !!this.body) return "done";
    if (t === "none") for (let i of this.locales) {
      let r = new RegExp(`/${i}(/.*)`), c = this.path.match(r)?.[1];
      if (c && c in this.output) {
        this.path = c;
        break;
      }
    }
    let s = this.path in this.output;
    if (!s && this.path.endsWith("/")) {
      let i = this.path.replace(/\/$/, "");
      s = i in this.output, s && (this.path = i);
    }
    if (t === "miss" && !s) {
      let i = !this.status || this.status < 400;
      this.status = i ? 404 : this.status;
    }
    let a = "miss";
    return s || t === "miss" || t === "error" ? a = "hit" : n && (a = N(t)), this.checkPhase(a);
  }
  async run(t = "none") {
    this.checkPhaseCounter = 0;
    let n = await this.checkPhase(t);
    return this.headers.normal.has("location") && (!this.status || this.status < 300 || this.status >= 400) && (this.status = 307), n;
  }
};
async function ee(e, t, n, s) {
  let a = new T(t.routes, n, e, s, t.wildcard), i = await te(a);
  return Me(e, i, n);
}
__name(ee, "ee");
async function te(e, t = "none", n = false) {
  return await e.run(t) === "error" || !n && e.status && e.status >= 400 ? te(e, "error", true) : { path: e.path, status: e.status, headers: e.headers, searchParams: e.searchParams, body: e.body };
}
__name(te, "te");
async function Me(e, { path: t = "/404", status: n, headers: s, searchParams: a, body: i }, r) {
  let o = s.normal.get("location");
  if (o) {
    if (o !== s.middlewareLocation) {
      let p = [...a.keys()].length ? `?${a.toString()}` : "";
      s.normal.set("location", `${o ?? "/"}${p}`);
    }
    return new Response(null, { status: n, headers: s.normal });
  }
  let c;
  if (i !== void 0) c = new Response(i, { status: n });
  else if (v(t)) {
    let p = new URL(t);
    w(p.searchParams, a), c = await fetch(p, e.request);
  } else c = await k(r[t], e, { path: t, status: n, headers: s, searchParams: a });
  let h = s.normal;
  return R(h, c.headers), R(h, s.important), c = new Response(c.body, { ...c, status: n || c.status, headers: h }), c;
}
__name(Me, "Me");
u();
l();
d();
function se() {
  globalThis.__nextOnPagesRoutesIsolation ??= { _map: /* @__PURE__ */ new Map(), getProxyFor: Te };
}
__name(se, "se");
function Te(e) {
  let t = globalThis.__nextOnPagesRoutesIsolation._map.get(e);
  if (t) return t;
  let n = Ie();
  return globalThis.__nextOnPagesRoutesIsolation._map.set(e, n), n;
}
__name(Te, "Te");
function Ie() {
  let e = /* @__PURE__ */ new Map();
  return new Proxy(globalThis, { get: /* @__PURE__ */ __name((t, n) => e.has(n) ? e.get(n) : Reflect.get(globalThis, n), "get"), set: /* @__PURE__ */ __name((t, n, s) => Ae.has(n) ? Reflect.set(globalThis, n, s) : (e.set(n, s), true), "set") });
}
__name(Ie, "Ie");
var Ae = /* @__PURE__ */ new Set(["_nextOriginalFetch", "fetch", "__incrementalCache"]);
var Le = Object.defineProperty;
var Oe = /* @__PURE__ */ __name((...e) => {
  let t = e[0], n = e[1], s = "__import_unsupported";
  if (!(n === s && typeof t == "object" && t !== null && s in t)) return Le(...e);
}, "Oe");
globalThis.Object.defineProperty = Oe;
globalThis.AbortController = class extends AbortController {
  constructor() {
    try {
      super();
    } catch (t) {
      if (t instanceof Error && t.message.includes("Disallowed operation called within global scope")) return { signal: { aborted: false, reason: null, onabort: /* @__PURE__ */ __name(() => {
      }, "onabort"), throwIfAborted: /* @__PURE__ */ __name(() => {
      }, "throwIfAborted") }, abort() {
      } };
      throw t;
    }
  }
};
var Ss = { async fetch(e, t, n) {
  se(), X();
  let s = await __ALSes_PROMISE__;
  if (!s) {
    let r = new URL(e.url), o = await t.ASSETS.fetch(`${r.protocol}//${r.host}/cdn-cgi/errors/no-nodejs_compat.html`), c = o.ok ? o.body : "Error: Could not access built-in Node.js modules. Please make sure that your Cloudflare Pages project has the 'nodejs_compat' compatibility flag set.";
    return new Response(c, { status: 503 });
  }
  let { envAsyncLocalStorage: a, requestContextAsyncLocalStorage: i } = s;
  return a.run({ ...t, NODE_ENV: "production", SUSPENSE_CACHE_URL: b }, async () => i.run({ env: t, ctx: n, cf: e.cf }, async () => {
    if (new URL(e.url).pathname.startsWith("/_next/image")) return K(e, { buildOutput: m, assetsFetcher: t.ASSETS, imagesConfig: f.images });
    let o = B(e);
    return ee({ request: o, ctx: n, assetsFetcher: t.ASSETS }, f, m, g);
  }));
} };
export {
  Ss as default
};
/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */
//# sourceMappingURL=bundledWorker-0.3531913865858436.mjs.map
