import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";
import { validateMemoryContent } from "@/lib/validation";
import { apiError } from "@/lib/error-messages";

interface RouteParams {
  params: Promise<{ memoryId: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("AUTH_REQUIRED", 401);
  }

  if (!rateLimit(`moderate:${user.id}`, 20)) {
    return apiError("RATE_LIMITED", 429);
  }

  const { memoryId } = await params;
  const { action, content } = await request.json();

  // Fetch memory and verify ownership
  const { data: memory } = await supabase
    .from("memories")
    .select("id, memorial_id, memorials(user_id)")
    .eq("id", memoryId)
    .single();

  if (!memory) {
    return apiError("MEMORIAL_NOT_FOUND", 404);
  }

  const memorial = memory.memorials as unknown as { user_id: string };
  if (memorial.user_id !== user.id) {
    return apiError("AUTH_REQUIRED", 403, "You don't have permission.");
  }

  if (action === "approve") {
    const { error } = await supabase
      .from("memories")
      .update({
        is_approved: true,
        moderation_status: "approved",
        approved_at: new Date().toISOString(),
      })
      .eq("id", memoryId);

    if (error) {
      return apiError("MODERATION_FAILED", 500);
    }
    return NextResponse.json({ success: true });
  }

  if (action === "reject") {
    const { error } = await supabase
      .from("memories")
      .update({ moderation_status: "rejected", is_approved: false })
      .eq("id", memoryId);

    if (error) {
      return apiError("MODERATION_FAILED", 500);
    }
    return NextResponse.json({ success: true });
  }

  if (action === "edit") {
    const validation = validateMemoryContent(content);
    if (!validation.valid) {
      return apiError("INVALID_INPUT", 400, validation.error);
    }

    const { error } = await supabase
      .from("memories")
      .update({ content: content.trim() })
      .eq("id", memoryId);

    if (error) {
      return apiError("MODERATION_FAILED", 500);
    }
    return NextResponse.json({ success: true });
  }

  return apiError("INVALID_INPUT", 400, "Invalid action.");
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("AUTH_REQUIRED", 401);
  }

  if (!rateLimit(`memory-delete:${user.id}`, 10)) {
    return apiError("RATE_LIMITED", 429);
  }

  const { memoryId } = await params;

  const { data: memory } = await supabase
    .from("memories")
    .select("id, memorial_id, memorials(user_id)")
    .eq("id", memoryId)
    .single();

  if (!memory) {
    return apiError("MEMORIAL_NOT_FOUND", 404);
  }

  const memorial = memory.memorials as unknown as { user_id: string };
  if (memorial.user_id !== user.id) {
    return apiError("AUTH_REQUIRED", 403, "You don't have permission.");
  }

  const { error } = await supabase.from("memories").delete().eq("id", memoryId);

  if (error) {
    return apiError("MODERATION_FAILED", 500);
  }

  return NextResponse.json({ success: true });
}
