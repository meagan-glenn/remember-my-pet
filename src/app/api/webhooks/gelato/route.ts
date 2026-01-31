import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { createHmac, timingSafeEqual } from "crypto";

function verifySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.GELATO_WEBHOOK_SECRET;
  if (!secret) {
    console.error("GELATO_WEBHOOK_SECRET is not configured");
    return false;
  }
  if (!signature) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  // Verify webhook authenticity via HMAC signature
  const signature = request.headers.get("x-gelato-signature");
  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const body = JSON.parse(rawBody);
  const { orderId, orderReferenceId, status } = body;

  if (!orderId || !orderReferenceId || !status) {
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }

  const statusMap: Record<string, string> = {
    created: "ordered",
    passed_to_production: "production",
    shipped: "shipped",
    delivered: "delivered",
    canceled: "cancelled",
  };

  const mappedStatus = statusMap[status] || "ordered";

  const supabase = createServiceClient();
  await supabase
    .from("product_orders")
    .update({
      status: mappedStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderReferenceId)
    .eq("gelato_order_id", orderId);

  return NextResponse.json({ received: true });
}
