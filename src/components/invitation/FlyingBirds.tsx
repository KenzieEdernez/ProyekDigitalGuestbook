"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";

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

/** Safari / iOS need HEVC/MOV path, not WebM alpha. */
function prefersIosBirdVideo() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isiOS =
    /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafari =
    /Safari/i.test(ua) && !/Chrome|CriOS|Chromium|Android/i.test(ua);
  return isiOS || isSafari;
}

/** Cut solid black plates out of bird frames (soft edge for feathers). */
function keyOutBlack(imageData: ImageData) {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha === 0) continue;

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const max = Math.max(r, g, b);

    // Near-black plate → fully transparent
    if (luma < 32 && max < 40) {
      data[i + 3] = 0;
      continue;
    }

    // Soft fade for dark edge / compression fringing
    if (luma < 85 && max < 110) {
      const t = (luma - 32) / 53;
      data[i + 3] = Math.round(alpha * Math.max(0, Math.min(1, t)));
    }
  }
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
  useScreenBlend,
  ...config
}: BirdConfig & {
  sheetRef: MutableRefObject<HTMLCanvasElement | null>;
  useScreenBlend: boolean;
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
        className={`flying-bird-video${useScreenBlend ? " flying-bird-video--screen" : ""}`}
        width={size}
        height={size}
      />
    </div>
  );
}

/** One shared video → keyed canvas; birds only blit the transparent sheet. */
function KeyedVideoBirds({
  src,
  kind,
  birds,
}: {
  src: string;
  kind: "webm" | "ios";
  birds: BirdConfig[];
}) {
  const sheetRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);
  const [useScreenBlend, setUseScreenBlend] = useState(false);

  useEffect(() => {
    let active = true;
    let raf = 0;
    let keyingFailed = false;
    let markedReady = false;
    let markedScreenBlend = false;

    const video = document.createElement("video");
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");
    video.preload = "auto";
    video.crossOrigin = "anonymous";

    if (kind === "ios") {
      const s1 = document.createElement("source");
      s1.src = src;
      s1.type = 'video/mp4; codecs="hvc1"';
      const s2 = document.createElement("source");
      s2.src = src;
      s2.type = "video/quicktime";
      const s3 = document.createElement("source");
      s3.src = src;
      s3.type = "video/mp4";
      video.appendChild(s1);
      video.appendChild(s2);
      video.appendChild(s3);
    } else {
      const s = document.createElement("source");
      s.src = src;
      s.type = "video/webm";
      video.appendChild(s);
    }

    video.load();

    const sheet = document.createElement("canvas");
    sheetRef.current = sheet;
    const ctx = sheet.getContext("2d", { willReadFrequently: true });
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

        if (!keyingFailed) {
          try {
            const imageData = ctx.getImageData(0, 0, w, h);
            keyOutBlack(imageData);
            ctx.putImageData(imageData, 0, 0);
          } catch {
            keyingFailed = true;
            if (active && !markedScreenBlend) {
              markedScreenBlend = true;
              setUseScreenBlend(true);
            }
          }
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
      while (video.firstChild) video.removeChild(video.firstChild);
      video.load();
      sheetRef.current = null;
    };
  }, [kind, src]);

  if (!ready) return null;

  return (
    <div className="flying-birds" aria-hidden>
      {birds.map((bird, index) => (
        <KeyedBirdActor
          key={`${kind}-${src}-${index}`}
          sheetRef={sheetRef}
          useScreenBlend={useScreenBlend}
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
  const webm = birdImage?.trim() || "";
  const ios = birdImageIos?.trim() || "";
  const birds = useMemo(() => buildBirdConfigs(birdCount), [birdCount]);
  const [mode, setMode] = useState<"pending" | "webm" | "ios" | "png">(
    "pending"
  );
  const [framesReady, setFramesReady] = useState(false);

  useEffect(() => {
    const apple = prefersIosBirdVideo();
    if (apple && ios && isVideoSrc(ios)) {
      setMode("ios");
      return;
    }
    if (!apple && webm && isVideoSrc(webm)) {
      setMode("webm");
      return;
    }
    // Prefer any available video before PNG fallback.
    if (ios && isVideoSrc(ios)) {
      setMode("ios");
      return;
    }
    if (webm && isVideoSrc(webm)) {
      setMode("webm");
      return;
    }
    setMode("png");
  }, [ios, webm]);

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

  if (mode === "png") {
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

  const src = mode === "ios" ? ios : webm;
  if (!src || !isVideoSrc(src)) return null;

  return <KeyedVideoBirds src={src} kind={mode} birds={birds} />;
}
