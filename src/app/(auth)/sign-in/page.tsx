"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

function SignInForm() {
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect") || "/dashboard";
  const redirect = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
    ? rawRedirect
    : "/dashboard";
  const context = searchParams.get("context");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError("");

    try {
      const supabase = createBrowserSupabase();
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
        },
      });

      if (authError) throw authError;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          {sent ? "Check your email" : context === "save" ? "Save your memorial" : "Welcome back"}
        </CardTitle>
        <CardDescription>
          {sent
            ? `We sent a sign-in link to ${email}`
            : context === "save"
              ? "Sign in or create an account to save — your progress is safe"
              : "Enter your email to sign in with a magic link"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                className="h-12 text-base"
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full h-12 bg-amber-600 hover:bg-amber-700"
            >
              {loading ? "Sending..." : "Send magic link"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href={`/sign-up${redirect !== "/dashboard" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
                className="text-amber-600 underline"
              >
                Sign up
              </Link>
            </p>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-2xl">
              ✉️
            </div>
            <p className="text-sm text-muted-foreground">
              Click the link in your email to sign in.
            </p>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="text-sm text-amber-600 underline"
            >
              Try a different email
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
