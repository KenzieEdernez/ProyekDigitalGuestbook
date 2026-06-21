import { NextResponse } from "next/server";
import { importGuests } from "@/lib/guests";
import type { ImportGuestRow } from "@/types/guest";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { guests } = body as { guests: ImportGuestRow[] };

    if (!guests || !Array.isArray(guests) || guests.length === 0) {
      return NextResponse.json(
        { error: "Data tamu kosong atau tidak valid." },
        { status: 400 }
      );
    }

    const result = importGuests(guests);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Import gagal." },
      { status: 500 }
    );
  }
}
