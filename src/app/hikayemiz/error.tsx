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
    <main className="section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: '120px' }}>
      <div className="container">
        <span className="eyebrow">Hata</span>
        <h2 className="serif" style={{ fontSize: '2rem', marginBottom: '20px' }}>Sayfa yüklenirken bir sorun oluştu</h2>
        <p style={{ maxWidth: '500px', margin: '0 auto 32px', color: '#666', lineHeight: 1.7 }}>
          Lütfen sayfayı yenilemeyi deneyin veya ana sayfaya dönün.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button className="button primary" onClick={() => reset()}>Tekrar Dene</button>
          <Link href="/" className="button secondary">Ana Sayfa</Link>
        </div>
      </div>
    </main>
  )
}
