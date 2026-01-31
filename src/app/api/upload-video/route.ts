import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";

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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!rateLimit(`upload-video:${user.id}`, 5)) {
    return NextResponse.json(
      { error: "Too many uploads. Please wait a moment." },
      { status: 429 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large (max 100MB)" },
      { status: 400 }
    );
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Unsupported file type. Use MP4, MOV, or WebM." },
      { status: 400 }
    );
  }

  const folder = `uploads/${user.id}`;
  const path = `${folder}/${Date.now()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from("memorial-videos")
    .upload(path, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Video upload error:", error.message);
    return NextResponse.json(
      { error: "Failed to upload video" },
      { status: 500 }
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("memorial-videos").getPublicUrl(path);

  return NextResponse.json({ url: publicUrl });
}
