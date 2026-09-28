/* Tests del LEVEL 3 (traducción español -> inglés). IGUAL en todas las apps.
   Ejecutar:  node tests/level3.test.js
   Carga el código real de index.html (tests/load.js) y comprueba, para cada una de las
   preguntas type "translate", los casos de tests/level3.cases.js (propios de cada app):
   positivos (deben ACEPTARSE) y negativos (deben FALLAR). */
"use strict";
const { load } = require("./load.js");
const T = load();
const QS = T.MODULES.filter(m => m.level === 3).flatMap(m => m.questions);

const CASES_SRC = require("./level3.cases.js");
const CASES = typeof CASES_SRC === "function" ? CASES_SRC(T) : CASES_SRC;

/* ---------- generadores de variantes ---------- */
const CONTRACT = [
  [/\bwill not\b/i, "won't"],
  [/\bI am\b/i, "I'm"], [/\byou are\b/i, "you're"], [/\bwe are\b/i, "we're"], [/\bthey are\b/i, "they're"],
  [/\bit is\b/i, "it's"], [/\bit has\b/i, "it's"], [/\bI have\b/i, "I've"], [/\bwe have\b/i, "we've"], [/\bthey have\b/i, "they've"],
  [/\bis not\b/i, "isn't"], [/\bare not\b/i, "aren't"], [/\bhas not\b/i, "hasn't"], [/\bhave not\b/i, "haven't"],
  [/\bdo not\b/i, "don't"], [/\bdoes not\b/i, "doesn't"], [/\bwe will\b/i, "we'll"],
  [/\bdid not\b/i, "didn't"], [/\bwas not\b/i, "wasn't"], [/\bwere not\b/i, "weren't"], [/\bhad not\b/i, "hadn't"],
  [/\bcould not\b/i, "couldn't"], [/\bcan not\b/i, "can't"], [/\b(I|we|they|he|she) had\b/i, "$1'd"],
  [/\bhe has\b/i, "he's"], [/\bshe has\b/i, "she's"], [/\byou have\b/i, "you've"]
];
function sub(m, rx, to) { return keepCase(m, m.replace(new RegExp(rx.source, "i"), to)); }
function contractAll(s) { let o = s; for (let k = 0; k < 3; k++) CONTRACT.forEach(([rx, to]) => { o = o.replace(rx, m => sub(m, rx, to)); }); return o; }
function contractFirst(s) {
  if (/\bwill not\b/i.test(s)) return s.replace(/\bwill not\b/i, "won't");   // 'll not no es natural
  let best = null;
  CONTRACT.forEach(([rx, to]) => { const m = rx.exec(s); if (m && (!best || m.index < best.i)) best = { i: m.index, len: m[0].length, to: sub(m[0], rx, to) }; });
  return best ? s.slice(0, best.i) + best.to + s.slice(best.i + best.len) : s;
}
function keepCase(m, to) { return m[0] === m[0].toUpperCase() && m[0] !== m[0].toLowerCase() ? to[0].toUpperCase() + to.slice(1) : to; }
function contractLast(s) {
  let best = null;
  CONTRACT.forEach(([rx, to]) => {
    const g = new RegExp(rx.source, "gi"); let m;
    while ((m = g.exec(s))) if (!best || m.index > best.i) best = { i: m.index, len: m[0].length, to: sub(m[0], rx, to) };
  });
  return best ? s.slice(0, best.i) + best.to + s.slice(best.i + best.len) : s;
}

function autoPositives(q, c) {
  const model = q.answers[0];
  const out = [
    ["modelo", model],
    ["sin punto final", model.replace(/[.!?]+$/, "")],
    ["sin ningún signo", model.replace(/[.,;:!?¿¡"]/g, "")],
    ["MAYÚSCULAS", model.toUpperCase()],
    ["minúsculas", model.toLowerCase()],
    ["espacios de más", "   " + model.replace(/ /g, "  ") + "   "],
    ["coma sin espacio", model.indexOf(", ") >= 0 ? model.replace(", ", ",") : model.replace(" ", ",")],
    ["signos pegados", model.replace(/ /g, " ").replace(/\.$/, "...!!")],
    ["forma completa", c.full]
  ];
  const cAll = contractAll(c.full);
  if (cAll !== c.full) {
    out.push(["contraído (')", cAll]);
    out.push(["contraído (’)", cAll.replace(/'/g, "’")]);
    out.push(["contraído sin apóstrofo", cAll.replace(/'/g, "")]);
    const mix1 = contractFirst(c.full), mix2 = contractLast(cAll.replace(/'/g, "")) ;
    out.push(["mezcla completo/contraído", mix1]);
    if (contractAll(c.full.replace(/\b(is|are|has|have|do|does) not\b/i, "$1 not")) !== c.full) {
      // mezcla: la primera contraída sin apóstrofo, el resto completo
      out.push(["mezcla sin apóstrofo", mix1.replace(/'/g, "")]);
    }
  }
  q.answers.forEach((a, k) => out.push(["mostrada " + k, a]));
  (q.alts || []).forEach((a, k) => out.push(["alt " + k, a]));
  return out;
}

/* ---------- tests del motor (independientes de las frases) ---------- */
let fails = 0;
const log = [];
function check(name, cond, extra) { if (!cond) { fails++; log.push("  ✗ " + name + (extra ? "  → " + extra : "")); } }

const E = T.L3;
check("signo -> espacio", E.prep("Every day,I get up.Now") === "every day i get up now", E.prep("Every day,I get up.Now"));
check("guiones -> espacio", E.prep("well-known – yes—no") === "well known yes no", E.prep("well-known – yes—no"));
check("apóstrofos tipográficos", E.prep("I’m Iʼm I`m I´m") === "i'm i'm i'm i'm", E.prep("I’m Iʼm I`m I´m"));
check("¿¡«»()[]/…", E.prep("¿Qué? ¡Sí! «a» (b) [c] d/e f…") === "qué sí a b c d e f", E.prep("¿Qué? ¡Sí! «a» (b) [c] d/e f…"));
check("números 7=seven", E.baseTokens("seven").join() === "7");
check("números 100", ["one hundred", "a hundred", "100"].every(s => E.baseTokens(s).join() === "100"));
check("años", ["2020", "twenty twenty", "two thousand and twenty", "two thousand twenty"].every(s => E.baseTokens(s).join() === "2020"));
check("veintiuno", E.baseTokens("twenty-one").join() === "21");
check("7:30 = seven thirty", E.baseTokens("7:30").join(" ") === E.baseTokens("seven thirty").join(" "));
check("o'clock opcional", ["at 7", "at seven o'clock", "at 7 oclock", "at 7 o clock", "at 7:00", "at 7 am", "at 7am", "at 7 a.m."]
  .every(s => E.baseTokens(s).join(" ") === "at 7"), ["at 7 a.m.", "at 7am"].map(s => E.baseTokens(s).join(" ")).join(" / "));
check("ordinales", E.baseTokens("21st").join() === E.baseTokens("twenty-first").join());
check("GB/US", E.baseTokens("travelling colour mom learned").join(" ") === "travelling colour mum learnt");
check("cannot", E.baseTokens("cannot").join(" ") === "can not");
const rd = (t, n) => E.studentReadings(t, n).map(x => x.join(" "));
[["don't", "do not"], ["dont", "do not"], ["doesnt", "does not"], ["isnt", "is not"], ["arent", "are not"], ["wasnt", "was not"],
 ["havent", "have not"], ["hasnt", "has not"], ["hadnt", "had not"], ["won't", "will not"], ["wont", "will not"], ["can't", "can not"],
 ["cant", "can not"], ["im", "i am"], ["i'm", "i am"], ["ive", "i have"], ["youre", "you are"], ["theyre", "they are"], ["we're", "we are"],
 ["were", "we are"], ["were", "were"], ["ill", "i will"], ["ill", "ill"], ["well", "we will"], ["its", "it is"], ["its", "its"],
 ["hes", "he has"], ["shes", "she is"], ["it's", "it has"], ["that's", "that is"], ["what's", "what is"], ["there's", "there is"],
 ["i'd", "i would"], ["i'd", "i had"], ["let's", "let us"], ["couldn't", "could not"], ["mustn't", "must not"], ["shouldnt", "should not"],
 ["sister's", "sister has"], ["sister's", "sister's"], ["sisters", "sister's"], ["they'll", "they will"], ["id", "id"], ["id", "i had"]]
  .forEach(([t, want]) => check("contracción " + t + " -> " + want, rd(t).indexOf(want) >= 0, rd(t).join(" | ")));
check("'ll not no vale", rd("i'll", "not").indexOf("i will") < 0);
check("'s modelo: it's been -> has", E.modelReadings("It's been raining").indexOf("it has been raining") >= 0);
check("'s modelo: it's snowing -> is", E.modelReadings("It's snowing")[0] === "it is snowing");
check("'d modelo: I'd gone -> had", E.modelReadings("I'd gone")[0] === "i had gone");
check("'d modelo: I'd go -> would", E.modelReadings("I'd go")[0] === "i would go");
// hueco sin definir en L3_CONFIG: vale tal cual, al principio o al final
const ex = [...new Set(E.expandPattern("(I|We) [usually] (get up|wake up) at (seven|7) [o'clock] {T:once in a blue moon}").map(s => s.toLowerCase()))];
// 2 sujetos × 2 (usually) × 2 verbos × 2 (seven/7) × 2 (o'clock) × 2 posiciones (principio/final)
check("plantilla: nº de variantes", ex.length === 64, ex.length);
check("plantilla: hueco al principio", ex.indexOf("once in a blue moon we usually wake up at 7") >= 0);
check("plantilla: anidada y opcional con alternativas", E.expandPattern("a (b (c|d)|e) [f|g]").length === 9);
check("plantilla: ; separa oraciones", E.expandPattern("x y {T:today} ; z w").indexOf("today x y z w") >= 0 &&
  E.expandPattern("x y {T:today} ; z w").indexOf("x y z w today") < 0);
{
  const big = { qid: "tope", type: "translate", answers: ["a"], pat: ["(a|b|c|d|e|f|g|h|i|j) (a|b|c|d|e|f|g|h|i|j) (a|b|c|d|e|f|g|h|i|j) (a|b|c|d|e|f|g|h|i|j)"] };
  const before = T.warnings.length;
  E.prepare(big);
  check("tope de 5000 variantes + aviso", big.accepted.size <= E.MAX_VARIANTS && T.warnings.length > before, big.accepted.size);
}

/* ---------- rendimiento: expandir TODO el nivel 3 ---------- */
const t0 = Number(process.hrtime.bigint()) / 1e6;
QS.forEach(q => E.prepare(q));
const ms = Number(process.hrtime.bigint()) / 1e6 - t0;
check("expansión de todo el nivel 3 < 200 ms", ms < 200, ms.toFixed(1) + " ms");

/* ---------- no se guarda ni se envía la lista de aceptadas ---------- */
QS.forEach(q => {
  const j = JSON.stringify(q);
  check(q.qid + ": accepted no serializable", j.indexOf("accepted") < 0 && j.indexOf("_l3trie") < 0);
  check(q.qid + ": modelAnswer ≤ 3 respuestas", T.modelAnswer(q).split("|").length <= 3, T.modelAnswer(q));
  check(q.qid + ": answers mostradas ≤ 3", q.answers.length <= 3);
});
{
  T.saveResultLocally({ moduleId: QS[0].qid, score: 5, answers: QS.slice(0, 2) });
  const saved = Object.values(T.store).join(" ");
  check("saveResultLocally no guarda accepted", saved.indexOf("accepted") < 0);
}

/* ---------- por pregunta ---------- */
const rows = [];
QS.forEach(q => {
  const c = CASES[q.qid];
  if (!c) { fails++; log.push("  ✗ " + q.qid + ": sin casos de test"); return; }
  const pos = autoPositives(q, c).concat(c.pos.map((p, k) => ["extra " + k, p]));
  const neg = c.neg.concat(["", "   ", ".", q.answers[0].split(" ")[0],
    q.answers[0].replace(/[.!?]$/, "").split(" ").reverse().join(" ")]);
  let pOk = 0, nOk = 0;
  pos.forEach(([name, s]) => {
    if (T.gradeTranslation(s, q)) pOk++;
    else { fails++; log.push("  ✗ " + q.qid + " POSITIVO rechazado (" + name + "): " + JSON.stringify(s)); }
  });
  neg.forEach(s => {
    if (!T.gradeTranslation(s, q)) nOk++;
    else { fails++; log.push("  ✗ " + q.qid + " NEGATIVO aceptado: " + JSON.stringify(s)); }
  });
  rows.push([q.qid, q.accepted.size, pOk + "/" + pos.length, nOk + "/" + neg.length]);
});

const pad = (s, n) => String(s).padEnd(n);
console.log("\n" + pad("qid", 14) + "| " + pad("variantes", 10) + "| " + pad("positivos OK", 13) + "| negativos OK");
console.log("-".repeat(56));
rows.forEach(r => console.log(pad(r[0], 14) + "| " + pad(r[1], 10) + "| " + pad(r[2], 13) + "| " + r[3]));
const tot = (i) => rows.reduce((a, r) => { const [x, y] = r[i].split("/").map(Number); return [a[0] + x, a[1] + y]; }, [0, 0]).join("/");
console.log("-".repeat(56));
console.log(pad("TOTAL " + rows.length, 14) + "| " + pad(rows.reduce((a, r) => a + r[1], 0), 10) + "| " + pad(tot(2), 13) + "| " + tot(3));
console.log("Expansión de todo el nivel 3: " + ms.toFixed(1) + " ms");
if (fails) { console.log("\n" + fails + " FALLOS:\n" + log.join("\n")); process.exit(1); }
console.log("\nTODO OK ✔");
