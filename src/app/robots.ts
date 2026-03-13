import type { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL!;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/gig-form'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
