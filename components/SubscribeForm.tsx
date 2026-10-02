'use client';

import { useState } from 'react';

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(data.message || 'Terima kasih!');
      if (data.ok) setEmail('');
    } catch {
      setMessage('Gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form className="cta-form" onSubmit={handleSubmit}>
        <input
          type="email"
          required
          placeholder="Masukkan email Anda"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Mengirim…' : 'Daftar'}
        </button>
      </form>
      {message && (
        <p style={{ marginTop: 14, fontSize: '.88rem', color: 'rgba(255,255,255,.9)' }}>
          {message}
        </p>
      )}
    </div>
  );
}