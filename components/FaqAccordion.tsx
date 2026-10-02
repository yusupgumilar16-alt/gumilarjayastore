'use client';

import { useState } from 'react';
import type { Faq } from '@/lib/types';

export default function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (!faqs || faqs.length === 0) {
    return <p style={{ textAlign: 'center', color: 'var(--muted)' }}>Belum ada FAQ.</p>;
  }

  return (
    <div className="faq">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <div key={faq.id} className={`acc ${isOpen ? 'open' : ''}`}>
            <button
              className="acc-q"
              onClick={() => setOpenId(isOpen ? null : faq.id)}
              aria-expanded={isOpen}
            >
              {faq.question}
              <span className="acc-icon">+</span>
            </button>
            <div
              className="acc-a"
              style={{ maxHeight: isOpen ? '500px' : 0 }}
            >
              <p>{faq.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}