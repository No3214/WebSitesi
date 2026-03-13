"use client";

import { SiteHeader } from "@/components/site-header";
import { FadeIn } from "@/components/animations";

export default function KVKKPage() {
  return (
    <>
      <SiteHeader />
      <main className="section pt-32 pb-20 bg-white">
        <div className="container max-w-4xl">
          <FadeIn>
            <h1 className="serif text-4xl mb-12">KVKK Aydınlatma Metni</h1>
            
            <div className="prose prose-zinc prose-sm sm:prose-base leading-relaxed text-zinc-600 space-y-8">
              <section>
                <h2 className="text-zinc-900 font-bold mb-4">1. VERİ SORUMLUSU</h2>
                <p>
                  6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, kişisel verileriniz; veri sorumlusu sıfatıyla Kozbeyli Konağı Butik Otel ve Restoran (“İşletme”) tarafından aşağıda açıklanan kapsamda işlenebilecektir.
                </p>
              </section>

              <section>
                <h2 className="text-zinc-900 font-bold mb-4">2. KİŞİSEL VERİLERİN İŞLENME AMACI</h2>
                <p>Toplanan kişisel verileriniz, aşağıdaki amaçlarla işlenmektedir:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Konaklama hizmetlerinin sunulması ve rezervasyon süreçlerinin yönetilmesi.</li>
                  <li>Kimlik Bildirme Kanunu kapsamındaki yasal yükümlülüklerin yerine getirilmesi.</li>
                  <li>Misafir memnuniyetinin ölçülmesi ve hizmet kalitesinin artırılması.</li>
                  <li>Güvenlik kameraları aracılığıyla tesis güvenliğinin sağlanması.</li>
                  <li>Finans ve muhasebe işlerinin takibi.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-zinc-900 font-bold mb-4">3. İŞLENEN KİŞİSEL VERİLER</h2>
                <p>İşletme tarafından işlenen veriler şunları kapsayabilir: Kimlik bilgileri (Ad-Soyad, T.C. No), iletişim bilgileri (Telefon, E-posta, Adres), banka/kredi kartı bilgileri, araç plakası ve tesis içi kamera kayıtları.</p>
              </section>

              <section>
                <h2 className="text-zinc-900 font-bold mb-4">4. KİŞİSEL VERİLERİN AKTARILMASI</h2>
                <p>
                  Kişisel verileriniz; yasal yükümlülüklerimiz gereği başta Emniyet Genel Müdürlüğü (KBS sistemi) olmak üzere, yetkili kamu kurumlarına ve hizmet sağlayıcı iş ortaklarımıza (ödeme sistemleri, kanal yöneticileri) aktarılabilmektedir.
                </p>
              </section>

              <section>
                <h2 className="text-zinc-900 font-bold mb-4">5. VERİ SAHİBİNİN HAKLARI</h2>
                <p>
                  KVKK’nın 11. maddesi uyarınca; verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini isteme, silinmesini talep etme ve kanuna aykırı işlemeden doğan zararın giderilmesini talep etme haklarına sahipsiniz. Taleplerinizi info@kozbeylikonagi.com.tr adresine iletebilirsiniz.
                </p>
              </section>
            </div>
          </FadeIn>
        </div>
      </main>
    </>
  );
}
