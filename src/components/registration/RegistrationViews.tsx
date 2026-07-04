"use client";

import { QRCodeSVG } from "qrcode.react";
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Download,
  Share2,
  Info,
} from "lucide-react";
import { formatRegNumber, mergeEventSettings } from "@/lib/event-config";
import type { Guest } from "@/types/guest";

type ResolvedEvent = ReturnType<typeof mergeEventSettings>;

interface QrCodeDisplayProps {
  value: string;
  size?: number;
  showLabel?: boolean;
  glow?: boolean;
}

export default function QrCodeDisplay({
  value,
  size = 220,
  showLabel = true,
  glow = false,
}: QrCodeDisplayProps) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`rounded-xl bg-white p-5 ${glow ? "shadow-gold ring-2 ring-royal/40" : "shadow-card"}`}
      >
        <QRCodeSVG value={value} size={size} level="M" includeMargin />
        {showLabel && (
          <p className="mt-2 text-center text-[10px] font-semibold uppercase tracking-widest text-stone-400">
            Check-in
          </p>
        )}
      </div>
      <p className="mt-3 font-mono text-sm font-semibold text-navy">{value}</p>
    </div>
  );
}

export function RegistrationConfirmation({
  guest,
  event = mergeEventSettings(),
}: {
  guest: Guest;
  event?: ResolvedEvent;
}) {
  const handleSave = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${event.name} - Konfirmasi Kehadiran`,
          text: `Registrasi ${guest.name} - ${formatRegNumber(guest.invitation_barcode)}`,
        });
      } catch {
        // user cancelled
      }
    }
  };

  if (!guest.invitation_barcode) return null;

  return (
    <div className="mx-auto max-w-lg overflow-hidden rounded-2xl bg-white shadow-card-lg">
      <div className="bg-navy px-8 py-10 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-royal">
          <CheckCircle2 className="h-6 w-6 text-white" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-white">
          Registrasi Dikonfirmasi
        </h2>
        <p className="mt-2 text-sm text-white/70">
          Anda resmi terdaftar di daftar tamu {event.name}
        </p>
      </div>

      <div className="px-8 py-8">
        <div className="flex justify-center">
          <QrCodeDisplay value={guest.invitation_barcode} glow />
        </div>
        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-stone-500">
          <Info className="h-3.5 w-3.5 shrink-0" />
          Tunjukkan QR code ini di pintu masuk untuk check-in
        </p>

        <div className="mt-8 grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-parchment p-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
              Nama Tamu
            </p>
            <p className="mt-1 text-sm font-bold text-navy">{guest.name}</p>
          </div>
          <div className="rounded-lg bg-parchment p-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
              No. Reg
            </p>
            <p className="mt-1 text-sm font-bold text-navy">
              {formatRegNumber(guest.invitation_barcode)}
            </p>
          </div>
          <div className="rounded-lg bg-parchment p-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
              Jumlah
            </p>
            <p className="mt-1 text-sm font-bold text-navy">
              {guest.pax} Tamu
            </p>
          </div>
        </div>

        <div className="relative mt-6 overflow-hidden rounded-xl border border-stone-100 bg-parchment/50 p-5">
          <h3 className="font-serif text-lg font-bold text-navy">
            Detail Acara
          </h3>
          <div className="mt-4 space-y-3 text-sm text-stone-600">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-royal" />
              <span>{event.dateDisplay}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-royal" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-royal" />
              <span>
                {event.location}, {event.address}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={handleSave} className="btn-navy py-3 text-xs">
            <Download className="h-4 w-4" />
            Simpan
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-navy px-4 py-3 text-xs font-semibold uppercase tracking-wide text-navy transition hover:bg-navy/5"
          >
            <Share2 className="h-4 w-4" />
            Bagikan
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-stone-100 bg-stone-50 px-8 py-4 text-xs text-stone-500">
        <span className="font-semibold uppercase">{event.organizer}</span>
        <span className="italic text-royal">EdernDigital</span>
      </div>
    </div>
  );
}

export function DeclinedMessage({ name }: { name: string }) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl bg-white p-12 text-center shadow-card-lg">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-parchment">
        <span className="text-3xl">🙏</span>
      </div>
      <h2 className="font-serif text-3xl font-bold text-navy">Terima Kasih</h2>
      <p className="mt-4 leading-relaxed text-stone-600">
        Terima kasih atas konfirmasinya, <strong>{name}</strong>. Kami
        menghargai waktu Anda dan mohon maaf apabila ada hal yang kurang
        berkenan.
      </p>
      <p className="mt-4 text-sm text-stone-400">
        Semoga kita bisa bertemu di kesempatan lain.
      </p>
    </div>
  );
}

export function EventInfoCards({ event }: { event: ResolvedEvent }) {
  const cards = [
    {
      icon: Calendar,
      label: "Tanggal & Waktu",
      line1: event.dateDisplay,
      line2: event.time,
    },
    {
      icon: MapPin,
      label: "Lokasi",
      line1: event.location,
      line2: event.address,
    },
    {
      icon: Clock,
      label: "Dress Code",
      line1: event.dressCode,
      line2: event.dressNote,
    },
  ];

  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-3">
      {cards.map(({ icon: Icon, label, line1, line2 }) => (
        <div
          key={label}
          className="rounded-xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm"
        >
          <Icon className="mb-3 h-5 w-5 text-royal" />
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60">
            {label}
          </p>
          <p className="mt-2 text-sm font-semibold text-white">{line1}</p>
          <p className="text-xs text-white/70">{line2}</p>
        </div>
      ))}
    </div>
  );
}
