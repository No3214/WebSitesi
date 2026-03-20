import Link from 'next/link'
import Image from 'next/image'
import { SiteHeader } from '@/components/site-header'

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Image
            src="/images/rooms/deniz-3.jpeg"
            alt=""
            fill
            className="object-cover"
            style={{ filter: 'brightness(0.3)' }}
            sizes="100vw"
          />
        </div>
        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '120px 0' }}>
          <span style={{ fontFamily: 'var(--serif)', fontSize: '8rem', fontWeight: 300, color: 'var(--gold)', display: 'block', lineHeight: 1, marginBottom: '16px' }}>
            404
          </span>
          <h1 className="serif" style={{ fontSize: '2.5rem', color: 'white', marginBottom: '20px' }}>
            Sayfa Bulunamadı
          </h1>
          <p style={{ maxWidth: '500px', margin: '0 auto 40px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, fontSize: '1.05rem' }}>
            Aradığınız sayfa taşınmış veya silinmiş olabilir. Kozbeyli Konağı&apos;nın huzur dolu dünyasına geri dönün.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" className="button primary" style={{ background: 'var(--gold)', borderColor: 'var(--gold)' }}>
              Ana Sayfaya Dön
            </Link>
            <Link href="/odalar" className="button secondary" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>
              Odaları Keşfet
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
