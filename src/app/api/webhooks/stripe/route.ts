import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase";

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json({ error: "Payments not configured" }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err instanceof Error ? err.message : "Unknown error");
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const memorialId = session.metadata?.memorial_id;
      const tier = session.metadata?.tier;

      if (!memorialId) {
        console.error("Stripe webhook: missing memorial_id in metadata");
        break;
      }

      const { error } = await supabase
        .from("memorials")
        .update({
          is_paid: true,
          is_published: true,
          template: tier || "basic",
        })
        .eq("id", memorialId)
        .eq("is_paid", false); // idempotent

      if (error) {
        console.error("Failed to mark memorial as paid:", error.message);
      }
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object;
      // Get the checkout session to find memorial_id
      if (!charge.payment_intent) break;

      const sessions = await stripe.checkout.sessions.list({
        payment_intent: charge.payment_intent as string,
        limit: 1,
      });

      const session = sessions.data[0];
      const memorialId = session?.metadata?.memorial_id;

      if (!memorialId) {
        console.error("Stripe webhook: could not find memorial for refund");
        break;
      }

      const { error } = await supabase
        .from("memorials")
        .update({
          is_paid: false,
          is_published: false,
        })
        .eq("id", memorialId);

      if (error) {
        console.error("Failed to mark memorial as unpaid:", error.message);
      }
      break;
    }

    default:
      console.warn(`Unhandled Stripe event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
