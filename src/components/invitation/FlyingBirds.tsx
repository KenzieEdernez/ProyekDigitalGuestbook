"use client";

import { useEffect, useRef } from "react";

type BirdConfig = {
  delayMs: number;
  /** 0–1 progress offset so birds can already be on-screen at open */
  startOffset: number;
  durationMs: number;
  size: number;
  yStart: number;
  yDrift: number;
  dir: 1 | -1;
  bob: number;
  playbackRate: number;
};

/** Standard size, quick entrance, still calm flight across the screen. */
const BIRDS: BirdConfig[] = [
  { delayMs: 0, startOffset: 0.18, durationMs: 32000, size: 118, yStart: 10, yDrift: 12, dir: 1, bob: 10, playbackRate: 1 },
  { delayMs: 200, startOffset: 0.08, durationMs: 34000, size: 102, yStart: 28, yDrift: -10, dir: -1, bob: 9, playbackRate: 1 },
  { delayMs: 450, startOffset: 0.22, durationMs: 30000, size: 128, yStart: 44, yDrift: 14, dir: 1, bob: 11, playbackRate: 1 },
  { delayMs: 700, startOffset: 0.05, durationMs: 36000, size: 110, yStart: 62, yDrift: -12, dir: -1, bob: 10, playbackRate: 1 },
  { delayMs: 950, startOffset: 0.15, durationMs: 33000, size: 120, yStart: 76, yDrift: 10, dir: 1, bob: 10, playbackRate: 1 },
  { delayMs: 1200, startOffset: 0.1, durationMs: 31000, size: 98, yStart: 18, yDrift: 16, dir: -1, bob: 8, playbackRate: 1 },
];

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
        // Keep first birds visible immediately using their start offset preview.
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
      const raw = ((elapsed / durationMs) + startOffset) % 1;
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

export default function FlyingBirds({ birdImage }: FlyingBirdsProps) {
  const src = birdImage?.trim() || "";
  if (!src || !isVideoSrc(src)) return null;

  return (
    <div className="flying-birds" aria-hidden>
      {BIRDS.map((bird, index) => (
        <BirdActor key={`${src}-${index}`} src={src} {...bird} />
      ))}
    </div>
  );
}
