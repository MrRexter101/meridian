# Access codes

> **The admin code is deliberately not in this file.** This repository is
> public. The code is stored in `src/config.js` as a SHA-256 digest, so it
> still works exactly as before but cannot be read off the source. If you
> lose it, pick a new one and regenerate the digest (see `docs/SECURITY.md`).


**How it works:** each person types **their own full name** and one of the codes
below. The pairing lands in your Google Sheet, so you learn who holds which seat
without assigning names in advance — and if someone loses their slip, you can see
which seat is still unclaimed.

Codes use an unambiguous alphabet — **no letter O, I, S or B, and no digits 0, 1,
5 or 8** — so they survive being read aloud, printed on a slip, or typed on a
phone. Case and hyphens are ignored on entry.

---

## The twenty seats

Print this, cut along the rows, hand one to each person. Fill in the last two
columns yourself as you go.

| Seat | Code | Given to | Date |
|---:|---|---|---|
|  1 | `CKTE-44CW` | | |
|  2 | `XMWN-AJUY` | | |
|  3 | `W4VN-VV4X` | | |
|  4 | `HWMF-49HF` | | |
|  5 | `43MK-3NFK` | | |
|  6 | `MPD7-CXHK` | | |
|  7 | `7QH4-LUFT` | | |
|  8 | `QPXD-MAVT` | | |
|  9 | `FWAF-A7JL` | | |
| 10 | `MMHY-XPEX` | | |
| 11 | `JCKC-UF69` | | |
| 12 | `NAVF-XVAY` | | |
| 13 | `W74F-Q9D6` | | |
| 14 | `MXQD-6MNY` | | |
| 15 | `YJ9X-KMA4` | | |
| 16 | `KXLC-QAJF` | | |
| 17 | `J9YR-CDPA` | | |
| 18 | `MRA3-H7XF` | | |
| 19 | `WCTX-RDE7` | | |
| 20 | `7AXN-W7J9` | | |

---

## The other two

| Who | Code | What it does |
|---|---|---|
| **Recruiters** | `MERIDIAN-TOUR` | All seven cities unlocked immediately — they came to see the range, not to grind through quizzes. A preview banner appears on the dashboard, and their activity is tagged `recruiter` in the Sheet so it never mixes with cohort numbers. |
| **You** | *(held by you, not written here)* | Everything a participant sees, plus a **Cohort** screen listing all twenty seats, who has claimed each one, and a link to your Sheet. |

**Change the admin code before you share the link anywhere.** It is in
[`src/config.js`](../src/config.js), and right now it is written down in this
file and readable in the page source.

---

## What lands in your Drive

Once `server/Code.gs` is deployed and `M.CHECKIN_ENDPOINT` is set, the Sheet
gets three tabs:

| Tab | Behaviour | What it answers |
|---|---|---|
| **Roster** | One row per code, **updated in place** | Who is who, and how far each has got |
| **Check-ins** | Append-only, one row per person per day | Who is actually coming back |
| **Field notes** | Append-only | The answers to the Monday question |

Roster is an upsert rather than a log on purpose. A cohort studying for a month
would otherwise produce hundreds of rows and you would need a formula just to
answer *"how far did Rinzin get?"*

**Read the Field notes tab first.** Check-in counts tell you the habit formed.
Only the notes tell you whether anything changed on a real desk.

---

## Read this before you hand them out

**This gates content. It does not secure it.** There is no server, so the code
list is readable in `src/config.js` by anyone who opens the page source. The
sign-in screen says so in plain language rather than burying it.

Nothing confidential belongs behind this gate. It exists so each person's streak,
XP and awards are *theirs* — not to protect anything.

Two consequences worth knowing:

- **Anyone with a code can type any name.** If two people share a code, the newest
  name wins and the change is logged. Give one code per person.
- **The Cohort screen only sees the browser it is open in.** Progress made on
  someone else's phone reaches you through the Sheet, not through that table.

If you ever need real accounts, that needs a backend — Supabase or Firebase free
tier would do it, and `src/core.js` is the only file that would change.
