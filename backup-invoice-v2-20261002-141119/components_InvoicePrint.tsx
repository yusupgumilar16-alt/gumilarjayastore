import type { Invoice, InvoiceItem } from '@/lib/types';
import { formatRupiah, formatDate } from '@/lib/utils';

interface Props {
  invoice: Invoice;
  items: InvoiceItem[];
  settings: {
    site_name: string;
    contact_email: string;
    contact_whatsapp: string;
  };
}

export default function InvoicePrint({ invoice, items, settings }: Props) {
  const statusMap: Record<string, { label: string; cls: string }> = {
    draft: { label: 'Draft', cls: 'status-draft' },
    terkirim: { label: 'Terkirim', cls: 'status-pending' },
    dibayar: { label: 'Lunas', cls: 'status-paid' },
    batal: { label: 'Batal', cls: 'status-cancel' },
  };
  const status = statusMap[invoice.status] || statusMap.draft;

  return (
    <div className="invoice-print">
      {/* HEADER */}
      <div className="inv-header">
        <div>
          <div className="brand-row">
            <div className="brand-logo">GJ</div>
            <div>
              <div className="brand-name">{settings.site_name}</div>
              <div className="brand-tagline">Melayani dengan aman &amp; tenang</div>
            </div>
          </div>
          <div className="brand-contact">
            <div>Garut, Jawa Barat, Indonesia</div>
            {settings.contact_whatsapp && (
              <div><span>WhatsApp:</span> {settings.contact_whatsapp}</div>
            )}
            <div><span>Email:</span> {settings.contact_email}</div>
          </div>
        </div>

        <div className="inv-title-block">
          <div className="inv-label">Kwitansi Pembayaran</div>
          <div className="inv-number">{invoice.invoice_number}</div>
          <span className={`status-badge ${status.cls}`}>{status.label}</span>
        </div>
      </div>

      {/* META */}
      <div className="inv-meta">
        <div className="meta-block">
          <h4>Ditagihkan Kepada</h4>
          <p className="customer-name">{invoice.customer_name}</p>
          <p className="customer-detail">
            {invoice.customer_address && <>{invoice.customer_address}<br /></>}
            {invoice.customer_email && <>{invoice.customer_email}<br /></>}
            {invoice.customer_phone && <>{invoice.customer_phone}</>}
          </p>
        </div>

        <div className="meta-block">
          <h4>Informasi Kwitansi</h4>
          <div className="meta-row">
            <span className="label">Tanggal</span>
            <span className="value">{formatDate(invoice.invoice_date)}</span>
          </div>
          {invoice.due_date && (
            <div className="meta-row">
              <span className="label">Jatuh Tempo</span>
              <span className="value">{formatDate(invoice.due_date)}</span>
            </div>
          )}
          {invoice.payment_method && (
            <div className="meta-row">
              <span className="label">Metode</span>
              <span className="value">{invoice.payment_method}</span>
            </div>
          )}
        </div>

        <div className="meta-block">
          <h4>Pembayaran</h4>
          <div className="meta-row">
            <span className="label">Status</span>
            <span
              className="value"
              style={{ color: invoice.status === 'dibayar' ? '#059669' : '#0b1220' }}
            >
              {status.label}
            </span>
          </div>
          {invoice.status === 'dibayar' && (
            <div className="meta-row">
              <span className="label">Tanggal Bayar</span>
              <span className="value">{formatDate(invoice.updated_at || invoice.invoice_date)}</span>
            </div>
          )}
        </div>
      </div>

      {/* ITEMS */}
      <div className="inv-items">
        <table className="items-table">
          <thead>
            <tr>
              <th style={{ width: 44 }}>No</th>
              <th>Deskripsi</th>
              <th className="center" style={{ width: 60 }}>Qty</th>
              <th className="num" style={{ width: 130 }}>Harga</th>
              <th className="num" style={{ width: 140 }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={it.id}>
                <td>{i + 1}</td>
                <td>
                  <div className="item-name">{it.description}</div>
                </td>
                <td className="center">{it.qty}</td>
                <td className="num">{formatRupiah(it.unit_price).replace('Rp ', '')}</td>
                <td className="num">{formatRupiah(it.subtotal).replace('Rp ', '')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TOTALS */}
      <div className="inv-totals">
        <div className="inv-note">
          {invoice.notes ? (
            <>
              <strong>Catatan</strong>
              {invoice.notes}
            </>
          ) : (
            <>
              <strong>Catatan</strong>
              Bukti pembayaran ini merupakan Kwitansi Pembayaran yang sah.
            </>
          )}
          <div className="thanks">Terima kasih atas kepercayaan Anda.</div>
        </div>

        <div className="totals-table">
          <div className="totals-row">
            <span className="label">Subtotal</span>
            <span className="value">{formatRupiah(invoice.subtotal)}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="totals-row discount">
              <span className="label">Diskon</span>
              <span className="value">− {formatRupiah(invoice.discount)}</span>
            </div>
          )}
          {invoice.tax > 0 && (
            <div className="totals-row">
              <span className="label">Pajak</span>
              <span className="value">{formatRupiah(invoice.tax)}</span>
            </div>
          )}
          <div className="totals-row grand">
            <span className="label">Total</span>
            <span className="value">{formatRupiah(invoice.total)}</span>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="inv-footer">
        <div className="payment-info">
          <strong>Instruksi Pembayaran</strong>
          Transfer ke rekening berikut:<br />
          <b>BCA</b> — 1234567890<br />
          a/n {settings.site_name}
          {settings.contact_whatsapp && (
            <>
              <br />
              <span style={{ color: '#64748b', fontSize: '.78rem' }}>
                Konfirmasi ke WhatsApp: {settings.contact_whatsapp}
              </span>
            </>
          )}
        </div>

        <div className="stamp-block">
          {invoice.status === 'dibayar' && (
            <>
              <div className="paid-stamp">Lunas</div>
              <div className="stamp-date">
                Dibayar pada {formatDate(invoice.updated_at || invoice.invoice_date)}
              </div>
            </>
          )}
          <div className="signature">
            Hormat kami,
            <div className="signature-line">{settings.site_name}</div>
          </div>
        </div>
      </div>

      {/* STRIP */}
      <div className="inv-strip">
        <span><span className="dot">●</span>Transaksi Aman, Hati Tenang</span>
        <span>{invoice.invoice_number}</span>
      </div>
    </div>
  );
}