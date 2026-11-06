import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatRupiah, formatDate } from '@/lib/utils';
import { INVOICE_STATUSES, STATUS_LABEL, isInvoiceStatus } from '@/lib/invoice-calc';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Kwitansi' };

const PAGE_SIZE = 25;

type SearchParams = { q?: string; status?: string; page?: string };

function listHref(p: { q: string; status: string; page: number }) {
  const sp = new URLSearchParams();
  if (p.q) sp.set('q', p.q);
  if (p.status) sp.set('status', p.status);
  if (p.page > 1) sp.set('page', String(p.page));
  const qs = sp.toString();
  return '/admin/kwitansi' + (qs ? `?${qs}` : '');
}

export default async function InvoicesPage({ searchParams }: { searchParams: SearchParams }) {
  const q = (searchParams.q || '').trim().slice(0, 80);
  const status = isInvoiceStatus(searchParams.status) ? searchParams.status : '';
  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);

  const supabase = createAdminClient();

  // Dulu: semua kwitansi dimuat sekaligus (select *). Supabase membatasi 1000 baris per permintaan,
  // jadi setelah import besar daftar terpotong diam-diam dan judul "(N)" ikut salah.
  // Sekarang: hitungan asli (count exact), pencarian, filter status, dan halaman.
  let query = supabase
    .from('invoices')
    .select('id, invoice_number, invoice_date, customer_name, total, status', { count: 'exact' });

  if (status) query = query.eq('status', status);

  // Buang karakter yang punya arti khusus di filter PostgREST agar pencarian tidak error.
  const safe = q.replace(/[%,()*\\"]/g, ' ').replace(/\s+/g, ' ').trim();
  if (safe) query = query.or(`invoice_number.ilike.%${safe}%,customer_name.ilike.%${safe}%`);

  const from = (page - 1) * PAGE_SIZE;
  const { data: invoices, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  if (page > totalPages) redirect(listHref({ q, status, page: totalPages }));

  const list = invoices || [];
  const filtered = !!(q || status);

  const inputStyle = {
    padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: '.9rem',
  } as const;

  return (
    <>
      <div className="admin-card-head">
        <h1>Kwitansi <span style={{ color: '#94a3b8', fontWeight: 500 }}>({totalCount})</span></h1>
        <Link href="/admin/kwitansi/baru" className="btn btn-primary">+ Buat Kwitansi</Link>
      </div>

      <div className="admin-card">
        <form method="get" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Cari nomor kwitansi atau nama pelanggan…"
            style={{ ...inputStyle, flex: '1 1 260px' }}
          />
          <select name="status" defaultValue={status} style={inputStyle}>
            <option value="">Semua status</option>
            {INVOICE_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary">Cari</button>
          {filtered && <Link href="/admin/kwitansi" className="btn btn-ghost">Reset</Link>}
        </form>

        {error && (
          <p style={{ color: '#991b1b', background: '#fee2e2', padding: '10px 14px', borderRadius: 9, fontSize: '.86rem' }}>
            Gagal memuat daftar kwitansi: {error.message}
          </p>
        )}

        {list.length === 0 ? (
          <p style={{ color: '#64748b', padding: '40px 0', textAlign: 'center' }}>
            {filtered ? 'Tidak ada kwitansi yang cocok dengan pencarian.' : 'Belum ada kwitansi.'}
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nomor</th>
                  <th>Tanggal</th>
                  <th>Pelanggan</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {list.map((inv: any) => (
                  <tr key={inv.id}>
                    <td>
                      <Link href={`/admin/kwitansi/${inv.id}`} style={{ color: '#2563eb', fontWeight: 600 }}>
                        {inv.invoice_number}
                      </Link>
                    </td>
                    <td>{formatDate(inv.invoice_date)}</td>
                    <td><b>{inv.customer_name}</b></td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatRupiah(inv.total)}</td>
                    <td>
                      <span className={`status-badge status-${inv.status}`}>
                        {isInvoiceStatus(inv.status) ? STATUS_LABEL[inv.status] : inv.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link href={`/admin/kwitansi/${inv.id}`} style={{
                        display: 'inline-grid', placeItems: 'center',
                        width: 34, height: 34, borderRadius: 9,
                        background: '#eff6ff', color: '#2563eb',
                        border: '1px solid #bfdbfe', textDecoration: 'none', fontSize: '.9rem',
                      }}>👁</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            gap: 10, flexWrap: 'wrap', marginTop: 16, fontSize: '.86rem', color: '#64748b',
          }}>
            <span>Halaman {page} dari {totalPages}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {page > 1 && (
                <Link href={listHref({ q, status, page: page - 1 })} className="btn btn-ghost">← Sebelumnya</Link>
              )}
              {page < totalPages && (
                <Link href={listHref({ q, status, page: page + 1 })} className="btn btn-ghost">Berikutnya →</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
