"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import Reveal from "@/components/invitation/Reveal";
import type { GiftAccount, InvitationCopy } from "@/types/wedding";

interface GiftSectionProps {
  gifts: GiftAccount[];
  copy: InvitationCopy;
}

export default function GiftSection({ gifts, copy }: GiftSectionProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // ignored
    }
  };

  return (
    <section
      id="gift"
      className="invitation-section invitation-section-pad relative overflow-hidden bg-navy text-white"
    >
      <div className="absolute inset-0 bg-radial-gold opacity-30" />
      <div className="pointer-events-none absolute -left-10 top-16 h-40 w-40 rounded-full bg-royal/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-8 bottom-10 h-44 w-44 rounded-full bg-royal/10 blur-3xl" />

      <div className="relative mx-auto max-w-2xl px-4 text-center">
        <Reveal direction="blur">
          <h2 className="font-display text-5xl font-light italic text-white sm:text-6xl">
            {copy.giftTitle}
          </h2>
        </Reveal>

        <Reveal direction="up" delay={100}>
          <div className="mx-auto my-6 h-px w-14 bg-gradient-to-r from-transparent via-royal/60 to-transparent" />
        </Reveal>

        <Reveal direction="up" delay={140}>
          <p className="mx-auto max-w-xl text-[11px] font-light uppercase leading-[1.95] tracking-[0.16em] text-white/65 sm:text-xs">
            {copy.giftMessage}
          </p>
        </Reveal>

        <div className="mt-10 space-y-5">
          {gifts.map((account, i) => {
            const key = `${account.bank}-${account.accountNumber}`;
            return (
              <Reveal key={account.id} direction="up" delay={i * 100 + 200}>
                <div className="mx-auto max-w-sm rounded-[1.75rem] border border-royal/20 bg-white/[0.04] px-6 py-8 backdrop-blur-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-royal">
                    {account.bank}
                  </p>
                  <p className="mt-5 text-[9px] uppercase tracking-[0.28em] text-white/40">
                    Account Name
                  </p>
                  <p className="mt-2 font-display text-2xl text-white">
                    {account.accountName}
                  </p>
                  <p className="mt-5 font-mono text-[1.65rem] font-light tracking-[0.18em] text-white sm:text-3xl">
                    {account.accountNumber}
                  </p>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(account.accountNumber, key)}
                    className="mt-6 inline-flex items-center gap-2 rounded-full border border-royal/35 bg-royal/10 px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.22em] text-royal transition-all hover:bg-royal/20"
                  >
                    {copied === key ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
