/* MERIDIAN · config */
(function(M){
'use strict';

/* ── Where check-ins go ────────────────────────────────────────────────
   Paste your Apps Script Web-app URL here after deploying server/Code.gs.
   Empty string = everything stays on the device. The app works either way. */
M.CHECKIN_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxkNKQxr-SrVrt1PqY-ZQ1LPGFvkwOFeyc-YtZRIERqfvoIg2REJ0zJNa7NqxHA2by2/exec';

/* Optional: your Google Sheet, linked from the admin screen. */
M.SHEET_URL = '';

/* ── Live roster ───────────────────────────────────────────────────────
   Paste the PUBLISHED CSV url of your access-code sheet here and codes
   become something you edit in a spreadsheet instead of in code — add a
   row, someone can sign in; delete a row, they cannot. No redeploy.

   In the sheet:  File → Share → Publish to web → the "Codes" tab → CSV.
   Columns:       Code | Role | Seat | Name (optional) | Active
   Role is participant / recruiter / admin. Active is TRUE or FALSE.

   The baked-in M.ROSTER below stays as the offline fallback, so a
   dropped connection never locks the room out mid-session.

   Same caveat as everything else here: a published sheet is public.
   This gates content; it does not secure it. */
M.ROSTER_CSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQptExgi0IFtQuDtywHgaws8Kn4tA1ZOWWuFGoABd4PKWe-6axrBcW9xHWlrN7_VEvp8oiiqLbot8Ze/pub?output=csv';

/* ── Access codes ──────────────────────────────────────────────────────
   People type their OWN name and one of these codes. The pairing is what
   lands in your Sheet, so you learn who holds which seat without having
   to assign names in advance.

   Codes use an unambiguous alphabet — no O/0, I/1, S/5, B/8 — so they
   survive being read aloud, printed, or typed on a phone.

   This gates content. It does not secure it: there is no server, so the
   list below is readable in this file by anyone who opens it. Nothing
   confidential belongs behind it. */
M.ROSTER = [
  { code:'CKTE-44CW', role:'participant', seat:1 },
  { code:'XMWN-AJUY', role:'participant', seat:2 },
  { code:'W4VN-VV4X', role:'participant', seat:3 },
  { code:'HWMF-49HF', role:'participant', seat:4 },
  { code:'43MK-3NFK', role:'participant', seat:5 },
  { code:'MPD7-CXHK', role:'participant', seat:6 },
  { code:'7QH4-LUFT', role:'participant', seat:7 },
  { code:'QPXD-MAVT', role:'participant', seat:8 },
  { code:'FWAF-A7JL', role:'participant', seat:9 },
  { code:'MMHY-XPEX', role:'participant', seat:10 },
  { code:'JCKC-UF69', role:'participant', seat:11 },
  { code:'NAVF-XVAY', role:'participant', seat:12 },
  { code:'W74F-Q9D6', role:'participant', seat:13 },
  { code:'MXQD-6MNY', role:'participant', seat:14 },
  { code:'YJ9X-KMA4', role:'participant', seat:15 },
  { code:'KXLC-QAJF', role:'participant', seat:16 },
  { code:'J9YR-CDPA', role:'participant', seat:17 },
  { code:'MRA3-H7XF', role:'participant', seat:18 },
  { code:'WCTX-RDE7', role:'participant', seat:19 },
  { code:'7AXN-W7J9', role:'participant', seat:20 },

  /* One shared code for recruiters and anyone you want to show the work to.
     Unlocks all seven cities immediately — they are here to see the range,
     not to grind through quizzes. Their activity is tagged separately so it
     never mixes with cohort data. */
  { code:'MERIDIAN-TOUR', role:'recruiter' },

  /* Yours. Adds the cohort screen. */
  /* The admin seat is stored as a SHA-256 digest, not as text.
     Every other code in this file is plainly readable, and that is fine —
     they gate content, and the content is the point. This one opens the
     cohort screen, so it is the one worth not printing in a file that
     every visitor downloads. Hashing does not make it secret (a short
     code in a known format is guessable given effort) but it does mean
     the code cannot be READ off the page, which is the actual thing that
     happens. The code itself is unchanged — sign in with it as before. */
  { hash:'3d70fd252276e730c630e9ef14cf69c0f27a03db3017adef5a21396379f0ac35', role:'admin', seat:'admin' }
];

M.XP = { city:60, correct:12, checkin:10, note:40 };

M.TIERS = [
  { rank:'Clerk',            min:0 },
  { rank:'Analyst',          min:150 },
  { rank:'Underwriter',      min:420 },
  { rank:'Chief Risk Officer', min:820 }
];

/* Where this copy of Meridian lives. It appears on the shared passport
   card, which is the one place the app has to name itself to someone who
   has never seen it — so set it to the real URL before you hand the link
   out, or the card will advertise wherever you happened to run it.
   Left empty, the card falls back to the address in the browser bar. */
M.SITE_URL = 'https://mrrexter101.github.io/meridian/';

/* Must match POST_TOKEN in server/Code.gs. It stops the endpoint accepting
   writes from anyone who merely finds the URL — but it IS in this file, and
   this file ships to the browser, so treat it as a lock on the front door
   rather than a secret. Anything genuinely sensitive must not go through it. */
M.POST_TOKEN = 'Meridianismy2ndprojectyayy#';

})(window.M = window.M || {});
