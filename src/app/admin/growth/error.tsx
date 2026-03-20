'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GrowthError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: '120px' }}>
      <div>
        <h2 style={{ fontSize: '1.75rem', color: 'var(--olive)', marginBottom: '16px' }}>
          Büyüme Panelinde Bir Hata Oluştu
        </h2>
        <p style={{ maxWidth: '500px', margin: '0 auto 32px', color: '#666', lineHeight: 1.7 }}>
          Lütfen tekrar deneyin veya ana sayfaya dönün.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button
            onClick={() => reset()}
            style={{
              padding: '12px 28px',
              backgroundColor: 'var(--olive)',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.95rem',
            }}
          >
            Tekrar Dene
          </button>
          <Link
            href="/"
            style={{
              padding: '12px 28px',
              backgroundColor: 'transparent',
              color: 'var(--gold)',
              border: '1px solid var(--gold)',
              borderRadius: '4px',
              textDecoration: 'none',
              fontSize: '0.95rem',
            }}
          >
            Ana Sayfa
          </Link>
        </div>
      </div>
    </main>
  )
}
