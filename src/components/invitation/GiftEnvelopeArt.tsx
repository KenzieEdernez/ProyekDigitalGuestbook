/** Transparent illustrated envelope — no baked-in background plate. */
export default function GiftEnvelopeArt() {
  return (
    <div className="gift-envelope-art" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/invitation/gift-envelope-art.png"
        alt=""
        className="gift-envelope-art-img"
        draggable={false}
      />

      {/* Soft front fold veil so bank slips tuck underneath until revealed */}
      <svg
        className="gift-envelope-art-flap"
        viewBox="0 0 400 520"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <defs>
          <linearGradient id="giftFlapVeil" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#f3ebe0" stopOpacity="0.05" />
            <stop offset="35%" stopColor="#efe6d8" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#e8dfd0" stopOpacity="0.55" />
          </linearGradient>
        </defs>
        <path
          d="M48 268
             C110 286, 155 318, 200 352
             C245 318, 290 286, 352 268
             L360 500
             Q200 528 40 500 Z"
          fill="url(#giftFlapVeil)"
        />
      </svg>
    </div>
  );
}
