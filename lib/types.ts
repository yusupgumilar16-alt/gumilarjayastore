export interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  invoice_date: string;
  due_date: string | null;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: 'draft' | 'terkirim' | 'dibayar' | 'batal';
  payment_method: string;
  notes: string;
  public_token: string;
  // V4 - import fields
  external_ref?: string;
  category?: string;
  token_number?: string;
  penalty?: number;
  admin_fee?: number;
  payment_time?: string;
  period?: string;
  import_batch?: string;
  imported_at?: string;
  // V3 - customer relation
  customer_id?: string;
  customer_id_display?: string;
  created_at: string;
  updated_at: string;
}