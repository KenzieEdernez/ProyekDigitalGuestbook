import { NextResponse } from "next/server";
import { registerGuest } from "@/lib/guests";
import type { RegisterGuestInput } from "@/types/guest";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterGuestInput;

    const guest = await registerGuest({
      name: body.name ?? "",
      address: body.address ?? "",
      phone: body.phone ?? "",
      pax: Number(body.pax) || 1,
      attending: Boolean(body.attending),
    });

    return NextResponse.json({ guest });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Pendaftaran gagal.",
      },
      { status: 400 }
    );
  }
}
