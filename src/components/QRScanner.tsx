"use client";

import React, { useMemo } from "react";
import { Html5QrcodeSupportedFormats } from "html5-qrcode";
import { useHtml5Scanner } from "@/hooks/useHtml5Scanner";

type Props = {
  onDetected: (code: string) => void;
  prompt?: string;
  autoStart?: boolean;
  active?: boolean;
};

const QR_FORMATS = [Html5QrcodeSupportedFormats.QR_CODE];

export default function QRScanner({
  onDetected,
  prompt = "Point the camera at the QR code",
  autoStart = true,
  active = true,
}: Props) {
  const formats = useMemo(() => QR_FORMATS, []);

  const { containerId, message, needsManualStart, startScanner } = useHtml5Scanner({
    active,
    autoStart,
    formats,
    prompt,
    onDetected,
  });

  return (
    <div className="relative">
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
