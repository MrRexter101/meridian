/* MERIDIAN · app · router, events, sign-in */
(function(M){
'use strict';
var $=M.$, esc=M.esc, icon=M.icon;
var seenTour=false;
var route='dash', openCity=null;

function go(r,id){
  route=r; openCity=id||null;
  render();
  var v=$('#view');
  if(v){ v.scrollTop=0; window.scrollTo(0,0); v.focus({preventScroll:true}); }
  closeRail();
}

/* ───────── 9. RENDER + EVENTS ───────── */
function paintRail(){
  if(!M.user) return;
  var r=M.rankOf(M.S.xp);
  $('#nm').textContent=M.user.name;
  $('#rk').textContent=r.rank+' \u00b7 '+M.S.xp+' XP';
  $('#av').textContent=M.user.name.split(' ').map(function(w){return w[0]}).join('').slice(0,2).toUpperCase();
}
function render(){
  if(!M.user) return;
  var v=$('#view'); if(!v) return;
  v.innerHTML = (route==='city' ? M.views.city(openCity) : M.views[route]());
  if(route==='resources') v.insertAdjacentHTML('afterbegin', langPicker());
  openMap();

  // Navigation happens tens of times a day, so this stays under the
  // threshold of "did something just animate?" — 180ms, 4px.
  $('#app').setAttribute('data-route', route);   // lets the decal step back on reading routes
  v.classList.remove('view-enter'); void v.offsetWidth; v.classList.add('view-enter');

  // The tour arrives once. Replaying it on every visit reads as a twitch.
  if(route==='tour' && !seenTour){ var tl=$('.tour'); if(tl) tl.classList.add('stagger'); seenTour=true; }
  M.justLit=false;
  paintDecal(); paintNotesFab(); paintLang();

  paintRail();
  Array.prototype.forEach.call(document.querySelectorAll('.rail .navbtn[data-go]'),function(b){
    b.classList.toggle('sel', b.dataset.go===route || (route==='city'&&b.dataset.go==='tour'));
  });
  var nb=$('#noteBox'); if(nb) nb.value='';
}

document.addEventListener('click', function(e){
  var t=e.target.closest ? e.target.closest('[data-go],[data-city],[data-lang],[data-video],[data-jtab],[data-setkind],[data-filter],[data-delnote],[data-suggest],#askGo,#notesFab,#railNotes,#journalClose,#resetBtn,#langBtn,#vidClose,#ciBtn,#nextBtn,#submitChk,#saveNote,.opt,#themeBtn,#outBtn,#menuBtn,#scrim,#enterBtn,#shareBtn,#previewBtn,#reqSend,#copyPrompt,#adClose,#adScrim,#runFile,#fillTashi,#runEl,#runScore,[data-scf],[data-sharenote],[data-reqkind],[data-award]') : null;
  if(!t) return;

  if(t.id==='enterBtn'){ $('#login').scrollIntoView({behavior:'smooth'}); setTimeout(function(){var u=$('#u'); if(u)u.focus();},600); return; }
  if(t.id==='menuBtn'){ $('#rail').classList.add('open'); $('#scrim').classList.add('on'); return; }
  if(t.id==='notesFab' || t.id==='railNotes'){ closeRail(); openJournal(); return; }
  if(t.id==='journalClose'){ closeJournal(); return; }
  if(t.id==='resetBtn'){ askReset(); return; }
  if(t.id==='langBtn'){ closeRail(); go('resources'); return; }
  if(t.dataset && t.dataset.lang){ M.setLang(t.dataset.lang); paintLang(); render(); return; }
  if(t.dataset && t.dataset.video){ openVideo(t.dataset.video, t.dataset.vt); return; }
  if(t.id==='vidClose'){ closeVideo(); return; }
  if(t.dataset && t.dataset.jtab){ M.put('m.jtab', t.dataset.jtab); repaintJournal(t.dataset.jtab); return; }
  if(t.dataset && t.dataset.setkind){ M.put('m.notekind', t.dataset.setkind); repaintJournal('notes'); return; }
  if(t.dataset && t.dataset.filter){ M.put('m.notefilter', t.dataset.filter); repaintJournal('notes'); return; }
  /* Sharing one note with the trainer. One note, one tap, and it says so
     on the button before you press it — never a blanket setting, because
     a blanket setting is how the confidential one goes too. */
  if(t.dataset && t.dataset.sharenote !== undefined){
    var ni = Number(t.dataset.sharenote), nt = M.S.notes[ni];
    if(!nt || nt.shared) return;
    if(t.dataset.armed==='1'){
      nt.shared = true; M.save();
      M.queueSend({ type:'note', text:nt.t, kind:nt.k||'', city:nt.city||'' });
      M.toast('Sent to the trainer.');
      repaintJournal('notes');
      return;
    }
    t.dataset.armed='1'; t.textContent='Send this one?';
    setTimeout(function(){ if(t.dataset){ t.dataset.armed='0'; t.textContent='Share'; } }, 4000);
    return;
  }
  if(t.dataset && t.dataset.delnote !== undefined){
    M.S.notes.splice(Number(t.dataset.delnote), 1); M.save();
    repaintJournal('notes'); paintNotesFab(); return;
  }
  if(t.dataset && t.dataset.suggest){
    M.put('m.lastask', t.dataset.suggest); repaintJournal('ask'); return;
  }
  if(t.id==='askGo'){
    M.put('m.lastask', ($('#askBox').value||'').trim()); repaintJournal('ask');
    var b=$('#askBox'); if(b) b.focus();
    return;
  }
  if(t.id==='scrim'){ closeRail(); closeJournal(); return; }
  if(t.id==='themeBtn'){ M.cycleTheme(); return; }
  if(t.id==='outBtn'){ M.user=null; M.put('m.user',null); location.reload(); return; }
  if(t.dataset && t.dataset.go){
    go(t.dataset.go);
    /* Landing on Awards is not the same as being handed the card. Scroll to
       the passport and draw the preview, so the completion tap finishes the
       thought instead of dropping you at the top of a page. */
    if(t.dataset.share){
      setTimeout(function(){
        var host=$('#sharePreview'), btn=$('#previewBtn');
        var pp=$('.passport'); if(pp) pp.scrollIntoView({behavior:'smooth', block:'start'});
        if(host && host.hidden){ host.hidden=false; host.innerHTML='<p class="pp-hint">Drawing…</p>';
          if(btn) btn.textContent='Hide preview';
          M.previewShareCard(host); }
      }, 90);
    }
    return;
  }
  if(t.dataset && t.dataset.city){
    if(t.dataset.fromintro) hideIntro();
    if(journalOpen()) closeJournal();
    go('city', t.dataset.city); return;
  }
  if(t.id==='ciBtn'){ M.doCheckIn(); return; }
  if(t.dataset && t.dataset.reqkind){ M.put('m.reqkind', t.dataset.reqkind); render(); return; }
  /* Award detail. The surface grows out of the card you tapped — the
     origin is written per open from that card's own position, because a
     panel that appears from the middle of the screen has no relationship
     to the thing you touched. */
  if(t.dataset && t.dataset.award){
    var r = t.getBoundingClientRect();
    var wrap=$('#adWrap'), slot=$('#adSlot');
    slot.innerHTML = M.awardDetail(t.dataset.award);
    wrap.hidden = false;
    var card = slot.firstChild;
    if(card){
      /* transform-origin is measured from the element's OWN box, not from
         the viewport — so the trigger's screen position has to be converted
         into the card's local space after the card has been laid out.
         Setting raw viewport pixels puts the origin somewhere outside the
         card entirely and it swings in from the wrong direction. */
      var c = card.getBoundingClientRect();
      card.style.transformOrigin =
        (r.left + r.width/2 - c.left).toFixed(1) + 'px ' +
        (r.top + r.height/2 - c.top).toFixed(1) + 'px';
    }
    void wrap.offsetWidth;
    wrap.classList.add('on');
    lastAward = t;
    var cl = $('#adClose'); if(cl) cl.focus();
    return;
  }
  if(t.id==='adClose' || t.id==='adScrim'){ closeAward(); return; }
  /* ── The desk ─────────────────────────────────────────────────────── */
  if(t.id==='runFile'){
    var cols=[{},{},{}];
    document.querySelectorAll('[data-fk]').forEach(function(el){
      cols[+el.dataset.fy][el.dataset.fk] = el.value;
    });
    var out=$('#fileOut'); out.hidden=false; out.innerHTML = M.fileResult(M.runFile(cols));
    out.scrollIntoView({behavior:'smooth', block:'nearest'});
    return;
  }
  if(t.id==='fillTashi'){
    /* The case's own numbers, so anyone can check the tool against the
       answer key they were given in the room before trusting it with a
       live file. */
    var T=[{revenue:26,opprofit:7.8,interest:1.9,principal:2.4,netprofit:3.5,recv:2.1,pay:1.9,cash:2.2},
           {revenue:32,opprofit:8,interest:2.2,principal:2.6,netprofit:3.2,recv:3.6,pay:2.8,cash:1.4},
           {revenue:38,opprofit:7.6,interest:2.6,principal:2.8,netprofit:2.1,recv:6.8,pay:4.9,cash:0.6}];
    document.querySelectorAll('[data-fk]').forEach(function(el){
      el.value = T[+el.dataset.fy][el.dataset.fk];
    });
    return;
  }
  if(t.id==='runEl'){
    var e=$('#elOut'); e.hidden=false;
    e.innerHTML = M.elResult(M.expectedLoss($('#elPd').value, $('#elLgd').value, $('#elEad').value));
    return;
  }
  if(t.dataset && t.dataset.scf){
    var cur = M.get('m.sc', ['cash','collect','security','mgmt','sector','history']).slice();
    var i2 = cur.indexOf(t.dataset.scf);
    if(i2>=0) cur.splice(i2,1);
    else { if(cur.length>=6){ M.toast('Six is the limit, and the limit is the point.'); return; } cur.push(t.dataset.scf); }
    M.put('m.sc', cur); render();
    return;
  }
  if(t.id==='runScore'){
    var picks=[];
    document.querySelectorAll('[data-scw]').forEach(function(el){
      var k=el.dataset.scw, sEl=document.querySelector('[data-scs="'+k+'"]');
      picks.push({ k:k, weight:el.value, score:sEl?sEl.value:null });
    });
    var so=$('#scOut'); so.hidden=false; so.innerHTML = M.scoreResult(M.scoreCard(picks));
    return;
  }
  if(t.classList.contains('rc-opt')){
    var host=t.closest('.recall'); if(!host || host.dataset.done) return;
    host.dataset.done='1';
    var right = t.dataset.rcok==='1';
    M.recordRecall(host.dataset.rc, right);
    host.querySelectorAll('.rc-opt').forEach(function(b){
      b.classList.add(b.dataset.rcok==='1' ? 'is-right' : 'is-wrong');
      b.disabled = true;
    });
    host.insertAdjacentHTML('beforeend',
      '<p class="rc-verdict '+(right?'ok':'no')+'">'+
      (right ? 'Right. That one moves to the back of the queue.'
             : 'Not this time. It will come back four times sooner.')+'</p>');
    return;
  }
  if(t.id==='copyPrompt'){
    var txt = M.RESEARCH_SYSTEM || '';
    var done = function(){ t.innerHTML = icon('i-check',15,2.2)+'Copied'; setTimeout(function(){ t.innerHTML = icon('i-box',15,1.8)+'Copy'; }, 2200); };
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(txt).then(done, selectFallback);
    } else selectFallback();
    function selectFallback(){
      /* No clipboard permission (or an insecure origin): select it so one
         keystroke finishes the job, rather than failing silently. */
      var pre=$('#promptText'); if(!pre) return;
      var r=document.createRange(); r.selectNodeContents(pre);
      var sel=getSelection(); sel.removeAllRanges(); sel.addRange(r);
      M.toast('Selected — press Cmd/Ctrl+C');
    }
    return;
  }
  if(t.id==='reqSend'){
    var rb=$('#reqBox'), rt=(rb && rb.value||'').trim();
    if(rt.length<8){ M.toast('A sentence or two — enough to act on.'); rb && rb.focus(); return; }
    M.queueSend({ type:'request', kind:M.get('m.reqkind','idea'), text:rt.slice(0,4000) });
    rb.value=''; M.toast('Sent. Thank you — it lands in a real inbox.');
    return;
  }
  if(t.id==='shareBtn'){ M.shareAwards(t); return; }
  if(t.id==='previewBtn'){
    var host=$('#sharePreview');
    if(!host) return;
    if(!host.hidden){ host.hidden=true; host.innerHTML=''; t.textContent='Preview it first'; return; }
    host.hidden=false; t.textContent='Hide preview';
    host.innerHTML='<p class="pp-hint">Drawing…</p>';
    M.previewShareCard(host);
    return;
  }
  if(t.id==='nextBtn'){ for(var i=0;i<M.CITIES.length;i++) if(!M.S.done[M.CITIES[i].id]) return go('city',M.CITIES[i].id); return; }

  if(t.classList.contains('opt')){
    if(t.disabled) return;
    t.classList.toggle('pick'); return;
  }
  if(t.id==='submitChk'){ scoreCheck(); return; }
  if(t.id==='saveNote'){
    var box=$('#noteBox'), txt=box.value.trim();
    if(txt.length<12){ M.toast('Write a little more — be specific.'); box.focus(); return; }
    if(txt.length>2000) txt = txt.slice(0,2000);
    var city = route==='city' ? (M.CITIES.filter(function(c){return c.id===openCity})[0]||{}).city : null;
    M.S.notes.unshift({
      d: new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}),
      t: txt,
      k: M.get('m.notekind','assumption'),
      city: city
    });
    M.addXp(M.XP.note); M.checkAwards(); M.save();
    /* Deliberately NOT sent. Sharing is a separate, per-note act — see
       the `sharenote` handler below. */
    M.toast('Field note saved. It stays on this device.');
    $('#journalBody').innerHTML = M.journalBody('notes');   // stay in the journal
    paintNotesFab(); paintRail();
    return;
  }
});
/* ── Field notes drawer ────────────────────────────────────────────────
   A journal you pull open from anywhere, not a place you navigate to.
   Notes are the one thing people write mid-thought; making them a route
   meant losing your place to write one down. */
function openJournal(){
  var j=$('#journal');
  $('#journalBody').innerHTML = M.journalBody();
  j.classList.add('open'); j.setAttribute('aria-hidden','false');
  $('#scrim').classList.add('on');
  var box=$('#noteBox'); if(box) setTimeout(function(){ box.focus(); }, 260);
}
function closeJournal(){
  var j=$('#journal');
  j.classList.remove('open'); j.setAttribute('aria-hidden','true');
  if(!$('#rail').classList.contains('open')) $('#scrim').classList.remove('on');
}
function journalOpen(){ return $('#journal').classList.contains('open'); }
function paintNotesFab(){
  var fab=$('#notesFab'), c=$('#notesCount');
  if(!fab) return;
  fab.hidden = !M.user || !$('#app').classList.contains('on');   // app only, never the landing page
  var n = M.S && M.S.notes ? M.S.notes.length : 0;
  if(c){ c.hidden = n===0; c.textContent = n; }
}

/* Per-city decal. One palette; the motif carries the place. */
/* ── Open the map ──────────────────────────────────────────────────────
   Once per page load. It should feel like arriving somewhere, so it runs
   when you sign in and when you reload — but NOT on every route change,
   because paying two seconds to come back to the dashboard for the fifth
   time is how a nice animation becomes a tax. A plain variable, not
   storage: a new visit is a new opening.

   The class is removed when it finishes so the element is left in its
   resting state and nothing inherits an animation it did not ask for. */
/* ── The route, full screen ────────────────────────────────────────────
   Shown once per sign-in. It is a real surface — every place on it is a
   link into that city — so the time it holds you is time you can spend.

   Dismissal is scroll-driven because that is the gesture the gap between
   a map and a dashboard already suggests: the chart lifts and the desk is
   underneath it. But scroll is only ONE of four exits (button, Escape,
   any place, scroll), because an intro you cannot skip is a toll, and
   because wheel events do not exist on a touch device or a keyboard. */
var introOn = false, introP = 0, introRaf = 0;

function showIntro(){
  var el = $('#mapIntro');
  if(!el) return;
  el.innerHTML = M.mapIntro();
  el.hidden = false;
  document.body.classList.add('intro-locked');
  introOn = true; introP = 0;
  void el.offsetWidth;
  el.classList.add('on');
  /* Focus the first place, so a keyboard user lands somewhere useful and
     Tab walks the route. Escape still closes, and the hint says so. */
  var f = el.querySelector('.mi-stop.is-open');
  if(f && f.focus) f.focus();

  addEventListener('wheel', introWheel, { passive:false });
  addEventListener('touchmove', introTouch, { passive:false });
  addEventListener('touchstart', introTouchStart, { passive:true });
}

var touchY0 = 0;
function introTouchStart(e){ touchY0 = e.touches[0].clientY; }
function introTouch(e){
  if(!introOn) return;
  var dy = touchY0 - e.touches[0].clientY;
  if(dy > 0){ e.preventDefault(); advanceIntro(dy * 0.006); touchY0 = e.touches[0].clientY; }
}
function introWheel(e){
  if(!introOn) return;
  if(e.deltaY <= 0) return;              // scrolling up does nothing; there is nothing above
  e.preventDefault();
  advanceIntro(e.deltaY * 0.0016);
}

function advanceIntro(step){
  introP = Math.min(1, introP + step);
  if(!introRaf) introRaf = requestAnimationFrame(paintIntro);
  if(introP >= 1) hideIntro();
}
function paintIntro(){
  introRaf = 0;
  var el = $('#mapIntro'); if(!el) return;
  /* The chart lifts away and the dashboard is revealed underneath —
     transform and opacity only, so it composites on the GPU. */
  el.style.setProperty('--p', introP.toFixed(3));
}

/* ── The hand-off ──────────────────────────────────────────────────────
   The full-screen chart does not fade out and leave a dashboard behind
   it. It flies into the dashboard's own map and becomes it.

   A FLIP: measure where the big chart is, measure where the small one
   sits on the dashboard underneath, and transform the first onto the
   second. Because both are the same drawing at different sizes, the eye
   reads one object moving rather than two objects swapping — which is
   the whole point of doing it this way instead of a cross-fade.

   If the dashboard map is not there to fly to (the route is a city, say,
   because somebody tapped a place) it falls back to the plain lift. */
function hideIntro(){
  if(!introOn) return;
  introOn = false;
  var el = $('#mapIntro');
  removeEventListener('wheel', introWheel);
  removeEventListener('touchmove', introTouch);
  removeEventListener('touchstart', introTouchStart);
  document.body.classList.remove('intro-locked');

  var big = el.querySelector('.mi-map');
  var wrap = el.querySelector('.mi-mapwrap');
  var small = $('#view .roadmap svg');
  var flew = false;

  if(big && wrap && small && !prefersReducedMotion()){
    /* Measure the WRAPPER, not the chart. getBoundingClientRect returns
       the transformed box, and the chart is mid-unfold when this fires —
       measuring it gave 419px for a 1000px map and the FLIP flew outward
       instead of in. Clearing the transform first does not help either:
       the usual `void el.offsetWidth` reflow trick is a no-op on an SVG
       element, because offsetWidth is an HTMLElement property and is
       simply undefined there. The wrapper is a plain div, carries no
       transform, and is always the true layout box. */
    var a = wrap.getBoundingClientRect(), b = small.getBoundingClientRect();
    if(b.width > 8 && b.height > 8){
      /* One uniform scale, matched on WIDTH. The two charts are the same
         drawing at different viewBox heights (460 tall full-screen, 190
         on the dashboard), so matching both axes would squash the map to
         0.42 vertically while barely touching its width — the landmarks
         and the lettering visibly distort on the way. Matching width
         alone keeps the drawing rigid and lines the seven stops up with
         their destinations, which is the part the eye actually tracks. */
      var k = b.width / a.width;
      var dx = (b.left + b.width/2) - (a.left + a.width/2);
      var dy = (b.top + b.height/2) - (a.top + a.height/2);
      el.classList.remove('on');
      el.classList.add('flying');
      /* Chrome goes first and fast — the head and footer are not part of
         the object that is travelling, and carrying them along would give
         the trick away. */
      big.style.transition = 'transform 560ms cubic-bezier(.32,.72,0,1), opacity 200ms linear 380ms';
      big.style.transform = 'translate('+dx.toFixed(1)+'px,'+dy.toFixed(1)+'px) scale('+k.toFixed(4)+')';
      big.style.opacity = '0';
      flew = true;
    }
  }
  if(!flew){ el.classList.remove('on'); el.classList.add('leaving'); }

  setTimeout(function(){
    el.hidden = true;
    el.classList.remove('leaving','flying');
    el.style.removeProperty('--p'); el.innerHTML = '';
  }, flew ? 600 : 520);
}
function prefersReducedMotion(){ return matchMedia('(prefers-reduced-motion: reduce)').matches; }
M.hideIntro = hideIntro;

/* ── Re-render across the layout breakpoint ────────────────────────────
   The roadmap is built as a string at render time and chooses horizontal
   or vertical from innerWidth. Nothing re-ran it on resize, so turning a
   tablet from portrait to landscape left a vertical route on a wide
   screen (and the reverse on rotate back) until you navigated away and
   came back. Only re-render when the breakpoint is actually CROSSED —
   re-rendering on every resize event would fight the address bar on
   mobile and throw away scroll position for nothing. */
var lastBand = null;
function layoutBand(){ return innerWidth < 760 ? 'xs' : (innerWidth < 900 ? 'sm' : 'lg'); }
lastBand = layoutBand();
addEventListener('resize', function(){
  var b = layoutBand();
  if(b === lastBand) return;
  lastBand = b;
  if(M.user && !introOn) render();
  else if(introOn){
    var el = $('#mapIntro');
    if(el && !el.hidden){ el.innerHTML = M.mapIntro(); }
  }
});
M.introOpen = function(){ return introOn; };

var mapOpened = false;      // per page load, deliberately not persisted
var lastAward = null;
function closeAward(){
  var wrap=$('#adWrap'); if(!wrap || wrap.hidden) return;
  wrap.classList.remove('on');
  /* Exits along the path it entered by — Apple's spatial-consistency rule.
     The element is hidden only after the transition so the shrink is
     actually visible rather than being cut off at frame one. */
  setTimeout(function(){ wrap.hidden = true; $('#adSlot').innerHTML=''; }, 260);
  if(lastAward && document.contains(lastAward)) lastAward.focus();
  lastAward = null;
}
M.closeAward = closeAward;

function openMap(){
  var el = $('[data-map]');
  if(!el) return;
  /* While the full-screen chart is up, the dashboard map is its landing
     target, not something to animate on its own — running both would
     mean two maps opening at once, one of them behind a scrim. */
  if(introOn) return;
  if(mapOpened) return;
  mapOpened = true;
  el.classList.add('is-opening');
  /* Removed once it has run so the element is left in its resting state
     and nothing downstream inherits an animation it did not ask for. */
  setTimeout(function(){ el.classList.remove('is-opening'); }, 3400);
}

function paintDecal(){
  var d=$('#decal'); if(!d) return;
  var id = route==='city' ? openCity : (function(){
    for(var i=0;i<M.CITIES.length;i++) if(!M.S.done[M.CITIES[i].id]) return M.CITIES[i].id;
    return M.CITIES[M.CITIES.length-1].id;
  })();
  d.setAttribute('data-city', id || '');
}

/* Reset. Destructive, so it asks — and it asks in place, not in a modal. */
function askReset(){
  var b=$('#resetBtn');
  if(b.dataset.armed==='1'){ doReset(); return; }
  b.dataset.armed='1';
  b.innerHTML = icon('i-reset',19)+'Tap again to erase everything';
  M.toast('This clears your XP, streak, awards and notes.');
  clearTimeout(b._t);
  b._t = setTimeout(function(){
    b.dataset.armed='0';
    b.innerHTML = icon('i-reset',19)+'Reset my progress';
  }, 5000);
}
function doReset(){
  var keepName = M.user ? M.user.name : null;
  M.S = M.blank();
  if(keepName){ M.S.name = keepName; M.S.joined = new Date().toISOString(); }
  M.fresh = []; M.justLit = false;
  M.save();
  var b=$('#resetBtn'); b.dataset.armed='0'; b.innerHTML = icon('i-reset',19)+'Reset my progress';
  seenTour = false;
  M.toast('Progress cleared. The tour starts again at Thimphu.');
  go('dash');
}

/* ── Language ──────────────────────────────────────────────────────────
   Chrome switches; lesson content does not. Saying so plainly is better
   than shipping a machine translation of "significant increase in credit
   risk" to people who will act on it. */
function paintLang(){
  var meta = M.langMeta();
  var lbl = $('#langLbl'); if(lbl) lbl.textContent = meta.native;
  document.documentElement.setAttribute('lang', meta.code);
  Array.prototype.forEach.call(document.querySelectorAll('[data-i18n]'), function(el){
    el.textContent = M.t(el.getAttribute('data-i18n'));
  });
}
function langPicker(){
  return '<div class="panel pad" style="margin-bottom:18px">'+
    '<span class="k" style="font-size:.76rem;color:var(--text-3);font-weight:600">Language</span>'+
    '<div class="langrow">'+M.LANGS.map(function(l){
      return '<button class="langchip'+(l.code===M.lang()?' on':'')+'" data-lang="'+l.code+'">'+
        esc(l.native)+'</button>';
    }).join('')+'</div>'+
    '<p class="langnote">'+esc(M.t('langNotice'))+
    (M.langMeta().reviewed ? '' : ' <span class="warn">This translation has not yet been checked by a native speaker.</span>')+
    '</p></div>';
}

/* ── Video ── nothing loads from YouTube until someone asks for it ── */
function openVideo(id, title){
  var dlg=$('#vidModal');
  $('#vidTitle').textContent = title || '';
  $('#vidHolder').innerHTML =
    '<iframe src="https://www.youtube-nocookie.com/embed/'+encodeURIComponent(id)+'?rel=0&modestbranding=1&autoplay=1" '+
    'title="'+esc(title||'Video')+'" allow="accelerometer; autoplay; encrypted-media; picture-in-picture" '+
    'referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';
  if(dlg.showModal) dlg.showModal(); else dlg.setAttribute('open','');
}
function closeVideo(){
  var dlg=$('#vidModal');
  $('#vidHolder').innerHTML='';           // stop playback, drop the connection
  if(dlg.close) dlg.close(); else dlg.removeAttribute('open');
}

function repaintJournal(tab){ $('#journalBody').innerHTML = M.journalBody(tab); }

function closeRail(){ var r=$('#rail'); if(r) r.classList.remove('open'); var s=$('#scrim'); if(s) s.classList.remove('on'); }

function scoreCheck(){
  var wrap=$('#chk'); if(!wrap) return;
  var id=wrap.dataset.city, c=null;
  for(var k=0;k<M.CITIES.length;k++) if(M.CITIES[k].id===id) c=M.CITIES[k];
  var btns=Array.prototype.slice.call(document.querySelectorAll('#opts .opt'));
  var right=0, wrong=0, missed=0;

  btns.forEach(function(b,i){
    var o=c.check.opts[i], picked=b.classList.contains('pick');
    b.disabled=true; b.classList.remove('pick');
    if(picked && o.ok){ right++; b.classList.add('right'); }
    else if(picked && !o.ok){ wrong++; b.classList.add('wrong'); }
    else if(!picked && o.ok){ missed++; b.classList.add('missed'); }
    b.insertAdjacentHTML('beforeend','<span class="why">'+
      (picked&&o.ok?'Correct. ':picked&&!o.ok?'Wrong flag. ':!picked&&o.ok?'<strong>Missed — −2.</strong> ':'Correctly left. ')+o.why+'</span>');
  });

  var score = right - wrong - 2*missed;
  var first = !M.S.done[id];
  /* Store the day, not a boolean. A non-empty string is still truthy, so
     every `if(M.S.done[id])` in the app keeps working and old saves that
     hold `true` simply show a stamp without a date. The passport needs to
     say when you were there — that is the whole point of a stamp. */
  if(first){ M.S.done[id]=M.dayKey(); M.S.scores[id]=score; M.addXp(M.XP.city + Math.max(0,right)*M.XP.correct); M.checkAwards(); M.save(); paintRail(); }

  var pos = score>0;
  $('#submitChk').style.display='none';
  $('#chkOut').innerHTML='<div class="verdict '+(pos?'pos':'neg')+'">'+
    '<span class="score num">'+(score>0?'+':'')+score+'</span>'+
    '<div class="breakdown">'+
      '<span class="chip g">'+right+' correct <span class="num">+'+right+'</span></span>'+
      '<span class="chip'+(wrong?' r':'')+'">'+wrong+' wrong <span class="num">−'+wrong+'</span></span>'+
      '<span class="chip'+(missed?' r':'')+'">'+missed+' missed <span class="num">−'+(missed*2)+'</span></span>'+
    '</div>'+
    (missed? '<p>You did not get anything wrong. You did not look at '+missed+' of them — and that is why it costs double.</p>'
           : wrong? '<p>Flagging something that is not there costs one. Failing to look costs two. You paid the cheaper price.</p>'
           : '<p>Nothing missed and nothing over-flagged. That is the only winning strategy this rule allows.</p>')+
    (first? '<p style="margin-top:9px;color:var(--text-3);font-size:.85rem">'+esc(c.city)+' complete · <span class="num">+'+(M.XP.city+right*M.XP.correct)+'</span> XP</p>' : '')+
    '</div>'+
    '<div style="display:flex;gap:10px;margin-top:15px;flex-wrap:wrap">'+
      '<button class="btn acc" data-go="tour">Back to the tour</button>'+
      (nextOf(id)? '<button class="btn" data-city="'+nextOf(id)+'">Next city '+icon('i-arrow',14,2)+'</button>':'')+
    '</div>';
  $('#chkOut').scrollIntoView({behavior:'smooth',block:'nearest'});
}
function nextOf(id){ for(var i=0;i<M.CITIES.length-1;i++) if(M.CITIES[i].id===id) return M.CITIES[i+1].id; return null; }


/* ───────── 10. SIGN IN — name first, code second ───────── */
/* ── Live roster ───────────────────────────────────────────────────────
   Codes come from a published Google Sheet when one is configured, and
   fall back to the baked-in list when it is missing, stale or offline.
   Fetched once per session, cached, and never allowed to block sign-in. */
var liveRoster = null;
var rosterState = { source:'fallback', count:M.ROSTER.length, why:'not checked yet' };

function parseCsv(text){
  var rows = [], row = [], cell = '', q = false;
  for(var i=0;i<text.length;i++){
    var ch = text[i];
    if(q){
      if(ch === '"'){ if(text[i+1] === '"'){ cell += '"'; i++; } else q = false; }
      else cell += ch;
    } else if(ch === '"') q = true;
    else if(ch === ','){ row.push(cell); cell = ''; }
    else if(ch === '\n'){ row.push(cell); rows.push(row); row = []; cell = ''; }
    else if(ch !== '\r') cell += ch;
  }
  if(cell.length || row.length){ row.push(cell); rows.push(row); }
  return rows;
}

function loadRoster(){
  if(!M.ROSTER_CSV){ rosterState = { source:'fallback', count:M.ROSTER.length, why:'no sheet URL set' }; return Promise.resolve(null); }
  return fetch(M.ROSTER_CSV, { cache:'no-store' })
    .then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); return r.text(); })
    .then(function(txt){
      var rows = parseCsv(txt);
      if(rows.length < 2) throw new Error('empty sheet');
      var head = rows[0].map(function(h){ return String(h).trim().toLowerCase(); });
      var iCode = head.indexOf('code'), iRole = head.indexOf('role');
      var iSeat = head.indexOf('seat'), iActive = head.indexOf('active');
      if(iCode < 0) throw new Error('no Code column');
      var out = [];
      for(var r2=1;r2<rows.length;r2++){
        var cells = rows[r2];
        var code = (cells[iCode]||'').trim();
        if(!code) continue;
        if(iActive >= 0){
          var act = (cells[iActive]||'').trim().toLowerCase();
          if(act === 'false' || act === 'no' || act === '0') continue;
        }
        out.push({
          code: code,
          role: (iRole >= 0 ? (cells[iRole]||'').trim().toLowerCase() : '') || 'participant',
          seat: iSeat >= 0 ? (cells[iSeat]||'').trim() : null
        });
      }
      if(!out.length) throw new Error('no active codes');
      liveRoster = out;
      rosterState = { source:'live', count:out.length, why:null, at:new Date() };
      return out;
    })
    .catch(function(e){
      // Never let a sheet problem lock the room out.
      liveRoster = null;
      rosterState = { source:'fallback', count:M.ROSTER.length, why:String(e && e.message || e) };
      return null;
    });
}

/* Everything that resolves a code goes through here. */
M.roster = function(){ return liveRoster || M.ROSTER; };
M.rosterStatus = function(){ return rosterState; };

function normalise(c){ return String(c||'').toUpperCase().replace(/[^A-Z0-9]/g,''); }

/* A roster row matches either by plain code or by digest. Only the admin
   seat uses the digest form — see the note in config.js for why that one
   and not the others. */
function rosterMatch(row, code){
  if(row.code) return normalise(row.code) === code;
  if(row.hash) return M.sha256(code) === row.hash;
  return false;
}

$('#loginForm').addEventListener('submit', function(e){
  e.preventDefault();
  var name = $('#nameIn').value.trim().replace(/\s+/g,' ');
  var code = normalise($('#codeIn').value);
  var box  = $('#loginErr');
  function fail(msg, focus){
    box.hidden=false; box.className='login-err'; box.textContent=msg;
    if(focus) focus.focus();
  }
  if(name.length < 2)      return fail('Enter your name — it is how your progress is recorded.', $('#nameIn'));
  if(!/\s/.test(name))     return fail('Please give your full name, not just a first name.', $('#nameIn'));
  if(!code)                return fail('Enter the access code from your handout.', $('#codeIn'));

  var found=null;
  var roster = M.roster();
  for(var i=0;i<roster.length;i++) if(rosterMatch(roster[i], code)) found=roster[i];
  if(!found){ $('#codeIn').value=''; return fail('That code was not recognised. Codes look like XXXX-XXXX and use no letter O, I, S or B.', $('#codeIn')); }

  box.hidden=true;
  M.user = {
    /* A hashed row has no plain code to store. The typed code is the
       identity in that case — it is what the storage key and every later
       revalidation are keyed on. */
    u:    found.code ? normalise(found.code) : code,
    code: found.code || code,
    name: name,
    role: found.role || 'participant',
    seat: found.seat || null
  };
  M.put('m.user', M.user);
  M.load();

  // First time this code has been claimed on this device — record the pairing.
  if(!M.S.joined){
    M.S.joined = new Date().toISOString();
    M.S.name   = name;
    M.save();
    M.queueSend({ type:'join', role:M.user.role, seat:M.user.seat });
  } else if(M.S.name !== name){
    // Same code, different name. Keep the newest and log the change.
    M.S.name = name; M.save();
    M.queueSend({ type:'rename', role:M.user.role, seat:M.user.seat });
  }
  boot();
});

/* A stored session is untrusted input: it can be edited in devtools. Re-check
   the code against the roster on every boot so a tampered role does not stick.
   This is hygiene, not security — the whole gate is client-side by design. */
function revalidate(){
  if(!M.user) return false;
  var code = normalise(M.user.code || M.user.u);
  var roster = M.roster();
  for(var i=0;i<roster.length;i++){
    if(rosterMatch(roster[i], code)){
      M.user.role = roster[i].role || 'participant';   // role comes from the roster, never from storage
      M.user.seat = roster[i].seat || null;
      M.user.code = roster[i].code || code;
      M.user.u    = code;
      M.user.name = String(M.user.name||'').slice(0,80);
      M.put('m.user', M.user);
      return true;
    }
  }
  M.user=null; M.put('m.user',null);                      // code was revoked or edited
  return false;
}

function boot(){
  document.body.style.overflow='';
  $('#arrival').style.display='none';
  $('#login').style.display='none';
  $('#app').classList.add('on');
  var nav=$('#navCohort');
  if(nav) nav.hidden = !(M.user && M.user.role==='admin');
  paintLang();
  route='dash'; render();
  M.flush();
  /* The map shows either way. Reduced motion changes how it arrives, not
     whether it exists — the route is information, not decoration. */
  showIntro();
  // Re-test at fire time — the user may well have checked in during the delay.
  setTimeout(function(){ if(!M.checkedInToday()) M.toast('Check in to start your streak.'); }, 1400);
}



document.addEventListener('keydown', function(e){
  if(e.key==='Enter' && e.target && e.target.id==='askBox'){
    e.preventDefault();
    M.put('m.lastask', (e.target.value||'').trim());
    repaintJournal('ask');
    var b=$('#askBox'); if(b){ b.focus(); b.setSelectionRange(b.value.length,b.value.length); }
  }
});

addEventListener('keydown', function(e){
  if(e.key==='Escape'){ if(introOn) hideIntro(); else if(!$('#adWrap').hidden) closeAward(); else if($('#vidModal').open) closeVideo(); else if(journalOpen()) closeJournal(); else closeRail(); }
});

M.loadRoster=loadRoster; M.openJournal=openJournal; M.revalidate=revalidate; M.render=render; M.go=go; M.paintRail=paintRail; M.boot=boot; M.closeRail=closeRail;

})(window.M = window.M || {});
