import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div className="container">
          <span className="eyebrow">404</span>
          <h1 className="serif" style={{ fontSize: '3.5rem', marginBottom: '24px' }}>Sayfa Bulunamadı</h1>
          <p style={{ maxWidth: '600px', margin: '0 auto 40px', color: '#666' }}>
            Aradığınız sayfa taşınmış veya silinmiş olabilir. Kozbeyli Konağı&apos;nın huzur dolu dünyasına ana sayfamızdan dönebilirsiniz.
          </p>
          <Link href="/" className="button primary">
            Ana Sayfaya Dön
          </Link>
        </div>
      </main>
    </>
  )
}
