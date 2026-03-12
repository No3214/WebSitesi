import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

export default function PaymentPage() {
  return (
    <>
      <SiteHeader />
      <main className="section">
        <div className="container" style={{ maxWidth: "760px" }}>
          <div className="detail-box" style={{ textAlign: "center" }}>
            <div
              style={{
                margin: "0 auto 16px",
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#fff3cd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldAlert color="#856404" size={32} />
            </div>

            <h1 className="serif">Ödeme Sayfası Geçici Olarak Kapalı</h1>
            <p style={{ color: "#666", marginTop: 12 }}>
              Bu sayfada gerçek bir ödeme sağlayıcı entegrasyonu olmadığı için güvenlik ve hukuki uyumluluk
              gerekçesiyle doğrudan kartla ödeme akışını devre dışı bıraktık.
            </p>
            <p style={{ color: "#666", marginTop: 8 }}>
              Rezervasyon için lütfen HotelRunner üzerinden devam edin veya doğrudan WhatsApp hattımızdan
              bizimle iletişime geçin.
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 28 }}>
              <Link href="/#rezervasyon" className="button primary">
                REZERVASYONA GİT
              </Link>
              <Link href="https://wa.me/905322342686" className="button secondary">
                WHATSAPP İLE İLETİŞİM
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
