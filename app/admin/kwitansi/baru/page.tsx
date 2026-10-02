import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import InvoiceForm from '@/components/InvoiceForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Buat Kwitansi' };

export default async function NewInvoicePage() {
  const supabase = createAdminClient();
  const { data: products } = await supabase.from('products').select('id, name, price').order('name');

  // Generate next invoice number
  const now = new Date();
  const prefix = `INV/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/`;
  const { data: last } = await supabase
    .from('invoices')
    .select('invoice_number')
    .like('invoice_number', prefix + '%')
    .order('invoice_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  let seq = 1;
  if (last) {
    const parts = last.invoice_number.split('/');
    seq = parseInt(parts[3] || '0', 10) + 1;
  }
  const nextNumber = prefix + String(seq).padStart(4, '0');

  return (
    <>
      <div className="admin-card-head">
        <h1 style={{ margin: 0 }}>Buat Kwitansi Baru</h1>
        <Link href="/admin/kwitansi" className="btn btn-ghost">← Kembali</Link>
      </div>
      <InvoiceForm
        initial={null}
        initialItems={[]}
        products={products || []}
        nextNumber={nextNumber}
      />
    </>
  );
}