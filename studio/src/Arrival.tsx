import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { Earth } from './Earth';
import { Facade } from './Facade';
import { Traveller } from './Traveller';

/* ── The arrival ───────────────────────────────────────────────────────
   One continuous move, five phases, every value a pure function of
   progress so the site can scrub it frame-for-frame.

     0.00–0.20  approach   Earth far, upper right, turning
     0.20–0.50  descent    Earth fills the frame, feeds light up
     0.50–0.72  arrival    we pass through cloud into the plaza
     0.72–0.88  the drop   he falls
     0.88–1.00  impact     dust, and the hat lands a beat late
*/

const ease = Easing.bezier(0.23, 1, 0.32, 1);
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));

export const Arrival: React.FC = () => {
  const frame = useCurrentFrame();
  const { width: W, height: H, durationInFrames } = useVideoConfig();
  const p = frame / (durationInFrames - 1);

  /* Earth */
  /* Two-stage approach. It stays a whole planet for most of the descent,
     then punches through only in the last beat — otherwise you are inside
     Africa a quarter of the way in and there is no globe left to look at. */
  const approach = ease(seg(p, 0.02, 0.44));
  const punch = seg(p, 0.44, 0.60);
  const minWH = Math.min(W, H);
  const R = minWH * (0.115 + 0.34 * approach + 2.6 * punch * punch);
  const gx = W * (0.665 - 0.165 * approach) - W * 0.02 * punch;
  const gy = H * (0.36 + 0.14 * approach) + H * 0.10 * punch;
  const rot = -82 + p * 210;
  const earthOut = 1 - seg(p, 0.545, 0.635);
  const feeds = seg(p, 0.20, 0.34);

  /* Plaza */
  const rise = ease(seg(p, 0.52, 0.74));
  const groundY = H * 0.86;
  const bH = Math.min(Math.min(W * 0.78, 1260) * 0.72, (groundY - H * 0.045) / 1.26);
  const bW = bH / 0.72;
  const lit = seg(p, 0.56, 0.80);

  /* The drop */
  const fall = seg(p, 0.72, 0.885);
  const bounce = 1 - Math.pow(2, -9 * fall) * Math.cos(fall * Math.PI * 2.9);
  const figH = bH * 0.50;
  const figW = figH * (200 / 440);
  const footY = groundY - bH * 0.035;
  const dropY = (1 - bounce) * -H * 0.85;
  /* When his heels actually touch. The bounce curve is elastic, so the
     first contact is the first zero of its cosine — cos(2.9·π·f)=0 at
     f=1/5.8 — not the end of the fall window. Everything that reacts to
     the landing hangs off this, so it can't drift out of sync with him. */
  const LAND = 0.72 + (1 / 5.8) * 0.165;
  const squash = 1 - 0.22 * Math.sin(clamp((p - LAND) / 0.048) * Math.PI);
  const hatFall = seg(p, LAND + 0.014, LAND + 0.152);
  const hatOffset = (1 - (1 - Math.pow(2, -9 * hatFall) * Math.cos(hatFall * Math.PI * 2.6))) * -520;
  const tip = seg(p, 0.955, 1.0);

  /* Layer motion. Coat, tie, sleeves, cane and briefcase are separate
     layers on their own pivots, and one number swings all of them. That
     number is his actual vertical velocity — differentiate the same drop
     curve the body uses, rather than inventing a second ramp beside it.
     Falling fast, the air holds everything up; through the elastic
     overshoot the velocity reverses on its own and so does the cloth; once
     he is standing still it is exactly zero and nothing flutters. Still a
     pure function of p, so scrubbing backwards is frame-identical. */
  const dropAt = (q: number) => {
    const f = seg(q, 0.72, 0.885);
    return (Math.pow(2, -9 * f) * Math.cos(f * Math.PI * 2.9) - 1) * H * 0.85 * -1;
  };
  const vel = (dropAt(p) - dropAt(p - 0.004)) / 0.004;   // +ve = travelling down
  const raw = clamp(vel / (H * 30), -1, 1);
  /* Lift the small end: the flutter after landing is the part you watch,
     and linear velocity leaves it invisible next to the drop itself. */
  const sway = Math.sign(raw) * Math.pow(Math.abs(raw), 0.6);
  const lean = -sway * 2.6;

  /* Impact */
  const impact = seg(p, LAND, LAND + 0.115);
  const manX = W / 2 + bW * 0.30;

  /* The shockwave. Three things land on the same frame and that is what
     sells it: the ground flashes, a ripple leaves his heels faster than it
     decays, and the camera takes a kick it recovers from. */
  const shock = seg(p, LAND, LAND + 0.25);
  const flash = shock > 0 ? Math.exp(-15 * shock) : 0;
  const kick = shock > 0 ? Math.exp(-9 * shock) * Math.sin(shock * Math.PI * 6.5) * H * 0.011 : 0;

  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg,#05070E 0%,#0A1020 46%,#141A2C 100%)' }}>
      {/* Deep field: a faint starfield that parallaxes with the descent */}
      <AbsoluteFill style={{ opacity: 0.55 * earthOut }}>
        {Array.from({ length: 220 }).map((_, i) => {
          const sx = ((i * 173) % 1000) / 1000;
          const sy = ((i * 397) % 1000) / 1000;
          const s = 0.6 + ((i * 61) % 10) / 8;
          return (
            <div key={i} style={{
              position: 'absolute',
              left: `${sx * 100}%`, top: `${sy * 100}%`,
              width: s, height: s, borderRadius: '50%',
              background: '#DCE8FF', opacity: 0.2 + ((i * 37) % 10) / 14,
              transform: `translateY(${approach * (40 + (i % 5) * 30)}px)`,
            }} />
          );
        })}
      </AbsoluteFill>

      {/* Earth */}
      <AbsoluteFill style={{ opacity: earthOut }}>
        <Earth cx={gx} cy={gy} R={R} rot={rot} reveal={feeds} glow={1} />
      </AbsoluteFill>

      {/* Cloud break — we pass through weather on the way down */}
      <AbsoluteFill style={{ opacity: seg(p, 0.44, 0.56) * (1 - seg(p, 0.62, 0.74)), pointerEvents: 'none' }}>
        {Array.from({ length: 7 }).map((_, i) => {
          const t = seg(p, 0.42, 0.76);
          const yy = -30 + i * 22 + t * 150;
          return (
            <div key={i} style={{
              position: 'absolute', left: `${-20 + i * 17}%`, top: `${yy}%`,
              width: '58%', height: '30%', borderRadius: '50%',
              background: 'radial-gradient(closest-side, rgba(226,238,255,0.55), rgba(226,238,255,0))',
              filter: 'blur(28px)',
            }} />
          );
        })}
      </AbsoluteFill>

      {/* Plaza — the whole camera takes the hit, not just the ground */}
      <AbsoluteFill style={{ opacity: seg(p, 0.50, 0.62), transform: `translateY(${kick}px)` }}>
        {/* Sky warms toward the horizon as we land */}
        <AbsoluteFill style={{
          background: `linear-gradient(180deg,
            rgba(12,20,40,${0.0 + 0.9 * rise}) 0%,
            rgba(38,52,86,${0.5 * rise}) 38%,
            rgba(120,110,120,${0.55 * rise}) 68%,
            rgba(214,166,116,${0.62 * rise}) 100%)`,
        }} />
        {/* Ground */}
        <div style={{
          position: 'absolute', left: 0, right: 0, top: groundY, bottom: 0,
          background: 'linear-gradient(180deg,#3B3830 0%,#1C1A16 100%)',
        }} />
        <div style={{
          position: 'absolute', left: 0, right: 0, top: groundY - 1, height: 2,
          background: 'rgba(226,205,169,0.30)',
        }} />

        {/* Building */}
        <div style={{
          position: 'absolute',
          left: W / 2 - bW / 2,
          top: groundY - bH * 0.972 + (1 - rise) * H * 0.30,
          width: bW, height: bH,
          opacity: rise,
          filter: `drop-shadow(0 26px 46px rgba(0,0,0,0.55))`,
        }}>
          <Facade lit={lit} />
        </div>

        {/* Haze bands — the cheapest depth cue there is */}
        {[[0.30, 0.20], [0.18, 0.26], [0.09, 0.34]].map(([h, o], i) => (
          <div key={i} style={{
            position: 'absolute', left: 0, right: 0,
            top: groundY - H * h, height: H * h,
            background: `linear-gradient(180deg, rgba(226,196,150,0), rgba(226,196,150,${o * lit}))`,
          }} />
        ))}

        {/* ── Shockwave ── behind him, because it leaves the paving, not
            the man. Leading edge outruns its own decay: radius eases out
            hard while opacity falls off linearly. */}
        {shock > 0 && (
          <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
            <defs>
              <radialGradient id="shockflash">
                <stop offset="0%"   stopColor="rgba(255,244,220,0.85)" />
                <stop offset="55%"  stopColor="rgba(255,232,190,0.30)" />
                <stop offset="100%" stopColor="rgba(255,232,190,0)" />
              </radialGradient>
            </defs>

            {/* The flash — one frame of contact light on the stone */}
            {flash > 0.004 && (
              <ellipse cx={manX + 10} cy={footY + 2}
                rx={bW * 0.30} ry={bW * 0.062}
                fill="url(#shockflash)" opacity={flash} />
            )}

            {/* Displacement pulse — the paving compressing outward */}
            {[0, 1, 2, 3, 4].map((i) => {
              const rp = clamp((shock - i * 0.085) / 0.62);
              if (rp <= 0 || rp >= 1) return null;
              const e = 1 - Math.pow(1 - rp, 3.2);          // fast out, slow settle
              const a = (1 - rp) * (1 - rp) * (i === 0 ? 0.85 : 0.5);
              return (
                <ellipse key={i} cx={manX + 10} cy={footY + 4}
                  rx={bW * (0.05 + 0.62 * e)} ry={bW * (0.010 + 0.124 * e)}
                  fill="none" stroke="rgba(255,240,214,1)"
                  strokeWidth={Math.max(0.7, 4.6 * (1 - rp))} opacity={a} />
              );
            })}

            {/* Dust thrown outward along the ground, both ways */}
            {[-1, 1].map((dir) => {
              const rp = clamp(shock / 0.5);
              if (rp <= 0 || rp >= 1) return null;
              const e = 1 - Math.pow(1 - rp, 2.4);
              return (
                <ellipse key={dir}
                  cx={manX + 10 + dir * bW * 0.20 * e}
                  cy={footY - bH * 0.012 - bH * 0.05 * e}
                  rx={bW * (0.05 + 0.20 * e)} ry={bH * (0.012 + 0.055 * e)}
                  fill="rgba(226,206,172,0.30)" opacity={(1 - rp) * 0.9} />
              );
            })}
          </svg>
        )}

        {/* Traveller */}
        {fall > 0.001 && (
          <div style={{
            position: 'absolute',
            left: manX - figW / 2,
            top: footY - figH + dropY,
            width: figW, height: figH,
            transform: `scaleY(${squash}) scaleX(${1 / squash})`,
            transformOrigin: '50% 100%',
          }}>
            <Traveller hatOffset={hatOffset} squash={1} tip={tip}
                       sway={sway} lean={lean} lit="#6E6455" shade="#332D24" />
          </div>
        )}

        {/* Dust kicked up on landing */}
        {impact > 0 && impact < 1 && (
          <div style={{
            position: 'absolute', left: manX - bW * 0.30, top: footY - bH * 0.10,
            width: bW * 0.60, height: bH * 0.14,
            background: 'radial-gradient(closest-side, rgba(232,214,182,0.34), rgba(232,214,182,0))',
            filter: 'blur(18px)', opacity: Math.sin(impact * Math.PI),
          }} />
        )}
      </AbsoluteFill>

      {/* Vignette */}
      <AbsoluteFill style={{
        background: `radial-gradient(120% 100% at 50% 46%, rgba(0,0,0,0) 42%, rgba(2,4,10,0.55) 100%)`,
        pointerEvents: 'none',
      }} />
    </AbsoluteFill>
  );
};
