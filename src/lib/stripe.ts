import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-01-28.clover",
});

export const PRICES = {
  basic: process.env.STRIPE_PRICE_BASIC || "",
  premium: process.env.STRIPE_PRICE_PREMIUM || "",
} as const;

export type Tier = keyof typeof PRICES;
