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
      <div className="absolute inset-0 bg-radial-gold opacity-25" />
      <div className="grain-overlay absolute inset-0" />

      <div className="relative mx-auto max-w-3xl px-2 text-center lg:max-w-4xl">
        <Reveal direction="blur">
          <h2 className="font-display text-5xl font-light text-white sm:text-6xl">
            {copy.giftTitle}
          </h2>
        </Reveal>

        <Reveal direction="up" delay={120}>
          <p className="mx-auto mt-8 max-w-2xl text-xs font-light uppercase leading-[1.9] tracking-[0.18em] text-white/70 sm:text-sm">
            {copy.giftMessage}
          </p>
        </Reveal>

        <div className="mt-10 space-y-5">
          {gifts.map((account, i) => {
            const key = `${account.bank}-${account.accountNumber}`;
            return (
              <Reveal key={account.id} direction="up" delay={i * 100 + 180}>
                <div className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-white/5 px-6 py-8 backdrop-blur-md">
                  <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-royal">
                    {account.bank}
                  </p>
                  <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-white/45">
                    Account Name
                  </p>
                  <p className="mt-2 font-display text-2xl text-white">
                    {account.accountName}
                  </p>
                  <p className="mt-6 font-mono text-3xl font-light tracking-[0.2em] text-white">
                    {account.accountNumber}
                  </p>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(account.accountNumber, key)}
                    className="mt-6 inline-flex items-center gap-2 rounded-full border border-royal/30 bg-royal/10 px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] text-royal transition-all hover:bg-royal/20"
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
