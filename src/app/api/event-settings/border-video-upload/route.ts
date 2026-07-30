import { NextResponse } from "next/server";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import {
  getEventSettings,
  saveEventSettings,
  uploadBorderVideoBuffer,
} from "@/lib/event-settings";

export const dynamic = "force-dynamic";

const MAX_BORDER_VIDEO_BYTES = 40 * 1024 * 1024;

function isBorderVideoFile(file: File) {
  const name = file.name.toLowerCase();
  const type = (file.type || "").toLowerCase();
  return (
    type.startsWith("video/") ||
    name.endsWith(".webm") ||
    name.endsWith(".mp4") ||
    name.endsWith(".mov")
  );
}

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
        { error: "No border video provided." },
        { status: 400 }
      );
    }

    if (!isBorderVideoFile(file)) {
      return NextResponse.json(
        { error: "Please upload a video file (.webm, .mp4, or .mov)." },
        { status: 400 }
      );
    }

    if (file.size > MAX_BORDER_VIDEO_BYTES) {
      return NextResponse.json(
        { error: "Border video must be under 40MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "video/mp4";
    const url = await uploadBorderVideoBuffer(buffer, mimeType);

    const current = await getEventSettings();
    const settings = await saveEventSettings({
      ...current,
      borderVideo: url,
    });

    return NextResponse.json({ url, settings });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to upload border video.",
      },
      { status: 400 }
    );
  }
}
