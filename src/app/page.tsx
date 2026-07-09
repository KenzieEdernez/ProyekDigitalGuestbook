"use client";

import { Suspense } from "react";
import InvitationApp from "@/components/invitation/InvitationApp";

function InvitationLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream">
      <p className="text-sm text-stone-500">Memuat undangan...</p>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<InvitationLoading />}>
      <InvitationApp />
    </Suspense>
  );
}
