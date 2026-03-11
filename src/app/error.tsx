'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
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
    <main className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div className="container">
        <span className="eyebrow">Hata</span>
        <h1 className="serif" style={{ fontSize: '3rem', marginBottom: '24px' }}>Bir Şeyler Yanlış Gitti</h1>
        <p style={{ maxWidth: '600px', margin: '0 auto 40px', color: '#666' }}>
          Şu anda isteğinizi gerçekleştiremiyoruz. Lütfen sayfayı yenilemeyi deneyin veya ana sayfaya dönün.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button className="button primary" onClick={() => reset()}>
            Tekrar Dene
          </button>
          <Link href="/" className="button secondary">
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </main>
  )
}
