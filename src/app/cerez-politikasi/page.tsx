import { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";
import { FadeIn } from "@/components/animations";

export const metadata: Metadata = {
  title: "Çerez Politikası",
  description:
    "Kozbeyli Konağı web sitesinde kullanılan çerez kategorileri, amaçları, saklama süreleri ve rıza tercihlerinizi yönetme yöntemleri.",
  alternates: { canonical: "/cerez-politikasi" },
  robots: { index: true, follow: true },
};

// Not: Bu metin teknik gerçeklikle (consent.ts + tracking-scripts.tsx +
// analytics-provider.tsx) birebir uyumlu tutulmalıdır. Yayın öncesi hukuk
// danışmanı onayından geçirilmelidir.
export default function CookiePolicyPage() {
  return (
    <>
      <SiteHeader />
      <main className="section pt-32 pb-20 bg-white">
        <div className="container max-w-4xl">
          <FadeIn>
            <h1 className="serif text-4xl mb-12">Çerez Politikası</h1>

            <div className="prose prose-zinc prose-sm sm:prose-base leading-relaxed text-zinc-600 space-y-8">
              <section>
                <h2 className="text-zinc-900 font-bold mb-4">1. ÇEREZ NEDİR?</h2>
                <p>
                  Çerezler, web sitemizi ziyaret ettiğinizde tarayıcınıza kaydedilen küçük metin
                  dosyalarıdır. Kozbeyli Konağı olarak çerezleri; sitenin çalışması, tercihinize
                  bağlı olarak ziyaret istatistiklerinin ölçülmesi ve yine tercihinize bağlı
                  pazarlama amaçlarıyla kullanırız.
                </p>
              </section>

              <section>
                <h2 className="text-zinc-900 font-bold mb-4">2. KULLANDIĞIMIZ ÇEREZ KATEGORİLERİ</h2>
                <p>
                  Zorunlu olmayan hiçbir çerez, siz açık rıza vermeden yüklenmez. Rıza
                  tercihleriniz tarayıcınızda sürüm bilgisiyle birlikte saklanır ve dilediğiniz
                  an değiştirilebilir.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 text-zinc-900">
                        <th className="py-3 pr-4">Kategori</th>
                        <th className="py-3 pr-4">Amaç</th>
                        <th className="py-3 pr-4">Örnekler</th>
                        <th className="py-3">Rıza</th>
                      </tr>
                    </thead>
                    <tbody className="align-top">
                      <tr className="border-b border-zinc-100">
                        <td className="py-3 pr-4 font-semibold text-zinc-900">Zorunlu</td>
                        <td className="py-3 pr-4">
                          Sitenin temel çalışması: dil tercihi, çerez rızası kaydı, güvenlik
                          (bot koruması) doğrulaması.
                        </td>
                        <td className="py-3 pr-4">NEXT_LOCALE, cookie_consent_v2, Cloudflare Turnstile</td>
                        <td className="py-3">Gerekmez</td>
                      </tr>
                      <tr className="border-b border-zinc-100">
                        <td className="py-3 pr-4 font-semibold text-zinc-900">Analitik</td>
                        <td className="py-3 pr-4">
                          Ziyaret, dönüşüm ve gerçek kullanıcı site performansı istatistikleri;
                          site deneyimini iyileştirme.
                        </td>
                        <td className="py-3 pr-4">
                          Google Tag Manager / Google Analytics 4, PostHog
                        </td>
                        <td className="py-3">Açık rıza</td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-4 font-semibold text-zinc-900">Pazarlama</td>
                        <td className="py-3 pr-4">
                          Reklam performans ölçümü ve yeniden pazarlama.
                        </td>
                        <td className="py-3 pr-4">Meta (Facebook) Pixel</td>
                        <td className="py-3">Açık rıza</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h2 className="text-zinc-900 font-bold mb-4">3. HİZMET SAĞLAYICILAR</h2>
                <p>
                  Sitenin işletilmesi kapsamında çalıştığımız başlıca hizmet sağlayıcılar:
                  barındırma ve içerik dağıtımı (hosting/CDN), rezervasyon altyapısı (otel
                  yönetim sistemi ve booking engine), ödeme altyapısı (Garanti BBVA Sanal POS),
                  ölçümleme ve site performansı analizi (Google ve PostHog), pazarlama (Meta) ve
                  güvenlik (Cloudflare Turnstile). Güncel ve eksiksiz liste, veri işleme
                  sözleşmeleriyle birlikte talep üzerine paylaşılır.
                </p>
              </section>

              <section>
                <h2 className="text-zinc-900 font-bold mb-4">4. TERCİHLERİNİZİ YÖNETME</h2>
                <p>
                  Çerez tercihlerinizi sitede ilk ziyaretinizde görünen çerez bandı üzerinden
                  belirleyebilirsiniz. Daha sonra fikriniz değişirse tarayıcınızın site verileri
                  bölümünden kaydı silerek bandı yeniden görüntüleyebilir veya tarayıcı
                  ayarlarınızdan çerezleri toplu olarak yönetebilirsiniz. Zorunlu olmayan
                  çerezleri reddetmeniz, sitenin temel işlevlerini etkilemez.
                </p>
              </section>

              <section>
                <h2 className="text-zinc-900 font-bold mb-4">5. KİŞİSEL VERİLER</h2>
                <p>
                  Çerezler aracılığıyla işlenen kişisel verileriniz hakkında ayrıntılı bilgi
                  için <a href="/kvkk">KVKK Aydınlatma Metni</a> ve{" "}
                  <a href="/gizlilik-politikasi">Gizlilik Politikası</a> sayfalarını
                  inceleyebilirsiniz. Sorularınız için info@kozbeylikonagi.com adresine
                  yazabilirsiniz.
                </p>
              </section>
            </div>
          </FadeIn>
        </div>
      </main>
    </>
  );
}
