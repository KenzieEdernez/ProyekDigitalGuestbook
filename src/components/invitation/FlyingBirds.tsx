"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import {
  birdMediaProxyUrl,
  keyOutGreenscreen,
} from "@/lib/bird-chroma-key";

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
  fps: number;
};

const MAX_BIRDS = 12;
const FRAME_COUNT = 15;
const FRAME_PATHS = Array.from(
  { length: FRAME_COUNT },
  (_, i) => `/invitation/dove/${String(i).padStart(2, "0")}.png`
);
const PROCESS_MAX = 180;

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
      playbackRate: 1,
      fps: 12 + (i % 3),
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
    value.includes("video/webm") ||
    value.includes(".mov") ||
    value.includes(".mp4") ||
    value.includes(".m4v") ||
    value.includes("video/quicktime") ||
    value.includes("video/mp4")
  );
}

interface FlyingBirdsProps {
  birdImage?: string;
  birdImageIos?: string;
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

  return actorRef;
}

function KeyedBirdActor({
  sheetRef,
  size,
  ...config
}: BirdConfig & {
  sheetRef: MutableRefObject<HTMLCanvasElement | null>;
}) {
  const actorRef = useFlight(config);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let raf = 0;
    let active = true;

    const tick = () => {
      if (!active) return;
      const canvas = canvasRef.current;
      const sheet = sheetRef.current;
      if (canvas && sheet && sheet.width > 0 && sheet.height > 0) {
        if (canvas.width !== size || canvas.height !== size) {
          canvas.width = size;
          canvas.height = size;
        }
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, size, size);
          ctx.drawImage(sheet, 0, 0, size, size);
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      active = false;
      cancelAnimationFrame(raf);
    };
  }, [sheetRef, size]);

  return (
    <div
      ref={actorRef}
      className="flying-bird-actor"
      style={{ width: size, height: size, opacity: 0 }}
    >
      <canvas
        ref={canvasRef}
        className="flying-bird-video"
        width={size}
        height={size}
      />
    </div>
  );
}

/** One shared MP4 → greenscreen-keyed canvas; birds blit the transparent sheet. */
function KeyedVideoBirds({
  src,
  birds,
}: {
  src: string;
  birds: BirdConfig[];
}) {
  const sheetRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    let raf = 0;
    let markedReady = false;
    const playableSrc = birdMediaProxyUrl(src);

    const video = document.createElement("video");
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");
    video.preload = "auto";
    // Same-origin proxy → pixels are readable for chroma-key.
    video.src = playableSrc;

    const sheet = document.createElement("canvas");
    sheetRef.current = sheet;
    const ctx = sheet.getContext("2d", {
      willReadFrequently: true,
      alpha: true,
    });
    if (!ctx) return;

    const play = () => {
      void video.play().catch(() => undefined);
    };

    video.addEventListener("loadeddata", play);
    video.addEventListener("canplay", play);
    play();

    const draw = () => {
      if (!active) return;

      if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
        const scale = Math.min(
          PROCESS_MAX / video.videoWidth,
          PROCESS_MAX / video.videoHeight,
          1
        );
        const w = Math.max(1, Math.round(video.videoWidth * scale));
        const h = Math.max(1, Math.round(video.videoHeight * scale));

        if (sheet.width !== w || sheet.height !== h) {
          sheet.width = w;
          sheet.height = h;
        }

        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(video, 0, 0, w, h);

        try {
          const imageData = ctx.getImageData(0, 0, w, h);
          keyOutGreenscreen(imageData);
          ctx.putImageData(imageData, 0, 0);
        } catch {
          // Should not happen with same-origin proxy; keep frame if it does.
        }

        if (active && !markedReady) {
          markedReady = true;
          setReady(true);
        }
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      active = false;
      cancelAnimationFrame(raf);
      video.removeEventListener("loadeddata", play);
      video.removeEventListener("canplay", play);
      video.pause();
      video.removeAttribute("src");
      video.load();
      sheetRef.current = null;
    };
  }, [src]);

  if (!ready) return null;

  return (
    <div className="flying-birds" aria-hidden>
      {birds.map((bird, index) => (
        <KeyedBirdActor
          key={`${src}-${index}`}
          sheetRef={sheetRef}
          {...bird}
        />
      ))}
    </div>
  );
}

function PngBirdActor({
  size,
  fps,
  framesReady,
  ...config
}: BirdConfig & { framesReady: boolean }) {
  const actorRef = useFlight(config);
  const imgRef = useRef<HTMLImageElement>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!framesReady) return;
    let raf = 0;
    let active = true;

    const tick = (now: number) => {
      if (!active) return;
      if (startRef.current == null) startRef.current = now + config.delayMs;
      const img = imgRef.current;
      if (img && now >= startRef.current) {
        const elapsed = now - startRef.current;
        const frame = Math.floor((elapsed / 1000) * fps) % FRAME_COUNT;
        const next = FRAME_PATHS[frame];
        if (img.getAttribute("src") !== next) {
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
  }, [config.delayMs, framesReady, fps]);

  if (!framesReady) return null;

  return (
    <div
      ref={actorRef}
      className="flying-bird-actor"
      style={{ width: size, height: size, opacity: 0 }}
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

export default function FlyingBirds({
  birdImage,
  birdImageIos,
  birdCount = 6,
}: FlyingBirdsProps) {
  const primary = birdImage?.trim() || "";
  const fallback = birdImageIos?.trim() || "";
  const src = primary || fallback;
  const birds = useMemo(() => buildBirdConfigs(birdCount), [birdCount]);
  const [mode, setMode] = useState<"pending" | "video" | "png">("pending");
  const [framesReady, setFramesReady] = useState(false);

  useEffect(() => {
    if (src && isVideoSrc(src)) {
      setMode("video");
      return;
    }
    setMode("png");
  }, [src]);

  useEffect(() => {
    if (mode !== "png") return;
    let cancelled = false;
    Promise.all(
      FRAME_PATHS.map(
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
  }, [mode]);

  if (mode === "pending") return null;

  if (mode === "video" && src && isVideoSrc(src)) {
    return <KeyedVideoBirds src={src} birds={birds} />;
  }

  return (
    <div className="flying-birds" aria-hidden>
      {birds.map((bird, index) => (
        <PngBirdActor
          key={`png-${birdCount}-${index}`}
          {...bird}
          framesReady={framesReady}
        />
      ))}
    </div>
  );
}
