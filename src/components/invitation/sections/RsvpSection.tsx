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
import { saveRsvpSession } from "@/lib/rsvp-session";
import type { Guest } from "@/types/guest";
import type { WeddingSettings } from "@/types/wedding";

type EventSettings = ReturnType<typeof mergeEventSettings>;
type Step = "attendance" | "details" | "done";

interface RsvpSectionProps {
  event: EventSettings;
  wedding: WeddingSettings;
  defaultName?: string | null;
  onNavigateWishes?: () => void;
}

const FLOW_STEPS = [
  { id: "attendance", label: "Attendance" },
  { id: "details", label: "Your Details" },
  { id: "ticket", label: "Ticket" },
  { id: "wishes", label: "Wishes" },
];

export default function RsvpSection({
  event,
  wedding,
  defaultName,
  onNavigateWishes,
}: RsvpSectionProps) {
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
        setError(data.error || "Confirmation failed.");
        return;
      }

      setGuest(data.guest);
      saveRsvpSession({
        guestName: data.guest.name,
        attendance: attending ? "attending" : "not_attending",
      });
      goToStep("done", "forward");
    } catch {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const currentFlowIndex =
    step === "attendance" ? 0 : step === "details" ? 1 : 2;

  const stepAnimClass =
    stepDirection === "forward" ? "rsvp-step-enter" : "rsvp-step-back";

  /* ── Done: ticket + wishes ── */
  if (step === "done" && guest) {
    return (
      <section
        id="rsvp"
        className="invitation-section relative overflow-hidden bg-cream px-6 py-20 lg:py-28"
      >
        <div className="absolute inset-0 bg-radial-gold opacity-30" />
        <div className="relative mx-auto max-w-6xl">
          <SectionHeader
            label="Complete"
            title="Thank You"
            subtitle="Your confirmation has been received. Scroll down to leave your wish letter."
          />

          {/* Step progress — all complete */}
          <div className="mb-12 flex items-center justify-center gap-2 lg:gap-4">
            {FLOW_STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-white lg:h-10 lg:w-10">
                    <Check className="h-4 w-4" />
                  </div>
                  <span className="mt-1.5 hidden text-[9px] font-semibold uppercase tracking-wide text-navy sm:block">
                    {s.label}
                  </span>
                </div>
                {i < FLOW_STEPS.length - 1 && (
                  <div className="mb-4 h-px w-6 bg-navy lg:w-12" />
                )}
              </div>
            ))}
          </div>

          <div className="mx-auto max-w-lg">
            <Reveal direction="up" className="animate-scale-in">
              {attending ? (
                <InvitationPass guest={guest} wedding={wedding} />
              ) : (
                <DeclinedInvitation name={guest.name} />
              )}
            </Reveal>

            <Reveal direction="up" delay={200} className="mt-8 text-center">
              <button
                type="button"
                onClick={onNavigateWishes}
                className="btn-invite-primary w-full max-w-md"
              >
                Write Your Wish Letter
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="mt-3 text-xs text-stone-500">
                Your letter will appear in the guestbook for everyone to read.
              </p>
            </Reveal>
          </div>
        </div>
      </section>
    );
  }

  /* ── RSVP wizard ── */
  return (
    <section
      id="rsvp"
      className="invitation-section relative overflow-hidden bg-cream px-6 py-20 lg:py-28"
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.04]"
        style={{ backgroundImage: `url('${event.heroImage}')` }}
      />
      <div className="absolute inset-0 bg-radial-gold opacity-30" />

      <div className="relative mx-auto max-w-6xl">
        <div className="lg:grid lg:grid-cols-5 lg:gap-14 lg:items-start">
          {/* Desktop sidebar */}
          <div className="mb-10 lg:col-span-2 lg:mb-0 lg:sticky lg:top-28">
            <SectionHeader
              label="RSVP"
              title="Confirm Attendance"
              subtitle="Please confirm your attendance so we can prepare the event accordingly."
              align="left"
            />

            <div className="mt-8 hidden space-y-4 lg:block">
              {FLOW_STEPS.slice(0, 3).map((s, i) => (
                <div
                  key={s.id}
                  className={`flex items-center gap-4 rounded-xl border px-5 py-4 transition-all duration-500 ${
                    i <= currentFlowIndex
                      ? "border-royal/25 bg-white/80 shadow-soft"
                      : "border-stone-100 bg-white/40 opacity-50"
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      i < currentFlowIndex
                        ? "bg-navy text-white"
                        : i === currentFlowIndex
                          ? "bg-royal text-white ring-4 ring-royal/20"
                          : "bg-stone-100 text-stone-400"
                    }`}
                  >
                    {i < currentFlowIndex ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy">{s.label}</p>
                    <p className="text-xs text-stone-400">
                      {i === 0 && "Choose attending or not"}
                      {i === 1 && "Fill in your contact details"}
                      {i === 2 && "Get your ticket & send wishes"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form area */}
          <div className="lg:col-span-3">
            {/* Mobile step indicator */}
            <Reveal direction="up" delay={100}>
              <div className="mb-8 flex items-center justify-center lg:hidden">
                {[
                  { id: "attendance", label: "Attendance" },
                  { id: "details", label: "Your Details" },
                ].map((s, i) => (
                  <div key={s.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition-all duration-500 ${
                          i <= currentFlowIndex
                            ? "bg-navy text-white shadow-card"
                            : "bg-stone-100 text-stone-400"
                        } ${i === currentFlowIndex ? "scale-110 ring-4 ring-royal/20" : ""}`}
                      >
                        {i < currentFlowIndex ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          i + 1
                        )}
                      </div>
                      <span
                        className={`mt-2 text-[10px] font-semibold uppercase tracking-wide ${
                          i <= currentFlowIndex ? "text-navy" : "text-stone-400"
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                    {i < 1 && (
                      <div className="relative mx-4 mb-5 h-0.5 w-16 overflow-hidden rounded-full bg-stone-200">
                        <div
                          className="absolute inset-y-0 left-0 bg-navy transition-all duration-700"
                          style={{
                            width: i < currentFlowIndex ? "100%" : "0%",
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
                  <div key="attendance" className={`p-7 lg:p-9 ${stepAnimClass}`}>
                    <p className="mb-7 text-center text-sm text-stone-500 lg:text-left">
                      Will you be attending our wedding?
                    </p>
                    <div className="grid gap-4 lg:grid-cols-2">
                      {[
                        {
                          value: true,
                          icon: <Heart className="h-5 w-5" />,
                          title: "Yes, I'll Attend",
                          desc: "Join us & receive a digital entry ticket",
                        },
                        {
                          value: false,
                          icon: <span className="text-lg">🙏</span>,
                          title: "Sorry, Can't Attend",
                          desc: "Unable to attend, but sending blessings",
                        },
                      ].map((opt) => (
                        <button
                          key={String(opt.value)}
                          onClick={() => setAttending(opt.value)}
                          className={`group flex flex-col items-center gap-4 rounded-2xl border-2 p-6 text-center transition-all duration-400 ease-out-expo active:scale-[0.98] lg:p-8 ${
                            attending === opt.value
                              ? "border-navy bg-navy/[0.03] shadow-soft"
                              : "border-stone-100 hover:border-royal/30"
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
                            <p className="font-semibold text-navy">
                              {opt.title}
                            </p>
                            <p className="mt-1 text-xs text-stone-500">
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
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {step === "details" && (
                  <div key="details" className={`p-7 lg:p-9 ${stepAnimClass}`}>
                    <div className="grid gap-5 lg:grid-cols-2">
                      <div className="lg:col-span-2">
                        <label className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                          <User className="h-3.5 w-3.5" />
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, name: e.target.value }))
                          }
                          placeholder="Enter your full name"
                          className="input-field"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-stone-400">
                          WhatsApp
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
                            Number of Guests (max. 4)
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
                    </div>

                    {attending && (
                      <div className="mt-5 flex gap-3 rounded-xl border border-royal/15 bg-royal/5 p-4">
                        <QrCode className="mt-0.5 h-5 w-5 shrink-0 text-royal" />
                        <p className="text-xs leading-relaxed text-stone-600">
                          You will receive a digital ticket (QR + barcode),
                          then you can leave a wish right away.
                        </p>
                      </div>
                    )}

                    <div className="mt-8 flex gap-3">
                      <button
                        onClick={() => goToStep("attendance", "back")}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-stone-200 px-4 py-3.5 text-xs font-bold uppercase tracking-wide text-stone-600 transition-all hover:bg-stone-50 active:scale-95"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="btn-invite-primary flex-[2]"
                      >
                        {loading
                          ? "Processing..."
                          : attending
                            ? "Get Entry Ticket"
                            : "Submit Confirmation"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
