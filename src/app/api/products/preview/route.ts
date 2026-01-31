import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";
import { PRODUCT_UIDS, type ProductType } from "@/lib/gelato";

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!rateLimit(`product-preview:${user.id}`, 5)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 }
    );
  }

  const { memorialId, productType } = await request.json();

  if (!memorialId || !productType || !(productType in PRODUCT_UIDS)) {
    return NextResponse.json(
      { error: "Invalid memorial ID or product type" },
      { status: 400 }
    );
  }

  // Verify user owns this memorial
  const { data: memorial } = await supabase
    .from("memorials")
    .select("*, photos(*)")
    .eq("id", memorialId)
    .eq("user_id", user.id)
    .single();

  if (!memorial) {
    return NextResponse.json({ error: "Memorial not found" }, { status: 404 });
  }

  const photos = (memorial.photos || []).sort(
    (a: { sort_order: number }, b: { sort_order: number }) =>
      (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );

  if (photos.length === 0) {
    return NextResponse.json(
      { error: "Memorial must have at least one photo" },
      { status: 400 }
    );
  }

  // Fetch approved memories for the book
  const { data: memories } = await supabase
    .from("memories")
    .select("contributor_name, content")
    .eq("memorial_id", memorialId)
    .eq("is_approved", true)
    .order("created_at", { ascending: true });

  // Create a product order record
  const typedProductType = productType as ProductType;
  const priceCents = typedProductType === "memory_book" ? 4999 : 3499;

  const { data: order, error: orderError } = await supabase
    .from("product_orders")
    .insert({
      memorial_id: memorialId,
      user_id: user.id,
      product_type: productType,
      status: "preview",
      price_cents: priceCents,
    })
    .select()
    .single();

  if (orderError) {
    console.error("Order creation error:", orderError.message);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    orderId: order.id,
    productType,
    productUid: PRODUCT_UIDS[typedProductType],
    priceCents,
    memorial: {
      petName: memorial.pet_name,
      tribute: memorial.tribute,
      photoCount: photos.length,
      heroPhotoUrl: photos[0]?.url,
      memoryCount: memories?.length || 0,
    },
  });
}
