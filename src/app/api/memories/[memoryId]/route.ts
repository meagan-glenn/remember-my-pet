import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";
import { validateMemoryContent } from "@/lib/validation";

interface RouteParams {
  params: Promise<{ memoryId: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!rateLimit(`moderate:${user.id}`, 20)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 }
    );
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
    return NextResponse.json({ error: "Memory not found" }, { status: 404 });
  }

  const memorial = memory.memorials as unknown as { user_id: string };
  if (memorial.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
      return NextResponse.json({ error: "Failed to approve" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  if (action === "reject") {
    const { error } = await supabase
      .from("memories")
      .update({ moderation_status: "rejected", is_approved: false })
      .eq("id", memoryId);

    if (error) {
      return NextResponse.json({ error: "Failed to reject" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  if (action === "edit") {
    const validation = validateMemoryContent(content);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { error } = await supabase
      .from("memories")
      .update({ content: content.trim() })
      .eq("id", memoryId);

    if (error) {
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { memoryId } = await params;

  const { data: memory } = await supabase
    .from("memories")
    .select("id, memorial_id, memorials(user_id)")
    .eq("id", memoryId)
    .single();

  if (!memory) {
    return NextResponse.json({ error: "Memory not found" }, { status: 404 });
  }

  const memorial = memory.memorials as unknown as { user_id: string };
  if (memorial.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase.from("memories").delete().eq("id", memoryId);

  if (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
