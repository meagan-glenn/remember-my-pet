import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { createServiceClient } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";
import { apiError } from "@/lib/error-messages";
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
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("AUTH_REQUIRED", 401);
  }

  if (!rateLimit(`upload:${user.id}`, 60)) {
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
  const verifiedExt = validateImageMagicBytes(arrayBuffer);
  if (!verifiedExt) {
    return apiError("INVALID_FILE_TYPE", 400, "File content does not match a valid image type.");
  }

  const folder = `uploads/${user.id}`;
  const path = `${folder}/${randomFileName(verifiedExt)}`;

  const storage = createServiceClient();
  const { error } = await storage.storage
    .from("memorial-photos")
    .upload(path, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Upload error:", error.message);
    return apiError("UPLOAD_FAILED", 500);
  }

  const {
    data: { publicUrl },
  } = storage.storage.from("memorial-photos").getPublicUrl(path);

  return NextResponse.json({ url: publicUrl });
}
