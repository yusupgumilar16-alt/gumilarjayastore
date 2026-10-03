import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';
export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

export default async function Icon() {
  const settings = await getSettings();
  const logoUrl = settings.brand_favicon_url || settings.brand_logo_url;

  if (logoUrl) {
    const res = await fetch(logoUrl, { cache: 'no-store' });
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      return new Response(buffer, {
        headers: { 'Content-Type': 'image/png' },
      });
    }
  }

  // Fallback: SVG dengan inisial
  const initials = (settings.brand_logo_text || 'GJ').slice(0, 2).toUpperCase();
  const primary = settings.brand_primary_color || '#2563eb';

  return new Response(
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="14" fill="${primary}"/>
      <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
        font-family="Inter,system-ui,sans-serif" font-weight="800" font-size="28" fill="#fff">
        ${initials}
      </text>
    </svg>`,
    { headers: { 'Content-Type': 'image/svg+xml' } }
  );
}
