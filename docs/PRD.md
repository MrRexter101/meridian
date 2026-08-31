# MERIDIAN — Product Requirements Document

**The credit risk world tour.**
Owner: Ayush Kharel · Client: Royal Insurance Corporation of Bhutan · v1.0 · August 2026

---

## 1. Problem

Three days of executive training ended on a high. Retention started decaying the same
afternoon. The programme produced eleven frameworks, two tools and one genuinely original
scoring rule — and all of it currently lives in a slide deck nobody will reopen.

Two specific failures we can name:

**The half that never ran.** Day 2's AI section was cut for time and Day 3 compressed it.
Four AI archetypes and the SCR→prompt bridge were delivered once, fast, at the end of a
long morning. Retention on those is the weakest in the programme.

**The gap nobody has covered.** Eight of the fifteen syllabus topics were never reached —
including IFRS 9 staging, working-capital sizing and portfolio stress testing. There is no
scheduled time left to teach them.

**The measurable consequence:** a participant with a live credit file on their desk on Monday
has no reason and no route to apply any of it.

## 2. What success looks like

| Metric | Target | How measured |
|---|---|---|
| Activation — logged in and completed city 1 | 70% of cohort in week 1 | Check-in log |
| 7-day streak | 40% of cohort | Streak counter |
| Modules completed per participant | ≥ 4 of 7 in 30 days | Progress sheet |
| **The one that matters** — a named unverified assumption submitted from a real file | ≥ 50% of cohort | Field Note submissions |
| Facilitator effort after launch | < 15 min/week | Self-reported |

The fourth row is the real product goal. Everything above it is a proxy. **If nobody writes
a Field Note, the programme was interesting and changed nothing.**

## 3. Users

**Rinzin, 34, credit officer.** Phone in hand, twenty spare minutes between meetings. Confident
with numbers, new to AI. Wants to know whether she is doing this right, and will not read
anything longer than a screen.

**Dorji, 47, branch manager.** Attended because he was told to; left genuinely interested in
the correlation reveal. Will open this twice if it is quick, never if it feels like homework.

**Ayush, facilitator.** Needs evidence that the programme worked, without chasing anyone.

## 4. Jobs to be done

- *When I hit a real file and can't remember the four numbers, I want the formula in ten seconds, so I don't guess.*
- *When I have twenty minutes, I want a unit that finishes inside them, so I don't abandon it half-done.*
- *When I finish something, I want it to count, so the effort is visible to me and to my employer.*
- *(Facilitator) When the cohort goes quiet, I want to know who stalled and where, so I can intervene once rather than broadcast.*

## 5. Scope — v1

### In

| Surface | Purpose |
|---|---|
| **Arrival** | Scroll-driven hero: the globe approaches, the traveller drops onto the first office |
| **Sign-in** | Name + access code, three roles; gates content, states plainly that it does not secure it |
| **Dashboard** | Rank, XP, streak, next action, award shelf, daily check-in |
| **The Tour** | Seven cities on a globe path. Locked, available, complete. |
| **City view** | Lesson content, worked example on Tashi Valley, one quick check |
| **Quick check** | Scored on the room's own rule: +1 / −1 / **−2 for omission** |
| **Field Note** | The Monday question — name one unverified assumption on a real file |
| **Awards** | Nine, named after the programme's own lines |
| **Daily check-in** | Streak, logged to a Google Sheet, email sent from the facilitator's own Gmail |

### Out (v1)

Real authentication · multi-cohort admin · content editing in-app · certificates ·
mobile app · the twelve spreadsheet tools as embedded calculators (they ship as the
existing separate workbook and are linked, not rebuilt).

## 6. Functional requirements

**FR-1 Sign-in.** Name first, code second. The participant supplies their own name; the
code identifies the seat. The pairing is written to the Sheet on first claim, so the
facilitator learns who holds which seat without pre-assigning identities. Three roles:
participant, recruiter (all cities unlocked, tagged separately), administrator (adds the
cohort screen). **The login screen must itself say that it gates content rather than securing
it** — this is a product-honesty requirement, not a legal footnote.

**FR-2 Progress.** XP, streak, per-city completion, awards. Persists across reloads.
Idempotent — re-visiting a completed unit must not farm XP.

**FR-3 Streak.** Computed by **day key, not timestamp**. Gap of 1 continues, gap > 1 resets
to 1, gap of 0 is a no-op.

**FR-4 Quick check scoring.** +1 correct, −1 wrong, **−2 for a missed flag** on multi-select
questions. The omission penalty is the product's point of view and must be visible in the
result, not just in the total.

**FR-5 Daily check-in.** One action per day. Writes locally first, then posts to the Apps
Script. **Offline must not lose the check-in** — queue and retry.

**FR-6 Check-in email.** The Apps Script sends from the facilitator's Gmail and appends a row
to a Sheet. No key ships in the bundle.

**FR-7 Awards.** Granted once, on a named condition, with a visible unlock reason.

**FR-8 Field Note.** Free text, stored locally, included in the check-in payload.

**FR-9 Theme.** Light, dark and unstamped system, all three legible.

**FR-10 Reduced motion.** `prefers-reduced-motion` removes movement but keeps feedback.

## 7. Non-functional

- **Opens from `file://` by double-click.** Degrades honestly if browser storage is unavailable.
- **Single self-contained file.** No build, no npm, no bundler, no node_modules.
- **No third-party runtime dependencies.** Google Fonts is the sole external request.
- **375px is the design width.** No horizontal body scroll at any breakpoint.
- **Keyboard reachable**, visible focus on every interactive element.
- **Scroll-driven motion is a pure function of scroll position** — nothing spatial advances on
  time, or it reads as a loop that will not stop.
- **Portable to GitHub Pages** with no code change.

## 8. Information architecture

```
Arrival (scroll hero)
└── Login
    └── App shell
        ├── Dashboard      rank · streak · check-in · next action · awards
        ├── The Tour       seven cities on the globe path
        │   └── City       lesson → worked example → quick check → complete
        ├── Awards         eight, with unlock conditions
        └── Field Notes    the Monday question, and the log of answers
```

## 9. Content model

Seven cities. Each carries: a title, a hook (`whyItMatters`), the teaching body, a worked
example on Tashi Valley Resorts, a `practice` bridge, and one quick check.

The narrative spine: **he travels the world to learn, and the last stop is the valley next
door to where he started.** The risk was never abroad. City 7 is Punakha, and it is the
reveal the programme already ends on.

## 10. Motion spec — the arrival

Four phases, all pure functions of scroll `t ∈ [0,1]`:

| t | Phase | What happens |
|---|---|---|
| 0.00–0.42 | **Approach** | The globe rotates and grows. Meridian lines resolve. Seven city lights appear in sequence. |
| 0.42–0.62 | **Entry** | The globe fills the frame; the camera passes the horizon into atmosphere. |
| 0.62–0.86 | **The drop** | A façade rises. The traveller falls, lands with a squash, raises dust, and his hat catches up a beat later. |
| 0.86–1.00 | **Settle** | He straightens, tips the hat, and the title lands. |

**The comedy is in the timing offset.** The hat arriving *after* the man is the entire joke,
and it is one number in the code.

## 11. Risks

| Risk | Severity | Mitigation |
|---|---|---|
| `localStorage` blocked on `file://` in some browsers | **High** — progress silently lost | Feature-detect, fall back to memory, and **tell the user in the UI**. Ship a one-line local-server command as the recommended path. |
| Credentials are readable in page source | Medium | Stated in the UI. No real data behind the gate. |
| Apps Script setup is a manual step | Medium | Product works fully without it; email is additive, never load-bearing. |
| Scroll hero is expensive on low-end phones | Medium | Canvas 2D not WebGL; frame-skip when settled; `IntersectionObserver` idles it offscreen. |
| Nobody does the daily check-in | **High** — it is the core loop | Thirty seconds, one tap, visible streak, and it is the first thing on the dashboard. |

## 12. Open questions

1. Does RICB want cohort progress visible to management, or is it private to the learner? **Assumed private** — the sheet is the facilitator's, not HR's.
2. Should the eight never-taught topics be gated until the delivered seven are complete? **Assumed no** — locked by sequence, not by provenance.
3. Is a certificate wanted at 100%? Out of scope for v1; the award shelf substitutes.

## 13. Roadmap

**v1 (this build)** — seven cities, dashboard, tour, awards, check-in, login, arrival hero.
**v1.1** — Apps Script deployed; email live; facilitator sheet populated.
**v2** — the twelve spreadsheet tools as embedded calculators; the knowledge check as a scored
exam; cohort leaderboard.
**v3** — port to the React/Vite architecture and ship to GitHub Pages under a custom domain;
re-skin for a second institution to prove the content model is subject-agnostic.
