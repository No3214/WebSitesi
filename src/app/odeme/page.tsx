import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function PaymentPage() {
  return (
    <>
      <SiteHeader />
      <main className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <div className="detail-box" style={{ display: "grid", gap: 24 }}>
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                padding: 16,
                borderRadius: 12,
                background: "#fff6e5",
                border: "1px solid #f3d08b",
              }}
            >
              <AlertTriangle size={20} />
              <div>
                <h2 className="serif" style={{ marginBottom: 8 }}>Canlı ödeme kapalı</h2>
                <p>
                  Bu sayfa şu anda yalnızca test/demonstrasyon amacıyla tutulmaktadır. Gerçek kart tahsilatı yapılmaz,
                  3D Secure akışı çalışmaz ve bu ekran üzerinden rezervasyon onayı oluşmaz.
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              <p>
                Rezervasyonunuzu tamamlamak için lütfen resmi rezervasyon akışını veya WhatsApp teyidini kullanın.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link href="/rezervasyon" className="button primary">Rezervasyona Git</Link>
                <Link href="/iletisim" className="button secondary">İletişim</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
