import React from 'react';

/* ── The traveller ─────────────────────────────────────────────────────
   Silent-comedy figure, drawn to the reference sheet: a tailored
   three-piece, not a toy. ~7 heads tall, narrow shoulders, fitted waist,
   trousers breaking over the shoe.
   Grid: 200 × 440, feet at y=424, centre x=100.

   2D, but not one flat sheet. The parts that would actually move on a
   falling man are separate layers on their own pivots — coat tails at the
   waist, tie at the knot, sleeves at the shoulder, cane at the hand,
   briefcase at the grip, head at the neck. `sway` drives all of them from
   one number: +1 while the air is pushing everything upward on the way
   down, swinging negative as it all catches up after the landing. Nothing
   here reads a clock — the scrubber owns the timeline.                    */

type Props = {
  hatOffset: number;
  squash: number;
  tip: number;
  lit: string;
  shade: string;
  sway?: number;   // +1 airborne (soft parts trail up) → −ve overshoot on landing
  lean?: number;   // degrees of forward settle through the spine
};

export const Traveller: React.FC<Props> = ({ hatOffset, tip, sway = 0, lean = 0 }) => {
  /* One input, six pivots. Each coefficient is just how much mass that
     part has: a silk tie throws further than a wool sleeve. */
  const tailR  = sway * 13;    // coat skirt flares at the waist
  const tieR   = sway * 27;    // lightest thing on him
  const armR   = sway * 9;     // sleeves lift from the shoulder
  const caneR  = sway * -24;   // the cane trails behind the fall
  const bagR   = sway * 15;    // briefcase swings off the grip
  const bagY   = sway * -7;
  const brimR  = sway * 4;

  return (
  <svg viewBox="0 0 200 448" width="100%" height="100%" style={{ overflow: 'visible' }}>
    <defs>
      <linearGradient id="jacket" x1="0.1" y1="0" x2="0.95" y2="1">
        <stop offset="0%"   stopColor="#8A7C63" />
        <stop offset="34%"  stopColor="#6B5F4A" />
        <stop offset="78%"  stopColor="#4A4133" />
        <stop offset="100%" stopColor="#332C22" />
      </linearGradient>
      <linearGradient id="lapel" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%"   stopColor="#9A8B70" />
        <stop offset="100%" stopColor="#6A5E49" />
      </linearGradient>
      <linearGradient id="trews" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"   stopColor="#5E5442" />
        <stop offset="46%"  stopColor="#463E30" />
        <stop offset="100%" stopColor="#2C261D" />
      </linearGradient>
      <radialGradient id="skin" cx="34%" cy="26%" r="76%">
        <stop offset="0%"   stopColor="#F6E2CA" />
        <stop offset="58%"  stopColor="#E7CBAB" />
        <stop offset="100%" stopColor="#BE9B78" />
      </radialGradient>
      <radialGradient id="faceShade" cx="30%" cy="24%" r="88%">
        <stop offset="0%"   stopColor="#000" stopOpacity="0" />
        <stop offset="58%"  stopColor="#000" stopOpacity="0" />
        <stop offset="100%" stopColor="#7A5636" stopOpacity="0.42" />
      </radialGradient>
      <linearGradient id="leather" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor="#9A6634" />
        <stop offset="52%"  stopColor="#7A4E22" />
        <stop offset="100%" stopColor="#5A3616" />
      </linearGradient>
      <linearGradient id="felt" x1="0.2" y1="0" x2="0.8" y2="1">
        <stop offset="0%"   stopColor="#3A332B" />
        <stop offset="55%"  stopColor="#1F1B16" />
        <stop offset="100%" stopColor="#100D0A" />
      </linearGradient>
      <filter id="drop" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="7" />
      </filter>
    </defs>

    {/* Ground shadow — tightens as he arrives, so it reads as height */}
    <ellipse cx="112" cy="436" rx={80 - sway * 16} ry={12 - sway * 3}
             fill="rgba(0,0,0,0.44)" filter="url(#drop)" />
    <ellipse cx="102" cy="433" rx={40 - sway * 8} ry="6" fill="rgba(0,0,0,0.36)" />

    {/* ── LAYER · cane ── pivots at the hand that holds it */}
    <g transform={`rotate(${caneR} 146 228)`}>
      <g stroke="#B08A4E" strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M146 228 L158 424" />
        <path d="M146 228 a10 10 0 0 1 18 3" />
      </g>
    </g>

    {/* ── Legs ── trousers break over the shoe */}
    <path d="M76 246 L98 246 L96 414 L72 414 Z" fill="url(#trews)" />
    <path d="M102 246 L124 246 L130 414 L104 414 Z" fill="url(#trews)" />
    <path d="M84 250 L82 410" stroke="rgba(255,255,255,0.07)" strokeWidth="3" fill="none" />
    <path d="M116 250 L120 410" stroke="rgba(255,255,255,0.05)" strokeWidth="3" fill="none" />
    <path d="M99 246 L100 414" stroke="rgba(0,0,0,0.30)" strokeWidth="3" fill="none" />

    {/* Shoes */}
    <path d="M60 414 L98 414 L100 424 Q80 431 58 424 Z" fill="#191614" />
    <path d="M104 414 L134 414 L142 424 Q120 431 102 424 Z" fill="#191614" />
    <path d="M62 416 L96 416" stroke="rgba(255,255,255,0.12)" strokeWidth="2.4" />
    <path d="M106 416 L136 416" stroke="rgba(255,255,255,0.12)" strokeWidth="2.4" />

    {/* ── LAYER · coat tails ── the skirt of the jacket, hinged at the waist.
        Drawn under the body so the flare reads as cloth behind the legs. */}
    <g transform={`rotate(${tailR} 100 236)`}>
      <path d="M58 232 Q52 268 46 296 Q70 288 84 262 Z" fill="#3E3629" opacity="0.92" />
      <path d="M142 232 Q149 266 156 292 Q132 286 116 262 Z" fill="#4A4133" opacity="0.92" />
    </g>

    {/* ── LAYER · torso ── narrow shoulder, nipped waist, soft skirt */}
    <g transform={`rotate(${lean} 100 250)`}>
      <path d="M70 126
               Q56 152 54 196
               Q53 232 58 258
               L142 258
               Q147 232 146 196
               Q144 152 130 126
               Q100 116 70 126 Z"
            fill="url(#jacket)" />

      {/* Shirt + waistcoat */}
      <path d="M88 122 L100 190 L112 122 Z" fill="#F4EEE2" />
      <path d="M90 138 L100 190 L110 138 Z" fill="rgba(0,0,0,0.10)" />

      {/* Lapels with a notch */}
      <path d="M70 124 L86 134 L99 192 L92 132 Z" fill="url(#lapel)" />
      <path d="M130 124 L114 134 L101 192 L108 132 Z" fill="url(#lapel)" />
      <path d="M86 134 L79 128" stroke="rgba(0,0,0,0.32)" strokeWidth="2" />
      <path d="M114 134 L121 128" stroke="rgba(0,0,0,0.32)" strokeWidth="2" />

      {/* ── LAYER · tie ── hinged at the knot; the lightest thing he wears */}
      <g transform={`rotate(${tieR} 100 124)`}>
        <path d="M100 120 L92 132 L90 176 L100 190 L110 176 L108 132 Z" fill="#96262A" />
        <path d="M100 120 L92 132 L108 132 Z" fill="#741A1E" />
        <path d="M97 138 L103 138 L102 174 L100 180 L98 174 Z" fill="rgba(255,255,255,0.10)" />
      </g>

      {/* Buttons + pocket */}
      <circle cx="100" cy="200" r="3.4" fill="#2E2820" />
      <circle cx="100" cy="222" r="3.4" fill="#2E2820" />
      <path d="M64 208 L84 206" stroke="rgba(0,0,0,0.28)" strokeWidth="3" />
      <path d="M136 208 L116 206" stroke="rgba(0,0,0,0.28)" strokeWidth="3" />

      {/* ── LAYER · left arm ── shoulder pivot */}
      <g transform={`rotate(${armR} 68 134)`}>
        <path d="M68 134 Q54 178 56 224" stroke="#5D5341" strokeWidth="26" strokeLinecap="round" fill="none" />
        <path d="M50 218 L64 222" stroke="#F4EEE2" strokeWidth="5" strokeLinecap="round" />
        <ellipse cx="56" cy="232" rx="11" ry="12" fill="url(#skin)" />

        {/* ── LAYER · briefcase ── swings off the grip, and lags the arm */}
        <g transform={`translate(0 ${bagY}) rotate(${bagR} 56 236)`}>
          <rect x="12" y="242" width="76" height="58" rx="6" fill="url(#leather)" stroke="#40260F" strokeWidth="3" />
          <path d="M36 242 a14 11 0 0 1 28 0" fill="none" stroke="#40260F" strokeWidth="4.5" />
          <rect x="12" y="272" width="76" height="28" rx="4" fill="rgba(0,0,0,0.18)" />
          <rect x="44" y="258" width="13" height="9" rx="2" fill="#D9A85E" />
          <path d="M14 250 L86 250" stroke="rgba(255,255,255,0.10)" strokeWidth="2.4" />
        </g>
      </g>

      {/* ── LAYER · right arm ── mirrored pivot, slightly less throw */}
      <g transform={`rotate(${-armR * 0.8} 132 134)`}>
        <path d="M132 134 Q146 176 144 218" stroke="#6B5F4A" strokeWidth="26" strokeLinecap="round" fill="none" />
        <path d="M138 212 L152 210" stroke="#F4EEE2" strokeWidth="5" strokeLinecap="round" />
        <ellipse cx="146" cy="226" rx="11" ry="12" fill="url(#skin)" />
      </g>
    </g>

    {/* ── LAYER · head ── neck pivot, so the lean carries up the spine */}
    <g transform={`rotate(${lean * 1.6} 100 122)`}>
      {/* Neck, in shadow under the jaw — the head has to sit on something */}
      <path d="M92 100 L108 100 L108 122 L92 122 Z" fill="#C9A583" />
      <path d="M92 100 L108 100 L108 107 Q100 111 92 107 Z" fill="#A8845F" opacity="0.6" />

      {/* Ears, with the inner fold. Two flat ovals read as handles. */}
      <ellipse cx="72.5" cy="71" rx="6.4" ry="9.6" fill="#DCBE9C" stroke="#B08D6A" strokeWidth="1" />
      <path d="M73.5 66 q-3.4 4.6 -0.6 9.4" fill="none" stroke="#B08D6A" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="127.5" cy="71" rx="6.4" ry="9.6" fill="#DCBE9C" stroke="#B08D6A" strokeWidth="1" />
      <path d="M126.5 66 q3.4 4.6 0.6 9.4" fill="none" stroke="#B08D6A" strokeWidth="1.5" strokeLinecap="round" />

      {/* The head itself. A plain ellipse is what makes a face read as a
          balloon: real skulls are wide and flat across the brow and taper
          to a chin, so this is a path, not an <ellipse>. */}
      <path d="M100 36
               C 85 36 74 45 73 60
               C 72 73 76 86 83 93
               C 88 98 94 101 100 101
               C 106 101 112 98 117 93
               C 124 86 128 73 127 60
               C 126 45 115 36 100 36 Z"
            fill="url(#skin)" />
      {/* Form shadow down the right, away from the light everything else
          in this film is lit by. Without it the face is a sticker. */}
      <path d="M100 36
               C 85 36 74 45 73 60
               C 72 73 76 86 83 93
               C 88 98 94 101 100 101
               C 106 101 112 98 117 93
               C 124 86 128 73 127 60
               C 126 45 115 36 100 36 Z"
            fill="url(#faceShade)" />

      {/* Hair: a real hairline across the brow, thicker at the temples */}
      <path d="M73 58 C 74 44 85 37 100 37 C 115 37 126 44 127 58
               C 121 49 113 46 100 46 C 87 46 79 49 73 58 Z" fill="#241E18" />
      <path d="M73.5 57 q2 9 1 14 q-4 -6 -1 -14 Z" fill="#241E18" />
      <path d="M126.5 57 q-2 9 -1 14 q4 -6 1 -14 Z" fill="#241E18" />

      {/* Brows. Tapered wedges, not strokes — and the left sits higher.
          A perfectly matched pair reads as a doll; one raised brow is the
          entire silent-comedy vocabulary in a single shape. */}
      <path d="M80 57 Q88 50 99 55 Q88 53 81 60 Z" fill="#241E18" />
      <path d="M119 59 Q111 52 101 56 Q111 55 118 62 Z" fill="#241E18" />

      {/* Eyes. The lid is the whole trick: an iris sitting in a clear
          white circle stares like a doll, but cut the top of it with a
          lid and the same eye is suddenly looking at something. */}
      <ellipse cx="90.5" cy="69" rx="6.8" ry="7.2" fill="#FFFDF8" stroke="#241E18" strokeWidth="1.5" />
      <ellipse cx="109.5" cy="69" rx="6.8" ry="7.2" fill="#FFFDF8" stroke="#241E18" strokeWidth="1.5" />
      <circle cx="91.4" cy="69.8" r="3.3" fill="#4A3524" />
      <circle cx="110.4" cy="69.8" r="3.3" fill="#4A3524" />
      <circle cx="91.4" cy="69.8" r="1.7" fill="#151110" />
      <circle cx="110.4" cy="69.8" r="1.7" fill="#151110" />
      <circle cx="89.9" cy="67.9" r="1.4" fill="#FFF" />
      <circle cx="108.9" cy="67.9" r="1.4" fill="#FFF" />
      <path d="M83.9 66.6 q6.6 -4.6 13.2 -0.8 l0 -3 l-13.2 0 Z" fill="url(#skin)" />
      <path d="M102.9 66.6 q6.6 -4.6 13.2 -0.8 l0 -3 l-13.2 0 Z" fill="url(#skin)" />
      <path d="M83.9 66.6 q6.6 -4.6 13.2 -0.8" fill="none" stroke="#241E18" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M102.9 66.6 q6.6 -4.6 13.2 -0.8" fill="none" stroke="#241E18" strokeWidth="1.6" strokeLinecap="round" />
      {/* Lower lid — a light line, or the eye floats */}
      <path d="M85.4 74.2 q5.2 2.6 10.4 0" fill="none" stroke="#C09A75" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M104.4 74.2 q5.2 2.6 10.4 0" fill="none" stroke="#C09A75" strokeWidth="1.1" strokeLinecap="round" />

      {/* Nose: a form with a shadow on the shaded side, and nostrils */}
      <path d="M100 67 q-3.2 7.2 -3.6 10.2 q0.4 2 3.6 2 q3.2 0 3.6 -2 q-0.4 -3 -3.6 -10.2 Z"
            fill="#E0BE98" opacity="0.6" />
      <path d="M100.4 69 q2.8 6.8 3.2 8.4 q-0.4 1.8 -3.2 1.8 Z" fill="#C39B74" opacity="0.5" />
      <circle cx="97.6" cy="78.4" r="1" fill="#8A6647" opacity="0.75" />
      <circle cx="102.4" cy="78.4" r="1" fill="#8A6647" opacity="0.75" />

      {/* The toothbrush moustache. Slightly wider at the top, parted at
          the centre, with a lit upper edge so it sits on the lip. */}
      <path d="M91 81.6 L109 81.6 L107.8 88.4 Q100 89.8 92.2 88.4 Z" fill="#241E18" />
      <path d="M91 81.6 L109 81.6 L108.7 82.9 L91.3 82.9 Z" fill="#4A3F32" />
      <path d="M100 81.8 L100 88.9" stroke="#000" strokeWidth="0.7" opacity="0.5" />

      {/* Mouth, with a lit lower lip and a shadow under it */}
      <path d="M94 92.4 Q100 95.6 106 92.4" fill="none" stroke="#6E4630" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M95.2 94.4 Q100 96.2 104.8 94.4" fill="none" stroke="#E8C6A4" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
      {/* Light coming back up off the collar catches the underside of the
          jaw. It is the line that stops a chin looking like a chin-shaped
          hole. */}
      <path d="M91 95 Q100 100.5 109 95" fill="none" stroke="#F3DDC2" strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
      <circle cx="116.5" cy="84" r="1.7" fill="#3A2C20" />

      {/* Collar */}
      <path d="M84 116 L100 128 L116 116 L112 122 L100 134 L88 122 Z" fill="#F4EEE2" />
    </g>

    {/* ── LAYER · bowler ── its own timeline: lands a beat after the man */}
    <g transform={`translate(100 ${40 + hatOffset}) rotate(${tip * -8 + brimR + lean * 1.6})`}>
      <ellipse cx="0" cy="8" rx="44" ry="7.5" fill="#0E0C0A" opacity="0.45" />
      <path d="M-27 6 C-30 -20 -17 -32 0 -32 C17 -32 30 -20 27 6 Z" fill="url(#felt)" />
      <ellipse cx="0" cy="6" rx="43" ry="7" fill="#221D18" />
      <ellipse cx="0" cy="4.5" rx="43" ry="6" fill="#15120F" />
      <rect x="-27" y="-3" width="54" height="7" rx="3" fill="#7E6238" />
      <path d="M-14 -22 Q-6 -27 4 -26" stroke="rgba(255,255,255,0.14)" strokeWidth="4" fill="none" strokeLinecap="round" />
    </g>
  </svg>
  );
};
