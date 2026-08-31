<div align="center">

# MERIDIAN

**The credit risk world tour.**

A gamified learning world built from the RICB *Credit Risk Rewired* programme.
Seven cities, a scroll-driven arrival, a progress dashboard, awards, daily
check-ins and field notes.

*No build step. No npm. No dependencies. One `git push` from being live.*

</div>

<p align="center">
  <img src="docs/screens/arrival-settle.png" width="49%" alt="The arrival, light theme">
  <img src="docs/screens/arrival-dark.png" width="49%" alt="The arrival, dark theme">
</p>

---

## Run it

```bash
python3 -m http.server 8000
```

Open <http://localhost:8000>.

You can also double-click `index.html` — every script is a classic script and
every path is relative, so it runs straight from the filesystem. But some
browsers refuse storage to `file://` pages, and **the app says so in a banner
rather than quietly losing someone's streak.** If you see that banner, use the
command above.

## Sign in

**People type their own name plus an access code.** You hand out codes; they
supply the identity. The pairing lands in your Google Sheet, so you learn who
holds which seat without assigning names in advance.

Twenty participant codes, plus two more, are in
[`docs/CREDENTIALS.md`](docs/CREDENTIALS.md) — print it and cut along the rows.

| Who | Code | What it does |
|---|---|---|
| Twenty participants | `CKTE-44CW` … | One seat each, cities unlock in order |
| Recruiters | `MERIDIAN-TOUR` | All seven cities open immediately, tagged separately |
| You | *(held by you)* | Adds the **Cohort** screen |

Codes ignore case and hyphens, and avoid every ambiguous character — no O, I, S,
B, 0, 1, 5 or 8 — so they survive being read aloud or typed on a phone.

> **It gates content. It does not secure it.** There is no server, so the code
> list is readable in `src/config.js`. The sign-in screen says this plainly.
> Nothing confidential belongs behind it — and **change the admin code before
> you share the link anywhere.**

## Ship it

```bash
git init && git add -A
git commit -m "Meridian: the credit risk world tour"
git branch -M main
git remote add origin https://github.com/<you>/meridian.git
git push -u origin main
```

Then **Settings → Pages → Source: GitHub Actions.** The included workflow
publishes the repository as-is — there is nothing to build.

One thing to decide before you hand the link out: **`localStorage` is
per-origin**, so progress on `localhost` does not follow anyone to the Pages URL.
Pick one home first.

## What reaches your Drive

Deploy [`server/Code.gs`](server/Code.gs) once — the setup steps are in the
comment at the top — then set `M.CHECKIN_ENDPOINT` and `M.SHEET_URL` in
`src/config.js`. The app is complete without it; this is what makes it legible
to *you*.

Three tabs appear:

| Tab | Behaviour | What it answers |
|---|---|---|
| **Roster** | One row per code, updated in place | Who is who, and how far each has got |
| **Check-ins** | Append-only, one row per person per day | Who is actually coming back |
| **Field notes** | Append-only | The answers to the Monday question |

Check-ins queue locally when offline and flush when the connection returns, so a
bad line never costs someone a streak. The optional daily digest emails you who
checked in and any new field notes — **and tells you plainly when there were
none, because that is the number that matters.**

---

## Security posture

What is actually done, and what is deliberately not:

| Concern | Status |
|---|---|
| XSS from a typed name or field note | **Escaped.** All user text goes through `esc()` before `innerHTML`; the rail uses `textContent`. Verified with a hostile payload. |
| Role tampering in `localStorage` | **Re-validated on every boot.** The role is read from the roster by code, never from storage — editing `role:"admin"` in devtools does not stick. |
| Oversized input | Names capped at 80 chars, field notes at 2000, both client-side and again in Apps Script. |
| Secrets in the bundle | **None.** There is no key to leak; the Apps Script URL is a write-only endpoint. |
| Access control | **There isn't any, by design.** The gate is client-side and the code list is readable in `src/config.js`. The sign-in screen says so. |
| Content Security Policy | Written and ready in `index.html`, **commented out.** `script-src 'self'` does not match `file://` subresources in Chrome, so enabling it breaks opening the page by double-click. Turn it on once the site lives on a real origin. |

---

## The asset factory

The hero film is rendered from a Remotion project in `studio/`. You never need
to run it to use the site — the finished `.mp4`s are committed. Run it only when
you want to change the animation.

```bash
cd studio && npm i
npx remotion studio          # live preview at localhost:3000
npx remotion render src/index.ts Arrival out/arrival.mp4 --codec=h264 --crf=19
npx remotion render src/index.ts ArrivalPortrait out/arrival-portrait.mp4 --codec=h264 --crf=21
```

Then copy the output into `assets/video/`. `studio/node_modules`, `out/` and
`probe/` are gitignored; the composition source is versioned.

---

## Connecting the sheet

Two Google artefacts, and they do different jobs.

**The access-codes sheet** is *published to the web* as CSV and read by the
browser. It answers one question: who may sign in. It is public by
definition — put nothing in it but codes, roles and seats.

**The cohort sheet** is *private* and never published. An Apps Script bound
to it receives check-ins and feature requests. Paste `server/Code.gs` into
Extensions → Apps Script, set `POST_TOKEN` to match `M.POST_TOKEN`, deploy as
a Web app (execute as **Me**, access **Anyone**), and put the URL into
`M.CHECKIN_ENDPOINT`.

There is nothing else to fill in. Mail goes to the account the script runs
as, and the code list is read from the published sheet.

**Editing the script does not update the live endpoint.** Deploy → Manage
deployments → pencil → Version: **New version**. Skipping that is why a fix
appears to change nothing.

To check it: open the deployment URL in a browser. It reports whether it is
alive, whether a recipient resolves, and which tabs it can see. The Setup
screen inside the app reports the other half — how many items are queued on
that device and when it last tried.

---

## Publishing to GitHub Pages

The site is the repository. There is no build step.

1. Push to GitHub. Settings → Pages → Source: **GitHub Actions**.
2. `M.SITE_URL` in `src/config.js` must match the published address
   exactly. **The path is the repository name** — get that wrong and Pages
   serves a blank page with a green tick.
3. Uncomment the CSP in `index.html`. It stays commented while the site
   runs from a file, because `script-src 'self'` breaks `file://`.

`.github/workflows/deploy.yml` publishes only `index.html`, `src/` and
`assets/`, and fails the build if `docs/`, `server/` or `studio/` are ever
staged.

**The admin code is not in this repository.** It lives in `src/config.js`
as a SHA-256 digest, so it works exactly as before but cannot be read off
the source. To rotate it: uppercase the new code and strip punctuation
(`AB-CD-1234` hashes as `ABCD1234`), take the SHA-256, paste the digest
into the `hash` field. Hashing stops it being *read*, not *brute-forced*.

---

## The desk

Four tools that work on a **live** file, not the fictional one.

**Run a real file** takes three years off the accounts and returns
collection days, payment days and cover, then flags the trend. The
formulas are the Day 2 answer key's own: feeding Tashi Valley's numbers
in returns 29 / 41 / 65, 27 / 32 / 47 and 1.81 / 1.67 / 1.41 exactly.
There is a button that fills the form with those numbers so anybody can
check the tool against the key before trusting it with a real borrower.

**Expected loss** shows both answers — the Nu 9,450,000 the room reached
first and the Nu 945,000 that is correct — because the decimal place is
the lesson.

**Build a scorecard** caps you at six factors, because fifteen is a
scorecard nobody fills in honestly.

**Test me** resurfaces one question from a stop finished a while ago.
Wrong answers come back four times sooner. It is the only feature here
that fights the forgetting the Thank You page complains about.

**Nothing typed on the desk leaves the device.** Not to the trainer, not
to a sheet. That has to be true before anyone types a real borrower's
numbers in, and the page says so.

---

## The file

The seven cities teach the general skill. **The file** teaches the market
the skill is for, and it is the part nobody else's course has: the eight
numbers that describe Bhutanese credit, the collateral trap, the RMA
stack, the CIB, the NDI — and Tashi Valley Resorts, the borrower the whole
week hung on.

The case reveals **in the order the room met it** — profile, then the six
assumptions, then the nine problems, then the red-flag key, then where the
resort actually is. Handing over all five at once destroys the only thing
that made it work: that they had read the file twice before anyone asked
about the geography.

Every number carries its vintage. A ratio without a date cannot be used in
a meeting, and "we have no current figure for this" is itself a finding.

---

## A research assistant, not a prompt

`src/research.js` holds instructions you install **once** — into a
Perplexity Space, a ChatGPT Project or a Claude Project. It carries RICB,
the NPL figures, the collateral trap and the regulatory stack, so
afterwards you type `/latest Bhutan NPL` instead of six paragraphs of
context. Eight commands, listed on the Resources page.

Two rules do the real work: it must cite or refuse, and it must say so
loudly when a source contradicts the figures it was given — because those
figures will go stale, and knowing *when* is the point.

---

## The passport, and sharing it

Awards page carries a passport: one inked stamp per stop closed, with the
date it happened. **Save my card** draws a 1200×630 image of it — name,
standing, stamps — and hands it to the share sheet on a phone or downloads
it everywhere else. Nothing is uploaded; the image is drawn in the browser.

Before you hand the link out, set `M.SITE_URL` in `src/config.js` to the
real address. It is printed on the card, and left empty the card will
advertise whatever host you happened to run it on.

---

## Ask Meridian

The assistant in the notes drawer is **retrieval, not generation**. There is no
server and no API key here, so nothing can compose an answer — and an invented
answer about expected loss is worse than none.

It searches what the app actually contains (the seven cities, the guide, the
videos, the reading list), ranks the passages, and hands back **the real text
with a link to where it came from**. Every answer is a quote. It cannot invent
a number at you, and the panel says so.

---

## Access codes without redeploying

**Your sheet is already made:** [Meridian — Access Codes](https://docs.google.com/spreadsheets/d/15OHLp7LGQUac7gQ76ioarKspZGvqYC-IUyLHzhNzNSY/edit). Publish the `Codes` tab as CSV and paste the URL into `M.ROSTER_CSV`.

Codes live in a Google Sheet you control — add a row and someone can sign
in, set `Active` to `FALSE` and they cannot. Setup is three minutes and it is
documented in [`docs/ACCESS-SHEET.md`](docs/ACCESS-SHEET.md).

The baked-in `M.ROSTER` stays as the offline fallback, so a dropped connection
never locks a room out mid-session.

---

## Languages

The interface translates into English, Dzongkha, Nepali, Hindi, Bengali,
Mandarin and Thai. **Lesson content deliberately stays in English.**

This is technical credit-risk material where mistranslating "significant
increase in credit risk" or "expected loss" would teach the wrong thing to
people who act on it. The switcher carries that notice, and every non-English
block is marked `reviewed:false` in `src/i18n.js` until a native speaker has
checked it — flip the flag when they have.

---

## Layout

```
index.html                  the shell: markup + icon sprite
assets/video/               the pre-rendered hero film, landscape + native portrait
assets/img/                 film posters (first frame, for instant paint)
assets/styles/
  tokens.css                the five token layers — palette → atmosphere → materials → semantic
  base.css                  reset, and the browser surfaces most sites leave default
  components.css            every component, reaching no deeper than the semantic layer
  responsive.css            375px is the design width
  world.css                 per-city decals, the roadmap, the notes journal, glass
src/
  i18n.js                   interface strings, seven languages
  resources.js              videos, reading, downloads, the guide's lines
  ask.js                    the retrieval assistant + field-note categories
  bhutan.js                 the market, the regulation, the Tashi Valley case
  tools.js                  the four desk tools — ratios, EL, scorecard, recall
  research.js               the standing research-assistant instructions
  places.js                 landmarks, terrain and stamps — one per city
  share.js                  the passport card, drawn to a canvas
  motion.css                the whole motion system, including reduced motion
src/
  config.js                 endpoint, roster, XP economy, rank tiers
  content.js                the seven cities and nine awards — data, never markup
  core.js                   storage, progress, streaks, awards, check-in queue, theme
  views.js                  view builders, one per surface
  app.js                    router, event delegation, sign-in, scoring
  arrival.js                scrubs the hero film by scroll; seek-coalesced
studio/                     Remotion project — the source of the hero film
server/Code.gs              Google Apps Script: check-in log + daily digest
docs/                       PRD, product context, design system, credentials
.github/workflows/          Pages deploy
```

Scripts load in dependency order and share one global, `M`. No modules and no
bundler — that is deliberate, and it is what lets the page open from disk.

## Editing the content

The seven cities live in `src/content.js`. Each is plain data:

```js
{
  id:'zurich', city:'Zurich', country:'Switzerland', mins:12,
  title:'…', blurb:'…', hook:'…',
  body:[ {h:'…', p:['…'], table:{head:[…],rows:[…]}, list:[…], quote:'…'} ],
  worked:{h:'…', p:'…'},
  check:{ q:'…', opts:[ {t:'…', ok:true, why:'…'} ] }
}
```

Add a city and it appears on the tour in order, locked behind the one before it.
Add an award in `M.AWARDS` pointing at a `city` id, a `streak` number, or
`note:true`.

---

## Two rules worth keeping

**The scoring rule is `+1` correct, `−1` wrong, `−2` for a missed flag.** It was
invented by the participants on Day 2, and it is the point of view of the whole
product: *failing to look is worse than looking and getting it wrong.* If you
retune `M.XP`, leave that ratio alone.

**The last city is Punakha.** He travels the world to learn, and the final stop
is the valley next door to where he started. The tour is ordered that way on
purpose — the reveal only works if it arrives last.
