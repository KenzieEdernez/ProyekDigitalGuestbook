"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";

/** Admin preview for Lottie bird (.json) with transparent background. */
export default function BirdGreenscreenPreview({
  src,
  frames = [],
}: {
  src?: string;
  frames?: string[];
}) {
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [index, setIndex] = useState(0);
  const frameList = (frames || []).map((f) => f.trim()).filter(Boolean);
  const isLottie =
    !!src &&
    (src.toLowerCase().includes(".json") ||
      src.toLowerCase().includes("bird-lottie"));

  useEffect(() => {
    if (!isLottie || !src) {
      setAnimationData(null);
      return;
    }

    let cancelled = false;
    fetch(src, { cache: "force-cache" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load Lottie.");
        return res.json();
      })
      .then((data: object) => {
        if (!cancelled) setAnimationData(data);
      })
      .catch(() => {
        if (!cancelled) setAnimationData(null);
      });

    return () => {
      cancelled = true;
    };
  }, [isLottie, src]);

  useEffect(() => {
    if (animationData || frameList.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % frameList.length);
    }, 70);
    return () => window.clearInterval(timer);
  }, [animationData, frameList.length]);

  if (animationData) {
    return (
      <Lottie
        animationData={animationData}
        loop
        autoplay
        style={{ width: 128, height: 128, background: "transparent" }}
      />
    );
  }

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

  return null;
}
