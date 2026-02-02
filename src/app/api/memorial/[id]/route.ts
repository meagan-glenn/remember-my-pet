import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: memorial, error } = await supabase
    .from("memorials")
    .select("*, photos(*)")
    .eq("id", id)
    .single();

  if (error || !memorial) {
    return NextResponse.json({ error: "Memorial not found" }, { status: 404 });
  }

  if (memorial.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
