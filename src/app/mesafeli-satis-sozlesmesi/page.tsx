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
                </ul>
              </section>

              <section>
                <h2 className="text-zinc-900 font-bold mb-4">4. İPTAL VE İADE KOŞULLARI</h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Standart rezervasyonlarda: Giriş tarihinden 72 saat öncesine kadar yapılan iptallerde ödeme tam iade edilir.</li>
                  <li>72 saatten az kalan iptallerde 1 gecelik konaklama bedeli &apos;No-Show&apos; olarak tahsil edilir.</li>
                  <li>Erken ayrılmalarda konaklanmayan günlerin iadesi yapılmaz.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-zinc-900 font-bold mb-4">5. GENEL HÜKÜMLER</h2>
                <p>Misafir, otele girişte resmi kimlik belgesi ibraz etmek zorundadır. Evcil hayvan kabulü ve sigara kullanımı ile ilgili kurallar &apos;Misafir Rehberi&apos; sayfasında belirtilmiştir.</p>
              </section>
            </div>
          </FadeIn>
        </div>
      </main>
    </>
  );
}
