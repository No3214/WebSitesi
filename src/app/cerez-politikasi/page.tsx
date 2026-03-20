import { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Çerez Politikası",
  description: "Kozbeyli Konağı web sitesi çerez (cookie) kullanım politikası.",
  alternates: { canonical: "/cerez-politikasi" },
};

export default function CookiePolicyPage() {
  return (
    <>
      <SiteHeader />
      <main className="section" style={{ paddingTop: "120px" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          <span className="eyebrow">YASAL</span>
          <h1 className="serif" style={{ fontSize: "2.5rem", marginBottom: "40px", color: "var(--olive)" }}>Çerez Politikası</h1>

          <div className="serif-text">
            <p style={{ lineHeight: 1.8, color: "#555", marginBottom: "24px" }}>
              <strong>Son güncelleme:</strong> 01.03.2026
            </p>

            <h3>1. Çerez Nedir?</h3>
            <p>Çerezler (cookies), web sitemizi ziyaret ettiğinizde tarayıcınıza yerleştirilen küçük metin dosyalarıdır. Bu dosyalar, tercihlerinizi hatırlamamıza ve site deneyiminizi iyileştirmemize yardımcı olur.</p>

            <h3>2. Kullandığımız Çerez Türleri</h3>
            <ul>
              <li><strong>Zorunlu Çerezler:</strong> Sitenin temel işlevleri için gerekli çerezlerdir. Bunlar olmadan site düzgün çalışmaz.</li>
              <li><strong>Analitik Çerezler:</strong> Ziyaretçi sayısı ve trafik kaynakları gibi bilgileri toplar (PostHog, Google Analytics). Kişisel bilgileriniz anonimleştirilir.</li>
              <li><strong>Pazarlama Çerezleri:</strong> Size daha ilgili reklamlar göstermek için kullanılır (Meta Pixel). Rıza olmadan etkinleştirilmez.</li>
              <li><strong>Güvenlik Çerezleri:</strong> Cloudflare Turnstile CAPTCHA için gerekli güvenlik çerezleri.</li>
            </ul>

            <h3>3. Çerez Onayı</h3>
            <p>İlk ziyaretinizde çerez tercih bannerı ile karşılaşırsınız. Zorunlu çerezler dışındaki tüm çerezler, açık onayınız olmadan kullanılmaz. Tercihlerinizi istediğiniz zaman güncelleyebilirsiniz.</p>

            <h3>4. Üçüncü Taraf Çerezleri</h3>
            <ul>
              <li><strong>Google Analytics:</strong> Site kullanımını analiz eder</li>
              <li><strong>PostHog:</strong> Kullanıcı deneyimini iyileştirir</li>
              <li><strong>Meta (Facebook) Pixel:</strong> Reklam etkinliğini ölçer</li>
              <li><strong>Cloudflare:</strong> Güvenlik ve performans</li>
              <li><strong>HotelRunner:</strong> Rezervasyon widget&apos;ı</li>
            </ul>

            <h3>5. Çerezleri Nasıl Kontrol Edebilirsiniz?</h3>
            <p>Tarayıcı ayarlarınızdan çerezleri silebilir veya engelleyebilirsiniz. Ancak bazı çerezleri devre dışı bırakmak, sitenin düzgün çalışmamasına neden olabilir.</p>

            <h3>6. İletişim</h3>
            <p>Çerez politikamız hakkında sorularınız için <a href="mailto:info@kozbeylikonagi.com" style={{ color: "var(--gold)" }}>info@kozbeylikonagi.com</a> adresine ulaşabilirsiniz.</p>
          </div>
        </div>
      </main>
    </>
  );
}
