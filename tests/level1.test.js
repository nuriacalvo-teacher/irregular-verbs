/* Tests del LEVEL 1 (las tres formas). Ejecutar: node tests/level1.test.js
   BE tiene dos casillas para el pasado (was / were); en los demás verbos con dos formas
   vale una o las dos, con cualquier separador. */
"use strict";
const T = require("./load.js").load();
const all = T.MODULES.filter(m => m.level === 1).flatMap(m => m.questions);
const q = k => all.find(x => x.verb.key === k);
let fails = 0, n = 0;
function c(qq, v, exp) {
  n++; const r = T.gradeForms(v, qq);
  if (r.ok !== exp) { fails++; console.log("✗", qq.verb.key, JSON.stringify(v), "→", r.ok, "(esperado " + exp + ")"); }
}
const be = q("be");
c(be, ["be", "was", "were", "been"], true); c(be, ["BE", "Were", "WAS", "been"], true);
c(be, ["be", "was/were", "", "been"], true); c(be, ["be", "was-were", "", "been"], true); c(be, ["be", "was were", "", "been"], true);
c(be, ["be", "", "was, were", "been"], true); c(be, ["be", "was", "were ", " been"], true);
c(be, ["be", "was", "was", "been"], false); c(be, ["be", "was", "", "been"], false); c(be, ["be", "was", "wer", "been"], false);
c(be, ["be", "was", "were", "be"], false); c(be, ["is", "was", "were", "been"], false); c(be, ["be", "was were were", "", "been"], false);
c(q("learn"), ["learn", "learnt", "learned"], true); c(q("learn"), ["learn", "learnt/learned", "learnt - learned"], true);
c(q("learn"), ["learn", "learnt learned", "learned or learnt"], true); c(q("learn"), ["learn", "learnt/learnd", "learnt"], false);
c(q("go"), ["go", "went", "gone"], true); c(q("go"), ["go", "went", "went"], false); c(q("go"), ["go", "goed", "gone"], false);
c(q("go"), ["go", "went/gone", "gone"], false);
c(q("wake_up"), ["wake up", "woke up", "woken up"], true); c(q("wake_up"), ["wake up", "woke", "woken up"], false);
c(q("hang"), ["hang", "hung", "hanged"], true); c(q("get"), ["get", "got", "gotten"], true);
// cada verbo de la lista: sus formas oficiales valen
all.forEach(x => {
  const v = x.verb, pastBoth = x.verb.key === "be";
  const vals = pastBoth ? [v.inf, v.past[0], v.past[1], v.part[0]] : [v.inf, v.past[0], v.part[0]];
  c(x, vals, true);
});
console.log(fails ? fails + " FALLOS de " + n : "Level 1: " + n + " casos · TODO OK ✔");
process.exit(fails ? 1 : 0);
