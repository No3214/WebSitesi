"use client";

import { SiteHeader } from "@/components/site-header";
import { FadeIn } from "@/components/animations";

export default function PrivacyPolicyPage() {
  return (
    <>
      <SiteHeader />
      <main className="section pt-32 pb-20 bg-white">
        <div className="container max-w-4xl">
          <FadeIn>
            <h1 className="serif text-4xl mb-12">Gizlilik Politikası</h1>
            
            <div className="prose prose-zinc prose-sm leading-relaxed text-zinc-600 space-y-8">
              <section>
                <h2 className="text-zinc-900 font-bold mb-4">GİZLİLİK TAAHHÜDÜ</h2>
                <p>Kozbeyli Konağı olarak, misafirlerimizin gizliliğine saygı duyuyoruz. Web sitemizi ziyaretleriniz sırasında toplanan verilerin güvenliğini en üst düzeyde tutuyoruz.</p>
              </section>

              <section>
                <h2 className="text-zinc-900 font-bold mb-4">ÇEREZLER (COOKIES)</h2>
                <p>Sitemizde kullanıcı deneyimini iyileştirmek ve analiz yapmak amacıyla çerezler kullanılmaktadır. Tarayıcı ayarlarınızdan çerezleri yönetebilirsiniz.</p>
              </section>

              <section>
                <h2 className="text-zinc-900 font-bold mb-4">VERİ GÜVENLİĞİ</h2>
                <p>
                  Web sitemiz bugün kart numarası veya CVV gibi ödeme kartı verilerini istemez ve
                  saklamaz. Ödeme entegrasyonu devreye alındığında tahsilat, 3D Secure destekli
                  banka veya yetkili ödeme sağlayıcısı altyapısında tamamlanacak; kart verileri
                  Kozbeyli Konağı sunucularında tutulmayacaktır.
                </p>
              </section>
            </div>
          </FadeIn>
        </div>
      </main>
    </>
  );
}
