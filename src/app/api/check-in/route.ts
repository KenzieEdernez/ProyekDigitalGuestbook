import { NextResponse } from "next/server";
import { checkInGuest } from "@/lib/guests";
import type { EnvelopeSection } from "@/types/guest";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { invitation_barcode, photo, envelope_section } = body;

    if (!invitation_barcode || !photo || !envelope_section) {
      return NextResponse.json(
        { error: "Barcode undangan, foto, dan bagian amplop wajib diisi." },
        { status: 400 }
      );
    }

    if (envelope_section !== "A" && envelope_section !== "B") {
      return NextResponse.json(
        { error: "Bagian amplop harus A atau B." },
        { status: 400 }
      );
    }

    const result = checkInGuest(
      invitation_barcode,
      photo,
      envelope_section as EnvelopeSection
    );
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Check-in gagal." },
      { status: 400 }
    );
  }
}
