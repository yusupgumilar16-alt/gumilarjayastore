-- ============================================================
--  Tambah field settings baru untuk kwitansi modern
--  Jalankan di Supabase SQL Editor
-- ============================================================

insert into settings (key, value) values
  ('brand_logo_text', 'GJ'),
  ('brand_tagline', 'Melayani dengan aman & tenang'),
  ('brand_address', 'Garut, Jawa Barat, Indonesia'),
  ('brand_bank_name', 'BCA'),
  ('brand_bank_account', '1234567890'),
  ('brand_bank_holder', 'Gumilar Jaya Store'),
  ('invoice_footer_note', 'Bukti pembayaran ini merupakan Kwitansi Pembayaran yang sah.'),
  ('invoice_thank_you', 'Terima kasih atas kepercayaan Anda.'),
  ('invoice_strip_text', 'Transaksi Aman, Hati Tenang'),
  ('invoice_primary_color', '#2563eb'),
  ('invoice_accent_color', '#10b981')
on conflict (key) do nothing;