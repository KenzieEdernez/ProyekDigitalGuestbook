import { NextResponse } from "next/server";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import {
  getEventSettings,
  saveEventSettings,
  uploadBirdVideoBuffer,
  type BirdVideoFormat,
} from "@/lib/event-settings";

export const dynamic = "force-dynamic";

const MAX_BIRD_BYTES = 25 * 1024 * 1024;

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
    const formatRaw = String(formData.get("format") || "main").toLowerCase();
    const format: BirdVideoFormat =
      formatRaw === "ios" ? "ios" : "main";

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No bird video provided." },
        { status: 400 }
      );
    }

    const name = file.name.toLowerCase();
    const type = (file.type || "").toLowerCase();
    const isVideo =
      type.startsWith("video/") ||
      name.endsWith(".mp4") ||
      name.endsWith(".m4v") ||
      name.endsWith(".mov") ||
      name.endsWith(".webm");

    if (!isVideo) {
      return NextResponse.json(
        { error: "Please upload an MP4 bird video (greenscreen OK)." },
        { status: 400 }
      );
    }

    if (file.size > MAX_BIRD_BYTES) {
      return NextResponse.json(
        { error: "Bird video must be under 25MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadBirdVideoBuffer(
      buffer,
      file.type || "video/mp4",
      format
    );

    const current = await getEventSettings();
    const settings = await saveEventSettings({
      ...current,
      ...(format === "ios" ? { birdImageIos: url } : { birdImage: url }),
    });

    return NextResponse.json({ url, settings, format });
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
