import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-01-28.clover",
    })
  : (null as unknown as Stripe);

export const PRICES = {
  basic: process.env.STRIPE_PRICE_BASIC || "",
  premium: process.env.STRIPE_PRICE_PREMIUM || "",
} as const;

export type Tier = keyof typeof PRICES;
