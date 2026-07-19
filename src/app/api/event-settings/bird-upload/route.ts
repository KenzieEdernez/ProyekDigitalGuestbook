import { NextResponse } from "next/server";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import {
  getEventSettings,
  saveEventSettings,
  uploadBirdVideoBuffer,
  type BirdVideoFormat,
} from "@/lib/event-settings";

export const dynamic = "force-dynamic";

const MAX_WEBM_BYTES = 8 * 1024 * 1024;
const MAX_IOS_BYTES = 25 * 1024 * 1024;

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
    const formatRaw = String(formData.get("format") || "webm").toLowerCase();
    const format: BirdVideoFormat = formatRaw === "ios" ? "ios" : "webm";

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No bird video provided." },
        { status: 400 }
      );
    }

    const name = file.name.toLowerCase();
    const type = (file.type || "").toLowerCase();

    const isWebm =
      type.includes("webm") || name.endsWith(".webm");
    const isIosVideo =
      type.includes("quicktime") ||
      type.includes("mp4") ||
      type.includes("m4v") ||
      name.endsWith(".mov") ||
      name.endsWith(".mp4") ||
      name.endsWith(".m4v");

    if (format === "webm" && !isWebm) {
      return NextResponse.json(
        { error: "Please upload a WebM video (.webm)." },
        { status: 400 }
      );
    }

    if (format === "ios" && !isIosVideo) {
      return NextResponse.json(
        { error: "Please upload an iOS bird video (.mov or .mp4 HEVC)." },
        { status: 400 }
      );
    }

    const maxBytes = format === "ios" ? MAX_IOS_BYTES : MAX_WEBM_BYTES;
    if (file.size > maxBytes) {
      return NextResponse.json(
        {
          error:
            format === "ios"
              ? "iOS bird video must be under 25MB."
              : "Bird video must be under 8MB.",
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadBirdVideoBuffer(
      buffer,
      file.type || (format === "ios" ? "video/quicktime" : "video/webm"),
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
