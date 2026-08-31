/* MERIDIAN · Ask
   ────────────────────────────────────────────────────────────────────
   A retrieval assistant, not a language model. There is no server and no
   API key here, so nothing can *generate* an answer — and an invented
   answer about expected loss is worse than no answer at all.

   What it does instead: searches everything the app actually contains —
   the seven cities, the guide's lines, the videos, the reading list —
   ranks the passages, and hands back the real text with a link to where
   it came from. Every answer is quoted, never composed. */
(function (M) {
'use strict';

var INDEX = null;

function words(s) {
  return String(s)
    .toLowerCase()
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^a-z0-9À-￿-]+/g, ' ')
    .split(' ')
    .filter(function (w) { return w.length > 2; });
}

var STOP = {
  the:1, and:1, for:1, are:1, but:1, not:1, you:1, your:1, with:1, that:1,
  this:1, from:1, what:1, when:1, how:1, why:1, does:1, did:1, can:1, will:1,
  its:1, has:1, have:1, was:1, were:1, about:1, into:1, than:1, then:1,
  they:1, them:1, there:1, which:1, would:1, should:1, could:1
};

function build() {
  if (INDEX) return INDEX;
  var out = [];

  M.CITIES.forEach(function (c, ci) {
    out.push({ kind:'city', city:c.id, cityName:c.city, stop:ci + 1,
      title:c.title, text:c.hook, where:'The hook' });

    (c.body || []).forEach(function (b) {
      (b.p || []).forEach(function (p) {
        out.push({ kind:'city', city:c.id, cityName:c.city, stop:ci + 1,
          title:c.title, text:p, where:b.h || c.title });
      });
      (b.list || []).forEach(function (li) {
        out.push({ kind:'city', city:c.id, cityName:c.city, stop:ci + 1,
          title:c.title, text:li, where:b.h || c.title });
      });
      if (b.quote) {
        out.push({ kind:'city', city:c.id, cityName:c.city, stop:ci + 1,
          title:c.title, text:b.quote, where:b.h || c.title, quote:true });
      }
      if (b.table) {
        (b.table.rows || []).forEach(function (r) {
          out.push({ kind:'city', city:c.id, cityName:c.city, stop:ci + 1,
            title:c.title, text:r.join(' — '), where:b.h || c.title });
        });
      }
    });

    if (c.worked) {
      out.push({ kind:'city', city:c.id, cityName:c.city, stop:ci + 1,
        title:c.title, text:c.worked.p, where:c.worked.h });
    }
    if (M.GUIDE.lines[c.id]) {
      out.push({ kind:'guide', city:c.id, cityName:c.city, stop:ci + 1,
        title:c.title, text:M.GUIDE.lines[c.id], where:M.GUIDE.name });
    }
  });

  (M.VIDEOS || []).forEach(function (v) {
    out.push({ kind:'video', vid:v.id, city:v.city, title:v.title, text:v.why, where:v.who });
  });
  (M.READING || []).forEach(function (r) {
    out.push({ kind:'read', url:r.u, city:r.city, title:r.t, text:r.why, where:r.s });
  });
  (M.CASES || []).forEach(function (c) {
    out.push({ kind:'case', caseId:c.id, city:c.city, title:c.n + ' · ' + c.where + ' ' + c.yr,
      text:c.lesson, where:'Case study' });
    out.push({ kind:'case', caseId:c.id + '-w', city:c.city, title:c.n + ' · what happened',
      text:c.what, where:'Case study' });
  });
  (M.DOWNLOADS || []).forEach(function (d) {
    out.push({ kind:'download', url:d.u, title:d.t, text:d.why, where:d.k });
  });

  out.forEach(function (e) {
    e._w = words((e.title || '') + ' ' + (e.text || '') + ' ' + (e.where || '') + ' ' + (e.cityName || ''));
  });

  INDEX = out;
  return INDEX;
}

M.ask = function (q) {
  var idx = build();
  var qw = words(q).filter(function (w) { return !STOP[w]; });
  if (!qw.length) return [];

  var scored = idx.map(function (e) {
    var score = 0;
    qw.forEach(function (w) {
      var hits = 0;
      for (var i = 0; i < e._w.length; i++) {
        if (e._w[i] === w) hits += 3;
        else if (e._w[i].indexOf(w) === 0) hits += 2;   // prefix
        else if (e._w[i].indexOf(w) > -1) hits += 1;    // contains
      }
      score += hits;
    });
    // matching several distinct terms beats repeating one
    var distinct = qw.filter(function (w) {
      return e._w.some(function (x) { return x.indexOf(w) > -1; });
    }).length;
    score *= (1 + distinct * 0.8);
    if (e.quote) score *= 1.15;              // the memorable lines
    if (e.kind === 'guide') score *= 1.1;
    return { e: e, score: score };
  }).filter(function (x) { return x.score > 0; });

  scored.sort(function (a, b) { return b.score - a.score; });

  // one passage per source, so an answer does not come back seven times
  var seen = {}, out = [];
  for (var i = 0; i < scored.length && out.length < 6; i++) {
    var e = scored[i].e;
    var key = e.kind + ':' + (e.caseId || e.city || e.url || e.vid || i);
    if (seen[key]) continue;
    seen[key] = 1;
    out.push(e);
  }
  return out;
};

/* Field notes are useless as one undifferentiated pile. These are the five
   shapes a note actually takes on a credit desk. */
M.NOTE_KINDS = [
  { k:'assumption', label:'Unverified assumption', hint:'Something the file states that nobody has checked.' },
  { k:'number',     label:'Number to check',       hint:'A figure whose trend or source you want to test.' },
  { k:'question',   label:'Ask the borrower',      hint:'A question for the next call or site visit.' },
  { k:'policy',     label:'Policy gap',            hint:'Something our own process does not cover.' },
  { k:'action',     label:'Do on Monday',          hint:'A concrete step with your name on it.' }
];

M.noteKind = function (k) {
  for (var i = 0; i < M.NOTE_KINDS.length; i++) {
    if (M.NOTE_KINDS[i].k === k) return M.NOTE_KINDS[i];
  }
  return M.NOTE_KINDS[0];
};

})(window.M = window.M || {});
