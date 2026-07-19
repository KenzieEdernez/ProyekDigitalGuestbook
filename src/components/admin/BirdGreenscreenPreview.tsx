"use client";

import { useEffect, useState } from "react";

/** Admin preview for transparent PNG bird frames (no black/green plate). */
export default function BirdGreenscreenPreview({
  src,
  frames = [],
}: {
  src?: string;
  frames?: string[];
}) {
  const frameList = (frames || []).map((f) => f.trim()).filter(Boolean);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (frameList.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % frameList.length);
    }, 70);
    return () => window.clearInterval(timer);
  }, [frameList.length]);

  if (frameList.length > 0) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={frameList[index] || frameList[0]}
        alt=""
        className="max-h-32 w-auto object-contain"
        draggable={false}
      />
    );
  }

  if (!src) return null;

  // Legacy fallback if frames not generated yet
  return (
    <video
      src={src}
      className="max-h-32 w-auto object-contain"
      autoPlay
      muted
      loop
      playsInline
    />
  );
}
