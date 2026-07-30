"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";

type InvitationBorderVideoProps = {
  src?: string | null;
};

/**
 * Fixed Lottie overlay for the uploaded border/gate animation.
 * Stretches to the full viewport so the frame matches every screen size.
 */
export default function InvitationBorderVideo({
  src,
}: InvitationBorderVideoProps) {
  const url = src?.trim() || "";
  const [animationData, setAnimationData] = useState<object | null>(null);

  useEffect(() => {
    if (!url) {
      setAnimationData(null);
      return;
    }

    let cancelled = false;
    fetch(url, { cache: "force-cache" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load border Lottie.");
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
  }, [url]);

  if (!url || !animationData) return null;

  return (
    <div
      className="invitation-border-video pointer-events-none fixed inset-0 z-[35] h-[100dvh] w-screen overflow-hidden"
      aria-hidden
    >
      <Lottie
        className="invitation-border-lottie"
        animationData={animationData}
        loop
        autoplay
        style={{
          width: "100%",
          height: "100%",
          background: "transparent",
        }}
        rendererSettings={{
          // Stretch to exact screen size so the border hugs every edge
          preserveAspectRatio: "none",
        }}
      />
    </div>
  );
}
