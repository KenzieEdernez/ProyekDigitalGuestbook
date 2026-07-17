"use client";

const BIRDS = [
  { className: "flying-bird-1", delay: "0s", duration: "18s", top: "10%", scale: 0.65 },
  { className: "flying-bird-2", delay: "2.5s", duration: "22s", top: "22%", scale: 0.5 },
  { className: "flying-bird-3", delay: "4.5s", duration: "20s", top: "36%", scale: 0.8 },
  { className: "flying-bird-4", delay: "1.2s", duration: "24s", top: "48%", scale: 0.55 },
  { className: "flying-bird-5", delay: "3.2s", duration: "19s", top: "16%", scale: 0.7 },
];

interface FlyingBirdsProps {
  birdImage?: string;
}

export default function FlyingBirds({ birdImage }: FlyingBirdsProps) {
  if (!birdImage) return null;

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
            ["--bird-scale" as string]: bird.scale,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={birdImage}
            alt=""
            className="flying-bird-image h-8 w-auto object-contain sm:h-10"
          />
        </div>
      ))}
    </div>
  );
}
