"use client";

import { usePathname } from "next/navigation";

// Known top-level routes that should show the site header
const ROUTES_WITH_HEADER = new Set([
  "/", "/create", "/support", "/memorials",
  "/privacy", "/terms", "/ai-info", "/sign-in", "/sign-up",
]);

function shouldShowHeader(pathname: string): boolean {
  if (ROUTES_WITH_HEADER.has(pathname)) return true;
  if (pathname.startsWith("/blog") || pathname.startsWith("/create")) return true;
  return false;
}

export function HeaderWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (!shouldShowHeader(pathname)) return null;
  return <>{children}</>;
}
