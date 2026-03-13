import type { MetadataRoute } from 'next';
import { SUPPORTED_FEED_LOCATIONS, buildFeedPath } from '@/lib/feed.routes';

const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL!;

export default function sitemap(): MetadataRoute.Sitemap {
  const feedUrls = SUPPORTED_FEED_LOCATIONS.map((loc) => ({
    url: `${baseUrl}${buildFeedPath(loc)}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/feed`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...feedUrls,
  ];
}
