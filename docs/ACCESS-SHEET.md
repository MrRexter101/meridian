# Managing access codes from a Google Sheet

Codes live in a spreadsheet you control. Add a row and that person can sign
in; set `Active` to `FALSE` and they cannot. **No redeploy, no code edit.**

---

## Set it up once (about three minutes)

**1. The sheet already exists.** →
[**Meridian — Access Codes**](https://docs.google.com/spreadsheets/d/15OHLp7LGQUac7gQ76ioarKspZGvqYC-IUyLHzhNzNSY/edit)

It is in your Drive, pre-filled with all 22 codes. Rename the tab to **`Codes`**
if it is not already. The headers are:

| Code | Role | Seat | Name | Active |
|---|---|---|---|---|
| `CKTE-44CW` | participant | 1 | Rinzin Dorji | TRUE |
| `XMWN-AJUY` | participant | 2 | | TRUE |
| `MERIDIAN-TOUR` | recruiter | | Recruiters | TRUE |
| *(your admin code)* | admin | | Ayush | TRUE |

- **Code** — the only required column. Case and hyphens are ignored on entry.
- **Role** — `participant`, `recruiter`, or `admin`. Blank means participant.
- **Seat** — optional, shows in the Cohort screen.
- **Name** — for your reference only; the app uses the name people type.
- **Active** — `FALSE`, `NO` or `0` blocks the code. Anything else allows it.

**2. Publish it.** File → Share → **Publish to web**. Choose the **`Codes`**
tab, format **Comma-separated values (.csv)**, then Publish.

**3. Wire it.** Copy the URL it gives you and paste it into `M.ROSTER_CSV`
in [`src/config.js`](../src/config.js):

```js
M.ROSTER_CSV = 'https://docs.google.com/spreadsheets/d/e/…/pub?gid=0&single=true&output=csv';
```

That is the only code change you will ever need to make for access.

---

## How it behaves

- The sheet is fetched **once per page load**, in the background. Sign-in
  never waits for it.
- If the sheet is **slow, missing, unpublished or you are offline**, the
  baked-in `M.ROSTER` answers instead — a dropped connection cannot lock a
  room full of people out mid-session.
- Removing a row stops **new** sign-ins. Someone already signed in on their
  own device stays signed in until they sign out, because the session lives
  in their browser. To end a session immediately you would need a real
  backend.
- Google caches published sheets for a few minutes. A new code usually works
  within about five minutes, not instantly.

---

## The honest limit

**A published sheet is public.** Anyone who finds the URL can read every code
in it, and the URL sits in `config.js`, which ships with the site.

This is the same trade the sign-in screen already states: **it gates content,
it does not secure it.** Nothing confidential belongs behind it, and the codes
are there so each person's streak and awards are *theirs* — not to protect
anything.

If you ever need real access control, that needs a backend. Supabase or
Firebase on their free tiers would do it, and `src/core.js` is the only file
that would change.
