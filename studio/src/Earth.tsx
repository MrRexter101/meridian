import React from 'react';
import { LAND, CITIES, ROUTES, CLOUDS, LIGHTS, project } from './geo';

/* ── The Earth ─────────────────────────────────────────────────────────
   Layered SVG: ocean sphere, landmasses, weather, terminator, atmosphere,
   data arcs, city nodes. Every layer is a pure function of `rot` and
   `zoom`, so the whole thing scrubs.                                     */

type Props = { cx: number; cy: number; R: number; rot: number; reveal: number; glow: number };

/* ── Polar caps ────────────────────────────────────────────────────────
   In an orthographic projection a parallel of latitude φ is not a curve —
   it is the straight horizontal chord at y = −R·sin φ. So an ice cap is
   exactly the circular segment of the disc above (or below) that chord,
   which is why this is a chord plus a limb arc and nothing more clever.

   The chord gets a little wobble, because an ice edge that is ruler
   straight is the one thing that reads instantly as a graphic. */
function capPath(latDeg: number, north: boolean, phase: number,
                 R: number, cx: number, cy: number) {
  const rad = (latDeg * Math.PI) / 180;
  const xh = R * Math.cos(rad);
  const yb = north ? cy - R * Math.sin(rad) : cy + R * Math.sin(rad);
  const steps = 30;
  let d = `M${(cx - xh).toFixed(1)} ${yb.toFixed(1)}`;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const wob =
      Math.sin(t * Math.PI * 3.4 + phase) * R * 0.020 +
      Math.sin(t * Math.PI * 7.1 + phase * 1.7) * R * 0.009;
    const x = cx - xh + 2 * xh * t;
    const y = yb + (north ? wob : -wob);
    d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  /* Back over the pole along the limb. North closes anticlockwise, south
     clockwise — the other way round in each case cuts across the planet. */
  d += ` A${R.toFixed(1)} ${R.toFixed(1)} 0 0 ${north ? 0 : 1} ${(cx - xh).toFixed(1)} ${yb.toFixed(1)} Z`;
  return d;
}

const P = (lat: number, lon: number, rot: number, R: number, cx: number, cy: number) => {
  const p = project(lat, lon, rot, R);
  return { x: cx + p.x, y: cy + p.y, z: p.z };
};

/* Orthographic clipping done properly.

   The naive version breaks the path when a vertex goes behind the sphere and
   closes it with `Z` — which draws a straight chord back across the VISIBLE
   face. That chord is the diagonal slash you see cutting through Africa, and
   it slides as the globe turns.

   The fix: never break the ring. Every vertex is emitted; the ones behind the
   horizon are pushed radially out onto the limb, which is where they belong
   in an orthographic projection. The ring stays closed, the silhouette hugs
   the edge, and the clip circle handles the rest. */
function landPath(poly: [number, number][], rot: number, R: number, cx: number, cy: number) {
  const pts: [number, number][] = [];
  let anyVisible = false;

  for (let i = 0; i < poly.length; i++) {
    const pt = poly[i];
    const p = P(pt[0], pt[1], rot, R, cx, cy);
    let x = p.x;
    let y = p.y;

    if (p.z <= 0) {
      // Behind the horizon — clamp onto the limb along its own bearing.
      const dx = p.x - cx;
      const dy = p.y - cy;
      const len = Math.hypot(dx, dy) || 1e-6;
      x = cx + (dx / len) * R;
      y = cy + (dy / len) * R;
    } else {
      anyVisible = true;
    }

    pts.push([x, y]);
  }

  if (!anyVisible || pts.length < 3) return '';

  /* Emit as a closed Catmull-Rom spline rather than a polyline. The
     coastline data is coarse — at globe scale its straight runs and hard
     corners are the single most artificial thing on the sphere. A spline
     through the same points costs nothing and reads as a coast.

     Tension is held well below 1: a full Catmull-Rom overshoots on the
     tight corners this data is full of, and an overshooting coastline
     bulges off the limb. */
  const T = 0.62;
  const n = pts.length;
  const at = (i: number) => pts[((i % n) + n) % n];
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)} `;
  for (let i = 0; i < n; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const c1x = p1[0] + ((p2[0] - p0[0]) * T) / 6;
    const c1y = p1[1] + ((p2[1] - p0[1]) * T) / 6;
    const c2x = p2[0] - ((p3[0] - p1[0]) * T) / 6;
    const c2y = p2[1] - ((p3[1] - p1[1]) * T) / 6;
    d += `C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)} `;
  }
  return d + 'Z';
}

export const Earth: React.FC<Props> = ({ cx, cy, R, rot, reveal, glow }) => {
  const arcs = ROUTES.map(([a, b, feed], i) => {
    const pa = P(CITIES[a].lat, CITIES[a].lon, rot, R, cx, cy);
    const pb = P(CITIES[b].lat, CITIES[b].lon, rot, R, cx, cy);
    if (pa.z <= 0.08 || pb.z <= 0.08) return null;
    const mx = (pa.x + pb.x) / 2;
    const my = (pa.y + pb.y) / 2;
    const dx = mx - cx, dy = my - cy;
    const d = Math.hypot(dx, dy) || 1;
    const chord = Math.hypot(pb.x - pa.x, pb.y - pa.y);
    const lift = R * (1 + 0.30 * Math.min(1, chord / (R * 1.5)));
    const qx = cx + (dx / d) * Math.min(lift, R * 1.36);
    const qy = cy + (dy / d) * Math.min(lift, R * 1.36);
    const color = feed === 'primary' ? '#F5C978' : feed === 'secondary' ? '#7FC0F0' : '#FF7A4D';
    const dash = feed === 'secondary' ? `${R * 0.028} ${R * 0.022}` : undefined;
    return { i, d: `M${pa.x} ${pa.y} Q${qx} ${qy} ${pb.x} ${pb.y}`, color, dash, feed };
  }).filter(Boolean) as { i: number; d: string; color: string; dash?: string; feed: string }[];

  return (
    <svg
      width="100%" height="100%"
      style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
    >
      <defs>
        <radialGradient id="ocean" cx="32%" cy="27%" r="80%">
          <stop offset="0%"   stopColor="#2E6296" />
          <stop offset="26%"  stopColor="#1B4675" />
          <stop offset="60%"  stopColor="#0E2E53" />
          <stop offset="86%"  stopColor="#071B34" />
          <stop offset="100%" stopColor="#03101F" />
        </radialGradient>
        <radialGradient id="landG" cx="32%" cy="26%" r="82%">
          <stop offset="0%"   stopColor="#9A8B63" />
          <stop offset="30%"  stopColor="#6F6B44" />
          <stop offset="62%"  stopColor="#43502F" />
          <stop offset="100%" stopColor="#1E2A1B" />
        </radialGradient>
        <radialGradient id="term" cx="28%" cy="24%" r="84%">
          <stop offset="0%"    stopColor="rgba(0,0,0,0)" />
          <stop offset="52%"   stopColor="rgba(2,5,12,0.04)" />
          <stop offset="70%"   stopColor="rgba(2,5,12,0.24)" />
          <stop offset="80%"   stopColor="rgba(4,6,12,0.54)" />
          <stop offset="90%"   stopColor="rgba(2,4,10,0.80)" />
          <stop offset="100%"  stopColor="rgba(1,3,7,0.92)" />
        </radialGradient>
        {/* Warm scatter along the day/night edge */}
        <radialGradient id="scatter" cx="28%" cy="24%" r="84%">
          <stop offset="0%"   stopColor="rgba(255,170,90,0)" />
          <stop offset="74%"  stopColor="rgba(255,170,90,0)" />
          <stop offset="80%"  stopColor="rgba(255,156,86,0.10)" />
          <stop offset="86%"  stopColor="rgba(255,140,70,0.02)" />
          <stop offset="100%" stopColor="rgba(255,140,70,0)" />
        </radialGradient>
        {/* Peak sits at 80% of a 1.25R circle — i.e. exactly on the limb. */}
        <radialGradient id="atmo" cx="50%" cy="50%" r="50%">
          <stop offset="0%"    stopColor="rgba(120,186,255,0)" />
          <stop offset="70%"   stopColor="rgba(120,186,255,0)" />
          <stop offset="78.5%" stopColor="rgba(126,190,255,0.06)" />
          <stop offset="80.2%" stopColor="rgba(158,208,255,0.46)" />
          <stop offset="82%"   stopColor="rgba(120,186,255,0.14)" />
          <stop offset="88%"   stopColor="rgba(100,170,255,0.04)" />
          <stop offset="100%"  stopColor="rgba(120,186,255,0)" />
        </radialGradient>
        <radialGradient id="spec" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.42)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <filter id="soft" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation={R * 0.05} />
        </filter>
        {/* Cloud: fractal noise thresholded hard so it breaks into banks
            rather than smearing into fog, then softened. */}
        <filter id="clouds" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.013" numOctaves="5" seed="11" result="n" />
          {/* Hard threshold: only the top of the noise becomes cloud, or the
              whole planet disappears under overcast. */}
          <feColorMatrix in="n" type="matrix" result="m"
            values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  2.6 0 0 0 -1.62" />
          <feGaussianBlur in="m" stdDeviation={Math.max(0.8, R * 0.010)} />
        </filter>
        {/* Surface grain across the whole disc */}
        <filter id="surface" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="5" result="g" />
          <feColorMatrix in="g" type="saturate" values="0" result="gs" />
          <feComponentTransfer in="gs" result="gc">
            <feFuncA type="linear" slope="0.55" intercept="0" />
          </feComponentTransfer>
          <feComposite in="gc" in2="SourceGraphic" operator="in" />
        </filter>
        <filter id="arcGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation={R * 0.014} result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="nodeGlow" x="-300%" y="-300%" width="700%" height="700%">
          <feGaussianBlur stdDeviation={R * 0.018} />
        </filter>
        {/* Cloud does not fall evenly on a planet, and evenly is exactly
            what raw fractal noise gives you. This mask puts it where the
            circulation actually puts it: heavy on the ITCZ at the equator
            and on both mid-latitude storm tracks, thin through the
            subtropical highs at ±28° where the world's deserts are.

            Stops are placed by latitude, not by eye: a parallel φ sits at
            offset (1 − sin φ)/2 down the disc. */}
        <linearGradient id="cloudBand" gradientUnits="userSpaceOnUse"
          x1={cx} y1={cy - R} x2={cx} y2={cy + R}>
          <stop offset="0.000" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.058" stopColor="#fff" stopOpacity="0.96" />
          <stop offset="0.146" stopColor="#fff" stopOpacity="0.88" />
          <stop offset="0.265" stopColor="#fff" stopOpacity="0.24" />
          <stop offset="0.430" stopColor="#fff" stopOpacity="0.96" />
          <stop offset="0.570" stopColor="#fff" stopOpacity="0.90" />
          <stop offset="0.735" stopColor="#fff" stopOpacity="0.26" />
          <stop offset="0.854" stopColor="#fff" stopOpacity="0.86" />
          <stop offset="0.942" stopColor="#fff" stopOpacity="0.96" />
          <stop offset="1.000" stopColor="#fff" stopOpacity="0.60" />
        </linearGradient>
        <mask id="bandMask">
          <rect x={cx - R * 1.2} y={cy - R * 1.2} width={R * 2.4} height={R * 2.4}
            fill="url(#cloudBand)" />
        </mask>
        {/* Ice: bright at the pole, dirtier and bluer at the melt edge */}
        <linearGradient id="ice" gradientUnits="userSpaceOnUse"
          x1={cx} y1={cy - R} x2={cx} y2={cy}>
          <stop offset="0%" stopColor="#FDFEFF" stopOpacity="0.94" />
          <stop offset="100%" stopColor="#C8DCEA" stopOpacity="0.62" />
        </linearGradient>
        <linearGradient id="iceS" gradientUnits="userSpaceOnUse"
          x1={cx} y1={cy + R} x2={cx} y2={cy}>
          <stop offset="0%" stopColor="#FDFEFF" stopOpacity="0.96" />
          <stop offset="100%" stopColor="#CCDFEC" stopOpacity="0.66" />
        </linearGradient>
        <filter id="iceSoft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={Math.max(0.6, R * 0.009)} />
        </filter>
        <clipPath id="globeClip"><circle cx={cx} cy={cy} r={R * 0.999} /></clipPath>
      </defs>

      {/* Atmospheric bloom, hugging the limb */}
      <circle cx={cx} cy={cy} r={R * 1.25} fill="url(#atmo)" opacity={glow} />

      {/* Ocean */}
      <circle cx={cx} cy={cy} r={R} fill="url(#ocean)" />

      <g clipPath="url(#globeClip)">
        {/* Land */}
        <g opacity={0.98}>
          {LAND.map((poly, i) => (
            <path key={i} d={landPath(poly, rot, R, cx, cy)} fill="url(#landG)"
              stroke="rgba(190,214,178,0.30)" strokeWidth={Math.max(0.5, R * 0.0026)}
              strokeLinejoin="round" />
          ))}
        </g>

        {/* Ice caps. Drawn over the land so Greenland and Antarctica go
            white, under the weather so cloud still crosses them. */}
        <g filter="url(#iceSoft)">
          <path d={capPath(66, true, 0.7, R, cx, cy)} fill="url(#ice)" />
          <path d={capPath(62, false, 2.3, R, cx, cy)} fill="url(#iceS)" />
        </g>

        {/* Surface grain — keeps the land and the sea from reading as flat fills */}
        <circle cx={cx} cy={cy} r={R} filter="url(#surface)" fill="#8899aa" opacity={0.12} />

        {/* Weather. A thresholded noise field drifting with the rotation reads
            as real cloud; discrete blobs read as blobs. */}
        <g mask="url(#bandMask)">
          {/* Shadow first, offset down-right away from the sun that lights
              everything else here. Cloud with nothing under it reads as
              paint on the sphere rather than as something above it. */}
          <g opacity={0.30}>
            <g transform={`translate(${(-((((rot % 360) + 360) % 360) / 360) * R * 3.2 + R * 0.022).toFixed(1)} ${(R * 0.020).toFixed(1)})`}>
              <rect x={cx - R * 3.6} y={cy - R * 1.15} width={R * 7.2} height={R * 2.3}
                filter="url(#clouds)" fill="#12202E" />
            </g>
          </g>
          <g opacity={0.82}>
            <g transform={`translate(${-((((rot % 360) + 360) % 360) / 360) * R * 3.2} 0)`}>
              <rect x={cx - R * 3.6} y={cy - R * 1.15} width={R * 7.2} height={R * 2.3}
                filter="url(#clouds)" fill="#fff" />
            </g>
          </g>
        </g>

        {/* The big systems on top, so there are recognisable shapes in it */}
        <g filter="url(#soft)" opacity={0.5}>
          {CLOUDS.map((c, i) => {
            const p = P(c[0], c[1], rot, R, cx, cy);
            if (p.z <= 0.06) return null;
            const r = R * c[2] * (0.5 + 0.5 * p.z);
            return <ellipse key={i} cx={p.x} cy={p.y} rx={r} ry={r * 0.5}
              fill={`rgba(244,250,255,${0.42 * p.z})`} />;
          })}
        </g>

        {/* Night side, then the scatter line along the terminator */}
        <circle cx={cx} cy={cy} r={R} fill="url(#term)" />
        <circle cx={cx} cy={cy} r={R} fill="url(#scatter)" />

        {/* Settlement lights, only where the sun has already set */}
        <g filter="url(#nodeGlow)">
          {LIGHTS.map((l, i) => {
            const p = P(l[0], l[1], rot, R, cx, cy);
            if (p.z <= 0.06) return null;
            // night is the far side of the light direction (upper-left)
            const night = (p.x - cx) / R * 0.62 + (p.y - cy) / R * 0.52;
            if (night < 0.02) return null;
            const a = Math.min(1, (night - 0.02) * 3.2) * Math.min(1, p.z * 2.2);
            return <circle key={i} cx={p.x} cy={p.y} r={Math.max(0.9, R * 0.006 * l[2])}
              fill="#FFDCA6" opacity={0.95 * a} />;
          })}
        </g>

        {/* Specular sheen on the ocean, sun above-left */}
        <ellipse cx={cx - R * 0.34} cy={cy - R * 0.36} rx={R * 0.34} ry={R * 0.26}
          fill="url(#spec)" opacity={0.5} />
      </g>

      {/* Limb light */}
      <circle cx={cx} cy={cy} r={R * 0.996} fill="none"
        stroke="rgba(150,205,255,0.85)" strokeWidth={Math.max(1, R * 0.005)}
        strokeDasharray={`${R * 2.6} ${R * 6.283}`} transform={`rotate(150 ${cx} ${cy})`} />

      {/* Data feeds */}
      <g filter="url(#arcGlow)" opacity={reveal}>
        {arcs.map((a) => (
          <g key={a.i}>
            <path d={a.d} fill="none" stroke={a.color} strokeOpacity={0.18}
              strokeWidth={Math.max(3, R * 0.020)} strokeLinecap="round" strokeDasharray={a.dash} />
            <path d={a.d} fill="none" stroke={a.color} strokeOpacity={0.95}
              strokeWidth={Math.max(1, R * 0.0055)} strokeLinecap="round" strokeDasharray={a.dash} />
          </g>
        ))}
      </g>

      {/* City nodes */}
      <g opacity={reveal}>
        {CITIES.map((c, i) => {
          const p = P(c.lat, c.lon, rot, R, cx, cy);
          if (p.z <= 0.04) return null;
          const dep = Math.min(1, Math.max(0.45, p.z * 1.9));
          const r = Math.max(3, R * 0.019);
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={r * 3.4} fill="#FFCB78" opacity={0.30 * dep} filter="url(#nodeGlow)" />
              <circle cx={p.x} cy={p.y} r={r * 2.1} fill="none" stroke="#FFCB78"
                strokeOpacity={0.55 * dep} strokeWidth={Math.max(1, R * 0.003)} />
              <circle cx={p.x} cy={p.y} r={r} fill="none" stroke="#FFD79A"
                strokeOpacity={0.95 * dep} strokeWidth={Math.max(1.2, R * 0.0042)} />
              <circle cx={p.x} cy={p.y} r={r * 0.46} fill="#FFF6E4" opacity={dep} />
            </g>
          );
        })}
      </g>
    </svg>
  );
};
