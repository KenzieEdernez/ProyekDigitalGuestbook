"use client";

function BirdIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 32"
      aria-hidden
      className={className}
      fill="currentColor"
    >
      <path d="M4 18c8-10 18-12 28-8 6 2 10 1 14-2-2 6-8 10-16 12-8 2-18 0-26-2z" />
      <path
        d="M18 12c3-4 8-6 13-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const BIRDS = [
  { className: "flying-bird-1", delay: "0s", duration: "18s", top: "12%", scale: 0.7 },
  { className: "flying-bird-2", delay: "2s", duration: "22s", top: "24%", scale: 0.55 },
  { className: "flying-bird-3", delay: "4s", duration: "20s", top: "38%", scale: 0.85 },
  { className: "flying-bird-4", delay: "1s", duration: "24s", top: "52%", scale: 0.6 },
  { className: "flying-bird-5", delay: "3s", duration: "19s", top: "18%", scale: 0.75 },
];

export default function FlyingBirds() {
  return (
    <div
      className="flying-birds pointer-events-none absolute inset-0 z-20 overflow-hidden"
      aria-hidden
    >
      {BIRDS.map((bird, index) => (
        <div
          key={index}
          className={`flying-bird ${bird.className}`}
          style={{
            top: bird.top,
            animationDelay: bird.delay,
            animationDuration: bird.duration,
            transform: `scale(${bird.scale})`,
          }}
        >
          <BirdIcon className="h-8 w-16 text-white/70 drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]" />
        </div>
      ))}
    </div>
  );
}
