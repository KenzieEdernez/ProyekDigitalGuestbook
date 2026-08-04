"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import Reveal from "@/components/invitation/Reveal";
import type { GiftAccount, InvitationCopy } from "@/types/wedding";

interface GiftSectionProps {
  gifts: GiftAccount[];
  copy: InvitationCopy;
}

function GiftEnvelope({
  account,
  index,
}: {
  account: GiftAccount;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(account.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignored
    }
  };

  return (
    <Reveal direction="up" delay={index * 120 + 200}>
      <div className={`gift-envelope ${open ? "is-open" : ""}`}>
        <div className="gift-envelope-stage">
          <div className="gift-envelope-back" aria-hidden />

          <div
            id={`gift-letter-${account.id}`}
            className="gift-letter"
            role="region"
            aria-label={`${account.bank} account details`}
            aria-hidden={!open}
          >
            <div className="gift-letter-inner">
              <p className="gift-letter-bank">{account.bank}</p>
              <p className="gift-letter-label">Account Name</p>
              <p className="gift-letter-name">{account.accountName}</p>
              <p className="gift-letter-number">{account.accountNumber}</p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  void copyToClipboard();
                }}
                className="gift-letter-copy"
                tabIndex={open ? 0 : -1}
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy Number
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="gift-envelope-pocket" aria-hidden />

          <div className="gift-envelope-flap" aria-hidden>
            <span className="gift-envelope-flap-face gift-envelope-flap-front">
              <span className="gift-envelope-hint">
                {open ? "Tap to close" : "Tap to open"}
              </span>
            </span>
            <span className="gift-envelope-flap-face gift-envelope-flap-back" />
          </div>

          <div className="gift-envelope-seal" aria-hidden>
            <span className="gift-envelope-seal-mark">
              {account.bank.slice(0, 1).toUpperCase()}
            </span>
          </div>

          <button
            type="button"
            className="gift-envelope-hit"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={`gift-letter-${account.id}`}
          >
            <span className="sr-only">
              {open
                ? `Close ${account.bank} gift details`
                : `Open envelope for ${account.bank}`}
            </span>
          </button>
        </div>

        {!open && (
          <p className="gift-envelope-caption" aria-hidden>
            {account.bank}
          </p>
        )}
      </div>
    </Reveal>
  );
}

export default function GiftSection({ gifts, copy }: GiftSectionProps) {
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

        <div className="gift-envelope-list mt-12 space-y-14 sm:space-y-16">
          {gifts.map((account, i) => (
            <GiftEnvelope
              key={account.id || `${account.bank}-${account.accountNumber}-${i}`}
              account={account}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
