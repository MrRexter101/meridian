import React from 'react';

/* ── The institution ───────────────────────────────────────────────────
   Grid: 1000 wide × 720 tall, ground line at y=700.                      */

type Props = { lit: number };

const COLS = 6;

export const Facade: React.FC<Props> = ({ lit }) => {
  const x0 = 96, span = 808, colW = 46;
  const axis = (i: number) => x0 + (span * i) / (COLS - 1);
  const gaps = Array.from({ length: COLS - 1 }, (_, g) => (axis(g) + axis(g + 1)) / 2);

  return (
    <svg viewBox="0 0 1000 720" width="100%" height="100%" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="wallG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#D8CFBE" />
          <stop offset="48%"  stopColor="#BEB4A2" />
          <stop offset="100%" stopColor="#8B8272" />
        </linearGradient>
        <linearGradient id="colG" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#EFE8DA" />
          <stop offset="34%"  stopColor="#DCD3C2" />
          <stop offset="72%"  stopColor="#A79D8B" />
          <stop offset="100%" stopColor="#8C8372" />
        </linearGradient>
        <linearGradient id="pedG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E6DECF" />
          <stop offset="100%" stopColor="#A79D8B" />
        </linearGradient>
        <linearGradient id="winG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#FFE6A8" />
          <stop offset="100%" stopColor="#E9A33F" />
        </linearGradient>
        {/* Bounce. Real stone in daylight is never dark on its shadow side —
            it picks up warm light off the ground and off whatever is next
            to it. Leaving that out is what makes rendered masonry read as
            grey plastic. */}
        <linearGradient id="colBounce" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#000" stopOpacity="0" />
          <stop offset="74%"  stopColor="#000" stopOpacity="0" />
          <stop offset="92%"  stopColor="#C79A5A" stopOpacity="0.20" />
          <stop offset="100%" stopColor="#E0B87A" stopOpacity="0.34" />
        </linearGradient>
        {/* Grime rises from the pavement — splash-back, a century of it */}
        <linearGradient id="grime" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%"   stopColor="#4A4335" stopOpacity="0.34" />
          <stop offset="14%"  stopColor="#4A4335" stopOpacity="0.14" />
          <stop offset="34%"  stopColor="#4A4335" stopOpacity="0" />
        </linearGradient>
        {/* A cast shadow has a soft edge; a hard one reads as a sticker */}
        <filter id="castSoft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id="castTight" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
        <filter id="winBloom" x="-160%" y="-160%" width="420%" height="420%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
        {/* Two-frequency stone: coarse mottling for the block, fine grain for
            the surface. One frequency alone tiles visibly and reads as noise. */}
        <filter id="stone" x="-2%" y="-2%" width="104%" height="104%">
          <feTurbulence type="fractalNoise" baseFrequency="0.022 0.05" numOctaves="4" seed="7" result="mottle" />
          <feColorMatrix in="mottle" type="saturate" values="0" result="mg" />
          <feComponentTransfer in="mg" result="mc">
            <feFuncA type="linear" slope="0.16" intercept="0" />
          </feComponentTransfer>
          <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="3" seed="3" result="fine" />
          <feColorMatrix in="fine" type="saturate" values="0" result="fg" />
          <feComponentTransfer in="fg" result="fc">
            <feFuncA type="linear" slope="0.09" intercept="0" />
          </feComponentTransfer>
          <feMerge result="tex"><feMergeNode in="mc" /><feMergeNode in="fc" /></feMerge>
          <feComposite in="tex" in2="SourceGraphic" operator="in" result="grain" />
          <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="grain" /></feMerge>
        </filter>
        {/* Ashlar coursing — cut stone is laid in courses, not poured */}
        <pattern id="courses" width="140" height="46" patternUnits="userSpaceOnUse">
          <rect width="140" height="46" fill="none" />
          <path d="M0 45.4h140" stroke="rgba(60,52,40,0.16)" strokeWidth="1.2" />
          <path d="M0 0.6h140" stroke="rgba(255,252,244,0.20)" strokeWidth="1" />
          <path d="M70 0v46" stroke="rgba(60,52,40,0.10)" strokeWidth="1.2" />
        </pattern>
        <pattern id="coursesAlt" width="140" height="46" patternUnits="userSpaceOnUse" patternTransform="translate(70 0)">
          <path d="M70 0v46" stroke="rgba(60,52,40,0.10)" strokeWidth="1.2" />
        </pattern>
        <linearGradient id="wallShade" x1="0" y1="0" x2="1" y2="0.35">
          <stop offset="0%"   stopColor="rgba(255,252,244,0.10)" />
          <stop offset="42%"  stopColor="rgba(255,252,244,0)" />
          <stop offset="100%" stopColor="rgba(40,34,26,0.20)" />
        </linearGradient>
        <linearGradient id="weather" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="rgba(58,50,38,0)" />
          <stop offset="72%" stopColor="rgba(58,50,38,0.05)" />
          <stop offset="100%" stopColor="rgba(58,50,38,0.16)" />
        </linearGradient>
      </defs>

      {/* Ground shadow the building casts forward */}
      <ellipse cx="530" cy="702" rx="470" ry="26" fill="rgba(0,0,0,0.34)" />

      {/* Steps */}
      <rect x="34"  y="676" width="932" height="16" fill="#9A9180" />
      <rect x="52"  y="662" width="896" height="15" fill="#B5AB99" />
      <rect x="70"  y="650" width="860" height="13" fill="#CCC2AF" />

      {/* Wall */}
      <rect x="96" y="150" width="808" height="502" fill="url(#wallG)" filter="url(#stone)" />
      <rect x="96" y="150" width="808" height="502" fill="url(#courses)" />
      <rect x="96" y="150" width="808" height="502" fill="url(#coursesAlt)" opacity="0.55" />
      <rect x="96" y="150" width="808" height="502" fill="url(#weather)" />
      {/* the wall catches light from above-left and falls away to the right */}
      <rect x="96" y="150" width="808" height="502" fill="url(#wallShade)" />
      <rect x="96" y="400" width="808" height="252" fill="url(#grime)" />

      {/* ── Light ────────────────────────────────────────────────────────
          One key, upper-left, and everything obeys it. Until this went in,
          nothing on the building cast anything on anything else, which is
          the real reason it read as flat: not the texture, the absence of
          any evidence that the columns stand in front of the wall.

          Drawn here, between the wall and the colonnade, so the shadows
          land behind the columns that throw them. */}
      <g filter="url(#castSoft)" opacity="0.5">
        {Array.from({ length: COLS }).map((_, i) => (
          <rect key={i} x={axis(i) - colW / 2 + 26} y={222} width={colW * 0.86} height={430}
            fill="#4B4436" />
        ))}
      </g>
      {/* The entablature overhangs, so it lays a band across the top of
          the wall — the deepest shadow on the whole elevation. */}
      <g filter="url(#castSoft)">
        <rect x="96" y="150" width="808" height="30" fill="#3E3830" opacity="0.55" />
      </g>

      {/* Rain. A hundred years of it comes off the cornice at the same
          places every time and stains the stone in vertical runs. Irregular
          on purpose — evenly spaced streaks read as a pattern, and a
          pattern reads as wallpaper. */}
      <g opacity="0.5">
        {[0.03, 0.09, 0.14, 0.22, 0.27, 0.35, 0.41, 0.48, 0.53, 0.61, 0.68, 0.74, 0.79, 0.87, 0.93, 0.97].map((f, i) => {
          const x = 96 + 808 * f;
          const h = 90 + ((i * 137) % 210);
          const w = 3 + ((i * 53) % 7);
          return (
            <rect key={f} x={x} y={178} width={w} height={h} fill="#6A6252"
              opacity={0.16 + ((i * 31) % 17) / 90} filter="url(#castTight)" />
          );
        })}
      </g>

      {/* Windows behind the colonnade */}
      <g>
        {gaps.map((gx, gi) =>
          Math.abs(gx - 500) < 90 ? null : (
            [0, 1].map((r) => {
              const on = (gi + r) % 2 === 0;
              const y = 232 + r * 138;
              return (
                <g key={`${gi}-${r}`}>
                  {on && (
                    <rect x={gx - 34} y={y - 6} width={68} height={110} fill="#FFC96E"
                      opacity={0.5 * lit} filter="url(#winBloom)" />
                  )}
                  <rect x={gx - 30} y={y} width={60} height={98} rx="3"
                    fill={on ? 'url(#winG)' : '#3B352C'} />
                  <rect x={gx - 30} y={y} width={60} height={98} rx="2" fill="none"
                    stroke="#7E7565" strokeWidth="3" />
                  <line x1={gx} y1={y} x2={gx} y2={y + 98} stroke="#7E7565" strokeWidth="3" />
                  <line x1={gx - 30} y1={y + 33} x2={gx + 30} y2={y + 33} stroke="#7E7565" strokeWidth="2" />
                  <line x1={gx - 30} y1={y + 66} x2={gx + 30} y2={y + 66} stroke="#7E7565" strokeWidth="2" />
                  {/* sill and cornice — a window is a hole with a frame around it */}
                  <rect x={gx - 36} y={y + 98} width={72} height={7} fill="#D9CFBD" />
                  {r === 1
                    ? <polygon points={`${gx - 34},${y - 6} ${gx},${y - 24} ${gx + 34},${y - 6}`} fill="#E4DBCB" stroke="#C2B8A5" strokeWidth="2" />
                    : <rect x={gx - 34} y={y - 12} width={68} height={9} fill="#E4DBCB" />}
                </g>
              );
            })
          )
        )}
      </g>

      {/* Doorway */}
      <rect x="452" y="446" width="96" height="206" fill="#2A251E" />
      <rect x="462" y="458" width="76" height="194" fill="#C9922F" opacity={0.20 * lit} />
      <rect x="452" y="446" width="96" height="206" fill="none" stroke="#DED5C4" strokeWidth="7" />
      <ellipse cx="500" cy="660" rx="90" ry="16" fill="#FFCB78" opacity={0.16 * lit} filter="url(#winBloom)" />

      {/* Colonnade */}
      {Array.from({ length: COLS }).map((_, i) => {
        const cx = axis(i) - colW / 2;
        return (
          <g key={i}>
            <rect x={cx} y={214} width={colW} height={432} fill="url(#colG)" filter="url(#stone)" />
            {/* Warm bounce up the shaded flank, and grime at the foot */}
            <rect x={cx} y={214} width={colW} height={432} fill="url(#colBounce)" />
            <rect x={cx} y={470} width={colW} height={176} fill="url(#grime)" />
            {/* Contact shadow where the shaft meets capital and base — the
                cheapest occlusion there is, and the most missed. */}
            <rect x={cx} y={214} width={colW} height={13} fill="#5C5344" opacity="0.34" filter="url(#castTight)" />
            <rect x={cx} y={632} width={colW} height={14} fill="#5C5344" opacity="0.30" filter="url(#castTight)" />
            {[0.22, 0.40, 0.58, 0.76].map((f) => (
              <line key={f} x1={cx + colW * f} y1={222} x2={cx + colW * f} y2={638}
                stroke={f < 0.5 ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.13)'} strokeWidth="2.4" />
            ))}
            {/* Ionic capital — the volutes are what make it read as an order
                rather than a post with a slab on top */}
            <g>
              <rect x={cx - 15} y={192} width={colW + 30} height={8} fill="#F4EEE3" />
              <rect x={cx - 12} y={200} width={colW + 24} height={7} fill="#E6DDCD" />
              <path d={`M${cx - 12} 214 q0 -9 9 -9 t9 9`} fill="none" stroke="#CFC5B2" strokeWidth="3.4" />
              <path d={`M${cx + colW + 12} 214 q0 -9 -9 -9 t-9 9`} fill="none" stroke="#CFC5B2" strokeWidth="3.4" />
              <circle cx={cx - 6}        cy={209} r="3.4" fill="#DCD2C1" stroke="#BDB2A0" strokeWidth="1.4" />
              <circle cx={cx + colW + 6} cy={209} r="3.4" fill="#DCD2C1" stroke="#BDB2A0" strokeWidth="1.4" />
            </g>
            {/* Base */}
            <rect x={cx - 10} y={640} width={colW + 20} height={9}  fill="#E0D7C7" />
            <rect x={cx - 14} y={649} width={colW + 28} height={8}  fill="#CFC5B3" />
            <rect x={cx - 17} y={657} width={colW + 34} height={7}  fill="#BBB1A0" />
          </g>
        );
      })}

      {/* Entablature */}
      <rect x="76" y="150" width="848" height="54" fill="#E4DCCC" />
      <rect x="76" y="204" width="848" height="10" fill="rgba(0,0,0,0.16)" />
      <rect x="140" y="160" width="720" height="34" fill="#B9AF9C" />
      <text x="500" y="183" textAnchor="middle" fill="#2E2820"
        fontFamily="Georgia, 'Times New Roman', serif" fontSize="23" fontWeight="700" letterSpacing="4.2">
        INSTITUTION OF MERIDIAN
      </text>

      {/* Pediment */}
      <polygon points="60,150 500,20 940,150" fill="url(#pedG)" filter="url(#stone)" />
      <polygon points="60,150 500,20 940,150" fill="url(#courses)" opacity="0.6" />
      <polygon points="500,20 940,150 500,150" fill="rgba(0,0,0,0.10)" />
      {/* Clock */}
      {/* Laurel wreath — leaves stepped around the lower arc on both sides,
          meeting at a tie under the clock */}
      <g fill="#C9BFA9" stroke="#A79D8B" strokeWidth="1.4">
        {Array.from({ length: 9 }).map((_, i) => {
          const a0 = Math.PI * 0.52 + (i * Math.PI * 0.86) / 8;   // sweep up the left
          const x = 500 - Math.sin(a0) * 42;
          const y = 102 + Math.cos(a0) * 42;
          const rot = (-a0 * 180) / Math.PI + 96;
          return <ellipse key={`wl${i}`} cx={x} cy={y} rx="9" ry="3.6" transform={`rotate(${rot} ${x} ${y})`} />;
        })}
        {Array.from({ length: 9 }).map((_, i) => {
          const a0 = Math.PI * 0.52 + (i * Math.PI * 0.86) / 8;
          const x = 500 + Math.sin(a0) * 42;
          const y = 102 + Math.cos(a0) * 42;
          const rot = (a0 * 180) / Math.PI - 96;
          return <ellipse key={`wr${i}`} cx={x} cy={y} rx="9" ry="3.6" transform={`rotate(${rot} ${x} ${y})`} />;
        })}
        <path d="M492 146 q8 6 16 0" fill="none" stroke="#A79D8B" strokeWidth="2.6" />
      </g>
      <circle cx="500" cy="102" r="30" fill="#EFE8DA" stroke="#9A9180" strokeWidth="4" />
      <circle cx="500" cy="102" r="30" fill="none" stroke="#C6A25E" strokeWidth="2" />
      <circle cx="500" cy="102" r="23" fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="2" />
      <line x1="500" y1="102" x2="500" y2="84"  stroke="#2E2820" strokeWidth="4" strokeLinecap="round" />
      <line x1="500" y1="102" x2="514" y2="108" stroke="#2E2820" strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="500" cy="102" r="3" fill="#2E2820" />
    </svg>
  );
};
