import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";
import { apiError } from "@/lib/error-messages";

export async function PATCH(
  request: Request,
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

  if (!rateLimit(`feed-toggle:${user.id}`, 10)) {
    return apiError("RATE_LIMITED", 429);
  }

  const body = await request.json();
  const { showInFeed } = body;

  if (typeof showInFeed !== "boolean") {
    return apiError("INVALID_INPUT", 400, "showInFeed must be a boolean.");
  }

  // Verify ownership and published status
  const { data: memorial } = await supabase
    .from("memorials")
    .select("id, user_id, is_published")
    .eq("id", id)
    .single();

  if (!memorial || memorial.user_id !== user.id) {
    return apiError("AUTH_REQUIRED", 403, "You don't have permission.");
  }

  if (!memorial.is_published) {
    return apiError("INVALID_INPUT", 400, "Memorial must be published first.");
  }

  const { error } = await supabase
    .from("memorials")
    .update({ show_in_feed: showInFeed })
    .eq("id", id);

  if (error) {
    return apiError("MEMORIAL_SAVE_FAILED", 500);
  }

  return NextResponse.json({ showInFeed });
}
