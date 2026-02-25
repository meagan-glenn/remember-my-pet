/**
 * Extracts client IP from request headers.
 * Prefers x-real-ip (set by Vercel/trusted proxy) over x-forwarded-for
 * to prevent IP spoofing via the forwarded header chain.
 */
export function getClientIp(request: Request): string {
  // x-real-ip is set by the reverse proxy (Vercel) and cannot be spoofed
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  // Fallback: last entry in x-forwarded-for is the one added by the proxy
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((s) => s.trim());
    return parts[parts.length - 1] || "unknown";
  }

  return "unknown";
}
