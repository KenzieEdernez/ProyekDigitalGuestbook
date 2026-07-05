"use client";

import React, { useMemo } from "react";
import { Html5QrcodeSupportedFormats } from "html5-qrcode";
import { useHtml5Scanner } from "@/hooks/useHtml5Scanner";

type Props = {
  onDetected: (code: string) => void;
  prompt?: string;
  autoStart?: boolean;
  active?: boolean;
  formats?: Html5QrcodeSupportedFormats[];
  scanRegion?: "square" | "wide" | "full";
};

const DEFAULT_FORMATS = [
  Html5QrcodeSupportedFormats.QR_CODE,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.CODE_39,
];

export default function UniversalScanner({
  onDetected,
  prompt = "Point the camera at the barcode/QR",
  autoStart = true,
  active = true,
  formats,
  scanRegion = "square",
}: Props) {
  const stableFormats = useMemo(() => formats ?? DEFAULT_FORMATS, [formats]);

  const { containerId, message, needsManualStart, startScanner } = useHtml5Scanner({
    active,
    autoStart,
    formats: stableFormats,
    prompt,
    scanRegion,
    onDetected,
  });

  return (
    <div>
      <div id={containerId} className="scanner-viewport" />
      <div className="mt-2 text-center text-sm text-stone-400">{message}</div>
      {needsManualStart && active && (
        <div className="mt-2 text-center">
          <button type="button" onClick={() => void startScanner()} className="btn-gold text-sm">
            Start Camera
          </button>
        </div>
      )}
    </div>
  );
}
