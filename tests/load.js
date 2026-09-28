/* Carga el <script> principal de index.html en un contexto vm con stubs del navegador,
   para probar las funciones REALES (no una copia). Sin dependencias. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

function stub() {
  const f = function () {};
  const p = new Proxy(f, {
    get: (t, k) => {
      if (k === Symbol.toPrimitive) return () => "";
      if (k === "then") return undefined;
      if (k === "length") return 0;
      return p;
    },
    apply: () => p,
    construct: () => p,
    set: () => true,
    has: () => true
  });
  return p;
}

function load(file) {
  const html = fs.readFileSync(file || path.join(__dirname, "..", "index.html"), "utf8");
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  const main = scripts.find(s => s.indexOf("const MODULE_DEFS") >= 0);
  if (!main) throw new Error("No se encuentra el script principal (MODULE_DEFS)");
  const warnings = [];
  const store = {};
  const ctx = {
    console: { log() {}, error() {}, info() {}, warn: (...a) => warnings.push(a.join(" ")) },
    document: stub(), firebase: stub(), navigator: stub(), location: stub(),
    localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } },
    sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
    alert() {}, confirm: () => false, prompt: () => null,
    performance: { now: () => Number(process.hrtime.bigint()) / 1e6 }
  };
  ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
  vm.createContext(ctx);
  const code = main + "\n;globalThis.__T = { MODULES, LEVELS, L3: (typeof L3 !== 'undefined' ? L3 : null), L3_CONFIG: (typeof L3_CONFIG !== 'undefined' ? L3_CONFIG : null), VERBS: (typeof VERBS !== 'undefined' ? VERBS : null), gradeForms: (typeof gradeForms === 'function' ? gradeForms : null), gradeTranslation, modelAnswer, saveResultLocally, " +
    "localResults: (typeof localResults === 'function' ? localResults : null), normalize };";
  vm.runInContext(code, ctx, { filename: "index.html#script" });
  return Object.assign(ctx.__T, { warnings: warnings, store: store });
}
module.exports = { load };
