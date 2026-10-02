import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatRupiah, formatDate } from '@/lib/utils';
import InvoiceActions from '@/components/InvoiceActions';
import PrintButton from '@/components/PrintButton';

export const dynamic = 'force-dynamic';

export default async function AdminInvoiceDetail({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createAdminClient();
  const { data: invoice } = await supabase.from('invoices').select('*').eq('id', params.id).maybeSingle();
  if (!invoice) notFound();

  const { data: items } = await supabase
    .from('invoice_items')
    .select('*')
    .eq('invoice_id', invoice.id)
    .order('id');

  const list = items || [];

  return (
    <>
      <div className="admin-card-head">
        <h1 style={{ margin: 0 }}>Kwitansi {invoice.invoice_number}</h1>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/admin/kwitansi" className="btn btn-ghost">← Kembali</Link>
          <a href={`/invoice/${invoice.public_token}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
            Lihat Publik
          </a>
          <PrintButton />
        </div>
      </div>

      <div className="admin-card">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32, marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', fontWeight: 700, marginBottom: 8 }}>
              Pelanggan
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>{invoice.customer_name}</div>
            {invoice.customer_email && <div style={{ fontSize: '.9rem', color: 'var(--ink-2)' }}>{invoice.customer_email}</div>}
            {invoice.customer_phone && <div style={{ fontSize: '.9rem', color: 'var(--ink-2)' }}>{invoice.customer_phone}</div>}
            {invoice.customer_address && (
              <div style={{ fontSize: '.9rem', color: 'var(--ink-2)', marginTop: 6, whiteSpace: 'pre-line' }}>{invoice.customer_address}</div>
            )}
          </div>
          <div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', fontWeight: 700, marginBottom: 4 }}>Tanggal</div>
              <div style={{ fontWeight: 600 }}>{formatDate(invoice.invoice_date)}</div>
            </div>
            {invoice.due_date && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', fontWeight: 700, marginBottom: 4 }}>Jatuh Tempo</div>
                <div style={{ fontWeight: 600 }}>{formatDate(invoice.due_date)}</div>
              </div>
            )}
            <div>
              <div style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', fontWeight: 700, marginBottom: 6 }}>Status</div>
              <span className={`status-badge status-${invoice.status}`}>{invoice.status}</span>
            </div>
          </div>
        </div>

        <table className="admin-table" style={{ marginBottom: 24 }}>
          <thead>
            <tr>
              <th>Deskripsi</th>
              <th style={{ textAlign: 'center', width: 80 }}>Qty</th>
              <th style={{ textAlign: 'right', width: 140 }}>Harga</th>
              <th style={{ textAlign: 'right', width: 140 }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {list.map((it) => (
              <tr key={it.id}>
                <td>{it.description}</td>
                <td style={{ textAlign: 'center' }}>{it.qty}</td>
                <td style={{ textAlign: 'right' }}>{formatRupiah(it.unit_price)}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(it.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ minWidth: 280 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '.9rem' }}>
              <span style={{ color: 'var(--muted)' }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>{formatRupiah(invoice.subtotal)}</span>
            </div>
            {invoice.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '.9rem' }}>
                <span style={{ color: 'var(--muted)' }}>Diskon</span>
                <span style={{ fontWeight: 600, color: '#dc2626' }}>−{formatRupiah(invoice.discount)}</span>
              </div>
            )}
            {invoice.tax > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '.9rem' }}>
                <span style={{ color: 'var(--muted)' }}>Pajak</span>
                <span style={{ fontWeight: 600 }}>{formatRupiah(invoice.tax)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderTop: '2px solid var(--ink)', marginTop: 8 }}>
              <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>Total</span>
              <span style={{ fontWeight: 800, color: 'var(--blue)', fontSize: '1.15rem' }}>{formatRupiah(invoice.total)}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div style={{ marginTop: 32, padding: 20, background: 'var(--bg-soft)', borderRadius: 12 }}>
            <div style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', fontWeight: 700, marginBottom: 6 }}>Catatan</div>
            <div style={{ fontSize: '.9rem', whiteSpace: 'pre-line' }}>{invoice.notes}</div>
          </div>
        )}
      </div>

      <InvoiceActions invoice={invoice} />
    </>
  );
}