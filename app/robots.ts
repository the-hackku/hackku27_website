import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/register",
        "/profile",
        "/admin/",
        "/images/doodles/",
        "/images/schedule/",
        "/images/sponsors/",
        "/images/team/",
        "/images/default.webp",
        "/images/duck.webp",
        "/images/mlh-badge.svg",
      ],
    },
    sitemap: "https://hackku.org/sitemap.xml",
  };
}
