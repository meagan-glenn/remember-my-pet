import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // TODO: Verify Stripe webhook signature and handle events
  const body = await request.text();
  console.log("Stripe webhook received", body.slice(0, 100));

  return NextResponse.json({ received: true });
}
