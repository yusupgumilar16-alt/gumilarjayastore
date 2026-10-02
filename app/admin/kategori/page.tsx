import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Kategori' };

export default async function CategoriesPage() {
  const supabase = createAdminClient();
  const { data: categories } = await supabase.from('categories').select('*').order('sort_order');
  const list = categories || [];

  return (
    <>
      <div className="admin-card-head">
        <h1>Kategori <span style={{ color: '#94a3b8', fontWeight: 500 }}>({list.length})</span></h1>
      </div>

      <div className="admin-card">
        {list.length === 0 ? (
          <p style={{ color: '#64748b', padding: '40px 0', textAlign: 'center' }}>Belum ada kategori.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {list.map((c: any) => (
              <div key={c.id} style={{ padding: 20, border: '1px solid #e2e8f0', borderRadius: 12, background: '#fff' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>📁</div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{c.name}</div>
                <div style={{ fontSize: '.82rem', color: '#64748b', lineHeight: 1.5 }}>{c.description || '—'}</div>
                <div style={{ fontSize: '.7rem', color: '#94a3b8', marginTop: 8, fontFamily: 'monospace' }}>{c.slug}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}