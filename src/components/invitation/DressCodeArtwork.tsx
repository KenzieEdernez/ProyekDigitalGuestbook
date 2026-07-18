"use client";

import { useEffect, useState } from "react";
import { processDressCodeImageUrl } from "@/lib/process-dress-code-image";

interface DressCodeArtworkProps {
  src: string;
}

export default function DressCodeArtwork({ src }: DressCodeArtworkProps) {
  const [processedSrc, setProcessedSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    setProcessedSrc(null);

    processDressCodeImageUrl(src)
      .then((result) => {
        if (!cancelled) setProcessedSrc(result);
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
          setProcessedSrc(src);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [src]);

  const displaySrc = processedSrc || src;

  return (
    <div className="dresscode-artwork">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={displaySrc}
        alt="Dress code reference"
        className={`dresscode-artwork-img ${
          processedSrc && !failed ? "dresscode-artwork-img-ready" : ""
        }`}
      />
    </div>
  );
}
