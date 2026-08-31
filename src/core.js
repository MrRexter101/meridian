/* MERIDIAN · core · storage, progress, streaks, check-in */
(function(M){
'use strict';

/* ───────── 2. STORAGE — honest about failure ───────── */
var memStore = {}, storageOK = true;
try{
  var k='__m'+Date.now(); localStorage.setItem(k,'1'); localStorage.removeItem(k);
}catch(e){ storageOK = false; }
function put(k,v){
  var s = JSON.stringify(v);
  if(storageOK){ try{ localStorage.setItem(k,s); return; }catch(e){ storageOK=false; } }
  memStore[k]=s;
}
function get(k,d){
  var s = null;
  if(storageOK){ try{ s = localStorage.getItem(k); }catch(e){ storageOK=false; } }
  if(s===null) s = memStore[k];
  if(s==null) return d;
  try{ return JSON.parse(s); }catch(e){ return d; }
}


/* ───────── 4. STATE ───────── */

function blank(){ return {xp:0, streak:0, last:null, done:{}, scores:{}, awards:[], awardsAt:{}, notes:[], checks:[], queue:[], joined:null, name:null}; }
function load(){ M.S = M.user ? get('m.s.'+M.user.u, blank()) : blank(); }
function save(){ if(M.user) put('m.s.'+M.user.u, M.S); }
function dayKey(d){ d=d||new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function daysBetween(a,b){ return Math.round((new Date(b+'T00:00:00') - new Date(a+'T00:00:00'))/864e5); }
function rankOf(xp){ var r=M.TIERS[0]; for(var i=0;i<M.TIERS.length;i++) if(xp>=M.TIERS[i].min) r=M.TIERS[i]; return r; }
function nextTier(xp){ for(var i=0;i<M.TIERS.length;i++) if(M.TIERS[i].min>xp) return M.TIERS[i]; return null; }
function unlockedCount(){ var n=0; for(var i=0;i<M.CITIES.length;i++) if(M.S.done[M.CITIES[i].id]) n++; return n; }
function isOpen(i){
  if(M.user && M.user.role==='recruiter') return true;
  return i===0 || !!M.S.done[M.CITIES[i-1].id];
}

function grant(id){
  if(M.S.awards.indexOf(id)>=0) return false;      // idempotent — or re-visits farm awards
  M.S.awards.push(id); M.fresh.push(id);
  /* When, not just whether. A postcard without a date is a sticker. */
  M.S.awardsAt = M.S.awardsAt || {};
  M.S.awardsAt[id] = dayKey();
  save();
  var a=M.AWARDS.filter(function(x){return x.id===id})[0];
  if(a) toast('Award unlocked — ' + a.n);
  return true;
}
function checkAwards(){
  M.AWARDS.forEach(function(a){
    if(a.city && M.S.done[a.city]) grant(a.id);
    if(a.streak && M.S.streak>=a.streak) grant(a.id);
    if(a.note && M.S.notes.length) grant(a.id);
  });
}
function addXp(n){ if(n<=0) return; var before=rankOf(M.S.xp).rank; M.S.xp+=n; save();
  var after=rankOf(M.S.xp).rank; if(after!==before) setTimeout(function(){toast('Promoted to '+after);},1400); }


/* ───────── 5. CHECK-IN ───────── */
function checkedInToday(){ return M.S.last===dayKey(); }
function doCheckIn(){
  if(checkedInToday()) return;
  var today=dayKey();
  if(!M.S.last) M.S.streak=1;
  else { var g=daysBetween(M.S.last,today); M.S.streak = g===1 ? M.S.streak+1 : (g>1 ? 1 : M.S.streak); }
  M.S.last=today; M.S.checks.push(today); M.justLit=true; addXp(M.XP.checkin); checkAwards(); save();
  queueSend({ type:'checkin', day:today });
  toast(M.S.streak===1 ? 'Checked in. Day one.' : 'Checked in. '+M.S.streak+' days running.');
  if(M.render) M.render();   // core owns the rules; app owns the pixels
}
function queueSend(payload){
  if(!M.user) return;
  payload.code = M.user.code;
  payload.name = M.user.name;
  payload.role = M.user.role || 'participant';
  payload.seat = M.user.seat || '';
  payload.at   = new Date().toISOString();
  if(M.POST_TOKEN) payload.token = M.POST_TOKEN;
  payload.xp     = M.S.xp;
  payload.streak = M.S.streak;
  payload.cities = unlockedCount();
  payload.awards = M.S.awards.length;
  payload.notes  = M.S.notes.length;
  /* Counts only. The text of a field note NEVER rides along on a
     check-in: the prompt asks people to name an unverified assumption
     "sitting in a real file on your desk right now", so a note can hold a
     live borrower's name and a number that has not been disclosed. That
     belongs on the participant's device unless they deliberately send it,
     and it is not something to learn from a digest email. */
  M.S.queue.push(payload); save(); flush();
}
function flush(){
  if(!M.CHECKIN_ENDPOINT || !M.S || !M.S.queue.length || !navigator.onLine) return;
  var batch=M.S.queue.slice(); 
  batch.forEach(function(p){
    // no-cors: Apps Script accepts the write; we cannot read the reply, so we
    // drop the item optimistically and let the next check-in re-send if needed.
    fetch(M.CHECKIN_ENDPOINT,{method:'POST',mode:'no-cors',
      headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(p)})
      .then(function(){ var i=M.S.queue.indexOf(p); if(i>=0){M.S.queue.splice(i,1); save();} })
      .catch(function(){});
  });
}
window.addEventListener('online', flush);


/* ───────── 6. HELPERS ───────── */
var $=function(s,r){return (r||document).querySelector(s)};
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
function icon(id,sz,sw){return '<svg width="'+(sz||19)+'" height="'+(sz||19)+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="'+(sw||1.6)+'" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#'+id+'"/></svg>';}
var toastT=null;
function toast(msg){
  var el=$('#toast'); el.innerHTML=icon('i-check',16,2)+'<span>'+esc(msg)+'</span>';
  el.classList.add('up'); clearTimeout(toastT);
  toastT=setTimeout(function(){el.classList.remove('up')},3200);
}


/* ───────── 7. THEME ───────── */
function applyTheme(){
  var t=get('m.theme','system');
  if(t==='system') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme',t);
  var lbl=$('#themeLbl'), ic=$('#themeIcon');
  if(lbl) lbl.textContent = t==='system'?'System theme':(t==='dark'?'Dark':'Light');
  if(ic) ic.setAttribute('href', t==='dark'?'#i-moon':'#i-sun');
}
function cycleTheme(){
  var order=['system','light','dark'], t=get('m.theme','system');
  put('m.theme', order[(order.indexOf(t)+1)%3]); applyTheme();
  if(M.repaint) M.repaint();   // the canvas world re-reads its tokens
}

/* ── public surface ────────────────────────────────────────── */
M.put=put; M.get=get; M.blank=blank; M.load=load; M.save=save;
M.dayKey=dayKey; M.daysBetween=daysBetween;
M.rankOf=rankOf; M.nextTier=nextTier; M.unlockedCount=unlockedCount; M.isOpen=isOpen;
M.grant=grant; M.checkAwards=checkAwards; M.addXp=addXp;
M.checkedInToday=checkedInToday; M.doCheckIn=doCheckIn; M.queueSend=queueSend; M.flush=flush;
M.$=$; M.esc=esc; M.icon=icon; M.toast=toast;
M.applyTheme=applyTheme; M.cycleTheme=cycleTheme;
M.storageOK=function(){ return storageOK; };
M.S=null;
M.user = get('m.user', null);
M.fresh = [];        // awards won this session — the only place with overshoot
M.justLit = false;   // the check-in flame fires once, on the render after the tap


/* ── SHA-256, synchronous ──────────────────────────────────────────────
   Used for exactly one thing: matching the admin code without printing
   it in a file every visitor downloads.

   Written out rather than calling crypto.subtle because that API is
   async and only exists in a secure context — and this site has to keep
   working when somebody opens index.html straight off a USB stick, where
   sign-in must stay synchronous and crypto.subtle may not exist at all.

   Verified against Node's crypto for the empty string, 'abc', and the
   code in use. */
M.sha256 = function (msg) {
  function rotr(n, x) { return (x >>> n) | (x << (32 - n)); }
  var K = [
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  var H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];

  /* UTF-8 bytes */
  var bytes = [], i, c;
  for (i = 0; i < msg.length; i++) {
    c = msg.charCodeAt(i);
    if (c < 0x80) bytes.push(c);
    else if (c < 0x800) bytes.push(0xc0 | (c >> 6), 0x80 | (c & 63));
    else bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
  }
  var bitLen = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  for (i = 7; i >= 0; i--) bytes.push((bitLen / Math.pow(2, i * 8)) & 0xff);

  var w = new Array(64);
  for (var off = 0; off < bytes.length; off += 64) {
    for (i = 0; i < 16; i++) {
      w[i] = (bytes[off+i*4] << 24) | (bytes[off+i*4+1] << 16) | (bytes[off+i*4+2] << 8) | bytes[off+i*4+3];
    }
    for (i = 16; i < 64; i++) {
      var s0 = rotr(7, w[i-15]) ^ rotr(18, w[i-15]) ^ (w[i-15] >>> 3);
      var s1 = rotr(17, w[i-2]) ^ rotr(19, w[i-2]) ^ (w[i-2] >>> 10);
      w[i] = (w[i-16] + s0 + w[i-7] + s1) | 0;
    }
    var a=H[0],b=H[1],cc=H[2],d=H[3],e=H[4],f=H[5],g=H[6],h=H[7];
    for (i = 0; i < 64; i++) {
      var S1 = rotr(6,e) ^ rotr(11,e) ^ rotr(25,e);
      var ch = (e & f) ^ (~e & g);
      var t1 = (h + S1 + ch + K[i] + w[i]) | 0;
      var S0 = rotr(2,a) ^ rotr(13,a) ^ rotr(22,a);
      var mj = (a & b) ^ (a & cc) ^ (b & cc);
      var t2 = (S0 + mj) | 0;
      h=g; g=f; f=e; e=(d+t1)|0; d=cc; cc=b; b=a; a=(t1+t2)|0;
    }
    H[0]=(H[0]+a)|0; H[1]=(H[1]+b)|0; H[2]=(H[2]+cc)|0; H[3]=(H[3]+d)|0;
    H[4]=(H[4]+e)|0; H[5]=(H[5]+f)|0; H[6]=(H[6]+g)|0; H[7]=(H[7]+h)|0;
  }
  return H.map(function (x) { return ('00000000' + (x >>> 0).toString(16)).slice(-8); }).join('');
};

})(window.M = window.M || {});
