
import {Buffer} from "node:buffer";
globalThis.Buffer = Buffer;

import {AsyncLocalStorage} from "node:async_hooks";
globalThis.AsyncLocalStorage = AsyncLocalStorage;


const defaultDefineProperty = Object.defineProperty;
Object.defineProperty = function(o, p, a) {
  if(p=== '__import_unsupported' && Boolean(globalThis.__import_unsupported)) {
    return;
  }
  return defaultDefineProperty(o, p, a);
};

  
  
  globalThis.openNextDebug = false;globalThis.openNextVersion = "3.9.10";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/@opennextjs/aws/dist/utils/error.js
function isOpenNextError(e) {
  try {
    return "__openNextInternal" in e;
  } catch {
    return false;
  }
}
var init_error = __esm({
  "node_modules/@opennextjs/aws/dist/utils/error.js"() {
  }
});

// node_modules/@opennextjs/aws/dist/adapters/logger.js
function debug(...args) {
  if (globalThis.openNextDebug) {
    console.log(...args);
  }
}
function warn(...args) {
  console.warn(...args);
}
function error(...args) {
  if (args.some((arg) => isDownplayedErrorLog(arg))) {
    return debug(...args);
  }
  if (args.some((arg) => isOpenNextError(arg))) {
    const error2 = args.find((arg) => isOpenNextError(arg));
    if (error2.logLevel < getOpenNextErrorLogLevel()) {
      return;
    }
    if (error2.logLevel === 0) {
      return console.log(...args.map((arg) => isOpenNextError(arg) ? `${arg.name}: ${arg.message}` : arg));
    }
    if (error2.logLevel === 1) {
      return warn(...args.map((arg) => isOpenNextError(arg) ? `${arg.name}: ${arg.message}` : arg));
    }
    return console.error(...args);
  }
  console.error(...args);
}
function getOpenNextErrorLogLevel() {
  const strLevel = process.env.OPEN_NEXT_ERROR_LOG_LEVEL ?? "1";
  switch (strLevel.toLowerCase()) {
    case "debug":
    case "0":
      return 0;
    case "error":
    case "2":
      return 2;
    default:
      return 1;
  }
}
var DOWNPLAYED_ERROR_LOGS, isDownplayedErrorLog;
var init_logger = __esm({
  "node_modules/@opennextjs/aws/dist/adapters/logger.js"() {
    init_error();
    DOWNPLAYED_ERROR_LOGS = [
      {
        clientName: "S3Client",
        commandName: "GetObjectCommand",
        errorName: "NoSuchKey"
      }
    ];
    isDownplayedErrorLog = (errorLog) => DOWNPLAYED_ERROR_LOGS.some((downplayedInput) => downplayedInput.clientName === errorLog?.clientName && downplayedInput.commandName === errorLog?.commandName && (downplayedInput.errorName === errorLog?.error?.name || downplayedInput.errorName === errorLog?.error?.Code));
  }
});

// node_modules/@opennextjs/aws/node_modules/cookie/dist/index.js
var require_dist = __commonJS({
  "node_modules/@opennextjs/aws/node_modules/cookie/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseCookie = parseCookie;
    exports.parse = parseCookie;
    exports.stringifyCookie = stringifyCookie;
    exports.stringifySetCookie = stringifySetCookie;
    exports.serialize = stringifySetCookie;
    exports.parseSetCookie = parseSetCookie;
    exports.stringifySetCookie = stringifySetCookie;
    exports.serialize = stringifySetCookie;
    var cookieNameRegExp = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;
    var cookieValueRegExp = /^[\u0021-\u003A\u003C-\u007E]*$/;
    var domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
    var pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
    var maxAgeRegExp = /^-?\d+$/;
    var __toString = Object.prototype.toString;
    var NullObject = /* @__PURE__ */ (() => {
      const C = function() {
      };
      C.prototype = /* @__PURE__ */ Object.create(null);
      return C;
    })();
    function parseCookie(str, options) {
      const obj = new NullObject();
      const len = str.length;
      if (len < 2)
        return obj;
      const dec = options?.decode || decode;
      let index = 0;
      do {
        const eqIdx = eqIndex(str, index, len);
        if (eqIdx === -1)
          break;
        const endIdx = endIndex(str, index, len);
        if (eqIdx > endIdx) {
          index = str.lastIndexOf(";", eqIdx - 1) + 1;
          continue;
        }
        const key = valueSlice(str, index, eqIdx);
        if (obj[key] === void 0) {
          obj[key] = dec(valueSlice(str, eqIdx + 1, endIdx));
        }
        index = endIdx + 1;
      } while (index < len);
      return obj;
    }
    function stringifyCookie(cookie, options) {
      const enc = options?.encode || encodeURIComponent;
      const cookieStrings = [];
      for (const name of Object.keys(cookie)) {
        const val = cookie[name];
        if (val === void 0)
          continue;
        if (!cookieNameRegExp.test(name)) {
          throw new TypeError(`cookie name is invalid: ${name}`);
        }
        const value = enc(val);
        if (!cookieValueRegExp.test(value)) {
          throw new TypeError(`cookie val is invalid: ${val}`);
        }
        cookieStrings.push(`${name}=${value}`);
      }
      return cookieStrings.join("; ");
    }
    function stringifySetCookie(_name, _val, _opts) {
      const cookie = typeof _name === "object" ? _name : { ..._opts, name: _name, value: String(_val) };
      const options = typeof _val === "object" ? _val : _opts;
      const enc = options?.encode || encodeURIComponent;
      if (!cookieNameRegExp.test(cookie.name)) {
        throw new TypeError(`argument name is invalid: ${cookie.name}`);
      }
      const value = cookie.value ? enc(cookie.value) : "";
      if (!cookieValueRegExp.test(value)) {
        throw new TypeError(`argument val is invalid: ${cookie.value}`);
      }
      let str = cookie.name + "=" + value;
      if (cookie.maxAge !== void 0) {
        if (!Number.isInteger(cookie.maxAge)) {
          throw new TypeError(`option maxAge is invalid: ${cookie.maxAge}`);
        }
        str += "; Max-Age=" + cookie.maxAge;
      }
      if (cookie.domain) {
        if (!domainValueRegExp.test(cookie.domain)) {
          throw new TypeError(`option domain is invalid: ${cookie.domain}`);
        }
        str += "; Domain=" + cookie.domain;
      }
      if (cookie.path) {
        if (!pathValueRegExp.test(cookie.path)) {
          throw new TypeError(`option path is invalid: ${cookie.path}`);
        }
        str += "; Path=" + cookie.path;
      }
      if (cookie.expires) {
        if (!isDate(cookie.expires) || !Number.isFinite(cookie.expires.valueOf())) {
          throw new TypeError(`option expires is invalid: ${cookie.expires}`);
        }
        str += "; Expires=" + cookie.expires.toUTCString();
      }
      if (cookie.httpOnly) {
        str += "; HttpOnly";
      }
      if (cookie.secure) {
        str += "; Secure";
      }
      if (cookie.partitioned) {
        str += "; Partitioned";
      }
      if (cookie.priority) {
        const priority = typeof cookie.priority === "string" ? cookie.priority.toLowerCase() : void 0;
        switch (priority) {
          case "low":
            str += "; Priority=Low";
            break;
          case "medium":
            str += "; Priority=Medium";
            break;
          case "high":
            str += "; Priority=High";
            break;
          default:
            throw new TypeError(`option priority is invalid: ${cookie.priority}`);
        }
      }
      if (cookie.sameSite) {
        const sameSite = typeof cookie.sameSite === "string" ? cookie.sameSite.toLowerCase() : cookie.sameSite;
        switch (sameSite) {
          case true:
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError(`option sameSite is invalid: ${cookie.sameSite}`);
        }
      }
      return str;
    }
    function parseSetCookie(str, options) {
      const dec = options?.decode || decode;
      const len = str.length;
      const endIdx = endIndex(str, 0, len);
      const eqIdx = eqIndex(str, 0, endIdx);
      const setCookie = eqIdx === -1 ? { name: "", value: dec(valueSlice(str, 0, endIdx)) } : {
        name: valueSlice(str, 0, eqIdx),
        value: dec(valueSlice(str, eqIdx + 1, endIdx))
      };
      let index = endIdx + 1;
      while (index < len) {
        const endIdx2 = endIndex(str, index, len);
        const eqIdx2 = eqIndex(str, index, endIdx2);
        const attr = eqIdx2 === -1 ? valueSlice(str, index, endIdx2) : valueSlice(str, index, eqIdx2);
        const val = eqIdx2 === -1 ? void 0 : valueSlice(str, eqIdx2 + 1, endIdx2);
        switch (attr.toLowerCase()) {
          case "httponly":
            setCookie.httpOnly = true;
            break;
          case "secure":
            setCookie.secure = true;
            break;
          case "partitioned":
            setCookie.partitioned = true;
            break;
          case "domain":
            setCookie.domain = val;
            break;
          case "path":
            setCookie.path = val;
            break;
          case "max-age":
            if (val && maxAgeRegExp.test(val))
              setCookie.maxAge = Number(val);
            break;
          case "expires":
            if (!val)
              break;
            const date = new Date(val);
            if (Number.isFinite(date.valueOf()))
              setCookie.expires = date;
            break;
          case "priority":
            if (!val)
              break;
            const priority = val.toLowerCase();
            if (priority === "low" || priority === "medium" || priority === "high") {
              setCookie.priority = priority;
            }
            break;
          case "samesite":
            if (!val)
              break;
            const sameSite = val.toLowerCase();
            if (sameSite === "lax" || sameSite === "strict" || sameSite === "none") {
              setCookie.sameSite = sameSite;
            }
            break;
        }
        index = endIdx2 + 1;
      }
      return setCookie;
    }
    function endIndex(str, min, len) {
      const index = str.indexOf(";", min);
      return index === -1 ? len : index;
    }
    function eqIndex(str, min, max) {
      const index = str.indexOf("=", min);
      return index < max ? index : -1;
    }
    function valueSlice(str, min, max) {
      let start = min;
      let end = max;
      do {
        const code = str.charCodeAt(start);
        if (code !== 32 && code !== 9)
          break;
      } while (++start < end);
      while (end > start) {
        const code = str.charCodeAt(end - 1);
        if (code !== 32 && code !== 9)
          break;
        end--;
      }
      return str.slice(start, end);
    }
    function decode(str) {
      if (str.indexOf("%") === -1)
        return str;
      try {
        return decodeURIComponent(str);
      } catch (e) {
        return str;
      }
    }
    function isDate(val) {
      return __toString.call(val) === "[object Date]";
    }
  }
});

// node_modules/@opennextjs/aws/dist/http/util.js
function parseSetCookieHeader(cookies) {
  if (!cookies) {
    return [];
  }
  if (typeof cookies === "string") {
    return cookies.split(/(?<!Expires=\w+),/i).map((c) => c.trim());
  }
  return cookies;
}
function getQueryFromIterator(it) {
  const query = {};
  for (const [key, value] of it) {
    if (key in query) {
      if (Array.isArray(query[key])) {
        query[key].push(value);
      } else {
        query[key] = [query[key], value];
      }
    } else {
      query[key] = value;
    }
  }
  return query;
}
var init_util = __esm({
  "node_modules/@opennextjs/aws/dist/http/util.js"() {
    init_logger();
  }
});

// node_modules/@opennextjs/aws/dist/overrides/converters/utils.js
function getQueryFromSearchParams(searchParams) {
  return getQueryFromIterator(searchParams.entries());
}
var init_utils = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/converters/utils.js"() {
    init_util();
  }
});

// node_modules/@opennextjs/aws/dist/overrides/converters/edge.js
var edge_exports = {};
__export(edge_exports, {
  default: () => edge_default
});
import { Buffer as Buffer2 } from "node:buffer";
var import_cookie, NULL_BODY_STATUSES, converter, edge_default;
var init_edge = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/converters/edge.js"() {
    import_cookie = __toESM(require_dist(), 1);
    init_util();
    init_utils();
    NULL_BODY_STATUSES = /* @__PURE__ */ new Set([101, 103, 204, 205, 304]);
    converter = {
      convertFrom: async (event) => {
        const url = new URL(event.url);
        const searchParams = url.searchParams;
        const query = getQueryFromSearchParams(searchParams);
        const headers = {};
        event.headers.forEach((value, key) => {
          headers[key] = value;
        });
        const rawPath = url.pathname;
        const method = event.method;
        const shouldHaveBody = method !== "GET" && method !== "HEAD";
        const body = shouldHaveBody ? Buffer2.from(await event.arrayBuffer()) : void 0;
        const cookieHeader = event.headers.get("cookie");
        const cookies = cookieHeader ? import_cookie.default.parse(cookieHeader) : {};
        return {
          type: "core",
          method,
          rawPath,
          url: event.url,
          body,
          headers,
          remoteAddress: event.headers.get("x-forwarded-for") ?? "::1",
          query,
          cookies
        };
      },
      convertTo: async (result) => {
        if ("internalEvent" in result) {
          const request = new Request(result.internalEvent.url, {
            body: result.internalEvent.body,
            method: result.internalEvent.method,
            headers: {
              ...result.internalEvent.headers,
              "x-forwarded-host": result.internalEvent.headers.host
            }
          });
          if (globalThis.__dangerous_ON_edge_converter_returns_request === true) {
            return request;
          }
          const cfCache = (result.isISR || result.internalEvent.rawPath.startsWith("/_next/image")) && process.env.DISABLE_CACHE !== "true" ? { cacheEverything: true } : {};
          return fetch(request, {
            // This is a hack to make sure that the response is cached by Cloudflare
            // See https://developers.cloudflare.com/workers/examples/cache-using-fetch/#caching-html-resources
            // @ts-expect-error - This is a Cloudflare specific option
            cf: cfCache
          });
        }
        const headers = new Headers();
        for (const [key, value] of Object.entries(result.headers)) {
          if (key === "set-cookie" && typeof value === "string") {
            const cookies = parseSetCookieHeader(value);
            for (const cookie of cookies) {
              headers.append(key, cookie);
            }
            continue;
          }
          if (Array.isArray(value)) {
            for (const v of value) {
              headers.append(key, v);
            }
          } else {
            headers.set(key, value);
          }
        }
        const body = NULL_BODY_STATUSES.has(result.statusCode) ? null : result.body;
        return new Response(body, {
          status: result.statusCode,
          headers
        });
      },
      name: "edge"
    };
    edge_default = converter;
  }
});

// node_modules/@opennextjs/aws/dist/overrides/wrappers/cloudflare-edge.js
var cloudflare_edge_exports = {};
__export(cloudflare_edge_exports, {
  default: () => cloudflare_edge_default
});
var cfPropNameMapping, handler, cloudflare_edge_default;
var init_cloudflare_edge = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/wrappers/cloudflare-edge.js"() {
    cfPropNameMapping = {
      // The city name is percent-encoded.
      // See https://github.com/vercel/vercel/blob/4cb6143/packages/functions/src/headers.ts#L94C19-L94C37
      city: [encodeURIComponent, "x-open-next-city"],
      country: "x-open-next-country",
      regionCode: "x-open-next-region",
      latitude: "x-open-next-latitude",
      longitude: "x-open-next-longitude"
    };
    handler = async (handler3, converter2) => async (request, env, ctx) => {
      globalThis.process = process;
      for (const [key, value] of Object.entries(env)) {
        if (typeof value === "string") {
          process.env[key] = value;
        }
      }
      const internalEvent = await converter2.convertFrom(request);
      const cfProperties = request.cf;
      for (const [propName, mapping] of Object.entries(cfPropNameMapping)) {
        const propValue = cfProperties?.[propName];
        if (propValue != null) {
          const [encode, headerName] = Array.isArray(mapping) ? mapping : [null, mapping];
          internalEvent.headers[headerName] = encode ? encode(propValue) : propValue;
        }
      }
      const response = await handler3(internalEvent, {
        waitUntil: ctx.waitUntil.bind(ctx)
      });
      const result = await converter2.convertTo(response);
      return result;
    };
    cloudflare_edge_default = {
      wrapper: handler,
      name: "cloudflare-edge",
      supportStreaming: true,
      edgeRuntime: true
    };
  }
});

// node_modules/@opennextjs/aws/dist/overrides/originResolver/pattern-env.js
var pattern_env_exports = {};
__export(pattern_env_exports, {
  default: () => pattern_env_default
});
function initializeOnce() {
  if (initialized)
    return;
  cachedOrigins = JSON.parse(process.env.OPEN_NEXT_ORIGIN ?? "{}");
  const functions = globalThis.openNextConfig.functions ?? {};
  for (const key in functions) {
    if (key !== "default") {
      const value = functions[key];
      const regexes = [];
      for (const pattern of value.patterns) {
        const regexPattern = `/${pattern.replace(/\*\*/g, "(.*)").replace(/\*/g, "([^/]*)").replace(/\//g, "\\/").replace(/\?/g, ".")}`;
        regexes.push(new RegExp(regexPattern));
      }
      cachedPatterns.push({
        key,
        patterns: value.patterns,
        regexes
      });
    }
  }
  initialized = true;
}
var cachedOrigins, cachedPatterns, initialized, envLoader, pattern_env_default;
var init_pattern_env = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/originResolver/pattern-env.js"() {
    init_logger();
    cachedPatterns = [];
    initialized = false;
    envLoader = {
      name: "env",
      resolve: async (_path) => {
        try {
          initializeOnce();
          for (const { key, patterns, regexes } of cachedPatterns) {
            for (const regex of regexes) {
              if (regex.test(_path)) {
                debug("Using origin", key, patterns);
                return cachedOrigins[key];
              }
            }
          }
          if (_path.startsWith("/_next/image") && cachedOrigins.imageOptimizer) {
            debug("Using origin", "imageOptimizer", _path);
            return cachedOrigins.imageOptimizer;
          }
          if (cachedOrigins.default) {
            debug("Using default origin", cachedOrigins.default, _path);
            return cachedOrigins.default;
          }
          return false;
        } catch (e) {
          error("Error while resolving origin", e);
          return false;
        }
      }
    };
    pattern_env_default = envLoader;
  }
});

// node_modules/@opennextjs/aws/dist/overrides/assetResolver/dummy.js
var dummy_exports = {};
__export(dummy_exports, {
  default: () => dummy_default
});
var resolver, dummy_default;
var init_dummy = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/assetResolver/dummy.js"() {
    resolver = {
      name: "dummy"
    };
    dummy_default = resolver;
  }
});

// node_modules/@opennextjs/aws/dist/utils/stream.js
import { ReadableStream } from "node:stream/web";
function toReadableStream(value, isBase64) {
  return new ReadableStream({
    pull(controller) {
      controller.enqueue(Buffer.from(value, isBase64 ? "base64" : "utf8"));
      controller.close();
    }
  }, { highWaterMark: 0 });
}
function emptyReadableStream() {
  if (process.env.OPEN_NEXT_FORCE_NON_EMPTY_RESPONSE === "true") {
    return new ReadableStream({
      pull(controller) {
        maybeSomethingBuffer ??= Buffer.from("SOMETHING");
        controller.enqueue(maybeSomethingBuffer);
        controller.close();
      }
    }, { highWaterMark: 0 });
  }
  return new ReadableStream({
    start(controller) {
      controller.close();
    }
  });
}
var maybeSomethingBuffer;
var init_stream = __esm({
  "node_modules/@opennextjs/aws/dist/utils/stream.js"() {
  }
});

// node_modules/@opennextjs/aws/dist/overrides/proxyExternalRequest/fetch.js
var fetch_exports = {};
__export(fetch_exports, {
  default: () => fetch_default
});
var fetchProxy, fetch_default;
var init_fetch = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/proxyExternalRequest/fetch.js"() {
    init_stream();
    fetchProxy = {
      name: "fetch-proxy",
      // @ts-ignore
      proxy: async (internalEvent) => {
        const { url, headers: eventHeaders, method, body } = internalEvent;
        const headers = Object.fromEntries(Object.entries(eventHeaders).filter(([key]) => key.toLowerCase() !== "cf-connecting-ip"));
        const response = await fetch(url, {
          method,
          headers,
          body
        });
        const responseHeaders = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });
        return {
          type: "core",
          headers: responseHeaders,
          statusCode: response.status,
          isBase64Encoded: true,
          body: response.body ?? emptyReadableStream()
        };
      }
    };
    fetch_default = fetchProxy;
  }
});

// .next/server/edge-runtime-webpack.js
var require_edge_runtime_webpack = __commonJS({
  ".next/server/edge-runtime-webpack.js"() {
    "use strict";
    (() => {
      "use strict";
      var e = {}, r = {};
      function t(o) {
        var n = r[o];
        if (void 0 !== n) return n.exports;
        var i = r[o] = { exports: {} }, l = true;
        try {
          e[o](i, i.exports, t), l = false;
        } finally {
          l && delete r[o];
        }
        return i.exports;
      }
      t.m = e, t.amdO = {}, (() => {
        var e2 = [];
        t.O = (r2, o, n, i) => {
          if (o) {
            i = i || 0;
            for (var l = e2.length; l > 0 && e2[l - 1][2] > i; l--) e2[l] = e2[l - 1];
            e2[l] = [o, n, i];
            return;
          }
          for (var a = 1 / 0, l = 0; l < e2.length; l++) {
            for (var [o, n, i] = e2[l], f = true, u = 0; u < o.length; u++) a >= i && Object.keys(t.O).every((e3) => t.O[e3](o[u])) ? o.splice(u--, 1) : (f = false, i < a && (a = i));
            if (f) {
              e2.splice(l--, 1);
              var s = n();
              void 0 !== s && (r2 = s);
            }
          }
          return r2;
        };
      })(), t.d = (e2, r2) => {
        for (var o in r2) t.o(r2, o) && !t.o(e2, o) && Object.defineProperty(e2, o, { enumerable: true, get: r2[o] });
      }, t.g = function() {
        if ("object" == typeof globalThis) return globalThis;
        try {
          return this || Function("return this")();
        } catch (e2) {
          if ("object" == typeof window) return window;
        }
      }(), t.o = (e2, r2) => Object.prototype.hasOwnProperty.call(e2, r2), t.r = (e2) => {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e2, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(e2, "__esModule", { value: true });
      }, (() => {
        var e2 = { 993: 0 };
        t.O.j = (r3) => 0 === e2[r3];
        var r2 = (r3, o2) => {
          var n, i, [l, a, f] = o2, u = 0;
          if (l.some((r4) => 0 !== e2[r4])) {
            for (n in a) t.o(a, n) && (t.m[n] = a[n]);
            if (f) var s = f(t);
          }
          for (r3 && r3(o2); u < l.length; u++) i = l[u], t.o(e2, i) && e2[i] && e2[i][0](), e2[i] = 0;
          return t.O(s);
        }, o = self.webpackChunk_N_E = self.webpackChunk_N_E || [];
        o.forEach(r2.bind(null, 0)), o.push = r2.bind(null, o.push.bind(o));
      })();
    })();
  }
});

// node-built-in-modules:node:async_hooks
var node_async_hooks_exports = {};
import * as node_async_hooks_star from "node:async_hooks";
var init_node_async_hooks = __esm({
  "node-built-in-modules:node:async_hooks"() {
    __reExport(node_async_hooks_exports, node_async_hooks_star);
  }
});

// node-built-in-modules:node:buffer
var node_buffer_exports = {};
import * as node_buffer_star from "node:buffer";
var init_node_buffer = __esm({
  "node-built-in-modules:node:buffer"() {
    __reExport(node_buffer_exports, node_buffer_star);
  }
});

// .next/server/src/middleware.js
var require_middleware = __commonJS({
  ".next/server/src/middleware.js"() {
    "use strict";
    (self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([[727], { 67: (e) => {
      "use strict";
      e.exports = (init_node_async_hooks(), __toCommonJS(node_async_hooks_exports));
    }, 195: (e) => {
      "use strict";
      e.exports = (init_node_buffer(), __toCommonJS(node_buffer_exports));
    }, 156: (e, t, r) => {
      "use strict";
      let n, i, a, o, s, c, l;
      r.r(t), r.d(t, { default: () => sV });
      var u, d, p = {};
      r.r(p), r.d(p, { parse: () => r7, serialize: () => nr });
      var h = {};
      async function f() {
        let e10 = "_ENTRIES" in globalThis && _ENTRIES.middleware_instrumentation && (await _ENTRIES.middleware_instrumentation).register;
        if (e10) try {
          await e10();
        } catch (e11) {
          throw e11.message = `An error occurred while loading instrumentation hook: ${e11.message}`, e11;
        }
      }
      r.r(h), r.d(h, { config: () => sW, default: () => sH });
      let g = null;
      function m() {
        return g || (g = f()), g;
      }
      function y(e10) {
        return `The edge runtime does not support Node.js '${e10}' module.
Learn More: https://nextjs.org/docs/messages/node-module-in-edge-runtime`;
      }
      process !== r.g.process && (process.env = r.g.process.env, r.g.process = process), Object.defineProperty(globalThis, "__import_unsupported", { value: function(e10) {
        let t10 = new Proxy(function() {
        }, { get(t11, r10) {
          if ("then" === r10) return {};
          throw Error(y(e10));
        }, construct() {
          throw Error(y(e10));
        }, apply(r10, n10, i10) {
          if ("function" == typeof i10[0]) return i10[0](t10);
          throw Error(y(e10));
        } });
        return new Proxy({}, { get: () => t10 });
      }, enumerable: false, configurable: false }), m();
      class w extends Error {
        constructor({ page: e10 }) {
          super(`The middleware "${e10}" accepts an async API directly with the form:
  
  export function middleware(request, event) {
    return NextResponse.redirect('/new-location')
  }
  
  Read more: https://nextjs.org/docs/messages/middleware-new-signature
  `);
        }
      }
      class b extends Error {
        constructor() {
          super(`The request.page has been deprecated in favour of \`URLPattern\`.
  Read more: https://nextjs.org/docs/messages/middleware-request-page
  `);
        }
      }
      class v extends Error {
        constructor() {
          super(`The request.ua has been removed in favour of \`userAgent\` function.
  Read more: https://nextjs.org/docs/messages/middleware-parse-user-agent
  `);
        }
      }
      let _ = { shared: "shared", reactServerComponents: "rsc", serverSideRendering: "ssr", actionBrowser: "action-browser", api: "api", middleware: "middleware", instrument: "instrument", edgeAsset: "edge-asset", appPagesBrowser: "app-pages-browser", appMetadataRoute: "app-metadata-route", appRouteHandler: "app-route-handler" };
      function S(e10) {
        var t10, r10, n10, i10, a10, o10 = [], s2 = 0;
        function c2() {
          for (; s2 < e10.length && /\s/.test(e10.charAt(s2)); ) s2 += 1;
          return s2 < e10.length;
        }
        for (; s2 < e10.length; ) {
          for (t10 = s2, a10 = false; c2(); ) if ("," === (r10 = e10.charAt(s2))) {
            for (n10 = s2, s2 += 1, c2(), i10 = s2; s2 < e10.length && "=" !== (r10 = e10.charAt(s2)) && ";" !== r10 && "," !== r10; ) s2 += 1;
            s2 < e10.length && "=" === e10.charAt(s2) ? (a10 = true, s2 = i10, o10.push(e10.substring(t10, n10)), t10 = s2) : s2 = n10 + 1;
          } else s2 += 1;
          (!a10 || s2 >= e10.length) && o10.push(e10.substring(t10, e10.length));
        }
        return o10;
      }
      function k(e10) {
        let t10 = {}, r10 = [];
        if (e10) for (let [n10, i10] of e10.entries()) "set-cookie" === n10.toLowerCase() ? (r10.push(...S(i10)), t10[n10] = 1 === r10.length ? r10[0] : r10) : t10[n10] = i10;
        return t10;
      }
      function E(e10) {
        try {
          return String(new URL(String(e10)));
        } catch (t10) {
          throw Error(`URL is malformed "${String(e10)}". Please use only absolute URLs - https://nextjs.org/docs/messages/middleware-relative-urls`, { cause: t10 });
        }
      }
      ({ ..._, GROUP: { serverOnly: [_.reactServerComponents, _.actionBrowser, _.appMetadataRoute, _.appRouteHandler, _.instrument], clientOnly: [_.serverSideRendering, _.appPagesBrowser], nonClientServerTarget: [_.middleware, _.api], app: [_.reactServerComponents, _.actionBrowser, _.appMetadataRoute, _.appRouteHandler, _.serverSideRendering, _.appPagesBrowser, _.shared, _.instrument] } });
      let x = Symbol("response"), A = Symbol("passThrough"), T = Symbol("waitUntil");
      class P {
        constructor(e10) {
          this[T] = [], this[A] = false;
        }
        respondWith(e10) {
          this[x] || (this[x] = Promise.resolve(e10));
        }
        passThroughOnException() {
          this[A] = true;
        }
        waitUntil(e10) {
          this[T].push(e10);
        }
      }
      class C extends P {
        constructor(e10) {
          super(e10.request), this.sourcePage = e10.page;
        }
        get request() {
          throw new w({ page: this.sourcePage });
        }
        respondWith() {
          throw new w({ page: this.sourcePage });
        }
      }
      function R(e10) {
        return e10.replace(/\/$/, "") || "/";
      }
      function O(e10) {
        let t10 = e10.indexOf("#"), r10 = e10.indexOf("?"), n10 = r10 > -1 && (t10 < 0 || r10 < t10);
        return n10 || t10 > -1 ? { pathname: e10.substring(0, n10 ? r10 : t10), query: n10 ? e10.substring(r10, t10 > -1 ? t10 : void 0) : "", hash: t10 > -1 ? e10.slice(t10) : "" } : { pathname: e10, query: "", hash: "" };
      }
      function I(e10, t10) {
        if (!e10.startsWith("/") || !t10) return e10;
        let { pathname: r10, query: n10, hash: i10 } = O(e10);
        return "" + t10 + r10 + n10 + i10;
      }
      function U(e10, t10) {
        if (!e10.startsWith("/") || !t10) return e10;
        let { pathname: r10, query: n10, hash: i10 } = O(e10);
        return "" + r10 + t10 + n10 + i10;
      }
      function N(e10, t10) {
        if ("string" != typeof e10) return false;
        let { pathname: r10 } = O(e10);
        return r10 === t10 || r10.startsWith(t10 + "/");
      }
      function L(e10, t10) {
        let r10;
        let n10 = e10.split("/");
        return (t10 || []).some((t11) => !!n10[1] && n10[1].toLowerCase() === t11.toLowerCase() && (r10 = t11, n10.splice(1, 1), e10 = n10.join("/") || "/", true)), { pathname: e10, detectedLocale: r10 };
      }
      let $ = /(?!^https?:\/\/)(127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}|\[::1\]|localhost)/;
      function M(e10, t10) {
        return new URL(String(e10).replace($, "localhost"), t10 && String(t10).replace($, "localhost"));
      }
      let j = Symbol("NextURLInternal");
      class D {
        constructor(e10, t10, r10) {
          let n10, i10;
          "object" == typeof t10 && "pathname" in t10 || "string" == typeof t10 ? (n10 = t10, i10 = r10 || {}) : i10 = r10 || t10 || {}, this[j] = { url: M(e10, n10 ?? i10.base), options: i10, basePath: "" }, this.analyze();
        }
        analyze() {
          var e10, t10, r10, n10, i10;
          let a10 = function(e11, t11) {
            var r11, n11;
            let { basePath: i11, i18n: a11, trailingSlash: o11 } = null != (r11 = t11.nextConfig) ? r11 : {}, s3 = { pathname: e11, trailingSlash: "/" !== e11 ? e11.endsWith("/") : o11 };
            i11 && N(s3.pathname, i11) && (s3.pathname = function(e12, t12) {
              if (!N(e12, t12)) return e12;
              let r12 = e12.slice(t12.length);
              return r12.startsWith("/") ? r12 : "/" + r12;
            }(s3.pathname, i11), s3.basePath = i11);
            let c2 = s3.pathname;
            if (s3.pathname.startsWith("/_next/data/") && s3.pathname.endsWith(".json")) {
              let e12 = s3.pathname.replace(/^\/_next\/data\//, "").replace(/\.json$/, "").split("/"), r12 = e12[0];
              s3.buildId = r12, c2 = "index" !== e12[1] ? "/" + e12.slice(1).join("/") : "/", true === t11.parseData && (s3.pathname = c2);
            }
            if (a11) {
              let e12 = t11.i18nProvider ? t11.i18nProvider.analyze(s3.pathname) : L(s3.pathname, a11.locales);
              s3.locale = e12.detectedLocale, s3.pathname = null != (n11 = e12.pathname) ? n11 : s3.pathname, !e12.detectedLocale && s3.buildId && (e12 = t11.i18nProvider ? t11.i18nProvider.analyze(c2) : L(c2, a11.locales)).detectedLocale && (s3.locale = e12.detectedLocale);
            }
            return s3;
          }(this[j].url.pathname, { nextConfig: this[j].options.nextConfig, parseData: true, i18nProvider: this[j].options.i18nProvider }), o10 = function(e11, t11) {
            let r11;
            if ((null == t11 ? void 0 : t11.host) && !Array.isArray(t11.host)) r11 = t11.host.toString().split(":", 1)[0];
            else {
              if (!e11.hostname) return;
              r11 = e11.hostname;
            }
            return r11.toLowerCase();
          }(this[j].url, this[j].options.headers);
          this[j].domainLocale = this[j].options.i18nProvider ? this[j].options.i18nProvider.detectDomainLocale(o10) : function(e11, t11, r11) {
            if (e11) for (let a11 of (r11 && (r11 = r11.toLowerCase()), e11)) {
              var n11, i11;
              if (t11 === (null == (n11 = a11.domain) ? void 0 : n11.split(":", 1)[0].toLowerCase()) || r11 === a11.defaultLocale.toLowerCase() || (null == (i11 = a11.locales) ? void 0 : i11.some((e12) => e12.toLowerCase() === r11))) return a11;
            }
          }(null == (t10 = this[j].options.nextConfig) ? void 0 : null == (e10 = t10.i18n) ? void 0 : e10.domains, o10);
          let s2 = (null == (r10 = this[j].domainLocale) ? void 0 : r10.defaultLocale) || (null == (i10 = this[j].options.nextConfig) ? void 0 : null == (n10 = i10.i18n) ? void 0 : n10.defaultLocale);
          this[j].url.pathname = a10.pathname, this[j].defaultLocale = s2, this[j].basePath = a10.basePath ?? "", this[j].buildId = a10.buildId, this[j].locale = a10.locale ?? s2, this[j].trailingSlash = a10.trailingSlash;
        }
        formatPathname() {
          var e10;
          let t10;
          return t10 = function(e11, t11, r10, n10) {
            if (!t11 || t11 === r10) return e11;
            let i10 = e11.toLowerCase();
            return !n10 && (N(i10, "/api") || N(i10, "/" + t11.toLowerCase())) ? e11 : I(e11, "/" + t11);
          }((e10 = { basePath: this[j].basePath, buildId: this[j].buildId, defaultLocale: this[j].options.forceLocale ? void 0 : this[j].defaultLocale, locale: this[j].locale, pathname: this[j].url.pathname, trailingSlash: this[j].trailingSlash }).pathname, e10.locale, e10.buildId ? void 0 : e10.defaultLocale, e10.ignorePrefix), (e10.buildId || !e10.trailingSlash) && (t10 = R(t10)), e10.buildId && (t10 = U(I(t10, "/_next/data/" + e10.buildId), "/" === e10.pathname ? "index.json" : ".json")), t10 = I(t10, e10.basePath), !e10.buildId && e10.trailingSlash ? t10.endsWith("/") ? t10 : U(t10, "/") : R(t10);
        }
        formatSearch() {
          return this[j].url.search;
        }
        get buildId() {
          return this[j].buildId;
        }
        set buildId(e10) {
          this[j].buildId = e10;
        }
        get locale() {
          return this[j].locale ?? "";
        }
        set locale(e10) {
          var t10, r10;
          if (!this[j].locale || !(null == (r10 = this[j].options.nextConfig) ? void 0 : null == (t10 = r10.i18n) ? void 0 : t10.locales.includes(e10))) throw TypeError(`The NextURL configuration includes no locale "${e10}"`);
          this[j].locale = e10;
        }
        get defaultLocale() {
          return this[j].defaultLocale;
        }
        get domainLocale() {
          return this[j].domainLocale;
        }
        get searchParams() {
          return this[j].url.searchParams;
        }
        get host() {
          return this[j].url.host;
        }
        set host(e10) {
          this[j].url.host = e10;
        }
        get hostname() {
          return this[j].url.hostname;
        }
        set hostname(e10) {
          this[j].url.hostname = e10;
        }
        get port() {
          return this[j].url.port;
        }
        set port(e10) {
          this[j].url.port = e10;
        }
        get protocol() {
          return this[j].url.protocol;
        }
        set protocol(e10) {
          this[j].url.protocol = e10;
        }
        get href() {
          let e10 = this.formatPathname(), t10 = this.formatSearch();
          return `${this.protocol}//${this.host}${e10}${t10}${this.hash}`;
        }
        set href(e10) {
          this[j].url = M(e10), this.analyze();
        }
        get origin() {
          return this[j].url.origin;
        }
        get pathname() {
          return this[j].url.pathname;
        }
        set pathname(e10) {
          this[j].url.pathname = e10;
        }
        get hash() {
          return this[j].url.hash;
        }
        set hash(e10) {
          this[j].url.hash = e10;
        }
        get search() {
          return this[j].url.search;
        }
        set search(e10) {
          this[j].url.search = e10;
        }
        get password() {
          return this[j].url.password;
        }
        set password(e10) {
          this[j].url.password = e10;
        }
        get username() {
          return this[j].url.username;
        }
        set username(e10) {
          this[j].url.username = e10;
        }
        get basePath() {
          return this[j].basePath;
        }
        set basePath(e10) {
          this[j].basePath = e10.startsWith("/") ? e10 : `/${e10}`;
        }
        toString() {
          return this.href;
        }
        toJSON() {
          return this.href;
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return { href: this.href, origin: this.origin, protocol: this.protocol, username: this.username, password: this.password, host: this.host, hostname: this.hostname, port: this.port, pathname: this.pathname, search: this.search, searchParams: this.searchParams, hash: this.hash };
        }
        clone() {
          return new D(String(this), this[j].options);
        }
      }
      var H = r(945);
      let W = Symbol("internal request");
      class K extends Request {
        constructor(e10, t10 = {}) {
          let r10 = "string" != typeof e10 && "url" in e10 ? e10.url : String(e10);
          E(r10), e10 instanceof Request ? super(e10, t10) : super(r10, t10);
          let n10 = new D(r10, { headers: k(this.headers), nextConfig: t10.nextConfig });
          this[W] = { cookies: new H.RequestCookies(this.headers), geo: t10.geo || {}, ip: t10.ip, nextUrl: n10, url: n10.toString() };
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return { cookies: this.cookies, geo: this.geo, ip: this.ip, nextUrl: this.nextUrl, url: this.url, bodyUsed: this.bodyUsed, cache: this.cache, credentials: this.credentials, destination: this.destination, headers: Object.fromEntries(this.headers), integrity: this.integrity, keepalive: this.keepalive, method: this.method, mode: this.mode, redirect: this.redirect, referrer: this.referrer, referrerPolicy: this.referrerPolicy, signal: this.signal };
        }
        get cookies() {
          return this[W].cookies;
        }
        get geo() {
          return this[W].geo;
        }
        get ip() {
          return this[W].ip;
        }
        get nextUrl() {
          return this[W].nextUrl;
        }
        get page() {
          throw new b();
        }
        get ua() {
          throw new v();
        }
        get url() {
          return this[W].url;
        }
      }
      class B {
        static get(e10, t10, r10) {
          let n10 = Reflect.get(e10, t10, r10);
          return "function" == typeof n10 ? n10.bind(e10) : n10;
        }
        static set(e10, t10, r10, n10) {
          return Reflect.set(e10, t10, r10, n10);
        }
        static has(e10, t10) {
          return Reflect.has(e10, t10);
        }
        static deleteProperty(e10, t10) {
          return Reflect.deleteProperty(e10, t10);
        }
      }
      let J = Symbol("internal response"), V = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
      function q(e10, t10) {
        var r10;
        if (null == e10 ? void 0 : null == (r10 = e10.request) ? void 0 : r10.headers) {
          if (!(e10.request.headers instanceof Headers)) throw Error("request.headers must be an instance of Headers");
          let r11 = [];
          for (let [n10, i10] of e10.request.headers) t10.set("x-middleware-request-" + n10, i10), r11.push(n10);
          t10.set("x-middleware-override-headers", r11.join(","));
        }
      }
      class z extends Response {
        constructor(e10, t10 = {}) {
          super(e10, t10);
          let r10 = this.headers, n10 = new Proxy(new H.ResponseCookies(r10), { get(e11, n11, i10) {
            switch (n11) {
              case "delete":
              case "set":
                return (...i11) => {
                  let a10 = Reflect.apply(e11[n11], e11, i11), o10 = new Headers(r10);
                  return a10 instanceof H.ResponseCookies && r10.set("x-middleware-set-cookie", a10.getAll().map((e12) => (0, H.stringifyCookie)(e12)).join(",")), q(t10, o10), a10;
                };
              default:
                return B.get(e11, n11, i10);
            }
          } });
          this[J] = { cookies: n10, url: t10.url ? new D(t10.url, { headers: k(r10), nextConfig: t10.nextConfig }) : void 0 };
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return { cookies: this.cookies, url: this.url, body: this.body, bodyUsed: this.bodyUsed, headers: Object.fromEntries(this.headers), ok: this.ok, redirected: this.redirected, status: this.status, statusText: this.statusText, type: this.type };
        }
        get cookies() {
          return this[J].cookies;
        }
        static json(e10, t10) {
          let r10 = Response.json(e10, t10);
          return new z(r10.body, r10);
        }
        static redirect(e10, t10) {
          let r10 = "number" == typeof t10 ? t10 : (null == t10 ? void 0 : t10.status) ?? 307;
          if (!V.has(r10)) throw RangeError('Failed to execute "redirect" on "response": Invalid status code');
          let n10 = "object" == typeof t10 ? t10 : {}, i10 = new Headers(null == n10 ? void 0 : n10.headers);
          return i10.set("Location", E(e10)), new z(null, { ...n10, headers: i10, status: r10 });
        }
        static rewrite(e10, t10) {
          let r10 = new Headers(null == t10 ? void 0 : t10.headers);
          return r10.set("x-middleware-rewrite", E(e10)), q(t10, r10), new z(null, { ...t10, headers: r10 });
        }
        static next(e10) {
          let t10 = new Headers(null == e10 ? void 0 : e10.headers);
          return t10.set("x-middleware-next", "1"), q(e10, t10), new z(null, { ...e10, headers: t10 });
        }
      }
      function F(e10, t10) {
        let r10 = "string" == typeof t10 ? new URL(t10) : t10, n10 = new URL(e10, t10), i10 = r10.protocol + "//" + r10.host;
        return n10.protocol + "//" + n10.host === i10 ? n10.toString().replace(i10, "") : n10.toString();
      }
      let G = [["RSC"], ["Next-Router-State-Tree"], ["Next-Router-Prefetch"]], X = ["__nextFallback", "__nextLocale", "__nextInferredLocaleFromDefault", "__nextDefaultLocale", "__nextIsNotFound", "_rsc"], Y = ["__nextDataReq"];
      class Z extends Error {
        constructor() {
          super("Headers cannot be modified. Read more: https://nextjs.org/docs/app/api-reference/functions/headers");
        }
        static callable() {
          throw new Z();
        }
      }
      class Q extends Headers {
        constructor(e10) {
          super(), this.headers = new Proxy(e10, { get(t10, r10, n10) {
            if ("symbol" == typeof r10) return B.get(t10, r10, n10);
            let i10 = r10.toLowerCase(), a10 = Object.keys(e10).find((e11) => e11.toLowerCase() === i10);
            if (void 0 !== a10) return B.get(t10, a10, n10);
          }, set(t10, r10, n10, i10) {
            if ("symbol" == typeof r10) return B.set(t10, r10, n10, i10);
            let a10 = r10.toLowerCase(), o10 = Object.keys(e10).find((e11) => e11.toLowerCase() === a10);
            return B.set(t10, o10 ?? r10, n10, i10);
          }, has(t10, r10) {
            if ("symbol" == typeof r10) return B.has(t10, r10);
            let n10 = r10.toLowerCase(), i10 = Object.keys(e10).find((e11) => e11.toLowerCase() === n10);
            return void 0 !== i10 && B.has(t10, i10);
          }, deleteProperty(t10, r10) {
            if ("symbol" == typeof r10) return B.deleteProperty(t10, r10);
            let n10 = r10.toLowerCase(), i10 = Object.keys(e10).find((e11) => e11.toLowerCase() === n10);
            return void 0 === i10 || B.deleteProperty(t10, i10);
          } });
        }
        static seal(e10) {
          return new Proxy(e10, { get(e11, t10, r10) {
            switch (t10) {
              case "append":
              case "delete":
              case "set":
                return Z.callable;
              default:
                return B.get(e11, t10, r10);
            }
          } });
        }
        merge(e10) {
          return Array.isArray(e10) ? e10.join(", ") : e10;
        }
        static from(e10) {
          return e10 instanceof Headers ? e10 : new Q(e10);
        }
        append(e10, t10) {
          let r10 = this.headers[e10];
          "string" == typeof r10 ? this.headers[e10] = [r10, t10] : Array.isArray(r10) ? r10.push(t10) : this.headers[e10] = t10;
        }
        delete(e10) {
          delete this.headers[e10];
        }
        get(e10) {
          let t10 = this.headers[e10];
          return void 0 !== t10 ? this.merge(t10) : null;
        }
        has(e10) {
          return void 0 !== this.headers[e10];
        }
        set(e10, t10) {
          this.headers[e10] = t10;
        }
        forEach(e10, t10) {
          for (let [r10, n10] of this.entries()) e10.call(t10, n10, r10, this);
        }
        *entries() {
          for (let e10 of Object.keys(this.headers)) {
            let t10 = e10.toLowerCase(), r10 = this.get(t10);
            yield [t10, r10];
          }
        }
        *keys() {
          for (let e10 of Object.keys(this.headers)) {
            let t10 = e10.toLowerCase();
            yield t10;
          }
        }
        *values() {
          for (let e10 of Object.keys(this.headers)) {
            let t10 = this.get(e10);
            yield t10;
          }
        }
        [Symbol.iterator]() {
          return this.entries();
        }
      }
      var ee = r(452);
      class et extends Error {
        constructor() {
          super("Cookies can only be modified in a Server Action or Route Handler. Read more: https://nextjs.org/docs/app/api-reference/functions/cookies#cookiessetname-value-options");
        }
        static callable() {
          throw new et();
        }
      }
      class er {
        static seal(e10) {
          return new Proxy(e10, { get(e11, t10, r10) {
            switch (t10) {
              case "clear":
              case "delete":
              case "set":
                return et.callable;
              default:
                return B.get(e11, t10, r10);
            }
          } });
        }
      }
      let en = Symbol.for("next.mutated.cookies");
      class ei {
        static wrap(e10, t10) {
          let r10 = new H.ResponseCookies(new Headers());
          for (let t11 of e10.getAll()) r10.set(t11);
          let n10 = [], i10 = /* @__PURE__ */ new Set(), a10 = () => {
            let e11 = ee.A.getStore();
            if (e11 && (e11.pathWasRevalidated = true), n10 = r10.getAll().filter((e12) => i10.has(e12.name)), t10) {
              let e12 = [];
              for (let t11 of n10) {
                let r11 = new H.ResponseCookies(new Headers());
                r11.set(t11), e12.push(r11.toString());
              }
              t10(e12);
            }
          };
          return new Proxy(r10, { get(e11, t11, r11) {
            switch (t11) {
              case en:
                return n10;
              case "delete":
                return function(...t12) {
                  i10.add("string" == typeof t12[0] ? t12[0] : t12[0].name);
                  try {
                    e11.delete(...t12);
                  } finally {
                    a10();
                  }
                };
              case "set":
                return function(...t12) {
                  i10.add("string" == typeof t12[0] ? t12[0] : t12[0].name);
                  try {
                    return e11.set(...t12);
                  } finally {
                    a10();
                  }
                };
              default:
                return B.get(e11, t11, r11);
            }
          } });
        }
      }
      !function(e10) {
        e10.handleRequest = "BaseServer.handleRequest", e10.run = "BaseServer.run", e10.pipe = "BaseServer.pipe", e10.getStaticHTML = "BaseServer.getStaticHTML", e10.render = "BaseServer.render", e10.renderToResponseWithComponents = "BaseServer.renderToResponseWithComponents", e10.renderToResponse = "BaseServer.renderToResponse", e10.renderToHTML = "BaseServer.renderToHTML", e10.renderError = "BaseServer.renderError", e10.renderErrorToResponse = "BaseServer.renderErrorToResponse", e10.renderErrorToHTML = "BaseServer.renderErrorToHTML", e10.render404 = "BaseServer.render404";
      }(nM || (nM = {})), function(e10) {
        e10.loadDefaultErrorComponents = "LoadComponents.loadDefaultErrorComponents", e10.loadComponents = "LoadComponents.loadComponents";
      }(nj || (nj = {})), function(e10) {
        e10.getRequestHandler = "NextServer.getRequestHandler", e10.getServer = "NextServer.getServer", e10.getServerRequestHandler = "NextServer.getServerRequestHandler", e10.createServer = "createServer.createServer";
      }(nD || (nD = {})), function(e10) {
        e10.compression = "NextNodeServer.compression", e10.getBuildId = "NextNodeServer.getBuildId", e10.createComponentTree = "NextNodeServer.createComponentTree", e10.clientComponentLoading = "NextNodeServer.clientComponentLoading", e10.getLayoutOrPageModule = "NextNodeServer.getLayoutOrPageModule", e10.generateStaticRoutes = "NextNodeServer.generateStaticRoutes", e10.generateFsStaticRoutes = "NextNodeServer.generateFsStaticRoutes", e10.generatePublicRoutes = "NextNodeServer.generatePublicRoutes", e10.generateImageRoutes = "NextNodeServer.generateImageRoutes.route", e10.sendRenderResult = "NextNodeServer.sendRenderResult", e10.proxyRequest = "NextNodeServer.proxyRequest", e10.runApi = "NextNodeServer.runApi", e10.render = "NextNodeServer.render", e10.renderHTML = "NextNodeServer.renderHTML", e10.imageOptimizer = "NextNodeServer.imageOptimizer", e10.getPagePath = "NextNodeServer.getPagePath", e10.getRoutesManifest = "NextNodeServer.getRoutesManifest", e10.findPageComponents = "NextNodeServer.findPageComponents", e10.getFontManifest = "NextNodeServer.getFontManifest", e10.getServerComponentManifest = "NextNodeServer.getServerComponentManifest", e10.getRequestHandler = "NextNodeServer.getRequestHandler", e10.renderToHTML = "NextNodeServer.renderToHTML", e10.renderError = "NextNodeServer.renderError", e10.renderErrorToHTML = "NextNodeServer.renderErrorToHTML", e10.render404 = "NextNodeServer.render404", e10.startResponse = "NextNodeServer.startResponse", e10.route = "route", e10.onProxyReq = "onProxyReq", e10.apiResolver = "apiResolver", e10.internalFetch = "internalFetch";
      }(nH || (nH = {})), (nW || (nW = {})).startServer = "startServer.startServer", function(e10) {
        e10.getServerSideProps = "Render.getServerSideProps", e10.getStaticProps = "Render.getStaticProps", e10.renderToString = "Render.renderToString", e10.renderDocument = "Render.renderDocument", e10.createBodyResult = "Render.createBodyResult";
      }(nK || (nK = {})), function(e10) {
        e10.renderToString = "AppRender.renderToString", e10.renderToReadableStream = "AppRender.renderToReadableStream", e10.getBodyResult = "AppRender.getBodyResult", e10.fetch = "AppRender.fetch";
      }(nB || (nB = {})), (nJ || (nJ = {})).executeRoute = "Router.executeRoute", (nV || (nV = {})).runHandler = "Node.runHandler", (nq || (nq = {})).runHandler = "AppRouteRouteHandlers.runHandler", function(e10) {
        e10.generateMetadata = "ResolveMetadata.generateMetadata", e10.generateViewport = "ResolveMetadata.generateViewport";
      }(nz || (nz = {})), (nF || (nF = {})).execute = "Middleware.execute";
      let ea = ["Middleware.execute", "BaseServer.handleRequest", "Render.getServerSideProps", "Render.getStaticProps", "AppRender.fetch", "AppRender.getBodyResult", "Render.renderDocument", "Node.runHandler", "AppRouteRouteHandlers.runHandler", "ResolveMetadata.generateMetadata", "ResolveMetadata.generateViewport", "NextNodeServer.createComponentTree", "NextNodeServer.findPageComponents", "NextNodeServer.getLayoutOrPageModule", "NextNodeServer.startResponse", "NextNodeServer.clientComponentLoading"], eo = ["NextNodeServer.findPageComponents", "NextNodeServer.createComponentTree", "NextNodeServer.clientComponentLoading"], { context: es, propagation: ec, trace: el, SpanStatusCode: eu, SpanKind: ed, ROOT_CONTEXT: ep } = n = r(439), eh = (e10) => null !== e10 && "object" == typeof e10 && "function" == typeof e10.then, ef = (e10, t10) => {
        (null == t10 ? void 0 : t10.bubble) === true ? e10.setAttribute("next.bubble", true) : (t10 && e10.recordException(t10), e10.setStatus({ code: eu.ERROR, message: null == t10 ? void 0 : t10.message })), e10.end();
      }, eg = /* @__PURE__ */ new Map(), em = n.createContextKey("next.rootSpanId"), ey = 0, ew = () => ey++;
      class eb {
        getTracerInstance() {
          return el.getTracer("next.js", "0.0.1");
        }
        getContext() {
          return es;
        }
        getActiveScopeSpan() {
          return el.getSpan(null == es ? void 0 : es.active());
        }
        withPropagatedContext(e10, t10, r10) {
          let n10 = es.active();
          if (el.getSpanContext(n10)) return t10();
          let i10 = ec.extract(n10, e10, r10);
          return es.with(i10, t10);
        }
        trace(...e10) {
          var t10;
          let [r10, n10, i10] = e10, { fn: a10, options: o10 } = "function" == typeof n10 ? { fn: n10, options: {} } : { fn: i10, options: { ...n10 } }, s2 = o10.spanName ?? r10;
          if (!ea.includes(r10) && "1" !== process.env.NEXT_OTEL_VERBOSE || o10.hideSpan) return a10();
          let c2 = this.getSpanContext((null == o10 ? void 0 : o10.parentSpan) ?? this.getActiveScopeSpan()), l2 = false;
          c2 ? (null == (t10 = el.getSpanContext(c2)) ? void 0 : t10.isRemote) && (l2 = true) : (c2 = (null == es ? void 0 : es.active()) ?? ep, l2 = true);
          let u2 = ew();
          return o10.attributes = { "next.span_name": s2, "next.span_type": r10, ...o10.attributes }, es.with(c2.setValue(em, u2), () => this.getTracerInstance().startActiveSpan(s2, o10, (e11) => {
            let t11 = "performance" in globalThis ? globalThis.performance.now() : void 0, n11 = () => {
              eg.delete(u2), t11 && process.env.NEXT_OTEL_PERFORMANCE_PREFIX && eo.includes(r10 || "") && performance.measure(`${process.env.NEXT_OTEL_PERFORMANCE_PREFIX}:next-${(r10.split(".").pop() || "").replace(/[A-Z]/g, (e12) => "-" + e12.toLowerCase())}`, { start: t11, end: performance.now() });
            };
            l2 && eg.set(u2, new Map(Object.entries(o10.attributes ?? {})));
            try {
              if (a10.length > 1) return a10(e11, (t13) => ef(e11, t13));
              let t12 = a10(e11);
              if (eh(t12)) return t12.then((t13) => (e11.end(), t13)).catch((t13) => {
                throw ef(e11, t13), t13;
              }).finally(n11);
              return e11.end(), n11(), t12;
            } catch (t12) {
              throw ef(e11, t12), n11(), t12;
            }
          }));
        }
        wrap(...e10) {
          let t10 = this, [r10, n10, i10] = 3 === e10.length ? e10 : [e10[0], {}, e10[1]];
          return ea.includes(r10) || "1" === process.env.NEXT_OTEL_VERBOSE ? function() {
            let e11 = n10;
            "function" == typeof e11 && "function" == typeof i10 && (e11 = e11.apply(this, arguments));
            let a10 = arguments.length - 1, o10 = arguments[a10];
            if ("function" != typeof o10) return t10.trace(r10, e11, () => i10.apply(this, arguments));
            {
              let n11 = t10.getContext().bind(es.active(), o10);
              return t10.trace(r10, e11, (e12, t11) => (arguments[a10] = function(e13) {
                return null == t11 || t11(e13), n11.apply(this, arguments);
              }, i10.apply(this, arguments)));
            }
          } : i10;
        }
        startSpan(...e10) {
          let [t10, r10] = e10, n10 = this.getSpanContext((null == r10 ? void 0 : r10.parentSpan) ?? this.getActiveScopeSpan());
          return this.getTracerInstance().startSpan(t10, r10, n10);
        }
        getSpanContext(e10) {
          return e10 ? el.setSpan(es.active(), e10) : void 0;
        }
        getRootSpanAttributes() {
          let e10 = es.active().getValue(em);
          return eg.get(e10);
        }
      }
      let ev = (() => {
        let e10 = new eb();
        return () => e10;
      })(), e_ = "__prerender_bypass";
      Symbol("__next_preview_data"), Symbol(e_);
      class eS {
        constructor(e10, t10, r10, n10) {
          var i10;
          let a10 = e10 && function(e11, t11) {
            let r11 = Q.from(e11.headers);
            return { isOnDemandRevalidate: r11.get("x-prerender-revalidate") === t11.previewModeId, revalidateOnlyGenerated: r11.has("x-prerender-revalidate-if-generated") };
          }(t10, e10).isOnDemandRevalidate, o10 = null == (i10 = r10.get(e_)) ? void 0 : i10.value;
          this.isEnabled = !!(!a10 && o10 && e10 && o10 === e10.previewModeId), this._previewModeId = null == e10 ? void 0 : e10.previewModeId, this._mutableCookies = n10;
        }
        enable() {
          if (!this._previewModeId) throw Error("Invariant: previewProps missing previewModeId this should never happen");
          this._mutableCookies.set({ name: e_, value: this._previewModeId, httpOnly: true, sameSite: "none", secure: true, path: "/" });
        }
        disable() {
          this._mutableCookies.set({ name: e_, value: "", httpOnly: true, sameSite: "none", secure: true, path: "/", expires: /* @__PURE__ */ new Date(0) });
        }
      }
      function ek(e10, t10) {
        if ("x-middleware-set-cookie" in e10.headers && "string" == typeof e10.headers["x-middleware-set-cookie"]) {
          let r10 = e10.headers["x-middleware-set-cookie"], n10 = new Headers();
          for (let e11 of S(r10)) n10.append("set-cookie", e11);
          for (let e11 of new H.ResponseCookies(n10).getAll()) t10.set(e11);
        }
      }
      let eE = { wrap(e10, { req: t10, res: r10, renderOpts: n10 }, i10) {
        let a10;
        function o10(e11) {
          r10 && r10.setHeader("Set-Cookie", e11);
        }
        n10 && "previewProps" in n10 && (a10 = n10.previewProps);
        let s2 = {}, c2 = { get headers() {
          return s2.headers || (s2.headers = function(e11) {
            let t11 = Q.from(e11);
            for (let e12 of G) t11.delete(e12.toString().toLowerCase());
            return Q.seal(t11);
          }(t10.headers)), s2.headers;
        }, get cookies() {
          if (!s2.cookies) {
            let e11 = new H.RequestCookies(Q.from(t10.headers));
            ek(t10, e11), s2.cookies = er.seal(e11);
          }
          return s2.cookies;
        }, get mutableCookies() {
          if (!s2.mutableCookies) {
            let e11 = function(e12, t11) {
              let r11 = new H.RequestCookies(Q.from(e12));
              return ei.wrap(r11, t11);
            }(t10.headers, (null == n10 ? void 0 : n10.onUpdateCookies) || (r10 ? o10 : void 0));
            ek(t10, e11), s2.mutableCookies = e11;
          }
          return s2.mutableCookies;
        }, get draftMode() {
          return s2.draftMode || (s2.draftMode = new eS(a10, t10, this.cookies, this.mutableCookies)), s2.draftMode;
        }, reactLoadableManifest: (null == n10 ? void 0 : n10.reactLoadableManifest) || {}, assetPrefix: (null == n10 ? void 0 : n10.assetPrefix) || "" };
        return e10.run(c2, i10, c2);
      } };
      var ex = r(228);
      let eA = (0, ex.P)();
      function eT(e10) {
        let t10 = eA.getStore();
        if (t10) return t10;
        throw Error("`" + e10 + "` was called outside a request scope. Read more: https://nextjs.org/docs/messages/next-dynamic-api-wrong-context");
      }
      function eP() {
        return { previewModeId: process.env.__NEXT_PREVIEW_MODE_ID, previewModeSigningKey: process.env.__NEXT_PREVIEW_MODE_SIGNING_KEY || "", previewModeEncryptionKey: process.env.__NEXT_PREVIEW_MODE_ENCRYPTION_KEY || "" };
      }
      class eC extends K {
        constructor(e10) {
          super(e10.input, e10.init), this.sourcePage = e10.page;
        }
        get request() {
          throw new w({ page: this.sourcePage });
        }
        respondWith() {
          throw new w({ page: this.sourcePage });
        }
        waitUntil() {
          throw new w({ page: this.sourcePage });
        }
      }
      let eR = { keys: (e10) => Array.from(e10.keys()), get: (e10, t10) => e10.get(t10) ?? void 0 }, eO = (e10, t10) => ev().withPropagatedContext(e10.headers, t10, eR), eI = false;
      async function eU(e10) {
        let t10, n10;
        !function() {
          if (!eI && (eI = true, "true" === process.env.NEXT_PRIVATE_TEST_PROXY)) {
            let { interceptTestApis: e11, wrapRequestHandler: t11 } = r(177);
            e11(), eO = t11(eO);
          }
        }(), await m();
        let i10 = void 0 !== self.__BUILD_MANIFEST;
        e10.request.url = e10.request.url.replace(/\.rsc($|\?)/, "$1");
        let a10 = new D(e10.request.url, { headers: e10.request.headers, nextConfig: e10.request.nextConfig });
        for (let e11 of [...a10.searchParams.keys()]) {
          let t11 = a10.searchParams.getAll(e11);
          !function(e12, t12) {
            for (let r10 of ["nxtP", "nxtI"]) e12 !== r10 && e12.startsWith(r10) && t12(e12.substring(r10.length));
          }(e11, (r10) => {
            for (let e12 of (a10.searchParams.delete(r10), t11)) a10.searchParams.append(r10, e12);
            a10.searchParams.delete(e11);
          });
        }
        let o10 = a10.buildId;
        a10.buildId = "";
        let s2 = e10.request.headers["x-nextjs-data"];
        s2 && "/index" === a10.pathname && (a10.pathname = "/");
        let c2 = function(e11) {
          let t11 = new Headers();
          for (let [r10, n11] of Object.entries(e11)) for (let e12 of Array.isArray(n11) ? n11 : [n11]) void 0 !== e12 && ("number" == typeof e12 && (e12 = e12.toString()), t11.append(r10, e12));
          return t11;
        }(e10.request.headers), l2 = /* @__PURE__ */ new Map();
        if (!i10) for (let e11 of G) {
          let t11 = e11.toString().toLowerCase();
          c2.get(t11) && (l2.set(t11, c2.get(t11)), c2.delete(t11));
        }
        let u2 = new eC({ page: e10.page, input: function(e11, t11) {
          let r10 = "string" == typeof e11, n11 = r10 ? new URL(e11) : e11;
          for (let e12 of X) n11.searchParams.delete(e12);
          if (t11) for (let e12 of Y) n11.searchParams.delete(e12);
          return r10 ? n11.toString() : n11;
        }(a10, true).toString(), init: { body: e10.request.body, geo: e10.request.geo, headers: c2, ip: e10.request.ip, method: e10.request.method, nextConfig: e10.request.nextConfig, signal: e10.request.signal } });
        s2 && Object.defineProperty(u2, "__isData", { enumerable: false, value: true }), !globalThis.__incrementalCacheShared && e10.IncrementalCache && (globalThis.__incrementalCache = new e10.IncrementalCache({ appDir: true, fetchCache: true, minimalMode: true, fetchCacheKeyPrefix: "", dev: false, requestHeaders: e10.request.headers, requestProtocol: "https", getPrerenderManifest: () => ({ version: -1, routes: {}, dynamicRoutes: {}, notFoundRoutes: [], preview: eP() }) }));
        let d2 = new C({ request: u2, page: e10.page });
        if ((t10 = await eO(u2, () => "/middleware" === e10.page || "/src/middleware" === e10.page ? ev().trace(nF.execute, { spanName: `middleware ${u2.method} ${u2.nextUrl.pathname}`, attributes: { "http.target": u2.nextUrl.pathname, "http.method": u2.method } }, () => eE.wrap(eA, { req: u2, renderOpts: { onUpdateCookies: (e11) => {
          n10 = e11;
        }, previewProps: eP() } }, () => e10.handler(u2, d2))) : e10.handler(u2, d2))) && !(t10 instanceof Response)) throw TypeError("Expected an instance of Response to be returned");
        t10 && n10 && t10.headers.set("set-cookie", n10);
        let p2 = null == t10 ? void 0 : t10.headers.get("x-middleware-rewrite");
        if (t10 && p2 && !i10) {
          let r10 = new D(p2, { forceLocale: true, headers: e10.request.headers, nextConfig: e10.request.nextConfig });
          r10.host === u2.nextUrl.host && (r10.buildId = o10 || r10.buildId, t10.headers.set("x-middleware-rewrite", String(r10)));
          let n11 = F(String(r10), String(a10));
          s2 && t10.headers.set("x-nextjs-rewrite", n11);
        }
        let h2 = null == t10 ? void 0 : t10.headers.get("Location");
        if (t10 && h2 && !i10) {
          let r10 = new D(h2, { forceLocale: false, headers: e10.request.headers, nextConfig: e10.request.nextConfig });
          t10 = new Response(t10.body, t10), r10.host === u2.nextUrl.host && (r10.buildId = o10 || r10.buildId, t10.headers.set("Location", String(r10))), s2 && (t10.headers.delete("Location"), t10.headers.set("x-nextjs-redirect", F(String(r10), String(a10))));
        }
        let f2 = t10 || z.next(), g2 = f2.headers.get("x-middleware-override-headers"), y2 = [];
        if (g2) {
          for (let [e11, t11] of l2) f2.headers.set(`x-middleware-request-${e11}`, t11), y2.push(e11);
          y2.length > 0 && f2.headers.set("x-middleware-override-headers", g2 + "," + y2.join(","));
        }
        return { response: f2, waitUntil: Promise.all(d2[T]), fetchMetrics: u2.fetchMetrics };
      }
      var eN = function(e10, t10, r10, n10, i10) {
        if ("m" === n10) throw TypeError("Private method is not writable");
        if ("a" === n10 && !i10) throw TypeError("Private accessor was defined without a setter");
        if ("function" == typeof t10 ? e10 !== t10 || !i10 : !t10.has(e10)) throw TypeError("Cannot write private member to an object whose class did not declare it");
        return "a" === n10 ? i10.call(e10, r10) : i10 ? i10.value = r10 : t10.set(e10, r10), r10;
      }, eL = function(e10, t10, r10, n10) {
        if ("a" === r10 && !n10) throw TypeError("Private accessor was defined without a getter");
        if ("function" == typeof t10 ? e10 !== t10 || !n10 : !t10.has(e10)) throw TypeError("Cannot read private member from an object whose class did not declare it");
        return "m" === r10 ? n10 : "a" === r10 ? n10.call(e10) : n10 ? n10.value : t10.get(e10);
      };
      function e$(e10) {
        let t10 = e10 ? "__Secure-" : "";
        return { sessionToken: { name: `${t10}authjs.session-token`, options: { httpOnly: true, sameSite: "lax", path: "/", secure: e10 } }, callbackUrl: { name: `${t10}authjs.callback-url`, options: { httpOnly: true, sameSite: "lax", path: "/", secure: e10 } }, csrfToken: { name: `${e10 ? "__Host-" : ""}authjs.csrf-token`, options: { httpOnly: true, sameSite: "lax", path: "/", secure: e10 } }, pkceCodeVerifier: { name: `${t10}authjs.pkce.code_verifier`, options: { httpOnly: true, sameSite: "lax", path: "/", secure: e10, maxAge: 900 } }, state: { name: `${t10}authjs.state`, options: { httpOnly: true, sameSite: "lax", path: "/", secure: e10, maxAge: 900 } }, nonce: { name: `${t10}authjs.nonce`, options: { httpOnly: true, sameSite: "lax", path: "/", secure: e10 } }, webauthnChallenge: { name: `${t10}authjs.challenge`, options: { httpOnly: true, sameSite: "lax", path: "/", secure: e10, maxAge: 900 } } };
      }
      class eM {
        constructor(e10, t10, r10) {
          if (nG.add(this), nX.set(this, {}), nY.set(this, void 0), nZ.set(this, void 0), eN(this, nZ, r10, "f"), eN(this, nY, e10, "f"), !t10) return;
          let { name: n10 } = e10;
          for (let [e11, r11] of Object.entries(t10)) e11.startsWith(n10) && r11 && (eL(this, nX, "f")[e11] = r11);
        }
        get value() {
          return Object.keys(eL(this, nX, "f")).sort((e10, t10) => parseInt(e10.split(".").pop() || "0") - parseInt(t10.split(".").pop() || "0")).map((e10) => eL(this, nX, "f")[e10]).join("");
        }
        chunk(e10, t10) {
          let r10 = eL(this, nG, "m", n0).call(this);
          for (let n10 of eL(this, nG, "m", nQ).call(this, { name: eL(this, nY, "f").name, value: e10, options: { ...eL(this, nY, "f").options, ...t10 } })) r10[n10.name] = n10;
          return Object.values(r10);
        }
        clean() {
          return Object.values(eL(this, nG, "m", n0).call(this));
        }
      }
      nX = /* @__PURE__ */ new WeakMap(), nY = /* @__PURE__ */ new WeakMap(), nZ = /* @__PURE__ */ new WeakMap(), nG = /* @__PURE__ */ new WeakSet(), nQ = function(e10) {
        let t10 = Math.ceil(e10.value.length / 3936);
        if (1 === t10) return eL(this, nX, "f")[e10.name] = e10.value, [e10];
        let r10 = [];
        for (let n10 = 0; n10 < t10; n10++) {
          let t11 = `${e10.name}.${n10}`, i10 = e10.value.substr(3936 * n10, 3936);
          r10.push({ ...e10, name: t11, value: i10 }), eL(this, nX, "f")[t11] = i10;
        }
        return eL(this, nZ, "f").debug("CHUNKING_SESSION_COOKIE", { message: "Session cookie exceeds allowed 4096 bytes.", emptyCookieSize: 160, valueSize: e10.value.length, chunks: r10.map((e11) => e11.value.length + 160) }), r10;
      }, n0 = function() {
        let e10 = {};
        for (let t10 in eL(this, nX, "f")) delete eL(this, nX, "f")?.[t10], e10[t10] = { name: t10, value: "", options: { ...eL(this, nY, "f").options, maxAge: 0 } };
        return e10;
      };
      class ej extends Error {
        constructor(e10, t10) {
          e10 instanceof Error ? super(void 0, { cause: { err: e10, ...e10.cause, ...t10 } }) : "string" == typeof e10 ? (t10 instanceof Error && (t10 = { err: t10, ...t10.cause }), super(e10, t10)) : super(void 0, e10), this.name = this.constructor.name, this.type = this.constructor.type ?? "AuthError", this.kind = this.constructor.kind ?? "error", Error.captureStackTrace?.(this, this.constructor);
          let r10 = `https://errors.authjs.dev#${this.type.toLowerCase()}`;
          this.message += `${this.message ? ". " : ""}Read more at ${r10}`;
        }
      }
      class eD extends ej {
      }
      eD.kind = "signIn";
      class eH extends ej {
      }
      eH.type = "AdapterError";
      class eW extends ej {
      }
      eW.type = "AccessDenied";
      class eK extends ej {
      }
      eK.type = "CallbackRouteError";
      class eB extends ej {
      }
      eB.type = "ErrorPageLoop";
      class eJ extends ej {
      }
      eJ.type = "EventError";
      class eV extends ej {
      }
      eV.type = "InvalidCallbackUrl";
      class eq extends eD {
        constructor() {
          super(...arguments), this.code = "credentials";
        }
      }
      eq.type = "CredentialsSignin";
      class ez extends ej {
      }
      ez.type = "InvalidEndpoints";
      class eF extends ej {
      }
      eF.type = "InvalidCheck";
      class eG extends ej {
      }
      eG.type = "JWTSessionError";
      class eX extends ej {
      }
      eX.type = "MissingAdapter";
      class eY extends ej {
      }
      eY.type = "MissingAdapterMethods";
      class eZ extends ej {
      }
      eZ.type = "MissingAuthorize";
      class eQ extends ej {
      }
      eQ.type = "MissingSecret";
      class e0 extends eD {
      }
      e0.type = "OAuthAccountNotLinked";
      class e1 extends eD {
      }
      e1.type = "OAuthCallbackError";
      class e2 extends ej {
      }
      e2.type = "OAuthProfileParseError";
      class e5 extends ej {
      }
      e5.type = "SessionTokenError";
      class e3 extends eD {
      }
      e3.type = "OAuthSignInError";
      class e6 extends eD {
      }
      e6.type = "EmailSignInError";
      class e4 extends ej {
      }
      e4.type = "SignOutError";
      class e8 extends ej {
      }
      e8.type = "UnknownAction";
      class e9 extends ej {
      }
      e9.type = "UnsupportedStrategy";
      class e7 extends ej {
      }
      e7.type = "InvalidProvider";
      class te extends ej {
      }
      te.type = "UntrustedHost";
      class tt extends ej {
      }
      tt.type = "Verification";
      class tr extends eD {
      }
      tr.type = "MissingCSRF";
      let tn = /* @__PURE__ */ new Set(["CredentialsSignin", "OAuthAccountNotLinked", "OAuthCallbackError", "AccessDenied", "Verification", "MissingCSRF", "AccountNotLinked", "WebAuthnVerificationError"]);
      class ti extends ej {
      }
      ti.type = "DuplicateConditionalUI";
      class ta extends ej {
      }
      ta.type = "MissingWebAuthnAutocomplete";
      class to extends ej {
      }
      to.type = "WebAuthnVerificationError";
      class ts extends eD {
      }
      ts.type = "AccountNotLinked";
      class tc extends ej {
      }
      tc.type = "ExperimentalFeatureNotEnabled";
      let tl = false;
      function tu(e10, t10) {
        try {
          return /^https?:/.test(new URL(e10, e10.startsWith("/") ? t10 : void 0).protocol);
        } catch {
          return false;
        }
      }
      let td = false, tp = false, th = false, tf = ["createVerificationToken", "useVerificationToken", "getUserByEmail"], tg = ["createUser", "getUser", "getUserByEmail", "getUserByAccount", "updateUser", "linkAccount", "createSession", "getSessionAndUser", "updateSession", "deleteSession"], tm = ["createUser", "getUser", "linkAccount", "getAccount", "getAuthenticator", "createAuthenticator", "listAuthenticatorsByUserId", "updateAuthenticatorCounter"], ty = () => {
        if ("undefined" != typeof globalThis) return globalThis;
        if ("undefined" != typeof self) return self;
        if ("undefined" != typeof window) return window;
        throw Error("unable to locate global object");
      }, tw = async (e10, t10, r10, n10, i10) => {
        let { crypto: { subtle: a10 } } = ty();
        return new Uint8Array(await a10.deriveBits({ name: "HKDF", hash: `SHA-${e10.substr(3)}`, salt: r10, info: n10 }, await a10.importKey("raw", t10, "HKDF", false, ["deriveBits"]), i10 << 3));
      };
      function tb(e10, t10) {
        if ("string" == typeof e10) return new TextEncoder().encode(e10);
        if (!(e10 instanceof Uint8Array)) throw TypeError(`"${t10}"" must be an instance of Uint8Array or a string`);
        return e10;
      }
      async function tv(e10, t10, r10, n10, i10) {
        return tw(function(e11) {
          switch (e11) {
            case "sha256":
            case "sha384":
            case "sha512":
            case "sha1":
              return e11;
            default:
              throw TypeError('unsupported "digest" value');
          }
        }(e10), function(e11) {
          let t11 = tb(e11, "ikm");
          if (!t11.byteLength) throw TypeError('"ikm" must be at least one byte in length');
          return t11;
        }(t10), tb(r10, "salt"), function(e11) {
          let t11 = tb(e11, "info");
          if (t11.byteLength > 1024) throw TypeError('"info" must not contain more than 1024 bytes');
          return t11;
        }(n10), function(e11, t11) {
          if ("number" != typeof e11 || !Number.isInteger(e11) || e11 < 1) throw TypeError('"keylen" must be a positive integer');
          if (e11 > 255 * (parseInt(t11.substr(3), 10) >> 3 || 20)) throw TypeError('"keylen" too large');
          return e11;
        }(i10, e10));
      }
      async function t_(e10, t10) {
        let r10 = `SHA-${e10.slice(-3)}`;
        return new Uint8Array(await crypto.subtle.digest(r10, t10));
      }
      let tS = new TextEncoder(), tk = new TextDecoder();
      function tE(...e10) {
        let t10 = new Uint8Array(e10.reduce((e11, { length: t11 }) => e11 + t11, 0)), r10 = 0;
        for (let n10 of e10) t10.set(n10, r10), r10 += n10.length;
        return t10;
      }
      function tx(e10, t10, r10) {
        if (t10 < 0 || t10 >= 4294967296) throw RangeError(`value must be >= 0 and <= ${4294967296 - 1}. Received ${t10}`);
        e10.set([t10 >>> 24, t10 >>> 16, t10 >>> 8, 255 & t10], r10);
      }
      function tA(e10) {
        let t10 = new Uint8Array(8);
        return tx(t10, Math.floor(e10 / 4294967296), 0), tx(t10, e10 % 4294967296, 4), t10;
      }
      function tT(e10) {
        let t10 = new Uint8Array(4);
        return tx(t10, e10), t10;
      }
      function tP(e10) {
        let t10 = new Uint8Array(e10.length);
        for (let r10 = 0; r10 < e10.length; r10++) {
          let n10 = e10.charCodeAt(r10);
          if (n10 > 127) throw TypeError("non-ASCII string encountered in encode()");
          t10[r10] = n10;
        }
        return t10;
      }
      function tC(e10) {
        if (Uint8Array.fromBase64) return Uint8Array.fromBase64("string" == typeof e10 ? e10 : tk.decode(e10), { alphabet: "base64url" });
        let t10 = e10;
        t10 instanceof Uint8Array && (t10 = tk.decode(t10)), t10 = t10.replace(/-/g, "+").replace(/_/g, "/");
        try {
          return function(e11) {
            if (Uint8Array.fromBase64) return Uint8Array.fromBase64(e11);
            let t11 = atob(e11), r10 = new Uint8Array(t11.length);
            for (let e12 = 0; e12 < t11.length; e12++) r10[e12] = t11.charCodeAt(e12);
            return r10;
          }(t10);
        } catch {
          throw TypeError("The input to be decoded is not correctly encoded.");
        }
      }
      function tR(e10) {
        let t10 = e10;
        return ("string" == typeof t10 && (t10 = tS.encode(t10)), Uint8Array.prototype.toBase64) ? t10.toBase64({ alphabet: "base64url", omitPadding: true }) : function(e11) {
          if (Uint8Array.prototype.toBase64) return e11.toBase64();
          let t11 = [];
          for (let r10 = 0; r10 < e11.length; r10 += 32768) t11.push(String.fromCharCode.apply(null, e11.subarray(r10, r10 + 32768)));
          return btoa(t11.join(""));
        }(t10).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
      }
      class tO extends Error {
        static code = "ERR_JOSE_GENERIC";
        code = "ERR_JOSE_GENERIC";
        constructor(e10, t10) {
          super(e10, t10), this.name = this.constructor.name, Error.captureStackTrace?.(this, this.constructor);
        }
      }
      class tI extends tO {
        static code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
        code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
        claim;
        reason;
        payload;
        constructor(e10, t10, r10 = "unspecified", n10 = "unspecified") {
          super(e10, { cause: { claim: r10, reason: n10, payload: t10 } }), this.claim = r10, this.reason = n10, this.payload = t10;
        }
      }
      class tU extends tO {
        static code = "ERR_JWT_EXPIRED";
        code = "ERR_JWT_EXPIRED";
        claim;
        reason;
        payload;
        constructor(e10, t10, r10 = "unspecified", n10 = "unspecified") {
          super(e10, { cause: { claim: r10, reason: n10, payload: t10 } }), this.claim = r10, this.reason = n10, this.payload = t10;
        }
      }
      class tN extends tO {
        static code = "ERR_JOSE_ALG_NOT_ALLOWED";
        code = "ERR_JOSE_ALG_NOT_ALLOWED";
      }
      class tL extends tO {
        static code = "ERR_JOSE_NOT_SUPPORTED";
        code = "ERR_JOSE_NOT_SUPPORTED";
      }
      class t$ extends tO {
        static code = "ERR_JWE_DECRYPTION_FAILED";
        code = "ERR_JWE_DECRYPTION_FAILED";
        constructor(e10 = "decryption operation failed", t10) {
          super(e10, t10);
        }
      }
      class tM extends tO {
        static code = "ERR_JWE_INVALID";
        code = "ERR_JWE_INVALID";
      }
      class tj extends tO {
        static code = "ERR_JWT_INVALID";
        code = "ERR_JWT_INVALID";
      }
      class tD extends tO {
        static code = "ERR_JWK_INVALID";
        code = "ERR_JWK_INVALID";
      }
      class tH extends tO {
        [Symbol.asyncIterator];
        static code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
        code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
        constructor(e10 = "multiple matching keys found in the JSON Web Key Set", t10) {
          super(e10, t10);
        }
      }
      function tW(e10) {
        if (!tK(e10)) throw Error("CryptoKey instance expected");
      }
      let tK = (e10) => {
        if (e10?.[Symbol.toStringTag] === "CryptoKey") return true;
        try {
          return e10 instanceof CryptoKey;
        } catch {
          return false;
        }
      }, tB = (e10) => e10?.[Symbol.toStringTag] === "KeyObject", tJ = (e10) => tK(e10) || tB(e10), tV = (e10) => "object" == typeof e10 && null !== e10;
      function tq(e10) {
        if (!tV(e10) || "[object Object]" !== Object.prototype.toString.call(e10)) return false;
        if (null === Object.getPrototypeOf(e10)) return true;
        let t10 = e10;
        for (; null !== Object.getPrototypeOf(t10); ) t10 = Object.getPrototypeOf(t10);
        return Object.getPrototypeOf(e10) === t10;
      }
      let tz = (e10) => tq(e10) && "string" == typeof e10.kty, tF = (e10) => "oct" !== e10.kty && ("AKP" === e10.kty && "string" == typeof e10.priv || "string" == typeof e10.d), tG = (e10) => "oct" !== e10.kty && void 0 === e10.d && void 0 === e10.priv, tX = (e10) => "oct" === e10.kty && "string" == typeof e10.k;
      function tY(e10, t10, ...r10) {
        if ((r10 = r10.filter(Boolean)).length > 2) {
          let t11 = r10.pop();
          e10 += `one of type ${r10.join(", ")}, or ${t11}.`;
        } else 2 === r10.length ? e10 += `one of type ${r10[0]} or ${r10[1]}.` : e10 += `of type ${r10[0]}.`;
        return null == t10 ? e10 += ` Received ${t10}` : "function" == typeof t10 && t10.name ? e10 += ` Received function ${t10.name}` : "object" == typeof t10 && null != t10 && t10.constructor?.name && (e10 += ` Received an instance of ${t10.constructor.name}`), e10;
      }
      let tZ = (e10, ...t10) => tY("Key must be ", e10, ...t10), tQ = (e10, t10, ...r10) => tY(`Key for the ${e10} algorithm must be `, t10, ...r10);
      async function t0(e10) {
        if (tB(e10)) {
          if ("secret" !== e10.type) return e10.export({ format: "jwk" });
          e10 = e10.export();
        }
        if (e10 instanceof Uint8Array) return { kty: "oct", k: tR(e10) };
        if (!tK(e10)) throw TypeError(tZ(e10, "CryptoKey", "KeyObject", "Uint8Array"));
        if (!e10.extractable) throw TypeError("non-extractable CryptoKey cannot be exported as a JWK");
        let { ext: t10, key_ops: r10, alg: n10, use: i10, ...a10 } = await crypto.subtle.exportKey("jwk", e10);
        return "AKP" === a10.kty && (a10.alg = n10), a10;
      }
      async function t1(e10) {
        return t0(e10);
      }
      let t2 = (e10, t10) => {
        if ("string" != typeof e10 || !e10) throw new tD(`${t10} missing or invalid`);
      };
      async function t5(e10, t10) {
        let r10, n10;
        if (tz(e10)) r10 = e10;
        else if (tJ(e10)) r10 = await t1(e10);
        else throw TypeError(tZ(e10, "CryptoKey", "KeyObject", "JSON Web Key"));
        if ("sha256" !== (t10 ??= "sha256") && "sha384" !== t10 && "sha512" !== t10) throw TypeError('digestAlgorithm must one of "sha256", "sha384", or "sha512"');
        switch (r10.kty) {
          case "AKP":
            t2(r10.alg, '"alg" (Algorithm) Parameter'), t2(r10.pub, '"pub" (Public key) Parameter'), n10 = { alg: r10.alg, kty: r10.kty, pub: r10.pub };
            break;
          case "EC":
            t2(r10.crv, '"crv" (Curve) Parameter'), t2(r10.x, '"x" (X Coordinate) Parameter'), t2(r10.y, '"y" (Y Coordinate) Parameter'), n10 = { crv: r10.crv, kty: r10.kty, x: r10.x, y: r10.y };
            break;
          case "OKP":
            t2(r10.crv, '"crv" (Subtype of Key Pair) Parameter'), t2(r10.x, '"x" (Public Key) Parameter'), n10 = { crv: r10.crv, kty: r10.kty, x: r10.x };
            break;
          case "RSA":
            t2(r10.e, '"e" (Exponent) Parameter'), t2(r10.n, '"n" (Modulus) Parameter'), n10 = { e: r10.e, kty: r10.kty, n: r10.n };
            break;
          case "oct":
            t2(r10.k, '"k" (Key Value) Parameter'), n10 = { k: r10.k, kty: r10.kty };
            break;
          default:
            throw new tL('"kty" (Key Type) Parameter missing or unsupported');
        }
        let i10 = tP(JSON.stringify(n10));
        return tR(await t_(t10, i10));
      }
      let t3 = Symbol();
      function t6(e10) {
        switch (e10) {
          case "A128GCM":
          case "A128GCMKW":
          case "A192GCM":
          case "A192GCMKW":
          case "A256GCM":
          case "A256GCMKW":
            return 96;
          case "A128CBC-HS256":
          case "A192CBC-HS384":
          case "A256CBC-HS512":
            return 128;
          default:
            throw new tL(`Unsupported JWE Algorithm: ${e10}`);
        }
      }
      let t4 = (e10) => crypto.getRandomValues(new Uint8Array(t6(e10) >> 3));
      function t8(e10, t10) {
        if (t10.length << 3 !== t6(e10)) throw new tM("Invalid Initialization Vector length");
      }
      function t9(e10, t10) {
        let r10 = e10.byteLength << 3;
        if (r10 !== t10) throw new tM(`Invalid Content Encryption Key length. Expected ${t10} bits, got ${r10} bits`);
      }
      let t7 = (e10, t10 = "algorithm.name") => TypeError(`CryptoKey does not support this operation, its ${t10} must be ${e10}`), re = (e10, t10) => e10.name === t10;
      function rt(e10, t10, r10) {
        switch (t10) {
          case "A128GCM":
          case "A192GCM":
          case "A256GCM": {
            if (!re(e10.algorithm, "AES-GCM")) throw t7("AES-GCM");
            let r11 = parseInt(t10.slice(1, 4), 10);
            if (e10.algorithm.length !== r11) throw t7(r11, "algorithm.length");
            break;
          }
          case "A128KW":
          case "A192KW":
          case "A256KW": {
            if (!re(e10.algorithm, "AES-KW")) throw t7("AES-KW");
            let r11 = parseInt(t10.slice(1, 4), 10);
            if (e10.algorithm.length !== r11) throw t7(r11, "algorithm.length");
            break;
          }
          case "ECDH":
            switch (e10.algorithm.name) {
              case "ECDH":
              case "X25519":
                break;
              default:
                throw t7("ECDH or X25519");
            }
            break;
          case "PBES2-HS256+A128KW":
          case "PBES2-HS384+A192KW":
          case "PBES2-HS512+A256KW":
            if (!re(e10.algorithm, "PBKDF2")) throw t7("PBKDF2");
            break;
          case "RSA-OAEP":
          case "RSA-OAEP-256":
          case "RSA-OAEP-384":
          case "RSA-OAEP-512": {
            if (!re(e10.algorithm, "RSA-OAEP")) throw t7("RSA-OAEP");
            let r11 = parseInt(t10.slice(9), 10) || 1;
            if (parseInt(e10.algorithm.hash.name.slice(4), 10) !== r11) throw t7(`SHA-${r11}`, "algorithm.hash");
            break;
          }
          default:
            throw TypeError("CryptoKey does not support this operation");
        }
        !function(e11, t11) {
          if (t11 && !e11.usages.includes(t11)) throw TypeError(`CryptoKey does not support this operation, its usages must include ${t11}.`);
        }(e10, r10);
      }
      async function rr(e10, t10, r10, n10, i10) {
        if (!(r10 instanceof Uint8Array)) throw TypeError(tZ(r10, "Uint8Array"));
        let a10 = parseInt(e10.slice(1, 4), 10), o10 = await crypto.subtle.importKey("raw", r10.subarray(a10 >> 3), "AES-CBC", false, ["encrypt"]), s2 = await crypto.subtle.importKey("raw", r10.subarray(0, a10 >> 3), { hash: `SHA-${a10 << 1}`, name: "HMAC" }, false, ["sign"]), c2 = new Uint8Array(await crypto.subtle.encrypt({ iv: n10, name: "AES-CBC" }, o10, t10)), l2 = tE(i10, n10, c2, tA(i10.length << 3));
        return { ciphertext: c2, tag: new Uint8Array((await crypto.subtle.sign("HMAC", s2, l2)).slice(0, a10 >> 3)), iv: n10 };
      }
      async function rn(e10, t10, r10, n10, i10) {
        let a10;
        r10 instanceof Uint8Array ? a10 = await crypto.subtle.importKey("raw", r10, "AES-GCM", false, ["encrypt"]) : (rt(r10, e10, "encrypt"), a10 = r10);
        let o10 = new Uint8Array(await crypto.subtle.encrypt({ additionalData: i10, iv: n10, name: "AES-GCM", tagLength: 128 }, a10, t10)), s2 = o10.slice(-16);
        return { ciphertext: o10.slice(0, -16), tag: s2, iv: n10 };
      }
      async function ri(e10, t10, r10, n10, i10) {
        if (!tK(r10) && !(r10 instanceof Uint8Array)) throw TypeError(tZ(r10, "CryptoKey", "KeyObject", "Uint8Array", "JSON Web Key"));
        switch (n10 ? t8(e10, n10) : n10 = t4(e10), e10) {
          case "A128CBC-HS256":
          case "A192CBC-HS384":
          case "A256CBC-HS512":
            return r10 instanceof Uint8Array && t9(r10, parseInt(e10.slice(-3), 10)), rr(e10, t10, r10, n10, i10);
          case "A128GCM":
          case "A192GCM":
          case "A256GCM":
            return r10 instanceof Uint8Array && t9(r10, parseInt(e10.slice(1, 4), 10)), rn(e10, t10, r10, n10, i10);
          default:
            throw new tL("Unsupported JWE Content Encryption Algorithm");
        }
      }
      function ra(e10, t10) {
        if (e10.algorithm.length !== parseInt(t10.slice(1, 4), 10)) throw TypeError(`Invalid key size for alg: ${t10}`);
      }
      function ro(e10, t10, r10) {
        return e10 instanceof Uint8Array ? crypto.subtle.importKey("raw", e10, "AES-KW", true, [r10]) : (rt(e10, t10, r10), e10);
      }
      async function rs(e10, t10, r10) {
        let n10 = await ro(t10, e10, "wrapKey");
        ra(n10, e10);
        let i10 = await crypto.subtle.importKey("raw", r10, { hash: "SHA-256", name: "HMAC" }, true, ["sign"]);
        return new Uint8Array(await crypto.subtle.wrapKey("raw", i10, n10, "AES-KW"));
      }
      async function rc(e10, t10, r10) {
        let n10 = await ro(t10, e10, "unwrapKey");
        ra(n10, e10);
        let i10 = await crypto.subtle.unwrapKey("raw", r10, n10, "AES-KW", { hash: "SHA-256", name: "HMAC" }, true, ["sign"]);
        return new Uint8Array(await crypto.subtle.exportKey("raw", i10));
      }
      function rl(e10) {
        return tE(tT(e10.length), e10);
      }
      async function ru(e10, t10, r10) {
        let n10 = t10 >> 3, i10 = Math.ceil(n10 / 32), a10 = new Uint8Array(32 * i10);
        for (let t11 = 1; t11 <= i10; t11++) {
          let n11 = new Uint8Array(4 + e10.length + r10.length);
          n11.set(tT(t11), 0), n11.set(e10, 4), n11.set(r10, 4 + e10.length);
          let i11 = await t_("sha256", n11);
          a10.set(i11, (t11 - 1) * 32);
        }
        return a10.slice(0, n10);
      }
      async function rd(e10, t10, r10, n10, i10 = new Uint8Array(), a10 = new Uint8Array()) {
        rt(e10, "ECDH"), rt(t10, "ECDH", "deriveBits");
        let o10 = rl(tP(r10)), s2 = rl(i10), c2 = tE(o10, s2, rl(a10), tT(n10), new Uint8Array());
        return ru(new Uint8Array(await crypto.subtle.deriveBits({ name: e10.algorithm.name, public: e10 }, t10, "X25519" === e10.algorithm.name ? 256 : Math.ceil(parseInt(e10.algorithm.namedCurve.slice(-3), 10) / 8) << 3)), n10, c2);
      }
      function rp(e10) {
        switch (e10.algorithm.namedCurve) {
          case "P-256":
          case "P-384":
          case "P-521":
            return true;
          default:
            return "X25519" === e10.algorithm.name;
        }
      }
      let rh = (e10, t10) => tE(tP(e10), Uint8Array.of(0), t10);
      async function rf(e10, t10, r10, n10) {
        if (!(e10 instanceof Uint8Array) || e10.length < 8) throw new tM("PBES2 Salt Input must be 8 or more octets");
        let i10 = rh(t10, e10), a10 = parseInt(t10.slice(13, 16), 10), o10 = { hash: `SHA-${t10.slice(8, 11)}`, iterations: r10, name: "PBKDF2", salt: i10 }, s2 = await (n10 instanceof Uint8Array ? crypto.subtle.importKey("raw", n10, "PBKDF2", false, ["deriveBits"]) : (rt(n10, t10, "deriveBits"), n10));
        return new Uint8Array(await crypto.subtle.deriveBits(o10, s2, a10));
      }
      async function rg(e10, t10, r10, n10 = 2048, i10 = crypto.getRandomValues(new Uint8Array(16))) {
        let a10 = await rf(i10, e10, n10, t10);
        return { encryptedKey: await rs(e10.slice(-6), a10, r10), p2c: n10, p2s: tR(i10) };
      }
      async function rm(e10, t10, r10, n10, i10) {
        let a10 = await rf(i10, e10, n10, t10);
        return rc(e10.slice(-6), a10, r10);
      }
      function ry(e10, t10) {
        if (e10.startsWith("RS") || e10.startsWith("PS")) {
          let { modulusLength: r10 } = t10.algorithm;
          if ("number" != typeof r10 || r10 < 2048) throw TypeError(`${e10} requires key modulusLength to be 2048 bits or larger`);
        }
      }
      let rw = (e10) => {
        switch (e10) {
          case "RSA-OAEP":
          case "RSA-OAEP-256":
          case "RSA-OAEP-384":
          case "RSA-OAEP-512":
            return "RSA-OAEP";
          default:
            throw new tL(`alg ${e10} is not supported either by JOSE or your javascript runtime`);
        }
      };
      async function rb(e10, t10, r10) {
        return rt(t10, e10, "encrypt"), ry(e10, t10), new Uint8Array(await crypto.subtle.encrypt(rw(e10), t10, r10));
      }
      async function rv(e10, t10, r10) {
        return rt(t10, e10, "decrypt"), ry(e10, t10), new Uint8Array(await crypto.subtle.decrypt(rw(e10), t10, r10));
      }
      async function r_(e10) {
        if (!e10.alg) throw TypeError('"alg" argument is required when "jwk.alg" is not present');
        let { algorithm: t10, keyUsages: r10 } = function(e11) {
          let t11, r11;
          switch (e11.kty) {
            case "AKP":
              switch (e11.alg) {
                case "ML-DSA-44":
                case "ML-DSA-65":
                case "ML-DSA-87":
                  t11 = { name: e11.alg }, r11 = e11.priv ? ["sign"] : ["verify"];
                  break;
                default:
                  throw new tL('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
              }
              break;
            case "RSA":
              switch (e11.alg) {
                case "PS256":
                case "PS384":
                case "PS512":
                  t11 = { name: "RSA-PSS", hash: `SHA-${e11.alg.slice(-3)}` }, r11 = e11.d ? ["sign"] : ["verify"];
                  break;
                case "RS256":
                case "RS384":
                case "RS512":
                  t11 = { name: "RSASSA-PKCS1-v1_5", hash: `SHA-${e11.alg.slice(-3)}` }, r11 = e11.d ? ["sign"] : ["verify"];
                  break;
                case "RSA-OAEP":
                case "RSA-OAEP-256":
                case "RSA-OAEP-384":
                case "RSA-OAEP-512":
                  t11 = { name: "RSA-OAEP", hash: `SHA-${parseInt(e11.alg.slice(-3), 10) || 1}` }, r11 = e11.d ? ["decrypt", "unwrapKey"] : ["encrypt", "wrapKey"];
                  break;
                default:
                  throw new tL('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
              }
              break;
            case "EC":
              switch (e11.alg) {
                case "ES256":
                  t11 = { name: "ECDSA", namedCurve: "P-256" }, r11 = e11.d ? ["sign"] : ["verify"];
                  break;
                case "ES384":
                  t11 = { name: "ECDSA", namedCurve: "P-384" }, r11 = e11.d ? ["sign"] : ["verify"];
                  break;
                case "ES512":
                  t11 = { name: "ECDSA", namedCurve: "P-521" }, r11 = e11.d ? ["sign"] : ["verify"];
                  break;
                case "ECDH-ES":
                case "ECDH-ES+A128KW":
                case "ECDH-ES+A192KW":
                case "ECDH-ES+A256KW":
                  t11 = { name: "ECDH", namedCurve: e11.crv }, r11 = e11.d ? ["deriveBits"] : [];
                  break;
                default:
                  throw new tL('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
              }
              break;
            case "OKP":
              switch (e11.alg) {
                case "Ed25519":
                case "EdDSA":
                  t11 = { name: "Ed25519" }, r11 = e11.d ? ["sign"] : ["verify"];
                  break;
                case "ECDH-ES":
                case "ECDH-ES+A128KW":
                case "ECDH-ES+A192KW":
                case "ECDH-ES+A256KW":
                  t11 = { name: e11.crv }, r11 = e11.d ? ["deriveBits"] : [];
                  break;
                default:
                  throw new tL('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
              }
              break;
            default:
              throw new tL('Invalid or unsupported JWK "kty" (Key Type) Parameter value');
          }
          return { algorithm: t11, keyUsages: r11 };
        }(e10), n10 = { ...e10 };
        return "AKP" !== n10.kty && delete n10.alg, delete n10.use, crypto.subtle.importKey("jwk", n10, t10, e10.ext ?? (!e10.d && !e10.priv), e10.key_ops ?? r10);
      }
      let rS = async (e10, t10, r10, n10 = false) => {
        let a10 = (i ||= /* @__PURE__ */ new WeakMap()).get(e10);
        if (a10?.[r10]) return a10[r10];
        let o10 = await r_({ ...t10, alg: r10 });
        return n10 && Object.freeze(e10), a10 ? a10[r10] = o10 : i.set(e10, { [r10]: o10 }), o10;
      }, rk = (e10, t10) => {
        let r10;
        let n10 = (i ||= /* @__PURE__ */ new WeakMap()).get(e10);
        if (n10?.[t10]) return n10[t10];
        let a10 = "public" === e10.type, o10 = !!a10;
        if ("x25519" === e10.asymmetricKeyType) {
          switch (t10) {
            case "ECDH-ES":
            case "ECDH-ES+A128KW":
            case "ECDH-ES+A192KW":
            case "ECDH-ES+A256KW":
              break;
            default:
              throw TypeError("given KeyObject instance cannot be used for this algorithm");
          }
          r10 = e10.toCryptoKey(e10.asymmetricKeyType, o10, a10 ? [] : ["deriveBits"]);
        }
        if ("ed25519" === e10.asymmetricKeyType) {
          if ("EdDSA" !== t10 && "Ed25519" !== t10) throw TypeError("given KeyObject instance cannot be used for this algorithm");
          r10 = e10.toCryptoKey(e10.asymmetricKeyType, o10, [a10 ? "verify" : "sign"]);
        }
        switch (e10.asymmetricKeyType) {
          case "ml-dsa-44":
          case "ml-dsa-65":
          case "ml-dsa-87":
            if (t10 !== e10.asymmetricKeyType.toUpperCase()) throw TypeError("given KeyObject instance cannot be used for this algorithm");
            r10 = e10.toCryptoKey(e10.asymmetricKeyType, o10, [a10 ? "verify" : "sign"]);
        }
        if ("rsa" === e10.asymmetricKeyType) {
          let n11;
          switch (t10) {
            case "RSA-OAEP":
              n11 = "SHA-1";
              break;
            case "RS256":
            case "PS256":
            case "RSA-OAEP-256":
              n11 = "SHA-256";
              break;
            case "RS384":
            case "PS384":
            case "RSA-OAEP-384":
              n11 = "SHA-384";
              break;
            case "RS512":
            case "PS512":
            case "RSA-OAEP-512":
              n11 = "SHA-512";
              break;
            default:
              throw TypeError("given KeyObject instance cannot be used for this algorithm");
          }
          if (t10.startsWith("RSA-OAEP")) return e10.toCryptoKey({ name: "RSA-OAEP", hash: n11 }, o10, a10 ? ["encrypt"] : ["decrypt"]);
          r10 = e10.toCryptoKey({ name: t10.startsWith("PS") ? "RSA-PSS" : "RSASSA-PKCS1-v1_5", hash: n11 }, o10, [a10 ? "verify" : "sign"]);
        }
        if ("ec" === e10.asymmetricKeyType) {
          let n11 = (/* @__PURE__ */ new Map([["prime256v1", "P-256"], ["secp384r1", "P-384"], ["secp521r1", "P-521"]])).get(e10.asymmetricKeyDetails?.namedCurve);
          if (!n11) throw TypeError("given KeyObject instance cannot be used for this algorithm");
          "ES256" === t10 && "P-256" === n11 && (r10 = e10.toCryptoKey({ name: "ECDSA", namedCurve: n11 }, o10, [a10 ? "verify" : "sign"])), "ES384" === t10 && "P-384" === n11 && (r10 = e10.toCryptoKey({ name: "ECDSA", namedCurve: n11 }, o10, [a10 ? "verify" : "sign"])), "ES512" === t10 && "P-521" === n11 && (r10 = e10.toCryptoKey({ name: "ECDSA", namedCurve: n11 }, o10, [a10 ? "verify" : "sign"])), t10.startsWith("ECDH-ES") && (r10 = e10.toCryptoKey({ name: "ECDH", namedCurve: n11 }, o10, a10 ? [] : ["deriveBits"]));
        }
        if (!r10) throw TypeError("given KeyObject instance cannot be used for this algorithm");
        return n10 ? n10[t10] = r10 : i.set(e10, { [t10]: r10 }), r10;
      };
      async function rE(e10, t10) {
        if (e10 instanceof Uint8Array || tK(e10)) return e10;
        if (tB(e10)) {
          if ("secret" === e10.type) return e10.export();
          if ("toCryptoKey" in e10 && "function" == typeof e10.toCryptoKey) try {
            return rk(e10, t10);
          } catch (e11) {
            if (e11 instanceof TypeError) throw e11;
          }
          let r10 = e10.export({ format: "jwk" });
          return rS(e10, r10, t10);
        }
        if (tz(e10)) return e10.k ? tC(e10.k) : rS(e10, e10, t10, true);
        throw Error("unreachable");
      }
      function rx(e10) {
        switch (e10) {
          case "A128GCM":
            return 128;
          case "A192GCM":
            return 192;
          case "A256GCM":
          case "A128CBC-HS256":
            return 256;
          case "A192CBC-HS384":
            return 384;
          case "A256CBC-HS512":
            return 512;
          default:
            throw new tL(`Unsupported JWE Algorithm: ${e10}`);
        }
      }
      let rA = (e10) => crypto.getRandomValues(new Uint8Array(rx(e10) >> 3));
      async function rT(e10, t10) {
        if (!(e10 instanceof Uint8Array)) throw TypeError("First argument must be a buffer");
        if (!(t10 instanceof Uint8Array)) throw TypeError("Second argument must be a buffer");
        let r10 = { name: "HMAC", hash: "SHA-256" }, n10 = await crypto.subtle.generateKey(r10, false, ["sign"]), i10 = new Uint8Array(await crypto.subtle.sign(r10, n10, e10)), a10 = new Uint8Array(await crypto.subtle.sign(r10, n10, t10)), o10 = 0, s2 = -1;
        for (; ++s2 < 32; ) o10 |= i10[s2] ^ a10[s2];
        return 0 === o10;
      }
      async function rP(e10, t10, r10, n10, i10, a10) {
        let o10, s2;
        if (!(t10 instanceof Uint8Array)) throw TypeError(tZ(t10, "Uint8Array"));
        let c2 = parseInt(e10.slice(1, 4), 10), l2 = await crypto.subtle.importKey("raw", t10.subarray(c2 >> 3), "AES-CBC", false, ["decrypt"]), u2 = await crypto.subtle.importKey("raw", t10.subarray(0, c2 >> 3), { hash: `SHA-${c2 << 1}`, name: "HMAC" }, false, ["sign"]), d2 = tE(a10, n10, r10, tA(a10.length << 3)), p2 = new Uint8Array((await crypto.subtle.sign("HMAC", u2, d2)).slice(0, c2 >> 3));
        try {
          o10 = await rT(i10, p2);
        } catch {
        }
        if (!o10) throw new t$();
        try {
          s2 = new Uint8Array(await crypto.subtle.decrypt({ iv: n10, name: "AES-CBC" }, l2, r10));
        } catch {
        }
        if (!s2) throw new t$();
        return s2;
      }
      async function rC(e10, t10, r10, n10, i10, a10) {
        let o10;
        t10 instanceof Uint8Array ? o10 = await crypto.subtle.importKey("raw", t10, "AES-GCM", false, ["decrypt"]) : (rt(t10, e10, "decrypt"), o10 = t10);
        try {
          return new Uint8Array(await crypto.subtle.decrypt({ additionalData: a10, iv: n10, name: "AES-GCM", tagLength: 128 }, o10, tE(r10, i10)));
        } catch {
          throw new t$();
        }
      }
      async function rR(e10, t10, r10, n10, i10, a10) {
        if (!tK(t10) && !(t10 instanceof Uint8Array)) throw TypeError(tZ(t10, "CryptoKey", "KeyObject", "Uint8Array", "JSON Web Key"));
        if (!n10) throw new tM("JWE Initialization Vector missing");
        if (!i10) throw new tM("JWE Authentication Tag missing");
        switch (t8(e10, n10), e10) {
          case "A128CBC-HS256":
          case "A192CBC-HS384":
          case "A256CBC-HS512":
            return t10 instanceof Uint8Array && t9(t10, parseInt(e10.slice(-3), 10)), rP(e10, t10, r10, n10, i10, a10);
          case "A128GCM":
          case "A192GCM":
          case "A256GCM":
            return t10 instanceof Uint8Array && t9(t10, parseInt(e10.slice(1, 4), 10)), rC(e10, t10, r10, n10, i10, a10);
          default:
            throw new tL("Unsupported JWE Content Encryption Algorithm");
        }
      }
      async function rO(e10, t10, r10, n10) {
        let i10 = e10.slice(0, 7), a10 = await ri(i10, r10, t10, n10, new Uint8Array());
        return { encryptedKey: a10.ciphertext, iv: tR(a10.iv), tag: tR(a10.tag) };
      }
      async function rI(e10, t10, r10, n10, i10) {
        return rR(e10.slice(0, 7), t10, r10, n10, i10, new Uint8Array());
      }
      async function rU(e10, t10, r10, n10, i10 = {}) {
        let a10, o10, s2;
        switch (e10) {
          case "dir":
            s2 = r10;
            break;
          case "ECDH-ES":
          case "ECDH-ES+A128KW":
          case "ECDH-ES+A192KW":
          case "ECDH-ES+A256KW": {
            let c2;
            if (tW(r10), !rp(r10)) throw new tL("ECDH with the provided key is not allowed or not supported by your javascript runtime");
            let { apu: l2, apv: u2 } = i10;
            c2 = i10.epk ? await rE(i10.epk, e10) : (await crypto.subtle.generateKey(r10.algorithm, true, ["deriveBits"])).privateKey;
            let { x: d2, y: p2, crv: h2, kty: f2 } = await t1(c2), g2 = await rd(r10, c2, "ECDH-ES" === e10 ? t10 : e10, "ECDH-ES" === e10 ? rx(t10) : parseInt(e10.slice(-5, -2), 10), l2, u2);
            if (o10 = { epk: { x: d2, crv: h2, kty: f2 } }, "EC" === f2 && (o10.epk.y = p2), l2 && (o10.apu = tR(l2)), u2 && (o10.apv = tR(u2)), "ECDH-ES" === e10) {
              s2 = g2;
              break;
            }
            s2 = n10 || rA(t10);
            let m2 = e10.slice(-6);
            a10 = await rs(m2, g2, s2);
            break;
          }
          case "RSA-OAEP":
          case "RSA-OAEP-256":
          case "RSA-OAEP-384":
          case "RSA-OAEP-512":
            s2 = n10 || rA(t10), tW(r10), a10 = await rb(e10, r10, s2);
            break;
          case "PBES2-HS256+A128KW":
          case "PBES2-HS384+A192KW":
          case "PBES2-HS512+A256KW": {
            s2 = n10 || rA(t10);
            let { p2c: c2, p2s: l2 } = i10;
            ({ encryptedKey: a10, ...o10 } = await rg(e10, r10, s2, c2, l2));
            break;
          }
          case "A128KW":
          case "A192KW":
          case "A256KW":
            s2 = n10 || rA(t10), a10 = await rs(e10, r10, s2);
            break;
          case "A128GCMKW":
          case "A192GCMKW":
          case "A256GCMKW": {
            s2 = n10 || rA(t10);
            let { iv: c2 } = i10;
            ({ encryptedKey: a10, ...o10 } = await rO(e10, r10, s2, c2));
            break;
          }
          default:
            throw new tL('Invalid or unsupported "alg" (JWE Algorithm) header value');
        }
        return { cek: s2, encryptedKey: a10, parameters: o10 };
      }
      function rN(...e10) {
        let t10;
        let r10 = e10.filter(Boolean);
        if (0 === r10.length || 1 === r10.length) return true;
        for (let e11 of r10) {
          let r11 = Object.keys(e11);
          if (!t10 || 0 === t10.size) {
            t10 = new Set(r11);
            continue;
          }
          for (let e12 of r11) {
            if (t10.has(e12)) return false;
            t10.add(e12);
          }
        }
        return true;
      }
      function rL(e10, t10, r10, n10, i10) {
        let a10;
        if (void 0 !== i10.crit && n10?.crit === void 0) throw new e10('"crit" (Critical) Header Parameter MUST be integrity protected');
        if (!n10 || void 0 === n10.crit) return /* @__PURE__ */ new Set();
        if (!Array.isArray(n10.crit) || 0 === n10.crit.length || n10.crit.some((e11) => "string" != typeof e11 || 0 === e11.length)) throw new e10('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');
        for (let o10 of (a10 = void 0 !== r10 ? new Map([...Object.entries(r10), ...t10.entries()]) : t10, n10.crit)) {
          if (!a10.has(o10)) throw new tL(`Extension Header Parameter "${o10}" is not recognized`);
          if (void 0 === i10[o10]) throw new e10(`Extension Header Parameter "${o10}" is missing`);
          if (a10.get(o10) && void 0 === n10[o10]) throw new e10(`Extension Header Parameter "${o10}" MUST be integrity protected`);
        }
        return new Set(n10.crit);
      }
      let r$ = (e10) => e10?.[Symbol.toStringTag], rM = (e10, t10, r10) => {
        if (void 0 !== t10.use) {
          let e11;
          switch (r10) {
            case "sign":
            case "verify":
              e11 = "sig";
              break;
            case "encrypt":
            case "decrypt":
              e11 = "enc";
          }
          if (t10.use !== e11) throw TypeError(`Invalid key for this operation, its "use" must be "${e11}" when present`);
        }
        if (void 0 !== t10.alg && t10.alg !== e10) throw TypeError(`Invalid key for this operation, its "alg" must be "${e10}" when present`);
        if (Array.isArray(t10.key_ops)) {
          let n10;
          switch (true) {
            case ("sign" === r10 || "verify" === r10):
            case "dir" === e10:
            case e10.includes("CBC-HS"):
              n10 = r10;
              break;
            case e10.startsWith("PBES2"):
              n10 = "deriveBits";
              break;
            case /^A\d{3}(?:GCM)?(?:KW)?$/.test(e10):
              n10 = !e10.includes("GCM") && e10.endsWith("KW") ? "encrypt" === r10 ? "wrapKey" : "unwrapKey" : r10;
              break;
            case ("encrypt" === r10 && e10.startsWith("RSA")):
              n10 = "wrapKey";
              break;
            case "decrypt" === r10:
              n10 = e10.startsWith("RSA") ? "unwrapKey" : "deriveBits";
          }
          if (n10 && t10.key_ops?.includes?.(n10) === false) throw TypeError(`Invalid key for this operation, its "key_ops" must include "${n10}" when present`);
        }
        return true;
      }, rj = (e10, t10, r10) => {
        if (!(t10 instanceof Uint8Array)) {
          if (tz(t10)) {
            if (tX(t10) && rM(e10, t10, r10)) return;
            throw TypeError('JSON Web Key for symmetric algorithms must have JWK "kty" (Key Type) equal to "oct" and the JWK "k" (Key Value) present');
          }
          if (!tJ(t10)) throw TypeError(tQ(e10, t10, "CryptoKey", "KeyObject", "JSON Web Key", "Uint8Array"));
          if ("secret" !== t10.type) throw TypeError(`${r$(t10)} instances for symmetric algorithms must be of type "secret"`);
        }
      }, rD = (e10, t10, r10) => {
        if (tz(t10)) switch (r10) {
          case "decrypt":
          case "sign":
            if (tF(t10) && rM(e10, t10, r10)) return;
            throw TypeError("JSON Web Key for this operation must be a private JWK");
          case "encrypt":
          case "verify":
            if (tG(t10) && rM(e10, t10, r10)) return;
            throw TypeError("JSON Web Key for this operation must be a public JWK");
        }
        if (!tJ(t10)) throw TypeError(tQ(e10, t10, "CryptoKey", "KeyObject", "JSON Web Key"));
        if ("secret" === t10.type) throw TypeError(`${r$(t10)} instances for asymmetric algorithms must not be of type "secret"`);
        if ("public" === t10.type) switch (r10) {
          case "sign":
            throw TypeError(`${r$(t10)} instances for asymmetric algorithm signing must be of type "private"`);
          case "decrypt":
            throw TypeError(`${r$(t10)} instances for asymmetric algorithm decryption must be of type "private"`);
        }
        if ("private" === t10.type) switch (r10) {
          case "verify":
            throw TypeError(`${r$(t10)} instances for asymmetric algorithm verifying must be of type "public"`);
          case "encrypt":
            throw TypeError(`${r$(t10)} instances for asymmetric algorithm encryption must be of type "public"`);
        }
      };
      function rH(e10, t10, r10) {
        switch (e10.substring(0, 2)) {
          case "A1":
          case "A2":
          case "di":
          case "HS":
          case "PB":
            rj(e10, t10, r10);
            break;
          default:
            rD(e10, t10, r10);
        }
      }
      class rW {
        #e;
        #t;
        #r;
        #n;
        #i;
        #a;
        #o;
        #s;
        constructor(e10) {
          if (!(e10 instanceof Uint8Array)) throw TypeError("plaintext must be an instance of Uint8Array");
          this.#e = e10;
        }
        setKeyManagementParameters(e10) {
          if (this.#s) throw TypeError("setKeyManagementParameters can only be called once");
          return this.#s = e10, this;
        }
        setProtectedHeader(e10) {
          if (this.#t) throw TypeError("setProtectedHeader can only be called once");
          return this.#t = e10, this;
        }
        setSharedUnprotectedHeader(e10) {
          if (this.#r) throw TypeError("setSharedUnprotectedHeader can only be called once");
          return this.#r = e10, this;
        }
        setUnprotectedHeader(e10) {
          if (this.#n) throw TypeError("setUnprotectedHeader can only be called once");
          return this.#n = e10, this;
        }
        setAdditionalAuthenticatedData(e10) {
          return this.#i = e10, this;
        }
        setContentEncryptionKey(e10) {
          if (this.#a) throw TypeError("setContentEncryptionKey can only be called once");
          return this.#a = e10, this;
        }
        setInitializationVector(e10) {
          if (this.#o) throw TypeError("setInitializationVector can only be called once");
          return this.#o = e10, this;
        }
        async encrypt(e10, t10) {
          let r10, n10, i10, a10, o10, s2;
          if (!this.#t && !this.#n && !this.#r) throw new tM("either setProtectedHeader, setUnprotectedHeader, or sharedUnprotectedHeader must be called before #encrypt()");
          if (!rN(this.#t, this.#n, this.#r)) throw new tM("JWE Protected, JWE Shared Unprotected and JWE Per-Recipient Header Parameter names must be disjoint");
          let c2 = { ...this.#t, ...this.#n, ...this.#r };
          if (rL(tM, /* @__PURE__ */ new Map(), t10?.crit, this.#t, c2), void 0 !== c2.zip) throw new tL('JWE "zip" (Compression Algorithm) Header Parameter is not supported.');
          let { alg: l2, enc: u2 } = c2;
          if ("string" != typeof l2 || !l2) throw new tM('JWE "alg" (Algorithm) Header Parameter missing or invalid');
          if ("string" != typeof u2 || !u2) throw new tM('JWE "enc" (Encryption Algorithm) Header Parameter missing or invalid');
          if (this.#a && ("dir" === l2 || "ECDH-ES" === l2)) throw TypeError(`setContentEncryptionKey cannot be called with JWE "alg" (Algorithm) Header ${l2}`);
          rH("dir" === l2 ? u2 : l2, e10, "encrypt");
          {
            let i11;
            let a11 = await rE(e10, l2);
            ({ cek: n10, encryptedKey: r10, parameters: i11 } = await rU(l2, u2, a11, this.#a, this.#s)), i11 && (t10 && t3 in t10 ? this.#n ? this.#n = { ...this.#n, ...i11 } : this.setUnprotectedHeader(i11) : this.#t ? this.#t = { ...this.#t, ...i11 } : this.setProtectedHeader(i11));
          }
          if (this.#t ? o10 = tP(a10 = tR(JSON.stringify(this.#t))) : (a10 = "", o10 = new Uint8Array()), this.#i) {
            let e11 = tP(s2 = tR(this.#i));
            i10 = tE(o10, tP("."), e11);
          } else i10 = o10;
          let { ciphertext: d2, tag: p2, iv: h2 } = await ri(u2, this.#e, n10, this.#o, i10), f2 = { ciphertext: tR(d2) };
          return h2 && (f2.iv = tR(h2)), p2 && (f2.tag = tR(p2)), r10 && (f2.encrypted_key = tR(r10)), s2 && (f2.aad = s2), this.#t && (f2.protected = a10), this.#r && (f2.unprotected = this.#r), this.#n && (f2.header = this.#n), f2;
        }
      }
      class rK {
        #c;
        constructor(e10) {
          this.#c = new rW(e10);
        }
        setContentEncryptionKey(e10) {
          return this.#c.setContentEncryptionKey(e10), this;
        }
        setInitializationVector(e10) {
          return this.#c.setInitializationVector(e10), this;
        }
        setProtectedHeader(e10) {
          return this.#c.setProtectedHeader(e10), this;
        }
        setKeyManagementParameters(e10) {
          return this.#c.setKeyManagementParameters(e10), this;
        }
        async encrypt(e10, t10) {
          let r10 = await this.#c.encrypt(e10, t10);
          return [r10.protected, r10.encrypted_key, r10.iv, r10.ciphertext, r10.tag].join(".");
        }
      }
      let rB = (e10) => Math.floor(e10.getTime() / 1e3), rJ = /^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i;
      function rV(e10) {
        let t10;
        let r10 = rJ.exec(e10);
        if (!r10 || r10[4] && r10[1]) throw TypeError("Invalid time period format");
        let n10 = parseFloat(r10[2]);
        switch (r10[3].toLowerCase()) {
          case "sec":
          case "secs":
          case "second":
          case "seconds":
          case "s":
            t10 = Math.round(n10);
            break;
          case "minute":
          case "minutes":
          case "min":
          case "mins":
          case "m":
            t10 = Math.round(60 * n10);
            break;
          case "hour":
          case "hours":
          case "hr":
          case "hrs":
          case "h":
            t10 = Math.round(3600 * n10);
            break;
          case "day":
          case "days":
          case "d":
            t10 = Math.round(86400 * n10);
            break;
          case "week":
          case "weeks":
          case "w":
            t10 = Math.round(604800 * n10);
            break;
          default:
            t10 = Math.round(31557600 * n10);
        }
        return "-" === r10[1] || "ago" === r10[4] ? -t10 : t10;
      }
      function rq(e10, t10) {
        if (!Number.isFinite(t10)) throw TypeError(`Invalid ${e10} input`);
        return t10;
      }
      let rz = (e10) => e10.includes("/") ? e10.toLowerCase() : `application/${e10.toLowerCase()}`, rF = (e10, t10) => "string" == typeof e10 ? t10.includes(e10) : !!Array.isArray(e10) && t10.some(Set.prototype.has.bind(new Set(e10)));
      class rG {
        #l;
        constructor(e10) {
          if (!tq(e10)) throw TypeError("JWT Claims Set MUST be an object");
          this.#l = structuredClone(e10);
        }
        data() {
          return tS.encode(JSON.stringify(this.#l));
        }
        get iss() {
          return this.#l.iss;
        }
        set iss(e10) {
          this.#l.iss = e10;
        }
        get sub() {
          return this.#l.sub;
        }
        set sub(e10) {
          this.#l.sub = e10;
        }
        get aud() {
          return this.#l.aud;
        }
        set aud(e10) {
          this.#l.aud = e10;
        }
        set jti(e10) {
          this.#l.jti = e10;
        }
        set nbf(e10) {
          "number" == typeof e10 ? this.#l.nbf = rq("setNotBefore", e10) : e10 instanceof Date ? this.#l.nbf = rq("setNotBefore", rB(e10)) : this.#l.nbf = rB(/* @__PURE__ */ new Date()) + rV(e10);
        }
        set exp(e10) {
          "number" == typeof e10 ? this.#l.exp = rq("setExpirationTime", e10) : e10 instanceof Date ? this.#l.exp = rq("setExpirationTime", rB(e10)) : this.#l.exp = rB(/* @__PURE__ */ new Date()) + rV(e10);
        }
        set iat(e10) {
          void 0 === e10 ? this.#l.iat = rB(/* @__PURE__ */ new Date()) : e10 instanceof Date ? this.#l.iat = rq("setIssuedAt", rB(e10)) : "string" == typeof e10 ? this.#l.iat = rq("setIssuedAt", rB(/* @__PURE__ */ new Date()) + rV(e10)) : this.#l.iat = rq("setIssuedAt", e10);
        }
      }
      class rX {
        #a;
        #o;
        #s;
        #t;
        #u;
        #d;
        #p;
        #h;
        constructor(e10 = {}) {
          this.#h = new rG(e10);
        }
        setIssuer(e10) {
          return this.#h.iss = e10, this;
        }
        setSubject(e10) {
          return this.#h.sub = e10, this;
        }
        setAudience(e10) {
          return this.#h.aud = e10, this;
        }
        setJti(e10) {
          return this.#h.jti = e10, this;
        }
        setNotBefore(e10) {
          return this.#h.nbf = e10, this;
        }
        setExpirationTime(e10) {
          return this.#h.exp = e10, this;
        }
        setIssuedAt(e10) {
          return this.#h.iat = e10, this;
        }
        setProtectedHeader(e10) {
          if (this.#t) throw TypeError("setProtectedHeader can only be called once");
          return this.#t = e10, this;
        }
        setKeyManagementParameters(e10) {
          if (this.#s) throw TypeError("setKeyManagementParameters can only be called once");
          return this.#s = e10, this;
        }
        setContentEncryptionKey(e10) {
          if (this.#a) throw TypeError("setContentEncryptionKey can only be called once");
          return this.#a = e10, this;
        }
        setInitializationVector(e10) {
          if (this.#o) throw TypeError("setInitializationVector can only be called once");
          return this.#o = e10, this;
        }
        replicateIssuerAsHeader() {
          return this.#u = true, this;
        }
        replicateSubjectAsHeader() {
          return this.#d = true, this;
        }
        replicateAudienceAsHeader() {
          return this.#p = true, this;
        }
        async encrypt(e10, t10) {
          let r10 = new rK(this.#h.data());
          return this.#t && (this.#u || this.#d || this.#p) && (this.#t = { ...this.#t, iss: this.#u ? this.#h.iss : void 0, sub: this.#d ? this.#h.sub : void 0, aud: this.#p ? this.#h.aud : void 0 }), r10.setProtectedHeader(this.#t), this.#o && r10.setInitializationVector(this.#o), this.#a && r10.setContentEncryptionKey(this.#a), this.#s && r10.setKeyManagementParameters(this.#s), r10.encrypt(e10, t10);
        }
      }
      async function rY(e10, t10, r10) {
        let n10;
        if (!tq(e10)) throw TypeError("JWK must be an object");
        switch (t10 ??= e10.alg, n10 ??= r10?.extractable ?? e10.ext, e10.kty) {
          case "oct":
            if ("string" != typeof e10.k || !e10.k) throw TypeError('missing "k" (Key Value) Parameter value');
            return tC(e10.k);
          case "RSA":
            if ("oth" in e10 && void 0 !== e10.oth) throw new tL('RSA JWK "oth" (Other Primes Info) Parameter value is not supported');
            return r_({ ...e10, alg: t10, ext: n10 });
          case "AKP":
            if ("string" != typeof e10.alg || !e10.alg) throw TypeError('missing "alg" (Algorithm) Parameter value');
            if (void 0 !== t10 && t10 !== e10.alg) throw TypeError("JWK alg and alg option value mismatch");
            return r_({ ...e10, ext: n10 });
          case "EC":
          case "OKP":
            return r_({ ...e10, alg: t10, ext: n10 });
          default:
            throw new tL('Unsupported "kty" (Key Type) Parameter value');
        }
      }
      async function rZ(e10, t10, r10, n10, i10) {
        switch (e10) {
          case "dir":
            if (void 0 !== r10) throw new tM("Encountered unexpected JWE Encrypted Key");
            return t10;
          case "ECDH-ES":
            if (void 0 !== r10) throw new tM("Encountered unexpected JWE Encrypted Key");
          case "ECDH-ES+A128KW":
          case "ECDH-ES+A192KW":
          case "ECDH-ES+A256KW": {
            let i11, a10;
            if (!tq(n10.epk)) throw new tM('JOSE Header "epk" (Ephemeral Public Key) missing or invalid');
            if (tW(t10), !rp(t10)) throw new tL("ECDH with the provided key is not allowed or not supported by your javascript runtime");
            let o10 = await rY(n10.epk, e10);
            if (tW(o10), void 0 !== n10.apu) {
              if ("string" != typeof n10.apu) throw new tM('JOSE Header "apu" (Agreement PartyUInfo) invalid');
              try {
                i11 = tC(n10.apu);
              } catch {
                throw new tM("Failed to base64url decode the apu");
              }
            }
            if (void 0 !== n10.apv) {
              if ("string" != typeof n10.apv) throw new tM('JOSE Header "apv" (Agreement PartyVInfo) invalid');
              try {
                a10 = tC(n10.apv);
              } catch {
                throw new tM("Failed to base64url decode the apv");
              }
            }
            let s2 = await rd(o10, t10, "ECDH-ES" === e10 ? n10.enc : e10, "ECDH-ES" === e10 ? rx(n10.enc) : parseInt(e10.slice(-5, -2), 10), i11, a10);
            if ("ECDH-ES" === e10) return s2;
            if (void 0 === r10) throw new tM("JWE Encrypted Key missing");
            return rc(e10.slice(-6), s2, r10);
          }
          case "RSA-OAEP":
          case "RSA-OAEP-256":
          case "RSA-OAEP-384":
          case "RSA-OAEP-512":
            if (void 0 === r10) throw new tM("JWE Encrypted Key missing");
            return tW(t10), rv(e10, t10, r10);
          case "PBES2-HS256+A128KW":
          case "PBES2-HS384+A192KW":
          case "PBES2-HS512+A256KW": {
            let a10;
            if (void 0 === r10) throw new tM("JWE Encrypted Key missing");
            if ("number" != typeof n10.p2c) throw new tM('JOSE Header "p2c" (PBES2 Count) missing or invalid');
            let o10 = i10?.maxPBES2Count || 1e4;
            if (n10.p2c > o10) throw new tM('JOSE Header "p2c" (PBES2 Count) out is of acceptable bounds');
            if ("string" != typeof n10.p2s) throw new tM('JOSE Header "p2s" (PBES2 Salt) missing or invalid');
            try {
              a10 = tC(n10.p2s);
            } catch {
              throw new tM("Failed to base64url decode the p2s");
            }
            return rm(e10, t10, r10, n10.p2c, a10);
          }
          case "A128KW":
          case "A192KW":
          case "A256KW":
            if (void 0 === r10) throw new tM("JWE Encrypted Key missing");
            return rc(e10, t10, r10);
          case "A128GCMKW":
          case "A192GCMKW":
          case "A256GCMKW": {
            let i11, a10;
            if (void 0 === r10) throw new tM("JWE Encrypted Key missing");
            if ("string" != typeof n10.iv) throw new tM('JOSE Header "iv" (Initialization Vector) missing or invalid');
            if ("string" != typeof n10.tag) throw new tM('JOSE Header "tag" (Authentication Tag) missing or invalid');
            try {
              i11 = tC(n10.iv);
            } catch {
              throw new tM("Failed to base64url decode the iv");
            }
            try {
              a10 = tC(n10.tag);
            } catch {
              throw new tM("Failed to base64url decode the tag");
            }
            return rI(e10, t10, r10, i11, a10);
          }
          default:
            throw new tL('Invalid or unsupported "alg" (JWE Algorithm) header value');
        }
      }
      function rQ(e10, t10) {
        if (void 0 !== t10 && (!Array.isArray(t10) || t10.some((e11) => "string" != typeof e11))) throw TypeError(`"${e10}" option must be an array of strings`);
        if (t10) return new Set(t10);
      }
      async function r0(e10, t10, r10) {
        let n10, i10, a10, o10, s2, c2, l2;
        if (!tq(e10)) throw new tM("Flattened JWE must be an object");
        if (void 0 === e10.protected && void 0 === e10.header && void 0 === e10.unprotected) throw new tM("JOSE Header missing");
        if (void 0 !== e10.iv && "string" != typeof e10.iv) throw new tM("JWE Initialization Vector incorrect type");
        if ("string" != typeof e10.ciphertext) throw new tM("JWE Ciphertext missing or incorrect type");
        if (void 0 !== e10.tag && "string" != typeof e10.tag) throw new tM("JWE Authentication Tag incorrect type");
        if (void 0 !== e10.protected && "string" != typeof e10.protected) throw new tM("JWE Protected Header incorrect type");
        if (void 0 !== e10.encrypted_key && "string" != typeof e10.encrypted_key) throw new tM("JWE Encrypted Key incorrect type");
        if (void 0 !== e10.aad && "string" != typeof e10.aad) throw new tM("JWE AAD incorrect type");
        if (void 0 !== e10.header && !tq(e10.header)) throw new tM("JWE Shared Unprotected Header incorrect type");
        if (void 0 !== e10.unprotected && !tq(e10.unprotected)) throw new tM("JWE Per-Recipient Unprotected Header incorrect type");
        if (e10.protected) try {
          let t11 = tC(e10.protected);
          n10 = JSON.parse(tk.decode(t11));
        } catch {
          throw new tM("JWE Protected Header is invalid");
        }
        if (!rN(n10, e10.header, e10.unprotected)) throw new tM("JWE Protected, JWE Unprotected Header, and JWE Per-Recipient Unprotected Header Parameter names must be disjoint");
        let u2 = { ...n10, ...e10.header, ...e10.unprotected };
        if (rL(tM, /* @__PURE__ */ new Map(), r10?.crit, n10, u2), void 0 !== u2.zip) throw new tL('JWE "zip" (Compression Algorithm) Header Parameter is not supported.');
        let { alg: d2, enc: p2 } = u2;
        if ("string" != typeof d2 || !d2) throw new tM("missing JWE Algorithm (alg) in JWE Header");
        if ("string" != typeof p2 || !p2) throw new tM("missing JWE Encryption Algorithm (enc) in JWE Header");
        let h2 = r10 && rQ("keyManagementAlgorithms", r10.keyManagementAlgorithms), f2 = r10 && rQ("contentEncryptionAlgorithms", r10.contentEncryptionAlgorithms);
        if (h2 && !h2.has(d2) || !h2 && d2.startsWith("PBES2")) throw new tN('"alg" (Algorithm) Header Parameter value not allowed');
        if (f2 && !f2.has(p2)) throw new tN('"enc" (Encryption Algorithm) Header Parameter value not allowed');
        if (void 0 !== e10.encrypted_key) try {
          i10 = tC(e10.encrypted_key);
        } catch {
          throw new tM("Failed to base64url decode the encrypted_key");
        }
        let g2 = false;
        "function" == typeof t10 && (t10 = await t10(n10, e10), g2 = true), rH("dir" === d2 ? p2 : d2, t10, "decrypt");
        let m2 = await rE(t10, d2);
        try {
          a10 = await rZ(d2, m2, i10, u2, r10);
        } catch (e11) {
          if (e11 instanceof TypeError || e11 instanceof tM || e11 instanceof tL) throw e11;
          a10 = rA(p2);
        }
        if (void 0 !== e10.iv) try {
          o10 = tC(e10.iv);
        } catch {
          throw new tM("Failed to base64url decode the iv");
        }
        if (void 0 !== e10.tag) try {
          s2 = tC(e10.tag);
        } catch {
          throw new tM("Failed to base64url decode the tag");
        }
        let y2 = void 0 !== e10.protected ? tP(e10.protected) : new Uint8Array();
        c2 = void 0 !== e10.aad ? tE(y2, tP("."), tP(e10.aad)) : y2;
        try {
          l2 = tC(e10.ciphertext);
        } catch {
          throw new tM("Failed to base64url decode the ciphertext");
        }
        let w2 = { plaintext: await rR(p2, a10, l2, o10, s2, c2) };
        if (void 0 !== e10.protected && (w2.protectedHeader = n10), void 0 !== e10.aad) try {
          w2.additionalAuthenticatedData = tC(e10.aad);
        } catch {
          throw new tM("Failed to base64url decode the aad");
        }
        return (void 0 !== e10.unprotected && (w2.sharedUnprotectedHeader = e10.unprotected), void 0 !== e10.header && (w2.unprotectedHeader = e10.header), g2) ? { ...w2, key: m2 } : w2;
      }
      async function r1(e10, t10, r10) {
        if (e10 instanceof Uint8Array && (e10 = tk.decode(e10)), "string" != typeof e10) throw new tM("Compact JWE must be a string or Uint8Array");
        let { 0: n10, 1: i10, 2: a10, 3: o10, 4: s2, length: c2 } = e10.split(".");
        if (5 !== c2) throw new tM("Invalid Compact JWE");
        let l2 = await r0({ ciphertext: o10, iv: a10 || void 0, protected: n10, tag: s2 || void 0, encrypted_key: i10 || void 0 }, t10, r10), u2 = { plaintext: l2.plaintext, protectedHeader: l2.protectedHeader };
        return "function" == typeof t10 ? { ...u2, key: l2.key } : u2;
      }
      async function r2(e10, t10, r10) {
        let n10 = await r1(e10, t10, r10), i10 = function(e11, t11, r11 = {}) {
          let n11, i11;
          try {
            n11 = JSON.parse(tk.decode(t11));
          } catch {
          }
          if (!tq(n11)) throw new tj("JWT Claims Set must be a top-level JSON object");
          let { typ: a11 } = r11;
          if (a11 && ("string" != typeof e11.typ || rz(e11.typ) !== rz(a11))) throw new tI('unexpected "typ" JWT header value', n11, "typ", "check_failed");
          let { requiredClaims: o11 = [], issuer: s2, subject: c2, audience: l2, maxTokenAge: u2 } = r11, d2 = [...o11];
          for (let e12 of (void 0 !== u2 && d2.push("iat"), void 0 !== l2 && d2.push("aud"), void 0 !== c2 && d2.push("sub"), void 0 !== s2 && d2.push("iss"), new Set(d2.reverse()))) if (!(e12 in n11)) throw new tI(`missing required "${e12}" claim`, n11, e12, "missing");
          if (s2 && !(Array.isArray(s2) ? s2 : [s2]).includes(n11.iss)) throw new tI('unexpected "iss" claim value', n11, "iss", "check_failed");
          if (c2 && n11.sub !== c2) throw new tI('unexpected "sub" claim value', n11, "sub", "check_failed");
          if (l2 && !rF(n11.aud, "string" == typeof l2 ? [l2] : l2)) throw new tI('unexpected "aud" claim value', n11, "aud", "check_failed");
          switch (typeof r11.clockTolerance) {
            case "string":
              i11 = rV(r11.clockTolerance);
              break;
            case "number":
              i11 = r11.clockTolerance;
              break;
            case "undefined":
              i11 = 0;
              break;
            default:
              throw TypeError("Invalid clockTolerance option type");
          }
          let { currentDate: p2 } = r11, h2 = rB(p2 || /* @__PURE__ */ new Date());
          if ((void 0 !== n11.iat || u2) && "number" != typeof n11.iat) throw new tI('"iat" claim must be a number', n11, "iat", "invalid");
          if (void 0 !== n11.nbf) {
            if ("number" != typeof n11.nbf) throw new tI('"nbf" claim must be a number', n11, "nbf", "invalid");
            if (n11.nbf > h2 + i11) throw new tI('"nbf" claim timestamp check failed', n11, "nbf", "check_failed");
          }
          if (void 0 !== n11.exp) {
            if ("number" != typeof n11.exp) throw new tI('"exp" claim must be a number', n11, "exp", "invalid");
            if (n11.exp <= h2 - i11) throw new tU('"exp" claim timestamp check failed', n11, "exp", "check_failed");
          }
          if (u2) {
            let e12 = h2 - n11.iat;
            if (e12 - i11 > ("number" == typeof u2 ? u2 : rV(u2))) throw new tU('"iat" claim timestamp check failed (too far in the past)', n11, "iat", "check_failed");
            if (e12 < 0 - i11) throw new tI('"iat" claim timestamp check failed (it should be in the past)', n11, "iat", "check_failed");
          }
          return n11;
        }(n10.protectedHeader, n10.plaintext, r10), { protectedHeader: a10 } = n10;
        if (void 0 !== a10.iss && a10.iss !== i10.iss) throw new tI('replicated "iss" claim header parameter mismatch', i10, "iss", "mismatch");
        if (void 0 !== a10.sub && a10.sub !== i10.sub) throw new tI('replicated "sub" claim header parameter mismatch', i10, "sub", "mismatch");
        if (void 0 !== a10.aud && JSON.stringify(a10.aud) !== JSON.stringify(i10.aud)) throw new tI('replicated "aud" claim header parameter mismatch', i10, "aud", "mismatch");
        let o10 = { payload: i10, protectedHeader: a10 };
        return "function" == typeof t10 ? { ...o10, key: n10.key } : o10;
      }
      let r5 = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/, r3 = /^("?)[\u0021\u0023-\u002B\u002D-\u003A\u003C-\u005B\u005D-\u007E]*\1$/, r6 = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i, r4 = /^[\u0020-\u003A\u003D-\u007E]*$/, r8 = Object.prototype.toString, r9 = (() => {
        let e10 = function() {
        };
        return e10.prototype = /* @__PURE__ */ Object.create(null), e10;
      })();
      function r7(e10, t10) {
        let r10 = new r9(), n10 = e10.length;
        if (n10 < 2) return r10;
        let i10 = t10?.decode || nn, a10 = 0;
        do {
          let t11 = e10.indexOf("=", a10);
          if (-1 === t11) break;
          let o10 = e10.indexOf(";", a10), s2 = -1 === o10 ? n10 : o10;
          if (t11 > s2) {
            a10 = e10.lastIndexOf(";", t11 - 1) + 1;
            continue;
          }
          let c2 = ne(e10, a10, t11), l2 = nt(e10, t11, c2), u2 = e10.slice(c2, l2);
          if (void 0 === r10[u2]) {
            let n11 = ne(e10, t11 + 1, s2), a11 = nt(e10, s2, n11), o11 = i10(e10.slice(n11, a11));
            r10[u2] = o11;
          }
          a10 = s2 + 1;
        } while (a10 < n10);
        return r10;
      }
      function ne(e10, t10, r10) {
        do {
          let r11 = e10.charCodeAt(t10);
          if (32 !== r11 && 9 !== r11) return t10;
        } while (++t10 < r10);
        return r10;
      }
      function nt(e10, t10, r10) {
        for (; t10 > r10; ) {
          let r11 = e10.charCodeAt(--t10);
          if (32 !== r11 && 9 !== r11) return t10 + 1;
        }
        return r10;
      }
      function nr(e10, t10, r10) {
        let n10 = r10?.encode || encodeURIComponent;
        if (!r5.test(e10)) throw TypeError(`argument name is invalid: ${e10}`);
        let i10 = n10(t10);
        if (!r3.test(i10)) throw TypeError(`argument val is invalid: ${t10}`);
        let a10 = e10 + "=" + i10;
        if (!r10) return a10;
        if (void 0 !== r10.maxAge) {
          if (!Number.isInteger(r10.maxAge)) throw TypeError(`option maxAge is invalid: ${r10.maxAge}`);
          a10 += "; Max-Age=" + r10.maxAge;
        }
        if (r10.domain) {
          if (!r6.test(r10.domain)) throw TypeError(`option domain is invalid: ${r10.domain}`);
          a10 += "; Domain=" + r10.domain;
        }
        if (r10.path) {
          if (!r4.test(r10.path)) throw TypeError(`option path is invalid: ${r10.path}`);
          a10 += "; Path=" + r10.path;
        }
        if (r10.expires) {
          var o10;
          if (o10 = r10.expires, "[object Date]" !== r8.call(o10) || !Number.isFinite(r10.expires.valueOf())) throw TypeError(`option expires is invalid: ${r10.expires}`);
          a10 += "; Expires=" + r10.expires.toUTCString();
        }
        if (r10.httpOnly && (a10 += "; HttpOnly"), r10.secure && (a10 += "; Secure"), r10.partitioned && (a10 += "; Partitioned"), r10.priority) switch ("string" == typeof r10.priority ? r10.priority.toLowerCase() : void 0) {
          case "low":
            a10 += "; Priority=Low";
            break;
          case "medium":
            a10 += "; Priority=Medium";
            break;
          case "high":
            a10 += "; Priority=High";
            break;
          default:
            throw TypeError(`option priority is invalid: ${r10.priority}`);
        }
        if (r10.sameSite) switch ("string" == typeof r10.sameSite ? r10.sameSite.toLowerCase() : r10.sameSite) {
          case true:
          case "strict":
            a10 += "; SameSite=Strict";
            break;
          case "lax":
            a10 += "; SameSite=Lax";
            break;
          case "none":
            a10 += "; SameSite=None";
            break;
          default:
            throw TypeError(`option sameSite is invalid: ${r10.sameSite}`);
        }
        return a10;
      }
      function nn(e10) {
        if (-1 === e10.indexOf("%")) return e10;
        try {
          return decodeURIComponent(e10);
        } catch (t10) {
          return e10;
        }
      }
      let { parse: ni } = p, na = () => Date.now() / 1e3 | 0, no = "A256CBC-HS512";
      async function ns(e10) {
        let { token: t10 = {}, secret: r10, maxAge: n10 = 2592e3, salt: i10 } = e10, a10 = Array.isArray(r10) ? r10 : [r10], o10 = await nl(no, a10[0], i10), s2 = await t5({ kty: "oct", k: tR(o10) }, `sha${o10.byteLength << 3}`);
        return await new rX(t10).setProtectedHeader({ alg: "dir", enc: no, kid: s2 }).setIssuedAt().setExpirationTime(na() + n10).setJti(crypto.randomUUID()).encrypt(o10);
      }
      async function nc(e10) {
        let { token: t10, secret: r10, salt: n10 } = e10, i10 = Array.isArray(r10) ? r10 : [r10];
        if (!t10) return null;
        let { payload: a10 } = await r2(t10, async ({ kid: e11, enc: t11 }) => {
          for (let r11 of i10) {
            let i11 = await nl(t11, r11, n10);
            if (void 0 === e11 || e11 === await t5({ kty: "oct", k: tR(i11) }, `sha${i11.byteLength << 3}`)) return i11;
          }
          throw Error("no matching decryption secret");
        }, { clockTolerance: 15, keyManagementAlgorithms: ["dir"], contentEncryptionAlgorithms: [no, "A256GCM"] });
        return a10;
      }
      async function nl(e10, t10, r10) {
        let n10;
        switch (e10) {
          case "A256CBC-HS512":
            n10 = 64;
            break;
          case "A256GCM":
            n10 = 32;
            break;
          default:
            throw Error("Unsupported JWT Content Encryption Algorithm");
        }
        return await tv("sha256", t10, r10, `Auth.js Generated Encryption Key (${r10})`, n10);
      }
      async function nu({ options: e10, paramValue: t10, cookieValue: r10 }) {
        let { url: n10, callbacks: i10 } = e10, a10 = n10.origin;
        return t10 ? a10 = await i10.redirect({ url: t10, baseUrl: n10.origin }) : r10 && (a10 = await i10.redirect({ url: r10, baseUrl: n10.origin })), { callbackUrl: a10, callbackUrlCookie: a10 !== r10 ? a10 : void 0 };
      }
      let nd = "\x1B[31m", np = "\x1B[0m", nh = { error(e10) {
        let t10 = e10 instanceof ej ? e10.type : e10.name;
        if (console.error(`${nd}[auth][error]${np} ${t10}: ${e10.message}`), e10.cause && "object" == typeof e10.cause && "err" in e10.cause && e10.cause.err instanceof Error) {
          let { err: t11, ...r10 } = e10.cause;
          console.error(`${nd}[auth][cause]${np}:`, t11.stack), r10 && console.error(`${nd}[auth][details]${np}:`, JSON.stringify(r10, null, 2));
        } else e10.stack && console.error(e10.stack.replace(/.*/, "").substring(1));
      }, warn(e10) {
        console.warn(`\x1B[33m[auth][warn][${e10}]${np}`, "Read more: https://warnings.authjs.dev");
      }, debug(e10, t10) {
        console.log(`\x1B[90m[auth][debug]:${np} ${e10}`, JSON.stringify(t10, null, 2));
      } };
      function nf(e10) {
        let t10 = { ...nh };
        return e10.debug || (t10.debug = () => {
        }), e10.logger?.error && (t10.error = e10.logger.error), e10.logger?.warn && (t10.warn = e10.logger.warn), e10.logger?.debug && (t10.debug = e10.logger.debug), e10.logger ?? (e10.logger = t10), t10;
      }
      let ng = ["providers", "session", "csrf", "signin", "signout", "callback", "verify-request", "error", "webauthn-options"], { parse: nm, serialize: ny } = p;
      async function nw(e10) {
        if (!("body" in e10) || !e10.body || "POST" !== e10.method) return;
        let t10 = e10.headers.get("content-type");
        return t10?.includes("application/json") ? await e10.json() : t10?.includes("application/x-www-form-urlencoded") ? Object.fromEntries(new URLSearchParams(await e10.text())) : void 0;
      }
      async function nb(e10, t10) {
        try {
          if ("GET" !== e10.method && "POST" !== e10.method) throw new e8("Only GET and POST requests are supported");
          t10.basePath ?? (t10.basePath = "/auth");
          let r10 = new URL(e10.url), { action: n10, providerId: i10 } = function(e11, t11) {
            let r11 = e11.match(RegExp(`^${t11}(.+)`));
            if (null === r11) throw new e8(`Cannot parse action at ${e11}`);
            let n11 = r11.at(-1).replace(/^\//, "").split("/").filter(Boolean);
            if (1 !== n11.length && 2 !== n11.length) throw new e8(`Cannot parse action at ${e11}`);
            let [i11, a10] = n11;
            if (!ng.includes(i11) || a10 && !["signin", "callback", "webauthn-options"].includes(i11)) throw new e8(`Cannot parse action at ${e11}`);
            return { action: i11, providerId: "undefined" == a10 ? void 0 : a10 };
          }(r10.pathname, t10.basePath);
          return { url: r10, action: n10, providerId: i10, method: e10.method, headers: Object.fromEntries(e10.headers), body: e10.body ? await nw(e10) : void 0, cookies: nm(e10.headers.get("cookie") ?? "") ?? {}, error: r10.searchParams.get("error") ?? void 0, query: Object.fromEntries(r10.searchParams) };
        } catch (n10) {
          let r10 = nf(t10);
          r10.error(n10), r10.debug("request", e10);
        }
      }
      function nv(e10) {
        let t10 = new Headers(e10.headers);
        e10.cookies?.forEach((e11) => {
          let { name: r11, value: n11, options: i10 } = e11, a10 = ny(r11, n11, i10);
          t10.has("Set-Cookie") ? t10.append("Set-Cookie", a10) : t10.set("Set-Cookie", a10);
        });
        let r10 = e10.body;
        "application/json" === t10.get("content-type") ? r10 = JSON.stringify(e10.body) : "application/x-www-form-urlencoded" === t10.get("content-type") && (r10 = new URLSearchParams(e10.body).toString());
        let n10 = new Response(r10, { headers: t10, status: e10.redirect ? 302 : e10.status ?? 200 });
        return e10.redirect && n10.headers.set("Location", e10.redirect), n10;
      }
      async function n_(e10) {
        let t10 = new TextEncoder().encode(e10);
        return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", t10))).map((e11) => e11.toString(16).padStart(2, "0")).join("").toString();
      }
      function nS(e10) {
        let t10 = (e11) => ("0" + e11.toString(16)).slice(-2);
        return Array.from(crypto.getRandomValues(new Uint8Array(e10))).reduce((e11, r10) => e11 + t10(r10), "");
      }
      async function nk({ options: e10, cookieValue: t10, isPost: r10, bodyValue: n10 }) {
        if (t10) {
          let [i11, a11] = t10.split("|");
          if (a11 === await n_(`${i11}${e10.secret}`)) return { csrfTokenVerified: r10 && i11 === n10, csrfToken: i11 };
        }
        let i10 = nS(32), a10 = await n_(`${i10}${e10.secret}`);
        return { cookie: `${i10}|${a10}`, csrfToken: i10 };
      }
      function nE(e10, t10) {
        if (!t10) throw new tr(`CSRF token was missing during an action ${e10}`);
      }
      function nx(e10) {
        return null !== e10 && "object" == typeof e10;
      }
      function nA(e10, ...t10) {
        if (!t10.length) return e10;
        let r10 = t10.shift();
        if (nx(e10) && nx(r10)) for (let t11 in r10) nx(r10[t11]) ? (nx(e10[t11]) || (e10[t11] = Array.isArray(r10[t11]) ? [] : {}), nA(e10[t11], r10[t11])) : void 0 !== r10[t11] && (e10[t11] = r10[t11]);
        return nA(e10, ...t10);
      }
      let nT = Symbol("skip-csrf-check"), nP = Symbol("return-type-raw"), nC = Symbol("custom-fetch"), nR = Symbol("conform-internal"), nO = (e10) => nU({ id: e10.sub ?? e10.id ?? crypto.randomUUID(), name: e10.name ?? e10.nickname ?? e10.preferred_username, email: e10.email, image: e10.picture }), nI = (e10) => nU({ access_token: e10.access_token, id_token: e10.id_token, refresh_token: e10.refresh_token, expires_at: e10.expires_at, scope: e10.scope, token_type: e10.token_type, session_state: e10.session_state });
      function nU(e10) {
        let t10 = {};
        for (let [r10, n10] of Object.entries(e10)) void 0 !== n10 && (t10[r10] = n10);
        return t10;
      }
      function nN(e10, t10) {
        if (!e10 && t10) return;
        if ("string" == typeof e10) return { url: new URL(e10) };
        let r10 = new URL(e10?.url ?? "https://authjs.dev");
        if (e10?.params != null) for (let [t11, n10] of Object.entries(e10.params)) "claims" === t11 && (n10 = JSON.stringify(n10)), r10.searchParams.set(t11, String(n10));
        return { url: r10, request: e10?.request, conform: e10?.conform, ...e10?.clientPrivateKey ? { clientPrivateKey: e10?.clientPrivateKey } : null };
      }
      let nL = { signIn: () => true, redirect: ({ url: e10, baseUrl: t10 }) => e10.startsWith("/") ? `${t10}${e10}` : new URL(e10).origin === t10 ? e10 : t10, session: ({ session: e10 }) => ({ user: { name: e10.user?.name, email: e10.user?.email, image: e10.user?.image }, expires: e10.expires?.toISOString?.() ?? e10.expires }), jwt: ({ token: e10 }) => e10 };
      async function n$({ authOptions: e10, providerId: t10, action: r10, url: n10, cookies: i10, callbackUrl: a10, csrfToken: o10, csrfDisabled: s2, isPost: c2 }) {
        var l2;
        let u2 = nf(e10), { providers: d2, provider: p2 } = function(e11) {
          let { providerId: t11, config: r11 } = e11, n11 = new URL(r11.basePath ?? "/auth", e11.url.origin), i11 = r11.providers.map((e12) => {
            let t12 = "function" == typeof e12 ? e12() : e12, { options: i12, ...a12 } = t12, o11 = i12?.id ?? a12.id, s3 = nA(a12, i12, { signinUrl: `${n11}/signin/${o11}`, callbackUrl: `${n11}/callback/${o11}` });
            if ("oauth" === t12.type || "oidc" === t12.type) {
              s3.redirectProxyUrl ?? (s3.redirectProxyUrl = i12?.redirectProxyUrl ?? r11.redirectProxyUrl);
              let e13 = function(e14) {
                e14.issuer && (e14.wellKnown ?? (e14.wellKnown = `${e14.issuer}/.well-known/openid-configuration`));
                let t13 = nN(e14.authorization, e14.issuer);
                t13 && !t13.url?.searchParams.has("scope") && t13.url.searchParams.set("scope", "openid profile email");
                let r12 = nN(e14.token, e14.issuer), n12 = nN(e14.userinfo, e14.issuer), i13 = e14.checks ?? ["pkce"];
                return e14.redirectProxyUrl && (i13.includes("state") || i13.push("state"), e14.redirectProxyUrl = `${e14.redirectProxyUrl}/callback/${e14.id}`), { ...e14, authorization: t13, token: r12, checks: i13, userinfo: n12, profile: e14.profile ?? nO, account: e14.account ?? nI };
              }(s3);
              return e13.authorization?.url.searchParams.get("response_mode") === "form_post" && delete e13.redirectProxyUrl, e13[nC] ?? (e13[nC] = i12?.[nC]), e13;
            }
            return s3;
          }), a11 = i11.find(({ id: e12 }) => e12 === t11);
          if (t11 && !a11) {
            let e12 = i11.map((e13) => e13.id).join(", ");
            throw Error(`Provider with id "${t11}" not found. Available providers: [${e12}].`);
          }
          return { providers: i11, provider: a11 };
        }({ url: n10, providerId: t10, config: e10 }), h2 = false;
        if ((p2?.type === "oauth" || p2?.type === "oidc") && p2.redirectProxyUrl) try {
          h2 = new URL(p2.redirectProxyUrl).origin === n10.origin;
        } catch {
          throw TypeError(`redirectProxyUrl must be a valid URL. Received: ${p2.redirectProxyUrl}`);
        }
        let f2 = { debug: false, pages: {}, theme: { colorScheme: "auto", logo: "", brandColor: "", buttonText: "" }, ...e10, url: n10, action: r10, provider: p2, cookies: nA(e$(e10.useSecureCookies ?? "https:" === n10.protocol), e10.cookies), providers: d2, session: { strategy: e10.adapter ? "database" : "jwt", maxAge: 2592e3, updateAge: 86400, generateSessionToken: () => crypto.randomUUID(), ...e10.session }, jwt: { secret: e10.secret, maxAge: e10.session?.maxAge ?? 2592e3, encode: ns, decode: nc, ...e10.jwt }, events: Object.keys(l2 = e10.events ?? {}).reduce((e11, t11) => (e11[t11] = async (...e12) => {
          try {
            let r11 = l2[t11];
            return await r11(...e12);
          } catch (e13) {
            u2.error(new eJ(e13));
          }
        }, e11), {}), adapter: function(e11, t11) {
          if (e11) return Object.keys(e11).reduce((r11, n11) => (r11[n11] = async (...r12) => {
            try {
              t11.debug(`adapter_${n11}`, { args: r12 });
              let i11 = e11[n11];
              return await i11(...r12);
            } catch (r13) {
              let e12 = new eH(r13);
              throw t11.error(e12), e12;
            }
          }, r11), {});
        }(e10.adapter, u2), callbacks: { ...nL, ...e10.callbacks }, logger: u2, callbackUrl: n10.origin, isOnRedirectProxy: h2, experimental: { ...e10.experimental } }, g2 = [];
        if (s2) f2.csrfTokenVerified = true;
        else {
          let { csrfToken: e11, cookie: t11, csrfTokenVerified: r11 } = await nk({ options: f2, cookieValue: i10?.[f2.cookies.csrfToken.name], isPost: c2, bodyValue: o10 });
          f2.csrfToken = e11, f2.csrfTokenVerified = r11, t11 && g2.push({ name: f2.cookies.csrfToken.name, value: t11, options: f2.cookies.csrfToken.options });
        }
        let { callbackUrl: m2, callbackUrlCookie: y2 } = await nu({ options: f2, cookieValue: i10?.[f2.cookies.callbackUrl.name], paramValue: a10 });
        return f2.callbackUrl = m2, y2 && g2.push({ name: f2.cookies.callbackUrl.name, value: y2, options: f2.cookies.callbackUrl.options }), { options: f2, cookies: g2 };
      }
      var nM, nj, nD, nH, nW, nK, nB, nJ, nV, nq, nz, nF, nG, nX, nY, nZ, nQ, n0, n1, n2, n5, n3, n6, n4, n8, n9, n7, ie, it = {}, ir = [], ii = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, ia = Array.isArray;
      function io(e10, t10) {
        for (var r10 in t10) e10[r10] = t10[r10];
        return e10;
      }
      function is(e10) {
        e10 && e10.parentNode && e10.parentNode.removeChild(e10);
      }
      function ic(e10, t10, r10) {
        var n10, i10, a10, o10 = {};
        for (a10 in t10) "key" == a10 ? n10 = t10[a10] : "ref" == a10 ? i10 = t10[a10] : o10[a10] = t10[a10];
        if (arguments.length > 2 && (o10.children = arguments.length > 3 ? n1.call(arguments, 2) : r10), "function" == typeof e10 && null != e10.defaultProps) for (a10 in e10.defaultProps) void 0 === o10[a10] && (o10[a10] = e10.defaultProps[a10]);
        return il(e10, o10, n10, i10, null);
      }
      function il(e10, t10, r10, n10, i10) {
        var a10 = { type: e10, props: t10, key: r10, ref: n10, __k: null, __: null, __b: 0, __e: null, __d: void 0, __c: null, constructor: void 0, __v: null == i10 ? ++n5 : i10, __i: -1, __u: 0 };
        return null == i10 && null != n2.vnode && n2.vnode(a10), a10;
      }
      function iu(e10) {
        return e10.children;
      }
      function id(e10, t10) {
        this.props = e10, this.context = t10;
      }
      function ip(e10, t10) {
        if (null == t10) return e10.__ ? ip(e10.__, e10.__i + 1) : null;
        for (var r10; t10 < e10.__k.length; t10++) if (null != (r10 = e10.__k[t10]) && null != r10.__e) return r10.__e;
        return "function" == typeof e10.type ? ip(e10) : null;
      }
      function ih(e10) {
        (!e10.__d && (e10.__d = true) && n3.push(e10) && !ig.__r++ || n6 !== n2.debounceRendering) && ((n6 = n2.debounceRendering) || n4)(ig);
      }
      function ig() {
        var e10, t10, r10, n10, i10, a10, o10, s2;
        for (n3.sort(n8); e10 = n3.shift(); ) e10.__d && (t10 = n3.length, n10 = void 0, a10 = (i10 = (r10 = e10).__v).__e, o10 = [], s2 = [], r10.__P && ((n10 = io({}, i10)).__v = i10.__v + 1, n2.vnode && n2.vnode(n10), iv(r10.__P, n10, i10, r10.__n, r10.__P.namespaceURI, 32 & i10.__u ? [a10] : null, o10, null == a10 ? ip(i10) : a10, !!(32 & i10.__u), s2), n10.__v = i10.__v, n10.__.__k[n10.__i] = n10, i_(o10, n10, s2), n10.__e != a10 && function e11(t11) {
          var r11, n11;
          if (null != (t11 = t11.__) && null != t11.__c) {
            for (t11.__e = t11.__c.base = null, r11 = 0; r11 < t11.__k.length; r11++) if (null != (n11 = t11.__k[r11]) && null != n11.__e) {
              t11.__e = t11.__c.base = n11.__e;
              break;
            }
            return e11(t11);
          }
        }(n10)), n3.length > t10 && n3.sort(n8));
        ig.__r = 0;
      }
      function im(e10, t10, r10, n10, i10, a10, o10, s2, c2, l2, u2) {
        var d2, p2, h2, f2, g2, m2 = n10 && n10.__k || ir, y2 = t10.length;
        for (r10.__d = c2, function(e11, t11, r11) {
          var n11, i11, a11, o11, s3, c3 = t11.length, l3 = r11.length, u3 = l3, d3 = 0;
          for (e11.__k = [], n11 = 0; n11 < c3; n11++) null != (i11 = t11[n11]) && "boolean" != typeof i11 && "function" != typeof i11 ? (o11 = n11 + d3, (i11 = e11.__k[n11] = "string" == typeof i11 || "number" == typeof i11 || "bigint" == typeof i11 || i11.constructor == String ? il(null, i11, null, null, null) : ia(i11) ? il(iu, { children: i11 }, null, null, null) : void 0 === i11.constructor && i11.__b > 0 ? il(i11.type, i11.props, i11.key, i11.ref ? i11.ref : null, i11.__v) : i11).__ = e11, i11.__b = e11.__b + 1, a11 = null, -1 !== (s3 = i11.__i = function(e12, t12, r12, n12) {
            var i12 = e12.key, a12 = e12.type, o12 = r12 - 1, s4 = r12 + 1, c4 = t12[r12];
            if (null === c4 || c4 && i12 == c4.key && a12 === c4.type && 0 == (131072 & c4.__u)) return r12;
            if (n12 > (null != c4 && 0 == (131072 & c4.__u) ? 1 : 0)) for (; o12 >= 0 || s4 < t12.length; ) {
              if (o12 >= 0) {
                if ((c4 = t12[o12]) && 0 == (131072 & c4.__u) && i12 == c4.key && a12 === c4.type) return o12;
                o12--;
              }
              if (s4 < t12.length) {
                if ((c4 = t12[s4]) && 0 == (131072 & c4.__u) && i12 == c4.key && a12 === c4.type) return s4;
                s4++;
              }
            }
            return -1;
          }(i11, r11, o11, u3)) && (u3--, (a11 = r11[s3]) && (a11.__u |= 131072)), null == a11 || null === a11.__v ? (-1 == s3 && d3--, "function" != typeof i11.type && (i11.__u |= 65536)) : s3 !== o11 && (s3 == o11 - 1 ? d3-- : s3 == o11 + 1 ? d3++ : (s3 > o11 ? d3-- : d3++, i11.__u |= 65536))) : i11 = e11.__k[n11] = null;
          if (u3) for (n11 = 0; n11 < l3; n11++) null != (a11 = r11[n11]) && 0 == (131072 & a11.__u) && (a11.__e == e11.__d && (e11.__d = ip(a11)), function e12(t12, r12, n12) {
            var i12, a12;
            if (n2.unmount && n2.unmount(t12), (i12 = t12.ref) && (i12.current && i12.current !== t12.__e || iS(i12, null, r12)), null != (i12 = t12.__c)) {
              if (i12.componentWillUnmount) try {
                i12.componentWillUnmount();
              } catch (e13) {
                n2.__e(e13, r12);
              }
              i12.base = i12.__P = null;
            }
            if (i12 = t12.__k) for (a12 = 0; a12 < i12.length; a12++) i12[a12] && e12(i12[a12], r12, n12 || "function" != typeof t12.type);
            n12 || is(t12.__e), t12.__c = t12.__ = t12.__e = t12.__d = void 0;
          }(a11, a11));
        }(r10, t10, m2), c2 = r10.__d, d2 = 0; d2 < y2; d2++) null != (h2 = r10.__k[d2]) && (p2 = -1 === h2.__i ? it : m2[h2.__i] || it, h2.__i = d2, iv(e10, h2, p2, i10, a10, o10, s2, c2, l2, u2), f2 = h2.__e, h2.ref && p2.ref != h2.ref && (p2.ref && iS(p2.ref, null, h2), u2.push(h2.ref, h2.__c || f2, h2)), null == g2 && null != f2 && (g2 = f2), 65536 & h2.__u || p2.__k === h2.__k ? c2 = function e11(t11, r11, n11) {
          var i11, a11;
          if ("function" == typeof t11.type) {
            for (i11 = t11.__k, a11 = 0; i11 && a11 < i11.length; a11++) i11[a11] && (i11[a11].__ = t11, r11 = e11(i11[a11], r11, n11));
            return r11;
          }
          t11.__e != r11 && (r11 && t11.type && !n11.contains(r11) && (r11 = ip(t11)), n11.insertBefore(t11.__e, r11 || null), r11 = t11.__e);
          do
            r11 = r11 && r11.nextSibling;
          while (null != r11 && 8 === r11.nodeType);
          return r11;
        }(h2, c2, e10) : "function" == typeof h2.type && void 0 !== h2.__d ? c2 = h2.__d : f2 && (c2 = f2.nextSibling), h2.__d = void 0, h2.__u &= -196609);
        r10.__d = c2, r10.__e = g2;
      }
      function iy(e10, t10, r10) {
        "-" === t10[0] ? e10.setProperty(t10, null == r10 ? "" : r10) : e10[t10] = null == r10 ? "" : "number" != typeof r10 || ii.test(t10) ? r10 : r10 + "px";
      }
      function iw(e10, t10, r10, n10, i10) {
        var a10;
        e: if ("style" === t10) {
          if ("string" == typeof r10) e10.style.cssText = r10;
          else {
            if ("string" == typeof n10 && (e10.style.cssText = n10 = ""), n10) for (t10 in n10) r10 && t10 in r10 || iy(e10.style, t10, "");
            if (r10) for (t10 in r10) n10 && r10[t10] === n10[t10] || iy(e10.style, t10, r10[t10]);
          }
        } else if ("o" === t10[0] && "n" === t10[1]) a10 = t10 !== (t10 = t10.replace(/(PointerCapture)$|Capture$/i, "$1")), t10 = t10.toLowerCase() in e10 || "onFocusOut" === t10 || "onFocusIn" === t10 ? t10.toLowerCase().slice(2) : t10.slice(2), e10.l || (e10.l = {}), e10.l[t10 + a10] = r10, r10 ? n10 ? r10.u = n10.u : (r10.u = n9, e10.addEventListener(t10, a10 ? ie : n7, a10)) : e10.removeEventListener(t10, a10 ? ie : n7, a10);
        else {
          if ("http://www.w3.org/2000/svg" == i10) t10 = t10.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
          else if ("width" != t10 && "height" != t10 && "href" != t10 && "list" != t10 && "form" != t10 && "tabIndex" != t10 && "download" != t10 && "rowSpan" != t10 && "colSpan" != t10 && "role" != t10 && "popover" != t10 && t10 in e10) try {
            e10[t10] = null == r10 ? "" : r10;
            break e;
          } catch (e11) {
          }
          "function" == typeof r10 || (null == r10 || false === r10 && "-" !== t10[4] ? e10.removeAttribute(t10) : e10.setAttribute(t10, "popover" == t10 && 1 == r10 ? "" : r10));
        }
      }
      function ib(e10) {
        return function(t10) {
          if (this.l) {
            var r10 = this.l[t10.type + e10];
            if (null == t10.t) t10.t = n9++;
            else if (t10.t < r10.u) return;
            return r10(n2.event ? n2.event(t10) : t10);
          }
        };
      }
      function iv(e10, t10, r10, n10, i10, a10, o10, s2, c2, l2) {
        var u2, d2, p2, h2, f2, g2, m2, y2, w2, b2, v2, _2, S2, k2, E2, x2, A2 = t10.type;
        if (void 0 !== t10.constructor) return null;
        128 & r10.__u && (c2 = !!(32 & r10.__u), a10 = [s2 = t10.__e = r10.__e]), (u2 = n2.__b) && u2(t10);
        e: if ("function" == typeof A2) try {
          if (y2 = t10.props, w2 = "prototype" in A2 && A2.prototype.render, b2 = (u2 = A2.contextType) && n10[u2.__c], v2 = u2 ? b2 ? b2.props.value : u2.__ : n10, r10.__c ? m2 = (d2 = t10.__c = r10.__c).__ = d2.__E : (w2 ? t10.__c = d2 = new A2(y2, v2) : (t10.__c = d2 = new id(y2, v2), d2.constructor = A2, d2.render = ik), b2 && b2.sub(d2), d2.props = y2, d2.state || (d2.state = {}), d2.context = v2, d2.__n = n10, p2 = d2.__d = true, d2.__h = [], d2._sb = []), w2 && null == d2.__s && (d2.__s = d2.state), w2 && null != A2.getDerivedStateFromProps && (d2.__s == d2.state && (d2.__s = io({}, d2.__s)), io(d2.__s, A2.getDerivedStateFromProps(y2, d2.__s))), h2 = d2.props, f2 = d2.state, d2.__v = t10, p2) w2 && null == A2.getDerivedStateFromProps && null != d2.componentWillMount && d2.componentWillMount(), w2 && null != d2.componentDidMount && d2.__h.push(d2.componentDidMount);
          else {
            if (w2 && null == A2.getDerivedStateFromProps && y2 !== h2 && null != d2.componentWillReceiveProps && d2.componentWillReceiveProps(y2, v2), !d2.__e && (null != d2.shouldComponentUpdate && false === d2.shouldComponentUpdate(y2, d2.__s, v2) || t10.__v === r10.__v)) {
              for (t10.__v !== r10.__v && (d2.props = y2, d2.state = d2.__s, d2.__d = false), t10.__e = r10.__e, t10.__k = r10.__k, t10.__k.some(function(e11) {
                e11 && (e11.__ = t10);
              }), _2 = 0; _2 < d2._sb.length; _2++) d2.__h.push(d2._sb[_2]);
              d2._sb = [], d2.__h.length && o10.push(d2);
              break e;
            }
            null != d2.componentWillUpdate && d2.componentWillUpdate(y2, d2.__s, v2), w2 && null != d2.componentDidUpdate && d2.__h.push(function() {
              d2.componentDidUpdate(h2, f2, g2);
            });
          }
          if (d2.context = v2, d2.props = y2, d2.__P = e10, d2.__e = false, S2 = n2.__r, k2 = 0, w2) {
            for (d2.state = d2.__s, d2.__d = false, S2 && S2(t10), u2 = d2.render(d2.props, d2.state, d2.context), E2 = 0; E2 < d2._sb.length; E2++) d2.__h.push(d2._sb[E2]);
            d2._sb = [];
          } else do
            d2.__d = false, S2 && S2(t10), u2 = d2.render(d2.props, d2.state, d2.context), d2.state = d2.__s;
          while (d2.__d && ++k2 < 25);
          d2.state = d2.__s, null != d2.getChildContext && (n10 = io(io({}, n10), d2.getChildContext())), w2 && !p2 && null != d2.getSnapshotBeforeUpdate && (g2 = d2.getSnapshotBeforeUpdate(h2, f2)), im(e10, ia(x2 = null != u2 && u2.type === iu && null == u2.key ? u2.props.children : u2) ? x2 : [x2], t10, r10, n10, i10, a10, o10, s2, c2, l2), d2.base = t10.__e, t10.__u &= -161, d2.__h.length && o10.push(d2), m2 && (d2.__E = d2.__ = null);
        } catch (e11) {
          if (t10.__v = null, c2 || null != a10) {
            for (t10.__u |= c2 ? 160 : 128; s2 && 8 === s2.nodeType && s2.nextSibling; ) s2 = s2.nextSibling;
            a10[a10.indexOf(s2)] = null, t10.__e = s2;
          } else t10.__e = r10.__e, t10.__k = r10.__k;
          n2.__e(e11, t10, r10);
        }
        else null == a10 && t10.__v === r10.__v ? (t10.__k = r10.__k, t10.__e = r10.__e) : t10.__e = function(e11, t11, r11, n11, i11, a11, o11, s3, c3) {
          var l3, u3, d3, p3, h3, f3, g3, m3 = r11.props, y3 = t11.props, w3 = t11.type;
          if ("svg" === w3 ? i11 = "http://www.w3.org/2000/svg" : "math" === w3 ? i11 = "http://www.w3.org/1998/Math/MathML" : i11 || (i11 = "http://www.w3.org/1999/xhtml"), null != a11) {
            for (l3 = 0; l3 < a11.length; l3++) if ((h3 = a11[l3]) && "setAttribute" in h3 == !!w3 && (w3 ? h3.localName === w3 : 3 === h3.nodeType)) {
              e11 = h3, a11[l3] = null;
              break;
            }
          }
          if (null == e11) {
            if (null === w3) return document.createTextNode(y3);
            e11 = document.createElementNS(i11, w3, y3.is && y3), s3 && (n2.__m && n2.__m(t11, a11), s3 = false), a11 = null;
          }
          if (null === w3) m3 === y3 || s3 && e11.data === y3 || (e11.data = y3);
          else {
            if (a11 = a11 && n1.call(e11.childNodes), m3 = r11.props || it, !s3 && null != a11) for (m3 = {}, l3 = 0; l3 < e11.attributes.length; l3++) m3[(h3 = e11.attributes[l3]).name] = h3.value;
            for (l3 in m3) if (h3 = m3[l3], "children" == l3) ;
            else if ("dangerouslySetInnerHTML" == l3) d3 = h3;
            else if (!(l3 in y3)) {
              if ("value" == l3 && "defaultValue" in y3 || "checked" == l3 && "defaultChecked" in y3) continue;
              iw(e11, l3, null, h3, i11);
            }
            for (l3 in y3) h3 = y3[l3], "children" == l3 ? p3 = h3 : "dangerouslySetInnerHTML" == l3 ? u3 = h3 : "value" == l3 ? f3 = h3 : "checked" == l3 ? g3 = h3 : s3 && "function" != typeof h3 || m3[l3] === h3 || iw(e11, l3, h3, m3[l3], i11);
            if (u3) s3 || d3 && (u3.__html === d3.__html || u3.__html === e11.innerHTML) || (e11.innerHTML = u3.__html), t11.__k = [];
            else if (d3 && (e11.innerHTML = ""), im(e11, ia(p3) ? p3 : [p3], t11, r11, n11, "foreignObject" === w3 ? "http://www.w3.org/1999/xhtml" : i11, a11, o11, a11 ? a11[0] : r11.__k && ip(r11, 0), s3, c3), null != a11) for (l3 = a11.length; l3--; ) is(a11[l3]);
            s3 || (l3 = "value", "progress" === w3 && null == f3 ? e11.removeAttribute("value") : void 0 === f3 || f3 === e11[l3] && ("progress" !== w3 || f3) && ("option" !== w3 || f3 === m3[l3]) || iw(e11, l3, f3, m3[l3], i11), l3 = "checked", void 0 !== g3 && g3 !== e11[l3] && iw(e11, l3, g3, m3[l3], i11));
          }
          return e11;
        }(r10.__e, t10, r10, n10, i10, a10, o10, c2, l2);
        (u2 = n2.diffed) && u2(t10);
      }
      function i_(e10, t10, r10) {
        t10.__d = void 0;
        for (var n10 = 0; n10 < r10.length; n10++) iS(r10[n10], r10[++n10], r10[++n10]);
        n2.__c && n2.__c(t10, e10), e10.some(function(t11) {
          try {
            e10 = t11.__h, t11.__h = [], e10.some(function(e11) {
              e11.call(t11);
            });
          } catch (e11) {
            n2.__e(e11, t11.__v);
          }
        });
      }
      function iS(e10, t10, r10) {
        try {
          if ("function" == typeof e10) {
            var n10 = "function" == typeof e10.__u;
            n10 && e10.__u(), n10 && null == t10 || (e10.__u = e10(t10));
          } else e10.current = t10;
        } catch (e11) {
          n2.__e(e11, r10);
        }
      }
      function ik(e10, t10, r10) {
        return this.constructor(e10, r10);
      }
      function iE(e10, t10) {
        var r10, n10, i10, a10, o10;
        r10 = e10, n2.__ && n2.__(r10, t10), i10 = (n10 = "function" == typeof iE) ? null : iE && iE.__k || t10.__k, a10 = [], o10 = [], iv(t10, r10 = (!n10 && iE || t10).__k = ic(iu, null, [r10]), i10 || it, it, t10.namespaceURI, !n10 && iE ? [iE] : i10 ? null : t10.firstChild ? n1.call(t10.childNodes) : null, a10, !n10 && iE ? iE : i10 ? i10.__e : t10.firstChild, n10, o10), i_(a10, r10, o10);
      }
      n1 = ir.slice, n2 = { __e: function(e10, t10, r10, n10) {
        for (var i10, a10, o10; t10 = t10.__; ) if ((i10 = t10.__c) && !i10.__) try {
          if ((a10 = i10.constructor) && null != a10.getDerivedStateFromError && (i10.setState(a10.getDerivedStateFromError(e10)), o10 = i10.__d), null != i10.componentDidCatch && (i10.componentDidCatch(e10, n10 || {}), o10 = i10.__d), o10) return i10.__E = i10;
        } catch (t11) {
          e10 = t11;
        }
        throw e10;
      } }, n5 = 0, id.prototype.setState = function(e10, t10) {
        var r10;
        r10 = null != this.__s && this.__s !== this.state ? this.__s : this.__s = io({}, this.state), "function" == typeof e10 && (e10 = e10(io({}, r10), this.props)), e10 && io(r10, e10), null != e10 && this.__v && (t10 && this._sb.push(t10), ih(this));
      }, id.prototype.forceUpdate = function(e10) {
        this.__v && (this.__e = true, e10 && this.__h.push(e10), ih(this));
      }, id.prototype.render = iu, n3 = [], n4 = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, n8 = function(e10, t10) {
        return e10.__v.__b - t10.__v.__b;
      }, ig.__r = 0, n9 = 0, n7 = ib(false), ie = ib(true);
      var ix = /[\s\n\\/='"\0<>]/, iA = /^(xlink|xmlns|xml)([A-Z])/, iT = /^accessK|^auto[A-Z]|^cell|^ch|^col|cont|cross|dateT|encT|form[A-Z]|frame|hrefL|inputM|maxL|minL|noV|playsI|popoverT|readO|rowS|src[A-Z]|tabI|useM|item[A-Z]/, iP = /^ac|^ali|arabic|basel|cap|clipPath$|clipRule$|color|dominant|enable|fill|flood|font|glyph[^R]|horiz|image|letter|lighting|marker[^WUH]|overline|panose|pointe|paint|rendering|shape|stop|strikethrough|stroke|text[^L]|transform|underline|unicode|units|^v[^i]|^w|^xH/, iC = /* @__PURE__ */ new Set(["draggable", "spellcheck"]), iR = /["&<]/;
      function iO(e10) {
        if (0 === e10.length || false === iR.test(e10)) return e10;
        for (var t10 = 0, r10 = 0, n10 = "", i10 = ""; r10 < e10.length; r10++) {
          switch (e10.charCodeAt(r10)) {
            case 34:
              i10 = "&quot;";
              break;
            case 38:
              i10 = "&amp;";
              break;
            case 60:
              i10 = "&lt;";
              break;
            default:
              continue;
          }
          r10 !== t10 && (n10 += e10.slice(t10, r10)), n10 += i10, t10 = r10 + 1;
        }
        return r10 !== t10 && (n10 += e10.slice(t10, r10)), n10;
      }
      var iI = {}, iU = /* @__PURE__ */ new Set(["animation-iteration-count", "border-image-outset", "border-image-slice", "border-image-width", "box-flex", "box-flex-group", "box-ordinal-group", "column-count", "fill-opacity", "flex", "flex-grow", "flex-negative", "flex-order", "flex-positive", "flex-shrink", "flood-opacity", "font-weight", "grid-column", "grid-row", "line-clamp", "line-height", "opacity", "order", "orphans", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-miterlimit", "stroke-opacity", "stroke-width", "tab-size", "widows", "z-index", "zoom"]), iN = /[A-Z]/g;
      function iL() {
        this.__d = true;
      }
      var i$, iM, ij, iD, iH = {}, iW = [], iK = Array.isArray, iB = Object.assign;
      function iJ(e10, t10) {
        var r10, n10 = e10.type, i10 = true;
        return e10.__c ? (i10 = false, (r10 = e10.__c).state = r10.__s) : r10 = new n10(e10.props, t10), e10.__c = r10, r10.__v = e10, r10.props = e10.props, r10.context = t10, r10.__d = true, null == r10.state && (r10.state = iH), null == r10.__s && (r10.__s = r10.state), n10.getDerivedStateFromProps ? r10.state = iB({}, r10.state, n10.getDerivedStateFromProps(r10.props, r10.state)) : i10 && r10.componentWillMount ? (r10.componentWillMount(), r10.state = r10.__s !== r10.state ? r10.__s : r10.state) : !i10 && r10.componentWillUpdate && r10.componentWillUpdate(), ij && ij(e10), r10.render(r10.props, r10.state, t10);
      }
      var iV = /* @__PURE__ */ new Set(["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"]), iq = 0;
      function iz(e10, t10, r10, n10, i10, a10) {
        t10 || (t10 = {});
        var o10, s2, c2 = t10;
        "ref" in t10 && (o10 = t10.ref, delete t10.ref);
        var l2 = { type: e10, props: c2, key: r10, ref: o10, __k: null, __: null, __b: 0, __e: null, __d: void 0, __c: null, constructor: void 0, __v: --iq, __i: -1, __u: 0, __source: i10, __self: a10 };
        if ("function" == typeof e10 && (o10 = e10.defaultProps)) for (s2 in o10) void 0 === c2[s2] && (c2[s2] = o10[s2]);
        return n2.vnode && n2.vnode(l2), l2;
      }
      async function iF(e10, t10) {
        let r10 = window.SimpleWebAuthnBrowser;
        async function n10(r11) {
          let n11 = new URL(`${e10}/webauthn-options/${t10}`);
          r11 && n11.searchParams.append("action", r11), a10().forEach((e11) => {
            n11.searchParams.append(e11.name, e11.value);
          });
          let i11 = await fetch(n11);
          if (!i11.ok) {
            console.error("Failed to fetch options", i11);
            return;
          }
          return i11.json();
        }
        function i10() {
          let e11 = `#${t10}-form`, r11 = document.querySelector(e11);
          if (!r11) throw Error(`Form '${e11}' not found`);
          return r11;
        }
        function a10() {
          return Array.from(i10().querySelectorAll("input[data-form-field]"));
        }
        async function o10(e11, t11) {
          let r11 = i10();
          if (e11) {
            let t12 = document.createElement("input");
            t12.type = "hidden", t12.name = "action", t12.value = e11, r11.appendChild(t12);
          }
          if (t11) {
            let e12 = document.createElement("input");
            e12.type = "hidden", e12.name = "data", e12.value = JSON.stringify(t11), r11.appendChild(e12);
          }
          return r11.submit();
        }
        async function s2(e11, t11) {
          let n11 = await r10.startAuthentication(e11, t11);
          return await o10("authenticate", n11);
        }
        async function c2(e11) {
          a10().forEach((e12) => {
            if (e12.required && !e12.value) throw Error(`Missing required field: ${e12.name}`);
          });
          let t11 = await r10.startRegistration(e11);
          return await o10("register", t11);
        }
        async function l2() {
          if (!r10.browserSupportsWebAuthnAutofill()) return;
          let e11 = await n10("authenticate");
          if (!e11) {
            console.error("Failed to fetch option for autofill authentication");
            return;
          }
          try {
            await s2(e11.options, true);
          } catch (e12) {
            console.error(e12);
          }
        }
        (async function() {
          let e11 = i10();
          if (!r10.browserSupportsWebAuthn()) {
            e11.style.display = "none";
            return;
          }
          e11 && e11.addEventListener("submit", async (e12) => {
            e12.preventDefault();
            let t11 = await n10(void 0);
            if (!t11) {
              console.error("Failed to fetch options for form submission");
              return;
            }
            if ("authenticate" === t11.action) try {
              await s2(t11.options, false);
            } catch (e13) {
              console.error(e13);
            }
            else if ("register" === t11.action) try {
              await c2(t11.options);
            } catch (e13) {
              console.error(e13);
            }
          });
        })(), l2();
      }
      let iG = { default: "Unable to sign in.", Signin: "Try signing in with a different account.", OAuthSignin: "Try signing in with a different account.", OAuthCallbackError: "Try signing in with a different account.", OAuthCreateAccount: "Try signing in with a different account.", EmailCreateAccount: "Try signing in with a different account.", Callback: "Try signing in with a different account.", OAuthAccountNotLinked: "To confirm your identity, sign in with the same account you used originally.", EmailSignin: "The e-mail could not be sent.", CredentialsSignin: "Sign in failed. Check the details you provided are correct.", SessionRequired: "Please sign in to access this page." }, iX = `:root {
  --border-width: 1px;
  --border-radius: 0.5rem;
  --color-error: #c94b4b;
  --color-info: #157efb;
  --color-info-hover: #0f6ddb;
  --color-info-text: #fff;
}

.__next-auth-theme-auto,
.__next-auth-theme-light {
  --color-background: #ececec;
  --color-background-hover: rgba(236, 236, 236, 0.8);
  --color-background-card: #fff;
  --color-text: #000;
  --color-primary: #444;
  --color-control-border: #bbb;
  --color-button-active-background: #f9f9f9;
  --color-button-active-border: #aaa;
  --color-separator: #ccc;
  --provider-bg: #fff;
  --provider-bg-hover: color-mix(
    in srgb,
    var(--provider-brand-color) 30%,
    #fff
  );
}

.__next-auth-theme-dark {
  --color-background: #161b22;
  --color-background-hover: rgba(22, 27, 34, 0.8);
  --color-background-card: #0d1117;
  --color-text: #fff;
  --color-primary: #ccc;
  --color-control-border: #555;
  --color-button-active-background: #060606;
  --color-button-active-border: #666;
  --color-separator: #444;
  --provider-bg: #161b22;
  --provider-bg-hover: color-mix(
    in srgb,
    var(--provider-brand-color) 30%,
    #000
  );
}

.__next-auth-theme-dark img[src$="42-school.svg"],
  .__next-auth-theme-dark img[src$="apple.svg"],
  .__next-auth-theme-dark img[src$="boxyhq-saml.svg"],
  .__next-auth-theme-dark img[src$="eveonline.svg"],
  .__next-auth-theme-dark img[src$="github.svg"],
  .__next-auth-theme-dark img[src$="mailchimp.svg"],
  .__next-auth-theme-dark img[src$="medium.svg"],
  .__next-auth-theme-dark img[src$="okta.svg"],
  .__next-auth-theme-dark img[src$="patreon.svg"],
  .__next-auth-theme-dark img[src$="ping-id.svg"],
  .__next-auth-theme-dark img[src$="roblox.svg"],
  .__next-auth-theme-dark img[src$="threads.svg"],
  .__next-auth-theme-dark img[src$="wikimedia.svg"] {
    filter: invert(1);
  }

.__next-auth-theme-dark #submitButton {
    background-color: var(--provider-bg, var(--color-info));
  }

@media (prefers-color-scheme: dark) {
  .__next-auth-theme-auto {
    --color-background: #161b22;
    --color-background-hover: rgba(22, 27, 34, 0.8);
    --color-background-card: #0d1117;
    --color-text: #fff;
    --color-primary: #ccc;
    --color-control-border: #555;
    --color-button-active-background: #060606;
    --color-button-active-border: #666;
    --color-separator: #444;
    --provider-bg: #161b22;
    --provider-bg-hover: color-mix(
      in srgb,
      var(--provider-brand-color) 30%,
      #000
    );
  }
    .__next-auth-theme-auto img[src$="42-school.svg"],
    .__next-auth-theme-auto img[src$="apple.svg"],
    .__next-auth-theme-auto img[src$="boxyhq-saml.svg"],
    .__next-auth-theme-auto img[src$="eveonline.svg"],
    .__next-auth-theme-auto img[src$="github.svg"],
    .__next-auth-theme-auto img[src$="mailchimp.svg"],
    .__next-auth-theme-auto img[src$="medium.svg"],
    .__next-auth-theme-auto img[src$="okta.svg"],
    .__next-auth-theme-auto img[src$="patreon.svg"],
    .__next-auth-theme-auto img[src$="ping-id.svg"],
    .__next-auth-theme-auto img[src$="roblox.svg"],
    .__next-auth-theme-auto img[src$="threads.svg"],
    .__next-auth-theme-auto img[src$="wikimedia.svg"] {
      filter: invert(1);
    }
    .__next-auth-theme-auto #submitButton {
      background-color: var(--provider-bg, var(--color-info));
    }
}

html {
  box-sizing: border-box;
}

*,
*:before,
*:after {
  box-sizing: inherit;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--color-background);
  margin: 0;
  padding: 0;
  font-family:
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    "Helvetica Neue",
    Arial,
    "Noto Sans",
    sans-serif,
    "Apple Color Emoji",
    "Segoe UI Emoji",
    "Segoe UI Symbol",
    "Noto Color Emoji";
}

h1 {
  margin-bottom: 1.5rem;
  padding: 0 1rem;
  font-weight: 400;
  color: var(--color-text);
}

p {
  margin-bottom: 1.5rem;
  padding: 0 1rem;
  color: var(--color-text);
}

form {
  margin: 0;
  padding: 0;
}

label {
  font-weight: 500;
  text-align: left;
  margin-bottom: 0.25rem;
  display: block;
  color: var(--color-text);
}

input[type] {
  box-sizing: border-box;
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  border: var(--border-width) solid var(--color-control-border);
  background: var(--color-background-card);
  font-size: 1rem;
  border-radius: var(--border-radius);
  color: var(--color-text);
}

p {
  font-size: 1.1rem;
  line-height: 2rem;
}

a.button {
  text-decoration: none;
  line-height: 1rem;
}

a.button:link,
  a.button:visited {
    background-color: var(--color-background);
    color: var(--color-primary);
  }

button,
a.button {
  padding: 0.75rem 1rem;
  color: var(--provider-color, var(--color-primary));
  background-color: var(--provider-bg, var(--color-background));
  border: 1px solid #00000031;
  font-size: 0.9rem;
  height: 50px;
  border-radius: var(--border-radius);
  transition: background-color 250ms ease-in-out;
  font-weight: 300;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

:is(button,a.button):hover {
    background-color: var(--provider-bg-hover, var(--color-background-hover));
    cursor: pointer;
  }

:is(button,a.button):active {
    cursor: pointer;
  }

:is(button,a.button) span {
    color: var(--provider-bg);
  }

#submitButton {
  color: var(--button-text-color, var(--color-info-text));
  background-color: var(--brand-color, var(--color-info));
  width: 100%;
}

#submitButton:hover {
    background-color: var(
      --button-hover-bg,
      var(--color-info-hover)
    ) !important;
  }

a.site {
  color: var(--color-primary);
  text-decoration: none;
  font-size: 1rem;
  line-height: 2rem;
}

a.site:hover {
    text-decoration: underline;
  }

.page {
  position: absolute;
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.page > div {
    text-align: center;
  }

.error a.button {
    padding-left: 2rem;
    padding-right: 2rem;
    margin-top: 0.5rem;
  }

.error .message {
    margin-bottom: 1.5rem;
  }

.signin input[type="text"] {
    margin-left: auto;
    margin-right: auto;
    display: block;
  }

.signin hr {
    display: block;
    border: 0;
    border-top: 1px solid var(--color-separator);
    margin: 2rem auto 1rem auto;
    overflow: visible;
  }

.signin hr::before {
      content: "or";
      background: var(--color-background-card);
      color: #888;
      padding: 0 0.4rem;
      position: relative;
      top: -0.7rem;
    }

.signin .error {
    background: #f5f5f5;
    font-weight: 500;
    border-radius: 0.3rem;
    background: var(--color-error);
  }

.signin .error p {
      text-align: left;
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
      line-height: 1.2rem;
      color: var(--color-info-text);
    }

.signin > div,
  .signin form {
    display: block;
  }

.signin > div input[type], .signin form input[type] {
      margin-bottom: 0.5rem;
    }

.signin > div button, .signin form button {
      width: 100%;
    }

.signin .provider + .provider {
    margin-top: 1rem;
  }

.logo {
  display: inline-block;
  max-width: 150px;
  margin: 1.25rem 0;
  max-height: 70px;
}

.card {
  background-color: var(--color-background-card);
  border-radius: 1rem;
  padding: 1.25rem 2rem;
}

.card .header {
    color: var(--color-primary);
  }

.card input[type]::-moz-placeholder {
    color: color-mix(
      in srgb,
      var(--color-text) 20%,
      var(--color-button-active-background)
    );
  }

.card input[type]::placeholder {
    color: color-mix(
      in srgb,
      var(--color-text) 20%,
      var(--color-button-active-background)
    );
  }

.card input[type] {
    background: color-mix(in srgb, var(--color-background-card) 95%, black);
  }

.section-header {
  color: var(--color-text);
}

@media screen and (min-width: 450px) {
  .card {
    margin: 2rem 0;
    width: 368px;
  }
}

@media screen and (max-width: 450px) {
  .card {
    margin: 1rem 0;
    width: 343px;
  }
}
`;
      function iY({ html: e10, title: t10, status: r10, cookies: n10, theme: i10, headTags: a10 }) {
        return { cookies: n10, status: r10, headers: { "Content-Type": "text/html" }, body: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${iX}</style><title>${t10}</title>${a10 ?? ""}</head><body class="__next-auth-theme-${i10?.colorScheme ?? "auto"}"><div class="page">${function(e11, t11, r11) {
          var n11 = n2.__s;
          n2.__s = true, i$ = n2.__b, iM = n2.diffed, ij = n2.__r, iD = n2.unmount;
          var i11 = ic(iu, null);
          i11.__k = [e11];
          try {
            var a11 = function e12(t12, r12, n12, i12, a12, o10, s2) {
              if (null == t12 || true === t12 || false === t12 || "" === t12) return "";
              var c2 = typeof t12;
              if ("object" != c2) return "function" == c2 ? "" : "string" == c2 ? iO(t12) : t12 + "";
              if (iK(t12)) {
                var l2, u2 = "";
                a12.__k = t12;
                for (var d2 = 0; d2 < t12.length; d2++) {
                  var p2 = t12[d2];
                  if (null != p2 && "boolean" != typeof p2) {
                    var h2, f2 = e12(p2, r12, n12, i12, a12, o10, s2);
                    "string" == typeof f2 ? u2 += f2 : (l2 || (l2 = []), u2 && l2.push(u2), u2 = "", iK(f2) ? (h2 = l2).push.apply(h2, f2) : l2.push(f2));
                  }
                }
                return l2 ? (u2 && l2.push(u2), l2) : u2;
              }
              if (void 0 !== t12.constructor) return "";
              t12.__ = a12, i$ && i$(t12);
              var g2 = t12.type, m2 = t12.props;
              if ("function" == typeof g2) {
                var y2, w2, b2, v2 = r12;
                if (g2 === iu) {
                  if ("tpl" in m2) {
                    for (var _2 = "", S2 = 0; S2 < m2.tpl.length; S2++) if (_2 += m2.tpl[S2], m2.exprs && S2 < m2.exprs.length) {
                      var k2 = m2.exprs[S2];
                      if (null == k2) continue;
                      "object" == typeof k2 && (void 0 === k2.constructor || iK(k2)) ? _2 += e12(k2, r12, n12, i12, t12, o10, s2) : _2 += k2;
                    }
                    return _2;
                  }
                  if ("UNSTABLE_comment" in m2) return "<!--" + iO(m2.UNSTABLE_comment) + "-->";
                  w2 = m2.children;
                } else {
                  if (null != (y2 = g2.contextType)) {
                    var E2 = r12[y2.__c];
                    v2 = E2 ? E2.props.value : y2.__;
                  }
                  var x2 = g2.prototype && "function" == typeof g2.prototype.render;
                  if (x2) w2 = iJ(t12, v2), b2 = t12.__c;
                  else {
                    t12.__c = b2 = { __v: t12, context: v2, props: t12.props, setState: iL, forceUpdate: iL, __d: true, __h: [] };
                    for (var A2 = 0; b2.__d && A2++ < 25; ) b2.__d = false, ij && ij(t12), w2 = g2.call(b2, m2, v2);
                    b2.__d = true;
                  }
                  if (null != b2.getChildContext && (r12 = iB({}, r12, b2.getChildContext())), x2 && n2.errorBoundaries && (g2.getDerivedStateFromError || b2.componentDidCatch)) {
                    w2 = null != w2 && w2.type === iu && null == w2.key && null == w2.props.tpl ? w2.props.children : w2;
                    try {
                      return e12(w2, r12, n12, i12, t12, o10, s2);
                    } catch (a13) {
                      return g2.getDerivedStateFromError && (b2.__s = g2.getDerivedStateFromError(a13)), b2.componentDidCatch && b2.componentDidCatch(a13, iH), b2.__d ? (w2 = iJ(t12, r12), null != (b2 = t12.__c).getChildContext && (r12 = iB({}, r12, b2.getChildContext())), e12(w2 = null != w2 && w2.type === iu && null == w2.key && null == w2.props.tpl ? w2.props.children : w2, r12, n12, i12, t12, o10, s2)) : "";
                    } finally {
                      iM && iM(t12), t12.__ = null, iD && iD(t12);
                    }
                  }
                }
                w2 = null != w2 && w2.type === iu && null == w2.key && null == w2.props.tpl ? w2.props.children : w2;
                try {
                  var T2 = e12(w2, r12, n12, i12, t12, o10, s2);
                  return iM && iM(t12), t12.__ = null, n2.unmount && n2.unmount(t12), T2;
                } catch (a13) {
                  if (!o10 && s2 && s2.onError) {
                    var P2 = s2.onError(a13, t12, function(a14) {
                      return e12(a14, r12, n12, i12, t12, o10, s2);
                    });
                    if (void 0 !== P2) return P2;
                    var C2 = n2.__e;
                    return C2 && C2(a13, t12), "";
                  }
                  if (!o10 || !a13 || "function" != typeof a13.then) throw a13;
                  return a13.then(function a14() {
                    try {
                      return e12(w2, r12, n12, i12, t12, o10, s2);
                    } catch (c3) {
                      if (!c3 || "function" != typeof c3.then) throw c3;
                      return c3.then(function() {
                        return e12(w2, r12, n12, i12, t12, o10, s2);
                      }, a14);
                    }
                  });
                }
              }
              var R2, O2 = "<" + g2, I2 = "";
              for (var U2 in m2) {
                var N2 = m2[U2];
                if ("function" != typeof N2 || "class" === U2 || "className" === U2) {
                  switch (U2) {
                    case "children":
                      R2 = N2;
                      continue;
                    case "key":
                    case "ref":
                    case "__self":
                    case "__source":
                      continue;
                    case "htmlFor":
                      if ("for" in m2) continue;
                      U2 = "for";
                      break;
                    case "className":
                      if ("class" in m2) continue;
                      U2 = "class";
                      break;
                    case "defaultChecked":
                      U2 = "checked";
                      break;
                    case "defaultSelected":
                      U2 = "selected";
                      break;
                    case "defaultValue":
                    case "value":
                      switch (U2 = "value", g2) {
                        case "textarea":
                          R2 = N2;
                          continue;
                        case "select":
                          i12 = N2;
                          continue;
                        case "option":
                          i12 != N2 || "selected" in m2 || (O2 += " selected");
                      }
                      break;
                    case "dangerouslySetInnerHTML":
                      I2 = N2 && N2.__html;
                      continue;
                    case "style":
                      "object" == typeof N2 && (N2 = function(e13) {
                        var t13 = "";
                        for (var r13 in e13) {
                          var n13 = e13[r13];
                          if (null != n13 && "" !== n13) {
                            var i13 = "-" == r13[0] ? r13 : iI[r13] || (iI[r13] = r13.replace(iN, "-$&").toLowerCase()), a13 = ";";
                            "number" != typeof n13 || i13.startsWith("--") || iU.has(i13) || (a13 = "px;"), t13 = t13 + i13 + ":" + n13 + a13;
                          }
                        }
                        return t13 || void 0;
                      }(N2));
                      break;
                    case "acceptCharset":
                      U2 = "accept-charset";
                      break;
                    case "httpEquiv":
                      U2 = "http-equiv";
                      break;
                    default:
                      if (iA.test(U2)) U2 = U2.replace(iA, "$1:$2").toLowerCase();
                      else {
                        if (ix.test(U2)) continue;
                        ("-" === U2[4] || iC.has(U2)) && null != N2 ? N2 += "" : n12 ? iP.test(U2) && (U2 = "panose1" === U2 ? "panose-1" : U2.replace(/([A-Z])/g, "-$1").toLowerCase()) : iT.test(U2) && (U2 = U2.toLowerCase());
                      }
                  }
                  null != N2 && false !== N2 && (O2 = true === N2 || "" === N2 ? O2 + " " + U2 : O2 + " " + U2 + '="' + ("string" == typeof N2 ? iO(N2) : N2 + "") + '"');
                }
              }
              if (ix.test(g2)) throw Error(g2 + " is not a valid HTML tag name in " + O2 + ">");
              if (I2 || ("string" == typeof R2 ? I2 = iO(R2) : null != R2 && false !== R2 && true !== R2 && (I2 = e12(R2, r12, "svg" === g2 || "foreignObject" !== g2 && n12, i12, t12, o10, s2))), iM && iM(t12), t12.__ = null, iD && iD(t12), !I2 && iV.has(g2)) return O2 + "/>";
              var L2 = "</" + g2 + ">", $2 = O2 + ">";
              return iK(I2) ? [$2].concat(I2, [L2]) : "string" != typeof I2 ? [$2, I2, L2] : $2 + I2 + L2;
            }(e11, iH, false, void 0, i11, false, void 0);
            return iK(a11) ? a11.join("") : a11;
          } catch (e12) {
            if (e12.then) throw Error('Use "renderToStringAsync" for suspenseful rendering.');
            throw e12;
          } finally {
            n2.__c && n2.__c(e11, iW), n2.__s = n11, iW.length = 0;
          }
        }(e10)}</div></body></html>` };
      }
      function iZ(e10) {
        let { url: t10, theme: r10, query: n10, cookies: i10, pages: a10, providers: o10 } = e10;
        return { csrf: (e11, t11, r11) => e11 ? (t11.logger.warn("csrf-disabled"), r11.push({ name: t11.cookies.csrfToken.name, value: "", options: { ...t11.cookies.csrfToken.options, maxAge: 0 } }), { status: 404, cookies: r11 }) : { headers: { "Content-Type": "application/json", "Cache-Control": "private, no-cache, no-store", Expires: "0", Pragma: "no-cache" }, body: { csrfToken: t11.csrfToken }, cookies: r11 }, providers: (e11) => ({ headers: { "Content-Type": "application/json" }, body: e11.reduce((e12, { id: t11, name: r11, type: n11, signinUrl: i11, callbackUrl: a11 }) => (e12[t11] = { id: t11, name: r11, type: n11, signinUrl: i11, callbackUrl: a11 }, e12), {}) }), signin(t11, s2) {
          if (t11) throw new e8("Unsupported action");
          if (a10?.signIn) {
            let t12 = `${a10.signIn}${a10.signIn.includes("?") ? "&" : "?"}${new URLSearchParams({ callbackUrl: e10.callbackUrl ?? "/" })}`;
            return s2 && (t12 = `${t12}&${new URLSearchParams({ error: s2 })}`), { redirect: t12, cookies: i10 };
          }
          let c2 = o10?.find((e11) => "webauthn" === e11.type && e11.enableConditionalUI && !!e11.simpleWebAuthnBrowserVersion), l2 = "";
          if (c2) {
            let { simpleWebAuthnBrowserVersion: e11 } = c2;
            l2 = `<script src="https://unpkg.com/@simplewebauthn/browser@${e11}/dist/bundle/index.umd.min.js" crossorigin="anonymous"></script>`;
          }
          return iY({ cookies: i10, theme: r10, html: function(e11) {
            let { csrfToken: t12, providers: r11 = [], callbackUrl: n11, theme: i11, email: a11, error: o11 } = e11;
            "undefined" != typeof document && i11?.brandColor && document.documentElement.style.setProperty("--brand-color", i11.brandColor), "undefined" != typeof document && i11?.buttonText && document.documentElement.style.setProperty("--button-text-color", i11.buttonText);
            let s3 = o11 && (iG[o11] ?? iG.default), c3 = r11.find((e12) => "webauthn" === e12.type && e12.enableConditionalUI)?.id;
            return iz("div", { className: "signin", children: [i11?.brandColor && iz("style", { dangerouslySetInnerHTML: { __html: `:root {--brand-color: ${i11.brandColor}}` } }), i11?.buttonText && iz("style", { dangerouslySetInnerHTML: { __html: `
        :root {
          --button-text-color: ${i11.buttonText}
        }
      ` } }), iz("div", { className: "card", children: [s3 && iz("div", { className: "error", children: iz("p", { children: s3 }) }), i11?.logo && iz("img", { src: i11.logo, alt: "Logo", className: "logo" }), r11.map((e12, i12) => {
              let o12, s4, c4;
              ("oauth" === e12.type || "oidc" === e12.type) && ({ bg: o12 = "#fff", brandColor: s4, logo: c4 = `https://authjs.dev/img/providers/${e12.id}.svg` } = e12.style ?? {});
              let l3 = s4 ?? o12 ?? "#fff";
              return iz("div", { className: "provider", children: ["oauth" === e12.type || "oidc" === e12.type ? iz("form", { action: e12.signinUrl, method: "POST", children: [iz("input", { type: "hidden", name: "csrfToken", value: t12 }), n11 && iz("input", { type: "hidden", name: "callbackUrl", value: n11 }), iz("button", { type: "submit", className: "button", style: { "--provider-brand-color": l3 }, tabIndex: 0, children: [iz("span", { style: { filter: "invert(1) grayscale(1) brightness(1.3) contrast(9000)", "mix-blend-mode": "luminosity", opacity: 0.95 }, children: ["Sign in with ", e12.name] }), c4 && iz("img", { loading: "lazy", height: 24, src: c4 })] })] }) : null, ("email" === e12.type || "credentials" === e12.type || "webauthn" === e12.type) && i12 > 0 && "email" !== r11[i12 - 1].type && "credentials" !== r11[i12 - 1].type && "webauthn" !== r11[i12 - 1].type && iz("hr", {}), "email" === e12.type && iz("form", { action: e12.signinUrl, method: "POST", children: [iz("input", { type: "hidden", name: "csrfToken", value: t12 }), iz("label", { className: "section-header", htmlFor: `input-email-for-${e12.id}-provider`, children: "Email" }), iz("input", { id: `input-email-for-${e12.id}-provider`, autoFocus: true, type: "email", name: "email", value: a11, placeholder: "email@example.com", required: true }), iz("button", { id: "submitButton", type: "submit", tabIndex: 0, children: ["Sign in with ", e12.name] })] }), "credentials" === e12.type && iz("form", { action: e12.callbackUrl, method: "POST", children: [iz("input", { type: "hidden", name: "csrfToken", value: t12 }), Object.keys(e12.credentials).map((t13) => iz("div", { children: [iz("label", { className: "section-header", htmlFor: `input-${t13}-for-${e12.id}-provider`, children: e12.credentials[t13].label ?? t13 }), iz("input", { name: t13, id: `input-${t13}-for-${e12.id}-provider`, type: e12.credentials[t13].type ?? "text", placeholder: e12.credentials[t13].placeholder ?? "", ...e12.credentials[t13] })] }, `input-group-${e12.id}`)), iz("button", { id: "submitButton", type: "submit", tabIndex: 0, children: ["Sign in with ", e12.name] })] }), "webauthn" === e12.type && iz("form", { action: e12.callbackUrl, method: "POST", id: `${e12.id}-form`, children: [iz("input", { type: "hidden", name: "csrfToken", value: t12 }), Object.keys(e12.formFields).map((t13) => iz("div", { children: [iz("label", { className: "section-header", htmlFor: `input-${t13}-for-${e12.id}-provider`, children: e12.formFields[t13].label ?? t13 }), iz("input", { name: t13, "data-form-field": true, id: `input-${t13}-for-${e12.id}-provider`, type: e12.formFields[t13].type ?? "text", placeholder: e12.formFields[t13].placeholder ?? "", ...e12.formFields[t13] })] }, `input-group-${e12.id}`)), iz("button", { id: `submitButton-${e12.id}`, type: "submit", tabIndex: 0, children: ["Sign in with ", e12.name] })] }), ("email" === e12.type || "credentials" === e12.type || "webauthn" === e12.type) && i12 + 1 < r11.length && iz("hr", {})] }, e12.id);
            })] }), c3 && iz(iu, { children: iz("script", { dangerouslySetInnerHTML: { __html: `
const currentURL = window.location.href;
const authURL = currentURL.substring(0, currentURL.lastIndexOf('/'));
(${iF})(authURL, "${c3}");
` } }) })] });
          }({ csrfToken: e10.csrfToken, providers: e10.providers?.filter((e11) => ["email", "oauth", "oidc"].includes(e11.type) || "credentials" === e11.type && e11.credentials || "webauthn" === e11.type && e11.formFields || false), callbackUrl: e10.callbackUrl, theme: e10.theme, error: s2, ...n10 }), title: "Sign In", headTags: l2 });
        }, signout: () => a10?.signOut ? { redirect: a10.signOut, cookies: i10 } : iY({ cookies: i10, theme: r10, html: function(e11) {
          let { url: t11, csrfToken: r11, theme: n11 } = e11;
          return iz("div", { className: "signout", children: [n11?.brandColor && iz("style", { dangerouslySetInnerHTML: { __html: `
        :root {
          --brand-color: ${n11.brandColor}
        }
      ` } }), n11?.buttonText && iz("style", { dangerouslySetInnerHTML: { __html: `
        :root {
          --button-text-color: ${n11.buttonText}
        }
      ` } }), iz("div", { className: "card", children: [n11?.logo && iz("img", { src: n11.logo, alt: "Logo", className: "logo" }), iz("h1", { children: "Signout" }), iz("p", { children: "Are you sure you want to sign out?" }), iz("form", { action: t11?.toString(), method: "POST", children: [iz("input", { type: "hidden", name: "csrfToken", value: r11 }), iz("button", { id: "submitButton", type: "submit", children: "Sign out" })] })] })] });
        }({ csrfToken: e10.csrfToken, url: t10, theme: r10 }), title: "Sign Out" }), verifyRequest: (e11) => a10?.verifyRequest ? { redirect: `${a10.verifyRequest}${t10?.search ?? ""}`, cookies: i10 } : iY({ cookies: i10, theme: r10, html: function(e12) {
          let { url: t11, theme: r11 } = e12;
          return iz("div", { className: "verify-request", children: [r11.brandColor && iz("style", { dangerouslySetInnerHTML: { __html: `
        :root {
          --brand-color: ${r11.brandColor}
        }
      ` } }), iz("div", { className: "card", children: [r11.logo && iz("img", { src: r11.logo, alt: "Logo", className: "logo" }), iz("h1", { children: "Check your email" }), iz("p", { children: "A sign in link has been sent to your email address." }), iz("p", { children: iz("a", { className: "site", href: t11.origin, children: t11.host }) })] })] });
        }({ url: t10, theme: r10, ...e11 }), title: "Verify Request" }), error: (e11) => a10?.error ? { redirect: `${a10.error}${a10.error.includes("?") ? "&" : "?"}error=${e11}`, cookies: i10 } : iY({ cookies: i10, theme: r10, ...function(e12) {
          let { url: t11, error: r11 = "default", theme: n11 } = e12, i11 = `${t11}/signin`, a11 = { default: { status: 200, heading: "Error", message: iz("p", { children: iz("a", { className: "site", href: t11?.origin, children: t11?.host }) }) }, Configuration: { status: 500, heading: "Server error", message: iz("div", { children: [iz("p", { children: "There is a problem with the server configuration." }), iz("p", { children: "Check the server logs for more information." })] }) }, AccessDenied: { status: 403, heading: "Access Denied", message: iz("div", { children: [iz("p", { children: "You do not have permission to sign in." }), iz("p", { children: iz("a", { className: "button", href: i11, children: "Sign in" }) })] }) }, Verification: { status: 403, heading: "Unable to sign in", message: iz("div", { children: [iz("p", { children: "The sign in link is no longer valid." }), iz("p", { children: "It may have been used already or it may have expired." })] }), signin: iz("a", { className: "button", href: i11, children: "Sign in" }) } }, { status: o11, heading: s2, message: c2, signin: l2 } = a11[r11] ?? a11.default;
          return { status: o11, html: iz("div", { className: "error", children: [n11?.brandColor && iz("style", { dangerouslySetInnerHTML: { __html: `
        :root {
          --brand-color: ${n11?.brandColor}
        }
      ` } }), iz("div", { className: "card", children: [n11?.logo && iz("img", { src: n11?.logo, alt: "Logo", className: "logo" }), iz("h1", { children: s2 }), iz("div", { className: "message", children: c2 }), l2] })] }) };
        }({ url: t10, theme: r10, error: e11 }), title: "Error" }) };
      }
      function iQ(e10, t10 = Date.now()) {
        return new Date(t10 + 1e3 * e10);
      }
      async function i0(e10, t10, r10, n10) {
        if (!r10?.providerAccountId || !r10.type) throw Error("Missing or invalid provider account");
        if (!["email", "oauth", "oidc", "webauthn"].includes(r10.type)) throw Error("Provider not supported");
        let { adapter: i10, jwt: a10, events: o10, session: { strategy: s2, generateSessionToken: c2 } } = n10;
        if (!i10) return { user: t10, account: r10 };
        let l2 = r10, { createUser: u2, updateUser: d2, getUser: p2, getUserByAccount: h2, getUserByEmail: f2, linkAccount: g2, createSession: m2, getSessionAndUser: y2, deleteSession: w2 } = i10, b2 = null, v2 = null, _2 = false, S2 = "jwt" === s2;
        if (e10) {
          if (S2) try {
            let t11 = n10.cookies.sessionToken.name;
            (b2 = await a10.decode({ ...a10, token: e10, salt: t11 })) && "sub" in b2 && b2.sub && (v2 = await p2(b2.sub));
          } catch {
          }
          else {
            let t11 = await y2(e10);
            t11 && (b2 = t11.session, v2 = t11.user);
          }
        }
        if ("email" === l2.type) {
          let r11 = await f2(t10.email);
          return r11 ? (v2?.id !== r11.id && !S2 && e10 && await w2(e10), v2 = await d2({ id: r11.id, emailVerified: /* @__PURE__ */ new Date() }), await o10.updateUser?.({ user: v2 })) : (v2 = await u2({ ...t10, emailVerified: /* @__PURE__ */ new Date() }), await o10.createUser?.({ user: v2 }), _2 = true), { session: b2 = S2 ? {} : await m2({ sessionToken: c2(), userId: v2.id, expires: iQ(n10.session.maxAge) }), user: v2, isNewUser: _2 };
        }
        if ("webauthn" === l2.type) {
          let e11 = await h2({ providerAccountId: l2.providerAccountId, provider: l2.provider });
          if (e11) {
            if (v2) {
              if (e11.id === v2.id) {
                let e12 = { ...l2, userId: v2.id };
                return { session: b2, user: v2, isNewUser: _2, account: e12 };
              }
              throw new ts("The account is already associated with another user", { provider: l2.provider });
            }
            b2 = S2 ? {} : await m2({ sessionToken: c2(), userId: e11.id, expires: iQ(n10.session.maxAge) });
            let t11 = { ...l2, userId: e11.id };
            return { session: b2, user: e11, isNewUser: _2, account: t11 };
          }
          {
            if (v2) {
              await g2({ ...l2, userId: v2.id }), await o10.linkAccount?.({ user: v2, account: l2, profile: t10 });
              let e13 = { ...l2, userId: v2.id };
              return { session: b2, user: v2, isNewUser: _2, account: e13 };
            }
            if (t10.email ? await f2(t10.email) : null) throw new ts("Another account already exists with the same e-mail address", { provider: l2.provider });
            v2 = await u2({ ...t10 }), await o10.createUser?.({ user: v2 }), await g2({ ...l2, userId: v2.id }), await o10.linkAccount?.({ user: v2, account: l2, profile: t10 }), b2 = S2 ? {} : await m2({ sessionToken: c2(), userId: v2.id, expires: iQ(n10.session.maxAge) });
            let e12 = { ...l2, userId: v2.id };
            return { session: b2, user: v2, isNewUser: true, account: e12 };
          }
        }
        let k2 = await h2({ providerAccountId: l2.providerAccountId, provider: l2.provider });
        if (k2) {
          if (v2) {
            if (k2.id === v2.id) return { session: b2, user: v2, isNewUser: _2 };
            throw new e0("The account is already associated with another user", { provider: l2.provider });
          }
          return { session: b2 = S2 ? {} : await m2({ sessionToken: c2(), userId: k2.id, expires: iQ(n10.session.maxAge) }), user: k2, isNewUser: _2 };
        }
        {
          let { provider: e11 } = n10, { type: r11, provider: i11, providerAccountId: a11, userId: s3, ...d3 } = l2;
          if (l2 = Object.assign(e11.account(d3) ?? {}, { providerAccountId: a11, provider: i11, type: r11, userId: s3 }), v2) return await g2({ ...l2, userId: v2.id }), await o10.linkAccount?.({ user: v2, account: l2, profile: t10 }), { session: b2, user: v2, isNewUser: _2 };
          let p3 = t10.email ? await f2(t10.email) : null;
          if (p3) {
            let e12 = n10.provider;
            if (e12?.allowDangerousEmailAccountLinking) v2 = p3, _2 = false;
            else throw new e0("Another account already exists with the same e-mail address", { provider: l2.provider });
          } else v2 = await u2({ ...t10, emailVerified: null }), _2 = true;
          return await o10.createUser?.({ user: v2 }), await g2({ ...l2, userId: v2.id }), await o10.linkAccount?.({ user: v2, account: l2, profile: t10 }), { session: b2 = S2 ? {} : await m2({ sessionToken: c2(), userId: v2.id, expires: iQ(n10.session.maxAge) }), user: v2, isNewUser: _2 };
        }
      }
      function i1(e10, t10) {
        if (null == e10) return false;
        try {
          return e10 instanceof t10 || Object.getPrototypeOf(e10)[Symbol.toStringTag] === t10.prototype[Symbol.toStringTag];
        } catch {
          return false;
        }
      }
      "undefined" != typeof navigator && navigator.userAgent?.startsWith?.("Mozilla/5.0 ") || (a = "oauth4webapi/v3.8.3");
      let i2 = "ERR_INVALID_ARG_VALUE", i5 = "ERR_INVALID_ARG_TYPE";
      function i3(e10, t10, r10) {
        let n10 = TypeError(e10, { cause: r10 });
        return Object.assign(n10, { code: t10 }), n10;
      }
      let i6 = Symbol(), i4 = Symbol(), i8 = Symbol(), i9 = Symbol(), i7 = Symbol(), ae = Symbol(), at = Symbol(), ar = new TextEncoder(), an = new TextDecoder();
      function ai(e10) {
        return "string" == typeof e10 ? ar.encode(e10) : an.decode(e10);
      }
      function aa(e10) {
        return "string" == typeof e10 ? s(e10) : o(e10);
      }
      Uint8Array.prototype.toBase64 ? o = (e10) => (e10 instanceof ArrayBuffer && (e10 = new Uint8Array(e10)), e10.toBase64({ alphabet: "base64url", omitPadding: true })) : o = (e10) => {
        e10 instanceof ArrayBuffer && (e10 = new Uint8Array(e10));
        let t10 = [];
        for (let r10 = 0; r10 < e10.byteLength; r10 += 32768) t10.push(String.fromCharCode.apply(null, e10.subarray(r10, r10 + 32768)));
        return btoa(t10.join("")).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
      }, Uint8Array.fromBase64 ? s = (e10) => {
        try {
          return Uint8Array.fromBase64(e10, { alphabet: "base64url" });
        } catch (e11) {
          throw i3("The input to be decoded is not correctly encoded.", i2, e11);
        }
      } : s = (e10) => {
        try {
          let t10 = atob(e10.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "")), r10 = new Uint8Array(t10.length);
          for (let e11 = 0; e11 < t10.length; e11++) r10[e11] = t10.charCodeAt(e11);
          return r10;
        } catch (e11) {
          throw i3("The input to be decoded is not correctly encoded.", i2, e11);
        }
      };
      class ao extends Error {
        code;
        constructor(e10, t10) {
          super(e10, t10), this.name = this.constructor.name, this.code = od, Error.captureStackTrace?.(this, this.constructor);
        }
      }
      class as extends Error {
        code;
        constructor(e10, t10) {
          super(e10, t10), this.name = this.constructor.name, t10?.code && (this.code = t10?.code), Error.captureStackTrace?.(this, this.constructor);
        }
      }
      function ac(e10, t10, r10) {
        return new as(e10, { code: t10, cause: r10 });
      }
      function al(e10) {
        return !(null === e10 || "object" != typeof e10 || Array.isArray(e10));
      }
      function au(e10) {
        i1(e10, Headers) && (e10 = Object.fromEntries(e10.entries()));
        let t10 = new Headers(e10 ?? {});
        if (a && !t10.has("user-agent") && t10.set("user-agent", a), t10.has("authorization")) throw i3('"options.headers" must not include the "authorization" header name', i2);
        return t10;
      }
      function ad(e10, t10) {
        if (void 0 !== t10) {
          if ("function" == typeof t10 && (t10 = t10(e10.href)), !(t10 instanceof AbortSignal)) throw i3('"options.signal" must return or be an instance of AbortSignal', i5);
          return t10;
        }
      }
      function ap(e10) {
        return e10.includes("//") ? e10.replace("//", "/") : e10;
      }
      async function ah(e10, t10, r10, n10) {
        if (!(e10 instanceof URL)) throw i3(`"${t10}" must be an instance of URL`, i5);
        aO(e10, n10?.[i6] !== true);
        let i10 = r10(new URL(e10.href)), a10 = au(n10?.headers);
        return a10.set("accept", "application/json"), (n10?.[i9] || fetch)(i10.href, { body: void 0, headers: Object.fromEntries(a10.entries()), method: "GET", redirect: "manual", signal: ad(i10, n10?.signal) });
      }
      async function af(e10, t10) {
        return ah(e10, "issuerIdentifier", (e11) => {
          switch (t10?.algorithm) {
            case void 0:
            case "oidc":
              e11.pathname = ap(`${e11.pathname}/.well-known/openid-configuration`);
              break;
            case "oauth2":
              !function(e12, t11, r10 = false) {
                "/" === e12.pathname ? e12.pathname = t11 : e12.pathname = ap(`${t11}/${r10 ? e12.pathname : e12.pathname.replace(/(\/)$/, "")}`);
              }(e11, ".well-known/oauth-authorization-server");
              break;
            default:
              throw i3('"options.algorithm" must be "oidc" (default), or "oauth2"', i2);
          }
          return e11;
        }, t10);
      }
      function ag(e10, t10, r10, n10, i10) {
        try {
          if ("number" != typeof e10 || !Number.isFinite(e10)) throw i3(`${r10} must be a number`, i5, i10);
          if (e10 > 0) return;
          if (t10) {
            if (0 !== e10) throw i3(`${r10} must be a non-negative number`, i2, i10);
            return;
          }
          throw i3(`${r10} must be a positive number`, i2, i10);
        } catch (e11) {
          if (n10) throw ac(e11.message, n10, i10);
          throw e11;
        }
      }
      function am(e10, t10, r10, n10) {
        try {
          if ("string" != typeof e10) throw i3(`${t10} must be a string`, i5, n10);
          if (0 === e10.length) throw i3(`${t10} must not be empty`, i2, n10);
        } catch (e11) {
          if (r10) throw ac(e11.message, r10, n10);
          throw e11;
        }
      }
      async function ay(e10, t10) {
        if (!(e10 instanceof URL) && e10 !== oH) throw i3('"expectedIssuerIdentifier" must be an instance of URL', i5);
        if (!i1(t10, Response)) throw i3('"response" must be an instance of Response', i5);
        if (200 !== t10.status) throw ac('"response" is not a conform Authorization Server Metadata response (unexpected HTTP status code)', oy, t10);
        oA(t10);
        let r10 = await oD(t10);
        if (am(r10.issuer, '"response" body "issuer" property', og, { body: r10 }), e10 !== oH && new URL(r10.issuer).href !== e10.href) throw ac('"response" body "issuer" property does not match the expected value', oS, { expected: e10.href, body: r10, attribute: "issuer" });
        return r10;
      }
      function aw(e10) {
        !function(e11, t10) {
          if (aX(e11) !== t10) throw ab(e11, t10);
        }(e10, "application/json");
      }
      function ab(e10, ...t10) {
        let r10 = '"response" content-type must be ';
        if (t10.length > 2) {
          let e11 = t10.pop();
          r10 += `${t10.join(", ")}, or ${e11}`;
        } else 2 === t10.length ? r10 += `${t10[0]} or ${t10[1]}` : r10 += t10[0];
        return ac(r10, om, e10);
      }
      function av() {
        return aa(crypto.getRandomValues(new Uint8Array(32)));
      }
      async function a_(e10) {
        return am(e10, "codeVerifier"), aa(await crypto.subtle.digest("SHA-256", ai(e10)));
      }
      function aS(e10) {
        let t10 = e10?.[i4];
        return "number" == typeof t10 && Number.isFinite(t10) ? t10 : 0;
      }
      function ak(e10) {
        let t10 = e10?.[i8];
        return "number" == typeof t10 && Number.isFinite(t10) && -1 !== Math.sign(t10) ? t10 : 30;
      }
      function aE() {
        return Math.floor(Date.now() / 1e3);
      }
      function ax(e10) {
        if ("object" != typeof e10 || null === e10) throw i3('"as" must be an object', i5);
        am(e10.issuer, '"as.issuer"');
      }
      function aA(e10) {
        if ("object" != typeof e10 || null === e10) throw i3('"client" must be an object', i5);
        am(e10.client_id, '"client.client_id"');
      }
      function aT(e10, t10) {
        let r10 = aE() + aS(t10);
        return { jti: av(), aud: e10.issuer, exp: r10 + 60, iat: r10, nbf: r10, iss: t10.client_id, sub: t10.client_id };
      }
      async function aP(e10, t10, r10) {
        if (!r10.usages.includes("sign")) throw i3('CryptoKey instances used for signing assertions must include "sign" in their "usages"', i2);
        let n10 = `${aa(ai(JSON.stringify(e10)))}.${aa(ai(JSON.stringify(t10)))}`, i10 = aa(await crypto.subtle.sign(oR(r10), r10, ai(n10)));
        return `${n10}.${i10}`;
      }
      async function aC(e10, t10) {
        let { kty: r10, e: n10, n: i10, x: a10, y: o10, crv: s2, pub: l2 } = await crypto.subtle.exportKey("jwk", e10), u2 = { kty: r10, e: n10, n: i10, x: a10, y: o10, crv: s2, pub: l2 };
        return "AKP" === r10 && (u2.alg = t10), c.set(e10, u2), u2;
      }
      let aR = URL.parse ? (e10, t10) => URL.parse(e10, t10) : (e10, t10) => {
        try {
          return new URL(e10, t10);
        } catch {
          return null;
        }
      };
      function aO(e10, t10) {
        if (t10 && "https:" !== e10.protocol) throw ac("only requests to HTTPS are allowed", ow, e10);
        if ("https:" !== e10.protocol && "http:" !== e10.protocol) throw ac("only HTTP and HTTPS requests are allowed", ob, e10);
      }
      function aI(e10, t10, r10, n10) {
        let i10;
        if ("string" != typeof e10 || !(i10 = aR(e10))) throw ac(`authorization server metadata does not contain a valid ${r10 ? `"as.mtls_endpoint_aliases.${t10}"` : `"as.${t10}"`}`, void 0 === e10 ? oE : ox, { attribute: r10 ? `mtls_endpoint_aliases.${t10}` : t10 });
        return aO(i10, n10), i10;
      }
      function aU(e10, t10, r10, n10) {
        return r10 && e10.mtls_endpoint_aliases && t10 in e10.mtls_endpoint_aliases ? aI(e10.mtls_endpoint_aliases[t10], t10, r10, n10) : aI(e10[t10], t10, r10, n10);
      }
      class aN extends Error {
        cause;
        code;
        error;
        status;
        error_description;
        response;
        constructor(e10, t10) {
          super(e10, t10), this.name = this.constructor.name, this.code = ou, this.cause = t10.cause, this.error = t10.cause.error, this.status = t10.response.status, this.error_description = t10.cause.error_description, Object.defineProperty(this, "response", { enumerable: false, value: t10.response }), Error.captureStackTrace?.(this, this.constructor);
        }
      }
      class aL extends Error {
        cause;
        code;
        error;
        error_description;
        constructor(e10, t10) {
          super(e10, t10), this.name = this.constructor.name, this.code = op, this.cause = t10.cause, this.error = t10.cause.get("error"), this.error_description = t10.cause.get("error_description") ?? void 0, Error.captureStackTrace?.(this, this.constructor);
        }
      }
      class a$ extends Error {
        cause;
        code;
        response;
        status;
        constructor(e10, t10) {
          super(e10, t10), this.name = this.constructor.name, this.code = ol, this.cause = t10.cause, this.status = t10.response.status, this.response = t10.response, Object.defineProperty(this, "response", { enumerable: false }), Error.captureStackTrace?.(this, this.constructor);
        }
      }
      let aM = "[a-zA-Z0-9!#$%&\\'\\*\\+\\-\\.\\^_`\\|~]+", aj = RegExp("^[,\\s]*(" + aM + ")"), aD = RegExp("^[,\\s]*(" + aM + ')\\s*=\\s*"((?:[^"\\\\]|\\\\[\\s\\S])*)"[,\\s]*(.*)'), aH = RegExp("^[,\\s]*(" + aM + ")\\s*=\\s*(" + aM + ")[,\\s]*(.*)"), aW = RegExp("^([a-zA-Z0-9\\-\\._\\~\\+\\/]+={0,2})(?:$|[,\\s])(.*)");
      async function aK(e10) {
        if (e10.status > 399 && e10.status < 500) {
          oA(e10), aw(e10);
          try {
            let t10 = await e10.clone().json();
            if (al(t10) && "string" == typeof t10.error && t10.error.length) return t10;
          } catch {
          }
        }
      }
      async function aB(e10, t10, r10) {
        if (e10.status !== t10) {
          let t11;
          if (a3(e10), t11 = await aK(e10)) throw await e10.body?.cancel(), new aN("server responded with an error in the response body", { cause: t11, response: e10 });
          throw ac(`"response" is not a conform ${r10} response (unexpected HTTP status code)`, oy, e10);
        }
      }
      function aJ(e10) {
        if (!a7.has(e10)) throw i3('"options.DPoP" is not a valid DPoPHandle', i2);
      }
      async function aV(e10, t10, r10, n10, i10, a10) {
        if (am(e10, '"accessToken"'), !(r10 instanceof URL)) throw i3('"url" must be an instance of URL', i5);
        aO(r10, a10?.[i6] !== true), n10 = au(n10), a10?.DPoP && (aJ(a10.DPoP), await a10.DPoP.addProof(r10, n10, t10.toUpperCase(), e10)), n10.set("authorization", `${n10.has("dpop") ? "DPoP" : "Bearer"} ${e10}`);
        let o10 = await (a10?.[i9] || fetch)(r10.href, { body: i10, headers: Object.fromEntries(n10.entries()), method: t10, redirect: "manual", signal: ad(r10, a10?.signal) });
        return a10?.DPoP?.cacheNonce(o10, r10), o10;
      }
      async function aq(e10, t10, r10, n10) {
        ax(e10), aA(t10);
        let i10 = aU(e10, "userinfo_endpoint", t10.use_mtls_endpoint_aliases, n10?.[i6] !== true), a10 = au(n10?.headers);
        return t10.userinfo_signed_response_alg ? a10.set("accept", "application/jwt") : (a10.set("accept", "application/json"), a10.append("accept", "application/jwt")), aV(r10, "GET", i10, a10, null, { ...n10, [i4]: aS(t10) });
      }
      function az(e10, t10, r10, n10) {
        (l ||= /* @__PURE__ */ new WeakMap()).set(e10, { jwks: t10, uat: r10, get age() {
          return aE() - this.uat;
        } }), n10 && Object.assign(n10, { jwks: structuredClone(t10), uat: r10 });
      }
      function aF(e10, t10) {
        l?.delete(e10), delete t10?.jwks, delete t10?.uat;
      }
      let aG = Symbol();
      function aX(e10) {
        return e10.headers.get("content-type")?.split(";")[0];
      }
      async function aY(e10, t10, r10, n10, i10) {
        let a10;
        if (ax(e10), aA(t10), !i1(n10, Response)) throw i3('"response" must be an instance of Response', i5);
        if (a3(n10), 200 !== n10.status) throw ac('"response" is not a conform UserInfo Endpoint response (unexpected HTTP status code)', oy, n10);
        if (oA(n10), "application/jwt" === aX(n10)) {
          let { claims: r11, jwt: o10 } = await oO(await n10.text(), oN.bind(void 0, t10.userinfo_signed_response_alg, e10.userinfo_signing_alg_values_supported, void 0), aS(t10), ak(t10), i10?.[ae]).then(a6.bind(void 0, t10.client_id)).then(a8.bind(void 0, e10));
          a1.set(n10, o10), a10 = r11;
        } else {
          if (t10.userinfo_signed_response_alg) throw ac("JWT UserInfo Response expected", oh, n10);
          a10 = await oD(n10);
        }
        if (am(a10.sub, '"response" body "sub" property', og, { body: a10 }), r10 === aG) ;
        else if (am(r10, '"expectedSubject"'), a10.sub !== r10) throw ac('unexpected "response" body "sub" property value', oS, { expected: r10, body: a10, attribute: "sub" });
        return a10;
      }
      async function aZ(e10, t10, r10, n10, i10, a10, o10) {
        return await r10(e10, t10, i10, a10), a10.set("content-type", "application/x-www-form-urlencoded;charset=UTF-8"), (o10?.[i9] || fetch)(n10.href, { body: i10, headers: Object.fromEntries(a10.entries()), method: "POST", redirect: "manual", signal: ad(n10, o10?.signal) });
      }
      async function aQ(e10, t10, r10, n10, i10, a10) {
        let o10 = aU(e10, "token_endpoint", t10.use_mtls_endpoint_aliases, a10?.[i6] !== true);
        i10.set("grant_type", n10);
        let s2 = au(a10?.headers);
        s2.set("accept", "application/json"), a10?.DPoP !== void 0 && (aJ(a10.DPoP), await a10.DPoP.addProof(o10, s2, "POST"));
        let c2 = await aZ(e10, t10, r10, o10, i10, s2, a10);
        return a10?.DPoP?.cacheNonce(c2, o10), c2;
      }
      let a0 = /* @__PURE__ */ new WeakMap(), a1 = /* @__PURE__ */ new WeakMap();
      function a2(e10) {
        if (!e10.id_token) return;
        let t10 = a0.get(e10);
        if (!t10) throw i3('"ref" was already garbage collected or did not resolve from the proper sources', i2);
        return t10;
      }
      async function a5(e10, t10, r10, n10, i10, a10) {
        if (ax(e10), aA(t10), !i1(r10, Response)) throw i3('"response" must be an instance of Response', i5);
        await aB(r10, 200, "Token Endpoint"), oA(r10);
        let o10 = await oD(r10);
        if (am(o10.access_token, '"response" body "access_token" property', og, { body: o10 }), am(o10.token_type, '"response" body "token_type" property', og, { body: o10 }), o10.token_type = o10.token_type.toLowerCase(), void 0 !== o10.expires_in) {
          let e11 = "number" != typeof o10.expires_in ? parseFloat(o10.expires_in) : o10.expires_in;
          ag(e11, true, '"response" body "expires_in" property', og, { body: o10 }), o10.expires_in = e11;
        }
        if (void 0 !== o10.refresh_token && am(o10.refresh_token, '"response" body "refresh_token" property', og, { body: o10 }), void 0 !== o10.scope && "string" != typeof o10.scope) throw ac('"response" body "scope" property must be a string', og, { body: o10 });
        if (void 0 !== o10.id_token) {
          am(o10.id_token, '"response" body "id_token" property', og, { body: o10 });
          let a11 = ["aud", "exp", "iat", "iss", "sub"];
          true === t10.require_auth_time && a11.push("auth_time"), void 0 !== t10.default_max_age && (ag(t10.default_max_age, true, '"client.default_max_age"'), a11.push("auth_time")), n10?.length && a11.push(...n10);
          let { claims: s2, jwt: c2 } = await oO(o10.id_token, oN.bind(void 0, t10.id_token_signed_response_alg, e10.id_token_signing_alg_values_supported, "RS256"), aS(t10), ak(t10), i10).then(on.bind(void 0, a11)).then(a9.bind(void 0, e10)).then(a4.bind(void 0, t10.client_id));
          if (Array.isArray(s2.aud) && 1 !== s2.aud.length) {
            if (void 0 === s2.azp) throw ac('ID Token "aud" (audience) claim includes additional untrusted audiences', o_, { claims: s2, claim: "aud" });
            if (s2.azp !== t10.client_id) throw ac('unexpected ID Token "azp" (authorized party) claim value', o_, { expected: t10.client_id, claims: s2, claim: "azp" });
          }
          void 0 !== s2.auth_time && ag(s2.auth_time, true, 'ID Token "auth_time" (authentication time)', og, { claims: s2 }), a1.set(r10, c2), a0.set(o10, s2);
        }
        if (a10?.[o10.token_type] !== void 0) a10[o10.token_type](r10, o10);
        else if ("dpop" !== o10.token_type && "bearer" !== o10.token_type) throw new ao("unsupported `token_type` value", { cause: { body: o10 } });
        return o10;
      }
      function a3(e10) {
        let t10;
        if (t10 = function(e11) {
          if (!i1(e11, Response)) throw i3('"response" must be an instance of Response', i5);
          let t11 = e11.headers.get("www-authenticate");
          if (null === t11) return;
          let r10 = [], n10 = t11;
          for (; n10; ) {
            let e12, t12 = n10.match(aj), i10 = t12?.["1"].toLowerCase();
            if (!i10) return;
            let a10 = n10.substring(t12[0].length);
            if (a10 && !a10.match(/^[\s,]/)) return;
            let o10 = a10.match(/^\s+(.*)$/), s2 = !!o10;
            n10 = o10 ? o10[1] : void 0;
            let c2 = {};
            if (s2) for (; n10; ) {
              let r11, i11;
              if (t12 = n10.match(aD)) {
                if ([, r11, i11, n10] = t12, i11.includes("\\")) try {
                  i11 = JSON.parse(`"${i11}"`);
                } catch {
                }
                c2[r11.toLowerCase()] = i11;
                continue;
              }
              if (t12 = n10.match(aH)) {
                [, r11, i11, n10] = t12, c2[r11.toLowerCase()] = i11;
                continue;
              }
              if (t12 = n10.match(aW)) {
                if (Object.keys(c2).length) break;
                [, e12, n10] = t12;
                break;
              }
              return;
            }
            else n10 = a10 || void 0;
            let l2 = { scheme: i10, parameters: c2 };
            e12 && (l2.token68 = e12), r10.push(l2);
          }
          if (r10.length) return r10;
        }(e10)) throw new a$("server responded with a challenge in the WWW-Authenticate HTTP Header", { cause: t10, response: e10 });
      }
      function a6(e10, t10) {
        return void 0 !== t10.claims.aud ? a4(e10, t10) : t10;
      }
      function a4(e10, t10) {
        if (Array.isArray(t10.claims.aud)) {
          if (!t10.claims.aud.includes(e10)) throw ac('unexpected JWT "aud" (audience) claim value', o_, { expected: e10, claims: t10.claims, claim: "aud" });
        } else if (t10.claims.aud !== e10) throw ac('unexpected JWT "aud" (audience) claim value', o_, { expected: e10, claims: t10.claims, claim: "aud" });
        return t10;
      }
      function a8(e10, t10) {
        return void 0 !== t10.claims.iss ? a9(e10, t10) : t10;
      }
      function a9(e10, t10) {
        let r10 = e10[oW]?.(t10) ?? e10.issuer;
        if (t10.claims.iss !== r10) throw ac('unexpected JWT "iss" (issuer) claim value', o_, { expected: r10, claims: t10.claims, claim: "iss" });
        return t10;
      }
      let a7 = /* @__PURE__ */ new WeakSet(), oe = Symbol();
      async function ot(e10, t10, r10, n10, i10, a10, o10) {
        if (ax(e10), aA(t10), !a7.has(n10)) throw i3('"callbackParameters" must be an instance of URLSearchParams obtained from "validateAuthResponse()", or "validateJwtAuthResponse()', i2);
        am(i10, '"redirectUri"');
        let s2 = oL(n10, "code");
        if (!s2) throw ac('no authorization code in "callbackParameters"', og);
        let c2 = new URLSearchParams(o10?.additionalParameters);
        return c2.set("redirect_uri", i10), c2.set("code", s2), a10 !== oe && (am(a10, '"codeVerifier"'), c2.set("code_verifier", a10)), aQ(e10, t10, r10, "authorization_code", c2, o10);
      }
      let or = { aud: "audience", c_hash: "code hash", client_id: "client id", exp: "expiration time", iat: "issued at", iss: "issuer", jti: "jwt id", nonce: "nonce", s_hash: "state hash", sub: "subject", ath: "access token hash", htm: "http method", htu: "http uri", cnf: "confirmation", auth_time: "authentication time" };
      function on(e10, t10) {
        for (let r10 of e10) if (void 0 === t10.claims[r10]) throw ac(`JWT "${r10}" (${or[r10]}) claim missing`, og, { claims: t10.claims });
        return t10;
      }
      let oi = Symbol(), oa = Symbol();
      async function oo(e10, t10, r10, n10) {
        return "string" == typeof n10?.expectedNonce || "number" == typeof n10?.maxAge || n10?.requireIdToken ? os(e10, t10, r10, n10.expectedNonce, n10.maxAge, n10[ae], n10.recognizedTokenTypes) : oc(e10, t10, r10, n10?.[ae], n10?.recognizedTokenTypes);
      }
      async function os(e10, t10, r10, n10, i10, a10, o10) {
        let s2 = [];
        switch (n10) {
          case void 0:
            n10 = oi;
            break;
          case oi:
            break;
          default:
            am(n10, '"expectedNonce" argument'), s2.push("nonce");
        }
        switch (i10 ??= t10.default_max_age) {
          case void 0:
            i10 = oa;
            break;
          case oa:
            break;
          default:
            ag(i10, true, '"maxAge" argument'), s2.push("auth_time");
        }
        let c2 = await a5(e10, t10, r10, s2, a10, o10);
        am(c2.id_token, '"response" body "id_token" property', og, { body: c2 });
        let l2 = a2(c2);
        if (i10 !== oa) {
          let e11 = aE() + aS(t10), r11 = ak(t10);
          if (l2.auth_time + i10 < e11 - r11) throw ac("too much time has elapsed since the last End-User authentication", ov, { claims: l2, now: e11, tolerance: r11, claim: "auth_time" });
        }
        if (n10 === oi) {
          if (void 0 !== l2.nonce) throw ac('unexpected ID Token "nonce" claim value', o_, { expected: void 0, claims: l2, claim: "nonce" });
        } else if (l2.nonce !== n10) throw ac('unexpected ID Token "nonce" claim value', o_, { expected: n10, claims: l2, claim: "nonce" });
        return c2;
      }
      async function oc(e10, t10, r10, n10, i10) {
        let a10 = await a5(e10, t10, r10, void 0, n10, i10), o10 = a2(a10);
        if (o10) {
          if (void 0 !== t10.default_max_age) {
            ag(t10.default_max_age, true, '"client.default_max_age"');
            let e11 = aE() + aS(t10), r11 = ak(t10);
            if (o10.auth_time + t10.default_max_age < e11 - r11) throw ac("too much time has elapsed since the last End-User authentication", ov, { claims: o10, now: e11, tolerance: r11, claim: "auth_time" });
          }
          if (void 0 !== o10.nonce) throw ac('unexpected ID Token "nonce" claim value', o_, { expected: void 0, claims: o10, claim: "nonce" });
        }
        return a10;
      }
      let ol = "OAUTH_WWW_AUTHENTICATE_CHALLENGE", ou = "OAUTH_RESPONSE_BODY_ERROR", od = "OAUTH_UNSUPPORTED_OPERATION", op = "OAUTH_AUTHORIZATION_RESPONSE_ERROR", oh = "OAUTH_JWT_USERINFO_EXPECTED", of = "OAUTH_PARSE_ERROR", og = "OAUTH_INVALID_RESPONSE", om = "OAUTH_RESPONSE_IS_NOT_JSON", oy = "OAUTH_RESPONSE_IS_NOT_CONFORM", ow = "OAUTH_HTTP_REQUEST_FORBIDDEN", ob = "OAUTH_REQUEST_PROTOCOL_FORBIDDEN", ov = "OAUTH_JWT_TIMESTAMP_CHECK_FAILED", o_ = "OAUTH_JWT_CLAIM_COMPARISON_FAILED", oS = "OAUTH_JSON_ATTRIBUTE_COMPARISON_FAILED", ok = "OAUTH_KEY_SELECTION_FAILED", oE = "OAUTH_MISSING_SERVER_METADATA", ox = "OAUTH_INVALID_SERVER_METADATA";
      function oA(e10) {
        if (e10.bodyUsed) throw i3('"response" body has been used already', i2);
      }
      async function oT(e10, t10) {
        ax(e10);
        let r10 = aU(e10, "jwks_uri", false, t10?.[i6] !== true), n10 = au(t10?.headers);
        return n10.set("accept", "application/json"), n10.append("accept", "application/jwk-set+json"), (t10?.[i9] || fetch)(r10.href, { body: void 0, headers: Object.fromEntries(n10.entries()), method: "GET", redirect: "manual", signal: ad(r10, t10?.signal) });
      }
      async function oP(e10) {
        if (!i1(e10, Response)) throw i3('"response" must be an instance of Response', i5);
        if (200 !== e10.status) throw ac('"response" is not a conform JSON Web Key Set response (unexpected HTTP status code)', oy, e10);
        oA(e10);
        let t10 = await oD(e10, (e11) => function(e12, ...t11) {
          if (!t11.includes(aX(e12))) throw ab(e12, ...t11);
        }(e11, "application/json", "application/jwk-set+json"));
        if (!Array.isArray(t10.keys)) throw ac('"response" body "keys" property must be an array', og, { body: t10 });
        if (!Array.prototype.every.call(t10.keys, al)) throw ac('"response" body "keys" property members must be JWK formatted objects', og, { body: t10 });
        return t10;
      }
      function oC(e10) {
        let { algorithm: t10 } = e10;
        if ("number" != typeof t10.modulusLength || t10.modulusLength < 2048) throw new ao(`unsupported ${t10.name} modulusLength`, { cause: e10 });
      }
      function oR(e10) {
        switch (e10.algorithm.name) {
          case "ECDSA":
            return { name: e10.algorithm.name, hash: function(e11) {
              let { algorithm: t10 } = e11;
              switch (t10.namedCurve) {
                case "P-256":
                  return "SHA-256";
                case "P-384":
                  return "SHA-384";
                case "P-521":
                  return "SHA-512";
                default:
                  throw new ao("unsupported ECDSA namedCurve", { cause: e11 });
              }
            }(e10) };
          case "RSA-PSS":
            switch (oC(e10), e10.algorithm.hash.name) {
              case "SHA-256":
              case "SHA-384":
              case "SHA-512":
                return { name: e10.algorithm.name, saltLength: parseInt(e10.algorithm.hash.name.slice(-3), 10) >> 3 };
              default:
                throw new ao("unsupported RSA-PSS hash name", { cause: e10 });
            }
          case "RSASSA-PKCS1-v1_5":
            return oC(e10), e10.algorithm.name;
          case "ML-DSA-44":
          case "ML-DSA-65":
          case "ML-DSA-87":
          case "Ed25519":
            return e10.algorithm.name;
        }
        throw new ao("unsupported CryptoKey algorithm name", { cause: e10 });
      }
      async function oO(e10, t10, r10, n10, i10) {
        let a10, o10, { 0: s2, 1: c2, length: l2 } = e10.split(".");
        if (5 === l2) {
          if (void 0 !== i10) e10 = await i10(e10), { 0: s2, 1: c2, length: l2 } = e10.split(".");
          else throw new ao("JWE decryption is not configured", { cause: e10 });
        }
        if (3 !== l2) throw ac("Invalid JWT", og, e10);
        try {
          a10 = JSON.parse(ai(aa(s2)));
        } catch (e11) {
          throw ac("failed to parse JWT Header body as base64url encoded JSON", of, e11);
        }
        if (!al(a10)) throw ac("JWT Header must be a top level object", og, e10);
        if (t10(a10), void 0 !== a10.crit) throw new ao('no JWT "crit" header parameter extensions are supported', { cause: { header: a10 } });
        try {
          o10 = JSON.parse(ai(aa(c2)));
        } catch (e11) {
          throw ac("failed to parse JWT Payload body as base64url encoded JSON", of, e11);
        }
        if (!al(o10)) throw ac("JWT Payload must be a top level object", og, e10);
        let u2 = aE() + r10;
        if (void 0 !== o10.exp) {
          if ("number" != typeof o10.exp) throw ac('unexpected JWT "exp" (expiration time) claim type', og, { claims: o10 });
          if (o10.exp <= u2 - n10) throw ac('unexpected JWT "exp" (expiration time) claim value, expiration is past current timestamp', ov, { claims: o10, now: u2, tolerance: n10, claim: "exp" });
        }
        if (void 0 !== o10.iat && "number" != typeof o10.iat) throw ac('unexpected JWT "iat" (issued at) claim type', og, { claims: o10 });
        if (void 0 !== o10.iss && "string" != typeof o10.iss) throw ac('unexpected JWT "iss" (issuer) claim type', og, { claims: o10 });
        if (void 0 !== o10.nbf) {
          if ("number" != typeof o10.nbf) throw ac('unexpected JWT "nbf" (not before) claim type', og, { claims: o10 });
          if (o10.nbf > u2 + n10) throw ac('unexpected JWT "nbf" (not before) claim value', ov, { claims: o10, now: u2, tolerance: n10, claim: "nbf" });
        }
        if (void 0 !== o10.aud && "string" != typeof o10.aud && !Array.isArray(o10.aud)) throw ac('unexpected JWT "aud" (audience) claim type', og, { claims: o10 });
        return { header: a10, claims: o10, jwt: e10 };
      }
      async function oI(e10, t10, r10) {
        let n10;
        switch (t10.alg) {
          case "RS256":
          case "PS256":
          case "ES256":
            n10 = "SHA-256";
            break;
          case "RS384":
          case "PS384":
          case "ES384":
            n10 = "SHA-384";
            break;
          case "RS512":
          case "PS512":
          case "ES512":
          case "Ed25519":
          case "EdDSA":
            n10 = "SHA-512";
            break;
          case "ML-DSA-44":
          case "ML-DSA-65":
          case "ML-DSA-87":
            n10 = { name: "cSHAKE256", length: 512 };
            break;
          default:
            throw new ao(`unsupported JWS algorithm for ${r10} calculation`, { cause: { alg: t10.alg } });
        }
        let i10 = await crypto.subtle.digest(n10, ai(e10));
        return aa(i10.slice(0, i10.byteLength / 2));
      }
      async function oU(e10) {
        if (e10.bodyUsed) throw i3("form_post Request instances must contain a readable body", i2, { cause: e10 });
        return e10.text();
      }
      function oN(e10, t10, r10, n10) {
        if (void 0 !== e10) {
          if ("string" == typeof e10 ? n10.alg !== e10 : !e10.includes(n10.alg)) throw ac('unexpected JWT "alg" header parameter', og, { header: n10, expected: e10, reason: "client configuration" });
          return;
        }
        if (Array.isArray(t10)) {
          if (!t10.includes(n10.alg)) throw ac('unexpected JWT "alg" header parameter', og, { header: n10, expected: t10, reason: "authorization server metadata" });
          return;
        }
        if (void 0 !== r10) {
          if ("string" == typeof r10 ? n10.alg !== r10 : "function" == typeof r10 ? !r10(n10.alg) : !r10.includes(n10.alg)) throw ac('unexpected JWT "alg" header parameter', og, { header: n10, expected: r10, reason: "default value" });
          return;
        }
        throw ac('missing client or server configuration to verify used JWT "alg" header parameter', void 0, { client: e10, issuer: t10, fallback: r10 });
      }
      function oL(e10, t10) {
        let { 0: r10, length: n10 } = e10.getAll(t10);
        if (n10 > 1) throw ac(`"${t10}" parameter must be provided only once`, og);
        return r10;
      }
      let o$ = Symbol(), oM = Symbol();
      async function oj(e10, t10) {
        let { ext: r10, key_ops: n10, use: i10, ...a10 } = t10;
        return crypto.subtle.importKey("jwk", a10, function(e11) {
          switch (e11) {
            case "PS256":
            case "PS384":
            case "PS512":
              return { name: "RSA-PSS", hash: `SHA-${e11.slice(-3)}` };
            case "RS256":
            case "RS384":
            case "RS512":
              return { name: "RSASSA-PKCS1-v1_5", hash: `SHA-${e11.slice(-3)}` };
            case "ES256":
            case "ES384":
              return { name: "ECDSA", namedCurve: `P-${e11.slice(-3)}` };
            case "ES512":
              return { name: "ECDSA", namedCurve: "P-521" };
            case "EdDSA":
              return "Ed25519";
            case "Ed25519":
            case "ML-DSA-44":
            case "ML-DSA-65":
            case "ML-DSA-87":
              return e11;
            default:
              throw new ao("unsupported JWS algorithm", { cause: { alg: e11 } });
          }
        }(e10), true, ["verify"]);
      }
      async function oD(e10, t10 = aw) {
        let r10;
        try {
          r10 = await e10.json();
        } catch (r11) {
          throw t10(e10), ac('failed to parse "response" body as JSON', of, r11);
        }
        if (!al(r10)) throw ac('"response" body must be a top level object', og, { body: r10 });
        return r10;
      }
      let oH = Symbol(), oW = Symbol();
      async function oK(e10, t10, r10) {
        let { cookies: n10, logger: i10 } = r10, a10 = n10[e10], o10 = /* @__PURE__ */ new Date();
        o10.setTime(o10.getTime() + 9e5), i10.debug(`CREATE_${e10.toUpperCase()}`, { name: a10.name, payload: t10, COOKIE_TTL: 900, expires: o10 });
        let s2 = await ns({ ...r10.jwt, maxAge: 900, token: { value: t10 }, salt: a10.name }), c2 = { ...a10.options, expires: o10 };
        return { name: a10.name, value: s2, options: c2 };
      }
      async function oB(e10, t10, r10) {
        try {
          let { logger: n10, cookies: i10, jwt: a10 } = r10;
          if (n10.debug(`PARSE_${e10.toUpperCase()}`, { cookie: t10 }), !t10) throw new eF(`${e10} cookie was missing`);
          let o10 = await nc({ ...a10, token: t10, salt: i10[e10].name });
          if (o10?.value) return o10.value;
          throw Error("Invalid cookie");
        } catch (t11) {
          throw new eF(`${e10} value could not be parsed`, { cause: t11 });
        }
      }
      function oJ(e10, t10, r10) {
        let { logger: n10, cookies: i10 } = t10, a10 = i10[e10];
        n10.debug(`CLEAR_${e10.toUpperCase()}`, { cookie: a10 }), r10.push({ name: a10.name, value: "", options: { ...i10[e10].options, maxAge: 0 } });
      }
      function oV(e10, t10) {
        return async function(r10, n10, i10) {
          let { provider: a10, logger: o10 } = i10;
          if (!a10?.checks?.includes(e10)) return;
          let s2 = r10?.[i10.cookies[t10].name];
          o10.debug(`USE_${t10.toUpperCase()}`, { value: s2 });
          let c2 = await oB(t10, s2, i10);
          return oJ(t10, i10, n10), c2;
        };
      }
      let oq = { async create(e10) {
        let t10 = av(), r10 = await a_(t10);
        return { cookie: await oK("pkceCodeVerifier", t10, e10), value: r10 };
      }, use: oV("pkce", "pkceCodeVerifier") }, oz = "encodedState", oF = { async create(e10, t10) {
        let { provider: r10 } = e10;
        if (!r10.checks.includes("state")) {
          if (t10) throw new eF("State data was provided but the provider is not configured to use state");
          return;
        }
        let n10 = { origin: t10, random: av() }, i10 = await ns({ secret: e10.jwt.secret, token: n10, salt: oz, maxAge: 900 });
        return { cookie: await oK("state", i10, e10), value: i10 };
      }, use: oV("state", "state"), async decode(e10, t10) {
        try {
          t10.logger.debug("DECODE_STATE", { state: e10 });
          let r10 = await nc({ secret: t10.jwt.secret, token: e10, salt: oz });
          if (r10) return r10;
          throw Error("Invalid state");
        } catch (e11) {
          throw new eF("State could not be decoded", { cause: e11 });
        }
      } }, oG = { async create(e10) {
        if (!e10.provider.checks.includes("nonce")) return;
        let t10 = av();
        return { cookie: await oK("nonce", t10, e10), value: t10 };
      }, use: oV("nonce", "nonce") }, oX = "encodedWebauthnChallenge", oY = { create: async (e10, t10, r10) => ({ cookie: await oK("webauthnChallenge", await ns({ secret: e10.jwt.secret, token: { challenge: t10, registerData: r10 }, salt: oX, maxAge: 900 }), e10) }), async use(e10, t10, r10) {
        let n10 = t10?.[e10.cookies.webauthnChallenge.name], i10 = await oB("webauthnChallenge", n10, e10), a10 = await nc({ secret: e10.jwt.secret, token: i10, salt: oX });
        if (oJ("webauthnChallenge", e10, r10), !a10) throw new eF("WebAuthn challenge was missing");
        return a10;
      } };
      function oZ(e10) {
        return encodeURIComponent(e10).replace(/%20/g, "+");
      }
      async function oQ(e10, t10, r10) {
        let n10, i10, a10;
        let { logger: o10, provider: s2 } = r10, { token: c2, userinfo: l2 } = s2;
        if (c2?.url && "authjs.dev" !== c2.url.host || l2?.url && "authjs.dev" !== l2.url.host) n10 = { issuer: s2.issuer ?? "https://authjs.dev", token_endpoint: c2?.url.toString(), userinfo_endpoint: l2?.url.toString() };
        else {
          let e11 = new URL(s2.issuer), t11 = await af(e11, { [i6]: true, [i9]: s2[nC] });
          if (!(n10 = await ay(e11, t11)).token_endpoint) throw TypeError("TODO: Authorization server did not provide a token endpoint.");
          if (!n10.userinfo_endpoint) throw TypeError("TODO: Authorization server did not provide a userinfo endpoint.");
        }
        let u2 = { client_id: s2.clientId, ...s2.client };
        switch (u2.token_endpoint_auth_method) {
          case void 0:
          case "client_secret_basic":
            i10 = (e11, t11, r11, n11) => {
              n11.set("authorization", function(e12, t12) {
                let r12 = oZ(e12), n12 = oZ(t12), i11 = btoa(`${r12}:${n12}`);
                return `Basic ${i11}`;
              }(s2.clientId, s2.clientSecret));
            };
            break;
          case "client_secret_post":
            var d2;
            am(d2 = s2.clientSecret, '"clientSecret"'), i10 = (e11, t11, r11, n11) => {
              r11.set("client_id", t11.client_id), r11.set("client_secret", d2);
            };
            break;
          case "client_secret_jwt":
            i10 = function(e11, t11) {
              let r11;
              am(e11, '"clientSecret"');
              let n11 = void 0;
              return async (t12, i11, a11, o11) => {
                r11 ||= await crypto.subtle.importKey("raw", ai(e11), { hash: "SHA-256", name: "HMAC" }, false, ["sign"]);
                let s3 = { alg: "HS256" }, c3 = aT(t12, i11);
                n11?.(s3, c3);
                let l3 = `${aa(ai(JSON.stringify(s3)))}.${aa(ai(JSON.stringify(c3)))}`, u3 = await crypto.subtle.sign(r11.algorithm, r11, ai(l3));
                a11.set("client_id", i11.client_id), a11.set("client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer"), a11.set("client_assertion", `${l3}.${aa(new Uint8Array(u3))}`);
              };
            }(s2.clientSecret);
            break;
          case "private_key_jwt":
            i10 = function(e11, t11) {
              let { key: r11, kid: n11 } = e11 instanceof CryptoKey ? { key: e11 } : e11?.key instanceof CryptoKey ? (void 0 !== e11.kid && am(e11.kid, '"kid"'), { key: e11.key, kid: e11.kid }) : {};
              return function(e12, t12) {
                if (function(e13, t13) {
                  if (!(e13 instanceof CryptoKey)) throw i3(`${t13} must be a CryptoKey`, i5);
                }(e12, t12), "private" !== e12.type) throw i3(`${t12} must be a private CryptoKey`, i2);
              }(r11, '"clientPrivateKey.key"'), async (e12, i11, a11, o11) => {
                let s3 = { alg: function(e13) {
                  switch (e13.algorithm.name) {
                    case "RSA-PSS":
                      return function(e14) {
                        switch (e14.algorithm.hash.name) {
                          case "SHA-256":
                            return "PS256";
                          case "SHA-384":
                            return "PS384";
                          case "SHA-512":
                            return "PS512";
                          default:
                            throw new ao("unsupported RsaHashedKeyAlgorithm hash name", { cause: e14 });
                        }
                      }(e13);
                    case "RSASSA-PKCS1-v1_5":
                      return function(e14) {
                        switch (e14.algorithm.hash.name) {
                          case "SHA-256":
                            return "RS256";
                          case "SHA-384":
                            return "RS384";
                          case "SHA-512":
                            return "RS512";
                          default:
                            throw new ao("unsupported RsaHashedKeyAlgorithm hash name", { cause: e14 });
                        }
                      }(e13);
                    case "ECDSA":
                      return function(e14) {
                        switch (e14.algorithm.namedCurve) {
                          case "P-256":
                            return "ES256";
                          case "P-384":
                            return "ES384";
                          case "P-521":
                            return "ES512";
                          default:
                            throw new ao("unsupported EcKeyAlgorithm namedCurve", { cause: e14 });
                        }
                      }(e13);
                    case "Ed25519":
                    case "ML-DSA-44":
                    case "ML-DSA-65":
                    case "ML-DSA-87":
                      return e13.algorithm.name;
                    case "EdDSA":
                      return "Ed25519";
                    default:
                      throw new ao("unsupported CryptoKey algorithm name", { cause: e13 });
                  }
                }(r11), kid: n11 }, c3 = aT(e12, i11);
                t11?.[i7]?.(s3, c3), a11.set("client_id", i11.client_id), a11.set("client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer"), a11.set("client_assertion", await aP(s3, c3, r11));
              };
            }(s2.token.clientPrivateKey, { [i7](e11, t11) {
              t11.aud = [n10.issuer, n10.token_endpoint];
            } });
            break;
          case "none":
            i10 = (e11, t11, r11, n11) => {
              r11.set("client_id", t11.client_id);
            };
            break;
          default:
            throw Error("unsupported client authentication method");
        }
        let p2 = [], h2 = await oF.use(t10, p2, r10);
        try {
          a10 = function(e11, t11, r11, n11) {
            var i11;
            if (ax(e11), aA(t11), r11 instanceof URL && (r11 = r11.searchParams), !(r11 instanceof URLSearchParams)) throw i3('"parameters" must be an instance of URLSearchParams, or URL', i5);
            if (oL(r11, "response")) throw ac('"parameters" contains a JARM response, use validateJwtAuthResponse() instead of validateAuthResponse()', og, { parameters: r11 });
            let a11 = oL(r11, "iss"), o11 = oL(r11, "state");
            if (!a11 && e11.authorization_response_iss_parameter_supported) throw ac('response parameter "iss" (issuer) missing', og, { parameters: r11 });
            if (a11 && a11 !== e11.issuer) throw ac('unexpected "iss" (issuer) response parameter value', og, { expected: e11.issuer, parameters: r11 });
            switch (n11) {
              case void 0:
              case oM:
                if (void 0 !== o11) throw ac('unexpected "state" response parameter encountered', og, { expected: void 0, parameters: r11 });
                break;
              case o$:
                break;
              default:
                if (am(n11, '"expectedState" argument'), o11 !== n11) throw ac(void 0 === o11 ? 'response parameter "state" missing' : 'unexpected "state" response parameter value', og, { expected: n11, parameters: r11 });
            }
            if (oL(r11, "error")) throw new aL("authorization response from the server is an error", { cause: r11 });
            let s3 = oL(r11, "id_token"), c3 = oL(r11, "token");
            if (void 0 !== s3 || void 0 !== c3) throw new ao("implicit and hybrid flows are not supported");
            return i11 = new URLSearchParams(r11), a7.add(i11), i11;
          }(n10, u2, new URLSearchParams(e10), s2.checks.includes("state") ? h2 : o$);
        } catch (e11) {
          if (e11 instanceof aL) {
            let t11 = { providerId: s2.id, ...Object.fromEntries(e11.cause.entries()) };
            throw o10.debug("OAuthCallbackError", t11), new e1("OAuth Provider returned an error", t11);
          }
          throw e11;
        }
        let f2 = await oq.use(t10, p2, r10), g2 = s2.callbackUrl;
        !r10.isOnRedirectProxy && s2.redirectProxyUrl && (g2 = s2.redirectProxyUrl);
        let m2 = await ot(n10, u2, i10, a10, g2, f2 ?? "decoy", { [i6]: true, [i9]: (...e11) => (s2.checks.includes("pkce") || e11[1].body.delete("code_verifier"), (s2[nC] ?? fetch)(...e11)) });
        s2.token?.conform && (m2 = await s2.token.conform(m2.clone()) ?? m2);
        let y2 = {}, w2 = "oidc" === s2.type;
        if (s2[nR]) switch (s2.id) {
          case "microsoft-entra-id":
          case "azure-ad": {
            let e11 = await m2.clone().json();
            if (e11.error) {
              let t12 = { providerId: s2.id, ...e11 };
              throw new e1(`OAuth Provider returned an error: ${e11.error}`, t12);
            }
            let { tid: t11 } = function(e12) {
              let t12, r11;
              if ("string" != typeof e12) throw new tj("JWTs must use Compact JWS serialization, JWT must be a string");
              let { 1: n11, length: i11 } = e12.split(".");
              if (5 === i11) throw new tj("Only JWTs using Compact JWS serialization can be decoded");
              if (3 !== i11) throw new tj("Invalid JWT");
              if (!n11) throw new tj("JWTs must contain a payload");
              try {
                t12 = tC(n11);
              } catch {
                throw new tj("Failed to base64url decode the payload");
              }
              try {
                r11 = JSON.parse(tk.decode(t12));
              } catch {
                throw new tj("Failed to parse the decoded payload as JSON");
              }
              if (!tq(r11)) throw new tj("Invalid JWT Claims Set");
              return r11;
            }(e11.id_token);
            if ("string" == typeof t11) {
              let e12 = n10.issuer?.match(/microsoftonline\.com\/(\w+)\/v2\.0/)?.[1] ?? "common", r11 = new URL(n10.issuer.replace(e12, t11)), i11 = await af(r11, { [i9]: s2[nC] });
              n10 = await ay(r11, i11);
            }
          }
        }
        let b2 = await oo(n10, u2, m2, { expectedNonce: await oG.use(t10, p2, r10), requireIdToken: w2 });
        if (w2) {
          let t11 = a2(b2);
          if (y2 = t11, s2[nR] && "apple" === s2.id) try {
            y2.user = JSON.parse(e10?.user);
          } catch {
          }
          if (false === s2.idToken) {
            let e11 = await aq(n10, u2, b2.access_token, { [i9]: s2[nC], [i6]: true });
            y2 = await aY(n10, u2, t11.sub, e11);
          }
        } else if (l2?.request) {
          let e11 = await l2.request({ tokens: b2, provider: s2 });
          e11 instanceof Object && (y2 = e11);
        } else if (l2?.url) {
          let e11 = await aq(n10, u2, b2.access_token, { [i9]: s2[nC], [i6]: true });
          y2 = await e11.json();
        } else throw TypeError("No userinfo endpoint configured");
        return b2.expires_in && (b2.expires_at = Math.floor(Date.now() / 1e3) + Number(b2.expires_in)), { ...await o0(y2, s2, b2, o10), profile: y2, cookies: p2 };
      }
      async function o0(e10, t10, r10, n10) {
        try {
          let n11 = await t10.profile(e10, r10);
          return { user: { ...n11, id: crypto.randomUUID(), email: n11.email?.toLowerCase() }, account: { ...r10, provider: t10.id, type: t10.type, providerAccountId: n11.id ?? crypto.randomUUID() } };
        } catch (r11) {
          n10.debug("getProfile error details", e10), n10.error(new e2(r11, { provider: t10.id }));
        }
      }
      var o1 = r(195).Buffer;
      async function o2(e10, t10, r10, n10) {
        let i10 = await o8(e10, t10, r10), { cookie: a10 } = await oY.create(e10, i10.challenge, r10);
        return { status: 200, cookies: [...n10 ?? [], a10], body: { action: "register", options: i10 }, headers: { "Content-Type": "application/json" } };
      }
      async function o5(e10, t10, r10, n10) {
        let i10 = await o4(e10, t10, r10), { cookie: a10 } = await oY.create(e10, i10.challenge);
        return { status: 200, cookies: [...n10 ?? [], a10], body: { action: "authenticate", options: i10 }, headers: { "Content-Type": "application/json" } };
      }
      async function o3(e10, t10, r10) {
        let n10;
        let { adapter: i10, provider: a10 } = e10, o10 = t10.body && "string" == typeof t10.body.data ? JSON.parse(t10.body.data) : void 0;
        if (!o10 || "object" != typeof o10 || !("id" in o10) || "string" != typeof o10.id) throw new ej("Invalid WebAuthn Authentication response");
        let s2 = se(o7(o10.id)), c2 = await i10.getAuthenticator(s2);
        if (!c2) throw new ej(`WebAuthn authenticator not found in database: ${JSON.stringify({ credentialID: s2 })}`);
        let { challenge: l2 } = await oY.use(e10, t10.cookies, r10);
        try {
          let r11 = a10.getRelayingParty(e10, t10);
          n10 = await a10.simpleWebAuthn.verifyAuthenticationResponse({ ...a10.verifyAuthenticationOptions, expectedChallenge: l2, response: o10, authenticator: { ...c2, credentialDeviceType: c2.credentialDeviceType, transports: st(c2.transports), credentialID: o7(c2.credentialID), credentialPublicKey: o7(c2.credentialPublicKey) }, expectedOrigin: r11.origin, expectedRPID: r11.id });
        } catch (e11) {
          throw new to(e11);
        }
        let { verified: u2, authenticationInfo: d2 } = n10;
        if (!u2) throw new to("WebAuthn authentication response could not be verified");
        try {
          let { newCounter: e11 } = d2;
          await i10.updateAuthenticatorCounter(c2.credentialID, e11);
        } catch (e11) {
          throw new eH(`Failed to update authenticator counter. This may cause future authentication attempts to fail. ${JSON.stringify({ credentialID: s2, oldCounter: c2.counter, newCounter: d2.newCounter })}`, e11);
        }
        let p2 = await i10.getAccount(c2.providerAccountId, a10.id);
        if (!p2) throw new ej(`WebAuthn account not found in database: ${JSON.stringify({ credentialID: s2, providerAccountId: c2.providerAccountId })}`);
        let h2 = await i10.getUser(p2.userId);
        if (!h2) throw new ej(`WebAuthn user not found in database: ${JSON.stringify({ credentialID: s2, providerAccountId: c2.providerAccountId, userID: p2.userId })}`);
        return { account: p2, user: h2 };
      }
      async function o6(e10, t10, r10) {
        var n10;
        let i10;
        let { provider: a10 } = e10, o10 = t10.body && "string" == typeof t10.body.data ? JSON.parse(t10.body.data) : void 0;
        if (!o10 || "object" != typeof o10 || !("id" in o10) || "string" != typeof o10.id) throw new ej("Invalid WebAuthn Registration response");
        let { challenge: s2, registerData: c2 } = await oY.use(e10, t10.cookies, r10);
        if (!c2) throw new ej("Missing user registration data in WebAuthn challenge cookie");
        try {
          let r11 = a10.getRelayingParty(e10, t10);
          i10 = await a10.simpleWebAuthn.verifyRegistrationResponse({ ...a10.verifyRegistrationOptions, expectedChallenge: s2, response: o10, expectedOrigin: r11.origin, expectedRPID: r11.id });
        } catch (e11) {
          throw new to(e11);
        }
        if (!i10.verified || !i10.registrationInfo) throw new to("WebAuthn registration response could not be verified");
        let l2 = { providerAccountId: se(i10.registrationInfo.credentialID), provider: e10.provider.id, type: a10.type }, u2 = { providerAccountId: l2.providerAccountId, counter: i10.registrationInfo.counter, credentialID: se(i10.registrationInfo.credentialID), credentialPublicKey: se(i10.registrationInfo.credentialPublicKey), credentialBackedUp: i10.registrationInfo.credentialBackedUp, credentialDeviceType: i10.registrationInfo.credentialDeviceType, transports: (n10 = o10.response.transports, n10?.join(",")) };
        return { user: c2, account: l2, authenticator: u2 };
      }
      async function o4(e10, t10, r10) {
        let { provider: n10, adapter: i10 } = e10, a10 = r10 && r10.id ? await i10.listAuthenticatorsByUserId(r10.id) : null, o10 = n10.getRelayingParty(e10, t10);
        return await n10.simpleWebAuthn.generateAuthenticationOptions({ ...n10.authenticationOptions, rpID: o10.id, allowCredentials: a10?.map((e11) => ({ id: o7(e11.credentialID), type: "public-key", transports: st(e11.transports) })) });
      }
      async function o8(e10, t10, r10) {
        let { provider: n10, adapter: i10 } = e10, a10 = r10.id ? await i10.listAuthenticatorsByUserId(r10.id) : null, o10 = nS(32), s2 = n10.getRelayingParty(e10, t10);
        return await n10.simpleWebAuthn.generateRegistrationOptions({ ...n10.registrationOptions, userID: o10, userName: r10.email, userDisplayName: r10.name ?? void 0, rpID: s2.id, rpName: s2.name, excludeCredentials: a10?.map((e11) => ({ id: o7(e11.credentialID), type: "public-key", transports: st(e11.transports) })) });
      }
      function o9(e10) {
        let { provider: t10, adapter: r10 } = e10;
        if (!r10) throw new eX("An adapter is required for the WebAuthn provider");
        if (!t10 || "webauthn" !== t10.type) throw new e7("Provider must be WebAuthn");
        return { ...e10, provider: t10, adapter: r10 };
      }
      function o7(e10) {
        return new Uint8Array(o1.from(e10, "base64"));
      }
      function se(e10) {
        return o1.from(e10).toString("base64");
      }
      function st(e10) {
        return e10 ? e10.split(",") : void 0;
      }
      async function sr(e10, t10, r10, n10) {
        if (!t10.provider) throw new e7("Callback route called without provider");
        let { query: i10, body: a10, method: o10, headers: s2 } = e10, { provider: c2, adapter: l2, url: u2, callbackUrl: d2, pages: p2, jwt: h2, events: f2, callbacks: g2, session: { strategy: m2, maxAge: y2 }, logger: w2 } = t10, b2 = "jwt" === m2;
        try {
          if ("oauth" === c2.type || "oidc" === c2.type) {
            let o11;
            let s3 = c2.authorization?.url.searchParams.get("response_mode") === "form_post" ? a10 : i10;
            if (t10.isOnRedirectProxy && s3?.state) {
              let e11 = await oF.decode(s3.state, t10);
              if (e11?.origin && new URL(e11.origin).origin !== t10.url.origin) {
                let t11 = `${e11.origin}?${new URLSearchParams(s3)}`;
                return w2.debug("Proxy redirecting to", t11), { redirect: t11, cookies: n10 };
              }
            }
            let m3 = await oQ(s3, e10.cookies, t10);
            m3.cookies.length && n10.push(...m3.cookies), w2.debug("authorization result", m3);
            let { user: v2, account: _2, profile: S2 } = m3;
            if (!v2 || !_2 || !S2) return { redirect: `${u2}/signin`, cookies: n10 };
            if (l2) {
              let { getUserByAccount: e11 } = l2;
              o11 = await e11({ providerAccountId: _2.providerAccountId, provider: c2.id });
            }
            let k2 = await sn({ user: o11 ?? v2, account: _2, profile: S2 }, t10);
            if (k2) return { redirect: k2, cookies: n10 };
            let { user: E2, session: x2, isNewUser: A2 } = await i0(r10.value, v2, _2, t10);
            if (b2) {
              let e11 = { name: E2.name, email: E2.email, picture: E2.image, sub: E2.id?.toString() }, i11 = await g2.jwt({ token: e11, user: E2, account: _2, profile: S2, isNewUser: A2, trigger: A2 ? "signUp" : "signIn" });
              if (null === i11) n10.push(...r10.clean());
              else {
                let e12 = t10.cookies.sessionToken.name, a11 = await h2.encode({ ...h2, token: i11, salt: e12 }), o12 = /* @__PURE__ */ new Date();
                o12.setTime(o12.getTime() + 1e3 * y2);
                let s4 = r10.chunk(a11, { expires: o12 });
                n10.push(...s4);
              }
            } else n10.push({ name: t10.cookies.sessionToken.name, value: x2.sessionToken, options: { ...t10.cookies.sessionToken.options, expires: x2.expires } });
            if (await f2.signIn?.({ user: E2, account: _2, profile: S2, isNewUser: A2 }), A2 && p2.newUser) return { redirect: `${p2.newUser}${p2.newUser.includes("?") ? "&" : "?"}${new URLSearchParams({ callbackUrl: d2 })}`, cookies: n10 };
            return { redirect: d2, cookies: n10 };
          }
          if ("email" === c2.type) {
            let e11 = i10?.token, a11 = i10?.email;
            if (!e11) {
              let t11 = TypeError("Missing token. The sign-in URL was manually opened without token or the link was not sent correctly in the email.", { cause: { hasToken: !!e11 } });
              throw t11.name = "Configuration", t11;
            }
            let o11 = c2.secret ?? t10.secret, s3 = await l2.useVerificationToken({ identifier: a11, token: await n_(`${e11}${o11}`) }), u3 = !!s3, m3 = u3 && s3.expires.valueOf() < Date.now();
            if (!u3 || m3 || a11 && s3.identifier !== a11) throw new tt({ hasInvite: u3, expired: m3 });
            let { identifier: w3 } = s3, v2 = await l2.getUserByEmail(w3) ?? { id: crypto.randomUUID(), email: w3, emailVerified: null }, _2 = { providerAccountId: v2.email, userId: v2.id, type: "email", provider: c2.id }, S2 = await sn({ user: v2, account: _2 }, t10);
            if (S2) return { redirect: S2, cookies: n10 };
            let { user: k2, session: E2, isNewUser: x2 } = await i0(r10.value, v2, _2, t10);
            if (b2) {
              let e12 = { name: k2.name, email: k2.email, picture: k2.image, sub: k2.id?.toString() }, i11 = await g2.jwt({ token: e12, user: k2, account: _2, isNewUser: x2, trigger: x2 ? "signUp" : "signIn" });
              if (null === i11) n10.push(...r10.clean());
              else {
                let e13 = t10.cookies.sessionToken.name, a12 = await h2.encode({ ...h2, token: i11, salt: e13 }), o12 = /* @__PURE__ */ new Date();
                o12.setTime(o12.getTime() + 1e3 * y2);
                let s4 = r10.chunk(a12, { expires: o12 });
                n10.push(...s4);
              }
            } else n10.push({ name: t10.cookies.sessionToken.name, value: E2.sessionToken, options: { ...t10.cookies.sessionToken.options, expires: E2.expires } });
            if (await f2.signIn?.({ user: k2, account: _2, isNewUser: x2 }), x2 && p2.newUser) return { redirect: `${p2.newUser}${p2.newUser.includes("?") ? "&" : "?"}${new URLSearchParams({ callbackUrl: d2 })}`, cookies: n10 };
            return { redirect: d2, cookies: n10 };
          }
          if ("credentials" === c2.type && "POST" === o10) {
            let e11 = a10 ?? {};
            Object.entries(i10 ?? {}).forEach(([e12, t11]) => u2.searchParams.set(e12, t11));
            let l3 = await c2.authorize(e11, new Request(u2, { headers: s2, method: o10, body: JSON.stringify(a10) }));
            if (l3) l3.id = l3.id?.toString() ?? crypto.randomUUID();
            else throw new eq();
            let p3 = { providerAccountId: l3.id, type: "credentials", provider: c2.id }, m3 = await sn({ user: l3, account: p3, credentials: e11 }, t10);
            if (m3) return { redirect: m3, cookies: n10 };
            let w3 = { name: l3.name, email: l3.email, picture: l3.image, sub: l3.id }, b3 = await g2.jwt({ token: w3, user: l3, account: p3, isNewUser: false, trigger: "signIn" });
            if (null === b3) n10.push(...r10.clean());
            else {
              let e12 = t10.cookies.sessionToken.name, i11 = await h2.encode({ ...h2, token: b3, salt: e12 }), a11 = /* @__PURE__ */ new Date();
              a11.setTime(a11.getTime() + 1e3 * y2);
              let o11 = r10.chunk(i11, { expires: a11 });
              n10.push(...o11);
            }
            return await f2.signIn?.({ user: l3, account: p3 }), { redirect: d2, cookies: n10 };
          }
          if ("webauthn" === c2.type && "POST" === o10) {
            let i11, a11, o11;
            let s3 = e10.body?.action;
            if ("string" != typeof s3 || "authenticate" !== s3 && "register" !== s3) throw new ej("Invalid action parameter");
            let c3 = o9(t10);
            switch (s3) {
              case "authenticate": {
                let t11 = await o3(c3, e10, n10);
                i11 = t11.user, a11 = t11.account;
                break;
              }
              case "register": {
                let r11 = await o6(t10, e10, n10);
                i11 = r11.user, a11 = r11.account, o11 = r11.authenticator;
              }
            }
            await sn({ user: i11, account: a11 }, t10);
            let { user: l3, isNewUser: u3, session: m3, account: w3 } = await i0(r10.value, i11, a11, t10);
            if (!w3) throw new ej("Error creating or finding account");
            if (o11 && l3.id && await c3.adapter.createAuthenticator({ ...o11, userId: l3.id }), b2) {
              let e11 = { name: l3.name, email: l3.email, picture: l3.image, sub: l3.id?.toString() }, i12 = await g2.jwt({ token: e11, user: l3, account: w3, isNewUser: u3, trigger: u3 ? "signUp" : "signIn" });
              if (null === i12) n10.push(...r10.clean());
              else {
                let e12 = t10.cookies.sessionToken.name, a12 = await h2.encode({ ...h2, token: i12, salt: e12 }), o12 = /* @__PURE__ */ new Date();
                o12.setTime(o12.getTime() + 1e3 * y2);
                let s4 = r10.chunk(a12, { expires: o12 });
                n10.push(...s4);
              }
            } else n10.push({ name: t10.cookies.sessionToken.name, value: m3.sessionToken, options: { ...t10.cookies.sessionToken.options, expires: m3.expires } });
            if (await f2.signIn?.({ user: l3, account: w3, isNewUser: u3 }), u3 && p2.newUser) return { redirect: `${p2.newUser}${p2.newUser.includes("?") ? "&" : "?"}${new URLSearchParams({ callbackUrl: d2 })}`, cookies: n10 };
            return { redirect: d2, cookies: n10 };
          }
          throw new e7(`Callback for provider type (${c2.type}) is not supported`);
        } catch (t11) {
          if (t11 instanceof ej) throw t11;
          let e11 = new eK(t11, { provider: c2.id });
          throw w2.debug("callback route error details", { method: o10, query: i10, body: a10 }), e11;
        }
      }
      async function sn(e10, t10) {
        let r10;
        let { signIn: n10, redirect: i10 } = t10.callbacks;
        try {
          r10 = await n10(e10);
        } catch (e11) {
          if (e11 instanceof ej) throw e11;
          throw new eW(e11);
        }
        if (!r10) throw new eW("AccessDenied");
        if ("string" == typeof r10) return await i10({ url: r10, baseUrl: t10.url.origin });
      }
      async function si(e10, t10, r10, n10, i10) {
        let { adapter: a10, jwt: o10, events: s2, callbacks: c2, logger: l2, session: { strategy: u2, maxAge: d2 } } = e10, p2 = { body: null, headers: { "Content-Type": "application/json", ...!n10 && { "Cache-Control": "private, no-cache, no-store", Expires: "0", Pragma: "no-cache" } }, cookies: r10 }, h2 = t10.value;
        if (!h2) return p2;
        if ("jwt" === u2) {
          try {
            let r11 = e10.cookies.sessionToken.name, a11 = await o10.decode({ ...o10, token: h2, salt: r11 });
            if (!a11) throw Error("Invalid JWT");
            let l3 = await c2.jwt({ token: a11, ...n10 && { trigger: "update" }, session: i10 }), u3 = iQ(d2);
            if (null !== l3) {
              let e11 = { user: { name: l3.name, email: l3.email, image: l3.picture }, expires: u3.toISOString() }, n11 = await c2.session({ session: e11, token: l3 });
              p2.body = n11;
              let i11 = await o10.encode({ ...o10, token: l3, salt: r11 }), a12 = t10.chunk(i11, { expires: u3 });
              p2.cookies?.push(...a12), await s2.session?.({ session: n11, token: l3 });
            } else p2.cookies?.push(...t10.clean());
          } catch (e11) {
            l2.error(new eG(e11)), p2.cookies?.push(...t10.clean());
          }
          return p2;
        }
        try {
          let { getSessionAndUser: r11, deleteSession: o11, updateSession: l3 } = a10, u3 = await r11(h2);
          if (u3 && u3.session.expires.valueOf() < Date.now() && (await o11(h2), u3 = null), u3) {
            let { user: t11, session: r12 } = u3, a11 = e10.session.updateAge, o12 = r12.expires.valueOf() - 1e3 * d2 + 1e3 * a11, f2 = iQ(d2);
            o12 <= Date.now() && await l3({ sessionToken: h2, expires: f2 });
            let g2 = await c2.session({ session: { ...r12, user: t11 }, user: t11, newSession: i10, ...n10 ? { trigger: "update" } : {} });
            p2.body = g2, p2.cookies?.push({ name: e10.cookies.sessionToken.name, value: h2, options: { ...e10.cookies.sessionToken.options, expires: f2 } }), await s2.session?.({ session: g2 });
          } else h2 && p2.cookies?.push(...t10.clean());
        } catch (e11) {
          l2.error(new e5(e11));
        }
        return p2;
      }
      async function sa(e10, t10) {
        let r10, n10;
        let { logger: i10, provider: a10 } = t10, o10 = a10.authorization?.url;
        if (!o10 || "authjs.dev" === o10.host) {
          let e11 = new URL(a10.issuer), t11 = await af(e11, { [i9]: a10[nC], [i6]: true }), r11 = await ay(e11, t11).catch((t12) => {
            if (!(t12 instanceof TypeError) || "Invalid URL" !== t12.message) throw t12;
            throw TypeError(`Discovery request responded with an invalid issuer. expected: ${e11}`);
          });
          if (!r11.authorization_endpoint) throw TypeError("Authorization server did not provide an authorization endpoint.");
          o10 = new URL(r11.authorization_endpoint);
        }
        let s2 = o10.searchParams, c2 = a10.callbackUrl;
        !t10.isOnRedirectProxy && a10.redirectProxyUrl && (c2 = a10.redirectProxyUrl, n10 = a10.callbackUrl, i10.debug("using redirect proxy", { redirect_uri: c2, data: n10 }));
        let l2 = Object.assign({ response_type: "code", client_id: a10.clientId, redirect_uri: c2, ...a10.authorization?.params }, Object.fromEntries(a10.authorization?.url.searchParams ?? []), e10);
        for (let e11 in l2) s2.set(e11, l2[e11]);
        let u2 = [];
        a10.authorization?.url.searchParams.get("response_mode") === "form_post" && (t10.cookies.state.options.sameSite = "none", t10.cookies.state.options.secure = true, t10.cookies.nonce.options.sameSite = "none", t10.cookies.nonce.options.secure = true);
        let d2 = await oF.create(t10, n10);
        if (d2 && (s2.set("state", d2.value), u2.push(d2.cookie)), a10.checks?.includes("pkce")) {
          if (r10 && !r10.code_challenge_methods_supported?.includes("S256")) "oidc" === a10.type && (a10.checks = ["nonce"]);
          else {
            let { value: e11, cookie: r11 } = await oq.create(t10);
            s2.set("code_challenge", e11), s2.set("code_challenge_method", "S256"), u2.push(r11);
          }
        }
        let p2 = await oG.create(t10);
        return p2 && (s2.set("nonce", p2.value), u2.push(p2.cookie)), "oidc" !== a10.type || o10.searchParams.has("scope") || o10.searchParams.set("scope", "openid profile email"), i10.debug("authorization url is ready", { url: o10, cookies: u2, provider: a10 }), { redirect: o10.toString(), cookies: u2 };
      }
      async function so(e10, t10) {
        let r10;
        let { body: n10 } = e10, { provider: i10, callbacks: a10, adapter: o10 } = t10, s2 = (i10.normalizeIdentifier ?? function(e11) {
          if (!e11) throw Error("Missing email from request body.");
          let [t11, r11] = e11.toLowerCase().trim().split("@");
          return r11 = r11.split(",")[0], `${t11}@${r11}`;
        })(n10?.email), c2 = { id: crypto.randomUUID(), email: s2, emailVerified: null }, l2 = await o10.getUserByEmail(s2) ?? c2, u2 = { providerAccountId: s2, userId: l2.id, type: "email", provider: i10.id };
        try {
          r10 = await a10.signIn({ user: l2, account: u2, email: { verificationRequest: true } });
        } catch (e11) {
          throw new eW(e11);
        }
        if (!r10) throw new eW("AccessDenied");
        if ("string" == typeof r10) return { redirect: await a10.redirect({ url: r10, baseUrl: t10.url.origin }) };
        let { callbackUrl: d2, theme: p2 } = t10, h2 = await i10.generateVerificationToken?.() ?? nS(32), f2 = new Date(Date.now() + (i10.maxAge ?? 86400) * 1e3), g2 = i10.secret ?? t10.secret, m2 = new URL(t10.basePath, t10.url.origin), y2 = i10.sendVerificationRequest({ identifier: s2, token: h2, expires: f2, url: `${m2}/callback/${i10.id}?${new URLSearchParams({ callbackUrl: d2, token: h2, email: s2 })}`, provider: i10, theme: p2, request: new Request(e10.url, { headers: e10.headers, method: e10.method, body: "POST" === e10.method ? JSON.stringify(e10.body ?? {}) : void 0 }) }), w2 = o10.createVerificationToken?.({ identifier: s2, token: await n_(`${h2}${g2}`), expires: f2 });
        return await Promise.all([y2, w2]), { redirect: `${m2}/verify-request?${new URLSearchParams({ provider: i10.id, type: i10.type })}` };
      }
      async function ss(e10, t10, r10) {
        let n10 = `${r10.url.origin}${r10.basePath}/signin`;
        if (!r10.provider) return { redirect: n10, cookies: t10 };
        switch (r10.provider.type) {
          case "oauth":
          case "oidc": {
            let { redirect: n11, cookies: i10 } = await sa(e10.query, r10);
            return i10 && t10.push(...i10), { redirect: n11, cookies: t10 };
          }
          case "email":
            return { ...await so(e10, r10), cookies: t10 };
          default:
            return { redirect: n10, cookies: t10 };
        }
      }
      async function sc(e10, t10, r10) {
        let { jwt: n10, events: i10, callbackUrl: a10, logger: o10, session: s2 } = r10, c2 = t10.value;
        if (!c2) return { redirect: a10, cookies: e10 };
        try {
          if ("jwt" === s2.strategy) {
            let e11 = r10.cookies.sessionToken.name, t11 = await n10.decode({ ...n10, token: c2, salt: e11 });
            await i10.signOut?.({ token: t11 });
          } else {
            let e11 = await r10.adapter?.deleteSession(c2);
            await i10.signOut?.({ session: e11 });
          }
        } catch (e11) {
          o10.error(new e4(e11));
        }
        return e10.push(...t10.clean()), { redirect: a10, cookies: e10 };
      }
      async function sl(e10, t10) {
        let { adapter: r10, jwt: n10, session: { strategy: i10 } } = e10, a10 = t10.value;
        if (!a10) return null;
        if ("jwt" === i10) {
          let t11 = e10.cookies.sessionToken.name, r11 = await n10.decode({ ...n10, token: a10, salt: t11 });
          if (r11 && r11.sub) return { id: r11.sub, name: r11.name, email: r11.email, image: r11.picture };
        } else {
          let e11 = await r10?.getSessionAndUser(a10);
          if (e11) return e11.user;
        }
        return null;
      }
      async function su(e10, t10, r10, n10) {
        let i10 = o9(t10), { provider: a10 } = i10, { action: o10 } = e10.query ?? {};
        if ("register" !== o10 && "authenticate" !== o10 && void 0 !== o10) return { status: 400, body: { error: "Invalid action" }, cookies: n10, headers: { "Content-Type": "application/json" } };
        let s2 = await sl(t10, r10), c2 = s2 ? { user: s2, exists: true } : await a10.getUserInfo(t10, e10), l2 = c2?.user;
        switch (function(e11, t11, r11) {
          let { user: n11, exists: i11 = false } = r11 ?? {};
          switch (e11) {
            case "authenticate":
              return "authenticate";
            case "register":
              if (n11 && t11 === i11) return "register";
              break;
            case void 0:
              if (!t11) {
                if (!n11 || i11) return "authenticate";
                return "register";
              }
          }
          return null;
        }(o10, !!s2, c2)) {
          case "authenticate":
            return o5(i10, e10, l2, n10);
          case "register":
            if ("string" == typeof l2?.email) return o2(i10, e10, l2, n10);
            break;
          default:
            return { status: 400, body: { error: "Invalid request" }, cookies: n10, headers: { "Content-Type": "application/json" } };
        }
      }
      async function sd(e10, t10) {
        let { action: r10, providerId: n10, error: i10, method: a10 } = e10, o10 = t10.skipCSRFCheck === nT, { options: s2, cookies: c2 } = await n$({ authOptions: t10, action: r10, providerId: n10, url: e10.url, callbackUrl: e10.body?.callbackUrl ?? e10.query?.callbackUrl, csrfToken: e10.body?.csrfToken, cookies: e10.cookies, isPost: "POST" === a10, csrfDisabled: o10 }), l2 = new eM(s2.cookies.sessionToken, e10.cookies, s2.logger);
        if ("GET" === a10) {
          let t11 = iZ({ ...s2, query: e10.query, cookies: c2 });
          switch (r10) {
            case "callback":
              return await sr(e10, s2, l2, c2);
            case "csrf":
              return t11.csrf(o10, s2, c2);
            case "error":
              return t11.error(i10);
            case "providers":
              return t11.providers(s2.providers);
            case "session":
              return await si(s2, l2, c2);
            case "signin":
              return t11.signin(n10, i10);
            case "signout":
              return t11.signout();
            case "verify-request":
              return t11.verifyRequest();
            case "webauthn-options":
              return await su(e10, s2, l2, c2);
          }
        } else {
          let { csrfTokenVerified: t11 } = s2;
          switch (r10) {
            case "callback":
              return "credentials" === s2.provider.type && nE(r10, t11), await sr(e10, s2, l2, c2);
            case "session":
              return nE(r10, t11), await si(s2, l2, c2, true, e10.body?.data);
            case "signin":
              return nE(r10, t11), await ss(e10, c2, s2);
            case "signout":
              return nE(r10, t11), await sc(c2, l2, s2);
          }
        }
        throw new e8(`Cannot handle action: ${r10}`);
      }
      function sp(e10, t10, r10, n10, i10) {
        let a10;
        let o10 = i10?.basePath, s2 = n10.AUTH_URL ?? n10.NEXTAUTH_URL;
        if (s2) a10 = new URL(s2), o10 && "/" !== o10 && "/" !== a10.pathname && (a10.pathname !== o10 && nf(i10).warn("env-url-basepath-mismatch"), a10.pathname = "/");
        else {
          let e11 = r10.get("x-forwarded-host") ?? r10.get("host"), n11 = r10.get("x-forwarded-proto") ?? t10 ?? "https", i11 = n11.endsWith(":") ? n11 : n11 + ":";
          a10 = new URL(`${i11}//${e11}`);
        }
        let c2 = a10.toString().replace(/\/$/, "");
        if (o10) {
          let t11 = o10?.replace(/(^\/|\/$)/g, "") ?? "";
          return new URL(`${c2}/${t11}/${e10}`);
        }
        return new URL(`${c2}/${e10}`);
      }
      async function sh(e10, t10) {
        let r10 = nf(t10), n10 = await nb(e10, t10);
        if (!n10) return Response.json("Bad request.", { status: 400 });
        let i10 = function(e11, t11) {
          let { url: r11 } = e11, n11 = [];
          if (!tl && t11.debug && n11.push("debug-enabled"), !t11.trustHost) return new te(`Host must be trusted. URL was: ${e11.url}`);
          if (!t11.secret?.length) return new eQ("Please define a `secret`");
          let i11 = e11.query?.callbackUrl;
          if (i11 && !tu(i11, r11.origin)) return new eV(`Invalid callback URL. Received: ${i11}`);
          let { callbackUrl: a11 } = e$(t11.useSecureCookies ?? "https:" === r11.protocol), o11 = e11.cookies?.[t11.cookies?.callbackUrl?.name ?? a11.name];
          if (o11 && !tu(o11, r11.origin)) return new eV(`Invalid callback URL. Received: ${o11}`);
          let s2 = false;
          for (let e12 of t11.providers) {
            let t12 = "function" == typeof e12 ? e12() : e12;
            if (("oauth" === t12.type || "oidc" === t12.type) && !(t12.issuer ?? t12.options?.issuer)) {
              let e13;
              let { authorization: r12, token: n12, userinfo: i12 } = t12;
              if ("string" == typeof r12 || r12?.url ? "string" == typeof n12 || n12?.url ? "string" == typeof i12 || i12?.url || (e13 = "userinfo") : e13 = "token" : e13 = "authorization", e13) return new ez(`Provider "${t12.id}" is missing both \`issuer\` and \`${e13}\` endpoint config. At least one of them is required`);
            }
            if ("credentials" === t12.type) td = true;
            else if ("email" === t12.type) tp = true;
            else if ("webauthn" === t12.type) {
              var c2;
              if (th = true, t12.simpleWebAuthnBrowserVersion && (c2 = t12.simpleWebAuthnBrowserVersion, !/^v\d+(?:\.\d+){0,2}$/.test(c2))) return new ej(`Invalid provider config for "${t12.id}": simpleWebAuthnBrowserVersion "${t12.simpleWebAuthnBrowserVersion}" must be a valid semver string.`);
              if (t12.enableConditionalUI) {
                if (s2) return new ti("Multiple webauthn providers have 'enableConditionalUI' set to True. Only one provider can have this option enabled at a time");
                if (s2 = true, !Object.values(t12.formFields).some((e13) => e13.autocomplete && e13.autocomplete.toString().indexOf("webauthn") > -1)) return new ta(`Provider "${t12.id}" has 'enableConditionalUI' set to True, but none of its formFields have 'webauthn' in their autocomplete param`);
              }
            }
          }
          if (td) {
            let e12 = t11.session?.strategy === "database", r12 = !t11.providers.some((e13) => "credentials" !== ("function" == typeof e13 ? e13() : e13).type);
            if (e12 && r12) return new e9("Signing in with credentials only supported if JWT strategy is enabled");
            if (t11.providers.some((e13) => {
              let t12 = "function" == typeof e13 ? e13() : e13;
              return "credentials" === t12.type && !t12.authorize;
            })) return new eZ("Must define an authorize() handler to use credentials authentication provider");
          }
          let { adapter: l2, session: u2 } = t11, d2 = [];
          if (tp || u2?.strategy === "database" || !u2?.strategy && l2) {
            if (tp) {
              if (!l2) return new eX("Email login requires an adapter");
              d2.push(...tf);
            } else {
              if (!l2) return new eX("Database session requires an adapter");
              d2.push(...tg);
            }
          }
          if (th) {
            if (!t11.experimental?.enableWebAuthn) return new tc("WebAuthn is an experimental feature. To enable it, set `experimental.enableWebAuthn` to `true` in your config");
            if (n11.push("experimental-webauthn"), !l2) return new eX("WebAuthn requires an adapter");
            d2.push(...tm);
          }
          if (l2) {
            let e12 = d2.filter((e13) => !(e13 in l2));
            if (e12.length) return new eY(`Required adapter methods were missing: ${e12.join(", ")}`);
          }
          return tl || (tl = true), n11;
        }(n10, t10);
        if (Array.isArray(i10)) i10.forEach(r10.warn);
        else if (i10) {
          if (r10.error(i10), !(/* @__PURE__ */ new Set(["signin", "signout", "error", "verify-request"])).has(n10.action) || "GET" !== n10.method) return Response.json({ message: "There was a problem with the server configuration. Check the server logs for more information." }, { status: 500 });
          let { pages: e11, theme: a11 } = t10, o11 = e11?.error && n10.url.searchParams.get("callbackUrl")?.startsWith(e11.error);
          if (!e11?.error || o11) return o11 && r10.error(new eB(`The error page ${e11?.error} should not require authentication`)), nv(iZ({ theme: a11 }).error("Configuration"));
          let s2 = `${n10.url.origin}${e11.error}?error=Configuration`;
          return Response.redirect(s2);
        }
        let a10 = e10.headers?.has("X-Auth-Return-Redirect"), o10 = t10.raw === nP;
        try {
          let e11 = await sd(n10, t10);
          if (o10) return e11;
          let r11 = nv(e11), i11 = r11.headers.get("Location");
          if (!a10 || !i11) return r11;
          return Response.json({ url: i11 }, { headers: r11.headers });
        } catch (d2) {
          r10.error(d2);
          let i11 = d2 instanceof ej;
          if (i11 && o10 && !a10) throw d2;
          if ("POST" === e10.method && "session" === n10.action) return Response.json(null, { status: 400 });
          let s2 = new URLSearchParams({ error: d2 instanceof ej && tn.has(d2.type) ? d2.type : "Configuration" });
          d2 instanceof eq && s2.set("code", d2.code);
          let c2 = i11 && d2.kind || "error", l2 = t10.pages?.[c2] ?? `${t10.basePath}/${c2.toLowerCase()}`, u2 = `${n10.url.origin}${l2}?${s2}`;
          if (a10) return Response.json({ url: u2 });
          return Response.redirect(u2);
        }
      }
      function sf(e10) {
        let t10 = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
        if (!t10) return e10;
        let { origin: r10 } = new URL(t10), { href: n10, origin: i10 } = e10.nextUrl;
        return new K(n10.replace(i10, r10), e10);
      }
      function sg(e10) {
        try {
          e10.secret ?? (e10.secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET);
          let t10 = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
          if (!t10) return;
          let { pathname: r10 } = new URL(t10);
          if ("/" === r10) return;
          e10.basePath || (e10.basePath = r10);
        } catch {
        } finally {
          e10.basePath || (e10.basePath = "/api/auth"), function(e11, t10, r10 = false) {
            try {
              let n10 = e11.AUTH_URL;
              n10 && (t10.basePath ? r10 || nf(t10).warn("env-url-basepath-redundant") : t10.basePath = new URL(n10).pathname);
            } catch {
            } finally {
              t10.basePath ?? (t10.basePath = "/auth");
            }
            if (!t10.secret?.length) {
              t10.secret = [];
              let r11 = e11.AUTH_SECRET;
              for (let n10 of (r11 && t10.secret.push(r11), [1, 2, 3])) {
                let r12 = e11[`AUTH_SECRET_${n10}`];
                r12 && t10.secret.unshift(r12);
              }
            }
            t10.redirectProxyUrl ?? (t10.redirectProxyUrl = e11.AUTH_REDIRECT_PROXY_URL), t10.trustHost ?? (t10.trustHost = !!(e11.AUTH_URL ?? e11.AUTH_TRUST_HOST ?? e11.VERCEL ?? e11.CF_PAGES ?? "production" !== e11.NODE_ENV)), t10.providers = t10.providers.map((t11) => {
              let { id: r11 } = "function" == typeof t11 ? t11({}) : t11, n10 = r11.toUpperCase().replace(/-/g, "_"), i10 = e11[`AUTH_${n10}_ID`], a10 = e11[`AUTH_${n10}_SECRET`], o10 = e11[`AUTH_${n10}_ISSUER`], s2 = e11[`AUTH_${n10}_KEY`], c2 = "function" == typeof t11 ? t11({ clientId: i10, clientSecret: a10, issuer: o10, apiKey: s2 }) : t11;
              return "oauth" === c2.type || "oidc" === c2.type ? (c2.clientId ?? (c2.clientId = i10), c2.clientSecret ?? (c2.clientSecret = a10), c2.issuer ?? (c2.issuer = o10)) : "email" === c2.type && (c2.apiKey ?? (c2.apiKey = s2)), c2;
            });
          }(process.env, e10, true);
        }
      }
      r(340), "undefined" == typeof URLPattern || URLPattern;
      let sm = (0, ex.P)();
      var sy = r(479);
      class sw extends Error {
        constructor(e10) {
          super("Dynamic server usage: " + e10), this.description = e10, this.digest = "DYNAMIC_SERVER_USAGE";
        }
      }
      class sb extends Error {
        constructor(...e10) {
          super(...e10), this.code = "NEXT_STATIC_GEN_BAILOUT";
        }
      }
      let sv = "function" == typeof sy.unstable_postpone;
      function s_(e10, t10) {
        let r10 = new URL(e10.urlPathname, "http://n").pathname;
        if (e10.isUnstableCacheCallback) throw Error(`Route ${r10} used "${t10}" inside a function cached with "unstable_cache(...)". Accessing Dynamic data sources inside a cache scope is not supported. If you need this data inside a cached function use "${t10}" outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/app/api-reference/functions/unstable_cache`);
        if (e10.dynamicShouldError) throw new sb(`Route ${r10} with \`dynamic = "error"\` couldn't be rendered statically because it used \`${t10}\`. See more info here: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering`);
        if (e10.prerenderState) !function(e11, t11, r11) {
          !function() {
            if (!sv) throw Error("Invariant: React.unstable_postpone is not defined. This suggests the wrong version of React was loaded. This is a bug in Next.js");
          }();
          let n10 = `Route ${r11} needs to bail out of prerendering at this point because it used ${t11}. React throws this special object to indicate where. It should not be caught by your own try/catch. Learn more: https://nextjs.org/docs/messages/ppr-caught-error`;
          e11.dynamicAccesses.push({ stack: e11.isDebugSkeleton ? Error().stack : void 0, expression: t11 }), sy.unstable_postpone(n10);
        }(e10.prerenderState, t10, r10);
        else if (e10.revalidate = 0, e10.isStaticGeneration) {
          let n10 = new sw(`Route ${r10} couldn't be rendered statically because it used \`${t10}\`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error`);
          throw e10.dynamicUsageDescription = t10, e10.dynamicUsageStack = n10.stack, n10;
        }
      }
      function sS() {
        let e10 = "headers", t10 = ee.A.getStore();
        if (t10) {
          if (t10.forceStatic) return Q.seal(new Headers({}));
          s_(t10, e10);
        }
        return eT(e10).headers;
      }
      function sk() {
        let e10 = "cookies", t10 = ee.A.getStore();
        if (t10) {
          if (t10.forceStatic) return er.seal(new H.RequestCookies(new Headers({})));
          s_(t10, e10);
        }
        let r10 = eT(e10), n10 = sm.getStore();
        return (null == n10 ? void 0 : n10.isAction) || (null == n10 ? void 0 : n10.isAppRoute) ? r10.mutableCookies : r10.cookies;
      }
      async function sE(e10, t10) {
        return sh(new Request(sp("session", e10.get("x-forwarded-proto"), e10, process.env, t10), { headers: { cookie: e10.get("cookie") ?? "" } }), { ...t10, callbacks: { ...t10.callbacks, async session(...e11) {
          let r10 = await t10.callbacks?.session?.(...e11) ?? { ...e11[0].session, expires: e11[0].session.expires?.toISOString?.() ?? e11[0].session.expires };
          return { user: e11[0].user ?? e11[0].token, ...r10 };
        } } });
      }
      function sx(e10) {
        return "function" == typeof e10;
      }
      function sA(e10, t10) {
        return "function" == typeof e10 ? async (...r10) => {
          if (!r10.length) {
            let r11 = await sS(), n11 = await e10(void 0);
            return t10?.(n11), sE(r11, n11).then((e11) => e11.json());
          }
          if (r10[0] instanceof Request) {
            let n11 = r10[0], i11 = r10[1], a11 = await e10(n11);
            return t10?.(a11), sT([n11, i11], a11);
          }
          if (sx(r10[0])) {
            let n11 = r10[0];
            return async (...r11) => {
              let i11 = await e10(r11[0]);
              return t10?.(i11), sT(r11, i11, n11);
            };
          }
          let n10 = "req" in r10[0] ? r10[0].req : r10[0], i10 = "res" in r10[0] ? r10[0].res : r10[1], a10 = await e10(n10);
          return t10?.(a10), sE(new Headers(n10.headers), a10).then(async (e11) => {
            let t11 = await e11.json();
            for (let t12 of e11.headers.getSetCookie()) "headers" in i10 ? i10.headers.append("set-cookie", t12) : i10.appendHeader("set-cookie", t12);
            return t11;
          });
        } : (...t11) => {
          if (!t11.length) return Promise.resolve(sS()).then((t12) => sE(t12, e10).then((e11) => e11.json()));
          if (t11[0] instanceof Request) return sT([t11[0], t11[1]], e10);
          if (sx(t11[0])) {
            let r11 = t11[0];
            return async (...t12) => sT(t12, e10, r11).then((e11) => e11);
          }
          let r10 = "req" in t11[0] ? t11[0].req : t11[0], n10 = "res" in t11[0] ? t11[0].res : t11[1];
          return sE(new Headers(r10.headers), e10).then(async (e11) => {
            let t12 = await e11.json();
            for (let t13 of e11.headers.getSetCookie()) "headers" in n10 ? n10.headers.append("set-cookie", t13) : n10.appendHeader("set-cookie", t13);
            return t12;
          });
        };
      }
      async function sT(e10, t10, r10) {
        let n10 = sf(e10[0]), i10 = await sE(n10.headers, t10), a10 = await i10.json(), o10 = true;
        t10.callbacks?.authorized && (o10 = await t10.callbacks.authorized({ request: n10, auth: a10 }));
        let s2 = z.next?.();
        if (o10 instanceof Response) {
          s2 = o10;
          let e11 = o10.headers.get("Location"), { pathname: r11 } = n10.nextUrl;
          e11 && function(e12, t11, r12) {
            let n11 = t11.replace(`${e12}/`, ""), i11 = Object.values(r12.pages ?? {});
            return (sP.has(n11) || i11.includes(t11)) && t11 === e12;
          }(r11, new URL(e11).pathname, t10) && (o10 = true);
        } else if (r10) n10.auth = a10, s2 = await r10(n10, e10[1]) ?? z.next();
        else if (!o10) {
          let e11 = t10.pages?.signIn ?? `${t10.basePath}/signin`;
          if (n10.nextUrl.pathname !== e11) {
            let t11 = n10.nextUrl.clone();
            t11.pathname = e11, t11.searchParams.set("callbackUrl", n10.nextUrl.href), s2 = z.redirect(t11);
          }
        }
        let c2 = new Response(s2?.body, s2);
        for (let e11 of i10.headers.getSetCookie()) c2.headers.append("set-cookie", e11);
        return c2;
      }
      let sP = /* @__PURE__ */ new Set(["providers", "session", "csrf", "signin", "signout", "callback", "verify-request", "error"]);
      !function(e10) {
        e10[e10.SeeOther = 303] = "SeeOther", e10[e10.TemporaryRedirect = 307] = "TemporaryRedirect", e10[e10.PermanentRedirect = 308] = "PermanentRedirect";
      }(u || (u = {}));
      let sC = "NEXT_REDIRECT";
      function sR(e10, t10) {
        void 0 === t10 && (t10 = "replace");
        let r10 = sm.getStore();
        throw function(e11, t11, r11) {
          void 0 === r11 && (r11 = u.TemporaryRedirect);
          let n10 = Error(sC);
          n10.digest = sC + ";" + t11 + ";" + e11 + ";" + r11 + ";";
          let i10 = eA.getStore();
          return i10 && (n10.mutableCookies = i10.mutableCookies), n10;
        }(e10, t10, (null == r10 ? void 0 : r10.isAction) ? u.SeeOther : u.TemporaryRedirect);
      }
      async function sO(e10, t10 = {}, r10, n10) {
        let i10 = new Headers(await sS()), { redirect: a10 = true, redirectTo: o10, ...s2 } = t10 instanceof FormData ? Object.fromEntries(t10) : t10, c2 = o10?.toString() ?? i10.get("Referer") ?? "/", l2 = sp("signin", i10.get("x-forwarded-proto"), i10, process.env, n10);
        if (!e10) return l2.searchParams.append("callbackUrl", c2), a10 && sR(l2.toString()), l2.toString();
        let u2 = `${l2}/${e10}?${new URLSearchParams(r10)}`, d2 = {};
        for (let t11 of n10.providers) {
          let { options: r11, ...n11 } = "function" == typeof t11 ? t11() : t11, i11 = r11?.id ?? n11.id;
          if (i11 === e10) {
            d2 = { id: i11, type: r11?.type ?? n11.type };
            break;
          }
        }
        if (!d2.id) {
          let e11 = `${l2}?${new URLSearchParams({ callbackUrl: c2 })}`;
          return a10 && sR(e11), e11;
        }
        "credentials" === d2.type && (u2 = u2.replace("signin", "callback")), i10.set("Content-Type", "application/x-www-form-urlencoded");
        let p2 = new Request(u2, { method: "POST", headers: i10, body: new URLSearchParams({ ...s2, callbackUrl: c2 }) }), h2 = await sh(p2, { ...n10, raw: nP, skipCSRFCheck: nT }), f2 = await sk();
        for (let e11 of h2?.cookies ?? []) f2.set(e11.name, e11.value, e11.options);
        let g2 = (h2 instanceof Response ? h2.headers.get("Location") : h2.redirect) ?? u2;
        return a10 ? sR(g2) : g2;
      }
      async function sI(e10, t10) {
        let r10 = new Headers(await sS());
        r10.set("Content-Type", "application/x-www-form-urlencoded");
        let n10 = sp("signout", r10.get("x-forwarded-proto"), r10, process.env, t10), i10 = new URLSearchParams({ callbackUrl: e10?.redirectTo ?? r10.get("Referer") ?? "/" }), a10 = new Request(n10, { method: "POST", headers: r10, body: i10 }), o10 = await sh(a10, { ...t10, raw: nP, skipCSRFCheck: nT }), s2 = await sk();
        for (let e11 of o10?.cookies ?? []) s2.set(e11.name, e11.value, e11.options);
        return e10?.redirect ?? true ? sR(o10.redirect) : o10;
      }
      async function sU(e10, t10) {
        let r10 = new Headers(await sS());
        r10.set("Content-Type", "application/json");
        let n10 = new Request(sp("session", r10.get("x-forwarded-proto"), r10, process.env, t10), { method: "POST", headers: r10, body: JSON.stringify({ data: e10 }) }), i10 = await sh(n10, { ...t10, raw: nP, skipCSRFCheck: nT }), a10 = await sk();
        for (let e11 of i10?.cookies ?? []) a10.set(e11.name, e11.value, e11.options);
        return i10.body;
      }
      !function(e10) {
        e10.push = "push", e10.replace = "replace";
      }(d || (d = {}));
      let sN = ["mattiapetrucciani@gmail.com", "mattiapetrucciani@mac.com", "mattia@freeriverhouse.com", "mattia@onde.la", "magmaticxr@gmail.com", "freeriverhouse@gmail.com"], { handlers: sL, auth: s$, signIn: sM, signOut: sj } = function(e10) {
        if ("function" == typeof e10) {
          let t11 = async (t12) => {
            let r10 = await e10(t12);
            return sg(r10), sh(sf(t12), r10);
          };
          return { handlers: { GET: t11, POST: t11 }, auth: sA(e10, (e11) => sg(e11)), signIn: async (t12, r10, n10) => {
            let i10 = await e10(void 0);
            return sg(i10), sO(t12, r10, n10, i10);
          }, signOut: async (t12) => {
            let r10 = await e10(void 0);
            return sg(r10), sI(t12, r10);
          }, unstable_update: async (t12) => {
            let r10 = await e10(void 0);
            return sg(r10), sU(t12, r10);
          } };
        }
        sg(e10);
        let t10 = (t11) => sh(sf(t11), e10);
        return { handlers: { GET: t10, POST: t10 }, auth: sA(e10), signIn: (t11, r10, n10) => sO(t11, r10, n10, e10), signOut: (t11) => sI(t11, e10), unstable_update: (t11) => sU(t11, e10) };
      }({ secret: process.env.AUTH_SECRET || globalThis.AUTH_SECRET || "", providers: [{ id: "google", name: "Google", type: "oidc", issuer: "https://accounts.google.com", style: { brandColor: "#1a73e8" }, options: { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET } }], callbacks: { signIn: async ({ user: e10 }) => {
        var t10;
        return !!(e10.email && (t10 = e10.email, sN.includes(t10.toLowerCase()))) || "https://onde.la";
      }, session: async ({ session: e10 }) => e10 }, pages: { signIn: "/login", error: "/coming-soon" }, trustHost: true }), sD = ["/login", "/coming-soon", "/api/auth"], sH = s$((e10) => {
        let { pathname: t10 } = e10.nextUrl;
        if (sD.some((e11) => t10 === e11 || t10.startsWith(e11 + "/")) || t10.startsWith("/_next") || t10.startsWith("/static") || t10.includes(".")) return z.next();
        if (!e10.auth?.user?.email) {
          let r10 = new URL("/login", e10.url);
          return r10.searchParams.set("callbackUrl", t10), z.redirect(r10);
        }
        return z.next();
      }), sW = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] }, sK = { ...h }, sB = sK.middleware || sK.default, sJ = "/src/middleware";
      if ("function" != typeof sB) throw Error(`The Middleware "${sJ}" must export a \`middleware\` or a \`default\` function`);
      function sV(e10) {
        return eU({ ...e10, page: sJ, handler: sB });
      }
    }, 945: (e) => {
      "use strict";
      var t = Object.defineProperty, r = Object.getOwnPropertyDescriptor, n = Object.getOwnPropertyNames, i = Object.prototype.hasOwnProperty, a = {};
      function o(e2) {
        var t2;
        let r2 = ["path" in e2 && e2.path && `Path=${e2.path}`, "expires" in e2 && (e2.expires || 0 === e2.expires) && `Expires=${("number" == typeof e2.expires ? new Date(e2.expires) : e2.expires).toUTCString()}`, "maxAge" in e2 && "number" == typeof e2.maxAge && `Max-Age=${e2.maxAge}`, "domain" in e2 && e2.domain && `Domain=${e2.domain}`, "secure" in e2 && e2.secure && "Secure", "httpOnly" in e2 && e2.httpOnly && "HttpOnly", "sameSite" in e2 && e2.sameSite && `SameSite=${e2.sameSite}`, "partitioned" in e2 && e2.partitioned && "Partitioned", "priority" in e2 && e2.priority && `Priority=${e2.priority}`].filter(Boolean), n2 = `${e2.name}=${encodeURIComponent(null != (t2 = e2.value) ? t2 : "")}`;
        return 0 === r2.length ? n2 : `${n2}; ${r2.join("; ")}`;
      }
      function s(e2) {
        let t2 = /* @__PURE__ */ new Map();
        for (let r2 of e2.split(/; */)) {
          if (!r2) continue;
          let e3 = r2.indexOf("=");
          if (-1 === e3) {
            t2.set(r2, "true");
            continue;
          }
          let [n2, i2] = [r2.slice(0, e3), r2.slice(e3 + 1)];
          try {
            t2.set(n2, decodeURIComponent(null != i2 ? i2 : "true"));
          } catch {
          }
        }
        return t2;
      }
      function c(e2) {
        var t2, r2;
        if (!e2) return;
        let [[n2, i2], ...a2] = s(e2), { domain: o2, expires: c2, httponly: d2, maxage: p2, path: h, samesite: f, secure: g, partitioned: m, priority: y } = Object.fromEntries(a2.map(([e3, t3]) => [e3.toLowerCase(), t3]));
        return function(e3) {
          let t3 = {};
          for (let r3 in e3) e3[r3] && (t3[r3] = e3[r3]);
          return t3;
        }({ name: n2, value: decodeURIComponent(i2), domain: o2, ...c2 && { expires: new Date(c2) }, ...d2 && { httpOnly: true }, ..."string" == typeof p2 && { maxAge: Number(p2) }, path: h, ...f && { sameSite: l.includes(t2 = (t2 = f).toLowerCase()) ? t2 : void 0 }, ...g && { secure: true }, ...y && { priority: u.includes(r2 = (r2 = y).toLowerCase()) ? r2 : void 0 }, ...m && { partitioned: true } });
      }
      ((e2, r2) => {
        for (var n2 in r2) t(e2, n2, { get: r2[n2], enumerable: true });
      })(a, { RequestCookies: () => d, ResponseCookies: () => p, parseCookie: () => s, parseSetCookie: () => c, stringifyCookie: () => o }), e.exports = ((e2, a2, o2, s2) => {
        if (a2 && "object" == typeof a2 || "function" == typeof a2) for (let c2 of n(a2)) i.call(e2, c2) || c2 === o2 || t(e2, c2, { get: () => a2[c2], enumerable: !(s2 = r(a2, c2)) || s2.enumerable });
        return e2;
      })(t({}, "__esModule", { value: true }), a);
      var l = ["strict", "lax", "none"], u = ["low", "medium", "high"], d = class {
        constructor(e2) {
          this._parsed = /* @__PURE__ */ new Map(), this._headers = e2;
          let t2 = e2.get("cookie");
          if (t2) for (let [e3, r2] of s(t2)) this._parsed.set(e3, { name: e3, value: r2 });
        }
        [Symbol.iterator]() {
          return this._parsed[Symbol.iterator]();
        }
        get size() {
          return this._parsed.size;
        }
        get(...e2) {
          let t2 = "string" == typeof e2[0] ? e2[0] : e2[0].name;
          return this._parsed.get(t2);
        }
        getAll(...e2) {
          var t2;
          let r2 = Array.from(this._parsed);
          if (!e2.length) return r2.map(([e3, t3]) => t3);
          let n2 = "string" == typeof e2[0] ? e2[0] : null == (t2 = e2[0]) ? void 0 : t2.name;
          return r2.filter(([e3]) => e3 === n2).map(([e3, t3]) => t3);
        }
        has(e2) {
          return this._parsed.has(e2);
        }
        set(...e2) {
          let [t2, r2] = 1 === e2.length ? [e2[0].name, e2[0].value] : e2, n2 = this._parsed;
          return n2.set(t2, { name: t2, value: r2 }), this._headers.set("cookie", Array.from(n2).map(([e3, t3]) => o(t3)).join("; ")), this;
        }
        delete(e2) {
          let t2 = this._parsed, r2 = Array.isArray(e2) ? e2.map((e3) => t2.delete(e3)) : t2.delete(e2);
          return this._headers.set("cookie", Array.from(t2).map(([e3, t3]) => o(t3)).join("; ")), r2;
        }
        clear() {
          return this.delete(Array.from(this._parsed.keys())), this;
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return `RequestCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`;
        }
        toString() {
          return [...this._parsed.values()].map((e2) => `${e2.name}=${encodeURIComponent(e2.value)}`).join("; ");
        }
      }, p = class {
        constructor(e2) {
          var t2, r2, n2;
          this._parsed = /* @__PURE__ */ new Map(), this._headers = e2;
          let i2 = null != (n2 = null != (r2 = null == (t2 = e2.getSetCookie) ? void 0 : t2.call(e2)) ? r2 : e2.get("set-cookie")) ? n2 : [];
          for (let e3 of Array.isArray(i2) ? i2 : function(e4) {
            if (!e4) return [];
            var t3, r3, n3, i3, a2, o2 = [], s2 = 0;
            function c2() {
              for (; s2 < e4.length && /\s/.test(e4.charAt(s2)); ) s2 += 1;
              return s2 < e4.length;
            }
            for (; s2 < e4.length; ) {
              for (t3 = s2, a2 = false; c2(); ) if ("," === (r3 = e4.charAt(s2))) {
                for (n3 = s2, s2 += 1, c2(), i3 = s2; s2 < e4.length && "=" !== (r3 = e4.charAt(s2)) && ";" !== r3 && "," !== r3; ) s2 += 1;
                s2 < e4.length && "=" === e4.charAt(s2) ? (a2 = true, s2 = i3, o2.push(e4.substring(t3, n3)), t3 = s2) : s2 = n3 + 1;
              } else s2 += 1;
              (!a2 || s2 >= e4.length) && o2.push(e4.substring(t3, e4.length));
            }
            return o2;
          }(i2)) {
            let t3 = c(e3);
            t3 && this._parsed.set(t3.name, t3);
          }
        }
        get(...e2) {
          let t2 = "string" == typeof e2[0] ? e2[0] : e2[0].name;
          return this._parsed.get(t2);
        }
        getAll(...e2) {
          var t2;
          let r2 = Array.from(this._parsed.values());
          if (!e2.length) return r2;
          let n2 = "string" == typeof e2[0] ? e2[0] : null == (t2 = e2[0]) ? void 0 : t2.name;
          return r2.filter((e3) => e3.name === n2);
        }
        has(e2) {
          return this._parsed.has(e2);
        }
        set(...e2) {
          let [t2, r2, n2] = 1 === e2.length ? [e2[0].name, e2[0].value, e2[0]] : e2, i2 = this._parsed;
          return i2.set(t2, function(e3 = { name: "", value: "" }) {
            return "number" == typeof e3.expires && (e3.expires = new Date(e3.expires)), e3.maxAge && (e3.expires = new Date(Date.now() + 1e3 * e3.maxAge)), (null === e3.path || void 0 === e3.path) && (e3.path = "/"), e3;
          }({ name: t2, value: r2, ...n2 })), function(e3, t3) {
            for (let [, r3] of (t3.delete("set-cookie"), e3)) {
              let e4 = o(r3);
              t3.append("set-cookie", e4);
            }
          }(i2, this._headers), this;
        }
        delete(...e2) {
          let [t2, r2, n2] = "string" == typeof e2[0] ? [e2[0]] : [e2[0].name, e2[0].path, e2[0].domain];
          return this.set({ name: t2, path: r2, domain: n2, value: "", expires: /* @__PURE__ */ new Date(0) });
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return `ResponseCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`;
        }
        toString() {
          return [...this._parsed.values()].map(o).join("; ");
        }
      };
    }, 439: (e, t, r) => {
      (() => {
        "use strict";
        var t2 = { 491: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.ContextAPI = void 0;
          let n2 = r2(223), i2 = r2(172), a2 = r2(930), o = "context", s = new n2.NoopContextManager();
          class c {
            constructor() {
            }
            static getInstance() {
              return this._instance || (this._instance = new c()), this._instance;
            }
            setGlobalContextManager(e3) {
              return (0, i2.registerGlobal)(o, e3, a2.DiagAPI.instance());
            }
            active() {
              return this._getContextManager().active();
            }
            with(e3, t4, r3, ...n3) {
              return this._getContextManager().with(e3, t4, r3, ...n3);
            }
            bind(e3, t4) {
              return this._getContextManager().bind(e3, t4);
            }
            _getContextManager() {
              return (0, i2.getGlobal)(o) || s;
            }
            disable() {
              this._getContextManager().disable(), (0, i2.unregisterGlobal)(o, a2.DiagAPI.instance());
            }
          }
          t3.ContextAPI = c;
        }, 930: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.DiagAPI = void 0;
          let n2 = r2(56), i2 = r2(912), a2 = r2(957), o = r2(172);
          class s {
            constructor() {
              function e3(e4) {
                return function(...t5) {
                  let r3 = (0, o.getGlobal)("diag");
                  if (r3) return r3[e4](...t5);
                };
              }
              let t4 = this;
              t4.setLogger = (e4, r3 = { logLevel: a2.DiagLogLevel.INFO }) => {
                var n3, s2, c;
                if (e4 === t4) {
                  let e5 = Error("Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation");
                  return t4.error(null !== (n3 = e5.stack) && void 0 !== n3 ? n3 : e5.message), false;
                }
                "number" == typeof r3 && (r3 = { logLevel: r3 });
                let l = (0, o.getGlobal)("diag"), u = (0, i2.createLogLevelDiagLogger)(null !== (s2 = r3.logLevel) && void 0 !== s2 ? s2 : a2.DiagLogLevel.INFO, e4);
                if (l && !r3.suppressOverrideMessage) {
                  let e5 = null !== (c = Error().stack) && void 0 !== c ? c : "<failed to generate stacktrace>";
                  l.warn(`Current logger will be overwritten from ${e5}`), u.warn(`Current logger will overwrite one already registered from ${e5}`);
                }
                return (0, o.registerGlobal)("diag", u, t4, true);
              }, t4.disable = () => {
                (0, o.unregisterGlobal)("diag", t4);
              }, t4.createComponentLogger = (e4) => new n2.DiagComponentLogger(e4), t4.verbose = e3("verbose"), t4.debug = e3("debug"), t4.info = e3("info"), t4.warn = e3("warn"), t4.error = e3("error");
            }
            static instance() {
              return this._instance || (this._instance = new s()), this._instance;
            }
          }
          t3.DiagAPI = s;
        }, 653: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.MetricsAPI = void 0;
          let n2 = r2(660), i2 = r2(172), a2 = r2(930), o = "metrics";
          class s {
            constructor() {
            }
            static getInstance() {
              return this._instance || (this._instance = new s()), this._instance;
            }
            setGlobalMeterProvider(e3) {
              return (0, i2.registerGlobal)(o, e3, a2.DiagAPI.instance());
            }
            getMeterProvider() {
              return (0, i2.getGlobal)(o) || n2.NOOP_METER_PROVIDER;
            }
            getMeter(e3, t4, r3) {
              return this.getMeterProvider().getMeter(e3, t4, r3);
            }
            disable() {
              (0, i2.unregisterGlobal)(o, a2.DiagAPI.instance());
            }
          }
          t3.MetricsAPI = s;
        }, 181: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.PropagationAPI = void 0;
          let n2 = r2(172), i2 = r2(874), a2 = r2(194), o = r2(277), s = r2(369), c = r2(930), l = "propagation", u = new i2.NoopTextMapPropagator();
          class d {
            constructor() {
              this.createBaggage = s.createBaggage, this.getBaggage = o.getBaggage, this.getActiveBaggage = o.getActiveBaggage, this.setBaggage = o.setBaggage, this.deleteBaggage = o.deleteBaggage;
            }
            static getInstance() {
              return this._instance || (this._instance = new d()), this._instance;
            }
            setGlobalPropagator(e3) {
              return (0, n2.registerGlobal)(l, e3, c.DiagAPI.instance());
            }
            inject(e3, t4, r3 = a2.defaultTextMapSetter) {
              return this._getGlobalPropagator().inject(e3, t4, r3);
            }
            extract(e3, t4, r3 = a2.defaultTextMapGetter) {
              return this._getGlobalPropagator().extract(e3, t4, r3);
            }
            fields() {
              return this._getGlobalPropagator().fields();
            }
            disable() {
              (0, n2.unregisterGlobal)(l, c.DiagAPI.instance());
            }
            _getGlobalPropagator() {
              return (0, n2.getGlobal)(l) || u;
            }
          }
          t3.PropagationAPI = d;
        }, 997: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.TraceAPI = void 0;
          let n2 = r2(172), i2 = r2(846), a2 = r2(139), o = r2(607), s = r2(930), c = "trace";
          class l {
            constructor() {
              this._proxyTracerProvider = new i2.ProxyTracerProvider(), this.wrapSpanContext = a2.wrapSpanContext, this.isSpanContextValid = a2.isSpanContextValid, this.deleteSpan = o.deleteSpan, this.getSpan = o.getSpan, this.getActiveSpan = o.getActiveSpan, this.getSpanContext = o.getSpanContext, this.setSpan = o.setSpan, this.setSpanContext = o.setSpanContext;
            }
            static getInstance() {
              return this._instance || (this._instance = new l()), this._instance;
            }
            setGlobalTracerProvider(e3) {
              let t4 = (0, n2.registerGlobal)(c, this._proxyTracerProvider, s.DiagAPI.instance());
              return t4 && this._proxyTracerProvider.setDelegate(e3), t4;
            }
            getTracerProvider() {
              return (0, n2.getGlobal)(c) || this._proxyTracerProvider;
            }
            getTracer(e3, t4) {
              return this.getTracerProvider().getTracer(e3, t4);
            }
            disable() {
              (0, n2.unregisterGlobal)(c, s.DiagAPI.instance()), this._proxyTracerProvider = new i2.ProxyTracerProvider();
            }
          }
          t3.TraceAPI = l;
        }, 277: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.deleteBaggage = t3.setBaggage = t3.getActiveBaggage = t3.getBaggage = void 0;
          let n2 = r2(491), i2 = (0, r2(780).createContextKey)("OpenTelemetry Baggage Key");
          function a2(e3) {
            return e3.getValue(i2) || void 0;
          }
          t3.getBaggage = a2, t3.getActiveBaggage = function() {
            return a2(n2.ContextAPI.getInstance().active());
          }, t3.setBaggage = function(e3, t4) {
            return e3.setValue(i2, t4);
          }, t3.deleteBaggage = function(e3) {
            return e3.deleteValue(i2);
          };
        }, 993: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.BaggageImpl = void 0;
          class r2 {
            constructor(e3) {
              this._entries = e3 ? new Map(e3) : /* @__PURE__ */ new Map();
            }
            getEntry(e3) {
              let t4 = this._entries.get(e3);
              if (t4) return Object.assign({}, t4);
            }
            getAllEntries() {
              return Array.from(this._entries.entries()).map(([e3, t4]) => [e3, t4]);
            }
            setEntry(e3, t4) {
              let n2 = new r2(this._entries);
              return n2._entries.set(e3, t4), n2;
            }
            removeEntry(e3) {
              let t4 = new r2(this._entries);
              return t4._entries.delete(e3), t4;
            }
            removeEntries(...e3) {
              let t4 = new r2(this._entries);
              for (let r3 of e3) t4._entries.delete(r3);
              return t4;
            }
            clear() {
              return new r2();
            }
          }
          t3.BaggageImpl = r2;
        }, 830: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.baggageEntryMetadataSymbol = void 0, t3.baggageEntryMetadataSymbol = Symbol("BaggageEntryMetadata");
        }, 369: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.baggageEntryMetadataFromString = t3.createBaggage = void 0;
          let n2 = r2(930), i2 = r2(993), a2 = r2(830), o = n2.DiagAPI.instance();
          t3.createBaggage = function(e3 = {}) {
            return new i2.BaggageImpl(new Map(Object.entries(e3)));
          }, t3.baggageEntryMetadataFromString = function(e3) {
            return "string" != typeof e3 && (o.error(`Cannot create baggage metadata from unknown type: ${typeof e3}`), e3 = ""), { __TYPE__: a2.baggageEntryMetadataSymbol, toString: () => e3 };
          };
        }, 67: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.context = void 0;
          let n2 = r2(491);
          t3.context = n2.ContextAPI.getInstance();
        }, 223: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.NoopContextManager = void 0;
          let n2 = r2(780);
          class i2 {
            active() {
              return n2.ROOT_CONTEXT;
            }
            with(e3, t4, r3, ...n3) {
              return t4.call(r3, ...n3);
            }
            bind(e3, t4) {
              return t4;
            }
            enable() {
              return this;
            }
            disable() {
              return this;
            }
          }
          t3.NoopContextManager = i2;
        }, 780: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.ROOT_CONTEXT = t3.createContextKey = void 0, t3.createContextKey = function(e3) {
            return Symbol.for(e3);
          };
          class r2 {
            constructor(e3) {
              let t4 = this;
              t4._currentContext = e3 ? new Map(e3) : /* @__PURE__ */ new Map(), t4.getValue = (e4) => t4._currentContext.get(e4), t4.setValue = (e4, n2) => {
                let i2 = new r2(t4._currentContext);
                return i2._currentContext.set(e4, n2), i2;
              }, t4.deleteValue = (e4) => {
                let n2 = new r2(t4._currentContext);
                return n2._currentContext.delete(e4), n2;
              };
            }
          }
          t3.ROOT_CONTEXT = new r2();
        }, 506: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.diag = void 0;
          let n2 = r2(930);
          t3.diag = n2.DiagAPI.instance();
        }, 56: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.DiagComponentLogger = void 0;
          let n2 = r2(172);
          class i2 {
            constructor(e3) {
              this._namespace = e3.namespace || "DiagComponentLogger";
            }
            debug(...e3) {
              return a2("debug", this._namespace, e3);
            }
            error(...e3) {
              return a2("error", this._namespace, e3);
            }
            info(...e3) {
              return a2("info", this._namespace, e3);
            }
            warn(...e3) {
              return a2("warn", this._namespace, e3);
            }
            verbose(...e3) {
              return a2("verbose", this._namespace, e3);
            }
          }
          function a2(e3, t4, r3) {
            let i3 = (0, n2.getGlobal)("diag");
            if (i3) return r3.unshift(t4), i3[e3](...r3);
          }
          t3.DiagComponentLogger = i2;
        }, 972: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.DiagConsoleLogger = void 0;
          let r2 = [{ n: "error", c: "error" }, { n: "warn", c: "warn" }, { n: "info", c: "info" }, { n: "debug", c: "debug" }, { n: "verbose", c: "trace" }];
          class n2 {
            constructor() {
              for (let e3 = 0; e3 < r2.length; e3++) this[r2[e3].n] = /* @__PURE__ */ function(e4) {
                return function(...t4) {
                  if (console) {
                    let r3 = console[e4];
                    if ("function" != typeof r3 && (r3 = console.log), "function" == typeof r3) return r3.apply(console, t4);
                  }
                };
              }(r2[e3].c);
            }
          }
          t3.DiagConsoleLogger = n2;
        }, 912: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.createLogLevelDiagLogger = void 0;
          let n2 = r2(957);
          t3.createLogLevelDiagLogger = function(e3, t4) {
            function r3(r4, n3) {
              let i2 = t4[r4];
              return "function" == typeof i2 && e3 >= n3 ? i2.bind(t4) : function() {
              };
            }
            return e3 < n2.DiagLogLevel.NONE ? e3 = n2.DiagLogLevel.NONE : e3 > n2.DiagLogLevel.ALL && (e3 = n2.DiagLogLevel.ALL), t4 = t4 || {}, { error: r3("error", n2.DiagLogLevel.ERROR), warn: r3("warn", n2.DiagLogLevel.WARN), info: r3("info", n2.DiagLogLevel.INFO), debug: r3("debug", n2.DiagLogLevel.DEBUG), verbose: r3("verbose", n2.DiagLogLevel.VERBOSE) };
          };
        }, 957: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.DiagLogLevel = void 0, function(e3) {
            e3[e3.NONE = 0] = "NONE", e3[e3.ERROR = 30] = "ERROR", e3[e3.WARN = 50] = "WARN", e3[e3.INFO = 60] = "INFO", e3[e3.DEBUG = 70] = "DEBUG", e3[e3.VERBOSE = 80] = "VERBOSE", e3[e3.ALL = 9999] = "ALL";
          }(t3.DiagLogLevel || (t3.DiagLogLevel = {}));
        }, 172: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.unregisterGlobal = t3.getGlobal = t3.registerGlobal = void 0;
          let n2 = r2(200), i2 = r2(521), a2 = r2(130), o = i2.VERSION.split(".")[0], s = Symbol.for(`opentelemetry.js.api.${o}`), c = n2._globalThis;
          t3.registerGlobal = function(e3, t4, r3, n3 = false) {
            var a3;
            let o2 = c[s] = null !== (a3 = c[s]) && void 0 !== a3 ? a3 : { version: i2.VERSION };
            if (!n3 && o2[e3]) {
              let t5 = Error(`@opentelemetry/api: Attempted duplicate registration of API: ${e3}`);
              return r3.error(t5.stack || t5.message), false;
            }
            if (o2.version !== i2.VERSION) {
              let t5 = Error(`@opentelemetry/api: Registration of version v${o2.version} for ${e3} does not match previously registered API v${i2.VERSION}`);
              return r3.error(t5.stack || t5.message), false;
            }
            return o2[e3] = t4, r3.debug(`@opentelemetry/api: Registered a global for ${e3} v${i2.VERSION}.`), true;
          }, t3.getGlobal = function(e3) {
            var t4, r3;
            let n3 = null === (t4 = c[s]) || void 0 === t4 ? void 0 : t4.version;
            if (n3 && (0, a2.isCompatible)(n3)) return null === (r3 = c[s]) || void 0 === r3 ? void 0 : r3[e3];
          }, t3.unregisterGlobal = function(e3, t4) {
            t4.debug(`@opentelemetry/api: Unregistering a global for ${e3} v${i2.VERSION}.`);
            let r3 = c[s];
            r3 && delete r3[e3];
          };
        }, 130: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.isCompatible = t3._makeCompatibilityCheck = void 0;
          let n2 = r2(521), i2 = /^(\d+)\.(\d+)\.(\d+)(-(.+))?$/;
          function a2(e3) {
            let t4 = /* @__PURE__ */ new Set([e3]), r3 = /* @__PURE__ */ new Set(), n3 = e3.match(i2);
            if (!n3) return () => false;
            let a3 = { major: +n3[1], minor: +n3[2], patch: +n3[3], prerelease: n3[4] };
            if (null != a3.prerelease) return function(t5) {
              return t5 === e3;
            };
            function o(e4) {
              return r3.add(e4), false;
            }
            return function(e4) {
              if (t4.has(e4)) return true;
              if (r3.has(e4)) return false;
              let n4 = e4.match(i2);
              if (!n4) return o(e4);
              let s = { major: +n4[1], minor: +n4[2], patch: +n4[3], prerelease: n4[4] };
              return null != s.prerelease || a3.major !== s.major ? o(e4) : 0 === a3.major ? a3.minor === s.minor && a3.patch <= s.patch ? (t4.add(e4), true) : o(e4) : a3.minor <= s.minor ? (t4.add(e4), true) : o(e4);
            };
          }
          t3._makeCompatibilityCheck = a2, t3.isCompatible = a2(n2.VERSION);
        }, 886: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.metrics = void 0;
          let n2 = r2(653);
          t3.metrics = n2.MetricsAPI.getInstance();
        }, 901: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.ValueType = void 0, function(e3) {
            e3[e3.INT = 0] = "INT", e3[e3.DOUBLE = 1] = "DOUBLE";
          }(t3.ValueType || (t3.ValueType = {}));
        }, 102: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.createNoopMeter = t3.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = t3.NOOP_OBSERVABLE_GAUGE_METRIC = t3.NOOP_OBSERVABLE_COUNTER_METRIC = t3.NOOP_UP_DOWN_COUNTER_METRIC = t3.NOOP_HISTOGRAM_METRIC = t3.NOOP_COUNTER_METRIC = t3.NOOP_METER = t3.NoopObservableUpDownCounterMetric = t3.NoopObservableGaugeMetric = t3.NoopObservableCounterMetric = t3.NoopObservableMetric = t3.NoopHistogramMetric = t3.NoopUpDownCounterMetric = t3.NoopCounterMetric = t3.NoopMetric = t3.NoopMeter = void 0;
          class r2 {
            constructor() {
            }
            createHistogram(e3, r3) {
              return t3.NOOP_HISTOGRAM_METRIC;
            }
            createCounter(e3, r3) {
              return t3.NOOP_COUNTER_METRIC;
            }
            createUpDownCounter(e3, r3) {
              return t3.NOOP_UP_DOWN_COUNTER_METRIC;
            }
            createObservableGauge(e3, r3) {
              return t3.NOOP_OBSERVABLE_GAUGE_METRIC;
            }
            createObservableCounter(e3, r3) {
              return t3.NOOP_OBSERVABLE_COUNTER_METRIC;
            }
            createObservableUpDownCounter(e3, r3) {
              return t3.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC;
            }
            addBatchObservableCallback(e3, t4) {
            }
            removeBatchObservableCallback(e3) {
            }
          }
          t3.NoopMeter = r2;
          class n2 {
          }
          t3.NoopMetric = n2;
          class i2 extends n2 {
            add(e3, t4) {
            }
          }
          t3.NoopCounterMetric = i2;
          class a2 extends n2 {
            add(e3, t4) {
            }
          }
          t3.NoopUpDownCounterMetric = a2;
          class o extends n2 {
            record(e3, t4) {
            }
          }
          t3.NoopHistogramMetric = o;
          class s {
            addCallback(e3) {
            }
            removeCallback(e3) {
            }
          }
          t3.NoopObservableMetric = s;
          class c extends s {
          }
          t3.NoopObservableCounterMetric = c;
          class l extends s {
          }
          t3.NoopObservableGaugeMetric = l;
          class u extends s {
          }
          t3.NoopObservableUpDownCounterMetric = u, t3.NOOP_METER = new r2(), t3.NOOP_COUNTER_METRIC = new i2(), t3.NOOP_HISTOGRAM_METRIC = new o(), t3.NOOP_UP_DOWN_COUNTER_METRIC = new a2(), t3.NOOP_OBSERVABLE_COUNTER_METRIC = new c(), t3.NOOP_OBSERVABLE_GAUGE_METRIC = new l(), t3.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = new u(), t3.createNoopMeter = function() {
            return t3.NOOP_METER;
          };
        }, 660: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.NOOP_METER_PROVIDER = t3.NoopMeterProvider = void 0;
          let n2 = r2(102);
          class i2 {
            getMeter(e3, t4, r3) {
              return n2.NOOP_METER;
            }
          }
          t3.NoopMeterProvider = i2, t3.NOOP_METER_PROVIDER = new i2();
        }, 200: function(e2, t3, r2) {
          var n2 = this && this.__createBinding || (Object.create ? function(e3, t4, r3, n3) {
            void 0 === n3 && (n3 = r3), Object.defineProperty(e3, n3, { enumerable: true, get: function() {
              return t4[r3];
            } });
          } : function(e3, t4, r3, n3) {
            void 0 === n3 && (n3 = r3), e3[n3] = t4[r3];
          }), i2 = this && this.__exportStar || function(e3, t4) {
            for (var r3 in e3) "default" === r3 || Object.prototype.hasOwnProperty.call(t4, r3) || n2(t4, e3, r3);
          };
          Object.defineProperty(t3, "__esModule", { value: true }), i2(r2(46), t3);
        }, 651: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3._globalThis = void 0, t3._globalThis = "object" == typeof globalThis ? globalThis : r.g;
        }, 46: function(e2, t3, r2) {
          var n2 = this && this.__createBinding || (Object.create ? function(e3, t4, r3, n3) {
            void 0 === n3 && (n3 = r3), Object.defineProperty(e3, n3, { enumerable: true, get: function() {
              return t4[r3];
            } });
          } : function(e3, t4, r3, n3) {
            void 0 === n3 && (n3 = r3), e3[n3] = t4[r3];
          }), i2 = this && this.__exportStar || function(e3, t4) {
            for (var r3 in e3) "default" === r3 || Object.prototype.hasOwnProperty.call(t4, r3) || n2(t4, e3, r3);
          };
          Object.defineProperty(t3, "__esModule", { value: true }), i2(r2(651), t3);
        }, 939: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.propagation = void 0;
          let n2 = r2(181);
          t3.propagation = n2.PropagationAPI.getInstance();
        }, 874: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.NoopTextMapPropagator = void 0;
          class r2 {
            inject(e3, t4) {
            }
            extract(e3, t4) {
              return e3;
            }
            fields() {
              return [];
            }
          }
          t3.NoopTextMapPropagator = r2;
        }, 194: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.defaultTextMapSetter = t3.defaultTextMapGetter = void 0, t3.defaultTextMapGetter = { get(e3, t4) {
            if (null != e3) return e3[t4];
          }, keys: (e3) => null == e3 ? [] : Object.keys(e3) }, t3.defaultTextMapSetter = { set(e3, t4, r2) {
            null != e3 && (e3[t4] = r2);
          } };
        }, 845: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.trace = void 0;
          let n2 = r2(997);
          t3.trace = n2.TraceAPI.getInstance();
        }, 403: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.NonRecordingSpan = void 0;
          let n2 = r2(476);
          class i2 {
            constructor(e3 = n2.INVALID_SPAN_CONTEXT) {
              this._spanContext = e3;
            }
            spanContext() {
              return this._spanContext;
            }
            setAttribute(e3, t4) {
              return this;
            }
            setAttributes(e3) {
              return this;
            }
            addEvent(e3, t4) {
              return this;
            }
            setStatus(e3) {
              return this;
            }
            updateName(e3) {
              return this;
            }
            end(e3) {
            }
            isRecording() {
              return false;
            }
            recordException(e3, t4) {
            }
          }
          t3.NonRecordingSpan = i2;
        }, 614: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.NoopTracer = void 0;
          let n2 = r2(491), i2 = r2(607), a2 = r2(403), o = r2(139), s = n2.ContextAPI.getInstance();
          class c {
            startSpan(e3, t4, r3 = s.active()) {
              if (null == t4 ? void 0 : t4.root) return new a2.NonRecordingSpan();
              let n3 = r3 && (0, i2.getSpanContext)(r3);
              return "object" == typeof n3 && "string" == typeof n3.spanId && "string" == typeof n3.traceId && "number" == typeof n3.traceFlags && (0, o.isSpanContextValid)(n3) ? new a2.NonRecordingSpan(n3) : new a2.NonRecordingSpan();
            }
            startActiveSpan(e3, t4, r3, n3) {
              let a3, o2, c2;
              if (arguments.length < 2) return;
              2 == arguments.length ? c2 = t4 : 3 == arguments.length ? (a3 = t4, c2 = r3) : (a3 = t4, o2 = r3, c2 = n3);
              let l = null != o2 ? o2 : s.active(), u = this.startSpan(e3, a3, l), d = (0, i2.setSpan)(l, u);
              return s.with(d, c2, void 0, u);
            }
          }
          t3.NoopTracer = c;
        }, 124: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.NoopTracerProvider = void 0;
          let n2 = r2(614);
          class i2 {
            getTracer(e3, t4, r3) {
              return new n2.NoopTracer();
            }
          }
          t3.NoopTracerProvider = i2;
        }, 125: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.ProxyTracer = void 0;
          let n2 = new (r2(614)).NoopTracer();
          class i2 {
            constructor(e3, t4, r3, n3) {
              this._provider = e3, this.name = t4, this.version = r3, this.options = n3;
            }
            startSpan(e3, t4, r3) {
              return this._getTracer().startSpan(e3, t4, r3);
            }
            startActiveSpan(e3, t4, r3, n3) {
              let i3 = this._getTracer();
              return Reflect.apply(i3.startActiveSpan, i3, arguments);
            }
            _getTracer() {
              if (this._delegate) return this._delegate;
              let e3 = this._provider.getDelegateTracer(this.name, this.version, this.options);
              return e3 ? (this._delegate = e3, this._delegate) : n2;
            }
          }
          t3.ProxyTracer = i2;
        }, 846: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.ProxyTracerProvider = void 0;
          let n2 = r2(125), i2 = new (r2(124)).NoopTracerProvider();
          class a2 {
            getTracer(e3, t4, r3) {
              var i3;
              return null !== (i3 = this.getDelegateTracer(e3, t4, r3)) && void 0 !== i3 ? i3 : new n2.ProxyTracer(this, e3, t4, r3);
            }
            getDelegate() {
              var e3;
              return null !== (e3 = this._delegate) && void 0 !== e3 ? e3 : i2;
            }
            setDelegate(e3) {
              this._delegate = e3;
            }
            getDelegateTracer(e3, t4, r3) {
              var n3;
              return null === (n3 = this._delegate) || void 0 === n3 ? void 0 : n3.getTracer(e3, t4, r3);
            }
          }
          t3.ProxyTracerProvider = a2;
        }, 996: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.SamplingDecision = void 0, function(e3) {
            e3[e3.NOT_RECORD = 0] = "NOT_RECORD", e3[e3.RECORD = 1] = "RECORD", e3[e3.RECORD_AND_SAMPLED = 2] = "RECORD_AND_SAMPLED";
          }(t3.SamplingDecision || (t3.SamplingDecision = {}));
        }, 607: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.getSpanContext = t3.setSpanContext = t3.deleteSpan = t3.setSpan = t3.getActiveSpan = t3.getSpan = void 0;
          let n2 = r2(780), i2 = r2(403), a2 = r2(491), o = (0, n2.createContextKey)("OpenTelemetry Context Key SPAN");
          function s(e3) {
            return e3.getValue(o) || void 0;
          }
          function c(e3, t4) {
            return e3.setValue(o, t4);
          }
          t3.getSpan = s, t3.getActiveSpan = function() {
            return s(a2.ContextAPI.getInstance().active());
          }, t3.setSpan = c, t3.deleteSpan = function(e3) {
            return e3.deleteValue(o);
          }, t3.setSpanContext = function(e3, t4) {
            return c(e3, new i2.NonRecordingSpan(t4));
          }, t3.getSpanContext = function(e3) {
            var t4;
            return null === (t4 = s(e3)) || void 0 === t4 ? void 0 : t4.spanContext();
          };
        }, 325: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.TraceStateImpl = void 0;
          let n2 = r2(564);
          class i2 {
            constructor(e3) {
              this._internalState = /* @__PURE__ */ new Map(), e3 && this._parse(e3);
            }
            set(e3, t4) {
              let r3 = this._clone();
              return r3._internalState.has(e3) && r3._internalState.delete(e3), r3._internalState.set(e3, t4), r3;
            }
            unset(e3) {
              let t4 = this._clone();
              return t4._internalState.delete(e3), t4;
            }
            get(e3) {
              return this._internalState.get(e3);
            }
            serialize() {
              return this._keys().reduce((e3, t4) => (e3.push(t4 + "=" + this.get(t4)), e3), []).join(",");
            }
            _parse(e3) {
              !(e3.length > 512) && (this._internalState = e3.split(",").reverse().reduce((e4, t4) => {
                let r3 = t4.trim(), i3 = r3.indexOf("=");
                if (-1 !== i3) {
                  let a2 = r3.slice(0, i3), o = r3.slice(i3 + 1, t4.length);
                  (0, n2.validateKey)(a2) && (0, n2.validateValue)(o) && e4.set(a2, o);
                }
                return e4;
              }, /* @__PURE__ */ new Map()), this._internalState.size > 32 && (this._internalState = new Map(Array.from(this._internalState.entries()).reverse().slice(0, 32))));
            }
            _keys() {
              return Array.from(this._internalState.keys()).reverse();
            }
            _clone() {
              let e3 = new i2();
              return e3._internalState = new Map(this._internalState), e3;
            }
          }
          t3.TraceStateImpl = i2;
        }, 564: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.validateValue = t3.validateKey = void 0;
          let r2 = "[_0-9a-z-*/]", n2 = `[a-z]${r2}{0,255}`, i2 = `[a-z0-9]${r2}{0,240}@[a-z]${r2}{0,13}`, a2 = RegExp(`^(?:${n2}|${i2})$`), o = /^[ -~]{0,255}[!-~]$/, s = /,|=/;
          t3.validateKey = function(e3) {
            return a2.test(e3);
          }, t3.validateValue = function(e3) {
            return o.test(e3) && !s.test(e3);
          };
        }, 98: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.createTraceState = void 0;
          let n2 = r2(325);
          t3.createTraceState = function(e3) {
            return new n2.TraceStateImpl(e3);
          };
        }, 476: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.INVALID_SPAN_CONTEXT = t3.INVALID_TRACEID = t3.INVALID_SPANID = void 0;
          let n2 = r2(475);
          t3.INVALID_SPANID = "0000000000000000", t3.INVALID_TRACEID = "00000000000000000000000000000000", t3.INVALID_SPAN_CONTEXT = { traceId: t3.INVALID_TRACEID, spanId: t3.INVALID_SPANID, traceFlags: n2.TraceFlags.NONE };
        }, 357: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.SpanKind = void 0, function(e3) {
            e3[e3.INTERNAL = 0] = "INTERNAL", e3[e3.SERVER = 1] = "SERVER", e3[e3.CLIENT = 2] = "CLIENT", e3[e3.PRODUCER = 3] = "PRODUCER", e3[e3.CONSUMER = 4] = "CONSUMER";
          }(t3.SpanKind || (t3.SpanKind = {}));
        }, 139: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.wrapSpanContext = t3.isSpanContextValid = t3.isValidSpanId = t3.isValidTraceId = void 0;
          let n2 = r2(476), i2 = r2(403), a2 = /^([0-9a-f]{32})$/i, o = /^[0-9a-f]{16}$/i;
          function s(e3) {
            return a2.test(e3) && e3 !== n2.INVALID_TRACEID;
          }
          function c(e3) {
            return o.test(e3) && e3 !== n2.INVALID_SPANID;
          }
          t3.isValidTraceId = s, t3.isValidSpanId = c, t3.isSpanContextValid = function(e3) {
            return s(e3.traceId) && c(e3.spanId);
          }, t3.wrapSpanContext = function(e3) {
            return new i2.NonRecordingSpan(e3);
          };
        }, 847: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.SpanStatusCode = void 0, function(e3) {
            e3[e3.UNSET = 0] = "UNSET", e3[e3.OK = 1] = "OK", e3[e3.ERROR = 2] = "ERROR";
          }(t3.SpanStatusCode || (t3.SpanStatusCode = {}));
        }, 475: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.TraceFlags = void 0, function(e3) {
            e3[e3.NONE = 0] = "NONE", e3[e3.SAMPLED = 1] = "SAMPLED";
          }(t3.TraceFlags || (t3.TraceFlags = {}));
        }, 521: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.VERSION = void 0, t3.VERSION = "1.6.0";
        } }, n = {};
        function i(e2) {
          var r2 = n[e2];
          if (void 0 !== r2) return r2.exports;
          var a2 = n[e2] = { exports: {} }, o = true;
          try {
            t2[e2].call(a2.exports, a2, a2.exports, i), o = false;
          } finally {
            o && delete n[e2];
          }
          return a2.exports;
        }
        i.ab = "//";
        var a = {};
        (() => {
          Object.defineProperty(a, "__esModule", { value: true }), a.trace = a.propagation = a.metrics = a.diag = a.context = a.INVALID_SPAN_CONTEXT = a.INVALID_TRACEID = a.INVALID_SPANID = a.isValidSpanId = a.isValidTraceId = a.isSpanContextValid = a.createTraceState = a.TraceFlags = a.SpanStatusCode = a.SpanKind = a.SamplingDecision = a.ProxyTracerProvider = a.ProxyTracer = a.defaultTextMapSetter = a.defaultTextMapGetter = a.ValueType = a.createNoopMeter = a.DiagLogLevel = a.DiagConsoleLogger = a.ROOT_CONTEXT = a.createContextKey = a.baggageEntryMetadataFromString = void 0;
          var e2 = i(369);
          Object.defineProperty(a, "baggageEntryMetadataFromString", { enumerable: true, get: function() {
            return e2.baggageEntryMetadataFromString;
          } });
          var t3 = i(780);
          Object.defineProperty(a, "createContextKey", { enumerable: true, get: function() {
            return t3.createContextKey;
          } }), Object.defineProperty(a, "ROOT_CONTEXT", { enumerable: true, get: function() {
            return t3.ROOT_CONTEXT;
          } });
          var r2 = i(972);
          Object.defineProperty(a, "DiagConsoleLogger", { enumerable: true, get: function() {
            return r2.DiagConsoleLogger;
          } });
          var n2 = i(957);
          Object.defineProperty(a, "DiagLogLevel", { enumerable: true, get: function() {
            return n2.DiagLogLevel;
          } });
          var o = i(102);
          Object.defineProperty(a, "createNoopMeter", { enumerable: true, get: function() {
            return o.createNoopMeter;
          } });
          var s = i(901);
          Object.defineProperty(a, "ValueType", { enumerable: true, get: function() {
            return s.ValueType;
          } });
          var c = i(194);
          Object.defineProperty(a, "defaultTextMapGetter", { enumerable: true, get: function() {
            return c.defaultTextMapGetter;
          } }), Object.defineProperty(a, "defaultTextMapSetter", { enumerable: true, get: function() {
            return c.defaultTextMapSetter;
          } });
          var l = i(125);
          Object.defineProperty(a, "ProxyTracer", { enumerable: true, get: function() {
            return l.ProxyTracer;
          } });
          var u = i(846);
          Object.defineProperty(a, "ProxyTracerProvider", { enumerable: true, get: function() {
            return u.ProxyTracerProvider;
          } });
          var d = i(996);
          Object.defineProperty(a, "SamplingDecision", { enumerable: true, get: function() {
            return d.SamplingDecision;
          } });
          var p = i(357);
          Object.defineProperty(a, "SpanKind", { enumerable: true, get: function() {
            return p.SpanKind;
          } });
          var h = i(847);
          Object.defineProperty(a, "SpanStatusCode", { enumerable: true, get: function() {
            return h.SpanStatusCode;
          } });
          var f = i(475);
          Object.defineProperty(a, "TraceFlags", { enumerable: true, get: function() {
            return f.TraceFlags;
          } });
          var g = i(98);
          Object.defineProperty(a, "createTraceState", { enumerable: true, get: function() {
            return g.createTraceState;
          } });
          var m = i(139);
          Object.defineProperty(a, "isSpanContextValid", { enumerable: true, get: function() {
            return m.isSpanContextValid;
          } }), Object.defineProperty(a, "isValidTraceId", { enumerable: true, get: function() {
            return m.isValidTraceId;
          } }), Object.defineProperty(a, "isValidSpanId", { enumerable: true, get: function() {
            return m.isValidSpanId;
          } });
          var y = i(476);
          Object.defineProperty(a, "INVALID_SPANID", { enumerable: true, get: function() {
            return y.INVALID_SPANID;
          } }), Object.defineProperty(a, "INVALID_TRACEID", { enumerable: true, get: function() {
            return y.INVALID_TRACEID;
          } }), Object.defineProperty(a, "INVALID_SPAN_CONTEXT", { enumerable: true, get: function() {
            return y.INVALID_SPAN_CONTEXT;
          } });
          let w = i(67);
          Object.defineProperty(a, "context", { enumerable: true, get: function() {
            return w.context;
          } });
          let b = i(506);
          Object.defineProperty(a, "diag", { enumerable: true, get: function() {
            return b.diag;
          } });
          let v = i(886);
          Object.defineProperty(a, "metrics", { enumerable: true, get: function() {
            return v.metrics;
          } });
          let _ = i(939);
          Object.defineProperty(a, "propagation", { enumerable: true, get: function() {
            return _.propagation;
          } });
          let S = i(845);
          Object.defineProperty(a, "trace", { enumerable: true, get: function() {
            return S.trace;
          } }), a.default = { context: w.context, diag: b.diag, metrics: v.metrics, propagation: _.propagation, trace: S.trace };
        })(), e.exports = a;
      })();
    }, 133: (e) => {
      (() => {
        "use strict";
        "undefined" != typeof __nccwpck_require__ && (__nccwpck_require__.ab = "//");
        var t = {};
        (() => {
          t.parse = function(t2, r2) {
            if ("string" != typeof t2) throw TypeError("argument str must be a string");
            for (var i2 = {}, a = t2.split(n), o = (r2 || {}).decode || e2, s = 0; s < a.length; s++) {
              var c = a[s], l = c.indexOf("=");
              if (!(l < 0)) {
                var u = c.substr(0, l).trim(), d = c.substr(++l, c.length).trim();
                '"' == d[0] && (d = d.slice(1, -1)), void 0 == i2[u] && (i2[u] = function(e3, t3) {
                  try {
                    return t3(e3);
                  } catch (t4) {
                    return e3;
                  }
                }(d, o));
              }
            }
            return i2;
          }, t.serialize = function(e3, t2, n2) {
            var a = n2 || {}, o = a.encode || r;
            if ("function" != typeof o) throw TypeError("option encode is invalid");
            if (!i.test(e3)) throw TypeError("argument name is invalid");
            var s = o(t2);
            if (s && !i.test(s)) throw TypeError("argument val is invalid");
            var c = e3 + "=" + s;
            if (null != a.maxAge) {
              var l = a.maxAge - 0;
              if (isNaN(l) || !isFinite(l)) throw TypeError("option maxAge is invalid");
              c += "; Max-Age=" + Math.floor(l);
            }
            if (a.domain) {
              if (!i.test(a.domain)) throw TypeError("option domain is invalid");
              c += "; Domain=" + a.domain;
            }
            if (a.path) {
              if (!i.test(a.path)) throw TypeError("option path is invalid");
              c += "; Path=" + a.path;
            }
            if (a.expires) {
              if ("function" != typeof a.expires.toUTCString) throw TypeError("option expires is invalid");
              c += "; Expires=" + a.expires.toUTCString();
            }
            if (a.httpOnly && (c += "; HttpOnly"), a.secure && (c += "; Secure"), a.sameSite) switch ("string" == typeof a.sameSite ? a.sameSite.toLowerCase() : a.sameSite) {
              case true:
              case "strict":
                c += "; SameSite=Strict";
                break;
              case "lax":
                c += "; SameSite=Lax";
                break;
              case "none":
                c += "; SameSite=None";
                break;
              default:
                throw TypeError("option sameSite is invalid");
            }
            return c;
          };
          var e2 = decodeURIComponent, r = encodeURIComponent, n = /; */, i = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
        })(), e.exports = t;
      })();
    }, 340: (e, t, r) => {
      var n;
      (() => {
        var i = { 226: function(i2, a2) {
          !function(o2, s2) {
            "use strict";
            var c = "function", l = "undefined", u = "object", d = "string", p = "major", h = "model", f = "name", g = "type", m = "vendor", y = "version", w = "architecture", b = "console", v = "mobile", _ = "tablet", S = "smarttv", k = "wearable", E = "embedded", x = "Amazon", A = "Apple", T = "ASUS", P = "BlackBerry", C = "Browser", R = "Chrome", O = "Firefox", I = "Google", U = "Huawei", N = "Microsoft", L = "Motorola", $ = "Opera", M = "Samsung", j = "Sharp", D = "Sony", H = "Xiaomi", W = "Zebra", K = "Facebook", B = "Chromium OS", J = "Mac OS", V = function(e2, t2) {
              var r2 = {};
              for (var n2 in e2) t2[n2] && t2[n2].length % 2 == 0 ? r2[n2] = t2[n2].concat(e2[n2]) : r2[n2] = e2[n2];
              return r2;
            }, q = function(e2) {
              for (var t2 = {}, r2 = 0; r2 < e2.length; r2++) t2[e2[r2].toUpperCase()] = e2[r2];
              return t2;
            }, z = function(e2, t2) {
              return typeof e2 === d && -1 !== F(t2).indexOf(F(e2));
            }, F = function(e2) {
              return e2.toLowerCase();
            }, G = function(e2, t2) {
              if (typeof e2 === d) return e2 = e2.replace(/^\s\s*/, ""), typeof t2 === l ? e2 : e2.substring(0, 350);
            }, X = function(e2, t2) {
              for (var r2, n2, i3, a3, o3, l2, d2 = 0; d2 < t2.length && !o3; ) {
                var p2 = t2[d2], h2 = t2[d2 + 1];
                for (r2 = n2 = 0; r2 < p2.length && !o3 && p2[r2]; ) if (o3 = p2[r2++].exec(e2)) for (i3 = 0; i3 < h2.length; i3++) l2 = o3[++n2], typeof (a3 = h2[i3]) === u && a3.length > 0 ? 2 === a3.length ? typeof a3[1] == c ? this[a3[0]] = a3[1].call(this, l2) : this[a3[0]] = a3[1] : 3 === a3.length ? typeof a3[1] !== c || a3[1].exec && a3[1].test ? this[a3[0]] = l2 ? l2.replace(a3[1], a3[2]) : void 0 : this[a3[0]] = l2 ? a3[1].call(this, l2, a3[2]) : void 0 : 4 === a3.length && (this[a3[0]] = l2 ? a3[3].call(this, l2.replace(a3[1], a3[2])) : void 0) : this[a3] = l2 || s2;
                d2 += 2;
              }
            }, Y = function(e2, t2) {
              for (var r2 in t2) if (typeof t2[r2] === u && t2[r2].length > 0) {
                for (var n2 = 0; n2 < t2[r2].length; n2++) if (z(t2[r2][n2], e2)) return "?" === r2 ? s2 : r2;
              } else if (z(t2[r2], e2)) return "?" === r2 ? s2 : r2;
              return e2;
            }, Z = { ME: "4.90", "NT 3.11": "NT3.51", "NT 4.0": "NT4.0", 2e3: "NT 5.0", XP: ["NT 5.1", "NT 5.2"], Vista: "NT 6.0", 7: "NT 6.1", 8: "NT 6.2", 8.1: "NT 6.3", 10: ["NT 6.4", "NT 10.0"], RT: "ARM" }, Q = { browser: [[/\b(?:crmo|crios)\/([\w\.]+)/i], [y, [f, "Chrome"]], [/edg(?:e|ios|a)?\/([\w\.]+)/i], [y, [f, "Edge"]], [/(opera mini)\/([-\w\.]+)/i, /(opera [mobiletab]{3,6})\b.+version\/([-\w\.]+)/i, /(opera)(?:.+version\/|[\/ ]+)([\w\.]+)/i], [f, y], [/opios[\/ ]+([\w\.]+)/i], [y, [f, $ + " Mini"]], [/\bopr\/([\w\.]+)/i], [y, [f, $]], [/(kindle)\/([\w\.]+)/i, /(lunascape|maxthon|netfront|jasmine|blazer)[\/ ]?([\w\.]*)/i, /(avant |iemobile|slim)(?:browser)?[\/ ]?([\w\.]*)/i, /(ba?idubrowser)[\/ ]?([\w\.]+)/i, /(?:ms|\()(ie) ([\w\.]+)/i, /(flock|rockmelt|midori|epiphany|silk|skyfire|bolt|iron|vivaldi|iridium|phantomjs|bowser|quark|qupzilla|falkon|rekonq|puffin|brave|whale(?!.+naver)|qqbrowserlite|qq|duckduckgo)\/([-\w\.]+)/i, /(heytap|ovi)browser\/([\d\.]+)/i, /(weibo)__([\d\.]+)/i], [f, y], [/(?:\buc? ?browser|(?:juc.+)ucweb)[\/ ]?([\w\.]+)/i], [y, [f, "UC" + C]], [/microm.+\bqbcore\/([\w\.]+)/i, /\bqbcore\/([\w\.]+).+microm/i], [y, [f, "WeChat(Win) Desktop"]], [/micromessenger\/([\w\.]+)/i], [y, [f, "WeChat"]], [/konqueror\/([\w\.]+)/i], [y, [f, "Konqueror"]], [/trident.+rv[: ]([\w\.]{1,9})\b.+like gecko/i], [y, [f, "IE"]], [/ya(?:search)?browser\/([\w\.]+)/i], [y, [f, "Yandex"]], [/(avast|avg)\/([\w\.]+)/i], [[f, /(.+)/, "$1 Secure " + C], y], [/\bfocus\/([\w\.]+)/i], [y, [f, O + " Focus"]], [/\bopt\/([\w\.]+)/i], [y, [f, $ + " Touch"]], [/coc_coc\w+\/([\w\.]+)/i], [y, [f, "Coc Coc"]], [/dolfin\/([\w\.]+)/i], [y, [f, "Dolphin"]], [/coast\/([\w\.]+)/i], [y, [f, $ + " Coast"]], [/miuibrowser\/([\w\.]+)/i], [y, [f, "MIUI " + C]], [/fxios\/([-\w\.]+)/i], [y, [f, O]], [/\bqihu|(qi?ho?o?|360)browser/i], [[f, "360 " + C]], [/(oculus|samsung|sailfish|huawei)browser\/([\w\.]+)/i], [[f, /(.+)/, "$1 " + C], y], [/(comodo_dragon)\/([\w\.]+)/i], [[f, /_/g, " "], y], [/(electron)\/([\w\.]+) safari/i, /(tesla)(?: qtcarbrowser|\/(20\d\d\.[-\w\.]+))/i, /m?(qqbrowser|baiduboxapp|2345Explorer)[\/ ]?([\w\.]+)/i], [f, y], [/(metasr)[\/ ]?([\w\.]+)/i, /(lbbrowser)/i, /\[(linkedin)app\]/i], [f], [/((?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/([\w\.]+);)/i], [[f, K], y], [/(kakao(?:talk|story))[\/ ]([\w\.]+)/i, /(naver)\(.*?(\d+\.[\w\.]+).*\)/i, /safari (line)\/([\w\.]+)/i, /\b(line)\/([\w\.]+)\/iab/i, /(chromium|instagram)[\/ ]([-\w\.]+)/i], [f, y], [/\bgsa\/([\w\.]+) .*safari\//i], [y, [f, "GSA"]], [/musical_ly(?:.+app_?version\/|_)([\w\.]+)/i], [y, [f, "TikTok"]], [/headlesschrome(?:\/([\w\.]+)| )/i], [y, [f, R + " Headless"]], [/ wv\).+(chrome)\/([\w\.]+)/i], [[f, R + " WebView"], y], [/droid.+ version\/([\w\.]+)\b.+(?:mobile safari|safari)/i], [y, [f, "Android " + C]], [/(chrome|omniweb|arora|[tizenoka]{5} ?browser)\/v?([\w\.]+)/i], [f, y], [/version\/([\w\.\,]+) .*mobile\/\w+ (safari)/i], [y, [f, "Mobile Safari"]], [/version\/([\w(\.|\,)]+) .*(mobile ?safari|safari)/i], [y, f], [/webkit.+?(mobile ?safari|safari)(\/[\w\.]+)/i], [f, [y, Y, { "1.0": "/8", 1.2: "/1", 1.3: "/3", "2.0": "/412", "2.0.2": "/416", "2.0.3": "/417", "2.0.4": "/419", "?": "/" }]], [/(webkit|khtml)\/([\w\.]+)/i], [f, y], [/(navigator|netscape\d?)\/([-\w\.]+)/i], [[f, "Netscape"], y], [/mobile vr; rv:([\w\.]+)\).+firefox/i], [y, [f, O + " Reality"]], [/ekiohf.+(flow)\/([\w\.]+)/i, /(swiftfox)/i, /(icedragon|iceweasel|camino|chimera|fennec|maemo browser|minimo|conkeror|klar)[\/ ]?([\w\.\+]+)/i, /(seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([-\w\.]+)$/i, /(firefox)\/([\w\.]+)/i, /(mozilla)\/([\w\.]+) .+rv\:.+gecko\/\d+/i, /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir|obigo|mosaic|(?:go|ice|up)[\. ]?browser)[-\/ ]?v?([\w\.]+)/i, /(links) \(([\w\.]+)/i, /panasonic;(viera)/i], [f, y], [/(cobalt)\/([\w\.]+)/i], [f, [y, /master.|lts./, ""]]], cpu: [[/(?:(amd|x(?:(?:86|64)[-_])?|wow|win)64)[;\)]/i], [[w, "amd64"]], [/(ia32(?=;))/i], [[w, F]], [/((?:i[346]|x)86)[;\)]/i], [[w, "ia32"]], [/\b(aarch64|arm(v?8e?l?|_?64))\b/i], [[w, "arm64"]], [/\b(arm(?:v[67])?ht?n?[fl]p?)\b/i], [[w, "armhf"]], [/windows (ce|mobile); ppc;/i], [[w, "arm"]], [/((?:ppc|powerpc)(?:64)?)(?: mac|;|\))/i], [[w, /ower/, "", F]], [/(sun4\w)[;\)]/i], [[w, "sparc"]], [/((?:avr32|ia64(?=;))|68k(?=\))|\barm(?=v(?:[1-7]|[5-7]1)l?|;|eabi)|(?=atmel )avr|(?:irix|mips|sparc)(?:64)?\b|pa-risc)/i], [[w, F]]], device: [[/\b(sch-i[89]0\d|shw-m380s|sm-[ptx]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus 10)/i], [h, [m, M], [g, _]], [/\b((?:s[cgp]h|gt|sm)-\w+|sc[g-]?[\d]+a?|galaxy nexus)/i, /samsung[- ]([-\w]+)/i, /sec-(sgh\w+)/i], [h, [m, M], [g, v]], [/(?:\/|\()(ip(?:hone|od)[\w, ]*)(?:\/|;)/i], [h, [m, A], [g, v]], [/\((ipad);[-\w\),; ]+apple/i, /applecoremedia\/[\w\.]+ \((ipad)/i, /\b(ipad)\d\d?,\d\d?[;\]].+ios/i], [h, [m, A], [g, _]], [/(macintosh);/i], [h, [m, A]], [/\b(sh-?[altvz]?\d\d[a-ekm]?)/i], [h, [m, j], [g, v]], [/\b((?:ag[rs][23]?|bah2?|sht?|btv)-a?[lw]\d{2})\b(?!.+d\/s)/i], [h, [m, U], [g, _]], [/(?:huawei|honor)([-\w ]+)[;\)]/i, /\b(nexus 6p|\w{2,4}e?-[atu]?[ln][\dx][012359c][adn]?)\b(?!.+d\/s)/i], [h, [m, U], [g, v]], [/\b(poco[\w ]+)(?: bui|\))/i, /\b; (\w+) build\/hm\1/i, /\b(hm[-_ ]?note?[_ ]?(?:\d\w)?) bui/i, /\b(redmi[\-_ ]?(?:note|k)?[\w_ ]+)(?: bui|\))/i, /\b(mi[-_ ]?(?:a\d|one|one[_ ]plus|note lte|max|cc)?[_ ]?(?:\d?\w?)[_ ]?(?:plus|se|lite)?)(?: bui|\))/i], [[h, /_/g, " "], [m, H], [g, v]], [/\b(mi[-_ ]?(?:pad)(?:[\w_ ]+))(?: bui|\))/i], [[h, /_/g, " "], [m, H], [g, _]], [/; (\w+) bui.+ oppo/i, /\b(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007|a101op)\b/i], [h, [m, "OPPO"], [g, v]], [/vivo (\w+)(?: bui|\))/i, /\b(v[12]\d{3}\w?[at])(?: bui|;)/i], [h, [m, "Vivo"], [g, v]], [/\b(rmx[12]\d{3})(?: bui|;|\))/i], [h, [m, "Realme"], [g, v]], [/\b(milestone|droid(?:[2-4x]| (?:bionic|x2|pro|razr))?:?( 4g)?)\b[\w ]+build\//i, /\bmot(?:orola)?[- ](\w*)/i, /((?:moto[\w\(\) ]+|xt\d{3,4}|nexus 6)(?= bui|\)))/i], [h, [m, L], [g, v]], [/\b(mz60\d|xoom[2 ]{0,2}) build\//i], [h, [m, L], [g, _]], [/((?=lg)?[vl]k\-?\d{3}) bui| 3\.[-\w; ]{10}lg?-([06cv9]{3,4})/i], [h, [m, "LG"], [g, _]], [/(lm(?:-?f100[nv]?|-[\w\.]+)(?= bui|\))|nexus [45])/i, /\blg[-e;\/ ]+((?!browser|netcast|android tv)\w+)/i, /\blg-?([\d\w]+) bui/i], [h, [m, "LG"], [g, v]], [/(ideatab[-\w ]+)/i, /lenovo ?(s[56]000[-\w]+|tab(?:[\w ]+)|yt[-\d\w]{6}|tb[-\d\w]{6})/i], [h, [m, "Lenovo"], [g, _]], [/(?:maemo|nokia).*(n900|lumia \d+)/i, /nokia[-_ ]?([-\w\.]*)/i], [[h, /_/g, " "], [m, "Nokia"], [g, v]], [/(pixel c)\b/i], [h, [m, I], [g, _]], [/droid.+; (pixel[\daxl ]{0,6})(?: bui|\))/i], [h, [m, I], [g, v]], [/droid.+ (a?\d[0-2]{2}so|[c-g]\d{4}|so[-gl]\w+|xq-a\w[4-7][12])(?= bui|\).+chrome\/(?![1-6]{0,1}\d\.))/i], [h, [m, D], [g, v]], [/sony tablet [ps]/i, /\b(?:sony)?sgp\w+(?: bui|\))/i], [[h, "Xperia Tablet"], [m, D], [g, _]], [/ (kb2005|in20[12]5|be20[12][59])\b/i, /(?:one)?(?:plus)? (a\d0\d\d)(?: b|\))/i], [h, [m, "OnePlus"], [g, v]], [/(alexa)webm/i, /(kf[a-z]{2}wi|aeo[c-r]{2})( bui|\))/i, /(kf[a-z]+)( bui|\)).+silk\//i], [h, [m, x], [g, _]], [/((?:sd|kf)[0349hijorstuw]+)( bui|\)).+silk\//i], [[h, /(.+)/g, "Fire Phone $1"], [m, x], [g, v]], [/(playbook);[-\w\),; ]+(rim)/i], [h, m, [g, _]], [/\b((?:bb[a-f]|st[hv])100-\d)/i, /\(bb10; (\w+)/i], [h, [m, P], [g, v]], [/(?:\b|asus_)(transfo[prime ]{4,10} \w+|eeepc|slider \w+|nexus 7|padfone|p00[cj])/i], [h, [m, T], [g, _]], [/ (z[bes]6[027][012][km][ls]|zenfone \d\w?)\b/i], [h, [m, T], [g, v]], [/(nexus 9)/i], [h, [m, "HTC"], [g, _]], [/(htc)[-;_ ]{1,2}([\w ]+(?=\)| bui)|\w+)/i, /(zte)[- ]([\w ]+?)(?: bui|\/|\))/i, /(alcatel|geeksphone|nexian|panasonic(?!(?:;|\.))|sony(?!-bra))[-_ ]?([-\w]*)/i], [m, [h, /_/g, " "], [g, v]], [/droid.+; ([ab][1-7]-?[0178a]\d\d?)/i], [h, [m, "Acer"], [g, _]], [/droid.+; (m[1-5] note) bui/i, /\bmz-([-\w]{2,})/i], [h, [m, "Meizu"], [g, v]], [/(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron)[-_ ]?([-\w]*)/i, /(hp) ([\w ]+\w)/i, /(asus)-?(\w+)/i, /(microsoft); (lumia[\w ]+)/i, /(lenovo)[-_ ]?([-\w]+)/i, /(jolla)/i, /(oppo) ?([\w ]+) bui/i], [m, h, [g, v]], [/(kobo)\s(ereader|touch)/i, /(archos) (gamepad2?)/i, /(hp).+(touchpad(?!.+tablet)|tablet)/i, /(kindle)\/([\w\.]+)/i, /(nook)[\w ]+build\/(\w+)/i, /(dell) (strea[kpr\d ]*[\dko])/i, /(le[- ]+pan)[- ]+(\w{1,9}) bui/i, /(trinity)[- ]*(t\d{3}) bui/i, /(gigaset)[- ]+(q\w{1,9}) bui/i, /(vodafone) ([\w ]+)(?:\)| bui)/i], [m, h, [g, _]], [/(surface duo)/i], [h, [m, N], [g, _]], [/droid [\d\.]+; (fp\du?)(?: b|\))/i], [h, [m, "Fairphone"], [g, v]], [/(u304aa)/i], [h, [m, "AT&T"], [g, v]], [/\bsie-(\w*)/i], [h, [m, "Siemens"], [g, v]], [/\b(rct\w+) b/i], [h, [m, "RCA"], [g, _]], [/\b(venue[\d ]{2,7}) b/i], [h, [m, "Dell"], [g, _]], [/\b(q(?:mv|ta)\w+) b/i], [h, [m, "Verizon"], [g, _]], [/\b(?:barnes[& ]+noble |bn[rt])([\w\+ ]*) b/i], [h, [m, "Barnes & Noble"], [g, _]], [/\b(tm\d{3}\w+) b/i], [h, [m, "NuVision"], [g, _]], [/\b(k88) b/i], [h, [m, "ZTE"], [g, _]], [/\b(nx\d{3}j) b/i], [h, [m, "ZTE"], [g, v]], [/\b(gen\d{3}) b.+49h/i], [h, [m, "Swiss"], [g, v]], [/\b(zur\d{3}) b/i], [h, [m, "Swiss"], [g, _]], [/\b((zeki)?tb.*\b) b/i], [h, [m, "Zeki"], [g, _]], [/\b([yr]\d{2}) b/i, /\b(dragon[- ]+touch |dt)(\w{5}) b/i], [[m, "Dragon Touch"], h, [g, _]], [/\b(ns-?\w{0,9}) b/i], [h, [m, "Insignia"], [g, _]], [/\b((nxa|next)-?\w{0,9}) b/i], [h, [m, "NextBook"], [g, _]], [/\b(xtreme\_)?(v(1[045]|2[015]|[3469]0|7[05])) b/i], [[m, "Voice"], h, [g, v]], [/\b(lvtel\-)?(v1[12]) b/i], [[m, "LvTel"], h, [g, v]], [/\b(ph-1) /i], [h, [m, "Essential"], [g, v]], [/\b(v(100md|700na|7011|917g).*\b) b/i], [h, [m, "Envizen"], [g, _]], [/\b(trio[-\w\. ]+) b/i], [h, [m, "MachSpeed"], [g, _]], [/\btu_(1491) b/i], [h, [m, "Rotor"], [g, _]], [/(shield[\w ]+) b/i], [h, [m, "Nvidia"], [g, _]], [/(sprint) (\w+)/i], [m, h, [g, v]], [/(kin\.[onetw]{3})/i], [[h, /\./g, " "], [m, N], [g, v]], [/droid.+; (cc6666?|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i], [h, [m, W], [g, _]], [/droid.+; (ec30|ps20|tc[2-8]\d[kx])\)/i], [h, [m, W], [g, v]], [/smart-tv.+(samsung)/i], [m, [g, S]], [/hbbtv.+maple;(\d+)/i], [[h, /^/, "SmartTV"], [m, M], [g, S]], [/(nux; netcast.+smarttv|lg (netcast\.tv-201\d|android tv))/i], [[m, "LG"], [g, S]], [/(apple) ?tv/i], [m, [h, A + " TV"], [g, S]], [/crkey/i], [[h, R + "cast"], [m, I], [g, S]], [/droid.+aft(\w)( bui|\))/i], [h, [m, x], [g, S]], [/\(dtv[\);].+(aquos)/i, /(aquos-tv[\w ]+)\)/i], [h, [m, j], [g, S]], [/(bravia[\w ]+)( bui|\))/i], [h, [m, D], [g, S]], [/(mitv-\w{5}) bui/i], [h, [m, H], [g, S]], [/Hbbtv.*(technisat) (.*);/i], [m, h, [g, S]], [/\b(roku)[\dx]*[\)\/]((?:dvp-)?[\d\.]*)/i, /hbbtv\/\d+\.\d+\.\d+ +\([\w\+ ]*; *([\w\d][^;]*);([^;]*)/i], [[m, G], [h, G], [g, S]], [/\b(android tv|smart[- ]?tv|opera tv|tv; rv:)\b/i], [[g, S]], [/(ouya)/i, /(nintendo) ([wids3utch]+)/i], [m, h, [g, b]], [/droid.+; (shield) bui/i], [h, [m, "Nvidia"], [g, b]], [/(playstation [345portablevi]+)/i], [h, [m, D], [g, b]], [/\b(xbox(?: one)?(?!; xbox))[\); ]/i], [h, [m, N], [g, b]], [/((pebble))app/i], [m, h, [g, k]], [/(watch)(?: ?os[,\/]|\d,\d\/)[\d\.]+/i], [h, [m, A], [g, k]], [/droid.+; (glass) \d/i], [h, [m, I], [g, k]], [/droid.+; (wt63?0{2,3})\)/i], [h, [m, W], [g, k]], [/(quest( 2| pro)?)/i], [h, [m, K], [g, k]], [/(tesla)(?: qtcarbrowser|\/[-\w\.]+)/i], [m, [g, E]], [/(aeobc)\b/i], [h, [m, x], [g, E]], [/droid .+?; ([^;]+?)(?: bui|\) applew).+? mobile safari/i], [h, [g, v]], [/droid .+?; ([^;]+?)(?: bui|\) applew).+?(?! mobile) safari/i], [h, [g, _]], [/\b((tablet|tab)[;\/]|focus\/\d(?!.+mobile))/i], [[g, _]], [/(phone|mobile(?:[;\/]| [ \w\/\.]*safari)|pda(?=.+windows ce))/i], [[g, v]], [/(android[-\w\. ]{0,9});.+buil/i], [h, [m, "Generic"]]], engine: [[/windows.+ edge\/([\w\.]+)/i], [y, [f, "EdgeHTML"]], [/webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i], [y, [f, "Blink"]], [/(presto)\/([\w\.]+)/i, /(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna)\/([\w\.]+)/i, /ekioh(flow)\/([\w\.]+)/i, /(khtml|tasman|links)[\/ ]\(?([\w\.]+)/i, /(icab)[\/ ]([23]\.[\d\.]+)/i, /\b(libweb)/i], [f, y], [/rv\:([\w\.]{1,9})\b.+(gecko)/i], [y, f]], os: [[/microsoft (windows) (vista|xp)/i], [f, y], [/(windows) nt 6\.2; (arm)/i, /(windows (?:phone(?: os)?|mobile))[\/ ]?([\d\.\w ]*)/i, /(windows)[\/ ]?([ntce\d\. ]+\w)(?!.+xbox)/i], [f, [y, Y, Z]], [/(win(?=3|9|n)|win 9x )([nt\d\.]+)/i], [[f, "Windows"], [y, Y, Z]], [/ip[honead]{2,4}\b(?:.*os ([\w]+) like mac|; opera)/i, /ios;fbsv\/([\d\.]+)/i, /cfnetwork\/.+darwin/i], [[y, /_/g, "."], [f, "iOS"]], [/(mac os x) ?([\w\. ]*)/i, /(macintosh|mac_powerpc\b)(?!.+haiku)/i], [[f, J], [y, /_/g, "."]], [/droid ([\w\.]+)\b.+(android[- ]x86|harmonyos)/i], [y, f], [/(android|webos|qnx|bada|rim tablet os|maemo|meego|sailfish)[-\/ ]?([\w\.]*)/i, /(blackberry)\w*\/([\w\.]*)/i, /(tizen|kaios)[\/ ]([\w\.]+)/i, /\((series40);/i], [f, y], [/\(bb(10);/i], [y, [f, P]], [/(?:symbian ?os|symbos|s60(?=;)|series60)[-\/ ]?([\w\.]*)/i], [y, [f, "Symbian"]], [/mozilla\/[\d\.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w\.]+)/i], [y, [f, O + " OS"]], [/web0s;.+rt(tv)/i, /\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i], [y, [f, "webOS"]], [/watch(?: ?os[,\/]|\d,\d\/)([\d\.]+)/i], [y, [f, "watchOS"]], [/crkey\/([\d\.]+)/i], [y, [f, R + "cast"]], [/(cros) [\w]+(?:\)| ([\w\.]+)\b)/i], [[f, B], y], [/panasonic;(viera)/i, /(netrange)mmh/i, /(nettv)\/(\d+\.[\w\.]+)/i, /(nintendo|playstation) ([wids345portablevuch]+)/i, /(xbox); +xbox ([^\);]+)/i, /\b(joli|palm)\b ?(?:os)?\/?([\w\.]*)/i, /(mint)[\/\(\) ]?(\w*)/i, /(mageia|vectorlinux)[; ]/i, /([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-\/ ]?(?!chrom|package)([-\w\.]*)/i, /(hurd|linux) ?([\w\.]*)/i, /(gnu) ?([\w\.]*)/i, /\b([-frentopcghs]{0,5}bsd|dragonfly)[\/ ]?(?!amd|[ix346]{1,2}86)([\w\.]*)/i, /(haiku) (\w+)/i], [f, y], [/(sunos) ?([\w\.\d]*)/i], [[f, "Solaris"], y], [/((?:open)?solaris)[-\/ ]?([\w\.]*)/i, /(aix) ((\d)(?=\.|\)| )[\w\.])*/i, /\b(beos|os\/2|amigaos|morphos|openvms|fuchsia|hp-ux|serenityos)/i, /(unix) ?([\w\.]*)/i], [f, y]] }, ee = function(e2, t2) {
              if (typeof e2 === u && (t2 = e2, e2 = s2), !(this instanceof ee)) return new ee(e2, t2).getResult();
              var r2 = typeof o2 !== l && o2.navigator ? o2.navigator : s2, n2 = e2 || (r2 && r2.userAgent ? r2.userAgent : ""), i3 = r2 && r2.userAgentData ? r2.userAgentData : s2, a3 = t2 ? V(Q, t2) : Q, b2 = r2 && r2.userAgent == n2;
              return this.getBrowser = function() {
                var e3, t3 = {};
                return t3[f] = s2, t3[y] = s2, X.call(t3, n2, a3.browser), t3[p] = typeof (e3 = t3[y]) === d ? e3.replace(/[^\d\.]/g, "").split(".")[0] : s2, b2 && r2 && r2.brave && typeof r2.brave.isBrave == c && (t3[f] = "Brave"), t3;
              }, this.getCPU = function() {
                var e3 = {};
                return e3[w] = s2, X.call(e3, n2, a3.cpu), e3;
              }, this.getDevice = function() {
                var e3 = {};
                return e3[m] = s2, e3[h] = s2, e3[g] = s2, X.call(e3, n2, a3.device), b2 && !e3[g] && i3 && i3.mobile && (e3[g] = v), b2 && "Macintosh" == e3[h] && r2 && typeof r2.standalone !== l && r2.maxTouchPoints && r2.maxTouchPoints > 2 && (e3[h] = "iPad", e3[g] = _), e3;
              }, this.getEngine = function() {
                var e3 = {};
                return e3[f] = s2, e3[y] = s2, X.call(e3, n2, a3.engine), e3;
              }, this.getOS = function() {
                var e3 = {};
                return e3[f] = s2, e3[y] = s2, X.call(e3, n2, a3.os), b2 && !e3[f] && i3 && "Unknown" != i3.platform && (e3[f] = i3.platform.replace(/chrome os/i, B).replace(/macos/i, J)), e3;
              }, this.getResult = function() {
                return { ua: this.getUA(), browser: this.getBrowser(), engine: this.getEngine(), os: this.getOS(), device: this.getDevice(), cpu: this.getCPU() };
              }, this.getUA = function() {
                return n2;
              }, this.setUA = function(e3) {
                return n2 = typeof e3 === d && e3.length > 350 ? G(e3, 350) : e3, this;
              }, this.setUA(n2), this;
            };
            ee.VERSION = "1.0.35", ee.BROWSER = q([f, y, p]), ee.CPU = q([w]), ee.DEVICE = q([h, m, g, b, v, S, _, k, E]), ee.ENGINE = ee.OS = q([f, y]), typeof a2 !== l ? (i2.exports && (a2 = i2.exports = ee), a2.UAParser = ee) : r.amdO ? void 0 !== (n = function() {
              return ee;
            }.call(t, r, t, e)) && (e.exports = n) : typeof o2 !== l && (o2.UAParser = ee);
            var et = typeof o2 !== l && (o2.jQuery || o2.Zepto);
            if (et && !et.ua) {
              var er = new ee();
              et.ua = er.getResult(), et.ua.get = function() {
                return er.getUA();
              }, et.ua.set = function(e2) {
                er.setUA(e2);
                var t2 = er.getResult();
                for (var r2 in t2) et.ua[r2] = t2[r2];
              };
            }
          }("object" == typeof window ? window : this);
        } }, a = {};
        function o(e2) {
          var t2 = a[e2];
          if (void 0 !== t2) return t2.exports;
          var r2 = a[e2] = { exports: {} }, n2 = true;
          try {
            i[e2].call(r2.exports, r2, r2.exports, o), n2 = false;
          } finally {
            n2 && delete a[e2];
          }
          return r2.exports;
        }
        o.ab = "//";
        var s = o(226);
        e.exports = s;
      })();
    }, 912: (e, t, r) => {
      "use strict";
      r.r(t), r.d(t, { bailoutToClientRendering: () => a });
      class n extends Error {
        constructor(e2) {
          super("Bail out to client-side rendering: " + e2), this.reason = e2, this.digest = "BAILOUT_TO_CLIENT_SIDE_RENDERING";
        }
      }
      var i = r(452);
      function a(e2) {
        let t2 = i.A.getStore();
        if ((null == t2 || !t2.forceStatic) && (null == t2 ? void 0 : t2.isStaticGeneration)) throw new n(e2);
      }
    }, 452: (e, t, r) => {
      "use strict";
      r.d(t, { A: () => n });
      let n = (0, r(228).P)();
    }, 488: (e, t, r) => {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: true }), function(e2, t2) {
        for (var r2 in t2) Object.defineProperty(e2, r2, { enumerable: true, get: t2[r2] });
      }(t, { getTestReqInfo: function() {
        return o;
      }, withRequest: function() {
        return a;
      } });
      let n = new (r(67)).AsyncLocalStorage();
      function i(e2, t2) {
        let r2 = t2.header(e2, "next-test-proxy-port");
        if (r2) return { url: t2.url(e2), proxyPort: Number(r2), testData: t2.header(e2, "next-test-data") || "" };
      }
      function a(e2, t2, r2) {
        let a2 = i(e2, t2);
        return a2 ? n.run(a2, r2) : r2();
      }
      function o(e2, t2) {
        return n.getStore() || (e2 && t2 ? i(e2, t2) : void 0);
      }
    }, 375: (e, t, r) => {
      "use strict";
      var n = r(195).Buffer;
      Object.defineProperty(t, "__esModule", { value: true }), function(e2, t2) {
        for (var r2 in t2) Object.defineProperty(e2, r2, { enumerable: true, get: t2[r2] });
      }(t, { handleFetch: function() {
        return s;
      }, interceptFetch: function() {
        return c;
      }, reader: function() {
        return a;
      } });
      let i = r(488), a = { url: (e2) => e2.url, header: (e2, t2) => e2.headers.get(t2) };
      async function o(e2, t2) {
        let { url: r2, method: i2, headers: a2, body: o2, cache: s2, credentials: c2, integrity: l, mode: u, redirect: d, referrer: p, referrerPolicy: h } = t2;
        return { testData: e2, api: "fetch", request: { url: r2, method: i2, headers: [...Array.from(a2), ["next-test-stack", function() {
          let e3 = (Error().stack ?? "").split("\n");
          for (let t3 = 1; t3 < e3.length; t3++) if (e3[t3].length > 0) {
            e3 = e3.slice(t3);
            break;
          }
          return (e3 = (e3 = (e3 = e3.filter((e4) => !e4.includes("/next/dist/"))).slice(0, 5)).map((e4) => e4.replace("webpack-internal:///(rsc)/", "").trim())).join("    ");
        }()]], body: o2 ? n.from(await t2.arrayBuffer()).toString("base64") : null, cache: s2, credentials: c2, integrity: l, mode: u, redirect: d, referrer: p, referrerPolicy: h } };
      }
      async function s(e2, t2) {
        let r2 = (0, i.getTestReqInfo)(t2, a);
        if (!r2) return e2(t2);
        let { testData: s2, proxyPort: c2 } = r2, l = await o(s2, t2), u = await e2(`http://localhost:${c2}`, { method: "POST", body: JSON.stringify(l), next: { internal: true } });
        if (!u.ok) throw Error(`Proxy request failed: ${u.status}`);
        let d = await u.json(), { api: p } = d;
        switch (p) {
          case "continue":
            return e2(t2);
          case "abort":
          case "unhandled":
            throw Error(`Proxy request aborted [${t2.method} ${t2.url}]`);
        }
        return function(e3) {
          let { status: t3, headers: r3, body: i2 } = e3.response;
          return new Response(i2 ? n.from(i2, "base64") : null, { status: t3, headers: new Headers(r3) });
        }(d);
      }
      function c(e2) {
        return r.g.fetch = function(t2, r2) {
          var n2;
          return (null == r2 ? void 0 : null == (n2 = r2.next) ? void 0 : n2.internal) ? e2(t2, r2) : s(e2, new Request(t2, r2));
        }, () => {
          r.g.fetch = e2;
        };
      }
    }, 177: (e, t, r) => {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: true }), function(e2, t2) {
        for (var r2 in t2) Object.defineProperty(e2, r2, { enumerable: true, get: t2[r2] });
      }(t, { interceptTestApis: function() {
        return a;
      }, wrapRequestHandler: function() {
        return o;
      } });
      let n = r(488), i = r(375);
      function a() {
        return (0, i.interceptFetch)(r.g.fetch);
      }
      function o(e2) {
        return (t2, r2) => (0, n.withRequest)(t2, i.reader, () => e2(t2, r2));
      }
    }, 304: (e, t) => {
      "use strict";
      var r = Symbol.for("react.element"), n = Symbol.for("react.portal"), i = Symbol.for("react.fragment"), a = Symbol.for("react.strict_mode"), o = Symbol.for("react.profiler"), s = Symbol.for("react.provider"), c = Symbol.for("react.context"), l = Symbol.for("react.forward_ref"), u = Symbol.for("react.suspense"), d = Symbol.for("react.memo"), p = Symbol.for("react.lazy"), h = Symbol.iterator, f = { isMounted: function() {
        return false;
      }, enqueueForceUpdate: function() {
      }, enqueueReplaceState: function() {
      }, enqueueSetState: function() {
      } }, g = Object.assign, m = {};
      function y(e2, t2, r2) {
        this.props = e2, this.context = t2, this.refs = m, this.updater = r2 || f;
      }
      function w() {
      }
      function b(e2, t2, r2) {
        this.props = e2, this.context = t2, this.refs = m, this.updater = r2 || f;
      }
      y.prototype.isReactComponent = {}, y.prototype.setState = function(e2, t2) {
        if ("object" != typeof e2 && "function" != typeof e2 && null != e2) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
        this.updater.enqueueSetState(this, e2, t2, "setState");
      }, y.prototype.forceUpdate = function(e2) {
        this.updater.enqueueForceUpdate(this, e2, "forceUpdate");
      }, w.prototype = y.prototype;
      var v = b.prototype = new w();
      v.constructor = b, g(v, y.prototype), v.isPureReactComponent = true;
      var _ = Array.isArray, S = Object.prototype.hasOwnProperty, k = { current: null }, E = { key: true, ref: true, __self: true, __source: true };
      function x(e2, t2, n2) {
        var i2, a2 = {}, o2 = null, s2 = null;
        if (null != t2) for (i2 in void 0 !== t2.ref && (s2 = t2.ref), void 0 !== t2.key && (o2 = "" + t2.key), t2) S.call(t2, i2) && !E.hasOwnProperty(i2) && (a2[i2] = t2[i2]);
        var c2 = arguments.length - 2;
        if (1 === c2) a2.children = n2;
        else if (1 < c2) {
          for (var l2 = Array(c2), u2 = 0; u2 < c2; u2++) l2[u2] = arguments[u2 + 2];
          a2.children = l2;
        }
        if (e2 && e2.defaultProps) for (i2 in c2 = e2.defaultProps) void 0 === a2[i2] && (a2[i2] = c2[i2]);
        return { $$typeof: r, type: e2, key: o2, ref: s2, props: a2, _owner: k.current };
      }
      function A(e2) {
        return "object" == typeof e2 && null !== e2 && e2.$$typeof === r;
      }
      var T = /\/+/g;
      function P(e2, t2) {
        var r2, n2;
        return "object" == typeof e2 && null !== e2 && null != e2.key ? (r2 = "" + e2.key, n2 = { "=": "=0", ":": "=2" }, "$" + r2.replace(/[=:]/g, function(e3) {
          return n2[e3];
        })) : t2.toString(36);
      }
      function C(e2, t2, i2) {
        if (null == e2) return e2;
        var a2 = [], o2 = 0;
        return !function e3(t3, i3, a3, o3, s2) {
          var c2, l2, u2, d2 = typeof t3;
          ("undefined" === d2 || "boolean" === d2) && (t3 = null);
          var p2 = false;
          if (null === t3) p2 = true;
          else switch (d2) {
            case "string":
            case "number":
              p2 = true;
              break;
            case "object":
              switch (t3.$$typeof) {
                case r:
                case n:
                  p2 = true;
              }
          }
          if (p2) return s2 = s2(p2 = t3), t3 = "" === o3 ? "." + P(p2, 0) : o3, _(s2) ? (a3 = "", null != t3 && (a3 = t3.replace(T, "$&/") + "/"), e3(s2, i3, a3, "", function(e4) {
            return e4;
          })) : null != s2 && (A(s2) && (c2 = s2, l2 = a3 + (!s2.key || p2 && p2.key === s2.key ? "" : ("" + s2.key).replace(T, "$&/") + "/") + t3, s2 = { $$typeof: r, type: c2.type, key: l2, ref: c2.ref, props: c2.props, _owner: c2._owner }), i3.push(s2)), 1;
          if (p2 = 0, o3 = "" === o3 ? "." : o3 + ":", _(t3)) for (var f2 = 0; f2 < t3.length; f2++) {
            var g2 = o3 + P(d2 = t3[f2], f2);
            p2 += e3(d2, i3, a3, g2, s2);
          }
          else if ("function" == typeof (g2 = null === (u2 = t3) || "object" != typeof u2 ? null : "function" == typeof (u2 = h && u2[h] || u2["@@iterator"]) ? u2 : null)) for (t3 = g2.call(t3), f2 = 0; !(d2 = t3.next()).done; ) g2 = o3 + P(d2 = d2.value, f2++), p2 += e3(d2, i3, a3, g2, s2);
          else if ("object" === d2) throw Error("Objects are not valid as a React child (found: " + ("[object Object]" === (i3 = String(t3)) ? "object with keys {" + Object.keys(t3).join(", ") + "}" : i3) + "). If you meant to render a collection of children, use an array instead.");
          return p2;
        }(e2, a2, "", "", function(e3) {
          return t2.call(i2, e3, o2++);
        }), a2;
      }
      function R(e2) {
        if (-1 === e2._status) {
          var t2 = e2._result;
          (t2 = t2()).then(function(t3) {
            (0 === e2._status || -1 === e2._status) && (e2._status = 1, e2._result = t3);
          }, function(t3) {
            (0 === e2._status || -1 === e2._status) && (e2._status = 2, e2._result = t3);
          }), -1 === e2._status && (e2._status = 0, e2._result = t2);
        }
        if (1 === e2._status) return e2._result.default;
        throw e2._result;
      }
      var O = { current: null }, I = { transition: null };
      function U() {
        throw Error("act(...) is not supported in production builds of React.");
      }
      t.Children = { map: C, forEach: function(e2, t2, r2) {
        C(e2, function() {
          t2.apply(this, arguments);
        }, r2);
      }, count: function(e2) {
        var t2 = 0;
        return C(e2, function() {
          t2++;
        }), t2;
      }, toArray: function(e2) {
        return C(e2, function(e3) {
          return e3;
        }) || [];
      }, only: function(e2) {
        if (!A(e2)) throw Error("React.Children.only expected to receive a single React element child.");
        return e2;
      } }, t.Component = y, t.Fragment = i, t.Profiler = o, t.PureComponent = b, t.StrictMode = a, t.Suspense = u, t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = { ReactCurrentDispatcher: O, ReactCurrentBatchConfig: I, ReactCurrentOwner: k }, t.act = U, t.cloneElement = function(e2, t2, n2) {
        if (null == e2) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + e2 + ".");
        var i2 = g({}, e2.props), a2 = e2.key, o2 = e2.ref, s2 = e2._owner;
        if (null != t2) {
          if (void 0 !== t2.ref && (o2 = t2.ref, s2 = k.current), void 0 !== t2.key && (a2 = "" + t2.key), e2.type && e2.type.defaultProps) var c2 = e2.type.defaultProps;
          for (l2 in t2) S.call(t2, l2) && !E.hasOwnProperty(l2) && (i2[l2] = void 0 === t2[l2] && void 0 !== c2 ? c2[l2] : t2[l2]);
        }
        var l2 = arguments.length - 2;
        if (1 === l2) i2.children = n2;
        else if (1 < l2) {
          c2 = Array(l2);
          for (var u2 = 0; u2 < l2; u2++) c2[u2] = arguments[u2 + 2];
          i2.children = c2;
        }
        return { $$typeof: r, type: e2.type, key: a2, ref: o2, props: i2, _owner: s2 };
      }, t.createContext = function(e2) {
        return (e2 = { $$typeof: c, _currentValue: e2, _currentValue2: e2, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }).Provider = { $$typeof: s, _context: e2 }, e2.Consumer = e2;
      }, t.createElement = x, t.createFactory = function(e2) {
        var t2 = x.bind(null, e2);
        return t2.type = e2, t2;
      }, t.createRef = function() {
        return { current: null };
      }, t.forwardRef = function(e2) {
        return { $$typeof: l, render: e2 };
      }, t.isValidElement = A, t.lazy = function(e2) {
        return { $$typeof: p, _payload: { _status: -1, _result: e2 }, _init: R };
      }, t.memo = function(e2, t2) {
        return { $$typeof: d, type: e2, compare: void 0 === t2 ? null : t2 };
      }, t.startTransition = function(e2) {
        var t2 = I.transition;
        I.transition = {};
        try {
          e2();
        } finally {
          I.transition = t2;
        }
      }, t.unstable_act = U, t.useCallback = function(e2, t2) {
        return O.current.useCallback(e2, t2);
      }, t.useContext = function(e2) {
        return O.current.useContext(e2);
      }, t.useDebugValue = function() {
      }, t.useDeferredValue = function(e2) {
        return O.current.useDeferredValue(e2);
      }, t.useEffect = function(e2, t2) {
        return O.current.useEffect(e2, t2);
      }, t.useId = function() {
        return O.current.useId();
      }, t.useImperativeHandle = function(e2, t2, r2) {
        return O.current.useImperativeHandle(e2, t2, r2);
      }, t.useInsertionEffect = function(e2, t2) {
        return O.current.useInsertionEffect(e2, t2);
      }, t.useLayoutEffect = function(e2, t2) {
        return O.current.useLayoutEffect(e2, t2);
      }, t.useMemo = function(e2, t2) {
        return O.current.useMemo(e2, t2);
      }, t.useReducer = function(e2, t2, r2) {
        return O.current.useReducer(e2, t2, r2);
      }, t.useRef = function(e2) {
        return O.current.useRef(e2);
      }, t.useState = function(e2) {
        return O.current.useState(e2);
      }, t.useSyncExternalStore = function(e2, t2, r2) {
        return O.current.useSyncExternalStore(e2, t2, r2);
      }, t.useTransition = function() {
        return O.current.useTransition();
      }, t.version = "18.3.1";
    }, 479: (e, t, r) => {
      "use strict";
      e.exports = r(304);
    }, 228: (e, t, r) => {
      "use strict";
      r.d(t, { P: () => o });
      let n = Error("Invariant: AsyncLocalStorage accessed in runtime where it is not available");
      class i {
        disable() {
          throw n;
        }
        getStore() {
        }
        run() {
          throw n;
        }
        exit() {
          throw n;
        }
        enterWith() {
          throw n;
        }
      }
      let a = globalThis.AsyncLocalStorage;
      function o() {
        return a ? new a() : new i();
      }
    } }, (e) => {
      var t = e(e.s = 156);
      (_ENTRIES = "undefined" == typeof _ENTRIES ? {} : _ENTRIES)["middleware_src/middleware"] = t;
    }]);
  }
});

// node_modules/@opennextjs/aws/dist/core/edgeFunctionHandler.js
var edgeFunctionHandler_exports = {};
__export(edgeFunctionHandler_exports, {
  default: () => edgeFunctionHandler
});
async function edgeFunctionHandler(request) {
  const path3 = new URL(request.url).pathname;
  const routes = globalThis._ROUTES;
  const correspondingRoute = routes.find((route) => route.regex.some((r) => new RegExp(r).test(path3)));
  if (!correspondingRoute) {
    throw new Error(`No route found for ${request.url}`);
  }
  const entry = await self._ENTRIES[`middleware_${correspondingRoute.name}`];
  const result = await entry.default({
    page: correspondingRoute.page,
    request: {
      ...request,
      page: {
        name: correspondingRoute.name
      }
    }
  });
  globalThis.__openNextAls.getStore()?.pendingPromiseRunner.add(result.waitUntil);
  const response = result.response;
  return response;
}
var init_edgeFunctionHandler = __esm({
  "node_modules/@opennextjs/aws/dist/core/edgeFunctionHandler.js"() {
    globalThis._ENTRIES = {};
    globalThis.self = globalThis;
    globalThis._ROUTES = [{ "name": "src/middleware", "page": "/", "regex": ["^(?:\\/(_next\\/data\\/[^/]{1,}))?(?:\\/((?!_next\\/static|_next\\/image|favicon.ico).*))(.json)?[\\/#\\?]?$"] }];
    require_edge_runtime_webpack();
    require_middleware();
  }
});

// node_modules/@opennextjs/aws/dist/utils/promise.js
init_logger();
var DetachedPromise = class {
  resolve;
  reject;
  promise;
  constructor() {
    let resolve;
    let reject;
    this.promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    this.resolve = resolve;
    this.reject = reject;
  }
};
var DetachedPromiseRunner = class {
  promises = [];
  withResolvers() {
    const detachedPromise = new DetachedPromise();
    this.promises.push(detachedPromise);
    return detachedPromise;
  }
  add(promise) {
    const detachedPromise = new DetachedPromise();
    this.promises.push(detachedPromise);
    promise.then(detachedPromise.resolve, detachedPromise.reject);
  }
  async await() {
    debug(`Awaiting ${this.promises.length} detached promises`);
    const results = await Promise.allSettled(this.promises.map((p) => p.promise));
    const rejectedPromises = results.filter((r) => r.status === "rejected");
    rejectedPromises.forEach((r) => {
      error(r.reason);
    });
  }
};
async function awaitAllDetachedPromise() {
  const store = globalThis.__openNextAls.getStore();
  const promisesToAwait = store?.pendingPromiseRunner.await() ?? Promise.resolve();
  if (store?.waitUntil) {
    store.waitUntil(promisesToAwait);
    return;
  }
  await promisesToAwait;
}
function provideNextAfterProvider() {
  const NEXT_REQUEST_CONTEXT_SYMBOL = Symbol.for("@next/request-context");
  const VERCEL_REQUEST_CONTEXT_SYMBOL = Symbol.for("@vercel/request-context");
  const store = globalThis.__openNextAls.getStore();
  const waitUntil = store?.waitUntil ?? ((promise) => store?.pendingPromiseRunner.add(promise));
  const nextAfterContext = {
    get: () => ({
      waitUntil
    })
  };
  globalThis[NEXT_REQUEST_CONTEXT_SYMBOL] = nextAfterContext;
  if (process.env.EMULATE_VERCEL_REQUEST_CONTEXT) {
    globalThis[VERCEL_REQUEST_CONTEXT_SYMBOL] = nextAfterContext;
  }
}
function runWithOpenNextRequestContext({ isISRRevalidation, waitUntil, requestId = Math.random().toString(36) }, fn) {
  return globalThis.__openNextAls.run({
    requestId,
    pendingPromiseRunner: new DetachedPromiseRunner(),
    isISRRevalidation,
    waitUntil,
    writtenTags: /* @__PURE__ */ new Set()
  }, async () => {
    provideNextAfterProvider();
    let result;
    try {
      result = await fn();
    } finally {
      await awaitAllDetachedPromise();
    }
    return result;
  });
}

// node_modules/@opennextjs/aws/dist/adapters/middleware.js
init_logger();

// node_modules/@opennextjs/aws/dist/core/createGenericHandler.js
init_logger();

// node_modules/@opennextjs/aws/dist/core/resolve.js
async function resolveConverter(converter2) {
  if (typeof converter2 === "function") {
    return converter2();
  }
  const m_1 = await Promise.resolve().then(() => (init_edge(), edge_exports));
  return m_1.default;
}
async function resolveWrapper(wrapper) {
  if (typeof wrapper === "function") {
    return wrapper();
  }
  const m_1 = await Promise.resolve().then(() => (init_cloudflare_edge(), cloudflare_edge_exports));
  return m_1.default;
}
async function resolveOriginResolver(originResolver) {
  if (typeof originResolver === "function") {
    return originResolver();
  }
  const m_1 = await Promise.resolve().then(() => (init_pattern_env(), pattern_env_exports));
  return m_1.default;
}
async function resolveAssetResolver(assetResolver) {
  if (typeof assetResolver === "function") {
    return assetResolver();
  }
  const m_1 = await Promise.resolve().then(() => (init_dummy(), dummy_exports));
  return m_1.default;
}
async function resolveProxyRequest(proxyRequest) {
  if (typeof proxyRequest === "function") {
    return proxyRequest();
  }
  const m_1 = await Promise.resolve().then(() => (init_fetch(), fetch_exports));
  return m_1.default;
}

// node_modules/@opennextjs/aws/dist/core/createGenericHandler.js
async function createGenericHandler(handler3) {
  const config = await import("./open-next.config.mjs").then((m) => m.default);
  globalThis.openNextConfig = config;
  const handlerConfig = config[handler3.type];
  const override = handlerConfig && "override" in handlerConfig ? handlerConfig.override : void 0;
  const converter2 = await resolveConverter(override?.converter);
  const { name, wrapper } = await resolveWrapper(override?.wrapper);
  debug("Using wrapper", name);
  return wrapper(handler3.handler, converter2);
}

// node_modules/@opennextjs/aws/dist/core/routing/util.js
import crypto2 from "node:crypto";
import { parse as parseQs, stringify as stringifyQs } from "node:querystring";

// node_modules/@opennextjs/aws/dist/adapters/config/index.js
init_logger();
import path from "node:path";
globalThis.__dirname ??= "";
var NEXT_DIR = path.join(__dirname, ".next");
var OPEN_NEXT_DIR = path.join(__dirname, ".open-next");
debug({ NEXT_DIR, OPEN_NEXT_DIR });
var NextConfig = { "env": {}, "webpack": null, "eslint": { "ignoreDuringBuilds": false }, "typescript": { "ignoreBuildErrors": true, "tsconfigPath": "tsconfig.json" }, "distDir": ".next", "cleanDistDir": true, "assetPrefix": "", "cacheMaxMemorySize": 52428800, "configOrigin": "next.config.mjs", "useFileSystemPublicRoutes": true, "generateEtags": true, "pageExtensions": ["tsx", "ts", "jsx", "js"], "poweredByHeader": true, "compress": true, "analyticsId": "", "images": { "deviceSizes": [640, 750, 828, 1080, 1200, 1920, 2048, 3840], "imageSizes": [16, 32, 48, 64, 96, 128, 256, 384], "path": "/_next/image", "loader": "default", "loaderFile": "", "domains": [], "disableStaticImages": false, "minimumCacheTTL": 60, "formats": ["image/webp"], "dangerouslyAllowSVG": false, "contentSecurityPolicy": "script-src 'none'; frame-src 'none'; sandbox;", "contentDispositionType": "inline", "remotePatterns": [], "unoptimized": true }, "devIndicators": { "buildActivity": true, "buildActivityPosition": "bottom-right" }, "onDemandEntries": { "maxInactiveAge": 6e4, "pagesBufferLength": 5 }, "amp": { "canonicalBase": "" }, "basePath": "", "sassOptions": {}, "trailingSlash": false, "i18n": null, "productionBrowserSourceMaps": false, "optimizeFonts": true, "excludeDefaultMomentLocales": true, "serverRuntimeConfig": {}, "publicRuntimeConfig": {}, "reactProductionProfiling": false, "reactStrictMode": true, "httpAgentOptions": { "keepAlive": true }, "outputFileTracing": true, "staticPageGenerationTimeout": 60, "swcMinify": true, "output": "standalone", "modularizeImports": { "@mui/icons-material": { "transform": "@mui/icons-material/{{member}}" }, "lodash": { "transform": "lodash/{{member}}" } }, "experimental": { "multiZoneDraftMode": false, "prerenderEarlyExit": false, "serverMinification": true, "serverSourceMaps": false, "linkNoTouchStart": false, "caseSensitiveRoutes": false, "clientRouterFilter": true, "clientRouterFilterRedirects": false, "fetchCacheKeyPrefix": "", "middlewarePrefetch": "flexible", "optimisticClientCache": true, "manualClientBasePath": false, "cpus": 11, "memoryBasedWorkersCount": false, "isrFlushToDisk": true, "workerThreads": false, "optimizeCss": false, "nextScriptWorkers": false, "scrollRestoration": false, "externalDir": false, "disableOptimizedLoading": false, "gzipSize": true, "craCompat": false, "esmExternals": true, "fullySpecified": false, "outputFileTracingRoot": "/Users/mattiapetrucciani/CascadeProjects/Onde", "swcTraceProfiling": false, "forceSwcTransforms": false, "largePageDataBytes": 128e3, "adjustFontFallbacks": false, "adjustFontFallbacksWithSizeAdjust": false, "typedRoutes": false, "instrumentationHook": false, "bundlePagesExternals": false, "parallelServerCompiles": false, "parallelServerBuildTraces": false, "ppr": false, "missingSuspenseWithCSRBailout": true, "optimizeServerReact": true, "useEarlyImport": false, "staleTimes": { "dynamic": 30, "static": 300 }, "optimizePackageImports": ["lucide-react", "date-fns", "lodash-es", "ramda", "antd", "react-bootstrap", "ahooks", "@ant-design/icons", "@headlessui/react", "@headlessui-float/react", "@heroicons/react/20/solid", "@heroicons/react/24/solid", "@heroicons/react/24/outline", "@visx/visx", "@tremor/react", "rxjs", "@mui/material", "@mui/icons-material", "recharts", "react-use", "@material-ui/core", "@material-ui/icons", "@tabler/icons-react", "mui-core", "react-icons/ai", "react-icons/bi", "react-icons/bs", "react-icons/cg", "react-icons/ci", "react-icons/di", "react-icons/fa", "react-icons/fa6", "react-icons/fc", "react-icons/fi", "react-icons/gi", "react-icons/go", "react-icons/gr", "react-icons/hi", "react-icons/hi2", "react-icons/im", "react-icons/io", "react-icons/io5", "react-icons/lia", "react-icons/lib", "react-icons/lu", "react-icons/md", "react-icons/pi", "react-icons/ri", "react-icons/rx", "react-icons/si", "react-icons/sl", "react-icons/tb", "react-icons/tfi", "react-icons/ti", "react-icons/vsc", "react-icons/wi"], "trustHostHeader": false, "isExperimentalCompile": false }, "configFileName": "next.config.mjs" };
var BuildId = "Na8mTXIpjEOt-r0e3mMdM";
var RoutesManifest = { "basePath": "", "rewrites": { "beforeFiles": [], "afterFiles": [], "fallback": [] }, "redirects": [{ "source": "/:path+/", "destination": "/:path+", "internal": true, "statusCode": 308, "regex": "^(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))/$" }], "routes": { "static": [{ "page": "/", "regex": "^/(?:/)?$", "routeKeys": {}, "namedRegex": "^/(?:/)?$" }, { "page": "/_not-found", "regex": "^/_not\\-found(?:/)?$", "routeKeys": {}, "namedRegex": "^/_not\\-found(?:/)?$" }, { "page": "/coming-soon", "regex": "^/coming\\-soon(?:/)?$", "routeKeys": {}, "namedRegex": "^/coming\\-soon(?:/)?$" }, { "page": "/corde", "regex": "^/corde(?:/)?$", "routeKeys": {}, "namedRegex": "^/corde(?:/)?$" }, { "page": "/login", "regex": "^/login(?:/)?$", "routeKeys": {}, "namedRegex": "^/login(?:/)?$" }, { "page": "/social", "regex": "^/social(?:/)?$", "routeKeys": {}, "namedRegex": "^/social(?:/)?$" }], "dynamic": [{ "page": "/api/auth/[...nextauth]", "regex": "^/api/auth/(.+?)(?:/)?$", "routeKeys": { "nxtPnextauth": "nxtPnextauth" }, "namedRegex": "^/api/auth/(?<nxtPnextauth>.+?)(?:/)?$" }], "data": { "static": [], "dynamic": [] } }, "locales": [] };
var ConfigHeaders = [];
var PrerenderManifest = { "version": 4, "routes": { "/corde": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/corde", "dataRoute": "/corde.rsc" }, "/social": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/social", "dataRoute": "/social.rsc" }, "/api/posts/pending": { "initialHeaders": { "content-type": "application/json", "x-next-cache-tags": "_N_T_/layout,_N_T_/api/layout,_N_T_/api/posts/layout,_N_T_/api/posts/pending/layout,_N_T_/api/posts/pending/route,_N_T_/api/posts/pending" }, "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/api/posts/pending", "dataRoute": null }, "/api/polyroborto/status": { "initialHeaders": { "content-type": "application/json", "x-next-cache-tags": "_N_T_/layout,_N_T_/api/layout,_N_T_/api/polyroborto/layout,_N_T_/api/polyroborto/status/layout,_N_T_/api/polyroborto/status/route,_N_T_/api/polyroborto/status" }, "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/api/polyroborto/status", "dataRoute": null }, "/login": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/login", "dataRoute": "/login.rsc" }, "/coming-soon": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/coming-soon", "dataRoute": "/coming-soon.rsc" } }, "dynamicRoutes": {}, "notFoundRoutes": [], "preview": { "previewModeId": "8fae47ee043609593f02d13ec3be8788", "previewModeSigningKey": "12bdf20a6b57c0cf9daf291433dc3a05cad3bda0372d2dfe56671ae9ed27b81e", "previewModeEncryptionKey": "adf6b3d3674668e0f602495594763fe92b80e2725ae175eca38480fc11cf1755" } };
var MiddlewareManifest = { "version": 3, "middleware": { "/": { "files": ["server/edge-runtime-webpack.js", "server/src/middleware.js"], "name": "src/middleware", "page": "/", "matchers": [{ "regexp": "^(?:\\/(_next\\/data\\/[^/]{1,}))?(?:\\/((?!_next\\/static|_next\\/image|favicon.ico).*))(.json)?[\\/#\\?]?$", "originalSource": "/((?!_next/static|_next/image|favicon.ico).*)" }], "wasm": [], "assets": [], "env": { "__NEXT_BUILD_ID": "Na8mTXIpjEOt-r0e3mMdM", "NEXT_SERVER_ACTIONS_ENCRYPTION_KEY": "LhJkLYDxX2ox1MKsy4InslnDa98Q1Iv6qP+aVdverpc=", "__NEXT_PREVIEW_MODE_ID": "8fae47ee043609593f02d13ec3be8788", "__NEXT_PREVIEW_MODE_ENCRYPTION_KEY": "adf6b3d3674668e0f602495594763fe92b80e2725ae175eca38480fc11cf1755", "__NEXT_PREVIEW_MODE_SIGNING_KEY": "12bdf20a6b57c0cf9daf291433dc3a05cad3bda0372d2dfe56671ae9ed27b81e" } } }, "functions": {}, "sortedMiddleware": ["/"] };
var AppPathRoutesManifest = { "/api/posts/approve/route": "/api/posts/approve", "/api/polyroborto/status/route": "/api/polyroborto/status", "/api/polyroborto/feedback/route": "/api/polyroborto/feedback", "/api/posts/feedback/route": "/api/posts/feedback", "/api/posts/reject/route": "/api/posts/reject", "/api/posts/pending/route": "/api/posts/pending", "/_not-found/page": "/_not-found", "/corde/page": "/corde", "/coming-soon/page": "/coming-soon", "/login/page": "/login", "/social/page": "/social", "/page": "/", "/api/auth/[...nextauth]/route": "/api/auth/[...nextauth]" };
var FunctionsConfigManifest = { "version": 1, "functions": { "/api/auth/[...nextauth]": {} } };
var PagesManifest = { "/_app": "pages/_app.js", "/_error": "pages/_error.js", "/_document": "pages/_document.js", "/404": "pages/404.html" };
process.env.NEXT_BUILD_ID = BuildId;
process.env.NEXT_PREVIEW_MODE_ID = PrerenderManifest?.preview?.previewModeId;

// node_modules/@opennextjs/aws/dist/http/openNextResponse.js
init_logger();
init_util();
import { Transform } from "node:stream";

// node_modules/@opennextjs/aws/dist/core/routing/util.js
init_util();
init_logger();
import { ReadableStream as ReadableStream2 } from "node:stream/web";

// node_modules/@opennextjs/aws/dist/utils/binary.js
var commonBinaryMimeTypes = /* @__PURE__ */ new Set([
  "application/octet-stream",
  // Docs
  "application/epub+zip",
  "application/msword",
  "application/pdf",
  "application/rtf",
  "application/vnd.amazon.ebook",
  "application/vnd.ms-excel",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // Fonts
  "font/otf",
  "font/woff",
  "font/woff2",
  // Images
  "image/bmp",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/vnd.microsoft.icon",
  "image/webp",
  // Audio
  "audio/3gpp",
  "audio/aac",
  "audio/basic",
  "audio/flac",
  "audio/mpeg",
  "audio/ogg",
  "audio/wavaudio/webm",
  "audio/x-aiff",
  "audio/x-midi",
  "audio/x-wav",
  // Video
  "video/3gpp",
  "video/mp2t",
  "video/mpeg",
  "video/ogg",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
  // Archives
  "application/java-archive",
  "application/vnd.apple.installer+xml",
  "application/x-7z-compressed",
  "application/x-apple-diskimage",
  "application/x-bzip",
  "application/x-bzip2",
  "application/x-gzip",
  "application/x-java-archive",
  "application/x-rar-compressed",
  "application/x-tar",
  "application/x-zip",
  "application/zip",
  // Serialized data
  "application/x-protobuf"
]);
function isBinaryContentType(contentType) {
  if (!contentType)
    return false;
  const value = contentType.split(";")[0];
  return commonBinaryMimeTypes.has(value);
}

// node_modules/@opennextjs/aws/dist/core/routing/i18n/index.js
init_stream();
init_logger();

// node_modules/@opennextjs/aws/dist/core/routing/i18n/accept-header.js
function parse(raw, preferences, options) {
  const lowers = /* @__PURE__ */ new Map();
  const header = raw.replace(/[ \t]/g, "");
  if (preferences) {
    let pos = 0;
    for (const preference of preferences) {
      const lower = preference.toLowerCase();
      lowers.set(lower, { orig: preference, pos: pos++ });
      if (options.prefixMatch) {
        const parts2 = lower.split("-");
        while (parts2.pop(), parts2.length > 0) {
          const joined = parts2.join("-");
          if (!lowers.has(joined)) {
            lowers.set(joined, { orig: preference, pos: pos++ });
          }
        }
      }
    }
  }
  const parts = header.split(",");
  const selections = [];
  const map = /* @__PURE__ */ new Set();
  for (let i = 0; i < parts.length; ++i) {
    const part = parts[i];
    if (!part) {
      continue;
    }
    const params = part.split(";");
    if (params.length > 2) {
      throw new Error(`Invalid ${options.type} header`);
    }
    const token = params[0].toLowerCase();
    if (!token) {
      throw new Error(`Invalid ${options.type} header`);
    }
    const selection = { token, pos: i, q: 1 };
    if (preferences && lowers.has(token)) {
      selection.pref = lowers.get(token).pos;
    }
    map.add(selection.token);
    if (params.length === 2) {
      const q = params[1];
      const [key, value] = q.split("=");
      if (!value || key !== "q" && key !== "Q") {
        throw new Error(`Invalid ${options.type} header`);
      }
      const score = Number.parseFloat(value);
      if (score === 0) {
        continue;
      }
      if (Number.isFinite(score) && score <= 1 && score >= 1e-3) {
        selection.q = score;
      }
    }
    selections.push(selection);
  }
  selections.sort((a, b) => {
    if (b.q !== a.q) {
      return b.q - a.q;
    }
    if (b.pref !== a.pref) {
      if (a.pref === void 0) {
        return 1;
      }
      if (b.pref === void 0) {
        return -1;
      }
      return a.pref - b.pref;
    }
    return a.pos - b.pos;
  });
  const values = selections.map((selection) => selection.token);
  if (!preferences || !preferences.length) {
    return values;
  }
  const preferred = [];
  for (const selection of values) {
    if (selection === "*") {
      for (const [preference, value] of lowers) {
        if (!map.has(preference)) {
          preferred.push(value.orig);
        }
      }
    } else {
      const lower = selection.toLowerCase();
      if (lowers.has(lower)) {
        preferred.push(lowers.get(lower).orig);
      }
    }
  }
  return preferred;
}
function acceptLanguage(header = "", preferences) {
  return parse(header, preferences, {
    type: "accept-language",
    prefixMatch: true
  })[0] || void 0;
}

// node_modules/@opennextjs/aws/dist/core/routing/i18n/index.js
function isLocalizedPath(path3) {
  return NextConfig.i18n?.locales.includes(path3.split("/")[1].toLowerCase()) ?? false;
}
function getLocaleFromCookie(cookies) {
  const i18n = NextConfig.i18n;
  const nextLocale = cookies.NEXT_LOCALE?.toLowerCase();
  return nextLocale ? i18n?.locales.find((locale) => nextLocale === locale.toLowerCase()) : void 0;
}
function detectDomainLocale({ hostname, detectedLocale }) {
  const i18n = NextConfig.i18n;
  const domains = i18n?.domains;
  if (!domains) {
    return;
  }
  const lowercasedLocale = detectedLocale?.toLowerCase();
  for (const domain of domains) {
    const domainHostname = domain.domain.split(":", 1)[0].toLowerCase();
    if (hostname === domainHostname || lowercasedLocale === domain.defaultLocale.toLowerCase() || domain.locales?.some((locale) => lowercasedLocale === locale.toLowerCase())) {
      return domain;
    }
  }
}
function detectLocale(internalEvent, i18n) {
  const domainLocale = detectDomainLocale({
    hostname: internalEvent.headers.host
  });
  if (i18n.localeDetection === false) {
    return domainLocale?.defaultLocale ?? i18n.defaultLocale;
  }
  const cookiesLocale = getLocaleFromCookie(internalEvent.cookies);
  const preferredLocale = acceptLanguage(internalEvent.headers["accept-language"], i18n?.locales);
  debug({
    cookiesLocale,
    preferredLocale,
    defaultLocale: i18n.defaultLocale,
    domainLocale
  });
  return domainLocale?.defaultLocale ?? cookiesLocale ?? preferredLocale ?? i18n.defaultLocale;
}
function localizePath(internalEvent) {
  const i18n = NextConfig.i18n;
  if (!i18n) {
    return internalEvent.rawPath;
  }
  if (isLocalizedPath(internalEvent.rawPath)) {
    return internalEvent.rawPath;
  }
  const detectedLocale = detectLocale(internalEvent, i18n);
  return `/${detectedLocale}${internalEvent.rawPath}`;
}
function handleLocaleRedirect(internalEvent) {
  const i18n = NextConfig.i18n;
  if (!i18n || i18n.localeDetection === false || internalEvent.rawPath !== "/") {
    return false;
  }
  const preferredLocale = acceptLanguage(internalEvent.headers["accept-language"], i18n?.locales);
  const detectedLocale = detectLocale(internalEvent, i18n);
  const domainLocale = detectDomainLocale({
    hostname: internalEvent.headers.host
  });
  const preferredDomain = detectDomainLocale({
    detectedLocale: preferredLocale
  });
  if (domainLocale && preferredDomain) {
    const isPDomain = preferredDomain.domain === domainLocale.domain;
    const isPLocale = preferredDomain.defaultLocale === preferredLocale;
    if (!isPDomain || !isPLocale) {
      const scheme = `http${preferredDomain.http ? "" : "s"}`;
      const rlocale = isPLocale ? "" : preferredLocale;
      return {
        type: "core",
        statusCode: 307,
        headers: {
          Location: `${scheme}://${preferredDomain.domain}/${rlocale}`
        },
        body: emptyReadableStream(),
        isBase64Encoded: false
      };
    }
  }
  const defaultLocale = domainLocale?.defaultLocale ?? i18n.defaultLocale;
  if (detectedLocale.toLowerCase() !== defaultLocale.toLowerCase()) {
    return {
      type: "core",
      statusCode: 307,
      headers: {
        Location: constructNextUrl(internalEvent.url, `/${detectedLocale}`)
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
  return false;
}

// node_modules/@opennextjs/aws/dist/core/routing/queue.js
function generateShardId(rawPath, maxConcurrency, prefix) {
  let a = cyrb128(rawPath);
  let t = a += 1831565813;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  const randomFloat = ((t ^ t >>> 14) >>> 0) / 4294967296;
  const randomInt = Math.floor(randomFloat * maxConcurrency);
  return `${prefix}-${randomInt}`;
}
function generateMessageGroupId(rawPath) {
  const maxConcurrency = Number.parseInt(process.env.MAX_REVALIDATE_CONCURRENCY ?? "10");
  return generateShardId(rawPath, maxConcurrency, "revalidate");
}
function cyrb128(str) {
  let h1 = 1779033703;
  let h2 = 3144134277;
  let h3 = 1013904242;
  let h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ h1 >>> 18, 597399067);
  h2 = Math.imul(h4 ^ h2 >>> 22, 2869860233);
  h3 = Math.imul(h1 ^ h3 >>> 17, 951274213);
  h4 = Math.imul(h2 ^ h4 >>> 19, 2716044179);
  h1 ^= h2 ^ h3 ^ h4, h2 ^= h1, h3 ^= h1, h4 ^= h1;
  return h1 >>> 0;
}

// node_modules/@opennextjs/aws/dist/core/routing/util.js
function isExternal(url, host) {
  if (!url)
    return false;
  const pattern = /^https?:\/\//;
  if (!pattern.test(url))
    return false;
  if (host) {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.host !== host;
    } catch {
      return !url.includes(host);
    }
  }
  return true;
}
function convertFromQueryString(query) {
  if (query === "")
    return {};
  const queryParts = query.split("&");
  return getQueryFromIterator(queryParts.map((p) => {
    const [key, value] = p.split("=");
    return [key, value];
  }));
}
function getUrlParts(url, isExternal2) {
  if (!isExternal2) {
    const regex2 = /\/([^?]*)\??(.*)/;
    const match3 = url.match(regex2);
    return {
      hostname: "",
      pathname: match3?.[1] ? `/${match3[1]}` : url,
      protocol: "",
      queryString: match3?.[2] ?? ""
    };
  }
  const regex = /^(https?:)\/\/?([^\/\s]+)(\/[^?]*)?(\?.*)?/;
  const match2 = url.match(regex);
  if (!match2) {
    throw new Error(`Invalid external URL: ${url}`);
  }
  return {
    protocol: match2[1] ?? "https:",
    hostname: match2[2],
    pathname: match2[3] ?? "",
    queryString: match2[4]?.slice(1) ?? ""
  };
}
function constructNextUrl(baseUrl, path3) {
  const nextBasePath = NextConfig.basePath ?? "";
  const url = new URL(`${nextBasePath}${path3}`, baseUrl);
  return url.href;
}
function convertToQueryString(query) {
  const queryStrings = [];
  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => queryStrings.push(`${key}=${entry}`));
    } else {
      queryStrings.push(`${key}=${value}`);
    }
  });
  return queryStrings.length > 0 ? `?${queryStrings.join("&")}` : "";
}
function getMiddlewareMatch(middlewareManifest2, functionsManifest) {
  if (functionsManifest?.functions?.["/_middleware"]) {
    return functionsManifest.functions["/_middleware"].matchers?.map(({ regexp }) => new RegExp(regexp)) ?? [/.*/];
  }
  const rootMiddleware = middlewareManifest2.middleware["/"];
  if (!rootMiddleware?.matchers)
    return [];
  return rootMiddleware.matchers.map(({ regexp }) => new RegExp(regexp));
}
function escapeRegex(str, { isPath } = {}) {
  const result = str.replaceAll("(.)", "_\xB51_").replaceAll("(..)", "_\xB52_").replaceAll("(...)", "_\xB53_");
  return isPath ? result : result.replaceAll("+", "_\xB54_");
}
function unescapeRegex(str) {
  return str.replaceAll("_\xB51_", "(.)").replaceAll("_\xB52_", "(..)").replaceAll("_\xB53_", "(...)").replaceAll("_\xB54_", "+");
}
function convertBodyToReadableStream(method, body) {
  if (method === "GET" || method === "HEAD")
    return void 0;
  if (!body)
    return void 0;
  return new ReadableStream2({
    start(controller) {
      controller.enqueue(body);
      controller.close();
    }
  });
}
var CommonHeaders;
(function(CommonHeaders2) {
  CommonHeaders2["CACHE_CONTROL"] = "cache-control";
  CommonHeaders2["NEXT_CACHE"] = "x-nextjs-cache";
})(CommonHeaders || (CommonHeaders = {}));
function normalizeLocationHeader(location, baseUrl, encodeQuery = false) {
  if (!URL.canParse(location)) {
    return location;
  }
  const locationURL = new URL(location);
  const origin = new URL(baseUrl).origin;
  let search = locationURL.search;
  if (encodeQuery && search) {
    search = `?${stringifyQs(parseQs(search.slice(1)))}`;
  }
  const href = `${locationURL.origin}${locationURL.pathname}${search}${locationURL.hash}`;
  if (locationURL.origin === origin) {
    return href.slice(origin.length);
  }
  return href;
}

// node_modules/@opennextjs/aws/dist/core/routingHandler.js
init_logger();

// node_modules/@opennextjs/aws/dist/core/routing/cacheInterceptor.js
import { createHash } from "node:crypto";
init_stream();

// node_modules/@opennextjs/aws/dist/utils/cache.js
init_logger();
async function hasBeenRevalidated(key, tags, cacheEntry) {
  if (globalThis.openNextConfig.dangerous?.disableTagCache) {
    return false;
  }
  const value = cacheEntry.value;
  if (!value) {
    return true;
  }
  if ("type" in cacheEntry && cacheEntry.type === "page") {
    return false;
  }
  const lastModified = cacheEntry.lastModified ?? Date.now();
  if (globalThis.tagCache.mode === "nextMode") {
    return tags.length === 0 ? false : await globalThis.tagCache.hasBeenRevalidated(tags, lastModified);
  }
  const _lastModified = await globalThis.tagCache.getLastModified(key, lastModified);
  return _lastModified === -1;
}
function getTagsFromValue(value) {
  if (!value) {
    return [];
  }
  try {
    const cacheTags = value.meta?.headers?.["x-next-cache-tags"]?.split(",") ?? [];
    delete value.meta?.headers?.["x-next-cache-tags"];
    return cacheTags;
  } catch (e) {
    return [];
  }
}

// node_modules/@opennextjs/aws/dist/core/routing/cacheInterceptor.js
init_logger();
var CACHE_ONE_YEAR = 60 * 60 * 24 * 365;
var CACHE_ONE_MONTH = 60 * 60 * 24 * 30;
var VARY_HEADER = "RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch, Next-Url";
var NEXT_SEGMENT_PREFETCH_HEADER = "next-router-segment-prefetch";
var NEXT_PRERENDER_HEADER = "x-nextjs-prerender";
var NEXT_POSTPONED_HEADER = "x-nextjs-postponed";
async function computeCacheControl(path3, body, host, revalidate, lastModified) {
  let finalRevalidate = CACHE_ONE_YEAR;
  const existingRoute = Object.entries(PrerenderManifest?.routes ?? {}).find((p) => p[0] === path3)?.[1];
  if (revalidate === void 0 && existingRoute) {
    finalRevalidate = existingRoute.initialRevalidateSeconds === false ? CACHE_ONE_YEAR : existingRoute.initialRevalidateSeconds;
  } else if (revalidate !== void 0) {
    finalRevalidate = revalidate === false ? CACHE_ONE_YEAR : revalidate;
  }
  const age = Math.round((Date.now() - (lastModified ?? 0)) / 1e3);
  const hash = (str) => createHash("md5").update(str).digest("hex");
  const etag = hash(body);
  if (revalidate === 0) {
    return {
      "cache-control": "private, no-cache, no-store, max-age=0, must-revalidate",
      "x-opennext-cache": "ERROR",
      etag
    };
  }
  if (finalRevalidate !== CACHE_ONE_YEAR) {
    const sMaxAge = Math.max(finalRevalidate - age, 1);
    debug("sMaxAge", {
      finalRevalidate,
      age,
      lastModified,
      revalidate
    });
    const isStale = sMaxAge === 1;
    if (isStale) {
      let url = NextConfig.trailingSlash ? `${path3}/` : path3;
      if (NextConfig.basePath) {
        url = `${NextConfig.basePath}${url}`;
      }
      await globalThis.queue.send({
        MessageBody: {
          host,
          url,
          eTag: etag,
          lastModified: lastModified ?? Date.now()
        },
        MessageDeduplicationId: hash(`${path3}-${lastModified}-${etag}`),
        MessageGroupId: generateMessageGroupId(path3)
      });
    }
    return {
      "cache-control": `s-maxage=${sMaxAge}, stale-while-revalidate=${CACHE_ONE_MONTH}`,
      "x-opennext-cache": isStale ? "STALE" : "HIT",
      etag
    };
  }
  return {
    "cache-control": `s-maxage=${CACHE_ONE_YEAR}, stale-while-revalidate=${CACHE_ONE_MONTH}`,
    "x-opennext-cache": "HIT",
    etag
  };
}
function getBodyForAppRouter(event, cachedValue) {
  if (cachedValue.type !== "app") {
    throw new Error("getBodyForAppRouter called with non-app cache value");
  }
  try {
    const segmentHeader = `${event.headers[NEXT_SEGMENT_PREFETCH_HEADER]}`;
    const isSegmentResponse = Boolean(segmentHeader) && segmentHeader in (cachedValue.segmentData || {});
    const body = isSegmentResponse ? cachedValue.segmentData[segmentHeader] : cachedValue.rsc;
    return {
      body,
      additionalHeaders: isSegmentResponse ? { [NEXT_PRERENDER_HEADER]: "1", [NEXT_POSTPONED_HEADER]: "2" } : {}
    };
  } catch (e) {
    error("Error while getting body for app router from cache:", e);
    return { body: cachedValue.rsc, additionalHeaders: {} };
  }
}
async function generateResult(event, localizedPath, cachedValue, lastModified) {
  debug("Returning result from experimental cache");
  let body = "";
  let type = "application/octet-stream";
  let isDataRequest = false;
  let additionalHeaders = {};
  if (cachedValue.type === "app") {
    isDataRequest = Boolean(event.headers.rsc);
    if (isDataRequest) {
      const { body: appRouterBody, additionalHeaders: appHeaders } = getBodyForAppRouter(event, cachedValue);
      body = appRouterBody;
      additionalHeaders = appHeaders;
    } else {
      body = cachedValue.html;
    }
    type = isDataRequest ? "text/x-component" : "text/html; charset=utf-8";
  } else if (cachedValue.type === "page") {
    isDataRequest = Boolean(event.query.__nextDataReq);
    body = isDataRequest ? JSON.stringify(cachedValue.json) : cachedValue.html;
    type = isDataRequest ? "application/json" : "text/html; charset=utf-8";
  } else {
    throw new Error("generateResult called with unsupported cache value type, only 'app' and 'page' are supported");
  }
  const cacheControl = await computeCacheControl(localizedPath, body, event.headers.host, cachedValue.revalidate, lastModified);
  return {
    type: "core",
    // Sometimes other status codes can be cached, like 404. For these cases, we should return the correct status code
    // Also set the status code to the rewriteStatusCode if defined
    // This can happen in handleMiddleware in routingHandler.
    // `NextResponse.rewrite(url, { status: xxx})
    // The rewrite status code should take precedence over the cached one
    statusCode: event.rewriteStatusCode ?? cachedValue.meta?.status ?? 200,
    body: toReadableStream(body, false),
    isBase64Encoded: false,
    headers: {
      ...cacheControl,
      "content-type": type,
      ...cachedValue.meta?.headers,
      vary: VARY_HEADER,
      ...additionalHeaders
    }
  };
}
function escapePathDelimiters(segment, escapeEncoded) {
  return segment.replace(new RegExp(`([/#?]${escapeEncoded ? "|%(2f|23|3f|5c)" : ""})`, "gi"), (char) => encodeURIComponent(char));
}
function decodePathParams(pathname) {
  return pathname.split("/").map((segment) => {
    try {
      return escapePathDelimiters(decodeURIComponent(segment), true);
    } catch (e) {
      return segment;
    }
  }).join("/");
}
async function cacheInterceptor(event) {
  if (Boolean(event.headers["next-action"]) || Boolean(event.headers["x-prerender-revalidate"]))
    return event;
  const cookies = event.headers.cookie || "";
  const hasPreviewData = cookies.includes("__prerender_bypass") || cookies.includes("__next_preview_data");
  if (hasPreviewData) {
    debug("Preview mode detected, passing through to handler");
    return event;
  }
  let localizedPath = localizePath(event);
  if (NextConfig.basePath) {
    localizedPath = localizedPath.replace(NextConfig.basePath, "");
  }
  localizedPath = localizedPath.replace(/\/$/, "");
  localizedPath = decodePathParams(localizedPath);
  debug("Checking cache for", localizedPath, PrerenderManifest);
  const isISR = Object.keys(PrerenderManifest?.routes ?? {}).includes(localizedPath ?? "/") || Object.values(PrerenderManifest?.dynamicRoutes ?? {}).some((dr) => new RegExp(dr.routeRegex).test(localizedPath));
  debug("isISR", isISR);
  if (isISR) {
    try {
      const cachedData = await globalThis.incrementalCache.get(localizedPath ?? "/index");
      debug("cached data in interceptor", cachedData);
      if (!cachedData?.value) {
        return event;
      }
      if (cachedData.value?.type === "app" || cachedData.value?.type === "route") {
        const tags = getTagsFromValue(cachedData.value);
        const _hasBeenRevalidated = cachedData.shouldBypassTagCache ? false : await hasBeenRevalidated(localizedPath, tags, cachedData);
        if (_hasBeenRevalidated) {
          return event;
        }
      }
      const host = event.headers.host;
      switch (cachedData?.value?.type) {
        case "app":
        case "page":
          return generateResult(event, localizedPath, cachedData.value, cachedData.lastModified);
        case "redirect": {
          const cacheControl = await computeCacheControl(localizedPath, "", host, cachedData.value.revalidate, cachedData.lastModified);
          return {
            type: "core",
            statusCode: cachedData.value.meta?.status ?? 307,
            body: emptyReadableStream(),
            headers: {
              ...cachedData.value.meta?.headers ?? {},
              ...cacheControl
            },
            isBase64Encoded: false
          };
        }
        case "route": {
          const cacheControl = await computeCacheControl(localizedPath, cachedData.value.body, host, cachedData.value.revalidate, cachedData.lastModified);
          const isBinary = isBinaryContentType(String(cachedData.value.meta?.headers?.["content-type"]));
          return {
            type: "core",
            statusCode: event.rewriteStatusCode ?? cachedData.value.meta?.status ?? 200,
            body: toReadableStream(cachedData.value.body, isBinary),
            headers: {
              ...cacheControl,
              ...cachedData.value.meta?.headers,
              vary: VARY_HEADER
            },
            isBase64Encoded: isBinary
          };
        }
        default:
          return event;
      }
    } catch (e) {
      debug("Error while fetching cache", e);
      return event;
    }
  }
  return event;
}

// node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
function parse2(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path3 = "";
  var tryConsume = function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  };
  var mustConsume = function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  };
  var consumeText = function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  };
  var isSafe = function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  };
  var safePattern = function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  };
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path3 += prefix;
        prefix = "";
      }
      if (path3) {
        result.push(path3);
        path3 = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path3 += value;
      continue;
    }
    if (path3) {
      result.push(path3);
      path3 = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
function compile(str, options) {
  return tokensToFunction(parse2(str, options), options);
}
function tokensToFunction(tokens, options) {
  if (options === void 0) {
    options = {};
  }
  var reFlags = flags(options);
  var _a = options.encode, encode = _a === void 0 ? function(x) {
    return x;
  } : _a, _b = options.validate, validate = _b === void 0 ? true : _b;
  var matches = tokens.map(function(token) {
    if (typeof token === "object") {
      return new RegExp("^(?:".concat(token.pattern, ")$"), reFlags);
    }
  });
  return function(data) {
    var path3 = "";
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];
      if (typeof token === "string") {
        path3 += token;
        continue;
      }
      var value = data ? data[token.name] : void 0;
      var optional = token.modifier === "?" || token.modifier === "*";
      var repeat = token.modifier === "*" || token.modifier === "+";
      if (Array.isArray(value)) {
        if (!repeat) {
          throw new TypeError('Expected "'.concat(token.name, '" to not repeat, but got an array'));
        }
        if (value.length === 0) {
          if (optional)
            continue;
          throw new TypeError('Expected "'.concat(token.name, '" to not be empty'));
        }
        for (var j = 0; j < value.length; j++) {
          var segment = encode(value[j], token);
          if (validate && !matches[i].test(segment)) {
            throw new TypeError('Expected all "'.concat(token.name, '" to match "').concat(token.pattern, '", but got "').concat(segment, '"'));
          }
          path3 += token.prefix + segment + token.suffix;
        }
        continue;
      }
      if (typeof value === "string" || typeof value === "number") {
        var segment = encode(String(value), token);
        if (validate && !matches[i].test(segment)) {
          throw new TypeError('Expected "'.concat(token.name, '" to match "').concat(token.pattern, '", but got "').concat(segment, '"'));
        }
        path3 += token.prefix + segment + token.suffix;
        continue;
      }
      if (optional)
        continue;
      var typeOfMessage = repeat ? "an array" : "a string";
      throw new TypeError('Expected "'.concat(token.name, '" to be ').concat(typeOfMessage));
    }
    return path3;
  };
}
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path3 = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    };
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path: path3, index, params };
  };
}
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
function regexpToRegexp(path3, keys) {
  if (!keys)
    return path3;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path3.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path3.source);
  }
  return path3;
}
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path3) {
    return pathToRegexp(path3, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
function stringToRegexp(path3, keys, options) {
  return tokensToRegexp(parse2(path3, options), keys, options);
}
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
function pathToRegexp(path3, keys, options) {
  if (path3 instanceof RegExp)
    return regexpToRegexp(path3, keys);
  if (Array.isArray(path3))
    return arrayToRegexp(path3, keys, options);
  return stringToRegexp(path3, keys, options);
}

// node_modules/@opennextjs/aws/dist/utils/normalize-path.js
import path2 from "node:path";
function normalizeRepeatedSlashes(url) {
  const urlNoQuery = url.host + url.pathname;
  return `${url.protocol}//${urlNoQuery.replace(/\\/g, "/").replace(/\/\/+/g, "/")}${url.search}`;
}

// node_modules/@opennextjs/aws/dist/core/routing/matcher.js
init_stream();
init_logger();

// node_modules/@opennextjs/aws/dist/core/routing/routeMatcher.js
var optionalLocalePrefixRegex = `^/(?:${RoutesManifest.locales.map((locale) => `${locale}/?`).join("|")})?`;
var optionalBasepathPrefixRegex = RoutesManifest.basePath ? `^${RoutesManifest.basePath}/?` : "^/";
var optionalPrefix = optionalLocalePrefixRegex.replace("^/", optionalBasepathPrefixRegex);
function routeMatcher(routeDefinitions) {
  const regexp = routeDefinitions.map((route) => ({
    page: route.page,
    regexp: new RegExp(route.regex.replace("^/", optionalPrefix))
  }));
  const appPathsSet = /* @__PURE__ */ new Set();
  const routePathsSet = /* @__PURE__ */ new Set();
  for (const [k, v] of Object.entries(AppPathRoutesManifest)) {
    if (k.endsWith("page")) {
      appPathsSet.add(v);
    } else if (k.endsWith("route")) {
      routePathsSet.add(v);
    }
  }
  return function matchRoute(path3) {
    const foundRoutes = regexp.filter((route) => route.regexp.test(path3));
    return foundRoutes.map((foundRoute) => {
      let routeType = "page";
      if (appPathsSet.has(foundRoute.page)) {
        routeType = "app";
      } else if (routePathsSet.has(foundRoute.page)) {
        routeType = "route";
      }
      return {
        route: foundRoute.page,
        type: routeType
      };
    });
  };
}
var staticRouteMatcher = routeMatcher([
  ...RoutesManifest.routes.static,
  ...getStaticAPIRoutes()
]);
var dynamicRouteMatcher = routeMatcher(RoutesManifest.routes.dynamic);
function getStaticAPIRoutes() {
  const createRouteDefinition = (route) => ({
    page: route,
    regex: `^${route}(?:/)?$`
  });
  const dynamicRoutePages = new Set(RoutesManifest.routes.dynamic.map(({ page }) => page));
  const pagesStaticAPIRoutes = Object.keys(PagesManifest).filter((route) => route.startsWith("/api/") && !dynamicRoutePages.has(route)).map(createRouteDefinition);
  const appPathsStaticAPIRoutes = Object.values(AppPathRoutesManifest).filter((route) => (route.startsWith("/api/") || route === "/api") && !dynamicRoutePages.has(route)).map(createRouteDefinition);
  return [...pagesStaticAPIRoutes, ...appPathsStaticAPIRoutes];
}

// node_modules/@opennextjs/aws/dist/core/routing/matcher.js
var routeHasMatcher = (headers, cookies, query) => (redirect) => {
  switch (redirect.type) {
    case "header":
      return !!headers?.[redirect.key.toLowerCase()] && new RegExp(redirect.value ?? "").test(headers[redirect.key.toLowerCase()] ?? "");
    case "cookie":
      return !!cookies?.[redirect.key] && new RegExp(redirect.value ?? "").test(cookies[redirect.key] ?? "");
    case "query":
      return query[redirect.key] && Array.isArray(redirect.value) ? redirect.value.reduce((prev, current) => prev || new RegExp(current).test(query[redirect.key]), false) : new RegExp(redirect.value ?? "").test(query[redirect.key] ?? "");
    case "host":
      return headers?.host !== "" && new RegExp(redirect.value ?? "").test(headers.host);
    default:
      return false;
  }
};
function checkHas(matcher, has, inverted = false) {
  return has ? has.reduce((acc, cur) => {
    if (acc === false)
      return false;
    return inverted ? !matcher(cur) : matcher(cur);
  }, true) : true;
}
var getParamsFromSource = (source) => (value) => {
  debug("value", value);
  const _match = source(value);
  return _match ? _match.params : {};
};
var computeParamHas = (headers, cookies, query) => (has) => {
  if (!has.value)
    return {};
  const matcher = new RegExp(`^${has.value}$`);
  const fromSource = (value) => {
    const matches = value.match(matcher);
    return matches?.groups ?? {};
  };
  switch (has.type) {
    case "header":
      return fromSource(headers[has.key.toLowerCase()] ?? "");
    case "cookie":
      return fromSource(cookies[has.key] ?? "");
    case "query":
      return Array.isArray(query[has.key]) ? fromSource(query[has.key].join(",")) : fromSource(query[has.key] ?? "");
    case "host":
      return fromSource(headers.host ?? "");
  }
};
function convertMatch(match2, toDestination, destination) {
  if (!match2) {
    return destination;
  }
  const { params } = match2;
  const isUsingParams = Object.keys(params).length > 0;
  return isUsingParams ? toDestination(params) : destination;
}
function getNextConfigHeaders(event, configHeaders) {
  if (!configHeaders) {
    return {};
  }
  const matcher = routeHasMatcher(event.headers, event.cookies, event.query);
  const requestHeaders = {};
  const localizedRawPath = localizePath(event);
  for (const { headers, has, missing, regex, source, locale } of configHeaders) {
    const path3 = locale === false ? event.rawPath : localizedRawPath;
    if (new RegExp(regex).test(path3) && checkHas(matcher, has) && checkHas(matcher, missing, true)) {
      const fromSource = match(source);
      const _match = fromSource(path3);
      headers.forEach((h) => {
        try {
          const key = convertMatch(_match, compile(h.key), h.key);
          const value = convertMatch(_match, compile(h.value), h.value);
          requestHeaders[key] = value;
        } catch {
          debug(`Error matching header ${h.key} with value ${h.value}`);
          requestHeaders[h.key] = h.value;
        }
      });
    }
  }
  return requestHeaders;
}
function handleRewrites(event, rewrites) {
  const { rawPath, headers, query, cookies, url } = event;
  const localizedRawPath = localizePath(event);
  const matcher = routeHasMatcher(headers, cookies, query);
  const computeHas = computeParamHas(headers, cookies, query);
  const rewrite = rewrites.find((route) => {
    const path3 = route.locale === false ? rawPath : localizedRawPath;
    return new RegExp(route.regex).test(path3) && checkHas(matcher, route.has) && checkHas(matcher, route.missing, true);
  });
  let finalQuery = query;
  let rewrittenUrl = url;
  const isExternalRewrite = isExternal(rewrite?.destination);
  debug("isExternalRewrite", isExternalRewrite);
  if (rewrite) {
    const { pathname, protocol, hostname, queryString } = getUrlParts(rewrite.destination, isExternalRewrite);
    const pathToUse = rewrite.locale === false ? rawPath : localizedRawPath;
    debug("urlParts", { pathname, protocol, hostname, queryString });
    const toDestinationPath = compile(escapeRegex(pathname, { isPath: true }));
    const toDestinationHost = compile(escapeRegex(hostname));
    const toDestinationQuery = compile(escapeRegex(queryString));
    const params = {
      // params for the source
      ...getParamsFromSource(match(escapeRegex(rewrite.source, { isPath: true })))(pathToUse),
      // params for the has
      ...rewrite.has?.reduce((acc, cur) => {
        return Object.assign(acc, computeHas(cur));
      }, {}),
      // params for the missing
      ...rewrite.missing?.reduce((acc, cur) => {
        return Object.assign(acc, computeHas(cur));
      }, {})
    };
    const isUsingParams = Object.keys(params).length > 0;
    let rewrittenQuery = queryString;
    let rewrittenHost = hostname;
    let rewrittenPath = pathname;
    if (isUsingParams) {
      rewrittenPath = unescapeRegex(toDestinationPath(params));
      rewrittenHost = unescapeRegex(toDestinationHost(params));
      rewrittenQuery = unescapeRegex(toDestinationQuery(params));
    }
    if (NextConfig.i18n && !isExternalRewrite) {
      const strippedPathLocale = rewrittenPath.replace(new RegExp(`^/(${NextConfig.i18n.locales.join("|")})`), "");
      if (strippedPathLocale.startsWith("/api/")) {
        rewrittenPath = strippedPathLocale;
      }
    }
    rewrittenUrl = isExternalRewrite ? `${protocol}//${rewrittenHost}${rewrittenPath}` : new URL(rewrittenPath, event.url).href;
    finalQuery = {
      ...query,
      ...convertFromQueryString(rewrittenQuery)
    };
    rewrittenUrl += convertToQueryString(finalQuery);
    debug("rewrittenUrl", { rewrittenUrl, finalQuery, isUsingParams });
  }
  return {
    internalEvent: {
      ...event,
      query: finalQuery,
      rawPath: new URL(rewrittenUrl).pathname,
      url: rewrittenUrl
    },
    __rewrite: rewrite,
    isExternalRewrite
  };
}
function handleRepeatedSlashRedirect(event) {
  if (event.rawPath.match(/(\\|\/\/)/)) {
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: normalizeRepeatedSlashes(new URL(event.url))
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
  return false;
}
function handleTrailingSlashRedirect(event) {
  const url = new URL(event.rawPath, "http://localhost");
  if (
    // Someone is trying to redirect to a different origin, let's not do that
    url.host !== "localhost" || NextConfig.skipTrailingSlashRedirect || // We should not apply trailing slash redirect to API routes
    event.rawPath.startsWith("/api/")
  ) {
    return false;
  }
  const emptyBody = emptyReadableStream();
  if (NextConfig.trailingSlash && !event.headers["x-nextjs-data"] && !event.rawPath.endsWith("/") && !event.rawPath.match(/[\w-]+\.[\w]+$/g)) {
    const headersLocation = event.url.split("?");
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: `${headersLocation[0]}/${headersLocation[1] ? `?${headersLocation[1]}` : ""}`
      },
      body: emptyBody,
      isBase64Encoded: false
    };
  }
  if (!NextConfig.trailingSlash && event.rawPath.endsWith("/") && event.rawPath !== "/") {
    const headersLocation = event.url.split("?");
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: `${headersLocation[0].replace(/\/$/, "")}${headersLocation[1] ? `?${headersLocation[1]}` : ""}`
      },
      body: emptyBody,
      isBase64Encoded: false
    };
  }
  return false;
}
function handleRedirects(event, redirects) {
  const repeatedSlashRedirect = handleRepeatedSlashRedirect(event);
  if (repeatedSlashRedirect)
    return repeatedSlashRedirect;
  const trailingSlashRedirect = handleTrailingSlashRedirect(event);
  if (trailingSlashRedirect)
    return trailingSlashRedirect;
  const localeRedirect = handleLocaleRedirect(event);
  if (localeRedirect)
    return localeRedirect;
  const { internalEvent, __rewrite } = handleRewrites(event, redirects.filter((r) => !r.internal));
  if (__rewrite && !__rewrite.internal) {
    return {
      type: event.type,
      statusCode: __rewrite.statusCode ?? 308,
      headers: {
        Location: internalEvent.url
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
}
function fixDataPage(internalEvent, buildId) {
  const { rawPath, query } = internalEvent;
  const basePath = NextConfig.basePath ?? "";
  const dataPattern = `${basePath}/_next/data/${buildId}`;
  if (rawPath.startsWith("/_next/data") && !rawPath.startsWith(dataPattern)) {
    return {
      type: internalEvent.type,
      statusCode: 404,
      body: toReadableStream("{}"),
      headers: {
        "Content-Type": "application/json"
      },
      isBase64Encoded: false
    };
  }
  if (rawPath.startsWith(dataPattern) && rawPath.endsWith(".json")) {
    const newPath = `${basePath}${rawPath.slice(dataPattern.length, -".json".length).replace(/^\/index$/, "/")}`;
    query.__nextDataReq = "1";
    return {
      ...internalEvent,
      rawPath: newPath,
      query,
      url: new URL(`${newPath}${convertToQueryString(query)}`, internalEvent.url).href
    };
  }
  return internalEvent;
}
function handleFallbackFalse(internalEvent, prerenderManifest) {
  const { rawPath } = internalEvent;
  const { dynamicRoutes = {}, routes = {} } = prerenderManifest ?? {};
  const prerenderedFallbackRoutes = Object.entries(dynamicRoutes).filter(([, { fallback }]) => fallback === false);
  const routeFallback = prerenderedFallbackRoutes.some(([, { routeRegex }]) => {
    const routeRegexExp = new RegExp(routeRegex);
    return routeRegexExp.test(rawPath);
  });
  const locales = NextConfig.i18n?.locales;
  const routesAlreadyHaveLocale = locales?.includes(rawPath.split("/")[1]) || // If we don't use locales, we don't need to add the default locale
  locales === void 0;
  let localizedPath = routesAlreadyHaveLocale ? rawPath : `/${NextConfig.i18n?.defaultLocale}${rawPath}`;
  if (
    // Not if localizedPath is "/" tho, because that would not make it find `isPregenerated` below since it would be try to match an empty string.
    localizedPath !== "/" && NextConfig.trailingSlash && localizedPath.endsWith("/")
  ) {
    localizedPath = localizedPath.slice(0, -1);
  }
  const matchedStaticRoute = staticRouteMatcher(localizedPath);
  const prerenderedFallbackRoutesName = prerenderedFallbackRoutes.map(([name]) => name);
  const matchedDynamicRoute = dynamicRouteMatcher(localizedPath).filter(({ route }) => !prerenderedFallbackRoutesName.includes(route));
  const isPregenerated = Object.keys(routes).includes(localizedPath);
  if (routeFallback && !isPregenerated && matchedStaticRoute.length === 0 && matchedDynamicRoute.length === 0) {
    return {
      event: {
        ...internalEvent,
        rawPath: "/404",
        url: constructNextUrl(internalEvent.url, "/404"),
        headers: {
          ...internalEvent.headers,
          "x-invoke-status": "404"
        }
      },
      isISR: false
    };
  }
  return {
    event: internalEvent,
    isISR: routeFallback || isPregenerated
  };
}

// node_modules/@opennextjs/aws/dist/core/routing/middleware.js
init_stream();
init_utils();
var middlewareManifest = MiddlewareManifest;
var functionsConfigManifest = FunctionsConfigManifest;
var middleMatch = getMiddlewareMatch(middlewareManifest, functionsConfigManifest);
var REDIRECTS = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
function defaultMiddlewareLoader() {
  return Promise.resolve().then(() => (init_edgeFunctionHandler(), edgeFunctionHandler_exports));
}
async function handleMiddleware(internalEvent, initialSearch, middlewareLoader = defaultMiddlewareLoader) {
  const headers = internalEvent.headers;
  if (headers["x-isr"] && headers["x-prerender-revalidate"] === PrerenderManifest?.preview?.previewModeId)
    return internalEvent;
  const normalizedPath = localizePath(internalEvent);
  const hasMatch = middleMatch.some((r) => r.test(normalizedPath));
  if (!hasMatch)
    return internalEvent;
  const initialUrl = new URL(normalizedPath, internalEvent.url);
  initialUrl.search = initialSearch;
  const url = initialUrl.href;
  const middleware = await middlewareLoader();
  const result = await middleware.default({
    // `geo` is pre Next 15.
    geo: {
      // The city name is percent-encoded.
      // See https://github.com/vercel/vercel/blob/4cb6143/packages/functions/src/headers.ts#L94C19-L94C37
      city: decodeURIComponent(headers["x-open-next-city"]),
      country: headers["x-open-next-country"],
      region: headers["x-open-next-region"],
      latitude: headers["x-open-next-latitude"],
      longitude: headers["x-open-next-longitude"]
    },
    headers,
    method: internalEvent.method || "GET",
    nextConfig: {
      basePath: NextConfig.basePath,
      i18n: NextConfig.i18n,
      trailingSlash: NextConfig.trailingSlash
    },
    url,
    body: convertBodyToReadableStream(internalEvent.method, internalEvent.body)
  });
  const statusCode = result.status;
  const responseHeaders = result.headers;
  const reqHeaders = {};
  const resHeaders = {};
  const filteredHeaders = [
    "x-middleware-override-headers",
    "x-middleware-next",
    "x-middleware-rewrite",
    // We need to drop `content-encoding` because it will be decoded
    "content-encoding"
  ];
  const xMiddlewareKey = "x-middleware-request-";
  responseHeaders.forEach((value, key) => {
    if (key.startsWith(xMiddlewareKey)) {
      const k = key.substring(xMiddlewareKey.length);
      reqHeaders[k] = value;
    } else {
      if (filteredHeaders.includes(key.toLowerCase()))
        return;
      if (key.toLowerCase() === "set-cookie") {
        resHeaders[key] = resHeaders[key] ? [...resHeaders[key], value] : [value];
      } else if (REDIRECTS.has(statusCode) && key.toLowerCase() === "location") {
        resHeaders[key] = normalizeLocationHeader(value, internalEvent.url);
      } else {
        resHeaders[key] = value;
      }
    }
  });
  const rewriteUrl = responseHeaders.get("x-middleware-rewrite");
  let isExternalRewrite = false;
  let middlewareQuery = internalEvent.query;
  let newUrl = internalEvent.url;
  if (rewriteUrl) {
    newUrl = rewriteUrl;
    if (isExternal(newUrl, internalEvent.headers.host)) {
      isExternalRewrite = true;
    } else {
      const rewriteUrlObject = new URL(rewriteUrl);
      middlewareQuery = getQueryFromSearchParams(rewriteUrlObject.searchParams);
      if ("__nextDataReq" in internalEvent.query) {
        middlewareQuery.__nextDataReq = internalEvent.query.__nextDataReq;
      }
    }
  }
  if (!rewriteUrl && !responseHeaders.get("x-middleware-next")) {
    const body = result.body ?? emptyReadableStream();
    return {
      type: internalEvent.type,
      statusCode,
      headers: resHeaders,
      body,
      isBase64Encoded: false
    };
  }
  return {
    responseHeaders: resHeaders,
    url: newUrl,
    rawPath: new URL(newUrl).pathname,
    type: internalEvent.type,
    headers: { ...internalEvent.headers, ...reqHeaders },
    body: internalEvent.body,
    method: internalEvent.method,
    query: middlewareQuery,
    cookies: internalEvent.cookies,
    remoteAddress: internalEvent.remoteAddress,
    isExternalRewrite,
    rewriteStatusCode: rewriteUrl && !isExternalRewrite ? statusCode : void 0
  };
}

// node_modules/@opennextjs/aws/dist/core/routingHandler.js
var MIDDLEWARE_HEADER_PREFIX = "x-middleware-response-";
var MIDDLEWARE_HEADER_PREFIX_LEN = MIDDLEWARE_HEADER_PREFIX.length;
var INTERNAL_HEADER_PREFIX = "x-opennext-";
var INTERNAL_HEADER_INITIAL_URL = `${INTERNAL_HEADER_PREFIX}initial-url`;
var INTERNAL_HEADER_LOCALE = `${INTERNAL_HEADER_PREFIX}locale`;
var INTERNAL_HEADER_RESOLVED_ROUTES = `${INTERNAL_HEADER_PREFIX}resolved-routes`;
var INTERNAL_HEADER_REWRITE_STATUS_CODE = `${INTERNAL_HEADER_PREFIX}rewrite-status-code`;
var INTERNAL_EVENT_REQUEST_ID = `${INTERNAL_HEADER_PREFIX}request-id`;
var geoHeaderToNextHeader = {
  "x-open-next-city": "x-vercel-ip-city",
  "x-open-next-country": "x-vercel-ip-country",
  "x-open-next-region": "x-vercel-ip-country-region",
  "x-open-next-latitude": "x-vercel-ip-latitude",
  "x-open-next-longitude": "x-vercel-ip-longitude"
};
function applyMiddlewareHeaders(eventOrResult, middlewareHeaders) {
  const isResult = isInternalResult(eventOrResult);
  const headers = eventOrResult.headers;
  const keyPrefix = isResult ? "" : MIDDLEWARE_HEADER_PREFIX;
  Object.entries(middlewareHeaders).forEach(([key, value]) => {
    if (value) {
      headers[keyPrefix + key] = Array.isArray(value) ? value.join(",") : value;
    }
  });
}
async function routingHandler(event, { assetResolver }) {
  try {
    for (const [openNextGeoName, nextGeoName] of Object.entries(geoHeaderToNextHeader)) {
      const value = event.headers[openNextGeoName];
      if (value) {
        event.headers[nextGeoName] = value;
      }
    }
    for (const key of Object.keys(event.headers)) {
      if (key.startsWith(INTERNAL_HEADER_PREFIX) || key.startsWith(MIDDLEWARE_HEADER_PREFIX)) {
        delete event.headers[key];
      }
    }
    let headers = getNextConfigHeaders(event, ConfigHeaders);
    let eventOrResult = fixDataPage(event, BuildId);
    if (isInternalResult(eventOrResult)) {
      return eventOrResult;
    }
    const redirect = handleRedirects(eventOrResult, RoutesManifest.redirects);
    if (redirect) {
      redirect.headers.Location = normalizeLocationHeader(redirect.headers.Location, event.url, true);
      debug("redirect", redirect);
      return redirect;
    }
    const middlewareEventOrResult = await handleMiddleware(
      eventOrResult,
      // We need to pass the initial search without any decoding
      // TODO: we'd need to refactor InternalEvent to include the initial querystring directly
      // Should be done in another PR because it is a breaking change
      new URL(event.url).search
    );
    if (isInternalResult(middlewareEventOrResult)) {
      return middlewareEventOrResult;
    }
    const middlewareHeadersPrioritized = globalThis.openNextConfig.dangerous?.middlewareHeadersOverrideNextConfigHeaders ?? false;
    if (middlewareHeadersPrioritized) {
      headers = {
        ...headers,
        ...middlewareEventOrResult.responseHeaders
      };
    } else {
      headers = {
        ...middlewareEventOrResult.responseHeaders,
        ...headers
      };
    }
    let isExternalRewrite = middlewareEventOrResult.isExternalRewrite ?? false;
    eventOrResult = middlewareEventOrResult;
    if (!isExternalRewrite) {
      const beforeRewrite = handleRewrites(eventOrResult, RoutesManifest.rewrites.beforeFiles);
      eventOrResult = beforeRewrite.internalEvent;
      isExternalRewrite = beforeRewrite.isExternalRewrite;
      if (!isExternalRewrite) {
        const assetResult = await assetResolver?.maybeGetAssetResult?.(eventOrResult);
        if (assetResult) {
          applyMiddlewareHeaders(assetResult, headers);
          return assetResult;
        }
      }
    }
    const foundStaticRoute = staticRouteMatcher(eventOrResult.rawPath);
    const isStaticRoute = !isExternalRewrite && foundStaticRoute.length > 0;
    if (!(isStaticRoute || isExternalRewrite)) {
      const afterRewrite = handleRewrites(eventOrResult, RoutesManifest.rewrites.afterFiles);
      eventOrResult = afterRewrite.internalEvent;
      isExternalRewrite = afterRewrite.isExternalRewrite;
    }
    let isISR = false;
    if (!isExternalRewrite) {
      const fallbackResult = handleFallbackFalse(eventOrResult, PrerenderManifest);
      eventOrResult = fallbackResult.event;
      isISR = fallbackResult.isISR;
    }
    const foundDynamicRoute = dynamicRouteMatcher(eventOrResult.rawPath);
    const isDynamicRoute = !isExternalRewrite && foundDynamicRoute.length > 0;
    if (!(isDynamicRoute || isStaticRoute || isExternalRewrite)) {
      const fallbackRewrites = handleRewrites(eventOrResult, RoutesManifest.rewrites.fallback);
      eventOrResult = fallbackRewrites.internalEvent;
      isExternalRewrite = fallbackRewrites.isExternalRewrite;
    }
    const isNextImageRoute = eventOrResult.rawPath.startsWith("/_next/image");
    const isRouteFoundBeforeAllRewrites = isStaticRoute || isDynamicRoute || isExternalRewrite;
    if (!(isRouteFoundBeforeAllRewrites || isNextImageRoute || // We need to check again once all rewrites have been applied
    staticRouteMatcher(eventOrResult.rawPath).length > 0 || dynamicRouteMatcher(eventOrResult.rawPath).length > 0)) {
      eventOrResult = {
        ...eventOrResult,
        rawPath: "/404",
        url: constructNextUrl(eventOrResult.url, "/404"),
        headers: {
          ...eventOrResult.headers,
          "x-middleware-response-cache-control": "private, no-cache, no-store, max-age=0, must-revalidate"
        }
      };
    }
    if (globalThis.openNextConfig.dangerous?.enableCacheInterception && !isInternalResult(eventOrResult)) {
      debug("Cache interception enabled");
      eventOrResult = await cacheInterceptor(eventOrResult);
      if (isInternalResult(eventOrResult)) {
        applyMiddlewareHeaders(eventOrResult, headers);
        return eventOrResult;
      }
    }
    applyMiddlewareHeaders(eventOrResult, headers);
    const resolvedRoutes = [
      ...foundStaticRoute,
      ...foundDynamicRoute
    ];
    debug("resolvedRoutes", resolvedRoutes);
    return {
      internalEvent: eventOrResult,
      isExternalRewrite,
      origin: false,
      isISR,
      resolvedRoutes,
      initialURL: event.url,
      locale: NextConfig.i18n ? detectLocale(eventOrResult, NextConfig.i18n) : void 0,
      rewriteStatusCode: middlewareEventOrResult.rewriteStatusCode
    };
  } catch (e) {
    error("Error in routingHandler", e);
    return {
      internalEvent: {
        type: "core",
        method: "GET",
        rawPath: "/500",
        url: constructNextUrl(event.url, "/500"),
        headers: {
          ...event.headers
        },
        query: event.query,
        cookies: event.cookies,
        remoteAddress: event.remoteAddress
      },
      isExternalRewrite: false,
      origin: false,
      isISR: false,
      resolvedRoutes: [],
      initialURL: event.url,
      locale: NextConfig.i18n ? detectLocale(event, NextConfig.i18n) : void 0
    };
  }
}
function isInternalResult(eventOrResult) {
  return eventOrResult != null && "statusCode" in eventOrResult;
}

// node_modules/@opennextjs/aws/dist/adapters/middleware.js
globalThis.internalFetch = fetch;
globalThis.__openNextAls = new AsyncLocalStorage();
var defaultHandler = async (internalEvent, options) => {
  const middlewareConfig = globalThis.openNextConfig.middleware;
  const originResolver = await resolveOriginResolver(middlewareConfig?.originResolver);
  const externalRequestProxy = await resolveProxyRequest(middlewareConfig?.override?.proxyExternalRequest);
  const assetResolver = await resolveAssetResolver(middlewareConfig?.assetResolver);
  const requestId = Math.random().toString(36);
  return runWithOpenNextRequestContext({
    isISRRevalidation: internalEvent.headers["x-isr"] === "1",
    waitUntil: options?.waitUntil,
    requestId
  }, async () => {
    const result = await routingHandler(internalEvent, { assetResolver });
    if ("internalEvent" in result) {
      debug("Middleware intercepted event", internalEvent);
      if (!result.isExternalRewrite) {
        const origin = await originResolver.resolve(result.internalEvent.rawPath);
        return {
          type: "middleware",
          internalEvent: {
            ...result.internalEvent,
            headers: {
              ...result.internalEvent.headers,
              [INTERNAL_HEADER_INITIAL_URL]: internalEvent.url,
              [INTERNAL_HEADER_RESOLVED_ROUTES]: JSON.stringify(result.resolvedRoutes),
              [INTERNAL_EVENT_REQUEST_ID]: requestId,
              [INTERNAL_HEADER_REWRITE_STATUS_CODE]: String(result.rewriteStatusCode)
            }
          },
          isExternalRewrite: result.isExternalRewrite,
          origin,
          isISR: result.isISR,
          initialURL: result.initialURL,
          resolvedRoutes: result.resolvedRoutes
        };
      }
      try {
        return externalRequestProxy.proxy(result.internalEvent);
      } catch (e) {
        error("External request failed.", e);
        return {
          type: "middleware",
          internalEvent: {
            ...result.internalEvent,
            headers: {
              ...result.internalEvent.headers,
              [INTERNAL_EVENT_REQUEST_ID]: requestId
            },
            rawPath: "/500",
            url: constructNextUrl(result.internalEvent.url, "/500"),
            method: "GET"
          },
          // On error we need to rewrite to the 500 page which is an internal rewrite
          isExternalRewrite: false,
          origin: false,
          isISR: result.isISR,
          initialURL: result.internalEvent.url,
          resolvedRoutes: [{ route: "/500", type: "page" }]
        };
      }
    }
    if (process.env.OPEN_NEXT_REQUEST_ID_HEADER || globalThis.openNextDebug) {
      result.headers[INTERNAL_EVENT_REQUEST_ID] = requestId;
    }
    debug("Middleware response", result);
    return result;
  });
};
var handler2 = await createGenericHandler({
  handler: defaultHandler,
  type: "middleware"
});
var middleware_default = {
  fetch: handler2
};
export {
  middleware_default as default,
  handler2 as handler
};
