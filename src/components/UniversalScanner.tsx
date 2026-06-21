"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

type Props = {
  onDetected: (code: string) => void;
  prompt?: string;
  autoStart?: boolean;
  formats?: Html5QrcodeSupportedFormats[];
  containerId?: string;
};

export default function UniversalScanner({
  onDetected,
  prompt = "Arahkan kamera ke barcode/QR",
  autoStart = true,
  formats = [
    Html5QrcodeSupportedFormats.QR_CODE,
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.CODE_39,
  ],
  containerId = "universal-scanner-container",
}: Props) {
  const readerRef = useRef<Html5Qrcode | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const detectedRef = useRef(false);

  useEffect(() => {
    if (autoStart) startScanner();
    return () => stopScanner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startScanner() {
    if (readerRef.current) return;
    setMessage("Mencari kamera...");
    const config = {
      fps: 10,
      qrbox: { width: 300, height: 300 },
      formatsToSupport: formats,
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
          // per-frame errors ignored
        }
      );
      setMessage(prompt);
      console.log("UniversalScanner started");
    } catch (err) {
      console.error("UniversalScanner start failed", err);
      setMessage("Gagal akses kamera. Klik tombol Mulai untuk mencoba.");
      readerRef.current = null;
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
    detectedRef.current = false;
  }

  return (
    <div>
      <div id={containerId} style={{ width: "100%", minHeight: 360 }} />
      <div className="mt-2 text-center text-sm text-stone-400">{message}</div>
      <div style={{ textAlign: "center", marginTop: 8 }}>
        <button onClick={() => startScanner()} className="btn-gold text-sm" type="button">
          Mulai Kamera
        </button>
      </div>
    </div>
  );
}
