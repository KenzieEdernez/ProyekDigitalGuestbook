"use client";

import { useEffect, useRef } from "react";
import {
  birdMediaProxyUrl,
  keyOutGreenscreen,
} from "@/lib/bird-chroma-key";

/** Admin preview: plays MP4 and strips greenscreen live. */
export default function BirdGreenscreenPreview({ src }: { src: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!src) return;

    let active = true;
    let raf = 0;
    const playableSrc = birdMediaProxyUrl(src);

    const video = document.createElement("video");
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "true");
    video.preload = "auto";
    video.src = playableSrc;

    const play = () => {
      void video.play().catch(() => undefined);
    };
    video.addEventListener("loadeddata", play);
    video.addEventListener("canplay", play);
    play();

    const draw = () => {
      if (!active) return;
      const canvas = canvasRef.current;
      if (
        canvas &&
        video.readyState >= 2 &&
        video.videoWidth > 0 &&
        video.videoHeight > 0
      ) {
        const max = 160;
        const scale = Math.min(
          max / video.videoWidth,
          max / video.videoHeight,
          1
        );
        const w = Math.max(1, Math.round(video.videoWidth * scale));
        const h = Math.max(1, Math.round(video.videoHeight * scale));
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }
        const ctx = canvas.getContext("2d", {
          willReadFrequently: true,
          alpha: true,
        });
        if (ctx) {
          ctx.clearRect(0, 0, w, h);
          ctx.drawImage(video, 0, 0, w, h);
          try {
            const imageData = ctx.getImageData(0, 0, w, h);
            keyOutGreenscreen(imageData);
            ctx.putImageData(imageData, 0, 0);
          } catch {
            // Proxy should make this readable.
          }
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
    };
  }, [src]);

  return (
    <canvas
      ref={canvasRef}
      className="max-h-28 w-auto object-contain"
      aria-hidden
    />
  );
}
