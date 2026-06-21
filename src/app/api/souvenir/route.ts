import { NextResponse } from "next/server";
import { claimSouvenir, findGuestBySouvenirBarcode } from "@/lib/guests";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const barcode = searchParams.get("barcode");

    if (!barcode) {
      return NextResponse.json(
        { error: "Barcode wajib diisi." },
        { status: 400 }
      );
    }

    const guest = findGuestBySouvenirBarcode(barcode);
    if (!guest) {
      return NextResponse.json(
        { error: "Barcode souvenir tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({ guest });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Terjadi kesalahan." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { souvenir_barcode } = body;

    if (!souvenir_barcode) {
      return NextResponse.json(
        { error: "Barcode souvenir wajib diisi." },
        { status: 400 }
      );
    }

    const guest = claimSouvenir(souvenir_barcode);
    return NextResponse.json({ guest });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Penukaran gagal." },
      { status: 400 }
    );
  }
}
