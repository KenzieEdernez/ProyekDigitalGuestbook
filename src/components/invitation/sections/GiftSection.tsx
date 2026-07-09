"use client";

import { useState } from "react";
import { Check, Copy, Gift, MapPin, Phone } from "lucide-react";
import { WEDDING } from "@/lib/wedding-config";

export default function GiftSection() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // fallback ignored
    }
  };

  return (
    <section id="gift" className="invitation-section bg-white px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <header className="mb-14 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-royal">
            Tanda Kasih
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-navy md:text-4xl">
            Wedding Gift
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-stone-500">
            Kehadiran dan doa restu Anda adalah hadiah terindah. Namun jika
            ingin memberikan tanda kasih, berikut informasinya.
          </p>
        </header>

        <div className="mb-8 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-parchment">
            <Gift className="h-8 w-8 text-royal" />
          </div>
        </div>

        <div className="space-y-4">
          {WEDDING.gifts.map((account) => {
            const key = `${account.bank}-${account.accountNumber}`;
            return (
              <div
                key={key}
                className="card-premium flex items-center justify-between gap-4 p-6"
              >
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-royal">
                    {account.bank}
                  </p>
                  <p className="mt-1 font-semibold text-navy">
                    {account.accountName}
                  </p>
                  <p className="mt-1 font-mono text-lg font-bold tracking-wider text-navy">
                    {account.accountNumber}
                  </p>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(account.accountNumber, key)
                  }
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-stone-200 transition hover:border-royal hover:bg-royal/5"
                >
                  {copied === key ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-stone-400" />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-royal/20 bg-parchment/50 p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-royal">
            Kirim Kado Fisik
          </p>
          <div className="mt-4 space-y-3 text-sm text-stone-600">
            <p className="font-semibold text-navy">
              {WEDDING.giftAddress.name}
            </p>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-royal" />
              <span>
                {WEDDING.giftAddress.address}
                <br />
                {WEDDING.giftAddress.city}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 shrink-0 text-royal" />
              <span>{WEDDING.giftAddress.phone}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
