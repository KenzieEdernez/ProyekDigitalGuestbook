/** Layered artistic open-envelope illustration for the gift registry. */
export default function GiftEnvelopeArt() {
  return (
    <div className="gift-envelope-art" aria-hidden>
      {/* Painted envelope base */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/invitation/gift-envelope-art.png"
        alt=""
        className="gift-envelope-art-img"
        draggable={false}
      />

      {/* Soft SVG overlays for depth, gold ink, and organic folds */}
      <svg
        className="gift-envelope-art-svg"
        viewBox="0 0 400 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="giftGoldInk" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e8d5a3" stopOpacity="0.55" />
            <stop offset="45%" stopColor="#c5a059" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#9a7b3c" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="giftFoldShade" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#2a2218" stopOpacity="0.14" />
            <stop offset="55%" stopColor="#2a2218" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#2a2218" stopOpacity="0" />
          </linearGradient>
          <filter id="giftSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="giftPaperGrain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="3"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix
              in="noise"
              type="matrix"
              values="0 0 0 0 0.85
                      0 0 0 0 0.8
                      0 0 0 0 0.7
                      0 0 0 0.08 0"
            />
          </filter>
        </defs>

        {/* Subtle paper grain veil */}
        <rect
          x="48"
          y="70"
          width="304"
          height="390"
          rx="8"
          filter="url(#giftPaperGrain)"
          opacity="0.35"
        />

        {/* Soft inner cavity shade where the card sits */}
        <path
          d="M92 118
             C120 108, 160 102, 200 102
             C240 102, 280 108, 308 118
             L300 268
             C270 292, 230 304, 200 304
             C170 304, 130 292, 100 268 Z"
          fill="url(#giftFoldShade)"
        />

        {/* Organic gold fold lines */}
        <path
          d="M78 210 C120 248, 160 278, 200 296 C240 278, 280 248, 322 210"
          stroke="url(#giftGoldInk)"
          strokeWidth="1.15"
          strokeLinecap="round"
          filter="url(#giftSoftGlow)"
          opacity="0.7"
        />
        <path
          d="M86 168 C130 198, 168 222, 200 236 C232 222, 270 198, 314 168"
          stroke="url(#giftGoldInk)"
          strokeWidth="0.7"
          strokeLinecap="round"
          opacity="0.35"
        />

        {/* Delicate botanical flourishes */}
        <g
          stroke="url(#giftGoldInk)"
          strokeWidth="0.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.55"
          filter="url(#giftSoftGlow)"
        >
          <path d="M64 360 C72 348, 78 340, 90 334 C82 342, 78 352, 76 364" />
          <path d="M90 334 C98 328, 104 330, 108 336 C102 334, 96 336, 90 334" />
          <path d="M70 352 C78 350, 84 354, 86 360" />

          <path d="M336 360 C328 348, 322 340, 310 334 C318 342, 322 352, 324 364" />
          <path d="M310 334 C302 328, 296 330, 292 336 C298 334, 304 336, 310 334" />
          <path d="M330 352 C322 350, 316 354, 314 360" />
        </g>

        {/* Tiny pearls / seal dots */}
        <circle cx="200" cy="302" r="3.2" fill="#f7f1e7" opacity="0.55" />
        <circle cx="200" cy="302" r="1.6" fill="#c5a059" opacity="0.45" />
      </svg>

      {/* Soft curved front flap mask — slips tuck under this until revealed */}
      <svg
        className="gift-envelope-art-flap"
        viewBox="0 0 400 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="giftFlapPaper" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#f3ebe0" stopOpacity="0.22" />
            <stop offset="40%" stopColor="#ebe2d4" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#e2d8c8" stopOpacity="0.72" />
          </linearGradient>
          <linearGradient id="giftFlapEdge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#c5a059" stopOpacity="0" />
            <stop offset="50%" stopColor="#c5a059" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#c5a059" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M52 250
             C90 250, 140 268, 200 318
             C260 268, 310 250, 348 250
             L348 500
             Q200 520, 52 500 Z"
          fill="url(#giftFlapPaper)"
        />
        <path
          d="M70 258 C120 278, 160 300, 200 328 C240 300, 280 278, 330 258"
          stroke="url(#giftFlapEdge)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
