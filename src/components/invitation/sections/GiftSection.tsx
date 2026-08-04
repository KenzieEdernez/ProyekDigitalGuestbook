"use client";

import { useState } from "react";
import { Check, Gift } from "lucide-react";
import GiftEnvelopeArt from "@/components/invitation/GiftEnvelopeArt";
import Reveal from "@/components/invitation/Reveal";
import type { GiftAccount, InvitationCopy } from "@/types/wedding";

interface GiftSectionProps {
  gifts: GiftAccount[];
  copy: InvitationCopy;
  cardImage?: string;
}

export default function GiftSection({
  gifts,
  copy,
  cardImage,
}: GiftSectionProps) {
  const [revealed, setRevealed] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyNumber = async (account: GiftAccount) => {
    try {
      await navigator.clipboard.writeText(account.accountNumber);
      setCopiedId(account.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignored
    }
  };

  return (
    <section id="gift" className="gift-section invitation-section relative">
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col items-center justify-center px-5 py-16 sm:max-w-lg sm:px-6 sm:py-20">
        <Reveal direction="up" className="w-full">
          <div className={`gift-registry ${revealed ? "is-revealed" : ""}`}>
            <div className="gift-registry-envelope">
              <GiftEnvelopeArt />

              <div
                className="gift-registry-card"
                style={
                  cardImage
                    ? { backgroundImage: `url('${cardImage}')` }
                    : undefined
                }
              >
                <div className="gift-registry-card-shade" />
                <div className="gift-registry-card-content">
                  <h2 className="gift-registry-title">
                    {copy.giftTitle || "Gift"}
                  </h2>
                  <p className="gift-registry-message">{copy.giftMessage}</p>
                  {gifts.length > 0 ? (
                    <button
                      type="button"
                      className="gift-registry-send"
                      onClick={() => setRevealed((v) => !v)}
                      aria-expanded={revealed}
                      aria-controls="gift-bank-slips"
                    >
                      <Gift className="h-3.5 w-3.5" strokeWidth={1.75} />
                      {revealed ? "Hide Details" : "Send Gift"}
                    </button>
                  ) : null}
                </div>
              </div>

              <div
                id="gift-bank-slips"
                className="gift-registry-slips"
                aria-hidden={!revealed}
              >
                {gifts.map((account, index) => (
                  <div
                    key={account.id || `${account.bank}-${index}`}
                    className="gift-bank-slip"
                    style={{
                      transitionDelay: revealed ? `${index * 90}ms` : "0ms",
                    }}
                  >
                    <span className="gift-bank-pin" aria-hidden />
                    <p className="gift-bank-logo">{account.bank}</p>
                    <p className="gift-bank-number">{account.accountNumber}</p>
                    <p className="gift-bank-name">{account.accountName}</p>
                    <button
                      type="button"
                      className="gift-bank-copy"
                      tabIndex={revealed ? 0 : -1}
                      onClick={() => void copyNumber(account)}
                    >
                      {copiedId === account.id ? (
                        <>
                          <Check className="h-3 w-3" />
                          Copied
                        </>
                      ) : (
                        "Copy"
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
