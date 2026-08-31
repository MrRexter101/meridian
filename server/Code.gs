/**
 * MERIDIAN — the sheet behind the tour.
 *
 * Four tabs, created on demand:
 *   Roster      one row per access code, UPSERTED. Who claimed it, and how far
 *               they have got. This is the tab you actually read.
 *   Check-ins   append-only log, one row per day per person.
 *   Field notes append-only — and ONLY the notes a participant chose to send.
 *   Requests    feature requests and bug reports from inside the app.
 *
 * Roster is an upsert rather than a log because a cohort studying for a month
 * would otherwise produce hundreds of rows, and you would need a formula just
 * to answer "how far did Rinzin get".
 *
 * ── ON FIELD NOTES ───────────────────────────────────────────────────────
 * The app asks people to name an unverified assumption sitting in a real
 * credit file on their desk. That means a note can carry a live borrower's
 * name and an undisclosed number. Nothing here receives a note unless the
 * participant tapped Share on that specific note. Do not add a way to
 * collect them silently — the answers stop being honest the moment people
 * suspect you can read them, and at a bank it is a confidentiality problem
 * before it is a product one.
 *
 * ── ON THE ENDPOINT ──────────────────────────────────────────────────────
 * This is deployed as "Anyone", because a static site posts without signing
 * in. POST_TOKEN below raises the bar — the URL alone is no longer enough —
 * and unknown codes are rejected outright. But a static site cannot keep a
 * secret: the token is in the published JavaScript, and anyone who reads
 * the bundle can read it. Treat this as deterrence against drive-by writes,
 * NOT as authentication. Never put anything here you would mind a stranger
 * appending a row to.
 *
 * SETUP — about five minutes, once:
 *  1. Create a Google Sheet. Name it "Meridian — Cohort".
 *  2. Extensions → Apps Script. Delete the placeholder, paste this whole file.
 *  3. Set POST_TOKEN below to the same string as M.POST_TOKEN in
 *     src/config.js. There is nothing else to fill in: mail goes to the
 *     account the script runs as, and the code list is read from the
 *     published access-codes sheet.
 *  4. Deploy → New deployment → Web app.
 *       Execute as:      Me
 *       Who has access:  Anyone
 *  5. Copy the Web app URL into M.CHECKIN_ENDPOINT in src/config.js, and
 *     the Sheet's own URL into M.SHEET_URL.
 *  6. Optional daily digest: Triggers (clock icon) → Add trigger →
 *     function sendDigest, time-driven, day timer, 7–8am.
 *
 * RE-DEPLOYING AFTER AN EDIT — the step everyone misses:
 *     Deploy → Manage deployments → pencil icon → Version: New version.
 * Saving the editor does NOT update the live web app. If you paste this
 * file over the old one and skip that, the URL keeps running the old code
 * and nothing appears to change.
 */

/* WHERE MAIL GOES — deliberately not a constant you have to fill in.

   This file lives in a public repository, so an address written here is
   scrapeable by every crawler that walks GitHub. But leaving it blank is
   worse: MailApp.sendEmail({to:''}) throws, the throw is caught, and the
   result is silence — which is exactly the failure that happened.

   So it resolves itself. The script is deployed "execute as me", so the
   effective user IS you, and that is the address. No setup step to forget,
   nothing sensitive committed, and no way to leave it empty.

   To send somewhere else, add a script property instead of editing this:
     Project Settings → Script properties → REQUESTS_TO = other@example.com */
function mailTo_(which) {
  var props = PropertiesService.getScriptProperties();
  var override = props.getProperty(which);
  if (override) return override;
  var me = Session.getEffectiveUser().getEmail();
  if (me) return me;
  throw new Error('No recipient: set a ' + which + ' script property.');
}

/* Any non-guessable string. Must match M.POST_TOKEN in src/config.js. */
var POST_TOKEN = 'Meridianismy2ndprojectyayy#';

/* The ONLY four tabs this script touches, and it reaches every one of them
   by name — never by position, never getActiveSheet(). Any other tab in
   this spreadsheet is yours: a cohort tracker, scratch working, anything.
   It will not be written to, cleared, reordered or reported on. If you add
   a tab here, keep the name distinct from these four. */
var T = { roster: 'Roster', checkins: 'Check-ins', notes: 'Field notes', reqs: 'Requests' };

var HEAD = {
  'Roster':      ['Code', 'Seat', 'Name', 'Role', 'First seen', 'Last seen',
                  'XP', 'Streak', 'Cities', 'Awards', 'Notes'],
  'Check-ins':   ['Logged at', 'Day', 'Code', 'Name', 'Role', 'Streak', 'XP', 'Cities'],
  'Field notes': ['Logged at', 'Code', 'Name', 'Role', 'Field note'],
  'Requests':    ['Logged at', 'Code', 'Name', 'Kind', 'Message', 'Emailed']
};

function doPost(e) {
  try {
    if (!e || !e.postData) return ok();
    var p = JSON.parse(e.postData.contents);

    /* Deterrence, not authentication — see the note at the top. */
    if (POST_TOKEN && String(p.token || '') !== POST_TOKEN) return ok();

    var code = String(p.code || '').trim();
    if (!code) return ok();
    /* Only codes that already exist on the roster may write. Without this,
       the endpoint will happily create a row for anything posted at it. */
    if (!knownCode_(code)) return ok();
    if (throttled_(code)) return ok();

    upsertRoster_(p);

    if (p.type === 'checkin') {
      sheet_(T.checkins).appendRow([
        new Date(), clean_(p.day, 20), code, clean_(p.name, 120), clean_(p.role, 30),
        num_(p.streak), num_(p.xp), num_(p.cities)
      ]);
    } else if (p.type === 'note') {
      /* Only ever reached because someone tapped Share on this note. */
      sheet_(T.notes).appendRow([
        new Date(), code, clean_(p.name, 120), clean_(p.role, 30), clean_(p.text, 2000)
      ]);
    } else if (p.type === 'request') {
      handleRequest_(p, code);
    }
    return ok();
  } catch (err) {
    // Never throw. A failed log must not break someone's streak.
    return ok();
  }
}

/* ── Who is allowed to write ────────────────────────────────────────────
   This used to read the Roster tab. That tab is populated BY this script,
   by upsertRoster_, which runs AFTER this check — so the very first write
   found it empty and was allowed, created a row, and from that moment
   every OTHER code was "not on the roster" and was silently dropped.
   Exactly one participant ever got through. That is the bug that made the
   check-in sheet look broken.

   The real list of who is allowed is the published access-codes sheet —
   the same CSV the site itself reads. So read that. It is already public,
   so fetching it discloses nothing, and adding a row there now grants
   access to both the site and this endpoint at once.

   If the sheet cannot be reached, ACCEPT the write. A network blip on
   Google's side must not throw away somebody's streak; the token and the
   rate limit are still in front of us. */
var ROSTER_CSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQptExgi0IFtQuDtywHgaws8Kn4tA1ZOWWuFGoABd4PKWe-6axrBcW9xHWlrN7_VEvp8oiiqLbot8Ze/pub?output=csv';

function normCode_(v) { return String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }

function knownCode_(code) {
  if (!ROSTER_CSV) return true;
  var cache = CacheService.getScriptCache();
  var hit = cache.get('codes_v2');
  var codes;
  if (hit) {
    codes = JSON.parse(hit);
  } else {
    try {
      var csv = UrlFetchApp.fetch(ROSTER_CSV, { muteHttpExceptions: true, followRedirects: true });
      if (csv.getResponseCode() !== 200) return true;         // unreachable: let it through
      var rows = Utilities.parseCsv(csv.getContentText());
      if (!rows || rows.length < 2) return true;
      var head = rows[0].map(function (h) { return String(h).trim().toLowerCase(); });
      var iCode = head.indexOf('code'), iActive = head.indexOf('active');
      if (iCode < 0) return true;
      codes = [];
      for (var r = 1; r < rows.length; r++) {
        var c = normCode_(rows[r][iCode]);
        if (!c) continue;
        if (iActive >= 0) {
          var a = String(rows[r][iActive] || '').trim().toLowerCase();
          if (a === 'false' || a === 'no' || a === '0') continue;   // revoked
        }
        codes.push(c);
      }
      cache.put('codes_v2', JSON.stringify(codes), 300);
    } catch (err) {
      return true;                                            // never lock the room out
    }
  }
  if (!codes.length) return true;
  return codes.indexOf(normCode_(code)) >= 0;
}

/* One write per code per 5 seconds. Stops a stuck retry loop or a bored
   visitor filling the sheet. */
function throttled_(code) {
  var cache = CacheService.getScriptCache();
  var k = 'rl_' + code.toUpperCase();
  if (cache.get(k)) return true;
  cache.put(k, '1', 5);
  return false;
}

/* Strip anything that could format an email or a cell. The digest is sent as
   plain text, and a leading = + - @ is how a spreadsheet gets talked into
   running a formula. */
function clean_(v, max) {
  var t = String(v == null ? '' : v).slice(0, max || 2000);
  t = t.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  if (/^[=+\-@\t\r]/.test(t)) t = "'" + t;
  return t;
}

/* Feature requests and bug reports. The destination address lives HERE, in
   the script, and never in the published bundle — so it cannot be scraped
   off the page by a crawler looking for addresses to spam. */
function handleRequest_(p, code) {
  var kind = clean_(p.kind || 'idea', 40);
  var msg  = clean_(p.text, 4000);
  if (msg.length < 4) return;

  var sent = '';
  try {
    MailApp.sendEmail({
      to: mailTo_('REQUESTS_TO'),
      /* Newlines stripped: a subject line is a mail header, and an
         unescaped CR/LF in one is how extra headers get injected. */
      subject: ('Meridian · ' + kind + ' from ' + clean_(p.name || code, 80))
                 .replace(/[\r\n]+/g, ' ').slice(0, 180),
      body: [
        kind.toUpperCase(),
        '',
        msg,
        '',
        '— — —',
        'From:  ' + clean_(p.name || '(no name)', 120) + '  [' + code + ']',
        'Role:  ' + clean_(p.role || 'participant', 30),
        'Seat:  ' + clean_(p.seat || '—', 20),
        'XP:    ' + num_(p.xp) + '   Cities: ' + num_(p.cities),
        'Sent:  ' + new Date()
      ].join('\n')
    });
    sent = 'yes';
  } catch (err) {
    sent = 'FAILED: ' + err;      // quota exhausted, most likely
  }
  sheet_(T.reqs).appendRow([new Date(), code, clean_(p.name, 120), kind, msg, sent]);
}

/* Open the deployment URL in a browser to see whether it is alive and how
   it is configured. Previously this returned a bare {ok:true}, which told
   you nothing when something was wrong. Reports no addresses and no codes
   — only whether each piece resolves. */
function doGet() {
  var out = { ok: true, service: 'Meridian check-in endpoint' };
  try { out.recipientResolves = !!mailTo_('REQUESTS_TO'); }
  catch (err) { out.recipientResolves = false; out.recipientError = String(err); }
  out.tokenRequired = !!POST_TOKEN;
  /* Report whether OUR four tabs exist — never enumerate what is actually
     in the file. This endpoint is deployed "access: Anyone", so anything
     returned here is public. Listing every tab published the owner's own
     tab names alongside ours, and people keep private working tabs in this
     spreadsheet: a tracker named "Participant names and codes" would have
     had that name readable by anyone holding the URL. Their tabs are not
     ours to advertise. */
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    out.boundToSpreadsheet = !!ss;
    if (ss) {
      out.tabsReady = {};
      [T.roster, T.checkins, T.notes, T.reqs].forEach(function (name) {
        out.tabsReady[name] = !!ss.getSheetByName(name);
      });
    }
  } catch (err) { out.boundToSpreadsheet = 'ERROR: ' + err; }
  out.codeListReachable = knownCode_('___probe___') !== undefined;
  try { out.mailQuotaRemaining = MailApp.getRemainingDailyQuota(); } catch (err) {}
  return ContentService.createTextOutput(JSON.stringify(out, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}

function ok() {
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function num_(v) { return Number(v || 0); }

function sheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(HEAD[name]);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEAD[name].length).setFontWeight('bold');
  }
  return sh;
}

/** One row per code, updated in place. */
function upsertRoster_(p) {
  var sh = sheet_(T.roster);
  var last = sh.getLastRow();
  var row = 0;

  if (last > 1) {
    var codes = sh.getRange(2, 1, last - 1, 1).getValues();
    for (var i = 0; i < codes.length; i++) {
      if (String(codes[i][0]) === String(p.code)) { row = i + 2; break; }
    }
  }

  var now = new Date();
  /* Every one of these is attacker-controlled: the name is typed by the
     participant at sign-in and nothing validates it. Straight into a cell,
     a name of `=HYPERLINK("http://evil","Payroll")` becomes a live formula
     in your sheet. clean_ prefixes a quote so it stays text. */
  var values = [
    clean_(p.code, 40), clean_(p.seat, 20), clean_(p.name, 120), clean_(p.role, 30),
    now, now,
    num_(p.xp), num_(p.streak), num_(p.cities), num_(p.awards), num_(p.notes)
  ];

  if (row) {
    var firstSeen = sh.getRange(row, 5).getValue() || now;
    values[4] = firstSeen;                       // never overwrite first seen
    sh.getRange(row, 1, 1, values.length).setValues([values]);
  } else {
    sh.appendRow(values);
  }
}

/**
 * Daily digest. Who checked in yesterday, who is on a streak, and — the part
 * that actually matters — any new field notes.
 */
function sendDigest() {
  var sh = sheet_(T.checkins);
  var rows = sh.getDataRange().getValues();
  if (rows.length < 2) return;

  var y = new Date(Date.now() - 864e5);
  var key = Utilities.formatDate(y, Session.getScriptTimeZone(), 'yyyy-MM-dd');

  var people = [];
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][1]) !== key) continue;
    if (String(rows[i][4]) === 'recruiter') continue;      // not part of the cohort
    people.push({ name: rows[i][3], streak: rows[i][5], xp: rows[i][6], cities: rows[i][7] });
  }

  var ns = sheet_(T.notes).getDataRange().getValues();
  var notes = [];
  for (var j = 1; j < ns.length; j++) {
    var when = ns[j][0];
    if (when instanceof Date &&
        Utilities.formatDate(when, Session.getScriptTimeZone(), 'yyyy-MM-dd') === key) {
      notes.push({ name: ns[j][2], text: ns[j][4] });
    }
  }

  if (!people.length && !notes.length) return;
  people.sort(function (a, b) { return b.streak - a.streak; });

  var html = '<div style="font:15px/1.6 -apple-system,Segoe UI,Roboto,sans-serif;color:#1D1913">' +
    '<h2 style="font-weight:600;margin:0 0 4px">Meridian &mdash; ' + key + '</h2>' +
    '<p style="color:#4A423A;margin:0 0 18px">' + people.length + ' checked in.</p>';

  if (people.length) {
    html += '<table cellpadding="7" style="border-collapse:collapse;font-size:14px">' +
      '<tr style="background:#F1EADC"><th align="left">Name</th><th align="left">Streak</th>' +
      '<th align="left">XP</th><th align="left">Cities</th></tr>';
    people.forEach(function (p) {
      html += '<tr style="border-bottom:1px solid #DED4C0"><td>' + p.name + '</td><td>' +
        p.streak + '</td><td>' + p.xp + '</td><td>' + p.cities + ' / 7</td></tr>';
    });
    html += '</table>';
  }

  if (notes.length) {
    html += '<h3 style="font-weight:600;margin:26px 0 8px">Field notes &mdash; read these first</h3>';
    notes.forEach(function (n) {
      html += '<p style="background:#FCF9F0;border:1px solid #D9CFB8;padding:12px 14px;' +
        'border-radius:10px;margin:0 0 10px"><strong>' + n.name + '</strong><br>' + n.text + '</p>';
    });
  } else {
    html += '<p style="color:#8A3521;margin-top:26px"><strong>No field notes yesterday.</strong> ' +
      'That is the number to watch &mdash; not the check-in count.</p>';
  }

  html += '</div>';

  MailApp.sendEmail({
    to: mailTo_('DIGEST_TO'),
    subject: 'Meridian — ' + people.length + ' checked in, ' + notes.length + ' field notes',
    htmlBody: html
  });
}
