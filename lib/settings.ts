import { createClient } from '@/lib/supabase/server';
import type { SettingsMap } from '@/lib/types';

export async function getSettings(): Promise<SettingsMap> {
  const supabase = createClient();
  const { data, error } = await supabase.from('settings').select('key, value');

  if (error || !data) {
    return {
      site_name: 'Gumilar Jaya Store',
      site_tagline: 'Produk digital & fisik, dipilih satu per satu.',
      site_description: 'Template, e-book, apparel, hingga kopi specialty.',
      contact_email: 'halo@gumilarjaya.store',
      contact_whatsapp: '',
      social_instagram: '',
      social_tiktok: '',
      hero_eyebrow: 'Marketplace terkurasi · Sejak 2019',
      hero_title: 'Produk digital & fisik, dipilih satu per satu.',
      hero_subtitle: 'Template, e-book, apparel, hingga kopi specialty.',
      stat_customers: '12.400+',
      stat_products: '380+',
      stat_rating: '4,9/5',
      stat_ontime: '98%',
    };
  }

  const map: SettingsMap = {};
  data.forEach((row) => {
    map[row.key] = row.value || '';
  });
  return map;
}