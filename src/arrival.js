/* MERIDIAN · arrival — the film, scrubbed by scroll */
(function(M){
'use strict';
var $=M.$;

/* The hero is a pre-rendered film (studio/src/Arrival.tsx, rendered by
   Remotion). Scroll drives currentTime and nothing else. Everything the
   canvas engine used to compute per frame is baked into the frames, so
   the page just seeks. */

var stage = $('#arrival');
if(!stage) return;

var target=0, smooth=0, prev=-1, settled=false, visible=true;
var duration=0, seeking=false, painted=false, pending=null;

var film   = $('#film');
var poster = $('#filmPoster');

/* Portrait gets its own native 9:16 render, not a centre-crop of the
   landscape film — a 16:9 clip on a tall phone shows only its middle. */
var portrait = matchMedia('(max-aspect-ratio: 21/20)');
function pickSource(){
  var p = portrait.matches;
  var want = p ? 'assets/video/arrival-portrait.mp4?v=78' : 'assets/video/arrival.mp4?v=78';
  var wantPoster = p ? 'assets/img/arrival-poster-portrait.jpg' : 'assets/img/arrival-poster.jpg';
  if(film && film.getAttribute('src') !== want){
    film.setAttribute('src', want);
    duration = 0; painted = false;
    if(poster){ poster.setAttribute('src', wantPoster); poster.style.opacity='1'; }
    try { film.load(); } catch(e){}
  }
}
if(portrait.addEventListener) portrait.addEventListener('change', pickSource);
var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;


var cl    = function(v,a,b){ return v<a?a:v>b?b:v; };
var sstep = function(e0,e1,x){ var t=cl((x-e0)/(e1-e0),0,1); return t*t*(3-2*t); };

/* ── Seek coalescing ───────────────────────────────────────────────────
   Never queue a seek while the decoder is still working on the last one.
   Without this a fast flick piles up requests and the film freezes. */
function seek(t){
  if(!duration) return;
  var want = cl(t,0,1) * (duration - 0.03);
  if(seeking){ pending = want; return; }
  seeking = true;
  try { film.currentTime = want; } catch(e){ seeking = false; }
}
function onSeeked(){
  seeking = false;
  if(!painted){ painted = true; if(poster) poster.style.opacity = '0'; }
  if(pending !== null){ var n = pending; pending = null; seeking = true;
    try { film.currentTime = n; } catch(e){ seeking = false; } }
}

function copy(t){
  var a=$('#copyA'), b=$('#copyB'), cue=$('#heroCue');
  if(a){ var oa=1-sstep(0.04,0.19,t);
    a.style.opacity=oa; a.style.transform='translateY('+(-40*(1-oa))+'px)';
    a.style.pointerEvents=oa>0.5?'auto':'none'; }
  if(b){ var ob=sstep(0.90,0.995,t);
    b.style.opacity=ob; b.style.transform='translateY('+(20*(1-ob))+'px)';
    b.style.pointerEvents=ob>0.5?'auto':'none'; }
  if(cue) cue.style.opacity=(1-sstep(0.01,0.10,t))*0.9;
}

function tick(){
  requestAnimationFrame(tick);
  if(!visible) return;
  smooth += (target-smooth) * (reduced?1:0.24);
  if(Math.abs(target-smooth)<0.0004) smooth=target;   // land it, or the early-out never fires
  var moving = Math.abs(smooth-prev)>0.00025;
  if(!moving && settled) return;                      // decoder goes quiet
  settled=!moving; prev=smooth;
  seek(smooth); copy(smooth);
}

function onScroll(){
  if(stage.style.display==='none') return;
  var span = stage.offsetHeight - innerHeight;
  target = span>0 ? cl(-stage.getBoundingClientRect().top/span,0,1) : 1;
}

if(film){
  pickSource();
  film.addEventListener('loadedmetadata', function(){
    duration = film.duration || 0;
    onScroll(); seek(smooth);
  });
  film.addEventListener('seeked', onSeeked);
  /* iOS will not paint a seeked frame on a video that has never played,
     so prime it once on the first touch and immediately pause. */
  var primed=false;
  function prime(){
    if(primed) return; primed=true;
    var pr=film.play();
    if(pr && pr.then) pr.then(function(){ film.pause(); }).catch(function(){});
    else { try{ film.pause(); }catch(e){} }
  }
  ['touchstart','pointerdown','wheel','keydown'].forEach(function(ev){
    addEventListener(ev, prime, {once:true, passive:true});
  });
}

new IntersectionObserver(function(e){ visible = e[0]?e[0].isIntersecting:true; }).observe(stage);
addEventListener('scroll', onScroll, {passive:true});
addEventListener('resize', onScroll);

if(reduced){
  target=1; smooth=1;
  if(film) film.style.display='none';
  if(poster){ poster.src = poster.dataset.end || poster.src; poster.style.opacity='1'; }
}

M.repaint = function(){ prev=-1; settled=false; };

onScroll(); tick(); copy(smooth);

/* The stored theme has to be applied before anything paints — dropping this
   when the hero became a film meant the toggle silently did nothing on load. */
M.applyTheme();

/* Pull the live roster in the background. Sign-in never waits on it —
   if the sheet is slow, missing or offline, the baked-in list answers. */
if(M.loadRoster) M.loadRoster();

if(M.user && M.revalidate()){ M.load(); M.boot(); } else { M.load(); }

})(window.M = window.M || {});
