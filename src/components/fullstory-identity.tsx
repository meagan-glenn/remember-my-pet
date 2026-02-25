"use client";

import { useEffect } from "react";
import { createBrowserSupabase } from "@/lib/supabase";

declare global {
  interface Window {
    FS?: (method: string, options: Record<string, unknown>) => void;
  }
}

export function FullStoryIdentity() {
  useEffect(() => {
    const supabase = createBrowserSupabase();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user && window.FS) {
          window.FS("setIdentity", {
            uid: session.user.id,
            properties: {
              email: session.user.email,
            },
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
