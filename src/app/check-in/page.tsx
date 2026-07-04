"use client";

import { useCallback, useRef, useState } from "react";
import { CheckCircle2, Wifi } from "lucide-react";
import AdminShell from "@/components/layout/AdminShell";
import ScanInput from "@/components/ScanInput";
import CameraCapture from "@/components/CameraCapture";
import BarcodeDisplay from "@/components/BarcodeDisplay";
import QRScanner from "@/components/QRScanner";
import { formatRegNumber } from "@/lib/event-config";
import type { EnvelopeSection, Guest, CheckInResult } from "@/types/guest";

export default function CheckInPage() {
  const [scanValue, setScanValue] = useState("");
  const [guest, setGuest] = useState<Guest | null>(null);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [envelopeSection, setEnvelopeSection] = useState<EnvelopeSection>("A");
  const [scannerKey, setScannerKey] = useState(0);
  const processingRef = useRef(false);
  const lastBarcodeRef = useRef<string | null>(null);

  const restartScanner = useCallback(() => {
    lastBarcodeRef.current = null;
    processingRef.current = false;
    setScannerKey((k) => k + 1);
  }, []);

  const reset = useCallback(() => {
    setScanValue("");
    setGuest(null);
    setResult(null);
    setError(null);
    setShowCamera(false);
    setEnvelopeSection("A");
    restartScanner();
  }, [restartScanner]);

  const handleScan = useCallback(
    async (barcode: string) => {
      const code = barcode.trim();
      if (!code || loading || result || showCamera) return;
      if (processingRef.current || lastBarcodeRef.current === code) return;

      processingRef.current = true;
      lastBarcodeRef.current = code;
      setLoading(true);
      setError(null);
      setScanValue(code);

      try {
        const res = await fetch(`/api/guests?barcode=${encodeURIComponent(code)}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Tamu tidak ditemukan.");
          setScanValue("");
          restartScanner();
          return;
        }

        if (data.guest.status !== "pending") {
          setError("Tamu sudah check-in sebelumnya.");
          setScanValue("");
          restartScanner();
          return;
        }

        setGuest(data.guest);
        setShowCamera(true);
      } catch {
        setError("Gagal terhubung ke server.");
        restartScanner();
      } finally {
        setLoading(false);
        processingRef.current = false;
      }
    },
    [loading, result, showCamera, restartScanner]
  );

  const handleCheckIn = useCallback(
    async (photo: string) => {
      if (!guest || loading) return;
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/check-in", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invitation_barcode: guest.invitation_barcode,
            photo,
            envelope_section: envelopeSection,
          }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Check-in gagal.");
          setShowCamera(true);
          return;
        }

        setResult(data);
        setShowCamera(false);
      } catch {
        setError("Gagal terhubung ke server.");
        setShowCamera(true);
      } finally {
        setLoading(false);
      }
    },
    [envelopeSection, guest, loading]
  );

  return (
    <AdminShell title="Daftar Check-in">
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {result ? (
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="card-premium p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-navy">Check-in Berhasil</h2>
            <p className="mt-2 text-stone-600">
              {result.guest.name} · {result.guest.pax} tamu · Boleh masuk
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="card-premium p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-red-500">Nomor Amplop</p>
              <p className="mt-3 font-serif text-5xl font-bold text-red-600">{result.angpao_number}</p>
              <p className="mt-2 text-xs text-stone-400">
                Tempel ke amplop bagian {result.angpao_number.charAt(0)}
              </p>
            </div>
            <div className="card-premium p-6">
              <p className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-royal">QR Souvenir</p>
              <BarcodeDisplay value={result.souvenir_barcode} />
              <p className="mt-2 text-center text-xs text-stone-400">QR code untuk kartu souvenir</p>
            </div>
          </div>

          <button onClick={reset} className="btn-navy w-full py-4">
            Check-in Tamu Berikutnya
          </button>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="card-premium p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-royal">
                  Langkah 1
                </p>
                <h2 className="font-serif text-lg font-bold text-navy">
                  {showCamera ? "Ambil Foto Tamu" : "Scan QR Undangan"}
                </h2>
              </div>
              {!showCamera && (
                <span className="badge bg-emerald-100 text-emerald-700">Kamera Aktif</span>
              )}
            </div>

            {showCamera && guest ? (
              <CameraCapture
                key={`photo-${guest.id}`}
                compact
                autoStart
                onCapture={handleCheckIn}
                onCancel={() => {
                  setShowCamera(false);
                  setGuest(null);
                  restartScanner();
                }}
              />
            ) : (
              <QRScanner
                key={scannerKey}
                active={!loading && !showCamera}
                autoStart
                onDetected={handleScan}
                prompt="Arahkan kamera ke QR code undangan"
              />
            )}

            <div className="mt-4 flex items-center justify-between rounded-lg bg-parchment px-4 py-3 text-xs">
              <span className="text-stone-500">Scanner Status: HID-Scanner-V3</span>
              <span className="flex items-center gap-1 font-semibold text-emerald-600">
                <Wifi className="h-3.5 w-3.5" /> Ready
              </span>
            </div>
          </div>

          <div className="card-premium p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-royal">
              Langkah 2
            </p>
            <h2 className="mt-1 font-serif text-2xl font-bold text-navy">Data Tamu & Amplop</h2>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Nama Tamu / QR Code
                </label>
                <ScanInput
                  value={scanValue}
                  onChange={setScanValue}
                  onScan={handleScan}
                  placeholder="Atau input manual..."
                  disabled={loading || showCamera}
                  variant="premium"
                />
              </div>

              {guest && (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-400">
                      No. Registrasi
                    </label>
                    <input
                      readOnly
                      value={formatRegNumber(guest.invitation_barcode)}
                      className="input-field bg-stone-50 font-mono"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-400">
                      Jumlah Tamu
                    </label>
                    <input readOnly value={`${guest.pax} Tamu`} className="input-field bg-stone-50" />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone-400">
                      Pilih Bagian Amplop
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["A", "B"] as EnvelopeSection[]).map((section) => (
                        <button
                          key={section}
                          type="button"
                          onClick={() => setEnvelopeSection(section)}
                          disabled={loading}
                          className={`rounded-lg border px-4 py-3 text-sm font-bold transition ${
                            envelopeSection === section
                              ? "border-royal bg-royal text-white shadow-md"
                              : "border-stone-200 bg-white text-navy hover:bg-stone-50"
                          }`}
                        >
                          Amplop Bagian {section}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-stone-400">
                      Nomor amplop akan dibuat berdasarkan pilihan A atau B.
                    </p>
                  </div>

                  <div className="rounded-lg bg-navy px-5 py-4 text-white">
                    <p className="text-xs text-white/60">Informasi Tamu</p>
                    <p className="mt-1 font-serif text-xl font-bold">{guest.name}</p>
                    <p className="mt-1 text-sm text-white/70">
                      {guest.phone} · {guest.pax} orang
                    </p>
                  </div>
                </>
              )}

              {loading && <p className="text-center text-sm text-stone-400">Memproses...</p>}

              {!guest && !loading && (
                <p className="text-center text-sm text-stone-400">
                  Kamera aktif — arahkan ke QR code undangan tamu
                </p>
              )}

              {showCamera && guest && (
                <p className="text-center text-sm text-stone-400">
                  Ambil foto tamu, lalu gunakan atau retake jika perlu
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
