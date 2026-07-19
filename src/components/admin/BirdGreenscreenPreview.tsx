"use client";

import { useEffect, useRef } from "react";
import { startKeyedBirdDrawer } from "@/lib/keyed-bird-drawer";

/** Admin preview: plays bird MP4 and strips greenscreen live. */
export default function BirdGreenscreenPreview({ src }: { src: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!src) return;
    const target = canvasRef.current;
    if (!target) return;

    const drawer = startKeyedBirdDrawer({
      src,
      maxSize: 200,
      onFrame: (sheet) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        if (canvas.width !== sheet.width || canvas.height !== sheet.height) {
          canvas.width = sheet.width;
          canvas.height = sheet.height;
        }
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(sheet, 0, 0);
      },
    });

    return () => drawer.stop();
  }, [src]);

  return (
    <canvas
      ref={canvasRef}
      className="max-h-32 w-auto object-contain"
      aria-hidden
    />
  );
}
