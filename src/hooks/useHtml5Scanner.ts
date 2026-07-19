"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

function clearContainer(containerId: string) {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = "";
}

function isAppleMobile() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return (
    /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

/**
 * Prefer the rear camera. On iOS, device labels are often empty, so
 * facingMode "environment" is more reliable than devices[0] (often front).
 */
async function resolveCameraConfig(): Promise<
  string | { facingMode: string | { ideal: string } }
> {
  const apple = isAppleMobile();

  try {
    const devices = await Html5Qrcode.getCameras();

    if (devices.length > 0) {
      const backCam = devices.find((d) =>
        /back|rear|environment|belakang|world/i.test(d.label || "")
      );
      if (backCam?.id) return backCam.id;

      // iOS: unlabeled devices — do NOT pick devices[0] (often selfie).
      if (apple) {
        return { facingMode: { ideal: "environment" } };
      }

      // Android / desktop: if only one cam or labels missing, try last device
      // (rear is frequently last) then fall back to environment.
      if (devices.length > 1) {
        return devices[devices.length - 1].id;
      }
      return devices[0].id;
    }
  } catch {
    // permission / enumerate failed
  }

  return { facingMode: { ideal: "environment" } };
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
  scanRegion = "full",
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
    setMessage("Starting camera...");

    await stopLocal();
    if (!mountedRef.current || !active) return;

    const container = document.getElementById(containerId);
    if (!container) return;

    const html5QrCode = new Html5Qrcode(containerId, {
      verbose: false,
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true,
      },
    } as ConstructorParameters<typeof Html5Qrcode>[1]);
    readerRef.current = html5QrCode;

    const buildConfig = (simple = false) => {
      const config = {
        fps: isAppleMobile() ? 15 : 12,
        formatsToSupport: formatsRef.current,
        disableFlip: false,
      } as Record<string, unknown>;

      if (!simple) {
        config.aspectRatio = 1.777778;
        config.videoConstraints = {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        };
      }

      // "full" = decode whole frame (best for iOS). Square qrbox often misses.
      if (scanRegionRef.current !== "full") {
        config.qrbox = (viewfinderWidth: number, viewfinderHeight: number) => {
          if (scanRegionRef.current === "wide") {
            const width = Math.floor(viewfinderWidth * 0.88);
            const height = Math.max(
              80,
              Math.min(Math.floor(viewfinderHeight * 0.32), 160)
            );
            return { width, height };
          }

          const side = Math.floor(
            Math.min(viewfinderWidth, viewfinderHeight) * 0.7
          );
          const size = Math.min(Math.max(side, 160), 280);
          return { width: size, height: size };
        };
      }

      return config;
    };

    const onScanSuccess = (decodedText: string) => {
      if (detectedRef.current || readerRef.current !== html5QrCode) return;
      detectedRef.current = true;
      setMessage(`Detected: ${decodedText}`);
      void (async () => {
        await stopLocal();
        onDetectedRef.current(decodedText);
      })();
    };

    const tryStart = async (
      cameraConfig: string | { facingMode: string | { ideal: string } },
      simple = false
    ) => {
      await html5QrCode.start(
        cameraConfig,
        buildConfig(simple) as unknown as Parameters<Html5Qrcode["start"]>[1],
        onScanSuccess,
        () => {
          // per-frame miss
        }
      );
    };

    try {
      const cameraConfig = await resolveCameraConfig();
      if (!mountedRef.current || readerRef.current !== html5QrCode) return;

      try {
        await tryStart(cameraConfig, false);
      } catch (firstError) {
        // Retry with plain environment facingMode + simpler constraints (iOS).
        console.warn("Scanner camera retry", firstError);
        if (!mountedRef.current || readerRef.current !== html5QrCode) return;
        try {
          await html5QrCode.stop().catch(() => undefined);
        } catch {
          // ignore
        }
        await tryStart({ facingMode: "environment" }, true);
      }

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
        setMessage(
          "Failed to access the camera. Allow camera access, then tap Start."
        );
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

    // iOS needs a slightly longer wait for the video element to be in DOM.
    const timer = window.setTimeout(boot, isAppleMobile() ? 250 : 100);

    return () => {
      cancelled = true;
      mountedRef.current = false;
      window.clearTimeout(timer);
      void stopLocal();
    };
  }, [active, autoStart, startScanner, stopLocal]);

  return { containerId, message, needsManualStart, startScanner };
}
