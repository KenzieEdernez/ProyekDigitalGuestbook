import { NextResponse } from "next/server";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import {
  getEventSettings,
  saveEventSettings,
  uploadBirdVideoBuffer,
} from "@/lib/event-settings";

export const dynamic = "force-dynamic";

const MAX_BIRD_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await isAdminLoggedIn())) {
    return NextResponse.json(
      { error: "You must be logged in as staff." },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No bird video provided." },
        { status: 400 }
      );
    }

    const name = file.name.toLowerCase();
    const isWebm =
      file.type === "video/webm" ||
      file.type === "video/webm;codecs=vp9" ||
      name.endsWith(".webm");

    if (!isWebm) {
      return NextResponse.json(
        { error: "Please upload a WebM video (.webm)." },
        { status: 400 }
      );
    }

    if (file.size > MAX_BIRD_BYTES) {
      return NextResponse.json(
        { error: "Bird video must be under 8MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadBirdVideoBuffer(
      buffer,
      file.type || "video/webm"
    );

    const current = await getEventSettings();
    const settings = await saveEventSettings({
      ...current,
      birdImage: url,
    });

    return NextResponse.json({ url, settings });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to upload bird video.",
      },
      { status: 400 }
    );
  }
}
