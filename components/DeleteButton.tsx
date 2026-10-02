'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteButton({
  url,
  label = 'Hapus',
  confirmMessage = 'Yakin ingin menghapus?',
}: {
  url: string;
  label?: string;
  confirmMessage?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(confirmMessage)) return;
    setLoading(true);
    try {
      const res = await fetch(url, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus');
      router.refresh();
    } catch (err) {
      alert('Gagal menghapus. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="btn btn-danger btn-icon"
      disabled={loading}
      style={{ marginLeft: 6 }}
    >
      {loading ? '…' : label}
    </button>
  );
}
