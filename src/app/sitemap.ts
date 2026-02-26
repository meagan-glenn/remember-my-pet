import type { MetadataRoute } from "next";
import { createServiceClient } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = "https://remembermypet.ai";

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), priority: 1.0 },
    { url: `${siteUrl}/skylar-glenn-2026`, lastModified: new Date(), priority: 0.8 },
    { url: `${siteUrl}/memorials`, lastModified: new Date(), priority: 0.7 },
    { url: `${siteUrl}/support`, lastModified: new Date(), priority: 0.6 },
    { url: `${siteUrl}/blog`, lastModified: new Date(), priority: 0.6 },
    { url: `${siteUrl}/blog/why-i-built-this`, lastModified: new Date(), priority: 0.5 },
    { url: `${siteUrl}/blog/coping-with-pet-loss`, lastModified: new Date(), priority: 0.5 },
    { url: `${siteUrl}/blog/some-days-are-harder`, lastModified: new Date(), priority: 0.5 },
    { url: `${siteUrl}/privacy`, lastModified: new Date(), priority: 0.3 },
    { url: `${siteUrl}/terms`, lastModified: new Date(), priority: 0.3 },
  ];

  const supabase = createServiceClient();
  const { data: memorials } = await supabase
    .from("memorials")
    .select("slug, updated_at")
    .eq("is_published", true);

  const memorialPages: MetadataRoute.Sitemap = (memorials || []).map((m) => ({
    url: `${siteUrl}/${m.slug}`,
    lastModified: new Date(m.updated_at),
    priority: 0.7,
  }));

  return [...staticPages, ...memorialPages];
}
