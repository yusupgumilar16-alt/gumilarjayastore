export type ProductType = 'digital' | 'fisik';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  type: ProductType;
  price: number;
  discount_price: number | null;
  description: string;
  image: string | null;
  images: string[];
  stock: number;
  sold: number;
  rating: number;
  download_url: string | null;
  is_featured: boolean;
  is_new: boolean;
  created_at: string;
  updated_at: string;
  // optional join
  category_name?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  city: string;
  product_type: string;
  content: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Setting {
  key: string;
  value: string;
  updated_at: string;
}

export interface Subscriber {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

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
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id: string | null;
  description: string;
  qty: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  items: any[];
  subtotal: number;
  discount: number;
  total: number;
  status: string;
  payment_method: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface SettingsMap {
  [key: string]: string;
}