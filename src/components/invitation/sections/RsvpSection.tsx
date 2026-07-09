"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Heart,
  QrCode,
  User,
} from "lucide-react";
import {
  InvitationPass,
  DeclinedInvitation,
} from "@/components/invitation/InvitationPass";
import type { mergeEventSettings } from "@/lib/event-config";
import type { Guest } from "@/types/guest";

type EventSettings = ReturnType<typeof mergeEventSettings>;
type Step = "attendance" | "details" | "done";

interface RsvpSectionProps {
  event: EventSettings;
  defaultName?: string | null;
}

export default function RsvpSection({ event, defaultName }: RsvpSectionProps) {
  const [step, setStep] = useState<Step>("attendance");
  const [attending, setAttending] = useState<boolean | null>(null);
  const [form, setForm] = useState({
    name: defaultName ?? "",
    phone: "",
    email: "",
    pax: "1",
  });
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          pax: attending ? Number(form.pax) : 1,
          attending: Boolean(attending),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Konfirmasi gagal.");
        return;
      }

      setGuest(data.guest);
      setStep("done");
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "done" && guest) {
    return (
      <section id="rsvp" className="invitation-section bg-cream px-6 py-24">
        <div className="mx-auto max-w-2xl">
          {attending ? (
            <InvitationPass guest={guest} event={event} />
          ) : (
            <DeclinedInvitation name={guest.name} />
          )}
        </div>
      </section>
    );
  }

  const steps = [
    { id: "attendance", label: "Kehadiran" },
    { id: "details", label: "Data Diri" },
  ];

  const currentStepIndex = step === "attendance" ? 0 : 1;

  return (
    <section id="rsvp" className="invitation-section relative bg-cream px-6 py-24">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.07]"
        style={{ backgroundImage: `url('${event.heroImage}')` }}
      />

      <div className="relative mx-auto max-w-xl">
        <header className="mb-10 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-royal">
            RSVP
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-navy">
            Konfirmasi Kehadiran
          </h2>
          <p className="mt-3 text-sm text-stone-500">
            Mohon konfirmasi kehadiran Anda agar kami dapat mempersiapkan acara
            dengan baik.
          </p>
        </header>

        {/* Step indicator */}
        <div className="mb-8 flex items-center justify-center gap-4">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                  i <= currentStepIndex
                    ? "bg-navy text-white"
                    : "bg-stone-200 text-stone-400"
                }`}
              >
                {i < currentStepIndex ? (
                  <Check className="h-4 w-4" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-xs font-semibold ${
                  i <= currentStepIndex ? "text-navy" : "text-stone-400"
                }`}
              >
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <div
                  className={`mx-2 h-px w-8 ${
                    i < currentStepIndex ? "bg-navy" : "bg-stone-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="card-premium overflow-hidden">
          {error && (
            <div className="mx-8 mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {step === "attendance" && (
            <div className="p-8">
              <p className="mb-6 text-center text-sm text-stone-600">
                Apakah Anda akan hadir di acara pernikahan kami?
              </p>
              <div className="grid gap-4">
                <button
                  onClick={() => setAttending(true)}
                  className={`group flex items-center gap-4 rounded-xl border-2 p-5 text-left transition ${
                    attending === true
                      ? "border-navy bg-navy/5"
                      : "border-stone-200 hover:border-royal/40"
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full transition ${
                      attending === true
                        ? "bg-navy text-white"
                        : "bg-parchment text-stone-400 group-hover:bg-royal/10 group-hover:text-royal"
                    }`}
                  >
                    <Heart className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-navy">Ya, Saya Hadir</p>
                    <p className="text-xs text-stone-500">
                      Saya akan datang dan mendapatkan tiket masuk digital
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setAttending(false)}
                  className={`group flex items-center gap-4 rounded-xl border-2 p-5 text-left transition ${
                    attending === false
                      ? "border-navy bg-navy/5"
                      : "border-stone-200 hover:border-royal/40"
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full transition ${
                      attending === false
                        ? "bg-navy text-white"
                        : "bg-parchment text-stone-400"
                    }`}
                  >
                    <span className="text-lg">🙏</span>
                  </div>
                  <div>
                    <p className="font-semibold text-navy">Maaf, Tidak Hadir</p>
                    <p className="text-xs text-stone-500">
                      Saya tidak dapat hadir, namun tetap memberikan doa
                    </p>
                  </div>
                </button>
              </div>

              <button
                disabled={attending === null}
                onClick={() => setStep("details")}
                className="btn-navy mt-8 w-full"
              >
                Lanjutkan
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {step === "details" && (
            <div className="p-8">
              <div className="space-y-5">
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
                    <User className="h-3.5 w-3.5" />
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Masukkan nama lengkap"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Nomor WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    placeholder="08xxxxxxxxxx"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    placeholder="email@contoh.com"
                    className="input-field"
                  />
                </div>

                {attending && (
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                      Jumlah Tamu (maks. 4)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={4}
                      value={form.pax}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (!raw) {
                          setForm((f) => ({ ...f, pax: "" }));
                          return;
                        }
                        const next = Math.min(
                          4,
                          Math.max(1, parseInt(raw) || 0)
                        );
                        setForm((f) => ({ ...f, pax: String(next) }));
                      }}
                      className="input-field"
                    />
                  </div>
                )}

                {attending && (
                  <div className="flex gap-3 rounded-xl bg-parchment p-4">
                    <QrCode className="mt-0.5 h-5 w-5 shrink-0 text-royal" />
                    <p className="text-xs leading-relaxed text-stone-600">
                      Setelah konfirmasi, Anda akan menerima tiket digital berisi
                      QR code dan barcode untuk masuk ke acara.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setStep("attendance")}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-stone-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-stone-600 transition hover:bg-stone-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Kembali
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-navy flex-[2]"
                >
                  {loading
                    ? "Memproses..."
                    : attending
                      ? "Dapatkan Tiket Masuk"
                      : "Kirim Konfirmasi"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
