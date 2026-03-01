import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase";
import { sendWelcomeEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const rawRedirect = searchParams.get("redirect") || "/dashboard";

  // Validate redirect is a safe relative path (prevent open redirect)
  const SAFE_PATH_RE = /^\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]*$/;
  const redirect =
    rawRedirect.startsWith("/") &&
    !rawRedirect.startsWith("//") &&
    !rawRedirect.includes("\\") &&
    SAFE_PATH_RE.test(rawRedirect)
      ? rawRedirect
      : "/dashboard";

  if (!code) {
    const errorUrl = new URL("/auth/error", request.url);
    errorUrl.searchParams.set("error", "missing_code");
    errorUrl.searchParams.set("redirect", redirect);
    return NextResponse.redirect(errorUrl);
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  try {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("Auth callback exchange failed:", error.message);
      const errorUrl = new URL("/auth/error", request.url);
      errorUrl.searchParams.set("error", "exchange_failed");
      errorUrl.searchParams.set("redirect", redirect);
      return NextResponse.redirect(errorUrl);
    }
  } catch (err) {
    console.error("Auth callback unexpected error:", err);
    const errorUrl = new URL("/auth/error", request.url);
    errorUrl.searchParams.set("error", "unexpected");
    errorUrl.searchParams.set("redirect", redirect);
    return NextResponse.redirect(errorUrl);
  }

  // Send welcome email on first sign-in (awaited so Vercel doesn't kill the process before the DB update)
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const serviceClient = createServiceClient();
      const { data: profile } = await serviceClient
        .from("users")
        .select("display_name, welcome_email_sent")
        .eq("id", user.id)
        .single();

      if (profile && !profile.welcome_email_sent) {
        const firstName = profile.display_name?.split(" ")[0] || user.email?.split("@")[0] || "there";

        await sendWelcomeEmail({ email: user.email!, firstName });
        const { error: updateError } = await serviceClient
          .from("users")
          .update({ welcome_email_sent: true })
          .eq("id", user.id);
        if (updateError) console.error("Failed to mark welcome email sent:", updateError.message);
      }
    }
  } catch (err) {
    console.error("Welcome email check failed:", err instanceof Error ? err.message : "Unknown error");
  }

  return NextResponse.redirect(new URL(redirect, request.url));
}
