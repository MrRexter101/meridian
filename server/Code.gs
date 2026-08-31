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
 *  3. Fill in DIGEST_TO, REQUESTS_TO and POST_TOKEN below.
 *  4. Deploy → New deployment → Web app.
 *       Execute as:      Me
 *       Who has access:  Anyone
 *  5. Copy the Web app URL.
 *  6. In src/config.js set M.CHECKIN_ENDPOINT to that URL, M.POST_TOKEN to the
 *     same token, and M.SHEET_URL to the Sheet's own URL.
 *  7. Optional daily digest: Triggers (clock icon) → Add trigger →
 *     function sendDigest, time-driven, day timer, 7–8am.
 */

/* Fill these in inside the Apps Script editor, NOT here.
   This file is a template that lives in a public repository — an address
   committed here is scrapeable by anyone, and by every crawler that walks
   GitHub looking for exactly this. The whole reason the destination sits
   server-side is so it is not published; committing it undoes that. The
   copy you paste into Apps Script is private to your Google account. */
var DIGEST_TO   = '';   // ← your address, set in the Apps Script editor
var REQUESTS_TO = '';   // ← your address, set in the Apps Script editor

/* Any non-guessable string. Must match M.POST_TOKEN in src/config.js. */
var POST_TOKEN = 'Meridianismy2ndprojectyayy#';

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
        new Date(), p.day || '', code, p.name || '', p.role || '',
        num_(p.streak), num_(p.xp), num_(p.cities)
      ]);
    } else if (p.type === 'note') {
      /* Only ever reached because someone tapped Share on this note. */
      sheet_(T.notes).appendRow([
        new Date(), code, p.name || '', p.role || '', clean_(p.text, 2000)
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

/* Is this a code we issued? Reads the Roster tab, which the app upserts, plus
   anything you have typed in by hand. Cached so a burst of check-ins does not
   read the whole sheet once per request. */
function knownCode_(code) {
  var cache = CacheService.getScriptCache();
  var hit = cache.get('codes');
  var codes;
  if (hit) {
    codes = JSON.parse(hit);
  } else {
    codes = [];
    var sh = sheet_(T.roster);
    var last = sh.getLastRow();
    if (last > 1) {
      sh.getRange(2, 1, last - 1, 1).getValues().forEach(function (r) {
        if (r[0]) codes.push(String(r[0]).toUpperCase());
      });
    }
    cache.put('codes', JSON.stringify(codes), 300);
  }
  /* An empty Roster is the first-run case: let the first writes through so
     the sheet can populate itself, then the check bites from then on. */
  if (!codes.length) return true;
  return codes.indexOf(code.toUpperCase()) >= 0;
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
      to: REQUESTS_TO,
      subject: 'Meridian · ' + kind + ' from ' + (p.name || code),
      body: [
        kind.toUpperCase(),
        '',
        msg,
        '',
        '— — —',
        'From:  ' + (p.name || '(no name)') + '  [' + code + ']',
        'Role:  ' + (p.role || 'participant'),
        'Seat:  ' + (p.seat || '—'),
        'XP:    ' + num_(p.xp) + '   Cities: ' + num_(p.cities),
        'Sent:  ' + new Date()
      ].join('\n')
    });
    sent = 'yes';
  } catch (err) {
    sent = 'FAILED: ' + err;      // quota exhausted, most likely
  }
  sheet_(T.reqs).appendRow([new Date(), code, p.name || '', kind, msg, sent]);
}

function doGet() { return ok(); }

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
  var values = [
    p.code, p.seat || '', p.name || '', p.role || 'participant',
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
    to: DIGEST_TO,
    subject: 'Meridian — ' + people.length + ' checked in, ' + notes.length + ' field notes',
    htmlBody: html
  });
}
