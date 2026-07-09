"use client";

import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Download,
  Share2,
  Ticket,
} from "lucide-react";
import LinearBarcode from "@/components/invitation/LinearBarcode";
import { formatRegNumber, mergeEventSettings } from "@/lib/event-config";
import type { Guest } from "@/types/guest";

type ResolvedEvent = ReturnType<typeof mergeEventSettings>;

function sanitizeFilename(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function createPassImageBlob({
  qrElement,
  guest,
  event,
  invitationBarcode,
}: {
  qrElement: HTMLElement | null;
  guest: Guest;
  event: ResolvedEvent;
  invitationBarcode: string;
}) {
  const svg = qrElement?.querySelector("svg");
  if (!svg) throw new Error("QR code is not ready.");

  const svgText = new XMLSerializer().serializeToString(svg);
  const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;
  const qrImage = await loadImage(svgDataUrl);

  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 1280;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Browser does not support image export.");

  ctx.fillStyle = "#1a2332";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#c5a059";
  ctx.font = "700 20px Arial";
  ctx.textAlign = "center";
  ctx.fillText("E-TICKET UNDANGAN", 450, 60);

  ctx.fillStyle = "#ffffff";
  ctx.roundRect(50, 90, 800, 1100, 28);
  ctx.fill();

  ctx.fillStyle = "#c5a059";
  ctx.font = "700 18px Arial";
  ctx.fillText("KONFIRMASI KEHADIRAN", 450, 145);

  ctx.fillStyle = "#1a2332";
  ctx.font = "700 36px Georgia";
  ctx.fillText(event.name, 450, 195);

  ctx.fillStyle = "#78716c";
  ctx.font = "22px Arial";
  ctx.fillText(event.dateDisplay, 450, 235);

  ctx.fillStyle = "#ffffff";
  ctx.roundRect(250, 270, 400, 400, 20);
  ctx.fill();
  ctx.drawImage(qrImage, 275, 295, 350, 350);

  ctx.fillStyle = "#1a2332";
  ctx.font = "700 30px Arial";
  ctx.fillText(guest.name, 450, 720);

  ctx.fillStyle = "#78716c";
  ctx.font = "22px Arial";
  ctx.fillText(`${guest.pax} Tamu`, 450, 760);

  ctx.fillStyle = "#1a2332";
  ctx.font = "700 24px Courier New";
  ctx.fillText(formatRegNumber(invitationBarcode), 450, 820);

  ctx.fillStyle = "#c5a059";
  ctx.font = "700 16px Arial";
  ctx.fillText(invitationBarcode, 450, 870);

  ctx.fillStyle = "#78716c";
  ctx.font = "18px Arial";
  ctx.fillText("Tunjukkan QR atau barcode ini di pintu masuk", 450, 920);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to create pass image."));
    }, "image/png");
  });
}

interface InvitationPassProps {
  guest: Guest;
  event: ResolvedEvent;
}

export function InvitationPass({ guest, event }: InvitationPassProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const invitationBarcode = guest.invitation_barcode;

  if (!invitationBarcode) return null;

  const getFileName = () =>
    `tiket-${sanitizeFilename(guest.name) || "tamu"}-${invitationBarcode}.png`;

  const createImage = () =>
    createPassImageBlob({
      qrElement: qrRef.current,
      guest,
      event,
      invitationBarcode,
    });

  const downloadPass = async () => {
    try {
      const blob = await createImage();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = getFileName();
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("Gagal menyimpan tiket.");
    }
  };

  const sharePass = async () => {
    try {
      const blob = await createImage();
      const file = new File([blob], getFileName(), { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `Tiket Undangan - ${event.name}`,
          text: `Tiket masuk untuk ${guest.name}`,
          files: [file],
        });
        return;
      }

      await downloadPass();
      alert("Browser tidak mendukung berbagi. Tiket telah diunduh.");
    } catch {
      // user cancelled
    }
  };

  return (
    <div className="mx-auto max-w-lg overflow-hidden rounded-2xl bg-white shadow-card-lg">
      <div className="relative bg-gradient-to-br from-navy to-navy-700 px-8 py-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 ring-2 ring-emerald-400/50">
          <CheckCircle2 className="h-7 w-7 text-emerald-400" />
        </div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-royal">
          <Ticket className="h-3.5 w-3.5" />
          E-Ticket Undangan
        </div>
        <h2 className="font-serif text-2xl font-bold text-white">
          Kehadiran Dikonfirmasi
        </h2>
        <p className="mt-2 text-sm text-white/60">
          Simpan tiket digital ini untuk masuk ke acara
        </p>
      </div>

      <div className="px-8 py-8">
        <div ref={qrRef} className="flex justify-center">
          <div className="rounded-2xl bg-parchment p-5 ring-2 ring-royal/30">
            <QRCodeSVG value={invitationBarcode} size={200} level="M" includeMargin />
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-widest text-stone-400">
            Barcode Masuk
          </p>
          <LinearBarcode value={invitationBarcode} />
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3">
          {[
            { label: "Nama", value: guest.name },
            {
              label: "No. Tiket",
              value: formatRegNumber(invitationBarcode),
              small: true,
            },
            {
              label: "Jumlah Tamu",
              value: `${guest.pax} orang`,
            },
          ].map(({ label, value, small }) => (
            <div
              key={label}
              className="rounded-xl bg-parchment p-3 text-center"
            >
              <p className="text-[9px] font-semibold uppercase tracking-wider text-stone-400">
                {label}
              </p>
              <p
                className={`mt-2 font-bold text-navy ${
                  small ? "text-[10px] break-all" : "text-sm"
                }`}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3 rounded-xl border border-stone-100 bg-stone-50 p-5 text-sm text-stone-600">
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 shrink-0 text-royal" />
            <span>{event.dateDisplay}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 shrink-0 text-royal" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 shrink-0 text-royal" />
            <span>
              {event.location}, {event.address}
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={downloadPass} className="btn-navy py-3 text-xs">
            <Download className="h-4 w-4" />
            Simpan Tiket
          </button>
          <button
            onClick={sharePass}
            className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-navy px-4 py-3 text-xs font-semibold uppercase tracking-wide text-navy transition hover:bg-navy/5"
          >
            <Share2 className="h-4 w-4" />
            Bagikan
          </button>
        </div>
      </div>
    </div>
  );
}

export function DeclinedInvitation({ name }: { name: string }) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl bg-white p-12 text-center shadow-card-lg">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-parchment">
        <span className="text-3xl">🙏</span>
      </div>
      <h2 className="font-serif text-3xl font-bold text-navy">Terima Kasih</h2>
      <p className="mt-4 leading-relaxed text-stone-600">
        Terima kasih atas konfirmasinya, <strong>{name}</strong>. Doa dan
        dukungan Anda sangat berarti bagi kami.
      </p>
      <p className="mt-4 text-sm text-stone-400">
        Semoga kita dapat bertemu di kesempatan lain.
      </p>
    </div>
  );
}
