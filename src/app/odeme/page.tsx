import Link from "next/link";
import { CheckCircle2, CreditCard, FileCheck2, ShieldCheck } from "lucide-react";

import { SiteHeader } from "@/components/site-header";

const paymentSteps = [
  {
    title: "Ön-rezervasyon talebi",
    body: "Tarih, oda, kişi sayısı ve iletişim bilgileriniz alınır; bu adımda kart numarası veya CVV istenmez.",
  },
  {
    title: "Yazılı ekip teyidi",
    body: "Müsaitlik, güncel tutar, iptal/değişiklik koşulları ve ödeme tipi ekip tarafından yazılı olarak netleştirilir.",
  },
  {
    title: "Güvenli ödeme kanalı",
    body: "Tahsilat yalnızca onaylı ödeme kanalı üzerinden ve Garanti BBVA Sanal POS 3D Secure akışı hazır olduğunda tamamlanır.",
  },
];

export default function PaymentPage() {
  return (
    <>
      <SiteHeader />
      <main className="section" style={{ paddingTop: 150 }}>
        <div className="container" style={{ maxWidth: 940 }}>
          <div className="detail-box" style={{ display: "grid", gap: 28 }}>
            <div
              style={{
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
                padding: 22,
                borderRadius: 12,
                background: "rgba(61, 74, 59, 0.06)",
                border: "1px solid var(--border)",
              }}
            >
              <ShieldCheck size={24} style={{ color: "var(--olive)", flex: "none", marginTop: 4 }} />
              <div>
                <p style={{ margin: "0 0 8px", color: "var(--gold)", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", fontSize: "0.72rem" }}>
                  Kart verisi bu sitede alınmaz
                </p>
                <h1 className="serif" style={{ margin: "0 0 12px", color: "var(--olive)", fontSize: "2.25rem" }}>
                  Güvenli Ödeme Bilgilendirmesi
                </h1>
                <p style={{ color: "var(--muted)", fontSize: "1rem", lineHeight: 1.75, margin: 0 }}>
                  Kozbeyli Konağı web sitesi ön-rezervasyon ve teyit sürecini başlatır. Kart numarası, CVV veya banka
                  şifresi bu sitede istenmez; tahsilat yalnızca yazılı teyit sonrası güvenli ödeme kanalı üzerinden
                  tamamlanır.
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
              {paymentSteps.map((step, index) => (
                <section
                  key={step.title}
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    padding: 18,
                    background: "var(--white)",
                    display: "grid",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--olive)", fontWeight: 800 }}>
                    {index === 0 && <FileCheck2 size={18} aria-hidden />}
                    {index === 1 && <CheckCircle2 size={18} aria-hidden />}
                    {index === 2 && <CreditCard size={18} aria-hidden />}
                    <span>{index + 1}. {step.title}</span>
                  </div>
                  <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.92rem", lineHeight: 1.65 }}>{step.body}</p>
                </section>
              ))}
            </div>

            <div
              style={{
                borderTop: "1px solid var(--border)",
                paddingTop: 22,
                display: "grid",
                gap: 14,
              }}
            >
              <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
                Garanti BBVA Sanal POS üretim bilgileri ve redakte edilmiş ödeme UAT kanıtı tamamlanmadan bu sayfa
                ödeme başlatmaz. Rezervasyonunuz için en doğru adım, talebinizi iletmek ve ekibimizin yazılı teyidini
                beklemektir.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <Link href="/rezervasyon" className="button primary">Ön-Rezervasyon Talebi Oluştur</Link>
                <Link href="/iletisim" className="button secondary">Ekiple İletişime Geç</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
