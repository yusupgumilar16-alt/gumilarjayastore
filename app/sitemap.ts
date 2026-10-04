import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://gumilarjaya.store';
  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/produk`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  ];
}
