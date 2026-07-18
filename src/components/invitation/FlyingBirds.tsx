"use client";

const DEFAULT_SPRITE = "/invitation/dove-sprite.png";
const FRAME_COUNT = 15;
const DISPLAY_SIZE = 52;

const BIRDS = [
  { delay: "0s", duration: "16s", flap: "0.42s", top: "11%", scale: 0.78 },
  { delay: "2.2s", duration: "20s", flap: "0.5s", top: "24%", scale: 0.58 },
  { delay: "4.4s", duration: "18s", flap: "0.38s", top: "34%", scale: 0.9 },
  { delay: "1.1s", duration: "22s", flap: "0.46s", top: "46%", scale: 0.64 },
  { delay: "3.3s", duration: "17s", flap: "0.4s", top: "17%", scale: 0.72 },
];

interface FlyingBirdsProps {
  /** Kept for API compatibility; flapping uses the bundled dove sprite. */
  birdImage?: string;
}

export default function FlyingBirds(_props: FlyingBirdsProps) {
  return (
    <div
      className="flying-birds pointer-events-none absolute inset-0 z-20 overflow-hidden"
      aria-hidden
    >
      {BIRDS.map((bird, index) => (
        <div
          key={index}
          className={`flying-bird flying-bird-${index + 1}`}
          style={{
            top: bird.top,
            animationDelay: bird.delay,
            animationDuration: bird.duration,
            ["--bird-scale" as string]: String(bird.scale),
          }}
        >
          <span
            className="flying-bird-sprite"
            style={{
              width: DISPLAY_SIZE,
              height: DISPLAY_SIZE,
              backgroundImage: `url('${DEFAULT_SPRITE}')`,
              backgroundSize: `${DISPLAY_SIZE * FRAME_COUNT}px ${DISPLAY_SIZE}px`,
              ["--bird-flap-end" as string]: `-${DISPLAY_SIZE * FRAME_COUNT}px`,
              animationDuration: bird.flap,
            }}
          />
        </div>
      ))}
    </div>
  );
}
