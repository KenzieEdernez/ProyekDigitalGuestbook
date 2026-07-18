"use client";

import { useEffect, useRef, useState } from "react";

const FRAME_COUNT = 15;
const FRAME_PATHS = Array.from(
  { length: FRAME_COUNT },
  (_, i) => `/invitation/dove/${String(i).padStart(2, "0")}.png`
);

const BIRDS = [
  { delayMs: 0, durationMs: 16000, fps: 14, top: "12%", size: 46, dir: 1 },
  { delayMs: 2200, durationMs: 19000, fps: 12, top: "26%", size: 36, dir: -1 },
  { delayMs: 4200, durationMs: 17000, fps: 15, top: "38%", size: 52, dir: 1 },
  { delayMs: 1100, durationMs: 21000, fps: 13, top: "48%", size: 40, dir: -1 },
  { delayMs: 3000, durationMs: 18000, fps: 14, top: "18%", size: 44, dir: 1 },
];

interface FlyingBirdsProps {
  birdImage?: string;
}

function DoveActor({
  delayMs,
  durationMs,
  fps,
  top,
  size,
  dir,
  framesReady,
}: (typeof BIRDS)[number] & { framesReady: boolean }) {
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
      setVisible(p > 0.02 && p < 0.96);
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

  const x =
    dir === 1
      ? -18 + progress * 130
      : 112 - progress * 130;
  const y = Math.sin(progress * Math.PI * 2) * 10;
  const opacity = visible ? 0.92 : 0;

  return (
    <div
      className="flying-bird-actor"
      style={{
        top,
        width: size,
        height: size,
        opacity,
        transform: `translate3d(${x}vw, ${y}px, 0) scaleX(${dir})`,
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
    <div
      className="flying-birds pointer-events-none absolute inset-0 z-20 overflow-hidden"
      aria-hidden
    >
      {BIRDS.map((bird, index) => (
        <DoveActor key={index} {...bird} framesReady={framesReady} />
      ))}
    </div>
  );
}
