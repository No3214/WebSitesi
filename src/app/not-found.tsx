import Link from "next/link";

import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main
        className="section"
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <div className="container">
          <span className="eyebrow">404</span>
          <h1 className="serif" style={{ fontSize: "3.5rem", marginBottom: 24 }}>
            Bu Patika Konağa Çıkmıyor
          </h1>
          <p
            style={{
              maxWidth: 620,
              margin: "0 auto 40px",
              color: "#666",
              lineHeight: 1.7,
            }}
          >
            Aradığınız sayfa taşınmış ya da hiç var olmamış olabilir. Kozbeyli&apos;nin taş
            sokaklarında kaybolmak hoştur; dilerseniz sizi yeniden konağın avlusuna uğurlayalım.
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Link href="/" className="button primary">
              Ana Sayfa
            </Link>
            <Link href="/odalar" className="button secondary">
              Odalar
            </Link>
            <Link href="/rezervasyon" className="button secondary">
              Rezervasyon
            </Link>
            <Link href="/iletisim" className="button secondary">
              İletişim
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
