import { NextResponse } from "next/server";
import {
  getAllGuests,
  getGuestStats,
  findGuestByInvitationBarcode,
} from "@/lib/guests";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const barcode = searchParams.get("barcode");

    if (barcode) {
      const guest = await findGuestByInvitationBarcode(barcode);
      if (!guest) {
        return NextResponse.json(
          { error: "Tamu tidak ditemukan." },
          { status: 404 }
        );
      }
      return NextResponse.json({ guest });
    }

    const guests = await getAllGuests();
    const stats = await getGuestStats();
    return NextResponse.json({ guests, stats });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Terjadi kesalahan." },
      { status: 500 }
    );
  }
}
