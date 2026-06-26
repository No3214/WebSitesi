"use client";

import { SiteHeader } from "@/components/site-header";
import { FadeIn } from "@/components/animations";

export default function SalesAgreementPage() {
  return (
    <>
      <SiteHeader />
      <main className="section pt-32 pb-20 bg-white">
        <div className="container max-w-4xl">
          <FadeIn>
            <h1 className="serif text-4xl mb-12">Mesafeli Satış Sözleşmesi</h1>
            
            <div className="prose prose-zinc prose-sm leading-relaxed text-zinc-600 space-y-8">
              <section>
                <h2 className="text-zinc-900 font-bold mb-4">1. TARAFLAR</h2>
                <p><strong>SATICI:</strong> Kozbeyli Konağı Butik Otel (Bundan sonra &apos;Otel&apos; olarak anılacaktır)</p>
                <p><strong>ALICI:</strong> Web sitesi üzerinden rezervasyon yapan kullanıcı (Bundan sonra &apos;Misafir&apos; olarak anılacaktır)</p>
                <p><strong>Tesis Tescil / İşletme Belgesi No:</strong> 2025-35-1824</p>
              </section>

              <section>
                <h2 className="text-zinc-900 font-bold mb-4">2. KONU</h2>
                <p>İşbu sözleşmenin konusu, Misafir&apos;in Otel&apos;e ait internet sitesi üzerinden elektronik ortamda yaptığı konaklama rezervasyonuna ilişkin hizmetin satışı ve ifası ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri uyarınca tarafların hak ve yükümlülüklerinin saptanmasıdır.</p>
              </section>

              <section>
                <h2 className="text-zinc-900 font-bold mb-4">3. REZERVASYON VE ÖDEME</h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Rezervasyonun kesinleşmesi için toplam tutarın tamamının veya belirlenen depozito tutarının kredi kartı veya havale ile ödenmesi gerekmektedir.</li>
                  <li>Fiyatlara KDV dahildir. Kahvaltı servisi oda fiyatına dahildir (aksi belirtilmedikçe).</li>
                  <li>Fiyatlar sezon, dönem ve doluluk durumuna göre değişiklik gösterebilir; güncel fiyat ve müsaitlik resmi rezervasyon ekranında netleşir.</li>
                  <li>Girişte; à la carte restoran, minibar ve ücretli içecekler gibi ekstra harcamalar ile misafir kaynaklı olası maddi zararlar için tesisçe belirlenen tutarda nakit veya kredi kartı provizyonu şeklinde depozito alınabilir. Harcama yapılmaması hâlinde depozito çıkışta iade edilir; kartla alınan provizyonun iadesi ilgili bankanın iade süresine tabidir.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-zinc-900 font-bold mb-4">4. İPTAL VE İADE KOŞULLARI</h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Konaklama tarihine 72 saat (3 gün) ve daha kısa süre kala iletilen iptal ve değişikliklerde ücret iadesi yapılmaz; konaklama bedelinin tamamı tahsil edilir.</li>
                  <li>72 saatten önce iletilen iptal ve tarih değişikliği talepleri; seçilen tarife, ödeme tipi ve rezervasyon kanalı koşullarına göre değerlendirilir ve güncel koşullar rezervasyon teyidi sırasında yazılı olarak paylaşılır.</li>
                  <li>Rezervasyona gelmeme (no-show) ve erken ayrılma durumlarında konaklama bedelinin tamamı tahsil edilir.</li>
                  <li>Doğal afet, olumsuz hava koşulları, kamu otoritelerinin kararları ve ilgili resmî kurum/altyapı sağlayıcılarının planlı çalışmalarından kaynaklanan su, elektrik vb. hizmet kesintileri Otel&apos;in kontrolü dışındadır; bu mücbir sebeplere dayalı aksamalar nedeniyle iptal, iade veya tazminat talep edilemez.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-zinc-900 font-bold mb-4">5. GENEL HÜKÜMLER</h2>
                <p>Misafir, otele girişte resmi kimlik belgesi ibraz etmek zorundadır. Evcil hayvan kabulü ve sigara kullanımı ile ilgili kurallar &apos;Misafir Rehberi&apos; sayfasında belirtilmiştir.</p>
                <p>Girişte kayıt yaptıran kişinin 18 yaşını doldurmuş olması gerekir. 18 yaşından küçük misafirler veli veya vasileri refakatinde konaklayabilir; veli/vasi olmaksızın konaklama için, veli/vasi tarafından noter huzurunda düzenlenmiş muvafakatname aslının giriş sırasında tesise ibraz edilmesi gerekir.</p>
              </section>
            </div>
          </FadeIn>
        </div>
      </main>
    </>
  );
}
