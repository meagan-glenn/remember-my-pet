"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";

const TIERS = [
  {
    id: "basic" as const,
    name: "Basic",
    price: "$49",
    description: "Everything you need to honor their memory",
    features: [
      "Permanent memorial page",
      "Photo gallery with captions",
      "AI-written tribute",
      "Video reel",
      "Memory wall for friends & family",
      "Shareable link",
    ],
  },
  {
    id: "premium" as const,
    name: "Premium",
    price: "$99",
    description: "A lasting tribute, online and in your hands",
    features: [
      "Everything in Basic",
      "Printed memory book delivered to you",
    ],
    highlight: true,
  },
];

interface PricingCardsProps {
  memorialId: string;
  slug: string;
}

export function PricingCards({ memorialId, slug }: PricingCardsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleCheckout = async (tier: "basic" | "premium") => {
    setLoading(tier);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memorial_id: memorialId, tier }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Checkout failed");
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(null);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="text-center space-y-2">
        <h2 className="font-serif text-2xl font-semibold text-gray-900">
          Publish your memorial
        </h2>
        <p className="text-gray-500">
          Your memorial has been saved. Choose a plan to make it permanent and
          shareable.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {TIERS.map((tier) => (
          <Card
            key={tier.id}
            className={
              tier.highlight
                ? "border-amber-300 ring-2 ring-amber-200"
                : undefined
            }
          >
            <CardHeader>
              <CardTitle className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{tier.price}</span>
                <span className="text-base font-normal text-gray-500">
                  one-time
                </span>
              </CardTitle>
              <CardDescription className="text-base font-medium text-gray-900">
                {tier.name}
              </CardDescription>
              <p className="text-sm text-gray-500">{tier.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handleCheckout(tier.id)}
                disabled={loading !== null}
                className={`w-full h-11 ${
                  tier.highlight
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-gray-900 hover:bg-gray-800"
                }`}
              >
                {loading === tier.id ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Redirecting...
                  </span>
                ) : (
                  `Choose ${tier.name}`
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      <p className="text-center text-xs text-gray-400">
        Secure payment via Stripe. Your memorial stays private until you
        publish.
      </p>
    </div>
  );
}
