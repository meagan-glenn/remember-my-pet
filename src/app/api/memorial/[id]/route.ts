import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";
import { apiError } from "@/lib/error-messages";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("AUTH_REQUIRED", 401);
  }

  if (!rateLimit(`memorial-get:${user.id}`, 30)) {
    return apiError("RATE_LIMITED", 429);
  }

  const { data: memorial, error } = await supabase
    .from("memorials")
    .select("*, photos(*)")
    .eq("id", id)
    .single();

  if (error || !memorial) {
    return apiError("MEMORIAL_NOT_FOUND", 404);
  }

  if (memorial.user_id !== user.id) {
    return apiError("AUTH_REQUIRED", 403, "You don't have permission.");
  }

  // Sort photos by sort_order
  if (memorial.photos) {
    memorial.photos.sort(
      (a: { sort_order: number }, b: { sort_order: number }) =>
        (a.sort_order ?? 0) - (b.sort_order ?? 0)
    );
  }

  return NextResponse.json({ memorial });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("AUTH_REQUIRED", 401);
  }

  if (!rateLimit(`memorial-delete:${user.id}`, 5)) {
    return apiError("RATE_LIMITED", 429);
  }

  // Verify ownership
  const { data: memorial } = await supabase
    .from("memorials")
    .select("id, user_id")
    .eq("id", id)
    .single();

  if (!memorial || memorial.user_id !== user.id) {
    return apiError("AUTH_REQUIRED", 403, "You don't have permission to delete this memorial.");
  }

  // Delete related data then the memorial (cascading via FK would also work,
  // but being explicit is safer if FK cascades aren't configured)
  await Promise.all([
    supabase.from("photos").delete().eq("memorial_id", id),
    supabase.from("memories").delete().eq("memorial_id", id),
    supabase.from("candles").delete().eq("memorial_id", id),
    supabase.from("video_clips").delete().eq("memorial_id", id),
    supabase.from("video_compilations").delete().eq("memorial_id", id),
    supabase.from("videos").delete().eq("memorial_id", id),
    supabase.from("contributors").delete().eq("memorial_id", id),
  ]);

  const { error: deleteError } = await supabase
    .from("memorials")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("Memorial deletion error:", deleteError.message);
    return apiError("MEMORIAL_DELETE_FAILED", 500);
  }

  return NextResponse.json({ success: true });
}
