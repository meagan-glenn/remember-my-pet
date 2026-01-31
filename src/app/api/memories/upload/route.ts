import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit } from "@/lib/rate-limit";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  const ip = getClientIp(request);

  if (!rateLimit(`memory-upload:${ip}`, 10)) {
    return NextResponse.json(
      { error: "Too many uploads. Please wait a moment." },
      { status: 429 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const memorialId = formData.get("memorialId") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!memorialId) {
    return NextResponse.json({ error: "Memorial ID is required" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Verify memorial exists and is published
  const { data: memorial } = await supabase
    .from("memorials")
    .select("id, is_published")
    .eq("id", memorialId)
    .single();

  if (!memorial?.is_published) {
    return NextResponse.json({ error: "Memorial not found" }, { status: 404 });
  }

  const path = `memories/${memorialId}/${Date.now()}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error } = await supabase.storage
    .from("memorial-photos")
    .upload(path, arrayBuffer, { contentType: file.type, upsert: false });

  if (error) {
    console.error("Memory photo upload error:", error.message);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("memorial-photos").getPublicUrl(path);

  return NextResponse.json({ url: publicUrl });
}
