"use client";

import { useEffect, useRef, useState } from "react";

type BirdConfig = {
  delayMs: number;
  durationMs: number;
  size: number;
  yStart: number;
  yDrift: number;
  dir: 1 | -1;
  bob: number;
  playbackRate: number;
};

/** Slow floating paths — video already contains in-place wing animation. */
const BIRDS: BirdConfig[] = [
  { delayMs: 0, durationMs: 42000, size: 72, yStart: 8, yDrift: 14, dir: 1, bob: 10, playbackRate: 0.9 },
  { delayMs: 4500, durationMs: 48000, size: 56, yStart: 24, yDrift: -12, dir: -1, bob: 9, playbackRate: 1 },
  { delayMs: 9000, durationMs: 45000, size: 84, yStart: 42, yDrift: 18, dir: 1, bob: 12, playbackRate: 0.85 },
  { delayMs: 2500, durationMs: 52000, size: 60, yStart: 58, yDrift: -16, dir: -1, bob: 10, playbackRate: 1.05 },
  { delayMs: 7000, durationMs: 46000, size: 68, yStart: 72, yDrift: 12, dir: 1, bob: 11, playbackRate: 0.95 },
  { delayMs: 12000, durationMs: 40000, size: 52, yStart: 16, yDrift: 22, dir: -1, bob: 8, playbackRate: 1 },
  { delayMs: 16000, durationMs: 50000, size: 76, yStart: 48, yDrift: -20, dir: 1, bob: 13, playbackRate: 0.9 },
  { delayMs: 10000, durationMs: 55000, size: 58, yStart: 80, yDrift: -14, dir: -1, bob: 9, playbackRate: 1 },
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

    video.playbackRate = playbackRate;
    const play = () => {
      video.play().catch(() => {
        /* autoplay can be blocked until a user gesture; muted + playsInline usually ok */
      });
    };
    play();
    video.addEventListener("canplay", play);
    return () => video.removeEventListener("canplay", play);
  }, [playbackRate, src]);

  useEffect(() => {
    let raf = 0;
    let active = true;

    const tick = (now: number) => {
      if (!active) return;
      if (startRef.current == null) startRef.current = now + delayMs;
      const origin = startRef.current;
      const el = actorRef.current;

      if (!el || now < origin) {
        if (el) el.style.opacity = "0";
        raf = requestAnimationFrame(tick);
        return;
      }

      const elapsed = now - origin;
      const raw = (elapsed % durationMs) / durationMs;
      const p = easeInOutSine(raw);
      const x = dir === 1 ? -20 + p * 140 : 120 - p * 140;
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
  }, [bob, delayMs, dir, durationMs, yDrift, yStart]);

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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!src || !isVideoSrc(src)) {
      setReady(false);
      return;
    }

    let cancelled = false;
    const probe = document.createElement("video");
    probe.preload = "auto";
    probe.muted = true;
    probe.playsInline = true;
    const markReady = () => {
      if (!cancelled) setReady(true);
    };
    probe.addEventListener("loadeddata", markReady);
    probe.addEventListener("error", () => {
      if (!cancelled) setReady(false);
    });
    probe.src = src;
    probe.load();

    return () => {
      cancelled = true;
      probe.removeAttribute("src");
      probe.load();
    };
  }, [src]);

  if (!src || !isVideoSrc(src) || !ready) return null;

  return (
    <div className="flying-birds" aria-hidden>
      {BIRDS.map((bird, index) => (
        <BirdActor key={`${src}-${index}`} src={src} {...bird} />
      ))}
    </div>
  );
}
