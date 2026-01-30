"use client";

import { useState, useEffect } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthModalProps {
  open: boolean;
  onAuthenticated: () => void;
}

export function AuthModal({ open, onAuthenticated }: AuthModalProps) {
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
          emailRedirectTo: `${window.location.origin}/create?step=3`,
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

  // Listen for auth state change (user clicked magic link in another tab)
  useEffect(() => {
    const supabase = createBrowserSupabase();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        onAuthenticated();
      }
    });
    return () => subscription.unsubscribe();
  }, [onAuthenticated]);

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-center">
            {sent ? "Check your email" : "Save your progress"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {sent
              ? `We sent a sign-in link to ${email}. Click it to continue creating your tribute.`
              : "Enter your email to generate your tribute and save your memorial."}
          </DialogDescription>
        </DialogHeader>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
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
              {loading ? "Sending..." : "Continue with email"}
            </Button>
          </form>
        ) : (
          <div className="text-center py-4">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
              <span className="text-2xl">✉️</span>
            </div>
            <p className="text-sm text-gray-500">
              Didn&apos;t get it?{" "}
              <button
                type="button"
                onClick={() => setSent(false)}
                className="text-amber-600 underline"
              >
                Try again
              </button>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
