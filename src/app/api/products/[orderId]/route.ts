import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { getOrder } from "@/lib/gelato";
import { apiError } from "@/lib/error-messages";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("AUTH_REQUIRED", 401);
  }

  const { data: order } = await supabase
    .from("product_orders")
    .select("*")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (!order) {
    return apiError("MEMORIAL_NOT_FOUND", 404, "Order not found.");
  }

  // If order has a Gelato ID, fetch latest status
  if (order.gelato_order_id) {
    try {
      const gelatoOrder = await getOrder(order.gelato_order_id);
      const newStatus = mapGelatoStatus(gelatoOrder.fulfillmentStatus);

      if (newStatus !== order.status) {
        await supabase
          .from("product_orders")
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq("id", orderId);

        order.status = newStatus;
      }
    } catch {
      // Gelato API unavailable — return cached status
    }
  }

  return NextResponse.json({
    orderId: order.id,
    productType: order.product_type,
    status: order.status,
    priceCents: order.price_cents,
    createdAt: order.created_at,
  });
}

function mapGelatoStatus(gelatoStatus: string): string {
  switch (gelatoStatus) {
    case "created":
    case "passed_to_production":
      return "production";
    case "shipped":
      return "shipped";
    case "delivered":
      return "delivered";
    case "canceled":
      return "cancelled";
    default:
      return "ordered";
  }
}
