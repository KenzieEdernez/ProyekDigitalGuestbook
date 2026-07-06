import { NextResponse } from "next/server";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import { deleteGuest, updateGuest } from "@/lib/guests";
import type { UpdateGuestInput } from "@/types/guest";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminLoggedIn())) {
    return NextResponse.json(
      { error: "You must be logged in as staff." },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const body = (await request.json()) as UpdateGuestInput;
    const guest = await updateGuest(id, body);
    return NextResponse.json({ guest });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update guest.";
    const status = message === "Guest not found." ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminLoggedIn())) {
    return NextResponse.json(
      { error: "You must be logged in as staff." },
      { status: 401 }
    );
  }

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
