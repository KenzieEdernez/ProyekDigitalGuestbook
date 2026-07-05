import { NextResponse } from "next/server";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import { claimSouvenir, findGuestBySouvenirBarcode } from "@/lib/guests";

export async function GET(request: Request) {
  if (!(await isAdminLoggedIn())) {
    return NextResponse.json(
      { error: "You must be logged in as staff." },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const barcode = searchParams.get("barcode");

    if (!barcode) {
      return NextResponse.json(
        { error: "Barcode is required." },
        { status: 400 }
      );
    }

    const guest = await findGuestBySouvenirBarcode(barcode);
    if (!guest) {
      return NextResponse.json(
        { error: "Souvenir barcode not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ guest });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!(await isAdminLoggedIn())) {
    return NextResponse.json(
      { error: "You must be logged in as staff." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { souvenir_barcode } = body;

    if (!souvenir_barcode) {
      return NextResponse.json(
        { error: "Souvenir barcode is required." },
        { status: 400 }
      );
    }

    const guest = await claimSouvenir(souvenir_barcode);
    return NextResponse.json({ guest });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Souvenir pickup failed." },
      { status: 400 }
    );
  }
}
