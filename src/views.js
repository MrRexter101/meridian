/* MERIDIAN · views */
(function(M){
'use strict';
var $=M.$, esc=M.esc, icon=M.icon;


/* ── The roadmap ───────────────────────────────────────────────────────
   Seven stops on one continuous route. The travelled portion is drawn
   in brand; the road ahead stays dashed and quiet. Node states are
   locked → available → complete, and locked is desaturated through the
   same lighting model rather than greyed out.                          */
/* ── Footprints ────────────────────────────────────────────────────────
   The Marauder's Map's one irreplaceable idea: the map shows you where
   somebody has actually walked. So these are not decoration laid along
   the route — they are sampled from the same bezier the road is drawn
   from, and they stop exactly where the traveller has got to.

   Sampled by walking t densely and accumulating real distance, because
   even spacing in t is not even spacing on the page: a curve's parameter
   moves fastest through its own bends, and prints spaced by t bunch up on
   every corner. Each print is rotated to the tangent and offset
   alternately either side of the centreline, which is what makes a line
   of ovals read as somebody walking rather than as a dotted line. */
function bez(p0, p1, p2, p3, t){
  var u = 1-t, a = u*u*u, b = 3*u*u*t, c = 3*u*t*t, d = t*t*t;
  return { x: a*p0.x + b*p1.x + c*p2.x + d*p3.x,
           y: a*p0.y + b*p1.y + c*p2.y + d*p3.y };
}

function footprints(pts, small, frac){
  if(pts.length < 2) return '';
  var STEP = 27;                      // px between prints — a stride, not a dot
  var segs = [];
  for(var i=0;i<pts.length-1;i++){
    var A=pts[i], B=pts[i+1], c1, c2;
    if(small){ var my=(A.y+B.y)/2; c1={x:A.x,y:my}; c2={x:B.x,y:my}; }
    else     { var mx=(A.x+B.x)/2; c1={x:mx,y:A.y}; c2={x:mx,y:B.y}; }
    segs.push([A,c1,c2,B]);
  }

  /* Walk the whole route once, collecting a point every STEP of real
     distance. */
  var walk = [], acc = 0, prev = null;
  for(var s=0;s<segs.length;s++){
    var g = segs[s];
    for(var k=0;k<=140;k++){
      var p = bez(g[0],g[1],g[2],g[3], k/140);
      if(prev){
        var d = Math.hypot(p.x-prev.x, p.y-prev.y);
        acc += d;
        if(acc >= STEP){
          acc = 0;
          walk.push({ x:p.x, y:p.y, a:Math.atan2(p.y-prev.y, p.x-prev.x) });
        }
      }
      prev = p;
    }
  }

  /* Only as far as they have actually walked. */
  var upto = Math.round(walk.length * Math.max(0, Math.min(1, frac)));
  if(upto < 1) return '';

  return '<g class="steps" aria-hidden="true">'+
    walk.slice(0, upto).map(function(w, i){
      var side = (i % 2 ? 1 : -1) * 4.4;          // left foot, right foot
      var nx = Math.cos(w.a + Math.PI/2) * side;
      var ny = Math.sin(w.a + Math.PI/2) * side;
      var deg = w.a * 180 / Math.PI + 90;
      return '<g class="step" style="--s:'+i+'" transform="translate('+
        (w.x+nx).toFixed(1)+' '+(w.y+ny).toFixed(1)+') rotate('+deg.toFixed(1)+')">'+
        '<ellipse rx="2.5" ry="4.1"/>'+
        '<ellipse class="toe" cx="0" cy="-4.6" rx="1.9" ry="1.5"/>'+
      '</g>';
    }).join('')+'</g>';
}

function roadmap(compact){
  var n = M.CITIES.length;
  var done = M.unlockedCount();
  var small = (typeof innerWidth==='number') && innerWidth < 900;
  var pts, W, H, d, labelAnchor, labelDx, labelDy, terrTop = 0, terrH = 0;

  if(small){
    /* Vertical on a phone. Seven names cannot sit side by side in 343px —
       they collide at any size you can actually read. No horizon here
       either: a skyline read top-to-bottom is not a skyline. */
    W = 380; H = 60 + n*84;
    pts = M.CITIES.map(function(c,i){
      var t = i/(n-1);
      return { x: 58 + Math.sin(t*Math.PI*1.6)*22, y: 52 + i*84, c:c, i:i };
    });
    d = 'M'+pts[0].x+' '+pts[0].y;
    for(var i=0;i<pts.length-1;i++){
      var a=pts[i], b=pts[i+1], my=(a.y+b.y)/2;
      d += ' C'+a.x+' '+my+' '+b.x+' '+my+' '+b.x+' '+b.y;
    }
    labelAnchor='start'; labelDx=52; labelDy=6;
  } else {
    W = 1000; H = compact ? 216 : 272;
    terrH = compact ? 58 : 76; terrTop = H - terrH;
    var pad=62, span=W-pad*2, amp = compact ? 28 : 42, midY = compact ? 78 : 94;
    pts = M.CITIES.map(function(c,i){
      var t=i/(n-1);
      return { x: pad + span*t, y: midY + Math.sin(t*Math.PI*1.75 + 0.5)*amp, c:c, i:i };
    });
    d = 'M'+pts[0].x+' '+pts[0].y;
    for(var j=0;j<pts.length-1;j++){
      var p1=pts[j], p2=pts[j+1], mx=(p1.x+p2.x)/2;
      d += ' C'+mx+' '+p1.y+' '+mx+' '+p2.y+' '+p2.x+' '+p2.y;
    }
    labelAnchor='middle'; labelDx=0; labelDy=38;
  }

  var frac = n>1 ? Math.min(1, done/(n-1)) : 0;   // 7 done over 6 gaps overshoots
  var here = Math.min(done, n-1);                 // the stop you are standing on

  /* ── The horizon ──────────────────────────────────────────────────────
     Seven slices of country laid end to end under the road, each the
     place it belongs to. Travelled ground is lit; the road ahead is only
     suggested, so the landscape resolves as you earn it. */
  var terrain = '';
  if(!small){
    terrain = '<g class="terrain" aria-hidden="true">' +
      M.CITIES.map(function(c,i){
        var sw = W/n, sx = sw/100, sy = terrH/40;
        var state = i<done ? 'is-done' : (i===here ? 'is-here' : 'is-ahead');
        return '<path class="terr '+state+'" transform="translate('+(i*sw).toFixed(1)+' '+terrTop+') scale('+sx.toFixed(4)+' '+sy.toFixed(4)+')" d="'+M.terrainPath(c.id)+'"/>';
      }).join('') +
      '<path class="terr-base" d="M0 '+H+' H'+W+'"/>' +
      '</g>';
  }

  var nodes = pts.map(function(p){
    var isDone = !!M.S.done[p.c.id];
    var open   = M.isOpen(p.i);
    var next   = open && !isDone;
    var cls = 'stop-node'+(isDone?' is-done':'')+(open?' is-open':'')+(next?' is-next':'');
    /* The landmark, not a numeral. A person who has been to Zurich
       recognises the Grossmünster faster than they read a "4". */
    var g = M.LANDMARKS[p.c.id] || '';
    var gs = 21/24;
    var glyph = '<g class="node-mark" transform="translate('+(p.x-10.5).toFixed(1)+' '+(p.y-10.5).toFixed(1)+') scale('+gs.toFixed(4)+')">'+g+'</g>';
    var badge = isDone
      ? '<g class="node-badge"><circle cx="'+(p.x+13)+'" cy="'+(p.y-13)+'" r="7.4"/>'+
        '<path class="node-tick" d="M'+(p.x+9.6)+' '+(p.y-13)+' l2.4 2.4 l4.6 -5"/></g>'
      : '';
    return '<g class="'+cls+'" style="--i:'+p.i+'" '+(open?'data-city="'+p.c.id+'"':'aria-disabled="true"')+
      ' role="button" tabindex="'+(open?'0':'-1')+'"'+
      ' aria-label="Stop '+(p.i+1)+', '+esc(p.c.city)+(isDone?', complete':open?', available':', locked')+'">'+
      '<circle class="node-hit" cx="'+p.x+'" cy="'+p.y+'" r="30"/>'+
      '<circle class="node-pulse" cx="'+p.x+'" cy="'+p.y+'" r="18"/>'+
      '<circle class="node-ring" cx="'+p.x+'" cy="'+p.y+'" r="18"/>'+
      glyph + badge +
      '<text class="node-label" text-anchor="'+labelAnchor+'" x="'+(p.x+labelDx)+'" y="'+(p.y+labelDy)+'">'+esc(p.c.city)+'</text>'+
      '</g>';
  }).join('');

  var at = pts[here];
  var hereName = M.CITIES[here] ? M.CITIES[here].city : '';

  /* Paper-map furniture. A route on a blank field is a diagram; a compass,
     a scale bar and four fold creases are what make the eye read it as a
     map that was folded in somebody's pocket. All decorative, all
     aria-hidden — none of it is information. */
  var furniture = '';
  if(!small){
    furniture =
      '<g class="mapfurn" aria-hidden="true">'+
        '<g class="creases">'+[0.25,0.5,0.75].map(function(f){
          return '<line x1="'+(W*f)+'" y1="0" x2="'+(W*f)+'" y2="'+H+'"/>';
        }).join('')+'<line x1="0" y1="'+(H*0.5)+'" x2="'+W+'" y2="'+(H*0.5)+'"/></g>'+
        /* Bottom-right, over the terrain — which is where a compass belongs on
           a real map anyway. Both top corners are taken: the route ends at the
           top right, and the traveller marker rides 34px above whichever node
           you are standing on, which at stop one is the top left. */
        '<g class="compass" transform="translate('+(W-46)+' '+(H-34)+')">'+
          '<circle r="19"/><circle r="13.5" class="cring"/>'+
          '<path class="cn" d="M0 -15 L4.6 0 L0 4 L-4.6 0 Z"/>'+
          '<path class="cs" d="M0 15 L4.6 0 L0 -4 L-4.6 0 Z"/>'+
          '<text y="-22">N</text>'+
        '</g>'+
        '<g class="scalebar" transform="translate(44 '+(H-24)+')">'+
          '<line x1="0" y1="0" x2="96" y2="0"/>'+
          '<line x1="0" y1="-4" x2="0" y2="4"/>'+
          '<line x1="48" y1="-3" x2="48" y2="3"/>'+
          '<line x1="96" y1="-4" x2="96" y2="4"/>'+
          '<text x="48" y="15">seven stops</text>'+
        '</g>'+
      '</g>';
  }

  /* ── Parchment ────────────────────────────────────────────────────────
     Aged paper, made rather than photographed: turbulence for the fibre, a
     warm wash over it, and darkened edges where a folded map wears first.
     Kept inside the SVG so it scales with the viewBox and needs no bitmap —
     this whole site still has to load from a file on a laptop. */
  var paper =
    '<defs>'+
      '<filter id="parch" x="0" y="0" width="100%" height="100%">'+
        '<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" seed="7" result="f"/>'+
        '<feColorMatrix in="f" type="saturate" values="0" result="fg"/>'+
        '<feComponentTransfer in="fg" result="fc"><feFuncA type="linear" slope="0.5"/></feComponentTransfer>'+
        '<feComposite in="fc" in2="SourceGraphic" operator="in"/>'+
      '</filter>'+
      '<radialGradient id="wear" cx="50%" cy="50%" r="72%">'+
        '<stop offset="0%" stop-color="#000" stop-opacity="0"/>'+
        '<stop offset="62%" stop-color="#000" stop-opacity="0"/>'+
        '<stop offset="100%" stop-color="#5A4A2E" stop-opacity="0.30"/>'+
      '</radialGradient>'+
      '<filter id="ink" x="-8%" y="-30%" width="116%" height="160%">'+
        '<feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="3" result="n"/>'+
        '<feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" xChannelSelector="R" yChannelSelector="G"/>'+
      '</filter>'+
    '</defs>'+
    '<g class="parchment" aria-hidden="true">'+
      '<rect x="0" y="0" width="'+W+'" height="'+H+'" rx="6" class="pg-base"/>'+
      '<rect x="0" y="0" width="'+W+'" height="'+H+'" rx="6" class="pg-grain" filter="url(#parch)"/>'+
      '<rect x="0" y="0" width="'+W+'" height="'+H+'" rx="6" fill="url(#wear)"/>'+
    '</g>';

  return '<div class="roadmap'+(small?' is-vertical':'')+'" data-map="1">'+
    '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Route: '+done+' of '+n+' cities complete, currently at '+esc(hereName)+'">'+
      paper+ terrain+ furniture+
      '<path class="road-base" d="'+d+'"/>'+
      '<path class="road-done" filter="url(#ink)" d="'+d+'" pathLength="100" stroke-dasharray="100" stroke-dashoffset="'+(100 - 100*frac)+'"/>'+
      footprints(pts, small, frac)+
      nodes+
      '<g class="traveller" transform="translate('+at.x+' '+(at.y-34)+')">'+
        '<ellipse cx="0" cy="15" rx="9" ry="2.6" fill="rgba(0,0,0,.28)"/>'+
        '<rect x="-5" y="-2" width="10" height="16" rx="3" fill="var(--brand)"/>'+
        '<circle cx="0" cy="-7" r="5.2" fill="var(--brand-soft)" stroke="var(--brand)" stroke-width="1.6"/>'+
        '<ellipse cx="0" cy="-11.4" rx="9" ry="2" fill="var(--ink-900)"/>'+
        '<path d="M-4.6 -11.6 a4.6 4.6 0 0 1 9.2 0z" fill="var(--ink-900)"/>'+
      '</g>'+
    '</svg></div>';
}

/* ── The guide ─────────────────────────────────────────────────────────
   One voice, keyed to a city. He says the thing a person would say
   standing next to you, which is not the same as what the lesson says. */
function guideNote(cityId){
  var line = M.GUIDE.lines[cityId];
  if(!line) return '';
  return '<aside class="guide">'+
    '<div class="guide-face" aria-hidden="true">'+ M.guideFace(52) +'</div>'+
    '<div class="guide-body"><span class="guide-who">'+esc(M.GUIDE.name)+' · '+esc(M.GUIDE.role)+'</span>'+
    '<p>'+esc(line)+'</p></div></aside>';
}

/* ── Media for a city ── linked with credit, never embedded until asked */
function cityMedia(cityId){
  var vids = M.VIDEOS.filter(function(x){ return x.city===cityId; });
  var reads = M.READING.filter(function(x){ return x.city===cityId; });
  if(!vids.length && !reads.length) return '';
  var out = '<div class="media"><h2>Go deeper</h2>';
  if(vids.length){
    out += '<div class="vidgrid">'+vids.map(function(vd){
      return '<button class="vidcard" data-video="'+vd.id+'" data-vt="'+esc(vd.title)+'">'+
        '<span class="thumb">'+
        '<span class="play">'+icon('i-play',20,0)+'</span></span>'+
        '<span class="vmeta"><strong>'+esc(vd.title)+'</strong>'+
        '<em>'+esc(vd.who)+'</em><span>'+esc(vd.why)+'</span></span></button>';
    }).join('')+'</div>';
  }
  if(reads.length){
    out += '<ul class="readlist">'+reads.map(function(r){
      return '<li><a href="'+r.u+'" target="_blank" rel="noopener noreferrer">'+esc(r.t)+'</a>'+
        '<span class="src">'+esc(r.s)+'</span><span class="why">'+esc(r.why)+'</span></li>';
    }).join('')+'</ul>';
  }
  return out+'</div>';
}

function viewResources(){
  var vids = M.VIDEOS, reads = M.READING, dl = M.DOWNLOADS;
  return '<div class="topline"><div><h1>'+M.t('resources')+'</h1>'+
    '<p>Everything worth keeping after the programme ends. Videos and articles are other people&rsquo;s work, linked with credit — nothing here is copied.</p></div></div>'+


    '<h2 class="sec">Take these with you</h2>'+
    '<div class="dlgrid">'+dl.map(function(d){
      return '<a class="dlcard panel pad" href="'+d.u+'" target="_blank" rel="noopener noreferrer">'+
        '<span class="kind">'+esc(d.k)+'</span>'+
        '<strong>'+esc(d.t)+'</strong><span class="why">'+esc(d.why)+'</span>'+
        '<span class="go">'+M.t('download')+' '+icon('i-arrow',14,2)+'</span></a>';
    }).join('')+'</div>'+

    '<h2 class="sec">Watch</h2>'+
    '<div class="vidgrid">'+vids.map(function(vd){
      var c = M.CITIES.filter(function(x){return x.id===vd.city})[0];
      return '<button class="vidcard" data-video="'+vd.id+'" data-vt="'+esc(vd.title)+'">'+
        '<span class="thumb">'+
        '<span class="play">'+icon('i-play',20,0)+'</span></span>'+
        '<span class="vmeta"><strong>'+esc(vd.title)+'</strong>'+
        '<em>'+esc(vd.who)+(c?' · '+esc(c.city):'')+'</em><span>'+esc(vd.why)+'</span></span></button>';
    }).join('')+'</div>'+

    '<h2 class="sec">Read</h2>'+
    '<ul class="readlist">'+reads.map(function(r){
      var c = M.CITIES.filter(function(x){return x.id===r.city})[0];
      return '<li><a href="'+r.u+'" target="_blank" rel="noopener noreferrer">'+esc(r.t)+'</a>'+
        '<span class="src">'+esc(r.s)+(c?' · '+esc(c.city):'')+'</span>'+
        '<span class="why">'+esc(r.why)+'</span></li>';
    }).join('')+'</ul>'+
    casesBlock()+
    promptBlock()+
    requestForm();
}

/* ── Thank you ─────────────────────────────────────────────────────────
   Where this came from, how it was made, and credit to everyone whose
   work it stands on. Testimonials are left EMPTY on purpose — see below. */
function viewThanks(){
  var quotes = M.TESTIMONIALS || [];
  var qhtml = quotes.length
    ? quotes.map(function(q){
        return '<figure class="panel pad quote-card"><blockquote>&ldquo;'+esc(q.t)+'&rdquo;</blockquote>'+
          '<figcaption class="by">'+esc(q.by)+(q.role?' · '+esc(q.role):'')+'</figcaption></figure>';
      }).join('')
    : '<div class="panel pad quote-card quote-empty">'+
      '<p><strong>Nothing here yet, deliberately.</strong> Real words from the people who sat '+
      'through the programme are worth more than anything written on their behalf. '+
      'Add them to <code>M.TESTIMONIALS</code> in <code>src/resources.js</code> once you have them, '+
      'and they will appear here.</p></div>';

  return '<div class="topline"><div><h1>Thank you</h1>'+
    '<p>Why this exists, how it was built, and everyone it borrows from.</p></div></div>'+

    '<div class="panel pad thanks-hero" style="margin-bottom:24px">'+
      '<p>In August 2026 the Royal Insurance Corporation of Bhutan ran a three-day executive '+
      'programme on advanced credit risk. It went well. Then it ended — and that is where '+
      'training usually dies.</p>'+
      '<p>Eleven frameworks, two tools, one genuinely original scoring rule, and a case that '+
      'had run for three days, all of it going into a slide deck nobody would reopen. '+
      '<strong>The forgetting starts the same afternoon.</strong></p>'+
      '<p>Two failures made it worse. The AI half of Day 2 was cut for time and never properly '+
      'recovered. And eight of the fifteen syllabus topics — IFRS 9 staging, working-capital '+
      'sizing, portfolio stress testing — were never reached at all, with no hours left to teach '+
      'them in.</p>'+
      '<p><strong>Meridian is the answer to one question:</strong> what does a person with a live '+
      'credit file on their desk on Monday morning actually have?</p>'+
    '</div>'+

    '<h2 class="sec">How it was made</h2>'+
    '<ol class="tl">'+
      '<li><span class="when">The rule</span><h4>The participants invented the scoring</h4>'+
        '<p>On Day 2 the room decided a missed flag should cost <strong>&minus;2</strong> while a '+
        'wrong flag costs &minus;1 — failing to look is worse than looking and getting it wrong. '+
        'It survived a stress test in both directions and it is the scoring model of this whole '+
        'app, unchanged.</p></li>'+
      '<li><span class="when">The shape</span><h4>Seven cities, and the last one is home</h4>'+
        '<p>He travels the world to learn, and the final stop is the valley next door to where he '+
        'started. The order is the argument: the correlation reveal only lands if it arrives last.</p></li>'+
      '<li><span class="when">The build</span><h4>One file, then a real project</h4>'+
        '<p>It began as a single HTML file that opened by double-click. It is now a structured '+
        'static site with no build step, so it still does.</p></li>'+
      '<li><span class="when">The hero</span><h4>Drawn, then rendered</h4>'+
        '<p>The arrival was hand-drawn on a canvas until that hit its ceiling. It is now composed '+
        'in React and pre-rendered by Remotion, then scrubbed by scroll — which is how it can carry '+
        'real light, weather and shadow.</p></li>'+
      '<li><span class="when">The honesty</span><h4>What it refuses to do</h4>'+
        '<p>The sign-in gates content and says plainly that it does not secure it. Lesson content '+
        'is not machine-translated, because mistranslating &ldquo;significant increase in credit '+
        'risk&rdquo; would teach the wrong thing. And Ask Meridian quotes this app rather than '+
        'generating text, so it cannot invent a number at you.</p></li>'+
    '</ol>'+

    '<h2 class="sec">From the room</h2>'+
    '<div class="quotes">'+qhtml+'</div>'+

    requestForm()+

    '<h2 class="sec">Standing on other people&rsquo;s work</h2>'+
    '<div class="panel pad" style="margin-bottom:16px">'+
      '<p style="font-size:.94rem;line-height:1.7;color:var(--text-2)">Everything below is '+
      '<strong>linked, never copied</strong>. The videos play from their creators&rsquo; own channels '+
      'and <strong>nothing at all is requested from YouTube until you press play</strong> &mdash; not even a '+
      'thumbnail, because fetching one would tell Google you had opened this page. If you use this material, credit them, '+
      'not us.</p></div>'+
    '<ul class="credits">'+
      M.READING.map(function(r){
        return '<li><a href="'+r.u+'" target="_blank" rel="noopener noreferrer">'+esc(r.t)+'</a> — '+esc(r.s)+'</li>';
      }).join('')+
      M.VIDEOS.map(function(vd){
        return '<li><a href="https://www.youtube.com/watch?v='+vd.id+'" target="_blank" rel="noopener noreferrer">'+
          esc(vd.title)+'</a> — '+esc(vd.who)+'</li>';
      }).join('')+
      '<li><a href="https://fonts.google.com/specimen/Fraunces" target="_blank" rel="noopener noreferrer">Fraunces</a> — Undercase Type, open source</li>'+
      '<li><a href="https://fonts.google.com/specimen/Inter" target="_blank" rel="noopener noreferrer">Inter</a> — Rasmus Andersson, open source</li>'+
      '<li><a href="https://www.remotion.dev" target="_blank" rel="noopener noreferrer">Remotion</a> — the renderer behind the arrival film</li>'+
    '</ul>'+

    '<div class="panel pad" style="margin-top:26px">'+
      '<p style="font-size:.94rem;line-height:1.7;color:var(--text-2)">And to the sixteen people '+
      'who spent three days arguing about whether a lender should be allowed to ask for your battery '+
      'status, and who invented a scoring rule better than the one they were given — '+
      '<strong>thank you. The best idea in here was yours.</strong></p></div>';
}

function storageBanner(){
  return M.storageOK() ? '' :
   '<div class="banner">'+icon('i-info',16,1.7)+'<span><strong>Progress will not survive a reload.</strong> This browser is blocking storage for files opened directly from disk. Run <code>python3 -m http.server</code> in this folder and open <code>localhost:8000</code> instead — everything then persists.</span></div>';
}

function viewDash(){
  var r=M.rankOf(M.S.xp), nx=M.nextTier(M.S.xp);
  var into = M.S.xp - r.min, span = nx ? nx.min - r.min : 1;
  var pct = nx ? Math.min(100,Math.round(into/span*100)) : 100;
  var done=M.unlockedCount(), ci=M.checkedInToday();
  var next=null, idx=0;
  for(var i=0;i<M.CITIES.length;i++){ if(!M.S.done[M.CITIES[i].id]){ next=M.CITIES[i]; idx=i; break; } }

  var last7=''; for(var d=6; d>=0; d--){
    var k=M.dayKey(new Date(Date.now()-d*864e5));
    last7+='<i class="'+(M.S.checks.indexOf(k)>=0?'on':'')+'"></i>';
  }

  /* 1 — what to do next. The only thing on this page with a real button. */
  var cont = next
    ? '<button class="continue" data-city="'+next.id+'">'+
        '<div class="continue-body">'+
          '<span class="city">Stop '+(idx+1)+' of 7 &middot; '+esc(next.city)+', '+esc(next.country)+'</span>'+
          '<h2>'+esc(next.title)+'</h2>'+
          '<p>'+esc(next.blurb)+'</p>'+
        '</div>'+
        '<span class="continue-go"><span class="go-line">'+(done?'Continue':'Begin')+icon('i-arrow',16,2)+'</span>'+
          '<small>'+next.mins+' min</small></span>'+
      '</button>'
    /* This was a <div> that looked exactly like the button above it — same
       class, same arrow, same affordance, and nothing in the click handler
       matched it. Finishing the tour turned the one control on the panel
       into a decoration. It is a real button now, and it goes where the
       moment actually points: you just finished, put it somewhere. */
    : '<button class="continue done" data-go="awards" data-share="1">'+
        '<div class="continue-body"><span class="city">Seven of seven</span>'+
        '<h2>The tour is complete.</h2>'+
        '<p>Every city is behind you, including the one next door. The Monday question is the part that still matters.</p></div>'+
        '<span class="continue-go"><span class="go-line">Save my card'+icon('i-arrow',16,2)+'</span>'+
          '<small>your passport</small></span>'+
      '</button>';

  /* 2 — the ritual */
  var checkin =
    '<div class="panel pad checkin-row">'+
      '<div class="flame '+(ci?'':'cold')+(M.justLit?' flame-lit':'')+'">'+icon('i-flame',24,1.5)+'</div>'+
      '<div class="body"><h3>'+(ci?'Checked in today':'Daily check-in')+'</h3>'+
        '<p>'+(ci?'Come back tomorrow to keep the streak alive.':'Thirty seconds. It is the whole habit.')+'</p>'+
        '<div class="dots" aria-label="Last seven days">'+last7+'</div></div>'+
      '<button class="btn acc" id="ciBtn"'+(ci?' disabled':'')+'>'+(ci?'Done for today':'Check in')+'</button>'+
    '</div>';

  /* 3 — where am I. One panel, not four orphaned cards. */
  var progress =
    '<div class="panel pad progress-panel">'+
      '<div class="rankline">'+
        '<div><span class="k">Rank</span><span class="v">'+r.rank+'</span></div>'+
        '<span class="to-next">'+(nx? '<span class="num">'+(nx.min-M.S.xp)+'</span> XP to '+nx.rank : 'Top rank')+'</span>'+
      '</div>'+
      '<div class="bar"><i style="transform:scaleX('+(pct/100)+')"></i></div>'+
      '<div class="figs">'+
        '<div><span class="k">Experience</span><span class="f num">'+M.S.xp+'</span></div>'+
        '<div><span class="k">Streak</span><span class="f num">'+M.S.streak+'</span><span class="u">'+(M.S.streak===1?'day':'days')+'</span></div>'+
        '<div><span class="k">Cities</span><span class="f num">'+done+'</span><span class="u">of 7</span></div>'+
        '<div><span class="k">Awards</span><span class="f num">'+M.S.awards.length+'</span><span class="u">of '+M.AWARDS.length+'</span></div>'+
      '</div>'+
    '</div>';

  /* 4 — earned first; the shelf is a reason to continue, not a wall of locks */
  var won = M.AWARDS.filter(function(a){ return M.S.awards.indexOf(a.id)>=0; });
  var nextUp = M.AWARDS.filter(function(a){ return M.S.awards.indexOf(a.id)<0; }).slice(0, Math.max(1, 4-won.length));
  var shelfItems = won.concat(nextUp).slice(0,4);
  var shelf =
    '<div class="shelf-head"><h2>Awards</h2>'+
      '<button class="linkish" data-go="awards">All '+M.AWARDS.length+' '+icon('i-arrow',13,2)+'</button></div>'+
    '<div class="awards">'+shelfItems.map(function(a){
      var w = M.S.awards.indexOf(a.id)>=0;
      return '<div class="award '+(w?'won':'locked')+'">'+
        '<div class="medal'+(w&&M.fresh.indexOf(a.id)>=0?' medal-pop':'')+'">'+icon(w?'i-medal':'i-lock',20,1.6)+'</div>'+
        '<div><h4>'+esc(a.n)+'</h4><p>'+esc(a.d)+'</p></div></div>';
    }).join('')+'</div>';

  var status = next
    ? (done===0 ? 'Seven cities ahead of you. Thimphu is open.'
                : '<span class="num">'+done+'</span> of 7 done. '+esc(next.city)+' is next.')
    : 'All seven cities complete.';

  return storageBanner()+ roleBanner()+
    '<div class="topline"><div><h1>Good to see you, '+esc(M.user.name.split(' ')[0])+'.</h1>'+
    '<p>'+status+'</p></div></div>'+
    roadmap(true) + cont + checkin + progress + shelf;
}

/* ── Awards as postcards ───────────────────────────────────────────────
   A medal icon repeated nine times says only "you have nine of these".
   A postcard says where you were when you earned it — which, on a site
   built around a journey, is the only thing worth saying.

   Each card carries its city's own terrain as the picture, its landmark,
   and its stamp franked in the corner. The two awards that are not tied
   to a place (a streak, a real note on a real file) get the institution's
   own mark instead of borrowing a city they were not earned in. */
function postcard(a, i){
  var won  = M.S.awards.indexOf(a.id) >= 0;
  var city = a.city ? M.CITIES.filter(function(c){ return c.id===a.city; })[0] : null;
  var date = (M.S.awardsAt && M.S.awardsAt[a.id]) || (a.city && typeof M.S.done[a.city]==='string' ? M.S.done[a.city] : '');
  var fresh = won && M.fresh.indexOf(a.id)>=0;

  var picture = city
    ? '<svg class="pc-scene" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">'+
        '<path class="pc-terr" d="'+M.terrainPath(city.id)+'"/></svg>'+
      '<span class="pc-mark">'+M.landmark(city.id, 30, 1.7)+'</span>'
    : '<span class="pc-mark pc-crest">'+icon('i-globe',30,1.5)+'</span>';

  return '<button class="postcard'+(won?' won':' locked')+(fresh?' fresh':'')+'" '+
      'data-award="'+esc(a.id)+'" style="--i:'+i+'" '+
      'aria-label="'+esc(a.n)+(won?', earned':', not yet earned')+'">'+
    '<span class="pc-pic">'+picture+
      (won ? '<span class="pc-frank">'+M.stampSvg(city||{id:'thimphu',city:'Meridian',country:'Bhutan'}, date, 58)+'</span>' : '')+
    '</span>'+
    '<span class="pc-body">'+
      '<span class="pc-where">'+esc(city ? city.city+' · '+city.country : 'Institution of Meridian')+'</span>'+
      '<span class="pc-title">'+esc(a.n)+'</span>'+
      '<span class="pc-state">'+(won
        ? (date ? esc(M.stampDate(date)) : 'Earned')
        : 'Not yet')+'</span>'+
    '</span>'+
    (won ? '' : '<span class="pc-lock">'+icon('i-lock',15,1.7)+'</span>')+
  '</button>';
}

function awardGrid(compact){
  return '<div class="postcards">'+M.AWARDS.map(postcard).join('')+'</div>';
}

/* The detail. Materialises from the card that was tapped rather than
   fading in from nowhere — Apple's rule about anchoring a surface to its
   source, and the reason a `transform-origin` gets written per open. */
function awardDetail(id){
  var a = M.AWARDS.filter(function(x){ return x.id===id; })[0];
  if(!a) return '';
  var won  = M.S.awards.indexOf(a.id) >= 0;
  var city = a.city ? M.CITIES.filter(function(c){ return c.id===a.city; })[0] : null;
  var date = (M.S.awardsAt && M.S.awardsAt[a.id]) || (a.city && typeof M.S.done[a.city]==='string' ? M.S.done[a.city] : '');

  return '<div class="ad-card'+(won?'':' locked')+'" role="dialog" aria-modal="true" aria-label="'+esc(a.n)+'">'+
    '<button class="ad-close" id="adClose" aria-label="Close">'+icon('i-x',17,2.2)+'</button>'+
    '<div class="ad-pic">'+
      (city
        ? '<svg class="pc-scene" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><path class="pc-terr" d="'+M.terrainPath(city.id)+'"/></svg>'+
          '<span class="ad-mark">'+M.landmark(city.id, 62, 1.5)+'</span>'
        : '<span class="ad-mark">'+icon('i-globe',62,1.3)+'</span>')+
      (won ? '<span class="ad-frank">'+M.stampSvg(city||{id:'punakha',city:'Meridian',country:'Bhutan'}, date, 108)+'</span>' : '')+
    '</div>'+
    '<div class="ad-body">'+
      '<span class="ad-where">'+esc(city ? city.city+' · '+city.country : 'Institution of Meridian')+'</span>'+
      '<h2>'+esc(a.n)+'</h2>'+
      '<p>'+esc(a.d)+'</p>'+
      (won
        ? '<p class="ad-date">'+icon('i-check',14,2.4)+'Earned'+(date?' on '+esc(M.stampDate(date)):'')+'</p>'
        : '<p class="ad-how">'+esc(a.city ? 'Finish '+(city?city.city:'that stop')+' to earn this.'
            : a.streak ? 'Check in on '+a.streak+' separate days.'
            : 'Write one field note about a real file.')+'</p>')+
      (city ? '<button class="btn" data-city="'+esc(city.id)+'">Back to '+esc(city.city)+icon('i-arrow',15,2)+'</button>' : '')+
    '</div>'+
  '</div>';
}

function viewTour(){
  return '<div class="topline"><div><h1>The tour</h1>'+
    '<p>Seven cities. He travels the world to learn — and the last stop is the valley next door to where he started.</p></div></div>'+
    roadmap(false)+
    '<h2 style="font-size:1.1rem;margin:6px 0 14px">Every stop</h2>'+
    '<div class="tour">'+M.CITIES.map(function(c,i){
      var done=!!M.S.done[c.id], open=M.isOpen(i), sc=M.S.scores[c.id];
      var cls = done?'done':(open?'open':'locked');
      return '<div class="stop '+cls+'">'+
        '<div class="node">'+icon(done?'i-check':(open?'i-building':'i-lock'),done?20:19,done?2:1.6)+'</div>'+
        '<button class="stopcard" '+(open?'data-city="'+c.id+'"':'disabled')+'>'+
          '<span class="city">'+esc(c.city)+' · '+esc(c.country)+'</span>'+
          '<h3>'+esc(c.title)+'</h3>'+
          '<p>'+esc(c.blurb)+'</p>'+
          '<div class="metarow"><span class="tag">'+c.mins+' min</span>'+
          (done? '<span class="tag ok">'+icon('i-check',12,2.4)+'Complete'+(sc!==undefined?' · <span class="num">'+(sc>0?'+':'')+sc+'</span>':'')+'</span>'
               : open? '<span class="tag new">Available</span>'
               : '<span class="tag">Finish '+esc(M.CITIES[i-1].city)+' first</span>')+
          '</div></button></div>';
    }).join('')+'</div>';
}

function block(b){
  var h = b.h ? '<h2>'+b.h+'</h2>' : '';
  var p = (b.p||[]).map(function(x){return '<p>'+x+'</p>'}).join('');
  var l = b.list ? '<ul>'+b.list.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ul>' : '';
  var q = b.quote ? '<blockquote class="quote">&ldquo;'+b.quote+'&rdquo;</blockquote>' : '';
  var t = '';
  if(b.table){
    t='<div class="dtable"><table><thead><tr>'+b.table.head.map(function(x){return '<th>'+x+'</th>'}).join('')+
      '</tr></thead><tbody>'+b.table.rows.map(function(r){return '<tr>'+r.map(function(c){return '<td>'+c+'</td>'}).join('')+'</tr>'}).join('')+
      '</tbody></table></div>';
  }
  return h+p+t+l+q;
}

function viewCity(id){
  var i=0; for(var k=0;k<M.CITIES.length;k++) if(M.CITIES[k].id===id) i=k;
  var c=M.CITIES[i], done=!!M.S.done[c.id];
  return '<div class="topline"><div>'+
    '<span class="city" style="font-size:.76rem;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--brand-text)">'+
      'Stop '+(i+1)+' of 7 · '+esc(c.city)+', '+esc(c.country)+'</span>'+
    '<h1 style="margin-top:7px">'+esc(c.title)+'</h1></div>'+
    '<button class="btn" data-go="tour">'+icon('i-map',16)+'The tour</button></div>'+
  '<div class="lesson">'+
    '<div class="hook">'+c.hook+'</div>'+
    guideNote(c.id)+
    '<div class="prose">'+c.body.map(block).join('')+'</div>'+
    '<div class="worked"><div class="case">The running case · Tashi Valley Resorts</div>'+
      '<h3>'+esc(c.worked.h)+'</h3><p style="color:var(--text-2);font-size:.94rem;line-height:1.68;margin-top:7px">'+c.worked.p+'</p></div>'+
    quickCheck(c, done)+
    cityMedia(c.id)+
  '</div>';
}

function quickCheck(c, done){
  var nCorrect = c.check.opts.filter(function(o){return o.ok}).length;
  return '<div class="check" id="chk" data-city="'+c.id+'">'+
    '<p class="rule">'+icon('i-scale',15,1.6)+'<span><strong>Scored on your own rule.</strong> +1 for each correct flag, −1 for each wrong one, and <strong>−2 for each one you miss</strong>. Select all that apply — '+nCorrect+' of these five are correct.</span></p>'+
    '<h3>Quick check</h3><p class="q">'+c.check.q+'</p>'+
    '<div id="opts">'+c.check.opts.map(function(o,i){
      return '<button class="opt" data-i="'+i+'"><span class="box">'+icon('i-check',12,3)+'</span><span>'+o.t+'</span></button>';
    }).join('')+'</div>'+
    '<button class="btn acc" id="submitChk" style="margin-top:6px">Submit</button>'+
    '<div id="chkOut"></div>'+
    (done? '<p style="font-size:.82rem;color:var(--text-3);margin-top:12px">You have already completed this city. Re-answering will not change your score or award XP again.</p>':'')+
  '</div>';
}

/* ── The passport ──────────────────────────────────────────────────────
   Progress people can actually hold. Awards are a list of things you did;
   a passport is a record of where you have been, which is the metaphor
   the whole app already runs on — so the stamps are the same seven
   identities as the roadmap nodes and the backdrops.

   Labelled as what it is. It carries no real identifiers, and it says so
   on its face, because a document-shaped thing should never be ambiguous
   about whether it is a document. */
function passport(){
  var cities = M.CITIES;
  var got = cities.filter(function(c){ return !!M.S.done[c.id]; });
  var name = (M.S.name || (M.user && M.user.n) || '—');
  var rank = M.rankOf(M.S.xp);
  var joined = M.S.joined ? M.stampDate(String(M.S.joined).slice(0,10)) : '—';

  var stamps = cities.map(function(c){
    var on = M.S.done[c.id];
    if(!on) return '<div class="pp-slot" aria-hidden="true"><span>'+esc(c.city)+'</span></div>';
    var date = (typeof on === 'string') ? on : '';
    return '<div class="pp-stamp">'+M.stampSvg(c, date, 104)+'</div>';
  }).join('');

  return '<section class="passport" aria-labelledby="ppH">'+
    '<div class="pp-head"><h2 id="ppH">Passport</h2>'+
      '<p>One stamp for every stop you have closed. '+got.length+' of '+cities.length+'.</p></div>'+
    '<div class="pp-book">'+
      '<div class="pp-page pp-id">'+
        '<div class="pp-crest">'+icon('i-globe',22,1.6)+'</div>'+
        '<div class="pp-issuer">INSTITUTION OF MERIDIAN</div>'+
        '<div class="pp-row"><span class="pp-k">Holder</span><span class="pp-v pp-name">'+esc(name)+'</span></div>'+
        '<div class="pp-row"><span class="pp-k">Standing</span><span class="pp-v">'+esc(rank.rank)+'</span></div>'+
        '<div class="pp-row"><span class="pp-k">Issued</span><span class="pp-v">'+esc(joined)+'</span></div>'+
        '<div class="pp-row"><span class="pp-k">Entries</span><span class="pp-v">'+got.length+' / '+cities.length+'</span></div>'+
        '<div class="pp-mrz" aria-hidden="true">MRDN&lt;'+esc(mrz(name))+'&lt;&lt;'+
          String(M.S.xp).padStart(5,'0')+'&lt;'+got.length+cities.length+'</div>'+
        '<p class="pp-note">A record of study. Not a travel document, and not an identifier.</p>'+
      '</div>'+
      '<div class="pp-page pp-stamps">'+stamps+'</div>'+
    '</div>'+
    '<div class="pp-actions">'+
      '<button class="btn" id="shareBtn" type="button">'+icon('i-box',17,1.7)+'Save my card</button>'+
      '<button class="linkish" id="previewBtn" type="button">Preview it first</button>'+
      '<p class="pp-hint">A 1200×630 image of this page — your name, your standing, your stamps. Nothing is uploaded; the image is drawn in your browser.</p>'+
    '</div>'+
    '<div class="pp-preview" id="sharePreview" hidden></div>'+
  '</section>';
}

function mrz(s){
  return String(s).toUpperCase().replace(/[^A-Z ]/g,'').trim().replace(/ +/g,'<').slice(0,22);
}

/* ── Ask for something ─────────────────────────────────────────────────
   A way to say "this should exist" without leaving the app and without
   knowing anybody's address. The destination lives in the Apps Script,
   never in this bundle — so the address cannot be scraped off the page,
   and it can be changed without a redeploy of the site.

   It goes through the same durable queue as check-ins, which means a
   request written on a plane still arrives when the plane lands. */
M.REQUEST_KINDS = [
  { k:'idea',     label:'An idea',      hint:'Something you wish this did.' },
  { k:'problem',  label:'Something broke', hint:'What you did, and what happened instead.' },
  { k:'content',  label:'More on a topic', hint:'A subject you want covered properly.' },
  { k:'question', label:'A question',   hint:'Anything about the programme or the material.' }
];

/* ── Case studies ──────────────────────────────────────────────────────
   Eight public failures, one per lesson. Each carries the question to put
   to the room, which is the part that does the teaching — the summary is
   only there so nobody has to have read the inquiry first. */
function casesBlock(){
  return '<h2 class="sec" id="cases">Case studies</h2>'+
    '<p class="sec-lede">Eight public failures, each one the lesson of a stop happening to real money. '+
    'The question under each is the exercise: it cannot be answered from the summary, only from your own book.</p>'+
    '<div class="cases">'+M.CASES.map(function(c){
      var city = M.CITIES.filter(function(x){ return x.id===c.city; })[0];
      var n = city ? M.CITIES.indexOf(city)+1 : 0;
      return '<article class="case">'+
        '<header>'+
          '<div class="case-mark">'+(M.landmark ? M.landmark(c.city, 22, 1.9) : '')+'</div>'+
          '<div><h3>'+esc(c.n)+'</h3>'+
          '<span class="case-meta">'+esc(c.where)+' · '+esc(c.yr)+
            (city ? ' · <button class="linkish" data-city="'+esc(c.city)+'">Stop '+n+', '+esc(city.city)+'</button>' : '')+
          '</span></div>'+
        '</header>'+
        '<p class="case-what">'+esc(c.what)+'</p>'+
        '<p class="case-lesson"><strong>The lesson.</strong> '+esc(c.lesson)+'</p>'+
        '<blockquote class="case-q">'+esc(c.q)+'</blockquote>'+
        '<p class="case-src"><strong>Primary source.</strong> '+esc(c.src)+'</p>'+
      '</article>';
    }).join('')+'</div>';
}

/* ── The research assistant ────────────────────────────────────────────
   Not a question — a set of standing instructions you install once, so
   the assistant keeps the market context and you stop re-typing it. The
   commands are listed separately from the text, because nobody should
   have to read two hundred lines to find out what the thing can do. */
function promptBlock(){
  return '<h2 class="sec" id="research">Your own research assistant</h2>'+
    '<p class="sec-lede">This pack will go stale, and a list of links rots faster than anything else on a website. '+
    'So instead: <strong>instructions you install once</strong>. Paste them into a Perplexity Space, a ChatGPT Project '+
    'or a Claude Project, and from then on it already knows RICB, the NPL figures, the collateral trap and the RMA '+
    'stack — so you type six words instead of six paragraphs.</p>'+

    '<div class="homes">'+M.RESEARCH_HOMES.map(function(h){
      return '<div class="home"><a href="'+h.u+'" target="_blank" rel="noopener noreferrer">'+esc(h.n)+'</a>'+
        '<span>'+esc(h.how)+'</span></div>';
    }).join('')+'</div>'+

    '<div class="promptbox">'+
      '<div class="pb-head"><span>Paste this once</span>'+
        '<button class="btn sm" id="copyPrompt">'+icon('i-box',15,1.8)+'Copy</button></div>'+
      '<pre id="promptText">'+esc(M.RESEARCH_SYSTEM)+'</pre>'+
    '</div>'+

    '<h3 class="sub">Then type</h3>'+
    '<div class="cmds">'+M.RESEARCH_CMDS.map(function(c){
      return '<div class="cmd"><code>'+esc(c.c)+'</code><span>'+esc(c.d)+'</span></div>';
    }).join('')+'</div>'+

    '<p class="sec-note"><strong>Check what it gives you before you teach from it.</strong> The instructions tell it to '+
    'refuse rather than guess, and to flag when a source contradicts the figures it was given — but a research assistant '+
    'will still occasionally produce a confident citation for a document that does not exist. Open every link once.</p>';
}

/* ── The Bhutan file ───────────────────────────────────────────────────
   The market this was taught for, and the case the whole week hung on.

   The case reveals in stages, in the order the room met it — profile,
   then assumptions, then flags, then the flood. Built on <details> rather
   than JavaScript toggles, so it is keyboard-operable, findable by the
   browser's own in-page search, and still readable if scripts fail. */
function viewFile(){
  var B = M.BHUTAN, T = M.TASHI;

  var market = '<div class="figs">'+B.market.map(function(f){
    return '<div class="fig"><span class="fig-v">'+esc(f.v)+'</span>'+
      '<span class="fig-k">'+esc(f.k)+'</span>'+
      '<span class="fig-w">'+esc(f.w)+'</span></div>';
  }).join('')+'</div>';

  var reg = '<ul class="reglist">'+B.reg.map(function(r){
    return '<li><strong>'+esc(r.n)+'</strong><span class="reg-b">'+esc(r.b)+'</span>'+
      '<span class="reg-w">'+esc(r.w)+'</span></li>';
  }).join('')+'</ul>';

  /* Two tables, because the file handed the room the left one and the room
     had to produce the right one. Showing only the answer key would hide
     the entire lesson, which is that nothing was concealed — the division
     just never got done. */
  function tbl(rows, cls, showW){
    return '<div class="fintable"><table class="'+cls+'"><thead><tr><th></th>'+
      T.fin.cols.map(function(c){ return '<th class="num">'+esc(c)+'</th>'; }).join('')+
      (showW?'<th>What it says</th>':'')+'</tr></thead><tbody>'+
      rows.map(function(r){
        return '<tr><th scope="row">'+esc(r.k)+'</th>'+
          r.v.map(function(v,i){
            return '<td class="num'+(showW && i===r.v.length-1?' last':'')+'">'+esc(v)+'</td>';
          }).join('')+
          (showW?'<td class="fin-w">'+esc(r.w)+'</td>':'')+'</tr>';
      }).join('')+'</tbody></table></div>';
  }
  var fin =
    '<h4 class="fin-h">What the file gave them <span>'+esc(T.fin.unit)+'</span></h4>'+
    tbl(T.fin.raw, 'raw', false)+
    '<h4 class="fin-h">What nobody worked out <span>every line is arithmetic on the table above</span></h4>'+
    tbl(T.fin.derived, 'derived', true);

  function reveal(sum, hint, body){
    return '<details class="rev"><summary><span class="rev-t">'+sum+'</span>'+
      '<span class="rev-h">'+hint+'</span>'+icon('i-down',16,2)+'</summary>'+
      '<div class="rev-b">'+body+'</div></details>';
  }

  return '<div class="topline"><div><h1>The file</h1>'+
      '<p>The market this was taught for, and the borrower the whole week hung on. '+
      'Every number carries its vintage — a ratio without a date cannot be used in a meeting.</p></div></div>'+

    '<h2 class="sec">The market, in eight numbers</h2>'+
    market+

    '<h2 class="sec">The collateral trap</h2>'+
    '<div class="panel pad"><p class="lede-p">'+esc(B.trap)+'</p></div>'+

    '<h2 class="sec">The regulatory stack</h2>'+
    reg+

    '<div class="two-up">'+
      '<div class="panel pad"><h3>The Credit Information Bureau</h3><p>'+B.cib+'</p></div>'+
      '<div class="panel pad"><h3>Bhutan National Digital Identity</h3><p>'+B.ndi+'</p></div>'+
    '</div>'+

    '<h2 class="sec" id="tashi">'+esc(T.name)+'</h2>'+
    '<p class="sec-lede">The case that ran for three days. Read the file before you open anything below it — '+
      'the order is the lesson, and all four at once is worth nothing.</p>'+

    '<div class="casefile">'+
      '<div class="cf-col"><h4>The borrower</h4><ul>'+T.profile.map(function(p){ return '<li>'+esc(p)+'</li>'; }).join('')+'</ul></div>'+
      '<div class="cf-col"><h4>The request</h4><ul>'+T.request.map(function(p){ return '<li>'+esc(p)+'</li>'; }).join('')+'</ul></div>'+
      '<div class="cf-col cf-wide"><h4>What we know</h4><ul>'+T.known.map(function(p){ return '<li>'+p+'</li>'; }).join('')+'</ul></div>'+
    '</div>'+

    reveal('The three years', 'Nothing here is hidden. It was in front of the room for two hours.',
      fin + '<p class="fin-line">'+T.fin.line+'</p>')+

    reveal('Six assumptions the file records as facts',
      'Day 2. Sort what you were told from what you assumed.',
      '<ol class="pinklist">'+T.assumptions.map(function(a){ return '<li>'+esc(a)+'</li>'; }).join('')+'</ol>'+
      '<p class="rev-line">'+esc(T.assumptionLine)+'</p>')+

    reveal('Nine problems in the profile',
      'Day 1. Teams typically found four to six.',
      '<ol class="issues">'+T.issues.map(function(i){
        return '<li><strong>'+esc(i.n)+'</strong><span>'+i.w+'</span></li>'; }).join('')+'</ol>')+

    reveal('The red flag key',
      'Two of these score negative. Flagging everything is not vigilance.',
      '<div class="flagtable"><table><thead><tr><th>Flag</th><th>Column</th><th class="num">Points</th></tr></thead><tbody>'+
      T.flags.map(function(f){
        var neg = f.p < 0;
        return '<tr class="'+(neg?'neg':'')+'"><td>'+esc(f.f)+'</td><td class="fcol">'+esc(f.c)+'</td>'+
          '<td class="num">'+(f.p>0?'+':'')+f.p+'</td></tr>';
      }).join('')+'</tbody></table></div>'+
      '<p class="rev-line">'+M.TASHI.rule.w+'</p>')+

    reveal('Where the resort is', 'Day 3, 12:35. Open this last.',
      '<p class="glof-line">'+esc(T.glof.line)+'</p>'+
      '<p class="glof-where"><strong>Tashi Valley Resorts is in the Punakha valley. On the river.</strong></p>'+
      '<p>'+esc(T.glof.geo)+'</p>'+
      '<div class="legs">'+T.glof.legs.map(function(l){
        return '<div class="leg"><h4>'+esc(l.n)+'</h4><p>'+esc(l.w)+'</p></div>'; }).join('')+'</div>'+
      '<p class="glof-close">'+esc(T.glof.close)+'</p>'+
      '<p class="glof-admit">'+esc(T.glof.admission)+'</p>')+

    '<h2 class="sec">The decimal place</h2>'+
    '<div class="panel pad el-ex">'+
      '<p class="el-wrong">'+esc(M.EL_EXAMPLE.wrong)+'</p>'+
      '<p class="el-right">→ '+esc(M.EL_EXAMPLE.right)+'</p>'+
      '<p>'+esc(M.EL_EXAMPLE.w)+'</p>'+
    '</div>';
}

/* ── The map, full screen ──────────────────────────────────────────────
   What you see the moment you sign in: the whole route, opened like a
   folded chart across the viewport, before the dashboard exists.

   It is a *surface*, not a splash. Every place on it is live — tap one
   and you land in that city — so the twenty seconds it holds you are
   twenty seconds you can spend usefully rather than waiting through.

   Nobody is trapped in it. Scroll, click Enter, press Escape or hit any
   place: four ways out, and the exit is always the same fold in reverse. */
function mapIntro(){
  var n = M.CITIES.length;
  var done = M.unlockedCount();
  var here = Math.min(done, n-1);
  /* Vertical on a phone. Laid out horizontally, seven stops sit 47px
     apart on a 375px screen — so a tap target that met the 44px minimum
     would overlap its neighbours, and one that did not overlap would be
     too small to hit. Turning the route down the page buys the room. */
  var small = (typeof innerWidth==='number') && innerWidth < 760;
  var W, H, pts, pad, span, amp, midY;

  if(small){
    W = 380; H = 96 + n*96;
    pts = M.CITIES.map(function(c,i){
      var t = i/(n-1);
      return { x: 132 + Math.sin(t*Math.PI*1.5)*46, y: 66 + i*96, c:c, i:i };
    });
  } else {
    W = 1000; H = 460;
    pad = 88; span = W - pad*2; amp = 84; midY = 214;
    pts = M.CITIES.map(function(c,i){
      var t = i/(n-1);
      return { x: pad + span*t, y: midY + Math.sin(t*Math.PI*1.75 + 0.5)*amp, c:c, i:i };
    });
  }
  var d = 'M'+pts[0].x+' '+pts[0].y;
  for(var j=0;j<pts.length-1;j++){
    var p1=pts[j], p2=pts[j+1];
    if(small){ var my=(p1.y+p2.y)/2; d += ' C'+p1.x+' '+my+' '+p2.x+' '+my+' '+p2.x+' '+p2.y; }
    else     { var mx=(p1.x+p2.x)/2; d += ' C'+mx+' '+p1.y+' '+mx+' '+p2.y+' '+p2.x+' '+p2.y; }
  }
  var frac = n>1 ? Math.min(1, done/(n-1)) : 0;

  /* Terrain across the foot of the chart, one slice per country. */
  var terrain = '';
  if(!small){
    var terrH = 96, terrTop = H - terrH;
    terrain = '<g class="terrain" aria-hidden="true">'+
      M.CITIES.map(function(c,i){
        var sw = W/n, sx = sw/100, sy = terrH/40;
        var st = i<done ? 'is-done' : (i===here ? 'is-here' : 'is-ahead');
        return '<path class="terr '+st+'" transform="translate('+(i*sw).toFixed(1)+' '+terrTop+') scale('+sx.toFixed(4)+' '+sy.toFixed(4)+')" d="'+M.terrainPath(c.id)+'"/>';
      }).join('')+'</g>';
  }

  /* Each place carries its own landmark, its number, its state, and the
     line that says what it is actually about — the personalisation is
     the content, not a colour. */
  var marks = pts.map(function(p){
    var isDone = !!M.S.done[p.c.id];
    var open   = M.isOpen(p.i);
    var cls = 'mi-stop'+(isDone?' is-done':'')+(open?' is-open':'')+(open&&!isDone?' is-next':'');
    var above = p.i % 2 === 0;
    var ly = small ? p.y - 6 : (above ? p.y - 46 : p.y + 62);
    var lx = small ? p.x + 46 : p.x;
    /* Alignment is set in CSS, not here: a stylesheet rule beats a
       presentation attribute, so text-anchor="start" was being silently
       overridden by .mi-name{text-anchor:middle} and every label landed
       centred on top of its own node. */
    return '<g class="'+cls+'" style="--i:'+p.i+'" '+
        (open?'data-city="'+p.c.id+'" data-fromintro="1"':'aria-disabled="true"')+
        ' role="button" tabindex="'+(open?'0':'-1')+'"'+
        ' aria-label="Stop '+(p.i+1)+', '+esc(p.c.city)+', '+esc(p.c.title)+
          (isDone?' — complete':open?' — open':' — locked')+'">'+
      '<circle class="mi-hit" cx="'+p.x+'" cy="'+p.y+'" r="'+(small?54:46)+'"/>'+
      '<circle class="mi-halo" cx="'+p.x+'" cy="'+p.y+'" r="30"/>'+
      '<circle class="mi-ring" cx="'+p.x+'" cy="'+p.y+'" r="24"/>'+
      '<g class="mi-mark" transform="translate('+(p.x-13).toFixed(1)+' '+(p.y-13).toFixed(1)+') scale(1.083)">'+
        (M.LANDMARKS[p.c.id]||'')+'</g>'+
      (isDone
        ? '<g class="mi-tick"><circle cx="'+(p.x+18)+'" cy="'+(p.y-18)+'" r="9"/>'+
          '<path d="M'+(p.x+13.6)+' '+(p.y-18)+' l3 3 l5.8 -6.4"/></g>'
        : '')+
      (small ? '' : '<text class="mi-num" x="'+p.x+'" y="'+(p.y+40)+'">'+(p.i+1)+'</text>')+
      '<text class="mi-name" x="'+lx+'" y="'+ly+'">'+esc(p.c.city)+'</text>'+
      '<text class="mi-sub" x="'+lx+'" y="'+(ly+17)+'">'+esc(p.c.country)+'</text>'+
      '</g>';
  }).join('');

  var at = pts[here];
  /* The traveller rides above the stop you are standing on — but labels
     alternate above and below, so on an even-numbered stop that is exactly
     where the city name is. Clear the whole label block when it is up
     there, and sit close when it is not. */
  var atLabelAbove = !small && here % 2 === 0;
  var travY = at.y - (small ? 42 : (atLabelAbove ? 88 : 46));

  /* The chart, minus anything that is drawn ON it. Built as a function so
     the fold panes can each have their own copy with unique filter ids —
     two elements answering to the same id is invalid, and the second one
     silently borrows the first one's filter. */
  function chart(sfx){
    return '<defs>'+
        '<filter id="miParch'+sfx+'" x="0" y="0" width="100%" height="100%">'+
          '<feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" seed="7" result="f"/>'+
          '<feColorMatrix in="f" type="saturate" values="0" result="fg"/>'+
          '<feComponentTransfer in="fg" result="fc"><feFuncA type="linear" slope="0.46"/></feComponentTransfer>'+
          '<feComposite in="fc" in2="SourceGraphic" operator="in"/>'+
        '</filter>'+
        '<radialGradient id="miWear'+sfx+'" cx="50%" cy="50%" r="74%">'+
          '<stop offset="0%" stop-color="#000" stop-opacity="0"/>'+
          '<stop offset="58%" stop-color="#000" stop-opacity="0"/>'+
          '<stop offset="100%" stop-color="#5A4A2E" stop-opacity="0.34"/>'+
        '</radialGradient>'+
        '<filter id="miInk'+sfx+'" x="-8%" y="-30%" width="116%" height="160%">'+
          '<feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="3" result="n"/>'+
          '<feDisplacementMap in="SourceGraphic" in2="n" scale="1.8" xChannelSelector="R" yChannelSelector="G"/>'+
        '</filter>'+
      '</defs>'+
      '<g class="parchment" aria-hidden="true">'+
        '<rect x="0" y="0" width="'+W+'" height="'+H+'" rx="10" class="pg-base"/>'+
        '<rect x="0" y="0" width="'+W+'" height="'+H+'" rx="10" class="pg-grain" filter="url(#miParch'+sfx+')"/>'+
        '<rect x="0" y="0" width="'+W+'" height="'+H+'" rx="10" fill="url(#miWear'+sfx+')"/>'+
      '</g>'+
      '<g class="creases" aria-hidden="true">'+
        [0.25,0.5,0.75].map(function(f){ return '<line x1="'+(W*f)+'" y1="0" x2="'+(W*f)+'" y2="'+H+'"/>'; }).join('')+
        '<line x1="0" y1="'+(H*0.5)+'" x2="'+W+'" y2="'+(H*0.5)+'"/></g>'+
      terrain+
      (small ? '' : '<g class="compass" transform="translate('+(W-58)+' 58)">'+
        '<circle r="26"/><circle r="18" class="cring"/>'+
        '<path class="cn" d="M0 -21 L6.4 0 L0 5.6 L-6.4 0 Z"/>'+
        '<path class="cs" d="M0 21 L6.4 0 L0 -5.6 L-6.4 0 Z"/>'+
        '<text y="-30">N</text></g>')+
      '<path class="road-base" filter="url(#miInk'+sfx+')" d="'+d+'"/>'+
      '<path class="road-done" filter="url(#miInk'+sfx+')" d="'+d+'" pathLength="100" stroke-dasharray="100" stroke-dashoffset="'+(100-100*frac)+'"/>';
  }

  var vb = '0 0 '+W+' '+H;
  /* One panel of a tri-fold: a window onto a third of the chart, with the
     whole chart inside it at triple width, shifted so the right third
     shows through. Rotating the WINDOW in 3D is what makes it a fold
     rather than a scale.

     Each panel carries a back as well as a face. A flap folded shut is
     showing you the blank back of the paper — without one, `backface-
     visibility: hidden` leaves the folded flap invisible and the panel
     appears out of nowhere as it passes 90 degrees. With one, you see
     blank parchment lying over the centre panel and the printed side
     turns into view exactly when the paper turns. That is the difference
     between a brochure opening and two rectangles rotating. */
  function pane(side, i){
    return '<div class="fp fp-'+side+'">'+
      '<div class="fp-face"><div class="fp-in">'+
        '<svg viewBox="'+vb+'" preserveAspectRatio="none">'+chart('-'+side)+'</svg>'+
      '</div></div>'+
      '<div class="fp-back"></div>'+
    '</div>';
  }

  return '<div class="mi-sheet" role="dialog" aria-modal="true" aria-label="The route">'+
    '<div class="mi-head">'+
      '<span class="mi-kicker">Institution of Meridian</span>'+
      '<h1>'+esc(M.user && M.user.name ? M.user.name.split(' ')[0] : 'Traveller')+'&rsquo;s route</h1>'+
      '<p>'+(done ? done+' of '+n+' behind you. '+esc(M.CITIES[here].city)+' is where you stand.'
                  : 'Seven cities. Thimphu is open &mdash; the rest unlock as you go.')+'</p>'+
    '</div>'+

    '<div class="mi-mapwrap">'+
      /* The fold. Decorative and inert: it carries no stops, it cannot be
         tapped, and it is gone the moment the real chart has faded up
         underneath it. */
      '<div class="mi-fold" aria-hidden="true">'+ pane('a',0) + pane('b',1) + pane('c',2) +'</div>'+

      '<svg class="mi-map'+(small?' is-vertical':'')+'" viewBox="'+vb+'" role="img" aria-label="Route map, '+done+' of '+n+' complete">'+
        chart('')+
        footprints(pts, small, frac)+
        marks+
        '<g class="mi-trav" transform="translate('+at.x+' '+travY.toFixed(1)+')">'+
          '<ellipse cx="0" cy="20" rx="12" ry="3.4" fill="rgba(0,0,0,.26)"/>'+
          '<rect x="-6.6" y="-3" width="13.2" height="21" rx="4" fill="var(--brand)"/>'+
          '<circle cx="0" cy="-9.4" r="7" fill="var(--brand-soft)" stroke="var(--brand)" stroke-width="2"/>'+
          '<ellipse cx="0" cy="-15.2" rx="12" ry="2.6" fill="var(--ink-900)"/>'+
          '<path d="M-6.2 -15.4 a6.2 6.2 0 0 1 12.4 0z" fill="var(--ink-900)"/></g>'+
      '</svg>'+
    '</div>'+

    '<p class="mi-hint">Scroll to open the dashboard. Tap any place to go straight there.</p>'+
  '</div>';
}

/* ── The desk ──────────────────────────────────────────────────────────
   Four tools that work on a live file. Everything else on this site is
   about a borrower who does not exist; this is the part you point at a
   real one on Monday morning.

   Every input here is uncontrolled — typed values live in the DOM and are
   read on submit, never re-rendered from state. Re-rendering a form on
   every keystroke fights the caret, and a tool people fight is a tool
   people stop using. */
function viewDesk(){
  return '<div class="topline"><div><h1>The desk</h1>'+
      '<p>Four tools for a real file. The arithmetic is the same arithmetic the room used — '+
      'run Tashi Valley&rsquo;s own numbers through the first one and it returns 29 / 41 / 65.</p></div></div>'+
    '<p class="privnote deskpriv">'+icon('i-lock',13,1.8)+'<span><strong>Nothing typed here leaves this device.</strong> '+
      'No upload, no sheet, not to your trainer. It is arithmetic running in your browser, and it is '+
      'safe to put a live borrower&rsquo;s numbers into it.</span></p>'+
    fileTool() + elTool() + scoreTool() + recallTool();
}

/* 1 — Run a real file */
function fileTool(){
  var yrs = ['Year 1','Year 2','Year 3'];
  return '<section class="tool" id="tool-file">'+
    '<div class="tool-h"><h2>Run a real file</h2>'+
      '<p>Three years off the accounts. It returns collection days, payment days, cover, and what the trend says — '+
      'then flags it the way the room flagged Tashi Valley.</p></div>'+
    '<div class="fileform"><table><thead><tr><th></th>'+
      yrs.map(function(y){ return '<th>'+esc(y)+'</th>'; }).join('')+'</tr></thead><tbody>'+
      M.FILE_ROWS.map(function(r){
        return '<tr><th scope="row">'+esc(r.n)+'</th>'+
          [0,1,2].map(function(i){
            return '<td><input type="number" step="any" inputmode="decimal" '+
              'data-fk="'+r.k+'" data-fy="'+i+'" aria-label="'+esc(r.n)+', year '+(i+1)+'"></td>';
          }).join('')+'</tr>';
      }).join('')+'</tbody></table></div>'+
    '<div class="tool-foot">'+
      '<button class="btn acc" id="runFile">Run it</button>'+
      '<button class="linkish" id="fillTashi">Fill with Tashi Valley</button>'+
      '<span class="tool-note">Any currency, any unit — the ratios are unitless. Just be consistent.</span>'+
    '</div>'+
    '<div id="fileOut" class="tool-out" hidden></div>'+
  '</section>';
}

function fileResult(res){
  if(!res || !res.ok) return '<p class="tool-empty">Not enough numbers yet. Revenue plus receivables gets you collection days; add operating profit, interest and principal for cover.</p>';
  var head = '<div class="resrow">'+
    ['Collection days','Payment days','Cover ratio'].map(function(lbl,i){
      var vals = res.years.map(function(y){
        return i===0 ? y.recvDays : i===1 ? y.payDays : (y.cover!=null?y.cover.toFixed(2):null);
      }).filter(function(v){ return v!=null; });
      if(!vals.length) return '';
      return '<div class="res"><span class="res-k">'+lbl+'</span>'+
        '<span class="res-v">'+vals.map(function(v,j){
          return '<b'+(j===vals.length-1?' class="last"':'')+'>'+esc(String(v))+'</b>';
        }).join('<i>→</i>')+'</span></div>';
    }).join('')+'</div>';

  return head +
    (res.synth?'<p class="res-synth">'+esc(res.synth)+'</p>':'')+
    '<div class="flags">'+res.flags.map(function(f){
      return '<div class="flag f-'+esc(f.c.split(' ')[0].toLowerCase())+'">'+
        '<span class="flag-c">'+esc(f.c)+'</span>'+
        '<span class="flag-f">'+esc(f.f)+'</span>'+
        '<span class="flag-w">'+esc(f.w)+'</span></div>';
    }).join('')+'</div>';
}

/* 2 — Expected loss */
function elTool(){
  return '<section class="tool" id="tool-el">'+
    '<div class="tool-h"><h2>Expected loss</h2>'+
      '<p>PD × LGD × EAD. The room got this wrong by a factor of ten on the first try, so it shows you both answers.</p></div>'+
    '<div class="elform">'+
      '<label>PD <span>%</span><input type="number" step="any" id="elPd" value="7" inputmode="decimal"></label>'+
      '<label>LGD <span>%</span><input type="number" step="any" id="elLgd" value="45" inputmode="decimal"></label>'+
      '<label>EAD <span>Nu m</span><input type="number" step="any" id="elEad" value="30" inputmode="decimal"></label>'+
      '<button class="btn acc" id="runEl">Calculate</button>'+
    '</div>'+
    '<div id="elOut" class="tool-out" hidden></div>'+
  '</section>';
}

function elResult(r){
  if(!r) return '<p class="tool-empty">Fill all three.</p>';
  var fm = function(v){ return 'Nu ' + Math.round(v*1e6).toLocaleString('en-US'); };
  return '<div class="elres">'+
    '<p class="el-wrong">'+esc(r.pd)+'% × '+esc(r.lgd)+'% × Nu '+esc(r.ead)+'m &nbsp;=&nbsp; '+esc(fm(r.trap))+'</p>'+
    '<p class="el-right">→ '+esc(fm(r.el))+'</p>'+
    '<p>Two percentages multiply to a fraction of a percent, not to a percentage. '+
    'The struck-through line is what you get by multiplying 7 by 45 instead of 0.07 by 0.45 — '+
    'ten times too much, which declines a facility that should have been written.</p></div>';
}

/* 3 — Scorecard */
function scoreTool(){
  var picked = M.get('m.sc', ['cash','collect','security','mgmt','sector','history']);
  return '<section class="tool" id="tool-score">'+
    '<div class="tool-h"><h2>Build a scorecard</h2>'+
      '<p>Six factors, no more. Fifteen is a scorecard nobody fills in honestly. '+
      'Weight them, score each 1 to 5, and see what grade falls out.</p></div>'+
    '<div class="scpick">'+M.SCORE_FACTORS.map(function(f){
      var on = picked.indexOf(f.k)>=0;
      return '<button class="kindchip sm'+(on?' on':'')+'" data-scf="'+f.k+'" title="'+esc(f.w)+'">'+esc(f.n)+'</button>';
    }).join('')+'</div>'+
    '<div class="sctable">'+picked.map(function(k){
      var f = M.SCORE_FACTORS.filter(function(x){ return x.k===k; })[0];
      if(!f) return '';
      return '<div class="scrow"><span class="sc-n">'+esc(f.n)+'<small>'+esc(f.w)+'</small></span>'+
        '<label class="sc-in">Weight<input type="number" min="0" max="100" step="5" value="'+Math.round(100/picked.length)+'" data-scw="'+esc(k)+'"></label>'+
        '<label class="sc-in">Score<input type="number" min="1" max="5" step="1" value="3" data-scs="'+esc(k)+'"></label></div>';
    }).join('')+'</div>'+
    '<div class="tool-foot"><button class="btn acc" id="runScore">Grade it</button>'+
      '<span class="tool-note">Weights need not sum to 100 — they are normalised.</span></div>'+
    '<div id="scOut" class="tool-out" hidden></div>'+
  '</section>';
}

function scoreResult(r){
  if(!r) return '<p class="tool-empty">Give at least one factor a weight and a score.</p>';
  return '<div class="scres">'+
    '<div class="sc-grade"><span class="sc-val">'+esc(r.value.toFixed(2))+'</span>'+
      '<span class="sc-g">'+esc(r.grade)+'</span></div>'+
    '<p>'+esc(r.note)+'</p>'+
    (r.weakest?'<p class="sc-weak">Weakest factor: <strong>'+esc(r.weakest)+'</strong>. '+
      'If two people grade the same borrower differently, this is almost always where the spread comes from.</p>':'')+
    '<p class="sc-override">Every scorecard lets a human overrule it, and it should. But if yours has '+
    '<strong>never once</strong> told you something you did not want to hear, you have not built an instrument — '+
    'you have built a mirror. And an override rate of zero does not mean everyone agrees with the scorecard. '+
    'It usually means nobody believes it, so instead of overriding openly they quietly adjust the inputs '+
    'until it produces the grade they already wanted.</p></div>';
}

/* 4 — Test me */
function recallTool(){
  var due = M.dueQuestion();
  var body;
  if(!due){
    var anyDone = M.CITIES.some(function(c){ return !!M.S.done[c.id]; });
    body = '<p class="tool-empty">'+(anyDone
      ? 'Nothing due today. Come back tomorrow — that gap is the whole mechanism.'
      : 'Finish a stop first. There is nothing to bring back yet.')+'</p>';
  } else {
    body = '<div class="recall" data-rc="'+esc(due.city.id)+'">'+
      '<span class="rc-from">'+esc(due.city.city)+
        (due.days ? ' · last seen '+due.days+' day'+(due.days===1?'':'s')+' ago' : ' · not tested yet')+'</span>'+
      /* Authored content, not user input: the questions carry <strong>
         markup and the city view renders them raw. Escaping here printed
         the tags on screen. Same constant, same treatment. */
      '<h3>'+due.check.q+'</h3>'+
      '<div class="rc-opts">'+due.check.opts.map(function(o,i){
        return '<button class="opt rc-opt" data-rco="'+i+'" data-rcok="'+(o.ok?1:0)+'">'+o.t+'</button>';
      }).join('')+'</div></div>';
  }
  return '<section class="tool" id="tool-recall">'+
    '<div class="tool-h"><h2>Test me</h2>'+
      '<p>One question from a stop you finished a while ago. Answers you get wrong come back four times sooner — '+
      'which is the only thing on this site that actually fights the forgetting.</p></div>'+
    body +
  '</section>';
}

/* ── Setup ─────────────────────────────────────────────────────────────
   Admin only. Not a page of instructions — a page that tells you which
   step you are actually on, because every row reads live state.

   Written to answer the only three questions anybody actually has about
   a config setting: what is this, why do I need it, and what breaks if I
   skip it. The third one is the useful one. "Required" tells you nothing;
   "without this, twenty people cannot sign in on Monday" tells you when
   to do it. */
function setupPanel(){
  var rs = M.rosterStatus ? M.rosterStatus() : null;
  var live = rs && rs.source === 'live';

  function row(done, opt, title, plain, why, broken, where){
    return '<li class="su '+(done?'ok':(opt?'opt':'todo'))+'">'+
      '<span class="su-dot">'+(done?icon('i-check',13,2.6):'')+'</span>'+
      '<div class="su-b">'+
        '<h4>'+title+(opt&&!done?' <em>optional</em>':'')+'</h4>'+
        '<p class="su-plain">'+plain+'</p>'+
        '<p><strong>Why you need it.</strong> '+why+'</p>'+
        '<p class="su-break"><strong>If you skip it.</strong> '+broken+'</p>'+
        '<p class="su-where">'+where+'</p>'+
      '</div></li>';
  }
  function c(v){ return '<code>'+esc(v)+'</code>'; }

  return '<section class="setup">'+
    '<div class="topline"><div><h2>Setup</h2>'+
      '<p>Five settings. Everything below is read live — nothing here is a box you tick yourself. '+
      'The site works right now with none of them done; each one removes a limitation.</p></div></div>'+

    '<div class="su-state '+(live?'is-live':'is-fallback')+'">'+
      (live
        ? '<strong>Access codes are coming from your sheet.</strong> '+esc(String(rs.count))+
          ' active code'+(rs.count===1?'':'s')+' loaded. Add a row and it works on the next page load.'
        : '<strong>Access codes are coming from the built-in list.</strong> '+
          esc(String(rs && rs.count || M.ROSTER.length))+' codes from <code>src/config.js</code>'+
          (rs && rs.why ? ' — reason: <code>'+esc(rs.why)+'</code>' : '')+
          '. Everyone can still sign in. This is the fallback doing its job, not an error.')+
    '</div>'+

    '<ol class="su-list">'+
      row(!!M.ROSTER_CSV, false,
        'A Google Sheet of access codes',
        'A spreadsheet listing who is allowed in. The site reads it every time somebody opens the page.',
        'Right now the twenty-two codes are typed into a file inside the website. Changing one means editing code '+
        'and re-uploading the whole site. With the sheet, you type a name into a row and that person can sign in a '+
        'minute later — and deleting the row locks them out just as fast. It is the difference between phoning a '+
        'developer and opening a spreadsheet.',
        'Nothing breaks. The built-in list keeps working forever. You just cannot add or remove anybody without '+
        'editing the site itself.',
        'Open <a href="https://docs.google.com/spreadsheets/d/15OHLp7LGQUac7gQ76ioarKspZGvqYC-IUyLHzhNzNSY/edit" target="_blank" rel="noopener noreferrer">Meridian — Access Codes</a>. '+
        'Name the first tab '+c('Codes')+'. Then <strong>File → Share → Publish to web</strong>, pick that tab, '+
        'choose <strong>Comma-separated values (.csv)</strong>, Publish, and paste the address it gives you into '+
        c('M.ROSTER_CSV')+' in '+c('src/config.js')+'.')+

      row(!!M.CHECKIN_ENDPOINT, true,
        'A place for check-ins to land',
        'A small script that sits inside a second, private Google Sheet and writes a row when somebody checks in.',
        'A website with no server cannot remember anything centrally — each person&rsquo;s progress lives only in '+
        'their own browser, and you cannot see any of it. This gives you one sheet showing who has actually come '+
        'back, how far each person got, and their streak. It is also what carries feature requests to your inbox.',
        'The site works normally and progress still saves on each person&rsquo;s device. You simply have no way to '+
        'see whether anyone is using it, and the &ldquo;ask for a feature&rdquo; box tells people it is not set up.',
        'Make a <em>new, private</em> sheet — never the codes one. <strong>Extensions → Apps Script</strong>, paste '+
        'the contents of '+c('server/Code.gs')+', fill in your email at the top, then <strong>Deploy → New '+
        'deployment → Web app</strong>, execute as <em>Me</em>, access <em>Anyone</em>. Copy the address it gives '+
        'you into '+c('M.CHECKIN_ENDPOINT')+'.')+

      row(!!M.POST_TOKEN, true,
        'A password for that connection',
        'Any random string of characters. The same one goes in two places, and they have to match.',
        'That check-in address is a public web address. Without a shared word, anyone who found it could write '+
        'junk rows into your sheet, or push text into the daily email you read. The token means the address alone '+
        'is not enough.',
        'The connection still works. It is just unlocked — anybody who finds the address can write to your sheet.',
        'Invent a string like '+c('meridian-7f3a-quiet-river')+'. Put it in '+c('M.POST_TOKEN')+' in '+c('src/config.js')+
        ' <strong>and</strong> in '+c('POST_TOKEN')+' at the top of '+c('server/Code.gs')+'. '+
        '<span class="su-warn">Be clear-eyed about this one: that file is downloaded by every visitor, so the token '+
        'can be read by anyone who looks at the page source. It is a lock on the front door, not a secret. Never send '+
        'anything through this connection you would mind a stranger seeing.</span>')+

      row(!!M.SITE_URL, true,
        'The website&rsquo;s real address',
        'The address people will actually type. On GitHub Pages that is '+
        c('https://<your-username>.github.io/<repository-name>/')+' &mdash; free, and it is what is set now.',
        'When somebody saves their passport card and posts it, the address is printed along the bottom. That is the '+
        'only line on the image telling a stranger where to find this.',
        'The card prints whatever address the browser happens to be showing, which during testing is '+
        c('localhost:8848')+'. Anyone who sees the post cannot find the site.',
        'Already set to '+c(M.SITE_URL || '(not set)')+'. If your GitHub username or repository name differs, '+
        'change '+c('M.SITE_URL')+' in '+c('src/config.js')+' to match &mdash; the path has to be the repository name '+
        'exactly, or Pages serves a blank page.')+

      row(false, false,
        'Change the administrator code',
        'The password that opens this screen. It is not written anywhere in this site &mdash; you have it noted down.',
        'The twenty-two participant codes sit in plain text in '+c('src/config.js')+', because they gate content and '+
        'the content is the point. This one opens the cohort screen, so it is stored as a <strong>SHA-256 digest</strong> '+
        'instead &mdash; the code still works exactly as before, but it cannot be read off the page source.',
        'Be clear-eyed about what hashing does: a short code in a known format is guessable given effort, so this stops '+
        'it being <em>read</em>, not <em>broken</em>. If you ever suspect it is out, change it and regenerate the digest.',
        'To change it: pick a new code, run it through any SHA-256 tool <em>uppercased with punctuation stripped</em> '+
        '(so <code>AB-CD-1234</code> hashes as <code>ABCD1234</code>), and paste the digest into the '+c('hash')+' field in '+c('src/config.js')+'.')+
    '</ol>'+

    '<p class="su-tail">Not sure where <code>src/config.js</code> is? It is a text file inside the website folder. '+
    'Open it in any text editor — everything you need to change is at the top, and each line already says what it is for.</p>'+
  '</section>';
}

function requestForm(){
  var sel = M.get('m.reqkind','idea');
  var meta = M.REQUEST_KINDS.filter(function(k){ return k.k===sel; })[0] || M.REQUEST_KINDS[0];
  var off  = !M.CHECKIN_ENDPOINT;

  return '<section class="reqbox" aria-labelledby="reqH">'+
    '<div class="req-head">'+icon('i-note',18,1.7)+
      '<div><h3 id="reqH">Ask for a feature</h3>'+
      '<p>This is a first version and it is meant to keep changing. If something is missing, or wrong, say so — it comes straight to the person who built it.</p></div></div>'+
    (off
      ? '<p class="req-off">'+icon('i-info',15,1.7)+'<span>Sending is not configured on this copy yet. Your trainer needs to set <code>M.CHECKIN_ENDPOINT</code> in <code>src/config.js</code>.</span></p>'
      : '<div class="req-kinds">'+M.REQUEST_KINDS.map(function(k){
          return '<button class="kindchip sm'+(sel===k.k?' on':'')+'" data-reqkind="'+k.k+'">'+esc(k.label)+'</button>';
        }).join('')+'</div>'+
        '<textarea id="reqBox" rows="4" placeholder="'+esc(meta.hint)+'"></textarea>'+
        '<div class="req-foot">'+
          '<button class="btn acc" id="reqSend">Send it</button>'+
          '<span>Your name and access code travel with it, so a reply can find you. Nothing else from your account is attached.</span>'+
        '</div>')+
    '</section>';
}

function viewAwards(){
  return '<div class="topline"><div><h1>Awards</h1><p>Nine, each named after a line from the programme. They are granted once, on a stated condition.</p></div></div>'+
    passport()+
    '<h2 class="sect-h">The nine</h2>'+
    awardGrid();
}

function journalBody(tab){
  tab = tab || M.get('m.jtab','notes');
  var isAsk = tab==='ask';
  var head =
    '<div class="jtabs" role="tablist">'+
      '<button class="jtab'+(!isAsk?' on':'')+'" data-jtab="notes" role="tab" aria-selected="'+(!isAsk)+'">Notes</button>'+
      '<button class="jtab'+(isAsk?' on':'')+'" data-jtab="ask" role="tab" aria-selected="'+isAsk+'">Ask Meridian</button>'+
    '</div>';
  return head + (isAsk ? askPane() : notesPane());
}

function notesPane(){
  var kinds = M.NOTE_KINDS;
  var sel = M.get('m.notekind','assumption');
  var filter = M.get('m.notefilter','all');
  var notes = M.S.notes || [];
  var counts = {};
  notes.forEach(function(n){ var k=n.k||'assumption'; counts[k]=(counts[k]||0)+1; });

  var chips = '<div class="kindrow">'+
    '<button class="kindchip'+(filter==='all'?' on':'')+'" data-filter="all">All <span class="n">'+notes.length+'</span></button>'+
    kinds.map(function(k){
      return '<button class="kindchip'+(filter===k.k?' on':'')+'" data-filter="'+k.k+'">'+
        esc(k.label)+' <span class="n">'+(counts[k.k]||0)+'</span></button>';
    }).join('')+'</div>';

  var shown = filter==='all' ? notes : notes.filter(function(n){ return (n.k||'assumption')===filter; });
  var list = shown.length ? shown.map(function(n,i){
    var kind = M.noteKind(n.k);
    var idx = notes.indexOf(n);
    return '<div class="note"><span class="ntag" data-k="'+esc(kind.k)+'">'+esc(kind.label)+'</span>'+
      '<time>'+esc(n.d)+(n.city?' · '+esc(n.city):'')+'</time>'+esc(n.t)+
      '<div class="nfoot">'+
        (n.shared
          ? '<span class="nshared">'+icon('i-check',12,2.4)+'Shared with the trainer</span>'
          : '<button class="nshare" data-sharenote="'+idx+'">Share</button>')+
      '</div>'+
      '<button class="ndel" data-delnote="'+idx+'" aria-label="Delete note">'+icon('i-x',13,2)+'</button></div>';
  }).join('') : '<div class="empty"><h3>'+(notes.length?'Nothing in this category yet':'Nothing written yet')+'</h3>'+
      '<p>The question above is the only one on this site that predicts whether anything changes after the programme ends.</p></div>';

  return '<p class="ask">Name one assumption sitting in a real file on your desk right now that nobody has verified. State what it would cost if it were wrong, and the single step that would turn it into a fact.</p>'+
    '<div class="kindpick">'+kinds.map(function(k){
      return '<button class="kindchip sm'+(sel===k.k?' on':'')+'" data-setkind="'+k.k+'" title="'+esc(k.hint)+'">'+esc(k.label)+'</button>';
    }).join('')+'</div>'+
    '<textarea id="noteBox" placeholder="'+esc(M.noteKind(sel).hint)+'"></textarea>'+
    '<div style="display:flex;gap:10px;margin:13px 0 4px;align-items:center;flex-wrap:wrap">'+
      '<button class="btn acc" id="saveNote">Save note</button>'+
      '<span style="font-size:.8rem;color:var(--paper-ink);opacity:.62">No wrong answer. Only a specific one or a vague one.</span>'+
    '</div>'+
    /* Said before they write, not buried in a policy. The prompt asks for
       something off a real credit file, so the answer to "where does this
       go" has to be on the same screen as the question. */
    '<p class="privnote">'+icon('i-lock',13,1.8)+'<span><strong>Notes stay on this device.</strong> Nothing you write here is uploaded. '+
      'Your trainer sees only how many notes you have written — never what they say — unless you tap <strong>Share</strong> on a particular note.</span></p>'+
    chips +
    '<div class="notelist">'+list+'</div>';
}

function askPane(){
  var q = M.get('m.lastask','');
  var res = q ? M.ask(q) : [];
  var body;
  if(!q){
    body = '<div class="empty"><h3>Ask about anything in the programme</h3>'+
      '<p>It searches the seven cities, the guide, the videos and the reading list, and shows you the passage it found.</p></div>'+
      '<div class="suggest">'+['What does LGD depend on?','When does an exposure move to Stage 2?',
        'How do I read a vintage curve?','Why is collateral last?','What is a healthy override rate?']
        .map(function(s){ return '<button class="sugg" data-suggest="'+esc(s)+'">'+esc(s)+'</button>'; }).join('')+'</div>';
  } else if(!res.length){
    body = '<div class="empty"><h3>Nothing matched</h3><p>Try a term from the material — a ratio, a stage, a city, a framework.</p></div>';
  } else {
    body = '<div class="answers">'+res.map(function(r){
      var to = r.kind==='video' ? '<button class="ansgo" data-video="'+r.vid+'" data-vt="'+esc(r.title)+'">Watch '+icon('i-arrow',13,2)+'</button>'
            : (r.kind==='read'||r.kind==='download') ? '<a class="ansgo" href="'+r.url+'" target="_blank" rel="noopener noreferrer">Open '+icon('i-arrow',13,2)+'</a>'
            : '<button class="ansgo" data-city="'+r.city+'">'+esc(r.cityName)+' '+icon('i-arrow',13,2)+'</button>';
      var src = r.kind==='guide' ? esc(M.GUIDE.name)+' · '+esc(r.cityName)
              : r.kind==='city' ? 'Stop '+r.stop+' · '+esc(r.cityName)+' · '+esc(r.where)
              : esc(r.where);
      return '<div class="answer"><span class="asrc">'+src+'</span>'+
        '<p>'+esc(String(r.text).replace(/<[^>]+>/g,''))+'</p>'+to+'</div>';
    }).join('')+'</div>';
  }
  return '<div class="askbar">'+
      '<input id="askBox" type="search" placeholder="Ask about anything in the programme" value="'+esc(q)+'" autocomplete="off">'+
      '<button class="btn acc" id="askGo">Ask</button>'+
    '</div>'+
    '<p class="asknote">Every answer here is a <strong>quote from this app</strong> — the seven cities, the guide, or the reading list. It does not generate text, so it cannot invent a number at you.</p>'+
    body;
}


function roleBanner(){
  if(!M.user) return '';
  if(M.user.role==='recruiter')
    return '<div class="banner" style="background:var(--brand-soft);color:var(--brand-text)">'+
      icon('i-info',16,1.7)+'<span><strong>Preview access.</strong> All seven cities are unlocked so you can read the whole thing in any order. '+
      'Nothing you do here is counted with the cohort.</span></div>';
  return '';
}

function viewCohort(){
  var seats = M.ROSTER.filter(function(r){ return r.role==='participant'; });
  var claimed = 0, rows = seats.map(function(r){
    var raw = M.get('m.s.'+String(r.code).toUpperCase().replace(/[^A-Z0-9]/g,''), null);
    var who = raw && raw.name ? raw.name : null;
    if(who) claimed++;
    return '<tr><td class="num">'+r.seat+'</td>'+
      '<td><code>'+esc(r.code)+'</code></td>'+
      '<td>'+(who ? esc(who) : '<span style="color:var(--text-3)">unclaimed on this device</span>')+'</td>'+
      '<td class="num">'+(raw ? raw.xp : '—')+'</td>'+
      '<td class="num">'+(raw ? Object.keys(raw.done).length+' / 7' : '—')+'</td></tr>';
  }).join('');

  return setupPanel()+ '<div class="topline"><div><h1>Cohort</h1>'+
    '<p>Twenty seats. People type their own name against a code, so the pairing arrives with them.</p></div></div>'+

    '<div class="banner" style="background:var(--surface-2);color:var(--text-2)">'+icon('i-info',16,1.7)+
    '<span><strong>This table only sees this browser.</strong> There is no server, so progress made on '+
    'someone else\'s phone cannot appear here. '+
    (M.SHEET_URL
      ? 'The live cohort lives in <a href="'+M.SHEET_URL+'" target="_blank" rel="noopener">your Google Sheet</a>.'
      : 'Deploy <code>server/Code.gs</code> and set <code>M.SHEET_URL</code> to see the live cohort in Google Sheets.')+
    '</span></div>'+

    '<div class="grid2" style="margin-bottom:18px">'+
      '<div class="panel pad"><div class="stat"><span class="k">Seats</span><span class="v num">'+seats.length+'</span></div></div>'+
      '<div class="panel pad"><div class="stat"><span class="k">Claimed here</span><span class="v num">'+claimed+'</span></div></div>'+
      '<div class="panel pad"><div class="stat"><span class="k">Sheet</span><span class="v" style="font-size:1.1rem">'+
        (M.CHECKIN_ENDPOINT ? 'Connected' : 'Not wired')+'</span></div></div>'+
    '</div>'+

    '<div class="dtable"><table><thead><tr><th>Seat</th><th>Code</th><th>Name given</th><th>XP</th><th>Cities</th></tr></thead>'+
    '<tbody>'+rows+'</tbody></table></div>'+

    '<h2 style="font-size:1.2rem;margin:30px 0 12px">The other two codes</h2>'+
    '<div class="dtable"><table><tbody>'+
      '<tr><td>Recruiters</td><td><code>MERIDIAN-TOUR</code></td><td>All seven cities unlocked. Tagged separately.</td></tr>'+
      '<tr><td>You</td><td><span class="muted">held by you</span></td><td>Adds this screen.</td></tr>'+
    '</tbody></table></div>';
}

M.requestForm = requestForm;
M.awardDetail = awardDetail;
M.mapIntro = mapIntro;
M.fileResult = fileResult; M.elResult = elResult; M.scoreResult = scoreResult;

M.views = { dash:viewDash, desk:viewDesk, file:viewFile, tour:viewTour, city:viewCity, awards:viewAwards, cohort:viewCohort, resources:viewResources, thanks:viewThanks };
M.journalBody = journalBody;
M.notesPane = notesPane;
M.askPane = askPane;
M.roadmap = roadmap;
M.awardGrid = awardGrid;

})(window.M = window.M || {});
