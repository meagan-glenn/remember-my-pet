import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";
import { stripe, PRICES, type Tier } from "@/lib/stripe";

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!rateLimit(`checkout:${user.id}`, 5)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const { memorial_id, tier } = body as {
    memorial_id: string;
    tier: string;
  };

  if (!memorial_id || !tier || !["basic", "premium"].includes(tier)) {
    return NextResponse.json(
      { error: "Missing or invalid memorial_id or tier" },
      { status: 400 }
    );
  }

  const priceId = PRICES[tier as Tier];
  if (!priceId) {
    return NextResponse.json(
      { error: "Stripe price not configured for this tier" },
      { status: 500 }
    );
  }

  // Verify memorial belongs to user and is not already paid
  const { data: memorial, error: memError } = await supabase
    .from("memorials")
    .select("id, slug, is_paid")
    .eq("id", memorial_id)
    .eq("user_id", user.id)
    .single();

  if (memError || !memorial) {
    return NextResponse.json(
      { error: "Memorial not found" },
      { status: 404 }
    );
  }

  if (memorial.is_paid) {
    return NextResponse.json(
      { error: "Memorial is already paid" },
      { status: 400 }
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: {
      memorial_id: memorial.id,
      tier,
      user_id: user.id,
    },
    success_url: `${siteUrl}/dashboard?paid=true&memorial=${memorial.slug}`,
    cancel_url: `${siteUrl}/create/preview`,
    customer_email: user.email || undefined,
  });

  return NextResponse.json({ url: session.url });
}
