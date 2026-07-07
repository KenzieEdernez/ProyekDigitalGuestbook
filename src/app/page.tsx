"use client";

import { useState } from "react";
import Link from "next/link";
import { QrCode, Info } from "lucide-react";
import { EVENT } from "@/lib/event-config";
import {
  RegistrationConfirmation,
  DeclinedMessage,
} from "@/components/registration/RegistrationViews";
import { useEventSettings } from "@/hooks/useEventSettings";
import type { Guest } from "@/types/guest";

type Step = "form" | "success" | "declined";

const REGISTRATION_ERROR =
  "Please complete the Guest Registration Form by providing the required guest information and a contact mobile number.";

const QR_INFO_MESSAGE =
  "After submitting the Guest Registration Form, a unique digital QR code will be issued for you or your group. Kindly present your QR code at reception desk upon your arrival for your smooth check-in.";

function isRegistrationComplete(
  form: { name: string; phone: string; email: string; pax: string },
  attending: boolean
) {
  const nameOk = form.name.trim().length > 0;
  const phoneOk = form.phone.trim().length > 0;
  const emailOk = form.email.trim().length > 0;
  const paxNum = Number(form.pax);
  const paxOk = attending ? paxNum >= 1 && paxNum <= 4 : true;
  return nameOk && phoneOk && emailOk && paxOk;
}

export default function RegistrationPage() {
  const eventSettings = useEventSettings();
  const [step, setStep] = useState<Step>("form");
  const [attending, setAttending] = useState(true);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    pax: "",
  });
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!eventSettings.settingsReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream px-6">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-royal">
            EdernDigital
          </p>
          <p className="mt-3 text-sm text-stone-500">Loading event settings...</p>
        </div>
      </main>
    );
  }

  if (!eventSettings.settingsAvailable) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream px-6">
        <div className="max-w-md text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-royal">
            EdernDigital
          </p>
          <h1 className="mt-3 font-serif text-2xl font-bold text-navy">
            Event settings are not available
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-stone-500">
            Please fill in and save the event settings from the admin page first.
          </p>
        </div>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isRegistrationComplete(form, attending)) {
      setError(REGISTRATION_ERROR);
      return;
    }

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
          attending,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed.");
        return;
      }

      setGuest(data.guest);
      setStep(attending ? "success" : "declined");
    } catch {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "success" && guest) {
    return (
      <main className="min-h-screen bg-cream py-12">
        <div className="px-6">
          <RegistrationConfirmation guest={guest} event={eventSettings} />
          <p className="mt-8 text-center text-sm text-stone-500">
            Need to update your registration? Contact:{" "}
            <a
              href={`mailto:${EVENT.supportEmail}`}
              className="font-semibold text-navy underline"
            >
              {EVENT.supportEmail}
            </a>
          </p>
        </div>
      </main>
    );
  }

  if (step === "declined") {
    return (
      <main className="min-h-screen bg-cream py-12">
        <div className="px-6">
          <DeclinedMessage name={guest?.name || form.name} />
        </div>
      </main>
    );
  }

  const formComplete = isRegistrationComplete(form, attending);

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section
        className="relative bg-cover bg-center px-6 pb-16 pt-20"
        style={{ backgroundImage: `url('${eventSettings.heroImage}')` }}
      >
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="font-serif text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            {eventSettings.name}
          </h1>
        </div>
      </section>

      {/* Form card */}
      <section className="relative -mt-10 px-6 pb-8">
        <div className="mx-auto max-w-2xl">
          <div className="card-premium overflow-hidden">
            <div className="border-b border-royal/10 px-8 py-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-royal">
                Official Confirmation
              </p>
              <h2 className="mt-1 font-serif text-2xl font-bold text-navy">
                Guest Registration Form
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 px-8 py-6">
              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Full Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    setError(null);
                    setForm((f) => ({ ...f, name: e.target.value }));
                  }}
                  placeholder="Enter your full name"
                  className="input-field"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => {
                    setError(null);
                    setForm((f) => ({ ...f, phone: e.target.value }));
                  }}
                  placeholder="08xxxxxxxxxx"
                  className="input-field"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => {
                    setError(null);
                    setForm((f) => ({ ...f, email: e.target.value }));
                  }}
                  placeholder="you@example.com"
                  className="input-field"
                />
              </div>

              {attending && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Number of Guests
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={4}
                    value={form.pax}
                    onChange={(e) => {
                      setError(null);
                      const raw = e.target.value;
                      if (!raw) {
                        setForm((f) => ({ ...f, pax: "" }));
                        return;
                      }
                      const next = Math.min(4, Math.max(1, parseInt(raw) || 0));
                      setForm((f) => ({ ...f, pax: String(next) }));
                    }}
                    placeholder="Enter number of guests (max 4)"
                    className="input-field"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Attendance Confirmation
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setAttending(true);
                    }}
                    className={`rounded-lg py-3.5 text-xs font-bold uppercase tracking-wide transition ${
                      attending
                        ? "bg-navy text-white shadow-md"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    Attending
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setAttending(false);
                    }}
                    className={`rounded-lg py-3.5 text-xs font-bold uppercase tracking-wide transition ${
                      !attending
                        ? "bg-navy text-white shadow-md"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    Not Attending
                  </button>
                </div>
              </div>

              {attending && formComplete && (
                <div className="flex gap-3 rounded-lg bg-parchment p-4">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-royal" />
                  <p className="text-xs leading-relaxed text-stone-600">
                    {QR_INFO_MESSAGE}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-navy w-full py-4"
              >
                <QrCode className="h-5 w-5" />
                {loading
                  ? "Processing..."
                  : attending
                    ? "Create My QR Code"
                    : "Submit Confirmation"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Event info */}
      <section className="bg-cream px-6 pb-16">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: "📅", label: "Date & Time", line1: eventSettings.dateDisplay, line2: eventSettings.time },
              {
                icon: "👔",
                label: "Dress Code",
                line1: eventSettings.dressLadies,
                line2: eventSettings.dressGentlemen,
                dressCode: true,
              },
              { icon: "📍", label: "Location", line1: eventSettings.location, line2: eventSettings.address },
            ].map(({ icon, label, line1, line2, dressCode }) => (
              <div key={label} className="card-premium p-6 text-center">
                <span className="text-2xl">{icon}</span>
                <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-royal">
                  {label}
                </p>
                {dressCode ? (
                  <div className="mt-2 space-y-1 text-center text-sm text-navy">
                    <p>
                      <strong>Ladies:</strong> {line1}
                    </p>
                    <p>
                      <strong>Gentlemen:</strong> {line2}
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="mt-2 font-semibold text-navy">{line1}</p>
                    <p className="text-sm text-stone-500">{line2}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white px-6 py-10 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-navy">
          {eventSettings.organizer}
        </p>
        <p className="mt-1 text-xs text-stone-500">{eventSettings.organizerTagline}</p>
        <Link
          href="/admin"
          className="mt-6 inline-block text-[10px] uppercase tracking-widest text-stone-300 hover:text-royal"
        >
          Staff Login
        </Link>
      </footer>
    </main>
  );
}
