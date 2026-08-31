/* MERIDIAN · share — the passport card, drawn to a canvas
   ────────────────────────────────────────────────────────────────────
   Turns what someone has actually earned into a 1200×630 image they can
   post. No screenshot library: the card is drawn with the Canvas 2D API,
   which means it renders at whatever pixel ratio we ask for, carries the
   real typefaces (canvas uses fonts already loaded by the document), and
   adds nothing to the bundle.

   The stamp geometry is not re-authored here. `Path2D` accepts SVG path
   syntax, so the landmarks in places.js are the same strings on screen
   and in the export — one definition, two renderers. */
(function (M) {
'use strict';

var W = 1200, H = 630, SCALE = 2;   // 2400×1260 out, so it stays crisp when a feed re-encodes it

function tok(name, fallback) {
  var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

/* Canvas can only use a font it has actually loaded. Ask for the exact
   faces we draw with, then wait — otherwise the first card of a session
   silently falls back to Times. */
function fontsReady() {
  if (!document.fonts || !document.fonts.load) return Promise.resolve();
  return Promise.all([
    document.fonts.load('600 64px Fraunces'),
    document.fonts.load('500 26px Inter'),
    document.fonts.load('600 15px Inter')
  ]).then(function () { return document.fonts.ready; }).catch(function () {});
}

/* Text bent around a stamp's ring. Canvas has no textPath, so each glyph
   is placed on the arc and rotated to its own tangent — which is what the
   letterpress did anyway.

   `dir` is the half of the ring this line belongs to: +1 sweeps the top
   left-to-right, −1 sweeps the bottom left-to-right. Both read upright,
   because the glyph is rotated to `mid + dir·π/2` — at each arc's midpoint
   that is exactly zero. Using one direction for both is what puts a
   country upside down under a stamp. */
function arcText(ctx, str, cx, cy, r, centreAngle, dir) {
  var chars = str.split(''), widths = [], total = 0, i;
  for (i = 0; i < chars.length; i++) {
    var w = ctx.measureText(chars[i]).width;
    widths.push(w); total += w;
  }
  var span = total / r;                       // radians the string needs
  var a = centreAngle - dir * span / 2;
  for (i = 0; i < chars.length; i++) {
    var step = (widths[i] / r) * dir;
    var mid = a + step / 2;
    ctx.save();
    ctx.translate(cx + Math.cos(mid) * r, cy + Math.sin(mid) * r);
    ctx.rotate(mid + dir * Math.PI / 2);
    ctx.fillText(chars[i], -widths[i] / 2, 0);
    ctx.restore();
    a += step;
  }
}

function drawLandmark(ctx, id, x, y, size, colour, weight) {
  var d = M.LANDMARKS[id];
  if (!d || typeof Path2D === 'undefined') return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 24, size / 24);
  ctx.strokeStyle = colour;
  ctx.lineWidth = weight || 1.9;      // in glyph units — the scale above carries it
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  /* The glyph is authored as a set of sibling paths; Path2D takes them
     one at a time, so split on the path elements we wrote. */
  var parts = d.split('<path d="').slice(1);
  parts.forEach(function (p) {
    var dd = p.split('"')[0];
    try { ctx.stroke(new Path2D(dd)); } catch (e) {}
  });
  var circles = d.match(/<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"/g) || [];
  circles.forEach(function (c) {
    var n = c.match(/[\d.]+/g);
    ctx.beginPath();
    ctx.arc(+n[0], +n[1], +n[2], 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.restore();
}

function drawStamp(ctx, c, dateStr, cx, cy, R, colour) {
  var m = M.stampMeta(c);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(m.rot * Math.PI / 180);
  ctx.strokeStyle = colour;
  ctx.fillStyle = colour;
  ctx.globalAlpha = 0.82;                   // ink on absorbent paper, never solid
  ctx.lineCap = 'round';

  var date = dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? M.stampDate(dateStr) : '';

  if (m.shape === 'rect') {
    var w = R * 1.72, h = R * 1.26;
    ctx.lineWidth = 3.4 * (R / 50);
    ctx.strokeRect(-w / 2, -h / 2, w, h);
    ctx.lineWidth = 1.4 * (R / 50);
    ctx.strokeRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 12);
    ctx.textAlign = 'center';
    ctx.font = '600 ' + (R * 0.30).toFixed(0) + 'px Fraunces, Georgia, serif';
    ctx.fillText(c.city, 0, -R * 0.10);
    ctx.font = '600 ' + (R * 0.155).toFixed(0) + 'px Inter, system-ui, sans-serif';
    ctx.fillText(m.country, 0, R * 0.16);
    if (date) ctx.fillText(date, 0, R * 0.44);
  } else if (m.shape === 'oval') {
    ctx.lineWidth = 3.4 * (R / 50);
    ctx.beginPath(); ctx.ellipse(0, 0, R * 1.04, R * 0.76, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 1.4 * (R / 50);
    ctx.beginPath(); ctx.ellipse(0, 0, R * 0.90, R * 0.62, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.textAlign = 'center';
    ctx.font = '600 ' + (R * 0.30).toFixed(0) + 'px Fraunces, Georgia, serif';
    ctx.fillText(c.city, 0, -R * 0.06);
    ctx.font = '600 ' + (R * 0.155).toFixed(0) + 'px Inter, system-ui, sans-serif';
    ctx.fillText(m.country, 0, R * 0.20);
    if (date) ctx.fillText(date, 0, R * 0.46);
  } else {
    ctx.lineWidth = 3.4 * (R / 50);
    ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 1.4 * (R / 50);
    ctx.beginPath(); ctx.arc(0, 0, R * 0.86, 0, Math.PI * 2); ctx.stroke();
    ctx.textAlign = 'left';
    ctx.font = '600 ' + (R * 0.19).toFixed(0) + 'px Inter, system-ui, sans-serif';
    arcText(ctx, c.city.toUpperCase(), 0, 0, R * 0.70, -Math.PI / 2, 1);
    ctx.font = '600 ' + (R * 0.135).toFixed(0) + 'px Inter, system-ui, sans-serif';
    arcText(ctx, m.country, 0, 0, R * 0.70, Math.PI / 2, -1);
    ctx.beginPath(); ctx.arc(-R * 0.78, 0, R * 0.034, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(R * 0.78, 0, R * 0.034, 0, Math.PI * 2); ctx.fill();
    drawLandmark(ctx, c.id, -R * 0.24, -R * 0.40, R * 0.48, colour, 1.9);
    ctx.textAlign = 'center';
    ctx.font = '600 ' + (R * 0.155).toFixed(0) + 'px Inter, system-ui, sans-serif';
    if (date) ctx.fillText(date, 0, R * 0.24);
  }
  ctx.restore();
}

/* ── The card ──────────────────────────────────────────────────────── */
M.buildShareCard = function () {
  return fontsReady().then(function () {
    var cv = document.createElement('canvas');
    cv.width = W * SCALE; cv.height = H * SCALE;
    var ctx = cv.getContext('2d');
    ctx.scale(SCALE, SCALE);

    var paper = tok('--share-paper', '#F4EEE2');
    var card  = tok('--share-card',  '#FBF8F1');
    var ink   = tok('--share-ink',   '#14110D');
    var mute  = tok('--share-mute',  '#6B6154');
    var brand = tok('--share-brand', '#8A5F22');
    var rule  = tok('--share-rule',  '#D9CFB8');

    ctx.fillStyle = paper; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = card;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(28, 28, W - 56, H - 56, 20);
    else ctx.rect(28, 28, W - 56, H - 56);
    ctx.fill();
    ctx.strokeStyle = rule; ctx.lineWidth = 1; ctx.stroke();

    var done = M.CITIES.filter(function (c) { return !!M.S.done[c.id]; });
    var name = (M.S.name || (M.user && M.user.n) || 'A traveller');
    var rank = M.rankOf(M.S.xp);

    /* Left column — who, and how far */
    ctx.textAlign = 'left';
    ctx.fillStyle = brand;
    ctx.font = '600 15px Inter, system-ui, sans-serif';
    ctx.letterSpacing = '2.4px';
    ctx.fillText('INSTITUTION OF MERIDIAN', 72, 96);
    ctx.letterSpacing = '0px';

    ctx.fillStyle = ink;
    ctx.font = '600 58px Fraunces, Georgia, serif';
    ctx.fillText(name, 72, 176);

    ctx.fillStyle = mute;
    ctx.font = '500 24px Inter, system-ui, sans-serif';
    ctx.fillText(rank.rank + ' · ' + M.S.xp + ' XP', 72, 218);

    ctx.strokeStyle = rule; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(72, 250); ctx.lineTo(430, 250); ctx.stroke();

    ctx.fillStyle = ink;
    ctx.font = '600 88px Fraunces, Georgia, serif';
    ctx.fillText(String(done.length), 72, 344);
    ctx.fillStyle = mute;
    ctx.font = '500 22px Inter, system-ui, sans-serif';
    ctx.fillText('of ' + M.CITIES.length + ' stops', 72 + ctx.measureText(String(done.length)).width + 74, 344);

    ctx.font = '500 21px Inter, system-ui, sans-serif';
    ctx.fillStyle = mute;
    wrap(ctx, 'Credit risk, taught as a journey through seven cities.', 72, 396, 380, 30);

    ctx.fillStyle = brand;
    ctx.font = '600 19px Inter, system-ui, sans-serif';
    ctx.fillText(M.siteUrl(), 72, H - 84);

    /* Right — the stamped page */
    ctx.strokeStyle = rule;
    ctx.beginPath(); ctx.moveTo(500, 76); ctx.lineTo(500, H - 76); ctx.stroke();

    ctx.fillStyle = mute;
    ctx.font = '600 14px Inter, system-ui, sans-serif';
    ctx.letterSpacing = '2px';
    ctx.textAlign = 'left';
    ctx.fillText('ENTRIES', 548, 96);
    ctx.letterSpacing = '0px';

    if (!done.length) {
      ctx.fillStyle = mute;
      ctx.font = '500 22px Inter, system-ui, sans-serif';
      ctx.fillText('No stamps yet.', 548, 160);
    } else {
      /* Four across, staggered — a real page is not a grid */
      var R = 60, cols = 4;
      done.slice(0, 8).forEach(function (c, i) {
        var col = i % cols, row = Math.floor(i / cols);
        var x = 548 + 4 + col * 142 + R + (row % 2 ? 22 : 0);
        var y = 176 + row * 168 + R * 0.4;
        drawStamp(ctx, c, M.S.done[c.id], x, y, R, brand);
      });
    }

    return cv;
  });
};

function wrap(ctx, text, x, y, maxW, lh) {
  var words = text.split(' '), line = '', n = 0;
  for (var i = 0; i < words.length; i++) {
    var test = line + words[i] + ' ';
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line.trim(), x, y + n * lh); line = words[i] + ' '; n++;
    } else line = test;
  }
  ctx.fillText(line.trim(), x, y + n * lh);
}

M.siteUrl = function () {
  if (M.SITE_URL) return M.SITE_URL;
  var o = location.origin;
  if (!o || o === 'null' || /^file:/.test(location.href)) return 'meridian.institute';
  return (o + location.pathname).replace(/^https?:\/\//, '').replace(/\/index\.html$/, '').replace(/\/$/, '');
};

/* ── Export ────────────────────────────────────────────────────────────
   Share sheet where the platform has one (that is how this actually
   reaches a feed on a phone), download everywhere else. Never both. */
M.shareAwards = function (btn) {
  if (!M.buildShareCard) return;
  var label = btn && btn.innerHTML;
  if (btn) { btn.disabled = true; btn.textContent = 'Drawing…'; }

  M.buildShareCard().then(function (cv) {
    cv.toBlob(function (blob) {
      if (btn) { btn.disabled = false; btn.innerHTML = label; }
      if (!blob) { M.toast && M.toast('Could not make the image'); return; }
      var file = null;
      try { file = new File([blob], 'meridian-passport.png', { type: 'image/png' }); } catch (e) {}

      if (file && navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
        navigator.share({
          files: [file],
          title: 'My Meridian passport',
          text: 'Seven cities of credit risk. ' + M.siteUrl()
        }).catch(function () {});
        return;
      }
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = 'meridian-passport.png';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      M.toast && M.toast('Saved meridian-passport.png');
    }, 'image/png');
  });
};

/* A live preview, so nobody posts a card they have not seen. */
M.previewShareCard = function (host) {
  if (!host) return;
  M.buildShareCard().then(function (cv) {
    host.innerHTML = '';
    cv.style.width = '100%'; cv.style.height = 'auto';
    cv.setAttribute('role', 'img');
    cv.setAttribute('aria-label', 'Shareable card showing your name, rank and entry stamps');
    host.appendChild(cv);
  });
};

})(window.M = window.M || {});
