import { NextResponse } from "next/server";
import { checkInGuest } from "@/lib/guests";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { invitation_barcode, photo } = body;

    if (!invitation_barcode || !photo) {
      return NextResponse.json(
        { error: "Barcode undangan dan foto wajib diisi." },
        { status: 400 }
      );
    }

    const result = checkInGuest(invitation_barcode, photo);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Check-in gagal." },
      { status: 400 }
    );
  }
}
