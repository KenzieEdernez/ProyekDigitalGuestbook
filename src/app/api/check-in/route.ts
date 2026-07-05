import { NextResponse } from "next/server";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import { checkInGuest } from "@/lib/guests";
import type { EnvelopeSection } from "@/types/guest";

export async function POST(request: Request) {
  if (!(await isAdminLoggedIn())) {
    return NextResponse.json(
      { error: "You must be logged in as staff." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { invitation_barcode, photo, envelope_section } = body;

    if (!invitation_barcode || !photo || !envelope_section) {
      return NextResponse.json(
        { error: "Invitation barcode, photo, and envelope section are required." },
        { status: 400 }
      );
    }

    if (envelope_section !== "A" && envelope_section !== "B") {
      return NextResponse.json(
        { error: "Envelope section must be A or B." },
        { status: 400 }
      );
    }

    const result = await checkInGuest(
      invitation_barcode,
      photo,
      envelope_section as EnvelopeSection
    );
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Check-in failed." },
      { status: 400 }
    );
  }
}
