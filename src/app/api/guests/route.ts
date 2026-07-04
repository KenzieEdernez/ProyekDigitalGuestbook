import { NextResponse } from "next/server";
import {
  deleteAllGuests,
  getAllGuests,
  getGuestStats,
  findGuestByInvitationBarcode,
} from "@/lib/guests";
import { isAdminLoggedIn } from "@/lib/admin-auth";

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

export async function DELETE() {
  if (!(await isAdminLoggedIn())) {
    return NextResponse.json(
      { error: "Anda harus login sebagai panitia." },
      { status: 401 }
    );
  }

  try {
    const deleted = await deleteAllGuests();
    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal menghapus data." },
      { status: 500 }
    );
  }
}
