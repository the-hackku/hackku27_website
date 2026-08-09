import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://hackku.org",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: "https://hackku.org/info",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://hackku.org/signin",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: "https://hackku.org/legal",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    /* These will be added when they are ready to be published
    {
      url: 'https://hackku.org/blog',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: 'https://hackku.org/rules',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: 'https://hackku.org/schedule',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: 'https://hackku.org/travel-guide',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: 'https://hackku.org/venue-map-parking',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    
    */
  ];
}
