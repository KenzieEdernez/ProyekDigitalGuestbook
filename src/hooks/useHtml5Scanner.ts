"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

function clearContainer(containerId: string) {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = "";
}

async function resolveCameraId(): Promise<string | { facingMode: string }> {
  try {
    const devices = await Html5Qrcode.getCameras();
    if (devices.length === 0) return { facingMode: "user" };

    const backCam = devices.find((d) =>
      /back|rear|environment|belakang/i.test(d.label)
    );
    if (backCam) return backCam.id;

    return devices[0].id;
  } catch {
    return { facingMode: "user" };
  }
}

type Options = {
  active?: boolean;
  autoStart?: boolean;
  formats: Html5QrcodeSupportedFormats[];
  prompt?: string;
  scanRegion?: "square" | "wide" | "full";
  onDetected: (code: string) => void;
};

export function useHtml5Scanner({
  active = true,
  autoStart = true,
  formats,
  prompt = "Arahkan kamera ke barcode/QR",
  scanRegion = "square",
  onDetected,
}: Options) {
  const reactId = useId();
  const containerId = useRef(`scanner-${reactId.replace(/:/g, "")}`).current;
  const readerRef = useRef<Html5Qrcode | null>(null);
  const detectedRef = useRef(false);
  const mountedRef = useRef(true);
  const onDetectedRef = useRef(onDetected);
  const formatsRef = useRef(formats);
  const promptRef = useRef(prompt);
  const scanRegionRef = useRef(scanRegion);
  const [message, setMessage] = useState<string | null>(null);
  const [needsManualStart, setNeedsManualStart] = useState(false);

  onDetectedRef.current = onDetected;
  formatsRef.current = formats;
  promptRef.current = prompt;
  scanRegionRef.current = scanRegion;

  const stopLocal = useCallback(async () => {
    const reader = readerRef.current;
    readerRef.current = null;
    if (!reader) {
      clearContainer(containerId);
      return;
    }
    try {
      await reader.stop();
      await reader.clear();
    } catch {
      // already stopped
    }
    clearContainer(containerId);
  }, [containerId]);

  const startScanner = useCallback(async () => {
    if (!mountedRef.current || !active || detectedRef.current) return;

    setNeedsManualStart(false);
    setMessage("Mencari kamera...");

    await stopLocal();
    if (!mountedRef.current || !active) return;

    const container = document.getElementById(containerId);
    if (!container) return;

    const html5QrCode = new Html5Qrcode(containerId);
    readerRef.current = html5QrCode;

    try {
      const cameraId = await resolveCameraId();
      if (!mountedRef.current || readerRef.current !== html5QrCode) return;

      const config = {
        fps: 12,
        formatsToSupport: formatsRef.current,
      } as any;

      if (scanRegionRef.current !== "full") {
        config.qrbox = (viewfinderWidth: number, viewfinderHeight: number) => {
          if (scanRegionRef.current === "wide") {
            return {
              width: Math.floor(viewfinderWidth * 0.9),
              height: Math.max(90, Math.floor(viewfinderHeight * 0.35)),
            };
          }

          const size = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.75);
          return { width: Math.max(size, 200), height: Math.max(size, 200) };
        };
      }

      await html5QrCode.start(
        cameraId,
        config,
        (decodedText) => {
          if (detectedRef.current || readerRef.current !== html5QrCode) return;
          detectedRef.current = true;
          setMessage(`Terbaca: ${decodedText}`);
          void (async () => {
            await stopLocal();
            onDetectedRef.current(decodedText);
          })();
        },
        () => {
          // per-frame decode miss
        }
      );

      if (!mountedRef.current || readerRef.current !== html5QrCode) {
        try {
          await html5QrCode.stop();
          await html5QrCode.clear();
        } catch {
          // ignore
        }
        return;
      }

      setMessage(promptRef.current);
    } catch (err) {
      console.error("Scanner start failed", err);
      if (readerRef.current === html5QrCode) {
        readerRef.current = null;
      }
      clearContainer(containerId);
      if (mountedRef.current) {
        setNeedsManualStart(true);
        setMessage("Gagal akses kamera. Izinkan kamera lalu klik Mulai.");
      }
    }
  }, [active, containerId, stopLocal]);

  useEffect(() => {
    mountedRef.current = true;
    detectedRef.current = false;

    let cancelled = false;

    const boot = () => {
      if (cancelled || !mountedRef.current) return;
      if (autoStart && active) {
        void startScanner();
      }
    };

    // tunggu DOM siap sebelum start kamera
    const timer = window.setTimeout(boot, 100);

    return () => {
      cancelled = true;
      mountedRef.current = false;
      window.clearTimeout(timer);
      void stopLocal();
    };
  }, [active, autoStart, startScanner, stopLocal]);

  return { containerId, message, needsManualStart, startScanner };
}
