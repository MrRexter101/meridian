# MERIDIAN — Product context

*Written by `/impeccable init`. Durable product truth only; visual decisions live in DESIGN.md.*

## What it is

A gamified learning world that turns the RICB "Credit Risk Rewired" executive programme
into a self-paced product. A silent-comedy traveller journeys between insurance and bank
offices around the globe; each city is a module; the final city is the one he started next to.

**One line:** the credit risk world tour.

## Who it is for

**Primary — the RICB participant.** Mid-to-senior credit, underwriting and risk staff at the
Royal Insurance Corporation of Bhutan. Sixteen to twenty-five people. Beginners with AI.
Phone-first: most will open this on a handset, not a laptop. English is a working language,
not a first language — copy must be plain and short.

**Secondary — the facilitator (Ayush).** Needs to see who checked in, who is progressing,
and who is stalling, without asking anyone.

**Tertiary — future cohorts.** The content model is subject-agnostic enough to re-run for
another institution.

## The job it does

The three-day programme ended. Retention decays from that afternoon onward. Meridian exists
to convert a finished workshop into a habit:

1. **Recall** — the frameworks stay reachable after the room empties.
2. **Ritual** — a daily check-in that costs thirty seconds and builds a streak.
3. **Evidence** — the facilitator can see whether anything actually stuck.

## What it is not

- Not a compliance system. Nothing here is a system of record for a real credit decision.
- Not authenticated software. The login gates content; it does not secure it. This is stated
  in the UI itself, not buried in a readme.
- Not a replacement for the facilitator. It is the thing that survives between sessions.

## Content truth

Seven cities, drawn directly from what was taught and researched:

| # | City | Module | Source |
|---|---|---|---|
| 1 | Thimphu | Foundations — risk taxonomy, the five Cs ranked | Days 1–2, delivered |
| 2 | Mumbai | Evidence — Told/Verified/Observed/Assumed, the four numbers | Day 2, delivered |
| 3 | Singapore | The Rating — scorecards, override discipline, PIT vs TTC | Day 3 + Part 5 research |
| 4 | Zurich | The Price — PD × LGD × EAD, haircuts, the five-component price | Day 3 + Part 5 research |
| 5 | London | The Provision — IFRS 9, Stage 2, SICR | Part 5 research, never taught |
| 6 | São Paulo | The Portfolio — transition matrices, vintage analysis | Part 5 research, never taught |
| 7 | Punakha | The Valley — correlation, single-event exposure | Day 3 reveal |

**The narrative spine:** he travels the world to learn, and the last stop is the valley next
door to where he started. The risk was never abroad.

**The running case** — Tashi Valley Resorts Pvt. Ltd. — persists across all seven cities.

## The rule the room invented

Scoring is **+1 correct · −1 wrong · −2 for a missed flag · +1 per correct point shared**.
It was invented by the participants on Day 2 and it is the intellectual high point of the
programme. It is the scoring model of this product, unchanged. Omission costs double
everywhere, including in the quick checks.

## Constraints

- **Opens from the local filesystem.** No build step, no npm, no server required.
- **No third-party services** beyond Google (Fonts, and an Apps Script the user owns).
- **Free.** Every dependency free at the scale of one cohort.
- **Phone-first.** 375px is the design width, not an afterthought.
- **Three theme states** — light, dark, and unstamped system.
- **A path to GitHub Pages** the user can follow later, without rewriting anything.

## Assumptions (flagged, per init)

- Cohort size ~20. Credential list generated at that scale.
- The facilitator will deploy the Apps Script once; participants deploy nothing.
- Participants have intermittent connectivity, so the app must work fully offline and sync
  the check-in opportunistically.
