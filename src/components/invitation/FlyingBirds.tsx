"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type BirdConfig = {
  delayMs: number;
  startOffset: number;
  durationMs: number;
  size: number;
  yStart: number;
  yDrift: number;
  dir: 1 | -1;
  bob: number;
  fps: number;
};

const MAX_BIRDS = 12;
const DEFAULT_FRAME_COUNT = 15;
const DEFAULT_FRAME_PATHS = Array.from(
  { length: DEFAULT_FRAME_COUNT },
  (_, i) => `/invitation/dove/${String(i).padStart(2, "0")}.png`
);

function buildBirdConfigs(count: number): BirdConfig[] {
  const total = Math.min(MAX_BIRDS, Math.max(1, Math.round(count)));
  const configs: BirdConfig[] = [];

  for (let i = 0; i < total; i += 1) {
    const t = total === 1 ? 0.5 : i / (total - 1);
    const dir: 1 | -1 = i % 2 === 0 ? 1 : -1;
    configs.push({
      delayMs: i * 180,
      startOffset: 0.06 + (i % 5) * 0.04,
      durationMs: 20000 + (i % 4) * 1500,
      size: 100 + (i % 3) * 12,
      yStart: 8 + t * 74,
      yDrift: dir * (8 + (i % 4) * 3),
      dir,
      bob: 8 + (i % 3) * 2,
      fps: 12 + (i % 3),
    });
  }

  return configs;
}

function easeInOutSine(t: number) {
  return 0.5 - Math.cos(Math.PI * t) / 2;
}

interface FlyingBirdsProps {
  birdImage?: string;
  birdImageIos?: string;
  birdFrames?: string[];
  birdCount?: number;
}

type FlightConfig = Pick<
  BirdConfig,
  "delayMs" | "startOffset" | "durationMs" | "yStart" | "yDrift" | "dir" | "bob"
>;

function useFlight(config: FlightConfig) {
  const actorRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<number | null>(null);
  const {
    delayMs,
    startOffset,
    durationMs,
    yStart,
    yDrift,
    dir,
    bob,
  } = config;

  useEffect(() => {
    let raf = 0;
    let active = true;

    const tick = (now: number) => {
      if (!active) return;
      if (startRef.current == null) startRef.current = now + delayMs;
      const origin = startRef.current;
      const el = actorRef.current;

      if (!el) {
        raf = requestAnimationFrame(tick);
        return;
      }

      if (now < origin) {
        const p = easeInOutSine(Math.min(1, startOffset));
        const x = dir === 1 ? -12 + p * 124 : 112 - p * 124;
        const y = yStart + p * yDrift;
        el.style.opacity = "0.95";
        el.style.transform = `translate3d(${x}vw, ${y}vh, 0) scaleX(${dir})`;
        raf = requestAnimationFrame(tick);
        return;
      }

      const elapsed = now - origin;
      const phase = ((elapsed / durationMs + startOffset) % 2 + 2) % 2;
      const goingForward = phase <= 1;
      const linear = goingForward ? phase : 2 - phase;
      const p = easeInOutSine(linear);
      const face = (goingForward ? dir : -dir) as 1 | -1;
      const x = dir === 1 ? -12 + p * 124 : 112 - p * 124;
      const y =
        yStart +
        p * yDrift +
        Math.sin(linear * Math.PI * 2) * (bob * 0.08);

      el.style.opacity = "0.95";
      el.style.transform = `translate3d(${x}vw, ${y}vh, 0) scaleX(${face})`;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      active = false;
      cancelAnimationFrame(raf);
    };
  }, [bob, delayMs, dir, durationMs, startOffset, yDrift, yStart]);

  return actorRef;
}

function FrameBirdActor({
  size,
  fps,
  framePaths,
  framesReady,
  ...config
}: BirdConfig & { framePaths: string[]; framesReady: boolean }) {
  const actorRef = useFlight(config);
  const imgRef = useRef<HTMLImageElement>(null);
  const startRef = useRef<number | null>(null);
  const frameCount = framePaths.length;

  useEffect(() => {
    if (!framesReady || frameCount === 0) return;
    let raf = 0;
    let active = true;

    const tick = (now: number) => {
      if (!active) return;
      if (startRef.current == null) startRef.current = now + config.delayMs;
      const img = imgRef.current;
      if (img && now >= startRef.current) {
        const elapsed = now - startRef.current;
        const frame = Math.floor((elapsed / 1000) * fps) % frameCount;
        const next = framePaths[frame];
        if (next && img.getAttribute("src") !== next) {
          img.src = next;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      active = false;
      cancelAnimationFrame(raf);
    };
  }, [config.delayMs, frameCount, framePaths, framesReady, fps]);

  if (!framesReady || frameCount === 0) return null;

  return (
    <div
      ref={actorRef}
      className="flying-bird-actor"
      style={{ width: size, height: size, opacity: 0 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={framePaths[0]}
        alt=""
        className="flying-bird-frame"
        draggable={false}
      />
    </div>
  );
}

export default function FlyingBirds({
  birdFrames,
  birdCount = 6,
}: FlyingBirdsProps) {
  const customFrames = useMemo(
    () =>
      (birdFrames || [])
        .map((frame) => String(frame || "").trim())
        .filter(Boolean),
    [birdFrames]
  );
  const framePaths = customFrames.length > 0 ? customFrames : DEFAULT_FRAME_PATHS;
  const birds = useMemo(() => buildBirdConfigs(birdCount), [birdCount]);
  const [framesReady, setFramesReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFramesReady(false);
    Promise.all(
      framePaths.map(
        (path) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = path;
          })
      )
    ).then(() => {
      if (!cancelled) setFramesReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [framePaths]);

  return (
    <div className="flying-birds" aria-hidden>
      {birds.map((bird, index) => (
        <FrameBirdActor
          key={`${framePaths[0]}-${birdCount}-${index}`}
          {...bird}
          framePaths={framePaths}
          framesReady={framesReady}
        />
      ))}
    </div>
  );
}
