/* MERIDIAN · the desk — four things that work on a real file
   ────────────────────────────────────────────────────────────────────
   Everything else on this site is about a borrower who does not exist.
   This is the part you can point at a live one on Monday morning.

   The arithmetic here is not approximated. Every formula is the one the
   Day 2 answer key used, and running Tashi Valley's own numbers through
   it reproduces 29/41/65, 27/32/47 and 1.81/1.67/1.41 exactly — which is
   the only test worth having, because a ratio tool that disagrees with
   the material it was built from teaches the wrong thing twice.

   Nothing typed here leaves the device. Not to the trainer, not to a
   sheet, not anywhere. That has to be true before anyone will type a
   real borrower's numbers into it, and it is stated on the surface. */
(function (M) {
'use strict';

var n = function (v) { var x = parseFloat(v); return isFinite(x) ? x : null; };
var r1 = function (v) { return Math.round(v * 10) / 10; };

/* ── 1. Run a real file ──────────────────────────────────────────────── */

M.FILE_ROWS = [
  { k:'revenue',   n:'Revenue' },
  { k:'opprofit',  n:'Operating profit' },
  { k:'interest',  n:'Interest paid' },
  { k:'principal', n:'Principal repaid' },
  { k:'netprofit', n:'Net profit' },
  { k:'recv',      n:'Trade receivables' },
  { k:'pay',       n:'Trade payables' },
  { k:'cash',      n:'Cash at bank' }
];

M.runFile = function (cols) {
  /* cols: [{revenue, opprofit, ...}, ...] oldest first */
  var out = { years: [], flags: [], ok: false };
  var any = false;

  cols.forEach(function (c) {
    var rev = n(c.revenue);
    var y = {
      recvDays: (rev && n(c.recv) != null) ? Math.round(n(c.recv) / rev * 365) : null,
      payDays:  (rev && n(c.pay)  != null) ? Math.round(n(c.pay)  / rev * 365) : null,
      cover:    null,
      cash:     n(c.cash),
      profit:   n(c.netprofit),
      revenue:  rev
    };
    var debtSvc = (n(c.interest) || 0) + (n(c.principal) || 0);
    if (n(c.opprofit) != null && debtSvc > 0) y.cover = Math.round(n(c.opprofit) / debtSvc * 100) / 100;
    if (y.recvDays != null || y.cover != null) any = true;
    out.years.push(y);
  });

  if (!any) return out;
  out.ok = true;

  var first = out.years[0], last = out.years[out.years.length - 1];
  var rose = function (a, b) { return a != null && b != null && b > a; };
  var fell = function (a, b) { return a != null && b != null && b < a; };

  /* The same thresholds the room used, and the same order of severity —
     collection first, because that is where the file actually turned. */
  if (rose(first.recvDays, last.recvDays)) {
    var pc = Math.round((last.recvDays - first.recvDays) / first.recvDays * 100);
    out.flags.push({
      c: last.recvDays >= 60 ? 'ESCALATE NOW' : 'CONCERN',
      f: 'Receivable days ' + first.recvDays + ' → ' + last.recvDays,
      w: 'Up ' + pc + '%. They are selling more and collecting less. ' +
         (last.recvDays >= 60 ? 'Past sixty days this is not a timing difference, it is a collection failure.'
                              : 'Ask what changed in the collection process, not in the market.')
    });
  }
  if (rose(first.payDays, last.payDays)) {
    out.flags.push({ c:'CONCERN', f:'Payable days ' + first.payDays + ' → ' + last.payDays,
      w:'Suppliers are funding the business. That is the cheapest credit line there is, right up to the day it is withdrawn.' });
  }
  if (fell(first.cover, last.cover)) {
    var breach = last.cover < 1.25;
    out.flags.push({
      c: breach ? 'ESCALATE NOW' : 'CONCERN',
      f: 'Cover ratio ' + first.cover.toFixed(2) + ' → ' + last.cover.toFixed(2),
      w: breach ? 'Below the 1.25 policy floor. This one fails the test as well as the trend.'
                : 'Still above 1.25, so it passes every time it is tested. It has fallen every year. The level passes; the trend fails.'
    });
  }
  if (fell(first.cash, last.cash) && last.profit != null && last.profit > 0) {
    out.flags.push({ c:'ESCALATE NOW', f:'Cash falling while profitable',
      w:'Profit ' + last.profit + ' with cash down from ' + first.cash + ' to ' + last.cash +
        '. Profit is an opinion. Cash is a fact, and this one is leaving.' });
  }
  if (fell(first.profit, last.profit) && rose(first.revenue, last.revenue)) {
    out.flags.push({ c:'CONCERN', f:'Net profit falling while revenue rises',
      w:'Growth that costs more than it earns. Find out whether it is price, mix or cost — the answer changes the decision.' });
  }

  /* Growth is computed from the raw figures, not from the rounded day
     counts — going via receivable days puts two roundings inside a
     percentage and turns 224% into 228%. */
  var recvA = n(cols[0].recv), recvB = n(cols[cols.length - 1].recv);
  if (first.revenue && last.revenue && recvA && recvB) {
    var revG = Math.round((last.revenue - first.revenue) / first.revenue * 100);
    var recvG = Math.round((recvB - recvA) / recvA * 100);
    out.synth = 'Revenue grew ' + revG + '%. Receivables grew ' + recvG + '%.';
  }
  if (!out.flags.length) out.flags.push({ c:'NOTHING FOUND', f:'No trend flags on these numbers',
    w:'That is a result, not a pass. It means the risk is not in the ratios — go and look at concentration, related parties, and what is not in the file at all.' });
  return out;
};

/* ── 2. Expected loss ────────────────────────────────────────────────── */

M.expectedLoss = function (pdPc, lgdPc, ead) {
  var pd = n(pdPc), lgd = n(lgdPc), e = n(ead);
  if (pd == null || lgd == null || e == null) return null;
  var el = (pd / 100) * (lgd / 100) * e;
  return {
    el: el,
    /* The mistake the room made, kept deliberately: multiplying the two
       percentages as whole numbers overstates the loss by exactly 100×
       one of them — here, ten times. An expected loss overstated by a
       factor of ten declines a facility that should have been written. */
    trap: (pd / 100) * lgd * e,
    pd: pd, lgd: lgd, ead: e
  };
};

/* ── 3. Scorecard ────────────────────────────────────────────────────── */

M.SCORE_FACTORS = [
  { k:'cash',     n:'Cash generation',        w:'Does the business generate cash, not just profit?' },
  { k:'leverage', n:'Leverage and cover',     w:'Debt against earnings, and how many times it is covered.' },
  { k:'collect',  n:'Collection quality',     w:'Receivable days, and the trend in them.' },
  { k:'security', n:'Security',               w:'What it is, who valued it, and what it fetches on a bad day.' },
  { k:'mgmt',     n:'Management and succession', w:'Who holds the knowledge, and what happens if they stop.' },
  { k:'sector',   n:'Sector and concentration', w:'Where this sits in the book, and what else moves with it.' },
  { k:'related',  n:'Related-party exposure', w:'Contracts, valuations and audits inside the family.' },
  { k:'history',  n:'Conduct history',        w:'Restructurings, arrears, and what was said about them.' },
  { k:'geography',n:'Geography',              w:'Where the asset physically is — and what else you hold there.' }
];

M.GRADES = [
  { min: 4.30, g:'1 — Strong',       w:'Price it and move on.' },
  { min: 3.60, g:'2 — Satisfactory', w:'Standard terms. Watch the one factor that scored lowest.' },
  { min: 2.90, g:'3 — Acceptable',   w:'Conditions worth writing down. Review sooner than annually.' },
  { min: 2.20, g:'4 — Watch',        w:'Not a decline. A shorter leash and a named owner.' },
  { min: 1.50, g:'5 — Substandard',  w:'Security is doing the work. Be honest about that in committee.' },
  { min: 0,    g:'6 — Impaired',     w:'Price will not fix this. The question is recovery, not return.' }
];

M.scoreCard = function (picks) {
  /* picks: [{k, weight, score}] */
  var tw = 0, ts = 0, used = [];
  picks.forEach(function (p) {
    var w = n(p.weight), sc = n(p.score);
    if (w == null || sc == null || w <= 0) return;
    tw += w; ts += w * sc; used.push(p);
  });
  if (!tw) return null;
  var val = ts / tw;
  var band = M.GRADES.filter(function (g) { return val >= g.min; })[0] || M.GRADES[M.GRADES.length - 1];
  var low = used.slice().sort(function (a, b) { return n(a.score) - n(b.score); })[0];
  return {
    value: Math.round(val * 100) / 100,
    grade: band.g, note: band.w,
    weightTotal: Math.round(tw),
    weakest: low ? (M.SCORE_FACTORS.filter(function (f) { return f.k === low.k; })[0] || {}).n : null,
    count: used.length
  };
};

/* ── 4. Test me ──────────────────────────────────────────────────────────
   Spaced repetition, kept deliberately small. The full SM-2 algorithm
   needs a grading scale people will not use honestly on themselves; this
   needs one number per question — when it was last seen — and gets most
   of the benefit. Questions you got wrong come back sooner. */

M.dueQuestion = function () {
  var done = M.CITIES.filter(function (c) { return !!M.S.done[c.id]; });
  if (!done.length) return null;
  var seen = M.S.recall || {};
  var today = M.dayKey();

  var scored = done.map(function (c) {
    var rec = seen[c.id] || { last:null, wrong:0 };
    var age = rec.last ? M.daysBetween(rec.last, today) : 999;
    /* Wrong answers come back four times faster. */
    return { c: c, age: age, pri: age * (1 + rec.wrong * 3) };
  }).sort(function (a, b) { return b.pri - a.pri; });

  var top = scored[0];
  if (top.age < 1) return null;          // already seen today
  return { city: top.c, check: top.c.check, days: top.age === 999 ? null : top.age };
};

M.recordRecall = function (cityId, right) {
  M.S.recall = M.S.recall || {};
  var rec = M.S.recall[cityId] || { last:null, wrong:0 };
  rec.last = M.dayKey();
  rec.wrong = right ? 0 : Math.min(4, rec.wrong + 1);
  M.S.recall[cityId] = rec;
  M.save();
};

})(window.M = window.M || {});
