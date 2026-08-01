/**
 * Validates that a user-supplied URL points at our Supabase project.
 *
 * A prefix check like `url.startsWith(supabaseUrl)` is not enough:
 * `https://<proj>.supabase.co.attacker.tld/x` and the userinfo form
 * `https://<proj>.supabase.co@169.254.169.254/x` both pass it. Comparing
 * parsed origins covers protocol, host, and port, and `URL#origin`
 * excludes userinfo credentials.
 */
export function isSupabaseStorageUrl(value: unknown): value is string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base || typeof value !== "string") return false;
  try {
    return new URL(value).origin === new URL(base).origin;
  } catch {
    return false;
  }
}
