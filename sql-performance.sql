-- ============================================================
--  Performance Indexes — V5
--  Jalankan di Supabase SQL Editor
-- ============================================================

-- Index untuk query cepat
create index if not exists idx_invoices_invoice_date on invoices(invoice_date desc);
create index if not exists idx_invoices_created_at on invoices(created_at desc);
create index if not exists idx_invoices_customer_id on invoices(customer_id);
create index if not exists idx_invoices_status on invoices(status);
create index if not exists idx_invoices_category on invoices(category);

create index if not exists idx_invoice_items_invoice_id on invoice_items(invoice_id);

create index if not exists idx_products_created_at on products(created_at desc);
create index if not exists idx_products_featured on products(is_featured);
create index if not exists idx_products_new on products(is_new);
create index if not exists idx_products_type on products(type);
create index if not exists idx_products_category on products(category_id);

create index if not exists idx_customers_created_at on customers(created_at desc);
create index if not exists idx_customers_archived on customers(is_archived) where is_archived = false;
create index if not exists idx_customer_ids_number on customer_ids(id_number);
create index if not exists idx_customer_ids_customer on customer_ids(customer_id);

create index if not exists idx_subscribers_created_at on subscribers(created_at desc);
create index if not exists idx_testimonials_sort on testimonials(sort_order);
create index if not exists idx_faqs_sort on faqs(sort_order);

-- Analyze tables untuk query planner yang lebih baik
analyze invoices;
analyze invoice_items;
analyze customers;
analyze customer_ids;
analyze products;