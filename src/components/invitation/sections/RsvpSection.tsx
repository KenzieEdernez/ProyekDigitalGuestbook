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
import Reveal from "@/components/invitation/Reveal";
import SectionHeader from "@/components/invitation/SectionHeader";
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
  const [stepDirection, setStepDirection] = useState<"forward" | "back">(
    "forward"
  );
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

  const goToStep = (next: Step, direction: "forward" | "back") => {
    setStepDirection(direction);
    setStep(next);
  };

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
      goToStep("done", "forward");
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "done" && guest) {
    return (
      <section id="rsvp" className="invitation-section bg-cream px-6 py-28">
        <div className="mx-auto max-w-2xl animate-scale-in">
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
  const stepAnimClass =
    stepDirection === "forward" ? "rsvp-step-enter" : "rsvp-step-back";

  return (
    <section
      id="rsvp"
      className="invitation-section relative overflow-hidden bg-cream px-6 py-28"
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.05]"
        style={{ backgroundImage: `url('${event.heroImage}')` }}
      />
      <div className="absolute inset-0 bg-radial-gold opacity-40" />

      <div className="relative mx-auto max-w-xl">
        <SectionHeader
          label="RSVP"
          title="Konfirmasi Kehadiran"
          subtitle="Mohon konfirmasi kehadiran Anda agar kami dapat mempersiapkan acara dengan baik."
        />

        {/* Animated step indicator */}
        <Reveal direction="up" delay={100}>
          <div className="mb-10 flex items-center justify-center">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition-all duration-500 ease-out-expo ${
                      i <= currentStepIndex
                        ? "bg-navy text-white shadow-card"
                        : "bg-stone-100 text-stone-400"
                    } ${i === currentStepIndex ? "scale-110 ring-4 ring-royal/20" : ""}`}
                  >
                    {i < currentStepIndex ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`mt-2 text-[10px] font-semibold uppercase tracking-wide transition-colors duration-300 ${
                      i <= currentStepIndex ? "text-navy" : "text-stone-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="relative mx-4 mb-5 h-0.5 w-16 overflow-hidden rounded-full bg-stone-200">
                    <div
                      className="absolute inset-y-0 left-0 bg-navy transition-all duration-700 ease-out-expo"
                      style={{
                        width: i < currentStepIndex ? "100%" : "0%",
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal direction="up" delay={200}>
          <div className="glass-card-light overflow-hidden">
            {error && (
              <div className="mx-7 mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {step === "attendance" && (
              <div key="attendance" className={`p-8 ${stepAnimClass}`}>
                <p className="mb-7 text-center text-sm text-stone-500">
                  Apakah Anda akan hadir di acara pernikahan kami?
                </p>
                <div className="grid gap-4">
                  {[
                    {
                      value: true,
                      icon: <Heart className="h-5 w-5" />,
                      title: "Ya, Saya Hadir",
                      desc: "Saya akan datang dan mendapatkan tiket masuk digital",
                    },
                    {
                      value: false,
                      icon: <span className="text-lg">🙏</span>,
                      title: "Maaf, Tidak Hadir",
                      desc: "Saya tidak dapat hadir, namun tetap memberikan doa",
                    },
                  ].map((opt) => (
                    <button
                      key={String(opt.value)}
                      onClick={() => setAttending(opt.value)}
                      className={`group flex items-center gap-4 rounded-2xl border-2 p-5 text-left transition-all duration-400 ease-out-expo active:scale-[0.98] ${
                        attending === opt.value
                          ? "border-navy bg-navy/[0.03] shadow-soft"
                          : "border-stone-100 hover:border-royal/30 hover:bg-royal/[0.02]"
                      }`}
                    >
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-full transition-all duration-400 ${
                          attending === opt.value
                            ? "bg-navy text-white scale-105"
                            : "bg-parchment text-stone-400 group-hover:bg-royal/10 group-hover:text-royal"
                        }`}
                      >
                        {opt.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-navy">{opt.title}</p>
                        <p className="mt-0.5 text-xs text-stone-500">
                          {opt.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  disabled={attending === null}
                  onClick={() => goToStep("details", "forward")}
                  className="btn-invite-primary mt-8 w-full disabled:opacity-40"
                >
                  Lanjutkan
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {step === "details" && (
              <div key="details" className={`p-8 ${stepAnimClass}`}>
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">
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
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-stone-400">
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
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-stone-400">
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
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-stone-400">
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
                    <div className="flex gap-3 rounded-xl border border-royal/15 bg-royal/5 p-4">
                      <QrCode className="mt-0.5 h-5 w-5 shrink-0 text-royal" />
                      <p className="text-xs leading-relaxed text-stone-600">
                        Setelah konfirmasi, Anda akan menerima tiket digital
                        berisi QR code dan barcode untuk masuk ke acara.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    onClick={() => goToStep("attendance", "back")}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-stone-200 px-4 py-3.5 text-xs font-bold uppercase tracking-wide text-stone-600 transition-all duration-300 hover:bg-stone-50 active:scale-95"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="btn-invite-primary flex-[2]"
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
        </Reveal>
      </div>
    </section>
  );
}
