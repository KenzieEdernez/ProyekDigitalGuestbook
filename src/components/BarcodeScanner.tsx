"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

type Props = {
  onSuccess?: (code: string) => void;
  apiEndpoint?: string; // default /api/checkin
  start?: boolean; // if true, automatically start scanning
  onClose?: () => void; // called when scanner stops / modal should close
};

export default function BarcodeScanner({
  onSuccess,
  apiEndpoint = "/api/checkin",
  start = false,
  onClose,
}: Props) {
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const readerRef = useRef<Html5Qrcode | null>(null);
  const containerId = "html5qr-reader";

  // guard untuk mencegah double-submit untuk barcode yang sama
  const submittingRef = useRef<Set<string>>(new Set());
  // guard deteksi agar callback tidak terpanggil berulang (mis. StrictMode / multiple events)
  const detectedRef = useRef(false);
  // prevent multiple startScanner calls from effect
  const startingRef = useRef(false);

  useEffect(() => {
    return () => {
      // cleanup on unmount
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // watch the `start` prop and start/stop accordingly
  useEffect(() => {
    if (start && !startingRef.current) {
      startingRef.current = true;
      startScanner();
    } else if (!start) {
      startingRef.current = false;
      if (scanning) stopScanner();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start]);

  async function startScanner() {
    if (scanning) return;
    setMessage("Mencari kamera...");
    detectedRef.current = false; // reset only when explicitly starting

    // responsive qrbox based on container size (min 300)
    const container = document.getElementById(containerId);
    const containerWidth = container?.clientWidth || window.innerWidth;
    const containerHeight = container?.clientHeight || window.innerHeight;
    const boxSize = Math.max(300, Math.floor(Math.min(containerWidth, containerHeight) * 0.7));

    const config = {
      fps: 10,
      qrbox: { width: boxSize, height: boxSize },
      formatsToSupport: [
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.CODE_39,
      ],
    } as any;

    try {
      const html5QrCode = new Html5Qrcode(containerId);
      readerRef.current = html5QrCode;
      setScanning(true);
      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          // success callback: guard ganda
          if (detectedRef.current) return;
          detectedRef.current = true;
          // proses hasil namun pastikan tidak double-submit
          handleDetected(decodedText);
          // stop scanner setelah deteksi agar tidak ada callback lagi
          stopScanner();
        },
        () => {
          // per-frame decode failure ignored
        }
      );
      setMessage("Arahkan kamera ke barcode / QR");
      console.log("BarcodeScanner started", { boxSize });
    } catch (err: any) {
      console.error("Tidak bisa mulai kamera:", err);
      setMessage("Gagal mengakses kamera. Pastikan izin diberikan atau coba upload gambar.");
      setScanning(false);
      startingRef.current = false;
      onClose?.();
    }
  }

  async function stopScanner() {
    const html5QrCode = readerRef.current;
    if (!html5QrCode) return;
    try {
      await html5QrCode.stop();
      await html5QrCode.clear();
    } catch (err) {
      // ignore
    }
    readerRef.current = null;
    setScanning(false);
    onClose?.();
    // jangan reset detectedRef di sini — reset saat startScanner dipanggil
  }

  async function handleDetected(code: string) {
    // block duplicate processing untuk kode yang sama saat sedang diproses
    if (submittingRef.current.has(code)) {
      setMessage("Sedang memproses kode ini...");
      return;
    }
    submittingRef.current.add(code);
    setMessage(`Terbaca: ${code}. Mengirim ke server...`);
    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barcode: code }),
      });
      if (!res.ok) {
        const text = await res.text();
        setMessage(`Server error: ${res.status} ${text}`);
        return;
      }
      const data = await res.json();
      setMessage(`Check-in berhasil: ${data.message ?? "OK"}`);
      if (onSuccess) onSuccess(code);
      // close scanner after a short delay to show the user the message
      setTimeout(() => {
        onClose?.();
      }, 800);
    } catch (err: any) {
      console.error(err);
      setMessage("Gagal mengirim ke server.");
    } finally {
      submittingRef.current.delete(code);
    }
  }

  // fallback: upload image
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMessage("Mengirim gambar ke server untuk di-scan...");
    const f = new FormData();
    f.append("image", file);
    try {
      const res = await fetch(`${apiEndpoint}/upload-scan`, {
        method: "POST",
        body: f,
      });
      if (!res.ok) {
        setMessage(`Server error: ${res.status}`);
        return;
      }
      const data = await res.json();
      if (data.barcode) {
        setMessage(`Terbaca: ${data.barcode}`);
        handleDetected(data.barcode);
      } else {
        setMessage("Gagal membaca barcode dari gambar.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Gagal mengirim gambar ke server.");
    }
  }

  return (
    <div>
      <div id={containerId} style={{ width: "100%", maxWidth: 900, margin: "0 auto", minHeight: 540 }}>
        {/* html5-qrcode mounts video/canvas into this div */}
      </div>

      <div style={{ marginTop: 12 }}>
        {!scanning ? (
          <button onClick={startScanner}>Buka Kamera untuk Scan</button>
        ) : (
          <button onClick={stopScanner}>Stop Kamera</button>
        )}
        <label style={{ marginLeft: 8 }}>
          atau upload gambar:
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </label>
      </div>

      {message && <p>{message}</p>}
    </div>
  );
}
