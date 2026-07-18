"use client";

import { useEffect, useRef, useState } from "react";

const FRAME_COUNT = 15;
const FRAME_PATHS = Array.from(
  { length: FRAME_COUNT },
  (_, i) => `/invitation/dove/${String(i).padStart(2, "0")}.png`
);

type BirdConfig = {
  delayMs: number;
  durationMs: number;
  fps: number;
  size: number;
  /** Vertical band start (0–100 vh) */
  yStart: number;
  /** Vertical drift across the flight (vh units) */
  yDrift: number;
  /** 1 = left→right, -1 = right→left */
  dir: 1 | -1;
  /** Soft bob amplitude in px */
  bob: number;
};

const BIRDS: BirdConfig[] = [
  { delayMs: 0, durationMs: 18000, fps: 14, size: 48, yStart: 8, yDrift: 18, dir: 1, bob: 12 },
  { delayMs: 1800, durationMs: 21000, fps: 12, size: 36, yStart: 22, yDrift: -14, dir: -1, bob: 10 },
  { delayMs: 3600, durationMs: 19000, fps: 15, size: 54, yStart: 40, yDrift: 22, dir: 1, bob: 14 },
  { delayMs: 900, durationMs: 23000, fps: 13, size: 40, yStart: 58, yDrift: -20, dir: -1, bob: 11 },
  { delayMs: 2800, durationMs: 20000, fps: 14, size: 44, yStart: 72, yDrift: 16, dir: 1, bob: 13 },
  { delayMs: 5200, durationMs: 17000, fps: 15, size: 34, yStart: 14, yDrift: 28, dir: -1, bob: 9 },
  { delayMs: 7000, durationMs: 22000, fps: 12, size: 50, yStart: 48, yDrift: -24, dir: 1, bob: 15 },
  { delayMs: 4200, durationMs: 25000, fps: 13, size: 38, yStart: 82, yDrift: -18, dir: -1, bob: 10 },
];

interface FlyingBirdsProps {
  birdImage?: string;
}

function DoveActor({
  delayMs,
  durationMs,
  fps,
  size,
  yStart,
  yDrift,
  dir,
  bob,
  framesReady,
}: BirdConfig & { framesReady: boolean }) {
  const [frame, setFrame] = useState(0);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!framesReady) return;
    let raf = 0;
    let active = true;

    const tick = (now: number) => {
      if (!active) return;
      if (startRef.current == null) startRef.current = now + delayMs;
      const origin = startRef.current;
      if (now < origin) {
        setVisible(false);
        raf = requestAnimationFrame(tick);
        return;
      }

      const elapsed = now - origin;
      const cycle = elapsed % durationMs;
      const p = cycle / durationMs;
      setProgress(p);
      setVisible(p > 0.015 && p < 0.985);
      setFrame(Math.floor((elapsed / 1000) * fps) % FRAME_COUNT);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      active = false;
      cancelAnimationFrame(raf);
    };
  }, [delayMs, durationMs, fps, framesReady]);

  if (!framesReady) return null;

  // Full-viewport horizontal sweep with slight overscan so birds enter/exit cleanly.
  const x = dir === 1 ? -16 + progress * 132 : 116 - progress * 132;
  const y = yStart + progress * yDrift + Math.sin(progress * Math.PI * 2) * (bob / 10);
  const opacity = visible ? 0.9 : 0;

  return (
    <div
      className="flying-bird-actor"
      style={{
        width: size,
        height: size,
        opacity,
        transform: `translate3d(${x}vw, ${y}vh, 0) scaleX(${dir})`,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={FRAME_PATHS[frame]}
        alt=""
        className="flying-bird-frame"
        draggable={false}
      />
    </div>
  );
}

export default function FlyingBirds(_props: FlyingBirdsProps) {
  const [framesReady, setFramesReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      FRAME_PATHS.map(
        (src) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = src;
          })
      )
    ).then(() => {
      if (!cancelled) setFramesReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flying-birds" aria-hidden>
      {BIRDS.map((bird, index) => (
        <DoveActor key={index} {...bird} framesReady={framesReady} />
      ))}
    </div>
  );
}
