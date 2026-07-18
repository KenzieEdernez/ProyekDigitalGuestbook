"use client";

import { useEffect, useState } from "react";
import { processPortraitPhotoUrl } from "@/lib/trim-image-bars";

interface CouplePhotoProps {
  src: string;
  alt: string;
}

export default function CouplePhoto({ src, alt }: CouplePhotoProps) {
  const [displaySrc, setDisplaySrc] = useState(src);

  useEffect(() => {
    let cancelled = false;
    setDisplaySrc(src);

    processPortraitPhotoUrl(src)
      .then((result) => {
        if (!cancelled) setDisplaySrc(result);
      })
      .catch(() => {
        if (!cancelled) setDisplaySrc(src);
      });

    return () => {
      cancelled = true;
    };
  }, [src]);

  return (
    <div className="couple-photo-ring">
      <div className="couple-photo-oval">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={displaySrc} alt={alt} className="couple-photo-img" />
      </div>
    </div>
  );
}
