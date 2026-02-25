import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/create", "/api/", "/auth/"],
      },
    ],
    sitemap: "https://remembermypet.ai/sitemap.xml",
  };
}
