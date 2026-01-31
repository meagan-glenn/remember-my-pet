"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PricingCards } from "@/components/checkout/pricing-cards";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [memorial, setMemorial] = useState<{
    id: string;
    slug: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createBrowserSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push(`/sign-in?redirect=/${slug}/checkout`);
        return;
      }

      const { data } = await supabase
        .from("memorials")
        .select("id, slug, is_paid")
        .eq("slug", slug)
        .eq("user_id", user.id)
        .single();

      if (!data) {
        router.push("/dashboard");
        return;
      }

      if (data.is_paid) {
        router.push(`/${data.slug}`);
        return;
      }

      setMemorial({ id: data.id, slug: data.slug });
      setLoading(false);
    }
    load();
  }, [slug, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  if (!memorial) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-orange-50/30 to-white py-8 px-4">
      <div className="mx-auto max-w-2xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard")}
          className="mb-6 -ml-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to dashboard
        </Button>
        <PricingCards memorialId={memorial.id} slug={memorial.slug} />
      </div>
    </div>
  );
}
