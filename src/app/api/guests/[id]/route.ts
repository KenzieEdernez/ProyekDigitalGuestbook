import { NextResponse } from "next/server";
import { deleteGuest } from "@/lib/guests";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = deleteGuest(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Tamu tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal menghapus." },
      { status: 500 }
    );
  }
}
