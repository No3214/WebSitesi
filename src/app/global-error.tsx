'use client';

import Link from 'next/link';
import { useEffect } from 'react';

/**
 * Root layout'un kendisinde (provider/script/font yüklenmesi vb.) oluşan
 * hataları YALNIZCA global-error yakalar — `app/error.tsx` layout'un içinde
 * render olduğu için layout hatalarını kapsamaz. Bu sınır root layout'u
 * (ve dolayısıyla globals.css'i) bypass ettiğinden kendi <html>/<body>'sini
 * ve tüm kritik stillerini inline taşır; harici CSS'e güvenmez.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Sunucu/observability tarafında ayrıca loglanır; burada sessiz tutuyoruz.
    console.error('global_error_boundary', error?.digest ?? '');
  }, [error]);

  return (
    <html lang="tr">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
          backgroundColor: '#f7f4ee',
          color: '#2b2b2b',
          fontFamily:
            "ui-serif, Georgia, 'Times New Roman', serif",
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        <main style={{ maxWidth: '560px' }}>
          <p
            style={{
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              fontSize: '0.72rem',
              color: '#7a7256',
              marginBottom: '14px',
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
            }}
          >
            Kozbeyli Konağı
          </p>
          <h1 style={{ fontSize: '2.4rem', lineHeight: 1.2, margin: '0 0 18px' }}>
            Beklenmeyen Bir Hata Oluştu
          </h1>
          <p
            style={{
              margin: '0 auto 32px',
              maxWidth: '440px',
              color: '#5d5749',
              fontSize: '1.02rem',
              lineHeight: 1.6,
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
            }}
          >
            Sayfayı şu anda gösteremiyoruz. Lütfen tekrar deneyin; sorun devam
            ederse bizimle telefon veya WhatsApp üzerinden iletişime
            geçebilirsiniz.
          </p>
          <div
            style={{
              display: 'flex',
              gap: '14px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={() => reset()}
              style={{
                cursor: 'pointer',
                border: 'none',
                padding: '14px 28px',
                borderRadius: '2px',
                backgroundColor: '#5c6b4c',
                color: '#f7f4ee',
                fontSize: '0.82rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontFamily: "ui-sans-serif, system-ui, sans-serif",
              }}
            >
              Tekrar Dene
            </button>
            <Link
              href="/"
              style={{
                padding: '14px 28px',
                borderRadius: '2px',
                border: '1px solid #5c6b4c',
                color: '#5c6b4c',
                textDecoration: 'none',
                fontSize: '0.82rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontFamily: "ui-sans-serif, system-ui, sans-serif",
              }}
            >
              Ana Sayfa
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
