import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";
import { apiError } from "@/lib/error-messages";
import { validateVideoMagicBytes, randomFileName } from "@/lib/file-validation";

const MAX_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_TYPES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
};

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("AUTH_REQUIRED", 401);
  }

  if (!rateLimit(`upload-video:${user.id}`, 5)) {
    return apiError("RATE_LIMITED", 429);
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return apiError("INVALID_INPUT", 400, "No file provided.");
  }

  if (file.size > MAX_SIZE) {
    return apiError("FILE_TOO_LARGE", 400);
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return apiError("INVALID_FILE_TYPE", 400);
  }

  const arrayBuffer = await file.arrayBuffer();

  // Validate magic bytes match claimed MIME type
  const verifiedExt = validateVideoMagicBytes(arrayBuffer);
  if (!verifiedExt) {
    return apiError("INVALID_FILE_TYPE", 400, "File content does not match a valid video type.");
  }

  const folder = `uploads/${user.id}`;
  const path = `${folder}/${randomFileName(verifiedExt)}`;

  const { error } = await supabase.storage
    .from("memorial-videos")
    .upload(path, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Video upload error:", error.message);
    return apiError("UPLOAD_FAILED", 500);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("memorial-videos").getPublicUrl(path);

  return NextResponse.json({ url: publicUrl });
}
