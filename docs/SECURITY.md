# Security and privacy

A review of the whole codebase, what was found, what was fixed, and what
you must do before this link goes anywhere public.

Read the last section before you share the URL. Two of those items are
things only you can do.

---

## The shape of the problem

Meridian is a **static site**. There is no server, no session, no database.
Everything in `index.html`, `src/` and `assets/` is downloaded by anyone who
opens the page and can be read in full with View Source.

That single fact decides most of what follows. It means:

- **The app cannot keep a secret.** Not an access code, not an API key, not
  a token. Anything the JavaScript can read, a visitor can read.
- **Sign-in gates content; it does not secure it.** It stops a casual
  visitor wandering into the material. It does not stop anyone determined.
- **The only real trust boundary is the Apps Script**, because that runs on
  Google's servers under your account, not in the visitor's browser.

None of this is a flaw to fix — it is the trade you made for a site that
costs nothing to host and works from a file on a laptop. It just has to be
stated, so nothing sensitive ends up on the wrong side of the line.

---

## Fixed in this pass

### 1. Field notes were being uploaded silently — *critical*

**What was happening.** Every field note was posted to your Apps Script the
moment it was saved (`app.js`), and the most recent note was additionally
attached to *every* daily check-in (`core.js`, `payload.latestNote`). Both
landed in the Cohort sheet, and notes appeared in the daily digest email.
Nothing in the interface said so.

**Why it matters more than it looks.** The note prompt asks people to *"name
one assumption sitting in a real file on your desk right now that nobody has
verified."* The participants are underwriters at RICB. A truthful answer
therefore contains a live borrower's name, an unverified valuation, and a
number that has not been disclosed — flowing out of the bank, into a Google
Sheet, and into an inbox, without the person writing it knowing.

That is a confidentiality problem before it is a product one. It is also
self-defeating: the answers stop being honest the moment people suspect the
notes can be read.

**Fixed.**

- Saving a note no longer transmits anything. Notes live in `localStorage`.
- `payload.latestNote` is gone. Check-ins carry **counts only** — enough for
  the digest to show engagement, with no content.
- Sharing is now a deliberate per-note act: a **Share** button on each note,
  with a confirm tap, and a "Shared with the trainer" badge afterwards.
- The journal states plainly, above the box, what leaves the device.

The `Roster` sheet no longer has a *Latest field note* column. **Delete that
column from your existing sheet**, and consider clearing the `Field notes`
tab of anything collected before this change — it was gathered without
disclosure.

Please do not add a way to collect these silently later. It is worth more to
you as an honest answer than as a row in a sheet.

### 2. The Apps Script endpoint accepted anything — *high*

`doPost` took any well-formed JSON with a `code` field and appended it. The
endpoint URL ships in `src/config.js`, so anyone reading the bundle could
write arbitrary rows into your sheet and inject text straight into the daily
digest email you read.

**Fixed.** Four layers, in `server/Code.gs`:

| Control | What it stops |
| --- | --- |
| `POST_TOKEN` shared with the client | Drive-by writes from someone who only has the URL |
| `knownCode_()` — code must exist on the Roster | Row creation for codes you never issued |
| `throttled_()` — one write per code per 5s | A stuck retry loop, or someone bored |
| `clean_()` — strips control chars, prefixes `= + - @` | Spreadsheet formula injection, and mangled digest emails |

**Be clear about what the token is.** It is in the published JavaScript.
Anyone who reads the bundle can read it. It raises the bar from *"anyone who
finds the URL"* to *"anyone who looks at the source"* — real deterrence,
**not authentication**. Never put anything through that endpoint you would
mind a stranger appending a row to.

### 3. The commented-out CSP would have broken the site — *medium*

The Content-Security-Policy in `index.html` was ready to uncomment on
deploy. It also had `default-src 'none'` with **no `media-src`, no
`frame-src`, and no `docs.google.com` in `connect-src`**. Because
`default-src` silently swallows whatever you leave out, turning it on would
have killed the hero film, every lesson video, and the live access-code
sheet — with no error message pointing at the policy.

**Fixed.** All four directives added, with a comment naming which feature
each one carries so the next edit does not drop one.

---

## Fixed after going live

### 4. The endpoint locked everyone out but the first person — *critical*

`knownCode_()` validated writes against the **Roster** tab — a tab this same
script populates, via `upsertRoster_`, which runs *after* the check. So the
first ever write found the tab empty, was allowed through, and created a row.
From that moment every *other* code was "not on the roster" and was dropped.

Exactly one participant ever reached the sheet. There was no error: the
handler returns `ok()` on rejection, so the client saw success.

**Fixed.** It now validates against the published access-codes CSV — the same
list the site itself reads, and the actual answer to "who is allowed". Adding
a row there grants access to the site and the endpoint at once. If the sheet
is unreachable the write is *accepted*: a blip on Google's side must not throw
away somebody's streak, and the token and rate limit are still in front of it.

### 5. Mail had nowhere to go — *high*

`REQUESTS_TO` was an empty string in the committed template, because an
address in a public repo is scrapeable. Empty is worse: `MailApp.sendEmail`
throws on an empty recipient, the throw is caught, and the result is silence.

**Fixed.** The recipient now resolves to the account the script runs as
(`Session.getEffectiveUser()`), so there is no field to leave blank and
nothing sensitive committed. A `REQUESTS_TO` script property overrides it.

### 6. Formula injection into your spreadsheet — *high*

`clean_()` was applied to note text and request bodies, but **name, seat,
role and day went into cells raw**. The name is typed by the participant at
sign-in and nothing validates it, so a name of
`=HYPERLINK("http://evil","Payroll")` became a live formula in the Roster,
Check-ins, Field notes and Requests tabs.

**Fixed.** Every string reaching a cell goes through `clean_()`. The mail
subject also strips CR/LF, since a subject is a header and an unescaped
newline in one is header injection.

### 7. The client reported failures as successes — *medium*

`mode: 'no-cors'` makes the response opaque: `fetch` resolves for *any*
reply, including a silent rejection. The client deleted the queued item on
resolve, so while the endpoint was discarding writes, every one was counted
as delivered and erased. That is why a broken endpoint looked like a working
one.

**Fixed.** Items survive two attempts before being dropped, and the Setup
screen reports queue depth and last attempt. A queue that never empties is
now visible.

---

## Checked and clean

| Area | Finding |
| --- | --- |
| **XSS** | Every interpolation of user or remote data goes through `esc()` — notes, names, the Ask query, roster values, cohort rows. No unescaped sink found. |
| **`eval` / `new Function` / `document.write`** | None anywhere. |
| **External links** | All 10 `target="_blank"` links carry `rel="noopener noreferrer"`. |
| **Video embeds** | `youtube-nocookie.com`, id passed through `encodeURIComponent`, nothing loads from YouTube until the user asks. |
| **Role escalation** | Role is re-read from the roster on every boot and never trusted from `localStorage` (`revalidate()`). Editing your stored profile does not make you an admin. |
| **Admin nav** | `.navbtn[hidden]{display:none}` — the fix for an earlier bug where every participant could see the Cohort screen. |
| **Storage failure** | `localStorage` access is wrapped; a blocked store degrades to memory with a visible banner rather than throwing. |
| **Roster fetch failure** | Falls back to the baked-in list. A dropped connection cannot lock the room out. |
| **Share card** | Drawn locally, exported through a blob URL. Nothing is uploaded. |
| **Ask Meridian** | Retrieval over local content. No network call, no model, no key. |

---

## What is exposed by design

These are consequences of a static site, not bugs. Know them, decide if you
accept them.

1. **Every access code is in the bundle** (`src/config.js`) and in the
   published CSV. Anyone can read them and sign in as anyone.
2. **The published sheet is public.** "Publish to web" means readable by
   anyone with the link, forever, regardless of Drive sharing settings. Put
   nothing in that tab but codes, roles and seats.
3. **Names are self-declared.** People type their own name against a code.
   There is nothing preventing someone typing another person's name.
4. **The Cohort screen reads only this browser's storage.** It cannot see
   other people's devices — an admin sees who has claimed a code *on this
   machine*, nothing more.
5. **Progress is per-browser.** Clearing site data erases it. There is no
   account to recover.

---

## Publishing

`.github/workflows/deploy.yml` stages only `index.html`, `src/` and
`assets/`. It deliberately does **not** publish `docs/`, `server/` or
`studio/`, and fails the build if any of them are staged — because
`docs/CREDENTIALS.md` lists every access code against a seat name, and a
markdown table at a guessable URL is far more discoverable than the same
codes sitting in `src/config.js`.

That is defence in depth, not a fix. The codes are still readable in the
bundle. The item below is the fix.

---

## Before you share the link

Four things. The first two are yours alone.

- [x] **The admin code is no longer in the bundle.** It is stored as a
      SHA-256 digest in `src/config.js`; the code itself works unchanged but
      cannot be read off the page source, and it is not written in this
      repository. To rotate it: pick a new code, uppercase it and strip
      punctuation (`AB-CD-1234` hashes as `ABCD1234`), take the SHA-256, and
      paste the digest into the `hash` field. Hashing stops it being *read*,
      not *brute-forced* — a short code in a known format is guessable given
      effort, so rotate it if you ever suspect it is out.
- [ ] **Delete the *Latest field note* column** from the Roster tab, and
      clear any notes collected before the fix above — they were gathered
      without disclosure.
- [ ] **Set `POST_TOKEN`** in `src/config.js` and `server/Code.gs` to the
      same random string.
- [ ] **Uncomment the CSP** in `index.html` once the site is on a real
      origin. It breaks `file://`, so it stays off until you deploy.

Then, on the day: open the site as a participant code, confirm the Cohort
button is **not** visible, and confirm a saved note does **not** appear in
your sheet until you tap Share.
