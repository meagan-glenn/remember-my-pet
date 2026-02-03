"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import { KeepsakeCard } from "@/components/keepsake-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle } from "lucide-react";

type Step = "select" | "shipping" | "confirm" | "done";

interface PreviewData {
  orderId: string;
  productType: string;
  priceCents: number;
  memorial: {
    petName: string;
    photoCount: number;
    memoryCount: number;
  };
}

export default function ShopPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [memorialId, setMemorialId] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("select");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<PreviewData | null>(null);

  const [shipping, setShipping] = useState({
    firstName: "",
    lastName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postCode: "",
    country: "US",
    email: "",
  });

  // Fetch memorial ID from slug
  useEffect(() => {
    async function fetchMemorial() {
      const supabase = createBrowserSupabase();
      const { data } = await supabase
        .from("memorials")
        .select("id")
        .eq("slug", slug)
        .single();

      if (data) setMemorialId(data.id);
    }
    fetchMemorial();
  }, [slug]);

  const handleSelectProduct = useCallback(
    async (productType: "memory_book" | "canvas_print") => {
      if (!memorialId) return;
      setLoading(true);
      setError("");

      try {
        const res = await fetch("/api/products/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memorialId, productType }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to create preview");
        }

        const data = await res.json();
        setPreview(data);
        setStep("shipping");
      } catch (err) {
        setError(err instanceof Error ? err.message : ERROR_MESSAGES.SHOP_ORDER_FAILED.message);
      } finally {
        setLoading(false);
      }
    },
    [memorialId]
  );

  const handleSubmitOrder = useCallback(async () => {
    if (!preview) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/products/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: preview.orderId,
          shippingAddress: shipping,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to place order");
      }

      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.SHOP_ORDER_FAILED.message);
    } finally {
      setLoading(false);
    }
  }, [preview, shipping]);

  const updateShipping = (field: string, value: string) =>
    setShipping((prev) => ({ ...prev, [field]: value }));

  const shippingValid =
    shipping.firstName &&
    shipping.lastName &&
    shipping.addressLine1 &&
    shipping.city &&
    shipping.postCode &&
    shipping.country &&
    shipping.email;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-orange-50/30 to-white">
      <div className="mx-auto max-w-lg px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            step === "select"
              ? router.push(`/${slug}`)
              : setStep(step === "shipping" ? "select" : "shipping")
          }
          className="mb-6 -ml-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {step === "select" ? "Back to memorial" : "Back"}
        </Button>

        {step === "select" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="font-serif text-2xl font-medium text-gray-900">
                Create a Keepsake
              </h1>
              <p className="text-gray-500">
                Turn your memorial into something you can hold.
              </p>
            </div>
            <div className="space-y-4">
              <KeepsakeCard
                productType="memory_book"
                priceCents={4999}
                onSelect={() => handleSelectProduct("memory_book")}
                loading={loading}
              />
              <KeepsakeCard
                productType="canvas_print"
                priceCents={3499}
                onSelect={() => handleSelectProduct("canvas_print")}
                loading={loading}
              />
            </div>
          </div>
        )}

        {step === "shipping" && preview && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="font-serif text-2xl font-medium text-gray-900">
                Shipping Details
              </h1>
              <p className="text-gray-500">
                Where should we send your{" "}
                {preview.productType === "memory_book"
                  ? "memory book"
                  : "canvas print"}
                ?
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    value={shipping.firstName}
                    onChange={(e) => updateShipping("firstName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    value={shipping.lastName}
                    onChange={(e) => updateShipping("lastName", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={shipping.email}
                  onChange={(e) => updateShipping("email", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="addressLine1">Address</Label>
                <Input
                  id="addressLine1"
                  value={shipping.addressLine1}
                  onChange={(e) =>
                    updateShipping("addressLine1", e.target.value)
                  }
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="addressLine2">Apt / Suite (optional)</Label>
                <Input
                  id="addressLine2"
                  value={shipping.addressLine2}
                  onChange={(e) =>
                    updateShipping("addressLine2", e.target.value)
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={shipping.city}
                    onChange={(e) => updateShipping("city", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={shipping.state}
                    onChange={(e) => updateShipping("state", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="postCode">Zip code</Label>
                  <Input
                    id="postCode"
                    value={shipping.postCode}
                    onChange={(e) => updateShipping("postCode", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={shipping.country}
                    onChange={(e) => updateShipping("country", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
                <p className="text-sm text-gray-600">
                  Total:{" "}
                  <span className="font-semibold">
                    ${(preview.priceCents / 100).toFixed(2)}
                  </span>
                </p>
              </div>

              <Button
                onClick={handleSubmitOrder}
                disabled={!shippingValid || loading}
                className="w-full h-12 bg-amber-600 hover:bg-amber-700"
              >
                {loading ? "Placing order..." : "Place Order"}
              </Button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="text-center space-y-6 py-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h1 className="font-serif text-2xl font-medium text-gray-900">
                Order Placed
              </h1>
              <p className="text-gray-500">
                Your keepsake is being prepared. We&apos;ll email you with
                shipping updates.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push(`/${slug}`)}
              className="mt-4"
            >
              Back to memorial
            </Button>
          </div>
        )}

        {error && (
          <p className="mt-4 text-center text-sm text-red-500">{error}</p>
        )}
      </div>
    </div>
  );
}
