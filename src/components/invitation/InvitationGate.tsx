"use client";

import { useEffect, useState } from "react";

type InvitationGateProps = {
  opening?: boolean;
  opened?: boolean;
};

/** Chinese fretwork lattice matching the reference gate. */
function ChineseLattice({
  emblem = false,
  className = "",
}: {
  emblem?: boolean;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 80"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <pattern id="gateFret" width="20" height="20" patternUnits="userSpaceOnUse">
          <path
            d="M0 10 H20 M10 0 V20 M0 0 L20 20 M20 0 L0 20"
            stroke="#2a1810"
            strokeWidth="1.4"
            fill="none"
          />
        </pattern>
        <linearGradient id="gateLatticeWash" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6b4532" />
          <stop offset="100%" stopColor="#3d2418" />
        </linearGradient>
      </defs>
      <rect width="200" height="80" fill="url(#gateLatticeWash)" />
      <rect width="200" height="80" fill="url(#gateFret)" opacity="0.92" />
      <rect
        x="8"
        y="8"
        width="184"
        height="64"
        fill="none"
        stroke="#1a100c"
        strokeWidth="3"
      />
      <path
        d="M100 12 L128 40 L100 68 L72 40 Z"
        fill="none"
        stroke="#d4b483"
        strokeWidth="1.6"
        opacity="0.55"
      />
      {emblem ? (
        <g transform="translate(100 40)">
          <circle r="14" fill="#c9a45b" stroke="#5a3d18" strokeWidth="1.5" />
          <circle r="10" fill="none" stroke="#5a3d18" strokeWidth="1" />
          <path
            d="M-4 -2 H4 M0 -6 V2 M-3 4 H3"
            stroke="#5a3d18"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </g>
      ) : null}
    </svg>
  );
}

function GateRoofSvg() {
  return (
    <svg
      className="gate-roof-svg"
      viewBox="0 0 1000 160"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="tileGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a6573" />
          <stop offset="45%" stopColor="#3a4450" />
          <stop offset="100%" stopColor="#232a32" />
        </linearGradient>
        <linearGradient id="beamGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#faf4eb" />
          <stop offset="100%" stopColor="#d8c8b2" />
        </linearGradient>
        <linearGradient id="stoneGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e8ddd0" />
          <stop offset="50%" stopColor="#f7f1e8" />
          <stop offset="100%" stopColor="#e0d3c3" />
        </linearGradient>
      </defs>

      {/* Soft watercolor wash behind roof */}
      <ellipse cx="500" cy="70" rx="420" ry="50" fill="#f0e6d8" opacity="0.45" />

      {/* Main roof mass with upturned eaves */}
      <path
        d="M40 95
           C 90 95, 120 48, 170 55
           C 250 65, 320 30, 500 24
           C 680 30, 750 65, 830 55
           C 880 48, 910 95, 960 95
           L 940 128 L 60 128 Z"
        fill="url(#tileGrad)"
      />

      {/* Scalloped tile rows */}
      {Array.from({ length: 22 }).map((_, i) => {
        const x = 70 + i * 39;
        return (
          <g key={i} opacity="0.7">
            <ellipse cx={x} cy="88" rx="16" ry="9" fill="#2f3844" />
            <ellipse cx={x} cy="102" rx="15" ry="8" fill="#3d4754" />
            <ellipse cx={x} cy="114" rx="14" ry="7" fill="#2a323c" />
          </g>
        );
      })}

      {/* Cream structural beam under tiles */}
      <path
        d="M55 128 L945 128 L925 148 L75 148 Z"
        fill="url(#beamGrad)"
        stroke="#c4b29a"
        strokeWidth="1"
      />
      {/* Vertical posts under beam */}
      {Array.from({ length: 11 }).map((_, i) => {
        const x = 120 + i * 76;
        return (
          <rect
            key={i}
            x={x}
            y="128"
            width="4"
            height="20"
            fill="#c9b8a0"
            opacity="0.7"
          />
        );
      })}

      {/* Ridge finial */}
      <path d="M500 18 L512 36 L488 36 Z" fill="#c9a45b" />
      <rect x="494" y="34" width="12" height="8" rx="1" fill="#a8894a" />
    </svg>
  );
}

function GateDoorFace({ side }: { side: "left" | "right" }) {
  return (
    <div className={`gate-door-face gate-door-face-${side}`}>
      <svg
        className="gate-door-svg"
        viewBox="0 0 120 320"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id={`wood-${side}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#5a3424" />
            <stop offset="35%" stopColor="#8b5a3c" />
            <stop offset="70%" stopColor="#6b402c" />
            <stop offset="100%" stopColor="#3d2418" />
          </linearGradient>
          <linearGradient id={`woodV-${side}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9a6848" />
            <stop offset="50%" stopColor="#6b402c" />
            <stop offset="100%" stopColor="#3a2014" />
          </linearGradient>
          <pattern
            id={`doorFret-${side}`}
            width="14"
            height="14"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 7 H14 M7 0 V14"
              stroke="#1f120c"
              strokeWidth="1.3"
              fill="none"
            />
            <path
              d="M0 0 L14 14 M14 0 L0 14"
              stroke="#1f120c"
              strokeWidth="0.7"
              opacity="0.55"
              fill="none"
            />
          </pattern>
        </defs>

        {/* Door body */}
        <rect
          x="2"
          y="2"
          width="116"
          height="316"
          rx="2"
          fill={`url(#woodV-${side})`}
          stroke="#1a100c"
          strokeWidth="2"
        />
        <rect
          x="6"
          y="6"
          width="108"
          height="308"
          fill="none"
          stroke="#c4a070"
          strokeWidth="1"
          opacity="0.25"
        />

        {/* Upper lattice panel */}
        <rect
          x="14"
          y="18"
          width="92"
          height="168"
          fill="#4a2e20"
          stroke="#1a100c"
          strokeWidth="2"
        />
        <rect
          x="14"
          y="18"
          width="92"
          height="168"
          fill={`url(#doorFret-${side})`}
          opacity="0.95"
        />
        {/* Octagon / geometric motif */}
        <path
          d="M60 40 L82 60 L82 100 L60 120 L38 100 L38 60 Z"
          fill="none"
          stroke="#d4b483"
          strokeWidth="1.8"
          opacity="0.55"
        />
        <rect
          x="48"
          y="68"
          width="24"
          height="24"
          fill="none"
          stroke="#d4b483"
          strokeWidth="1.2"
          opacity="0.45"
          transform="rotate(45 60 80)"
        />

        {/* Mid rail + handle */}
        <rect x="10" y="192" width="100" height="14" fill={`url(#wood-${side})`} />
        <rect
          x={side === "left" ? "88" : "26"}
          y="196"
          width="5"
          height="48"
          rx="2"
          fill="#c9a45b"
          stroke="#5a3d18"
          strokeWidth="0.8"
        />

        {/* Lower solid panels */}
        <rect
          x="16"
          y="214"
          width="88"
          height="88"
          fill="#5c3624"
          stroke="#1a100c"
          strokeWidth="2"
        />
        <rect
          x="24"
          y="222"
          width="72"
          height="32"
          fill="none"
          stroke="#2a1810"
          strokeWidth="2"
        />
        <rect
          x="24"
          y="262"
          width="72"
          height="32"
          fill="none"
          stroke="#2a1810"
          strokeWidth="2"
        />
        <rect
          x="28"
          y="226"
          width="64"
          height="24"
          fill="#6e4330"
          opacity="0.55"
        />
        <rect
          x="28"
          y="266"
          width="64"
          height="24"
          fill="#6e4330"
          opacity="0.55"
        />
      </svg>
    </div>
  );
}

/**
 * CSS/SVG Chinese gate matching the invitation artwork.
 * Fixed border: roof + pillars + open doors while content scrolls.
 */
export default function InvitationGate({
  opening = false,
  opened = false,
}: InvitationGateProps) {
  const [doorsOpen, setDoorsOpen] = useState(opened && !opening);

  useEffect(() => {
    if (opened && !opening) {
      setDoorsOpen(true);
      return;
    }
    if (!opening) return;

    setDoorsOpen(false);
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setDoorsOpen(true));
    });
    return () => window.cancelAnimationFrame(id);
  }, [opening, opened]);

  return (
    <div
      className={`invitation-gate pointer-events-none fixed inset-0 z-[35] ${
        doorsOpen ? "is-open" : "is-closed"
      }`}
      aria-hidden
    >
      <div className="gate-shell">
        <div className="gate-roof">
          <GateRoofSvg />
        </div>

        <div className="gate-transom">
          <div className="gate-transom-frame">
            <ChineseLattice emblem className="gate-transom-lattice" />
          </div>
        </div>

        <div className="gate-pillar gate-pillar-left">
          <span className="gate-pillar-cap" />
          <span className="gate-pillar-body" />
          <span className="gate-pillar-base" />
        </div>
        <div className="gate-pillar gate-pillar-right">
          <span className="gate-pillar-cap" />
          <span className="gate-pillar-body" />
          <span className="gate-pillar-base" />
        </div>

        {/* Stepped cream lintel / side moldings like the painting */}
        <div className="gate-lintel" />

        <div className="gate-threshold" />

        <div className="gate-portal">
          <div className={`gate-shutter ${doorsOpen ? "is-open" : ""}`} />
          <div className={`gate-doors ${doorsOpen ? "is-open" : ""}`}>
            <div className="gate-door gate-door-left">
              <GateDoorFace side="left" />
            </div>
            <div className="gate-door gate-door-right">
              <GateDoorFace side="right" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
