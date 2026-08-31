/* MERIDIAN · places — what each stop actually looks like
   ────────────────────────────────────────────────────────────────────
   Three views of one identity, so a city is recognisable wherever it
   appears: a LANDMARK glyph on its roadmap node, a TERRAIN silhouette
   behind the road, and a STAMP in the passport.

   All three are authored at the same stroke weight as the icon set and
   painted in `currentColor`, so they inherit the single palette rather
   than importing seven new ones. The city identity is the *shape*. */
(function (M) {
'use strict';

/* ── Landmarks ─────────────────────────────────────────────────────────
   Drawn on a 24×24 box, stroke-only, weight 1.9. Each is the building a
   person who has been there would draw from memory — not a flag, and not
   a clip-art monument. */
M.LANDMARKS = {
  /* Trashi Chhoe Dzong — battered walls that taper as they rise, the
     broad overhanging roof, the utse tower standing above the courtyard. */
  thimphu:
    '<path d="M3.5 20.5h17"/>' +
    '<path d="M5.6 20.5 6.8 12h10.4l1.2 8.5"/>' +
    '<path d="M4.4 12h15.2"/>' +
    '<path d="M6.4 12 12 8.4 17.6 12"/>' +
    '<path d="M10.3 8.6V6.2h3.4v2.4"/>' +
    '<path d="M9 6.2h6"/>' +
    '<path d="M12 3.4v2.8"/>' +
    '<path d="M10.6 20.5v-4.2h2.8v4.2"/>',

  /* Gateway of India — the one high central arch, flanked by the two
     lower turrets, standing on the harbour steps. */
  mumbai:
    '<path d="M2.8 20.8h18.4"/>' +
    '<path d="M8 20.8v-8a4 4 0 0 1 8 0v8"/>' +
    '<path d="M7 12.8V8.6h10v4.2"/>' +
    '<path d="M6 8.6h12"/>' +
    '<path d="M9.4 8.6c0-2 1.2-3.2 2.6-3.2s2.6 1.2 2.6 3.2"/>' +
    '<path d="M4.6 20.8v-7.2h2.6v7.2M16.8 20.8v-7.2h2.6v7.2"/>' +
    '<path d="M4.4 13.6c0-1.4.6-2.2 1.5-2.2s1.5.8 1.5 2.2M16.6 13.6c0-1.4.6-2.2 1.5-2.2s1.5.8 1.5 2.2"/>',

  /* Marina Bay Sands — three legs and the deck laid across the top. */
  singapore:
    '<path d="M2.6 20.8h18.8"/>' +
    '<path d="M5.4 20.8V9.4M11.4 20.8V8.2M17.4 20.8V9.4"/>' +
    '<path d="M3 9.4h16.8"/>' +
    '<path d="M2.6 9.4c3-3.4 8-5 11-5 3.6 0 6.6.9 8 1.7"/>' +
    '<path d="M6.6 20.8v-4h3.2v4M13.4 20.8v-4h3.2v4"/>',

  /* Grossmünster — the twin towers, flat-capped, over the nave. */
  zurich:
    '<path d="M2.8 20.8h18.4"/>' +
    '<path d="M6.4 20.8V7.2h4.2v13.6M13.4 20.8V7.2h4.2v13.6"/>' +
    '<path d="M5.8 7.2h5.4M12.8 7.2h5.4"/>' +
    '<path d="M6.8 7.2V5.4h3.4v1.8M13.8 7.2V5.4h3.4v1.8"/>' +
    '<path d="M10.6 20.8v-6.4h2.8v6.4"/>' +
    '<path d="M8.1 11.4v2.2M15.1 11.4v2.2"/>',

  /* The Elizabeth Tower — clock face high, the spire above it. */
  london:
    '<path d="M2.6 20.8h18.8"/>' +
    '<path d="M8.6 20.8V8.4h5.2v12.4"/>' +
    '<path d="M8 8.4h6.4"/>' +
    '<path d="M9.2 8.4V6.2h4v2.2"/>' +
    '<path d="M11.2 6.2 11.2 3.2 12.2 3.2"/>' +
    '<circle cx="11.2" cy="11.6" r="1.9"/>' +
    '<path d="M11.2 10.5v1.1h.9"/>' +
    '<path d="M16.2 20.8v-5.6h4v5.6"/>' +
    '<path d="M2.8 20.8v-4.2h4v4.2"/>',

  /* The Copan — Niemeyer's S in plan, read here as the sweep of the slab
     with its brise-soleil bands running across it. */
  saopaulo:
    '<path d="M2.8 20.8h18.4"/>' +
    '<path d="M4.6 20.8V7.6c3.4-2.6 9.2-2.6 14.6 0v13.2"/>' +
    '<path d="M4.9 11c3.4-2.2 9.4-2.2 13.9 0M5 14.2c3.4-2 9.4-2 13.9 0M5.2 17.4c3.4-1.8 9.4-1.8 13.8 0"/>' +
    '<path d="M10.4 20.8v-2.6h3v2.6"/>',

  /* Punakha Dzong — the same Bhutanese roofline as Thimphu, but sitting
     on its spit of land where the two rivers meet, reached by the
     cantilever bridge. That confluence is the point of the last stop. */
  punakha:
    '<path d="M7 16.2 7.9 9.6h8.2l.9 6.6"/>' +
    '<path d="M6 9.6h12"/>' +
    '<path d="M7.8 9.6 12 6.6l4.2 3"/>' +
    '<path d="M12 4.2v2.4"/>' +
    '<path d="M2.6 16.2h18.8"/>' +
    '<path d="M2.8 19.4c2.2-1.3 4-1.3 6.2 0M15 19.4c2.2-1.3 4-1.3 6.2 0"/>' +
    '<path d="M9 19.4c1.6-1.3 4.4-1.3 6 0"/>'
};

M.landmark = function (id, size, sw) {
  var d = M.LANDMARKS[id];
  if (!d) return '';
  size = size || 24;
  return '<svg class="lmk" viewBox="0 0 24 24" width="' + size + '" height="' + size +
    '" fill="none" stroke="currentColor" stroke-width="' + (sw || 1.9) +
    '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
};

/* ── Terrain ───────────────────────────────────────────────────────────
   The horizon behind the road. Seven slices laid end to end make one
   continuous country that changes under you as you travel.

   Defined as points, not path strings, for a boring but load-bearing
   reason: every slice has to start at (0,40) and finish at (100,40) or
   the horizon shows a step where two places meet. Hand-written path data
   drifts; a generated path cannot. `ridge` is the skyline, `kind` says
   whether to draw it as peaks (straight segments) or as a city block
   run (stepped verticals). */
M.TERRAIN = {
  thimphu:  { kind:'peak', ridge:[[0,30],[9,14],[16,22],[26,8],[35,20],[44,12],[53,24],[62,10],[72,21],[82,15],[91,25],[100,20]] },
  mumbai:   { kind:'city', ridge:[[0,32],[8,26],[15,30],[22,18],[30,24],[38,14],[46,22],[54,20],[62,12],[70,25],[78,19],[86,28],[93,22],[100,30]] },
  singapore:{ kind:'city', ridge:[[0,30],[7,18],[13,24],[20,10],[27,16],[34,8],[41,14],[48,6],[56,15],[63,11],[70,20],[77,13],[84,22],[92,16],[100,26]] },
  zurich:   { kind:'peak', ridge:[[0,28],[10,16],[18,23],[28,6],[38,18],[47,11],[56,22],[66,9],[76,19],[85,14],[93,24],[100,22]] },
  london:   { kind:'city', ridge:[[0,31],[9,27],[17,30],[24,16],[31,26],[39,29],[46,20],[54,24],[61,12],[68,23],[76,27],[84,21],[92,28],[100,30]] },
  saopaulo: { kind:'city', ridge:[[0,26],[6,14],[12,22],[18,10],[24,20],[30,12],[36,24],[42,9],[48,19],[54,13],[60,23],[66,11],[72,21],[78,15],[84,25],[90,12],[95,20],[100,16]] },
  punakha:  { kind:'peak', ridge:[[0,33],[12,25],[22,31],[33,22],[44,29],[55,20],[66,28],[77,23],[88,30],[100,26]] }
};

/* One slice of horizon, guaranteed to meet its neighbours at the baseline. */
M.terrainPath = function (id) {
  var t = M.TERRAIN[id];
  if (!t) return '';
  var d = 'M0 40 L0 ' + t.ridge[0][1];
  if (t.kind === 'city') {
    /* Blocks: rise, run flat, drop. Reads as roofline rather than ridgeline. */
    for (var i = 1; i < t.ridge.length; i++) {
      d += ' L' + t.ridge[i][0] + ' ' + t.ridge[i - 1][1] +
           ' L' + t.ridge[i][0] + ' ' + t.ridge[i][1];
    }
  } else {
    for (var j = 1; j < t.ridge.length; j++) d += ' L' + t.ridge[j][0] + ' ' + t.ridge[j][1];
  }
  return d + ' L100 40 Z';
};

/* Which country a stop belongs to, for the passport's page furniture. */
M.stampMeta = function (c) {
  return {
    city: c.city,
    country: (c.country || '').toUpperCase(),
    /* Deterministic, so a stamp does not jump every render. Derived from
       the id, because a random() here would re-roll on every repaint. */
    rot: ((hash(c.id) % 13) - 6) * 1.15,
    shape: ['round', 'oval', 'round', 'rect', 'round', 'oval', 'round'][
      M.CITIES.map(function (x) { return x.id; }).indexOf(c.id)
    ] || 'round'
  };
};

function hash(s) {
  var h = 0;
  for (var i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
M.hashStr = hash;

/* ── Stamps ────────────────────────────────────────────────────────────
   Inked, not printed. The wobble comes from a turbulence displacement on
   the whole group, which is what a rubber stamp on soft paper actually
   does — the ink is uneven and the edge never closes cleanly. One filter,
   seeded per city so no two stamps break in the same places. */
M.stampSvg = function (c, dateStr, size) {
  var m = M.stampMeta(c);
  var S = size || 120;
  var seed = hash(c.id) % 90;
  var fid = 'ink-' + c.id;
  var pid = 'arc-' + c.id;
  var date = dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? fmt(dateStr) : '';

  var frame, inner;
  if (m.shape === 'rect') {
    frame = '<rect x="14" y="26" width="92" height="68" rx="3" stroke-width="3.4"/>' +
            '<rect x="20" y="32" width="80" height="56" rx="2" stroke-width="1.4"/>';
    inner = '<text class="st-city" x="60" y="52" text-anchor="middle">' + esc(c.city) + '</text>' +
            '<text class="st-country" x="60" y="66" text-anchor="middle">' + esc(m.country) + '</text>' +
            '<text class="st-date" x="60" y="82" text-anchor="middle">' + esc(date) + '</text>';
  } else if (m.shape === 'oval') {
    frame = '<ellipse cx="60" cy="60" rx="52" ry="38" stroke-width="3.4"/>' +
            '<ellipse cx="60" cy="60" rx="45" ry="31" stroke-width="1.4"/>';
    inner = '<text class="st-city" x="60" y="55" text-anchor="middle">' + esc(c.city) + '</text>' +
            '<text class="st-country" x="60" y="69" text-anchor="middle">' + esc(m.country) + '</text>' +
            '<text class="st-date" x="60" y="83" text-anchor="middle">' + esc(date) + '</text>';
  } else {
    frame = '<circle cx="60" cy="60" r="50" stroke-width="3.4"/>' +
            '<circle cx="60" cy="60" r="42" stroke-width="1.4"/>';
    /* Two arcs, not one ring of text. A single path around the whole
       circle runs the country upside down across the bottom and then
       collides with the date; every real stamp splits it — city over the
       top, country under the bottom, separated by a dot on each side.

       Both arcs travel left→right so the glyphs stand up: SVG puts the
       glyph's up-vector to the left of the direction of travel, which
       points out of the circle on the top arc and, going the same way
       along the bottom, still points up. */
    inner =
      '<path id="' + pid + '-t" d="M25 60A35 35 0 0 1 95 60" fill="none"/>' +
      '<path id="' + pid + '-b" d="M25 62A35 35 0 0 0 95 62" fill="none"/>' +
      '<text class="st-arc"><textPath href="#' + pid + '-t" startOffset="50%" text-anchor="middle">' +
        esc(c.city.toUpperCase()) + '</textPath></text>' +
      '<text class="st-sub"><textPath href="#' + pid + '-b" startOffset="50%" text-anchor="middle">' +
        esc(m.country) + '</textPath></text>' +
      '<circle cx="21" cy="60" r="1.7" fill="currentColor" stroke="none"/>' +
      '<circle cx="99" cy="60" r="1.7" fill="currentColor" stroke="none"/>' +
      '<g class="st-mark" transform="translate(48 36)" stroke-width="1.9" stroke-linejoin="round">' +
        (M.LANDMARKS[c.id] || '') +
      '</g>' +
      '<text class="st-date" x="60" y="72" text-anchor="middle">' + esc(date) + '</text>';
  }

  return '<svg class="stamp stamp-' + m.shape + '" viewBox="0 0 120 120" width="' + S + '" height="' + S + '" ' +
      'role="img" aria-label="Entry stamp, ' + esc(c.city) + ', ' + esc(c.country) + (date ? ', ' + esc(date) : '') + '">' +
    '<defs><filter id="' + fid + '" x="-14%" y="-14%" width="128%" height="128%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="3" seed="' + seed + '" result="n"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="1.7" xChannelSelector="R" yChannelSelector="G"/>' +
    '</filter></defs>' +
    '<g filter="url(#' + fid + ')" transform="rotate(' + m.rot.toFixed(2) + ' 60 60)" ' +
       'fill="none" stroke="currentColor" stroke-linecap="round">' +
      frame + inner +
    '</g></svg>';
};

function fmt(k) {
  var p = k.split('-');
  var mo = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][+p[1] - 1] || '';
  return p[2] + ' ' + mo + ' ' + p[0];
}
M.stampDate = fmt;

/* ── Mr. Meridian ──────────────────────────────────────────────────────
   The guide's face, drawn to the character sheet: bowler with a band,
   heavy arched brows over wide round eyes, toothbrush moustache, the mole
   on his left cheek, ears that stick out.

   Two constraints shape every choice here. It renders at about 52px, so
   nothing survives that is not a bold shape — the brows and the moustache
   do almost all of the work at that size. And it stays inside the one
   palette: skin and ink are the two --face-* tokens, the hat band is
   --brand. No new colours enter the app through a face. */
M.guideFace = function (size) {
  var S = size || 52;
  return '<svg viewBox="0 0 64 64" width="' + S + '" height="' + S + '" aria-hidden="true">' +
    /* ears first, so the head overlaps them */
    '<ellipse cx="15.5" cy="35" rx="3.6" ry="5.2" fill="var(--face-skin)" stroke="var(--face-ink)" stroke-width="1.5"/>' +
    '<ellipse cx="48.5" cy="35" rx="3.6" ry="5.2" fill="var(--face-skin)" stroke="var(--face-ink)" stroke-width="1.5"/>' +

    /* head — wide at the brow, tapering to a rounded chin */
    '<path d="M32 19 C 21 19 17 26 17 34 C 17 43 23 52 32 52 C 41 52 47 43 47 34 C 47 26 43 19 32 19 Z" ' +
      'fill="var(--face-skin)" stroke="var(--face-ink)" stroke-width="1.8" stroke-linejoin="round"/>' +

    /* brows: heavy, arched, the left one higher — the whole expression */
    '<path d="M21.5 28.6 Q26 24.4 31 27.6 Q26 26.8 22.6 30.4 Z" fill="var(--face-ink)"/>' +
    '<path d="M42.5 29.4 Q38 25.2 33 28.4 Q38 27.6 41.4 31.2 Z" fill="var(--face-ink)"/>' +

    /* eyes: real sclera, dark iris, a highlight. Pupils sit slightly
       left, because a character looking dead ahead reads as a doll */
    '<circle cx="26" cy="34" r="4.3" fill="#FFFDF8" stroke="var(--face-ink)" stroke-width="1.5"/>' +
    '<circle cx="38" cy="34" r="4.3" fill="#FFFDF8" stroke="var(--face-ink)" stroke-width="1.5"/>' +
    '<circle cx="25.2" cy="34.4" r="2" fill="var(--face-ink)"/>' +
    '<circle cx="37.2" cy="34.4" r="2" fill="var(--face-ink)"/>' +
    '<circle cx="24.5" cy="33.4" r="0.72" fill="#FFF"/>' +
    '<circle cx="36.5" cy="33.4" r="0.72" fill="#FFF"/>' +

    /* nose */
    '<path d="M32 35.5 Q30.4 40 30 41.6 Q31 42.6 32 42.6" fill="none" ' +
      'stroke="var(--face-ink)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>' +

    /* the toothbrush, and the smile lines that bracket it */
    '<rect x="27.6" y="43.4" width="8.8" height="3.6" rx="1.1" fill="var(--face-ink)"/>' +
    '<path d="M24.8 41.4 Q23.4 45 25.2 48" fill="none" stroke="var(--face-ink)" stroke-width="1.15" stroke-linecap="round" opacity="0.5"/>' +
    '<path d="M39.2 41.4 Q40.6 45 38.8 48" fill="none" stroke="var(--face-ink)" stroke-width="1.15" stroke-linecap="round" opacity="0.5"/>' +
    '<path d="M28.8 49.4 Q32 51 35.2 49.4" fill="none" stroke="var(--face-ink)" stroke-width="1.4" stroke-linecap="round"/>' +

    /* the mole */
    '<circle cx="40.4" cy="40.2" r="1.05" fill="var(--face-ink)"/>' +

    /* bowler, last, sitting over the crown */
    '<path d="M21.5 19.5 C 20.4 10.6 24.6 6.2 32 6.2 C 39.4 6.2 43.6 10.6 42.5 19.5 Z" fill="var(--face-ink)"/>' +
    '<ellipse cx="32" cy="19.6" rx="22.5" ry="3.9" fill="var(--face-ink)"/>' +
    /* Band AFTER the brim. Drawn before it, the brim ellipse sits straight
       over the top of it and the one warm accent on his whole face
       disappears. */
    '<rect x="21.6" y="12.8" width="20.8" height="3.6" rx="1.2" fill="var(--brand)"/>' +
    '<path d="M25 9.6 Q29 7.2 34 7.9" fill="none" stroke="#FFF" stroke-width="1.6" stroke-linecap="round" opacity="0.18"/>' +
    '</svg>';
};

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

})(window.M = window.M || {});
