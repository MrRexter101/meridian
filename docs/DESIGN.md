# MERIDIAN — the world

**A theme is a place with a lighting model, not a list of hex codes.**

## The place

Dawn, seen from altitude, over an institutional world. Seven office buildings in seven
cities, drawn as isometric stone with a single low sun above-left. Brass catches that sun;
stone holds it; paper absorbs it.

The traveller is an original silent-comedy figure — bowler, oversized coat, cane, small
case. He is drawn, never photographed, and he is nobody in particular.

## The lighting model

One sun, low and to the upper-left, all day, everywhere. Every shadow in the product falls
down-and-right from it, including UI shadows. That is what makes flat vector read as volume
with no bitmap anywhere.

## Layer 1 — raw palette (never flips)

Ink, brass, oxide, verdigris, stone, indigo, dawn.

## Layer 2 — atmosphere, far → near

| | far | | | near |
|---|---|---|---|---|
| **Light** | `#5B7FB5` | `#9DB6D8` | `#E8CDA9` | `#F7E7CE` |
| **Dark** | `#080C17` | `#141D36` | `#2C3750` | `#4A3728` |

The near stop shifts **hue**, not just lightness — cool blue at altitude, warm brass at the
horizon. That temperature shift is most of what reads as distance.

## The scene layer

The arrival canvas has its own token set, separate from the app's semantic layer
and named for what it draws: `--sky-top`, `--sky-bottom`, `--globe-core`,
`--globe-grid`, `--globe-glow`, `--pin-glow`, `--facade-stone`, `--facade-column`,
`--window-lit`, `--ground-surface`, `--ripple-color`, plus the character's
`--coat`, `--tie`, `--case`, `--cane`, `--hat`.

**Why it is separate:** the UI's stone inverts for dark mode — a card is dark at
night. A *building* does not. A limestone façade under moonlight is still paler
than the sky behind it. Wiring the canvas to the UI's stone tokens once painted
a near-black building on a near-black sky.

## Layer 3 — materials

Three, each a lit / body / shade triple:

- **Stone** — the institutions. Everything the product owns.
- **Brass** — interactive and unlocked. Modelled harder than scenery: brighter crown,
  deeper belly, real cast shadow. Locked nodes are the same model, desaturated — *locked,
  not broken.*
- **Paper** — and this is the rule that matters: **surfaces holding the learner's own work
  are a different material from surfaces the site owns.** Field Notes are ruled paper with
  two-frequency grain. Not glass, not another stone card with a different border.

## Layer 4 — semantic

Components may only reach layer 4. A component writing `var(--brass-500)` is welded to one
theme; it must write `var(--brand)`.

Every colour is defined on bare `:root` first. A colour whose only definition sits inside
`@media (prefers-color-scheme: dark)` is invisible in the default unstamped state.


## The world layer — one palette, seven places

The whole app stays in **one palette**. A city is told by two things and never
by a different accent colour:

**The decal.** A motif masked out of `var(--brand)` at 5.5% (7.5% in dark),
sitting behind the content. One colour, seven masks — so nothing has to be
re-checked for contrast seven times over.

| City | Motif |
|---|---|
| Thimphu · Punakha | The endless knot, squared into a lattice |
| Mumbai | Jali screen — pointed arches |
| Singapore | Octagonal window screen |
| Zurich | Alpine chevrons |
| London | Victorian park railing with finials |
| São Paulo | The Copacabana wave |

**The roadmap.** Seven stops on one continuous route. The travelled portion is
drawn in brand; the road ahead stays dashed and quiet. The path is normalised
with `pathLength="100"` so the dash maths is identical whether the route runs
horizontally (desktop) or vertically (phone) — and it runs vertically on a
phone because seven city names cannot sit side by side in 343px at any size
you can actually read.

Node states are **locked → available → complete**, and locked is desaturated
through the same lighting model rather than greyed out. The plain list beneath
is the fallback: if the SVG fails, the content is still reachable.

## The guide

One voice, keyed to a city — he says the thing a person standing next to you
would say, which is not what the lesson says. He appears once per city, above
the body, and never explains the material twice.

## Third-party media

Videos are **linked with credit, never copied**, and nothing loads from
YouTube until someone asks: the card is a local button, the embed is created
on click, and closing the dialog removes the iframe so playback and the
connection both stop. Embeds use `youtube-nocookie`. Thumbnails do come from
`i.ytimg.com`, so a card renders a brand-tinted placeholder if that request is
blocked or slow.

## Field notes are a drawer, not a destination

Notes are the one thing people write mid-thought. Making them a route meant
losing your place to write one down, so they became a journal that slides in
over whatever you were reading — ruled paper, stitched spine, and you stay
where you were when you save.

One undifferentiated pile of notes is close to useless a week later, so a note
is filed as one of five shapes it actually takes on a credit desk: *unverified
assumption*, *number to check*, *ask the borrower*, *policy gap*, *do on
Monday*. Those are filters, not decoration — "what did I promise to do on
Monday" is the question the notes have to answer.

The drawer's second tab is **Ask Meridian**, and it is retrieval, not
generation. There is no server and no key here, so nothing *can* compose an
answer — and an invented number about expected loss is worse than no answer.
It searches what the app actually contains, ranks the passages, and returns the
real text with a link to its source. Every answer is a quote, and the panel says
so rather than implying a model is thinking.

## Glass

Panels are `color-mix` over a backdrop blur with a light-catching top edge and
a real cast shadow, so a pane reads as sitting *on* something. There is a
`@supports not (backdrop-filter)` fallback to a solid surface — the blur is an
enhancement, never the thing that makes text legible.

## Type

- **Display — Fraunces.** Optical-size and soft axes; an antique institutional voice without
  costume. Tracking floor −0.04em at display sizes.
- **UI and body — Inter.** Tabular numerals wherever a figure sits in a column.

Two faces, two jobs. No third.

## The arrival — a rendered film

The hero is no longer drawn live. It is **pre-rendered by Remotion** from
`studio/` and scrubbed by scroll. Canvas 2D had hit its ceiling: procedural
paths cannot carry real gradients, blur, bloom or filter effects, so the Earth
and the traveller looked flat no matter how much shading was added.

```
studio/src/Earth.tsx      ocean, land, weather, terminator, atmosphere, data feeds
studio/src/Facade.tsx     colonnade, pediment, clock, inscription, lit windows
studio/src/Traveller.tsx  the figure — suit, lapels, tie, briefcase, cane, bowler
studio/src/Arrival.tsx    composes all three against scroll progress
        ↓  npx remotion render
assets/video/arrival.mp4           1440×810, 300 frames, ~3.2 MB
assets/video/arrival-portrait.mp4   720×1280 native 9:16, ~2.1 MB
```

**The portrait film is a separate render, never a centre-crop.** A 16:9 clip on
a tall phone shows only its middle third, which cuts the building in half.

Five phases, all pure functions of scroll progress:

| Progress | Phase | What happens |
|---|---|---|
| 0.00–0.20 | Approach | Earth far and upper-right, turning, starfield behind |
| 0.20–0.50 | Descent | It grows to fill the frame; the three data feeds light up |
| 0.50–0.72 | Arrival | We pass through weather into the plaza; the façade rises |
| 0.72–0.88 | The drop | He falls with an elastic settle |
| 0.88–1.00 | Impact | Dust, four rings, and the bowler lands a beat late |

**The comedy is the timing offset.** The body settles at 0.885 and the hat at
0.925. Landing them together kills the joke.

### Why a film and not a canvas

| | Canvas 2D | Remotion film |
|---|---|---|
| Gradients, blur, bloom, turbulence | Hand-rolled, expensive per frame | Native SVG filters, rendered once |
| Cost at runtime | Redraws every frame | One decoder seek |
| Cost to change | Edit, reload, eyeball | Re-render (~25 s) |
| Ceiling | Flat vector | Whatever you can compose in React |

The trade is **weight** (7.0 MB of video, landscape + a native 9:16 portrait cut) and **iteration speed** (a render, not
a refresh). For a hero that has to carry the whole first impression, that is the
right trade. Everything else on the site is still live DOM.

### He is 2D, but he is not one sheet

A flat SVG that only translates reads as a sticker falling. So the parts that
would really move are separate layers on their own pivots — coat tails at the
waist, tie at the knot, sleeves at the shoulder, briefcase at the grip, cane at
the hand, head at the neck.

All six swing off **one** number, and that number is not a second animation
curve invented alongside the body's. It is the body's own vertical velocity,
obtained by differentiating the same drop curve the figure uses:

```
vel  = (dropAt(p) − dropAt(p − 0.004)) / 0.004
sway = sign(v) · |clamp(vel / 30H)|^0.6
```

Falling fast, the air holds everything up. Through the elastic overshoot the
velocity reverses on its own, and so does the cloth — nothing had to be
hand-timed to make it catch up. Standing still, it is exactly zero and nothing
flutters. The `^0.6` exists because linear velocity leaves the post-landing
flutter invisible next to a 900-px drop, and the flutter is the part you watch.

Deriving it rather than authoring it also fixed a real bug: the impact, the
squash and the dust were all keyed to `p = 0.885`, but the bounce curve is
elastic, so his heels actually touch at the **first zero of its cosine** —
`f = 1/5.8`, i.e. `p ≈ 0.748`. The dust had been firing forty frames after he
landed. Everything that reacts to the landing now hangs off one `LAND`
constant, so it cannot drift away from him again.

### The shockwave

Three things land on the same frame, which is what sells a hit: the stone
**flashes** under him (`e^−15s`, gone in four frames), a **displacement pulse**
leaves his heels — five rings whose radius eases out hard while opacity falls
off linearly, so the leading edge outruns its own decay — and the **camera takes
a kick** it recovers from (`e^−9s · sin(6.5πs)`). The dust throws outward along
the ground in both directions rather than blooming in place.

The rings are drawn *behind* him, because a shockwave leaves the paving, not the
man.

## One identity, three views

A city is a *shape*, not a colour — the palette stays single, so the only
thing that can carry Thimphu is what Thimphu looks like. Each stop is
authored once in `src/places.js` and rendered three ways: a **landmark**
glyph on its roadmap node, a **terrain** silhouette in the horizon, and a
**stamp** in the passport. The Gateway of India is the same drawing in all
three places, at the same stroke weight as the icon set.

Numbers came off the roadmap nodes to make room for it. A person who has
been to Zurich recognises the Grossmünster faster than they read a "4",
and the route already says what order the stops come in.

### The horizon

Seven slices of country laid end to end under the road. Ground you have
covered is lit; the road ahead is only suggested, so the landscape
resolves as you earn it.

The slices are defined as **point arrays, not path strings** — every slice
has to start at (0,40) and end at (100,40) or the horizon shows a step
where two countries meet, and hand-written path data drifts. It is masked
with aerial perspective: the ridgeline dissolves upward into the same air
the mist is made of, and both ends fade rather than stopping at a cut edge.

### The passport

Awards are a list of things you did. A passport is a record of where you
have been, which is the metaphor the whole app already runs on.

Stamps are **inked, not printed** — a turbulence displacement on the whole
group, seeded per city so no two break in the same places, because a
rubber stamp on soft paper never closes its edge cleanly. Round ones carry
the city on a top arc and the country on a bottom arc, as two separate
paths: one ring of text around the whole circle runs the country upside
down and then collides with the date.

It is labelled as what it is, carries no real identifiers, and says so on
its face. A document-shaped thing should never be ambiguous about whether
it is a document.

### The share card

Drawn with the **Canvas 2D API**, not screenshotted. That means it renders
at 2× for feeds that re-encode, carries the real typefaces (canvas can use
any font the document has already loaded), and adds nothing to the bundle.
`Path2D` accepts SVG path syntax, so the landmarks are the *same strings*
on screen and in the export — one definition, two renderers.

The card is always paper, whatever theme the app is wearing, via
`--share-*` tokens defined on bare `:root` and deliberately never
overridden. A passport page is not a dark-mode surface, and a card going
into someone's feed should not depend on how the sender had the site set.

## Mist

Depth behind the reading column, kept honest by three rules. It never
competes — peak opacity is single-digit percent, under the decal's own
clearing gradient. The drift is ~2 minutes per cycle: **0.008 Hz, two
orders below the 0.2 Hz band that reads as pulsing** and makes people
queasy. And it is transform-and-opacity only, so it composites on the GPU
and costs nothing on a phone. Under `prefers-reduced-motion` it stops
entirely — a still bank of fog is still atmosphere.

## Motion

One authored moment: **the arrival.** Everything else is response, not performance.

The comedy is a timing offset — the hat lands a beat after the man. That is the whole joke
and it is one number.

Nothing spatial advances on time. Scroll stops, the world stops.

## Refusals for this world

No gradient text. No glass as decoration. No emoji standing in for icons — the icon set is
authored SVG at one stroke weight. No eyebrow labels above headings. No card grid as the
page structure: the tour is a **path**, because the product is a journey.
