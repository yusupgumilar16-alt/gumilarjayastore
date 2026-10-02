import type { Invoice, InvoiceItem } from '@/lib/types';
import { formatRupiah, formatDate } from '@/lib/utils';

interface Props {
  invoice: Invoice;
  items: InvoiceItem[];
  settings: Record<string, string>;
  publicUrl?: string;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string; border: string }> = {
    draft: { label: 'DRAFT', bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
    terkirim: { label: 'TERKIRIM', bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
    dibayar: { label: 'LUNAS', bg: '#d1fae5', color: '#065f46', border: '#34d399' },
    batal: { label: 'BATAL', bg: '#fee2e2', color: '#991b1b', border: '#f87171' },
  };
  const s = map[status] || map.draft;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '7px 14px',
      borderRadius: 99,
      fontSize: '.7rem',
      fontWeight: 700,
      letterSpacing: '.12em',
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color }} />
      {s.label}
    </span>
  );
}

export default function InvoicePrint({ invoice, items, settings, publicUrl }: Props) {
  const primary = settings.invoice_primary_color || '#2563eb';
  const accent = settings.invoice_accent_color || '#10b981';
  const isPaid = invoice.status === 'dibayar';

  return (
    <div className="invoice-print invoice-v2">
      {/* ============ HEADER ============ */}
      <div className="inv-v2-header">
        <div className="inv-v2-header-left">
          <div className="inv-v2-logo">{settings.brand_logo_text || 'GJ'}</div>
          <div>
            <div className="inv-v2-brand">{settings.site_name}</div>
            <div className="inv-v2-tagline">{settings.brand_tagline || 'Melayani dengan aman & tenang'}</div>
          </div>
        </div>

        <div className="inv-v2-header-right">
          <div className="inv-v2-title-label">Kwitansi Pembayaran</div>
          <div className="inv-v2-title-number" style={{ color: primary }}>
            {invoice.invoice_number}
          </div>
          <StatusBadge status={invoice.status} />
        </div>
      </div>

      {/* ============ META GRID ============ */}
      <div className="inv-v2-meta">
        <div className="inv-v2-meta-card">
          <div className="inv-v2-meta-label">Ditagihkan Kepada</div>
          <div className="inv-v2-customer-name">{invoice.customer_name}</div>
          <div className="inv-v2-customer-detail">
            {invoice.customer_address && <div>{invoice.customer_address}</div>}
            {invoice.customer_email && <div>{invoice.customer_email}</div>}
            {invoice.customer_phone && <div>{invoice.customer_phone}</div>}
          </div>
        </div>

        <div className="inv-v2-meta-card">
          <div className="inv-v2-meta-label">Informasi Kwitansi</div>
          <div className="inv-v2-meta-row">
            <span>Tanggal</span>
            <b>{formatDate(invoice.invoice_date)}</b>
          </div>
          {invoice.due_date && (
            <div className="inv-v2-meta-row">
              <span>Jatuh Tempo</span>
              <b>{formatDate(invoice.due_date)}</b>
            </div>
          )}
          {invoice.payment_method && (
            <div className="inv-v2-meta-row">
              <span>Metode</span>
              <b>{invoice.payment_method}</b>
            </div>
          )}
        </div>

        <div className="inv-v2-meta-card inv-v2-meta-highlight" style={{ background: isPaid ? '#f0fdf4' : '#fffbeb' }}>
          <div className="inv-v2-meta-label">Status Pembayaran</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: isPaid ? '#059669' : '#d97706', letterSpacing: '-.02em' }}>
            {isPaid ? 'LUNAS' : invoice.status === 'batal' ? 'BATAL' : 'BELUM DIBAYAR'}
          </div>
          {isPaid && (
            <div style={{ fontSize: '.78rem', color: '#047857', marginTop: 4 }}>
              Dibayar pada {formatDate(invoice.updated_at || invoice.invoice_date)}
            </div>
          )}
        </div>
      </div>

      {/* ============ ITEMS TABLE ============ */}
      <div className="inv-v2-items">
        <table className="inv-v2-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>#</th>
              <th>Deskripsi</th>
              <th style={{ width: 60, textAlign: 'center' }}>Qty</th>
              <th style={{ width: 130, textAlign: 'right' }}>Harga</th>
              <th style={{ width: 150, textAlign: 'right' }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={it.id}>
                <td style={{ color: '#94a3b8', fontWeight: 600 }}>{String(i + 1).padStart(2, '0')}</td>
                <td><div className="inv-v2-item-name">{it.description}</div></td>
                <td style={{ textAlign: 'center', fontWeight: 600 }}>{it.qty}</td>
                <td className="inv-v2-num">{formatRupiah(it.unit_price).replace('Rp ', '')}</td>
                <td className="inv-v2-num inv-v2-num-bold">{formatRupiah(it.subtotal).replace('Rp ', '')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ============ TOTALS ============ */}
      <div className="inv-v2-totals">
        <div className="inv-v2-notes">
          <div className="inv-v2-notes-label">Catatan</div>
          <div className="inv-v2-notes-text">
            {invoice.notes || settings.invoice_footer_note || 'Bukti pembayaran ini merupakan Kwitansi Pembayaran yang sah.'}
          </div>
          <div className="inv-v2-thanks" style={{ color: primary }}>
            {settings.invoice_thank_you || 'Terima kasih atas kepercayaan Anda.'}
          </div>
        </div>

        <div className="inv-v2-totals-box">
          <div className="inv-v2-total-row">
            <span>Subtotal</span>
            <b>{formatRupiah(invoice.subtotal)}</b>
          </div>
          {invoice.discount > 0 && (
            <div className="inv-v2-total-row">
              <span>Diskon</span>
              <b style={{ color: '#dc2626' }}>− {formatRupiah(invoice.discount)}</b>
            </div>
          )}
          {invoice.tax > 0 && (
            <div className="inv-v2-total-row">
              <span>Pajak</span>
              <b>{formatRupiah(invoice.tax)}</b>
            </div>
          )}
          <div className="inv-v2-grand" style={{ borderColor: primary }}>
            <span>TOTAL</span>
            <span style={{ color: primary }}>{formatRupiah(invoice.total)}</span>
          </div>
        </div>
      </div>

      {/* ============ FOOTER ============ */}
      <div className="inv-v2-footer">
        <div className="inv-v2-payment">
          <div className="inv-v2-payment-label">Instruksi Pembayaran</div>
          <div className="inv-v2-payment-bank">
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: primary }}>
              {settings.brand_bank_name || 'BCA'}
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '.04em', fontFamily: 'SF Mono, Consolas, monospace' }}>
              {settings.brand_bank_account || '1234567890'}
            </div>
            <div style={{ fontSize: '.82rem', color: '#64748b' }}>
              a/n {settings.brand_bank_holder || settings.site_name}
            </div>
          </div>
          {settings.contact_whatsapp && (
            <div style={{ marginTop: 12, fontSize: '.78rem', color: '#64748b' }}>
              Konfirmasi: <b style={{ color: '#0b1220' }}>{settings.contact_whatsapp}</b>
            </div>
          )}
        </div>

        <div className="inv-v2-stamp">
          {isPaid && (
            <div className="inv-v2-paid-stamp" style={{ borderColor: accent, color: accent }}>
              LUNAS
            </div>
          )}
          <div className="inv-v2-signature">
            <div style={{ fontSize: '.72rem', color: '#64748b', marginBottom: 8 }}>Hormat kami,</div>
            <div style={{ borderTop: '1.5px solid #0b1220', paddingTop: 8, fontWeight: 700, fontSize: '.86rem' }}>
              {settings.site_name}
            </div>
          </div>
        </div>
      </div>

      {/* ============ STRIP ============ */}
      <div className="inv-v2-strip" style={{ background: primary }}>
        <span>● {settings.invoice_strip_text || 'Transaksi Aman, Hati Tenang'}</span>
        <span>{invoice.invoice_number}</span>
      </div>

      {/* ============ PUBLIC URL ============ */}
      {publicUrl && (
        <div className="inv-v2-public-info no-print">
          <div className="inv-v2-public-label">Link publik kwitansi ini:</div>
          <div className="inv-v2-public-url">{publicUrl}</div>
        </div>
      )}
    </div>
  );
}