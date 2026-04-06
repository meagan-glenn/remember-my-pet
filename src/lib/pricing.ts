/**
 * Canonical source of truth for the user-facing memorial price.
 *
 * Stripe price IDs live in env vars (STRIPE_PRICE_BASIC, STRIPE_PRICE_PREMIUM)
 * and are used by the checkout flow. This file is for the *displayed* price
 * shown in marketing copy (homepage FAQ, etc.) so the displayed number can't
 * drift across surfaces.
 *
 * When monetization launches: flip IS_LAUNCH_FREE to false. Update
 * LAUNCH_PRICE_USD if the price changes. Both values flow into FAQ copy and
 * any future pricing surface automatically.
 */

export const LAUNCH_PRICE_USD = 29;
export const IS_LAUNCH_FREE = true;

/** Formatted price string for display, e.g. "$29". */
export const LAUNCH_PRICE_DISPLAY = `$${LAUNCH_PRICE_USD}`;
