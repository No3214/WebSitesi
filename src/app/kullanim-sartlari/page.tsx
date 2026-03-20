import { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Kullanım Şartları",
  description: "Kozbeyli Konağı web sitesi kullanım şartları ve koşulları.",
  alternates: { canonical: "/kullanim-sartlari" },
};

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="section" style={{ paddingTop: "120px" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          <span className="eyebrow">YASAL</span>
          <h1 className="serif" style={{ fontSize: "2.5rem", marginBottom: "40px", color: "var(--olive)" }}>Kullanım Şartları</h1>

          <div className="serif-text">
            <p style={{ lineHeight: 1.8, color: "#555", marginBottom: "24px" }}>
              <strong>Son güncelleme:</strong> 01.03.2026
            </p>

            <h3>1. Genel Bilgi</h3>
            <p>Bu web sitesi, Kozbeyli Konağı Taş Otel & Restaurant tarafından işletilmektedir. Siteyi kullanarak aşağıdaki şartları kabul etmiş sayılırsınız.</p>

            <h3>2. Hizmet Tanımı</h3>
            <p>Web sitemiz, otel tanıtımı, oda bilgileri, restoran menüsü, etkinlik duyuruları ve online rezervasyon hizmetleri sunmaktadır.</p>

            <h3>3. Fikri Mülkiyet</h3>
            <p>Sitedeki tüm içerikler (metin, görsel, logo, tasarım) Kozbeyli Konağı&apos;na aittir. İzinsiz kopyalama, dağıtma veya ticari kullanım yasaktır.</p>

            <h3>4. Rezervasyon Koşulları</h3>
            <ul>
              <li>Rezervasyonlar, onay e-postası gönderildikten sonra kesinleşir.</li>
              <li>48 saat öncesine kadar ücretsiz iptal yapılabilir.</li>
              <li>48 saat içinde yapılan iptallerde ilk gece ücreti tahsil edilir.</li>
              <li>No-show durumunda tam tutar tahsil edilir.</li>
            </ul>

            <h3>5. Fiyatlandırma</h3>
            <p>Fiyatlar vergiler dahil olup, mevsime ve oda tipine göre değişiklik gösterebilir. Web sitemizdeki direkt rezervasyonlarda en iyi fiyat garantisi sunulmaktadır.</p>

            <h3>6. Sorumluluk Sınırlaması</h3>
            <p>Teknik aksaklıklar, mücbir sebepler veya üçüncü taraf hizmet kesintilerinden kaynaklanan sorunlardan dolayı sorumluluk kabul edilmez.</p>

            <h3>7. Kişisel Verilerin Korunması</h3>
            <p>Kişisel verileriniz, KVKK (6698 sayılı Kanun) kapsamında korunmaktadır. Detaylı bilgi için <a href="/kvkk" style={{ color: "var(--gold)" }}>KVKK Aydınlatma Metni</a> sayfamızı ziyaret ediniz.</p>

            <h3>8. Değişiklikler</h3>
            <p>Bu şartlar önceden bildirim yapılmaksızın güncellenebilir. Güncel versiyonlar bu sayfada yayımlanır.</p>

            <h3>9. İletişim</h3>
            <p>Sorularınız için <a href="mailto:info@kozbeylikonagi.com" style={{ color: "var(--gold)" }}>info@kozbeylikonagi.com</a> adresine ulaşabilirsiniz.</p>
          </div>
        </div>
      </main>
    </>
  );
}
