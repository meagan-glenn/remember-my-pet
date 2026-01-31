import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const compilationId = searchParams.get("compilationId");

  if (!compilationId) {
    return NextResponse.json({ error: "Missing compilationId" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("video_compilations")
    .select("id, status, url, error_message, duration_seconds")
    .eq("id", compilationId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Compilation not found" }, { status: 404 });
  }

  return NextResponse.json({
    compilationId: data.id,
    status: data.status,
    url: data.url,
    errorMessage: data.error_message,
    durationSeconds: data.duration_seconds,
  });
}
