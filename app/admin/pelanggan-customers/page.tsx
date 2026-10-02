import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Pelanggan' };

export default async function CustomersPage() {
  const supabase = createAdminClient();
  const { data: customers } = await supabase
    .from('customers')
    .select('*, customer_ids(*)')
    .eq('is_archived', false)
    .order('created_at', { ascending: false });

  const list = customers || [];

  return (
    <>
      <h1 style={{ marginBottom: 24 }}>Pelanggan ({list.length})</h1>
      <div className="admin-card">
        {list.length === 0 ? (
          <p style={{ color: 'var(--muted)', padding: '40px 0', textAlign: 'center' }}>
            Belum ada pelanggan. Pelanggan akan muncul di sini setelah Anda membuatnya lewat form kwitansi.
          </p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama</th>
                <th>Kontak</th>
                <th>ID Pelanggan</th>
                <th>Terdaftar</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c: any) => (
                <tr key={c.id}>
                  <td><code style={{ fontSize: '.8rem' }}>{c.customer_code}</code></td>
                  <td><b>{c.name}</b></td>
                  <td>
                    {c.email && <div style={{ fontSize: '.82rem' }}>{c.email}</div>}
                    {c.phone && <div style={{ fontSize: '.82rem', color: '#64748b' }}>{c.phone}</div>}
                  </td>
                  <td>
                    {(c.customer_ids || []).length === 0 ? (
                      <span style={{ color: '#94a3b8', fontSize: '.82rem' }}>—</span>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {c.customer_ids.map((id: any) => (
                          <span key={id.id} style={{
                            fontSize: '.72rem',
                            padding: '2px 8px',
                            background: '#eff6ff',
                            color: '#1e40af',
                            borderRadius: 99,
                            fontFamily: 'SF Mono, Consolas, monospace',
                            width: 'fit-content',
                          }}>
                            {id.id_label}: {id.id_number}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td style={{ fontSize: '.82rem', color: '#64748b' }}>
                    {new Date(c.created_at).toLocaleDateString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
