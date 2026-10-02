import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import InvoiceForm from '@/components/InvoiceForm';
import type { Invoice, InvoiceItem, Customer } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function EditInvoicePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createAdminClient();
  const { data: invoice } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();
  if (!invoice) notFound();

  const [{ data: items }, { data: products }] = await Promise.all([
    supabase.from('invoice_items').select('*').eq('invoice_id', invoice.id).order('id'),
    supabase.from('products').select('id, name, price').order('name'),
  ]);

  // Ambil pelanggan kalau kwitansi ini terkait dengan pelanggan
  let initialCustomer: Customer | null = null;
  if ((invoice as any).customer_id) {
    const { data: c } = await supabase
      .from('customers')
      .select('*, customer_ids(*)')
      .eq('id', (invoice as any).customer_id)
      .maybeSingle();
    initialCustomer = (c as Customer) || null;
  }

  return (
    <>
      <div className="admin-card-head">
        <h1 style={{ margin: 0 }}>Edit Kwitansi {invoice.invoice_number}</h1>
        <Link href={`/admin/kwitansi/${invoice.id}`} className="btn btn-ghost">← Kembali</Link>
      </div>
      <InvoiceForm
        initial={invoice as Invoice}
        initialItems={(items || []) as InvoiceItem[]}
        products={products || []}
        initialCustomer={initialCustomer}
      />
    </>
  );
}