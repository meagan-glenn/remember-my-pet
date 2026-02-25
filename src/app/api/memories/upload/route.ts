import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";
import { apiError } from "@/lib/error-messages";
import { getClientIp } from "@/lib/request-utils";
import { validateImageMagicBytes, randomFileName } from "@/lib/file-validation";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

export async function POST(request: Request) {
  const ip = getClientIp(request);

  if (!rateLimit(`memory-upload:${ip}`, 10)) {
    return apiError("RATE_LIMITED", 429);
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const memorialId = formData.get("memorialId") as string | null;

  if (!file) {
    return apiError("INVALID_INPUT", 400, "No file provided.");
  }

  if (!memorialId) {
    return apiError("INVALID_INPUT", 400, "Memorial ID is required.");
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
  const verifiedExt = validateImageMagicBytes(arrayBuffer);
  if (!verifiedExt) {
    return apiError("INVALID_FILE_TYPE", 400, "File content does not match a valid image type.");
  }

  // Service role needed: anonymous memory uploads bypass auth
  const supabase = createServiceClient();

  // Verify memorial exists and is published
  const { data: memorial } = await supabase
    .from("memorials")
    .select("id, is_published")
    .eq("id", memorialId)
    .single();

  if (!memorial?.is_published) {
    return apiError("MEMORIAL_NOT_FOUND", 404);
  }

  const path = `memories/${memorialId}/${randomFileName(verifiedExt)}`;

  const { error } = await supabase.storage
    .from("memorial-photos")
    .upload(path, arrayBuffer, { contentType: file.type, upsert: false });

  if (error) {
    console.error("Memory photo upload error:", error.message);
    return apiError("UPLOAD_FAILED", 500);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("memorial-photos").getPublicUrl(path);

  return NextResponse.json({ url: publicUrl });
}
