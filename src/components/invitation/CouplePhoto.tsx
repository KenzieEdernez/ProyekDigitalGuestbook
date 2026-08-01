"use client";

import { useEffect, useState } from "react";
import { processPortraitPhotoUrl } from "@/lib/trim-image-bars";

interface CouplePhotoProps {
  src: string;
  alt: string;
}

export default function CouplePhoto({ src, alt }: CouplePhotoProps) {
  const [displaySrc, setDisplaySrc] = useState(src);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setDisplaySrc(src);
    setAspectRatio(null);

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
      <div
        className="couple-photo-oval"
        style={
          aspectRatio
            ? { aspectRatio: String(aspectRatio) }
            : undefined
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displaySrc}
          alt={alt}
          className="couple-photo-img"
          onLoad={(event) => {
            const { naturalWidth, naturalHeight } = event.currentTarget;
            if (naturalWidth > 0 && naturalHeight > 0) {
              setAspectRatio(naturalWidth / naturalHeight);
            }
          }}
        />
      </div>
    </div>
  );
}
