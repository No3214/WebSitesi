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
              <div style={{ padding: 20 }}>
                <h2 className="serif" style={{ marginBottom: 12, color: "#92400e" }}>Ödeme Simülasyonu / Demo</h2>
                <p style={{ color: "#92400e", fontSize: "0.95rem", lineHeight: 1.6 }}>
                  Bu sayfa <strong>yalnızca demonstrasyon</strong> amacıyla tasarlanmıştır. 
                  Bu arayüz üzerinden gerçek bir kart tahsilatı yapılmaz ve herhangi bir rezervasyon kaydı oluşmaz. 
                  Resmi rezervasyonunuzu tamamlamak için lütfen butik otelimizin ana rezervasyon motorunu kullanın.
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
