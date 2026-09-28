/* Casos de test del Level 3 de ESTA app (Irregular Verbs): 210 frases.
   Se generan a partir de los datos (VERBS y las propias preguntas) + casos escritos a mano.
   Positivos: forma completa, variantes añadidas, expresión de tiempo movida, sinónimos.
   Negativos: forma base, forma regularizada (-ed), pasado <-> participio, auxiliar mal o sin
   auxiliar, orden roto (y los que añade el test genérico). */
module.exports = function (T) {
  const QS = T.MODULES.filter(m => m.level === 3).flatMap(m => m.questions);
  const V = T.VERBS;
  const MOVE = new RegExp("^(.*?)[ ,]+(" + T.L3_CONFIG.auto.move.join("|") + ")$", "i");
  // alternativas regulares que SÍ existen (no son negativos)
  const REAL_ED = ["burned", "dreamed", "learned", "smelled", "spelled", "lighted", "quitted", "hanged", "leaned", "spoiled"];
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const EXTRA_POS = {
    iv_m1_l3_1: ["I've been here since 8.", "Since eight o'clock I have been here."],
    iv_m1_l3_12: ["A week ago the dog bit me.", "The dog bit me one week ago."],
    iv_m1_l3_16: ["The wind blew really strongly."],
    iv_m1_l3_17: ["She's blown the candles out."],
    iv_m1_l3_21: ["She's brought us a gift."],
    iv_m1_l3_22: ["They built this house 100 years ago.", "A hundred years ago they built this house."],
    iv_m1_l3_24: ["I burned the food."],
    iv_m1_l3_26: ["I bought a mobile phone a month ago.", "A month ago I bought a phone."],
    iv_m1_l3_28: ["The police caught the robber."],
    iv_m1_l3_35: ["It's cost lots of money."],
    iv_m2_l3_2: ["I dreamed about my dog last night.", "Last night I dreamt of my dog."],
    iv_m2_l3_5: ["The baby has drunk all her milk."],
    iv_m2_l3_14: ["Yesterday I felt really tired."],
    iv_m2_l3_19: ["She's found her mobile."],
    iv_m2_l3_21: ["I've never flown.", "I have never flown on a plane."],
    iv_m2_l3_28: ["Three days ago I got a present.", "I got a gift three days ago."],
    iv_m2_l3_29: ["He's got a job.", "He has gotten a job."],
    iv_m2_l3_30: ["My granny gave me a book.", "My grandmother gave a book to me."],
    iv_m2_l3_32: ["We went to the movies."],
    iv_m2_l3_35: ["Since the summer you have grown a lot."],
    iv_m2_l3_36: ["I hung my coat up."],
    iv_m2_l3_37: ["We've hung up the pictures."],
    iv_m2_l3_40: ["I heard a weird noise."],
    iv_m3_l3_6: ["A week ago I hurt my knee."],
    iv_m3_l3_13: ["The chicken has laid an egg."],
    iv_m3_l3_16: ["I learned to swim 5 years ago."],
    iv_m3_l3_20: ["I lent my bicycle to her."],
    iv_m3_l3_23: ["The teacher has let us go home early."],
    iv_m3_l3_24: ["I lay down on the couch."],
    iv_m3_l3_28: ["Daddy lit the fire.", "My father lit the fire."],
    iv_m2_l3_27: ["My mum has frozen the soup."],
    iv_m5_l3_17: ["My dad has swept up the leaves."],
    iv_m3_l3_33: ["Since September he has made many friends."],
    iv_m3_l3_41: ["I've paid already."],
    iv_m4_l3_2: ["Two years ago my uncle quit smoking."],
    iv_m4_l3_7: ["I have never ridden on a motorcycle."],
    iv_m4_l3_8: ["Five minutes ago the phone rang.", "The mobile rang 5 minutes ago."],
    iv_m4_l3_12: ["I ran 5 kilometers."],
    iv_m4_l3_13: ["The dog has run for one hour."],
    iv_m4_l3_14: ["She said hi."],
    iv_m4_l3_20: ["An hour ago I sent you a text."],
    iv_m4_l3_21: ["She's sent an e-mail to me."],
    iv_m4_l3_22: ["I set my alarm clock."],
    iv_m4_l3_36: ["The boat sank 100 years ago."],
    iv_m4_l3_38: ["I sat down beside Ana."],
    iv_m5_l3_0: ["The kitchen smelled like bread."],
    iv_m5_l3_3: ["Since she was a little girl she has spoken English."],
    iv_m5_l3_4: ["He misspelled my name.", "He spelled my name incorrectly."],
    iv_m5_l3_10: ["Somebody stole my bicycle two days ago."],
    iv_m5_l3_20: ["I took lots of pictures."],
    iv_m5_l3_21: ["Somebody has taken my biro."],
    iv_m5_l3_22: ["My grandpa taught me how to play chess."],
    iv_m5_l3_31: ["Somebody has thrown litter."],
    iv_m5_l3_33: ["I have now understood the rule."],
    iv_m5_l3_37: ["I've worn these shoes two times."]
  };
  const EXTRA_NEG = {
    iv_m1_l3_0: ["I was in Rome since two years."],
    iv_m1_l3_12: ["The dog has bitten me a week ago."],
    iv_m1_l3_17: ["She has blown the candles."],
    iv_m2_l3_28: ["I received a present three days ago.", "I was given a present three days ago."],
    iv_m2_l3_20: ["We have flown to London a year ago."],
    iv_m3_l3_12: ["I set the table."],
    iv_m3_l3_22: ["My parents allowed me to go out.", "My parents let me to go out."],
    iv_m3_l3_40: ["I paid the tickets."],
    iv_m3_l3_24: ["I laid on the sofa.", "I lied on the sofa."],
    iv_m3_l3_26: ["He lay to his mother."],
    iv_m4_l3_2: ["My uncle stopped smoking two years ago.", "My uncle quit to smoke two years ago."],
    iv_m4_l3_10: ["The sun came up at seven.", "The sun raised at seven."],
    iv_m4_l3_14: ["She told hello."],
    iv_m5_l3_24: ["I ripped the paper."],
    iv_m5_l3_27: ["He has said me the truth."],
    iv_m5_l3_33: ["Now I have understanded the rule."]
  };

  const out = {};
  QS.forEach(q => {
    const en = q.answers[0], vk = q.verbKey, v = V[vk];
    const targets = (q.tense === "ps" ? v[1] : v[2]).slice();
    const pos = (EXTRA_POS[q.qid] || []).slice(), neg = (EXTRA_NEG[q.qid] || []).slice();
    // expresión de tiempo al final -> también al principio
    const mv = MOVE.exec(en.replace(/[.!?]+$/, ""));
    if (mv && mv[1].split(" ").length > 1) pos.push(mv[2].charAt(0).toUpperCase() + mv[2].slice(1) + ", " + mv[1].charAt(0).toLowerCase() + mv[1].slice(1) + ".");
    // localizar la forma del verbo en la frase modelo
    const form = targets.find(f => new RegExp("\\b" + esc(f) + "\\b", "i").test(en));
    if (form) {
      const swap = to => en.replace(new RegExp("\\b" + esc(form) + "\\b", "i"), to);
      const cand = [];
      const base = v[0];
      if (base !== form) cand.push(swap(base));                                         // I draw a cat
      const reg = base.split(" ")[0].replace(/e$/, "") + "ed" + (base.includes(" ") ? " " + base.split(" ").slice(1).join(" ") : "");
      if (REAL_ED.indexOf(reg.split(" ")[0]) < 0 && v[1].indexOf(reg) < 0 && v[2].indexOf(reg) < 0) cand.push(swap(reg));   // drawed
      const other = (q.tense === "ps" ? v[2] : v[1]).find(f => f !== form && targets.indexOf(f) < 0 && !(q.tense === "pp" && v[2].indexOf(f) >= 0));
      if (other) cand.push(swap(other));                                                // She has drew / I drawn
      if (q.tense === "pp") {
        if (/\bhas\b/i.test(en)) cand.push(en.replace(/\bhas\b/i, "have"));
        else if (/\bhave\b/i.test(en)) cand.push(en.replace(/\bhave\b/i, "has"));
        cand.push(en.replace(/\s*\b(has|have)\b/i, ""));                               // sin auxiliar
      } else if (v[1].some(f => v[2].indexOf(f) < 0)) {
        cand.push(en.replace(new RegExp("\\b" + esc(form) + "\\b", "i"), "have " + form)); // I have drew
      }
      cand.forEach(c => { if (c.toLowerCase() !== en.toLowerCase()) neg.push(c); });
    }
    out[q.qid] = { full: en, pos: pos, neg: neg };
  });
  return out;
};
