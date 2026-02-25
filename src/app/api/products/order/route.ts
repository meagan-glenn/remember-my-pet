import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";
import { apiError } from "@/lib/error-messages";
import {
  createOrder,
  PRODUCT_UIDS,
  type ProductType,
  type GelatoShippingAddress,
} from "@/lib/gelato";

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("AUTH_REQUIRED", 401);
  }

  if (!rateLimit(`product-order:${user.id}`, 3)) {
    return apiError("RATE_LIMITED", 429);
  }

  const { orderId, shippingAddress } = await request.json();

  if (!orderId || !shippingAddress) {
    return apiError("INVALID_INPUT", 400, "Missing order ID or shipping address.");
  }

  // Validate shipping address
  const required = ["firstName", "lastName", "addressLine1", "city", "postCode", "country", "email"];
  for (const field of required) {
    if (!shippingAddress[field]) {
      return apiError("INVALID_INPUT", 400, `Missing shipping field: ${field}.`);
    }
  }

  // Fetch the order and verify ownership
  const { data: order } = await supabase
    .from("product_orders")
    .select("*")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (!order) {
    return apiError("MEMORIAL_NOT_FOUND", 404, "Order not found.");
  }

  if (order.status !== "preview") {
    return apiError("INVALID_INPUT", 400, "Order has already been submitted.");
  }

  // Fetch memorial photos
  const { data: memorial } = await supabase
    .from("memorials")
    .select("*, photos(*)")
    .eq("id", order.memorial_id)
    .single();

  if (!memorial) {
    return apiError("MEMORIAL_NOT_FOUND", 404);
  }

  const photos = (memorial.photos || []).sort(
    (a: { sort_order: number }, b: { sort_order: number }) =>
      (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );

  const productType = order.product_type as ProductType;
  const productUid = PRODUCT_UIDS[productType];

  // Build file list for Gelato
  const files =
    productType === "canvas_print"
      ? [{ type: "default", url: photos[0].url }]
      : photos.map((p: { url: string }, i: number) => ({
          type: i === 0 ? "cover" : "default",
          url: p.url,
        }));

  try {
    const gelatoOrder = await createOrder({
      orderType: "order",
      orderReferenceId: order.id,
      customerReferenceId: user.id,
      currency: "USD",
      items: [
        {
          itemReferenceId: `${order.id}-item`,
          productUid,
          files,
          quantity: 1,
        },
      ],
      shippingAddress: shippingAddress as GelatoShippingAddress,
    });

    // Update order with Gelato response
    await supabase
      .from("product_orders")
      .update({
        gelato_order_id: gelatoOrder.id,
        status: "ordered",
        shipping_name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        shipping_address: shippingAddress,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    return NextResponse.json({
      orderId: order.id,
      gelatoOrderId: gelatoOrder.id,
      status: "ordered",
    });
  } catch (err) {
    console.error("Gelato order error:", err instanceof Error ? err.message : "Unknown error");
    return apiError("SHOP_ORDER_FAILED", 500);
  }
}
