"use client";

import { useEffect, useMemo, useRef } from "react";

type BirdConfig = {
  delayMs: number;
  startOffset: number;
  durationMs: number;
  size: number;
  yStart: number;
  yDrift: number;
  dir: 1 | -1;
  bob: number;
  playbackRate: number;
};

const MAX_BIRDS = 12;

function buildBirdConfigs(count: number): BirdConfig[] {
  const total = Math.min(MAX_BIRDS, Math.max(1, Math.round(count)));
  const configs: BirdConfig[] = [];

  for (let i = 0; i < total; i += 1) {
    const t = total === 1 ? 0.5 : i / (total - 1);
    const dir: 1 | -1 = i % 2 === 0 ? 1 : -1;
    configs.push({
      delayMs: i * 180,
      startOffset: 0.06 + (i % 5) * 0.04,
      // Slightly faster crossings
      durationMs: 20000 + (i % 4) * 1500,
      size: 100 + (i % 3) * 12,
      yStart: 8 + t * 74,
      yDrift: dir * (8 + (i % 4) * 3),
      dir,
      bob: 8 + (i % 3) * 2,
      playbackRate: 1,
    });
  }

  return configs;
}

function easeInOutSine(t: number) {
  return 0.5 - Math.cos(Math.PI * t) / 2;
}

function isVideoSrc(src: string) {
  const value = src.toLowerCase();
  return (
    value.startsWith("data:video/") ||
    value.includes(".webm") ||
    value.includes("video/webm")
  );
}

interface FlyingBirdsProps {
  birdImage?: string;
  birdCount?: number;
}

function BirdActor({
  src,
  delayMs,
  startOffset,
  durationMs,
  size,
  yStart,
  yDrift,
  dir,
  bob,
  playbackRate,
}: BirdConfig & { src: string }) {
  const actorRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.playbackRate = playbackRate;

    const play = () => {
      void video.play().catch(() => undefined);
    };

    play();
    video.addEventListener("loadeddata", play);
    video.addEventListener("canplay", play);
    return () => {
      video.removeEventListener("loadeddata", play);
      video.removeEventListener("canplay", play);
    };
  }, [playbackRate, src]);

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
        if (delayMs === 0 || startOffset > 0) {
          const p = easeInOutSine(startOffset);
          const x = dir === 1 ? -12 + p * 124 : 112 - p * 124;
          const y = yStart + p * yDrift;
          el.style.opacity = "0.95";
          el.style.transform = `translate3d(${x}vw, ${y}vh, 0) scaleX(${dir})`;
        } else {
          el.style.opacity = "0";
        }
        raf = requestAnimationFrame(tick);
        return;
      }

      const elapsed = now - origin;
      const raw = (elapsed / durationMs + startOffset) % 1;
      const p = easeInOutSine(raw);
      const x = dir === 1 ? -12 + p * 124 : 112 - p * 124;
      const y = yStart + p * yDrift + Math.sin(raw * Math.PI * 2) * (bob * 0.08);
      const visible = raw > 0.01 && raw < 0.99;

      el.style.opacity = visible ? "0.95" : "0";
      el.style.transform = `translate3d(${x}vw, ${y}vh, 0) scaleX(${dir})`;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      active = false;
      cancelAnimationFrame(raf);
    };
  }, [bob, delayMs, dir, durationMs, startOffset, yDrift, yStart]);

  return (
    <div
      ref={actorRef}
      className="flying-bird-actor"
      style={{ width: size, height: size, opacity: 0 }}
    >
      <video
        ref={videoRef}
        className="flying-bird-video"
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
      />
    </div>
  );
}

export default function FlyingBirds({
  birdImage,
  birdCount = 6,
}: FlyingBirdsProps) {
  const src = birdImage?.trim() || "";
  const birds = useMemo(() => buildBirdConfigs(birdCount), [birdCount]);

  if (!src || !isVideoSrc(src)) return null;

  return (
    <div className="flying-birds" aria-hidden>
      {birds.map((bird, index) => (
        <BirdActor key={`${src}-${birdCount}-${index}`} src={src} {...bird} />
      ))}
    </div>
  );
}
