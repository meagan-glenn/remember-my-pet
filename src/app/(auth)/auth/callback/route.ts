import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

  return NextResponse.redirect(new URL(redirect, request.url));
}
