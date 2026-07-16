"use client";

import { useState } from "react";
import { Check, Copy, Gift, MapPin, Phone } from "lucide-react";
import Reveal from "@/components/invitation/Reveal";
import SectionHeader from "@/components/invitation/SectionHeader";
import type { GiftAccount, GiftAddress } from "@/types/wedding";

interface GiftSectionProps {
  gifts: GiftAccount[];
  giftAddress: GiftAddress;
}

export default function GiftSection({ gifts, giftAddress }: GiftSectionProps) {
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
    <section id="gift" className="invitation-section invitation-section-pad relative bg-champagne">
      <div className="absolute inset-0 bg-radial-gold opacity-30" />

      <div className="relative mx-auto max-w-3xl lg:max-w-5xl">
        <SectionHeader
          label="Gift"
          title="Wedding Gift"
          subtitle="Your presence and blessings are the greatest gift. If you wish to give more, details are below."
        />

        <Reveal direction="scale" delay={100}>
          <div className="mb-10 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-royal/20 bg-white shadow-glow">
              <Gift className="h-9 w-9 text-royal" />
            </div>
          </div>
        </Reveal>

        <div className="space-y-4">
          {gifts.map((account, i) => {
            const key = `${account.bank}-${account.accountNumber}`;
            return (
              <Reveal key={account.id} direction="up" delay={i * 100}>
                <div className="glass-card-light group flex items-center justify-between gap-4 p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-card">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-royal">
                      {account.bank}
                    </p>
                    <p className="mt-1 font-medium text-navy">
                      {account.accountName}
                    </p>
                    <p className="mt-1 font-mono text-xl font-bold tracking-wider text-navy">
                      {account.accountNumber}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(account.accountNumber, key)
                    }
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-royal/15 bg-white transition-all duration-300 hover:border-royal/40 hover:bg-royal/5 active:scale-90"
                  >
                    {copied === key ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-stone-400 transition-colors group-hover:text-royal" />
                    )}
                  </button>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal direction="up" delay={250}>
          <div className="mt-8 overflow-hidden rounded-2xl border border-royal/15 bg-white/60 p-7 backdrop-blur-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-royal">
              Send Physical Gift
            </p>
            <div className="mt-5 space-y-4 text-sm text-stone-600">
              <p className="font-display text-xl text-navy">
                {giftAddress.name}
              </p>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-royal" />
                <span>
                  {giftAddress.address}
                  <br />
                  {giftAddress.city}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-royal" />
                <span>{giftAddress.phone}</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
