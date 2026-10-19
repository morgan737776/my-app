import React, { useMemo } from "react";

/* ============================== palette ============================== */
const TEAL = "#2FBDB8";
const TEAL_DARK = "#21A09B";
const NAVY = "#22304F";
const WHITE = "#FFFFFF";
const CHEEK = "#FFC94D";
const TONGUE = "#FF5A62";

let uid = 0;

/* fluffy ball body: circle + petals around the silhouette */
function Fluff({ cx, cy, r, fill, count = 18, rx = 19, ry = 27 }) {
  const petals = [];
  for (let i = 0; i < count; i++) {
    petals.push(
      <ellipse
        key={i}
        cx={cx}
        cy={cy - r + 4}
        rx={rx}
        ry={ry}
        fill={fill}
        transform={`rotate(${(360 / count) * i} ${cx} ${cy})`}
      />
    );
  }
  return (
    <g>
      {petals}
      <circle cx={cx} cy={cy} r={r} fill={fill} />
    </g>
  );
}

/* ============================== МОНСТИК ============================== */
export function Monster({ talking, waving, walking, className = "" }) {
  const id = useMemo(() => `mon${++uid}`, []);
  return (
    <svg
      viewBox="0 0 320 400"
      className={[
        "mk-svg",
        className,
        talking ? "mk-talking" : "",
        walking ? "mk-walking" : "",
      ].join(" ")}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={`${id}-hl`}>
          <path d="M104 118 C 84 96 68 64 58 28 C 88 50 114 84 124 112 Z" />
        </clipPath>
        <clipPath id={`${id}-hr`}>
          <path d="M216 118 C 236 96 252 64 262 28 C 232 50 206 84 196 112 Z" />
        </clipPath>
        <clipPath id={`${id}-mouth`}>
          <path d="M130 230 Q 162 223 194 230 Q 189 282 162 287 Q 135 282 130 230 Z" />
        </clipPath>
      </defs>

      {/* legs */}
      <g className="mk-legs">
        <g className="mk-leg mk-leg-l">
          <rect x="122" y="298" width="28" height="62" rx="13" fill={TEAL} />
          <rect x="122" y="326" width="28" height="13" rx="4" fill="#8E4AD8" />
          <path d="M112 352 h48 a10 10 0 0 1 10 10 v8 a12 12 0 0 1 -12 12 h-44 a12 12 0 0 1 -12 -12 v-8 a10 10 0 0 1 10 -10 Z" fill={TEAL} />
          <circle cx="122" cy="372" r="7" fill={TEAL} />
          <circle cx="138" cy="374" r="7" fill={TEAL} />
          <circle cx="154" cy="372" r="7" fill={TEAL} />
        </g>
        <g className="mk-leg mk-leg-r">
          <rect x="172" y="298" width="28" height="62" rx="13" fill={TEAL} />
          <rect x="172" y="330" width="28" height="13" rx="4" fill="#F5A623" />
          <path d="M162 352 h48 a10 10 0 0 1 10 10 v8 a12 12 0 0 1 -12 12 h-44 a12 12 0 0 1 -12 -12 v-8 a10 10 0 0 1 10 -10 Z" fill={TEAL} />
          <circle cx="172" cy="372" r="7" fill={TEAL} />
          <circle cx="188" cy="374" r="7" fill={TEAL} />
          <circle cx="204" cy="372" r="7" fill={TEAL} />
        </g>
      </g>

      {/* body */}
      <Fluff cx={160} cy={212} r={104} fill={TEAL} count={18} rx={19} ry={27} />
      <path d="M70 250 Q 160 340 250 250 Q 250 316 160 318 Q 70 316 70 250 Z" fill={TEAL_DARK} opacity="0.25" />

      {/* top fur spikes */}
      <g fill={TEAL}>
        <path d="M148 100 C 143 80 145 62 152 46 C 157 64 159 82 159 100 Z" />
        <path d="M161 97 C 159 76 164 58 173 42 C 174 62 173 80 170 98 Z" />
        <path d="M173 101 C 176 84 183 68 192 55 C 189 74 185 88 181 103 Z" />
      </g>

      {/* horns */}
      <g>
        <path d="M104 118 C 84 96 68 64 58 28 C 88 50 114 84 124 112 Z" fill="#F5A623" />
        <g clipPath={`url(#${id}-hl)`} fill="#E0870F">
          <rect x="30" y="40" width="130" height="9" transform="rotate(-22 95 44)" />
          <rect x="30" y="62" width="130" height="9" transform="rotate(-22 95 66)" />
          <rect x="30" y="84" width="130" height="9" transform="rotate(-22 95 88)" />
        </g>
        <path d="M216 118 C 236 96 252 64 262 28 C 232 50 206 84 196 112 Z" fill="#8E4AD8" />
        <g clipPath={`url(#${id}-hr)`} fill="#E8489C">
          <rect x="180" y="40" width="130" height="9" transform="rotate(22 225 44)" />
          <rect x="180" y="62" width="130" height="9" transform="rotate(22 225 66)" />
          <rect x="180" y="84" width="130" height="9" transform="rotate(22 225 88)" />
        </g>
      </g>

      {/* arms */}
      <g transform="rotate(10 78 242)">
        <rect x="64" y="232" width="28" height="86" rx="14" fill={TEAL} />
        <circle cx="78" cy="316" r="18" fill={TEAL} />
        <circle cx="62" cy="328" r="9.5" fill={TEAL} />
        <circle cx="80" cy="332" r="9.5" fill={TEAL} />
        <circle cx="96" cy="324" r="9" fill={TEAL} />
      </g>
      <g className="mk-wave-arm">
        <g transform="rotate(-28 238 242)">
          <rect x="226" y="152" width="28" height="94" rx="14" fill={TEAL} />
          <circle cx="240" cy="152" r="19" fill={TEAL} />
          <ellipse cx="222" cy="128" rx="9" ry="17" fill={TEAL} transform="rotate(-28 222 128)" />
          <ellipse cx="241" cy="121" rx="9" ry="18" fill={TEAL} />
          <ellipse cx="259" cy="128" rx="9" ry="17" fill={TEAL} transform="rotate(26 259 128)" />
        </g>
      </g>

      {/* brows */}
      <g stroke={NAVY} strokeWidth="11" strokeLinecap="round" fill="none">
        <path d="M98 148 Q 122 135 149 146" />
        <path d="M179 141 Q 206 130 231 143" />
      </g>

      {/* eyes */}
      <g className="mk-eyes">
        <ellipse cx="126" cy="193" rx="31" ry="33" fill={WHITE} />
        <ellipse cx="198" cy="189" rx="31" ry="33" fill={WHITE} />
        <circle cx="133" cy="199" r="14.5" fill={NAVY} />
        <circle cx="194" cy="196" r="14.5" fill={NAVY} />
        <circle cx="138" cy="193" r="5" fill={WHITE} />
        <circle cx="199" cy="190" r="5" fill={WHITE} />
      </g>

      {/* cheeks */}
      <ellipse cx="92" cy="238" rx="17" ry="11" fill={CHEEK} />
      <ellipse cx="236" cy="233" rx="17" ry="11" fill={CHEEK} />

      {/* mouth */}
      <g className="mk-mouth">
        <path d="M130 230 Q 162 223 194 230 Q 189 282 162 287 Q 135 282 130 230 Z" fill={NAVY} />
        <path d="M138 231 L 150 230 L 144 252 Z" fill={WHITE} />
        <path d="M175 230 L 187 231 L 181 252 Z" fill={WHITE} />
        <g clipPath={`url(#${id}-mouth)`}>
          <path d="M144 266 Q 162 252 180 266 Q 174 288 162 289 Q 150 288 144 266 Z" fill={TONGUE} />
        </g>
      </g>
    </svg>
  );
}

/* ============================== МАМА ============================== */
const MOM = "#A674E8";
const MOM_DARK = "#8C5CD0";
const MOM_CHEEK = "#F5A0C8";

export function Mom({ talking, waving, walking, className = "" }) {
  const id = useMemo(() => `mom${++uid}`, []);
  return (
    <svg
      viewBox="0 0 300 390"
      className={["mk-svg", className, talking ? "mk-talking" : "", walking ? "mk-walking" : ""].join(" ")}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={`${id}-mh`}>
          <path d="M108 116 C 94 92 86 62 84 34 C 106 54 120 86 126 110 Z" />
        </clipPath>
        <clipPath id={`${id}-mhr`}>
          <path d="M192 116 C 206 92 214 62 216 34 C 194 54 180 86 174 110 Z" />
        </clipPath>
      </defs>

      {/* legs */}
      <g>
        <rect x="115" y="292" width="26" height="58" rx="12" fill={MOM} />
        <rect x="115" y="312" width="26" height="11" rx="4" fill="#fff" opacity="0.85" />
        <rect x="115" y="330" width="26" height="11" rx="4" fill="#E8489C" />
        <path d="M106 342 h44 a10 10 0 0 1 10 10 v8 a12 12 0 0 1 -12 12 h-40 a12 12 0 0 1 -12 -12 v-8 a10 10 0 0 1 10 -10 Z" fill={MOM} />
        <rect x="159" y="292" width="26" height="58" rx="12" fill={MOM} />
        <rect x="159" y="312" width="26" height="11" rx="4" fill="#fff" opacity="0.85" />
        <rect x="159" y="330" width="26" height="11" rx="4" fill="#E8489C" />
        <path d="M150 342 h44 a10 10 0 0 1 10 10 v8 a12 12 0 0 1 -12 12 h-40 a12 12 0 0 1 -12 -12 v-8 a10 10 0 0 1 10 -10 Z" fill={MOM} />
      </g>

      {/* body */}
      <Fluff cx={150} cy={212} r={98} fill={MOM} count={16} rx={18} ry={25} />
      <path d="M62 250 Q 150 332 238 250 Q 238 312 150 314 Q 62 312 62 250 Z" fill={MOM_DARK} opacity="0.28" />

      {/* small horns */}
      <path d="M108 116 C 94 92 86 62 84 34 C 106 54 120 86 126 110 Z" fill="#F06CA0" />
      <g clipPath={`url(#${id}-mh)`} fill="#D84E88">
        <rect x="60" y="48" width="100" height="8" transform="rotate(-16 110 52)" />
        <rect x="60" y="70" width="100" height="8" transform="rotate(-16 110 74)" />
      </g>
      <path d="M192 116 C 206 92 214 62 216 34 C 194 54 180 86 174 110 Z" fill="#F06CA0" />
      <g clipPath={`url(#${id}-mhr)`} fill="#D84E88">
        <rect x="140" y="48" width="100" height="8" transform="rotate(16 190 52)" />
        <rect x="140" y="70" width="100" height="8" transform="rotate(16 190 74)" />
      </g>

      {/* bow */}
      <g>
        <ellipse cx="228" cy="118" rx="17" ry="12" fill="#FF7FB2" transform="rotate(28 228 118)" />
        <ellipse cx="252" cy="130" rx="17" ry="12" fill="#FF7FB2" transform="rotate(-18 252 130)" />
        <circle cx="240" cy="124" r="8" fill="#E8489C" />
      </g>

      {/* arms */}
      <g transform="rotate(8 72 242)">
        <rect x="58" y="232" width="26" height="82" rx="13" fill={MOM} />
        <circle cx="71" cy="312" r="17" fill={MOM} />
      </g>
      <g className={waving ? "mk-wave-arm mk-wave-arm--mom" : ""}>
        <g transform="rotate(-20 226 242)">
          <rect x="214" y="170" width="26" height="82" rx="13" fill={MOM} />
          <circle cx="227" cy="170" r="17" fill={MOM} />
        </g>
      </g>

      {/* face */}
      <g stroke={NAVY} strokeWidth="6" strokeLinecap="round" fill="none">
        <path d="M92 152 Q 112 143 132 150" />
        <path d="M166 148 Q 186 139 206 148" />
      </g>
      <g className="mk-eyes">
        <ellipse cx="116" cy="190" rx="26" ry="28" fill={WHITE} />
        <ellipse cx="182" cy="188" rx="26" ry="28" fill={WHITE} />
        <circle cx="122" cy="196" r="12" fill={NAVY} />
        <circle cx="177" cy="194" r="12" fill={NAVY} />
        <circle cx="126" cy="191" r="4.2" fill={WHITE} />
        <circle cx="181" cy="189" r="4.2" fill={WHITE} />
        <g stroke={NAVY} strokeWidth="4.5" strokeLinecap="round">
          <path d="M96 172 l-8 -8" />
          <path d="M98 184 l-10 -3" />
          <path d="M204 170 l8 -8" />
          <path d="M202 182 l10 -3" />
        </g>
      </g>
      <ellipse cx="94" cy="224" rx="14" ry="9" fill={MOM_CHEEK} />
      <ellipse cx="214" cy="222" rx="14" ry="9" fill={MOM_CHEEK} />
      <g className="mk-mouth">
        <path d="M132 226 Q 150 221 168 226 Q 165 252 150 255 Q 135 252 132 226 Z" fill={NAVY} />
        <path d="M138 227 L 146 227 L 142 240 Z" fill={WHITE} />
        <path d="M155 227 L 163 227 L 159 240 Z" fill={WHITE} />
      </g>
    </svg>
  );
}

/* ============================== ТЁТЯ АНЯ (логопед) ============================== */
const ORANGE = "#F2A33C";
const ORANGE_DARK = "#DE8B26";
const HAIR = "#C97B2E";
const GLASSES = "#6B4A2B";
const VEST = "#3E8E9C";

export function Teacher({ talking, waving = true, walking, className = "" }) {
  return (
    <svg
      viewBox="0 0 300 390"
      className={["mk-svg", className, talking ? "mk-talking" : "", walking ? "mk-walking" : ""].join(" ")}
      aria-hidden="true"
    >
      {/* legs */}
      <g>
        <rect x="116" y="296" width="26" height="56" rx="12" fill={ORANGE} />
        <rect x="158" y="296" width="26" height="56" rx="12" fill={ORANGE} />
        <path d="M106 344 h44 a10 10 0 0 1 10 10 v8 a12 12 0 0 1 -12 12 h-40 a12 12 0 0 1 -12 -12 v-8 a10 10 0 0 1 10 -10 Z" fill={VEST} />
        <path d="M150 344 h44 a10 10 0 0 1 10 10 v8 a12 12 0 0 1 -12 12 h-40 a12 12 0 0 1 -12 -12 v-8 a10 10 0 0 1 10 -10 Z" fill={VEST} />
      </g>

      {/* body */}
      <Fluff cx={150} cy={216} r={98} fill={ORANGE} count={16} rx={17} ry={24} />
      <path d="M62 252 Q 150 334 238 252 Q 238 314 150 316 Q 62 314 62 252 Z" fill={ORANGE_DARK} opacity="0.25" />

      {/* vest */}
      <path d="M92 246 Q 150 224 208 246 L 208 306 Q 150 330 92 306 Z" fill={VEST} />
      <path d="M138 236 L 150 252 L 162 236 L 156 232 L 150 242 L 144 232 Z" fill="#fff" opacity="0.9" />

      {/* star badge */}
      <path d="M196 262 l4 9 10 1 -8 7 2 10 -8 -5 -9 5 2 -10 -7 -7 10 -1 Z" fill="#FFD34D" />

      {/* hair + bun */}
      <g fill={HAIR}>
        <circle cx="150" cy="96" r="30" />
        <path d="M92 150 Q 96 108 150 104 Q 204 108 208 150 Q 180 122 150 122 Q 120 122 92 150 Z" />
        <rect x="138" y="118" width="24" height="10" rx="5" fill="#A9622A" />
      </g>

      {/* arms */}
      <g transform="rotate(12 74 248)">
        <rect x="60" y="238" width="26" height="78" rx="13" fill={ORANGE} />
        <circle cx="73" cy="312" r="16" fill={ORANGE} />
        <g transform="rotate(-14 60 292)">
          <rect x="36" y="272" width="34" height="46" rx="5" fill="#E85C4A" />
          <rect x="41" y="277" width="24" height="36" rx="3" fill="#fff" opacity="0.95" />
          <path d="M41 288 h24 M41 297 h24" stroke="#E85C4A" strokeWidth="3" />
        </g>
      </g>
      <g className={waving ? "mk-wave-arm mk-wave-arm--teacher" : ""}>
        <g transform="rotate(-24 228 248)">
          <rect x="216" y="166" width="26" height="82" rx="13" fill={ORANGE} />
          <circle cx="229" cy="166" r="17" fill={ORANGE} />
          <ellipse cx="213" cy="144" rx="8" ry="15" fill={ORANGE} transform="rotate(-26 213 144)" />
          <ellipse cx="230" cy="138" rx="8" ry="16" fill={ORANGE} />
          <ellipse cx="246" cy="144" rx="8" ry="15" fill={ORANGE} transform="rotate(24 246 144)" />
        </g>
      </g>

      {/* glasses + eyes */}
      <g>
        <circle cx="118" cy="196" r="27" fill="#fff" opacity="0.35" />
        <circle cx="182" cy="196" r="27" fill="#fff" opacity="0.35" />
        <circle cx="118" cy="196" r="27" fill="none" stroke={GLASSES} strokeWidth="7" />
        <circle cx="182" cy="196" r="27" fill="none" stroke={GLASSES} strokeWidth="7" />
        <path d="M145 196 q 5 -8 10 0" fill="none" stroke={GLASSES} strokeWidth="6" />
        <path d="M91 190 l -18 -8 M209 190 l 18 -8" stroke={GLASSES} strokeWidth="6" strokeLinecap="round" />
      </g>
      <g className="mk-eyes">
        <circle cx="118" cy="198" r="11" fill={NAVY} />
        <circle cx="182" cy="198" r="11" fill={NAVY} />
        <circle cx="122" cy="194" r="3.8" fill={WHITE} />
        <circle cx="186" cy="194" r="3.8" fill={WHITE} />
      </g>
      <ellipse cx="92" cy="230" rx="13" ry="8.5" fill="#E86A5E" opacity="0.8" />
      <ellipse cx="212" cy="230" rx="13" ry="8.5" fill="#E86A5E" opacity="0.8" />
      <g className="mk-mouth">
        <path d="M132 238 Q 150 258 168 238" fill="none" stroke={NAVY} strokeWidth="8" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export const CAST = {
  monstik: { name: "Монстик", color: "#19b8b2", Component: Monster },
  mama: { name: "Мама", color: "#a674e8", Component: Mom },
  teacher: { name: "Тётя Аня", color: "#f2a33c", Component: Teacher },
};
