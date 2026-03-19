import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
    "https://velvetlynk.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/ad/", "/profile/", "/ng/"],
        disallow: ["/account/", "/admin/", "/api/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}