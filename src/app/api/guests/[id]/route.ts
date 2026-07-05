import { NextResponse } from "next/server";
import { deleteGuest } from "@/lib/guests";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteGuest(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Guest not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete." },
      { status: 500 }
    );
  }
}
