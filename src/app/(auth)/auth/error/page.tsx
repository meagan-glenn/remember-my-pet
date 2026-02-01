"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "unexpected";
  const rawRedirect = searchParams.get("redirect") || "/dashboard";
  const redirect =
    rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
      ? rawRedirect
      : "/dashboard";

  const isMemorialFlow = redirect.includes("/create");

  const messages: Record<string, { title: string; description: string }> = {
    missing_code: {
      title: "Sign-in link not found",
      description:
        "Your sign-in link may have expired or already been used. Please request a new one.",
    },
    exchange_failed: {
      title: "Sign-in link expired",
      description:
        "We couldn't verify your sign-in link. It may have expired. Please request a new one.",
    },
    unexpected: {
      title: "Something went wrong",
      description:
        "We had trouble signing you in. Please try again.",
    },
  };

  const { title, description } = messages[error] || messages.unexpected;

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button asChild className="w-full h-12 bg-amber-600 hover:bg-amber-700">
          <Link
            href={`/sign-in?redirect=${encodeURIComponent(redirect)}`}
          >
            Send a new sign-in link
          </Link>
        </Button>
        {isMemorialFlow && (
          <Button asChild variant="ghost" className="w-full h-12">
            <Link href={redirect}>Return to your memorial</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <AuthErrorContent />
    </Suspense>
  );
}
