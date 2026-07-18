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
  /** Wing-flap frames per second (lower = slower flap) */
  fps: number;
  size: number;
  yStart: number;
  yDrift: number;
  dir: 1 | -1;
  bob: number;
};

/** Slow, floating paths across the full screen */
const BIRDS: BirdConfig[] = [
  { delayMs: 0, durationMs: 42000, fps: 8, size: 48, yStart: 8, yDrift: 14, dir: 1, bob: 10 },
  { delayMs: 4000, durationMs: 48000, fps: 7, size: 36, yStart: 22, yDrift: -12, dir: -1, bob: 9 },
  { delayMs: 8000, durationMs: 45000, fps: 8, size: 54, yStart: 40, yDrift: 18, dir: 1, bob: 12 },
  { delayMs: 2500, durationMs: 52000, fps: 7, size: 40, yStart: 58, yDrift: -16, dir: -1, bob: 10 },
  { delayMs: 6500, durationMs: 46000, fps: 8, size: 44, yStart: 72, yDrift: 12, dir: 1, bob: 11 },
  { delayMs: 11000, durationMs: 40000, fps: 7, size: 34, yStart: 14, yDrift: 22, dir: -1, bob: 8 },
  { delayMs: 15000, durationMs: 50000, fps: 8, size: 50, yStart: 48, yDrift: -20, dir: 1, bob: 13 },
  { delayMs: 9000, durationMs: 55000, fps: 7, size: 38, yStart: 82, yDrift: -14, dir: -1, bob: 9 },
];

function easeInOutSine(t: number) {
  return 0.5 - Math.cos(Math.PI * t) / 2;
}

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
  const actorRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const startRef = useRef<number | null>(null);
  const lastFrameRef = useRef(-1);

  useEffect(() => {
    if (!framesReady) return;
    let raf = 0;
    let active = true;

    const tick = (now: number) => {
      if (!active) return;
      if (startRef.current == null) startRef.current = now + delayMs;
      const origin = startRef.current;
      const el = actorRef.current;
      const img = imgRef.current;

      if (!el || !img || now < origin) {
        if (el) el.style.opacity = "0";
        raf = requestAnimationFrame(tick);
        return;
      }

      const elapsed = now - origin;
      const raw = (elapsed % durationMs) / durationMs;
      const p = easeInOutSine(raw);

      const x = dir === 1 ? -18 + p * 136 : 118 - p * 136;
      const y =
        yStart +
        p * yDrift +
        Math.sin(raw * Math.PI * 2) * (bob * 0.08);
      const visible = raw > 0.01 && raw < 0.99;

      el.style.opacity = visible ? "0.9" : "0";
      el.style.transform = `translate3d(${x}vw, ${y}vh, 0) scaleX(${dir})`;

      const frame = Math.floor((elapsed / 1000) * fps) % FRAME_COUNT;
      if (frame !== lastFrameRef.current) {
        lastFrameRef.current = frame;
        img.src = FRAME_PATHS[frame];
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      active = false;
      cancelAnimationFrame(raf);
    };
  }, [bob, delayMs, dir, durationMs, fps, framesReady, yDrift, yStart]);

  if (!framesReady) return null;

  return (
    <div
      ref={actorRef}
      className="flying-bird-actor"
      style={{
        width: size,
        height: size,
        opacity: 0,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={FRAME_PATHS[0]}
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
