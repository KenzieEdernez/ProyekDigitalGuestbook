"use client";

import { normalizeInitials } from "@/lib/hero-images";

interface InvitationMonogramProps {
  initials: string;
}

export default function InvitationMonogram({ initials }: InvitationMonogramProps) {
  const letters = normalizeInitials(initials);
  const first = letters[0] ?? "L";
  const second = letters[1] ?? "A";

  return (
    <div className="invitation-monogram" aria-hidden>
      <span className="invitation-monogram-letter">{first}</span>
      <span className="invitation-monogram-bar" />
      <span className="invitation-monogram-letter">{second}</span>
    </div>
  );
}
