import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://gumilarjaya.store';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/produk`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/cek-kwitansi`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  // Dynamic: produk
  try {
    const supabase = createClient();
    const { data: products } = await supabase
      .from('products')
      .select('slug, updated_at')
      .order('created_at', { ascending: false });

    const productPages: MetadataRoute.Sitemap = (products || []).map((p: any) => ({
      url: `${baseUrl}/produk/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    // Dynamic: kategori
    const { data: categories } = await supabase
      .from('categories')
      .select('slug');

    const categoryPages: MetadataRoute.Sitemap = (categories || []).map((c: any) => ({
      url: `${baseUrl}/kategori/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [...staticPages, ...productPages, ...categoryPages];
  } catch {
    return staticPages;
  }
}
