"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

type Props = {
  onDetected: (code: string) => void;
  prompt?: string;
  autoStart?: boolean;
};

export default function QRScanner({ onDetected, prompt = "Arahkan kamera ke QR code", autoStart = true }: Props) {
  const readerRef = useRef<Html5Qrcode | null>(null);
  const containerId = "qr-scanner-container";
  const [message, setMessage] = useState<string | null>(null);
  const detectedRef = useRef(false);

  useEffect(() => {
    if (autoStart) startScanner();
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startScanner() {
    if (readerRef.current) return;
    setMessage("Mencari kamera...");
    const config = {
      fps: 10,
      qrbox: { width: 300, height: 300 },
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
    } as any;

    try {
      const html5QrCode = new Html5Qrcode(containerId);
      readerRef.current = html5QrCode;
      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          if (detectedRef.current) return;
          detectedRef.current = true;
          setMessage(`Terbaca: ${decodedText}`);
          try {
            onDetected(decodedText);
          } catch (e) {
            console.error(e);
          }
          // stop after detection to avoid duplicates
          stopScanner();
        },
        (error) => {
          // ignore per-frame errors
        }
      );
      setMessage(prompt);
    } catch (err) {
      console.error("QR scanner start failed", err);
      setMessage("Gagal akses kamera. Klik untuk mulai manual atau upload gambar.");
    }
  }

  async function stopScanner() {
    const html5QrCode = readerRef.current;
    if (!html5QrCode) return;
    try {
      await html5QrCode.stop();
      await html5QrCode.clear();
    } catch (e) {
      // ignore
    }
    readerRef.current = null;
  }

  return (
    <div className="relative">
      <div id={containerId} style={{ width: "100%", minHeight: 360 }} />
      <div className="mt-2 text-center text-sm text-stone-400">{message}</div>
    </div>
  );
}
