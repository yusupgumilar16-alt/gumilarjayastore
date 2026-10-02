import type { Invoice, InvoiceItem } from '@/lib/types';
import { formatRupiah, formatDate } from '@/lib/utils';

interface Props {
  invoice: Invoice & { customer_id_display?: string };
  items: InvoiceItem[];
  settings: Record<string, string>;
  publicUrl?: string;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string; border: string; icon: string }> = {
    draft: { label: 'DRAFT', bg: '#f1f5f9', color: '#475569', border: '#cbd5e1', icon: '○' },
    terkirim: { label: 'TERKIRIM', bg: '#fef3c7', color: '#92400e', border: '#fcd34d', icon: '◐' },
    dibayar: { label: 'LUNAS', bg: '#d1fae5', color: '#065f46', border: '#34d399', icon: '●' },
    batal: { label: 'BATAL', bg: '#fee2e2', color: '#991b1b', border: '#f87171', icon: '×' },
  };
  const s = map[status] || map.draft;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '7px 14px', borderRadius: 99,
      fontSize: '.7rem', fontWeight: 700, letterSpacing: '.12em',
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      <span style={{ fontSize: '.8rem' }}>{s.icon}</span> {s.label}
    </span>
  );
}

export default function InvoicePrint({ invoice, items, settings, publicUrl }: Props) {
  const primary = settings.invoice_primary_color || '#2563eb';
  const accent = settings.invoice_accent_color || '#10b981';
  const isPaid = invoice.status === 'dibayar';

  return (
    <div className="invoice-v3">
      {/* ============ HEADER BAND ============ */}
      <div className="inv3-band" style={{ background: primary }}>
        <div className="inv3-band-left">
          <div className="inv3-logo">{settings.brand_logo_text || 'GJ'}</div>
          <div>
            <div className="inv3-brand">{settings.site_name}</div>
            <div className="inv3-tagline">{settings.brand_tagline || 'Melayani dengan aman & tenang'}</div>
          </div>
        </div>
        <div className="inv3-band-right">
          <div className="inv3-band-label">KWITANSI</div>
          <div className="inv3-band-number">{invoice.invoice_number}</div>
        </div>
      </div>

      {/* ============ TOP META ============ */}
      <div className="inv3-top">
        {/* LEFT: customer */}
        <div className="inv3-customer">
          <div className="inv3-section-label">Ditagihkan Kepada</div>
          <div className="inv3-customer-name">{invoice.customer_name}</div>
          {invoice.customer_id_display && (
            <div className="inv3-customer-code">Kode: {invoice.customer_id_display}</div>
          )}
          <div className="inv3-customer-detail">
            {invoice.customer_address && <div>{invoice.customer_address}</div>}
            {invoice.customer_email && <div>{invoice.customer_email}</div>}
            {invoice.customer_phone && <div>{invoice.customer_phone}</div>}
          </div>
        </div>

        {/* RIGHT: dates */}
        <div className="inv3-dates">
          <div className="inv3-date-row">
            <span>Tanggal</span>
            <b>{formatDate(invoice.invoice_date)}</b>
          </div>
          {invoice.due_date && (
            <div className="inv3-date-row">
              <span>Jatuh Tempo</span>
              <b>{formatDate(invoice.due_date)}</b>
            </div>
          )}
          {invoice.payment_method && (
            <div className="inv3-date-row">
              <span>Metode</span>
              <b>{invoice.payment_method}</b>
            </div>
          )}
          <div className="inv3-status-wrap">
            <StatusBadge status={invoice.status} />
          </div>
        </div>
      </div>

      {/* ============ STATUS HIGHLIGHT ============ */}
      <div className="inv3-status-bar" style={{
        background: isPaid ? '#f0fdf4' : invoice.status === 'batal' ? '#fef2f2' : '#fffbeb',
        borderColor: isPaid ? '#86efac' : invoice.status === 'batal' ? '#fca5a5' : '#fcd34d',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            fontSize: '1.6rem',
            color: isPaid ? '#059669' : invoice.status === 'batal' ? '#dc2626' : '#d97706',
          }}>
            {isPaid ? '✓' : invoice.status === 'batal' ? '×' : '!'}
          </span>
          <div>
            <div style={{
              fontSize: '1.1rem',
              fontWeight: 800,
              color: isPaid ? '#059669' : invoice.status === 'batal' ? '#dc2626' : '#d97706',
              letterSpacing: '-.01em',
            }}>
              {isPaid ? 'LUNAS' : invoice.status === 'batal' ? 'DIBATALKAN' : 'BELUM DIBAYAR'}
            </div>
            {isPaid && (
              <div style={{ fontSize: '.78rem', color: '#047857', marginTop: 2 }}>
                Dibayar pada {formatDate(invoice.updated_at || invoice.invoice_date)}
              </div>
            )}
            {!isPaid && invoice.status !== 'batal' && (
              <div style={{ fontSize: '.78rem', color: '#92400e', marginTop: 2 }}>
                Menunggu pembayaran
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============ ITEMS ============ */}
      <div className="inv3-items">
        <table className="inv3-table">
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
                <td style={{ color: '#94a3b8', fontWeight: 700, fontFamily: 'SF Mono, Consolas, monospace' }}>
                  {String(i + 1).padStart(2, '0')}
                </td>
                <td><div className="inv3-item-name">{it.description}</div></td>
                <td style={{ textAlign: 'center', fontWeight: 600 }}>{it.qty}</td>
                <td className="inv3-num">{formatRupiah(it.unit_price).replace('Rp ', '')}</td>
                <td className="inv3-num inv3-num-bold">{formatRupiah(it.subtotal).replace('Rp ', '')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ============ TOTALS + NOTES ============ */}
      <div className="inv3-bottom">
        <div className="inv3-notes">
          <div className="inv3-section-label">Catatan</div>
          <div className="inv3-notes-text">
            {invoice.notes || settings.invoice_footer_note || 'Bukti pembayaran ini merupakan Kwitansi Pembayaran yang sah.'}
          </div>
          <div className="inv3-thanks" style={{ color: primary }}>
            {settings.invoice_thank_you || 'Terima kasih atas kepercayaan Anda.'}
          </div>
        </div>

        <div className="inv3-totals">
          <div className="inv3-total-row">
            <span>Subtotal</span>
            <b>{formatRupiah(invoice.subtotal)}</b>
          </div>
          {invoice.discount > 0 && (
            <div className="inv3-total-row">
              <span>Diskon</span>
              <b style={{ color: '#dc2626' }}>− {formatRupiah(invoice.discount)}</b>
            </div>
          )}
          {invoice.tax > 0 && (
            <div className="inv3-total-row">
              <span>Pajak</span>
              <b>{formatRupiah(invoice.tax)}</b>
            </div>
          )}
          <div className="inv3-grand" style={{ borderColor: primary }}>
            <span>TOTAL</span>
            <span style={{ color: primary }}>{formatRupiah(invoice.total)}</span>
          </div>
        </div>
      </div>

      {/* ============ PAYMENT + STAMP ============ */}
      <div className="inv3-footer">
        <div className="inv3-payment">
          <div className="inv3-section-label">Instruksi Pembayaran</div>
          <div className="inv3-bank-box">
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: primary }}>
              {settings.brand_bank_name || 'BCA'}
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '.06em', fontFamily: 'SF Mono, Consolas, monospace', color: '#0b1220' }}>
              {settings.brand_bank_account || '1234567890'}
            </div>
            <div style={{ fontSize: '.82rem', color: '#64748b', marginTop: 4 }}>
              a/n {settings.brand_bank_holder || settings.site_name}
            </div>
          </div>
          {settings.contact_whatsapp && (
            <div style={{ marginTop: 12, fontSize: '.8rem', color: '#64748b' }}>
              Konfirmasi ke <b style={{ color: '#0b1220' }}>{settings.contact_whatsapp}</b>
            </div>
          )}
        </div>

        <div className="inv3-stamp-col">
          {isPaid && (
            <div className="inv3-stamp" style={{ borderColor: accent, color: accent }}>
              LUNAS
            </div>
          )}
          <div className="inv3-signature">
            <div style={{ fontSize: '.72rem', color: '#64748b', marginBottom: 8 }}>Hormat kami,</div>
            <div style={{ borderTop: '1.5px solid #0b1220', paddingTop: 8, fontWeight: 700, fontSize: '.88rem' }}>
              {settings.site_name}
            </div>
          </div>
        </div>
      </div>

      {/* ============ FOOTER STRIP ============ */}
      <div className="inv3-strip">
        <span>● {settings.invoice_strip_text || 'Transaksi Aman, Hati Tenang'}</span>
        <span>{settings.contact_email || 'halo@gumilarjaya.store'}</span>
      </div>

      {/* ============ PUBLIC URL ============ */}
      {publicUrl && (
        <div className="inv3-public no-print">
          <div className="inv3-public-label">Link publik kwitansi ini:</div>
          <div className="inv3-public-url">{publicUrl}</div>
        </div>
      )}
    </div>
  );
}