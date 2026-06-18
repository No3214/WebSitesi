import { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/page-hero";
import { SiteHeader } from "@/components/site-header";
import { FadeIn } from "@/components/animations";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Kozbeyli Köyü Rehberi",
  description:
    "Yeni Foça'ya 12 km mesafedeki Kozbeyli Köyü rehberi: beş asırlık taş doku, Horasan harcı, 180 yıllık dibek kahvesi ritüeli ve köyde yavaş bir gün.",
  alternates: { canonical: "/deneyimler/kozbeyli-koyu-rehberi" },
  openGraph: {
    title: "Kozbeyli Köyü Rehberi | Kozbeyli Konağı",
    description:
      "Kozbeyli Köyü: beş asırlık taş doku, Horasan harcı ve 180 yıllık dibek kahvesi ritüeli.",
    url: absoluteUrl("/deneyimler/kozbeyli-koyu-rehberi"),
    images: [
      {
        url: absoluteUrl("/images/galeri/tas-cephe.jpg"),
        alt: "Kozbeyli Konağı taş cephesi",
      },
    ],
  },
};

export default function KozbeyliVillageGuidePage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Ana Sayfa",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Deneyimler",
        item: absoluteUrl("/deneyimler"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Kozbeyli Köyü Rehberi",
        item: absoluteUrl("/deneyimler/kozbeyli-koyu-rehberi"),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="DENEYİMLER"
          title="Kozbeyli Köyü Rehberi"
          text="Beş asırlık taş dokusu, 180 yıllık dibek kahvesi ritüeli ve Ege'nin yavaş ritmiyle Kozbeyli'yi keşfetmeniz için hazırladığımız rehber."
        />

        <section className="section">
          <div className="container" style={{ maxWidth: 880 }}>
            <div style={{ display: "grid", gap: 56 }}>
              <FadeIn>
                <h2>Beş Asırlık Yerleşim ve Tüccar Mirası</h2>
                <p>
                  Yeni Foça&apos;ya 12, Eski Foça&apos;ya 18 kilometre mesafedeki
                  Kozbeyli, beş asırlık taş dokusunu günümüze taşıyan
                  bir Ege köyüdür. Köyün sokaklarına karakterini veren taş
                  evler, Osmanlı sivil mimarisinin yaşayan örnekleri arasında
                  yer alır.
                </p>
                <p>
                  Bu dokunun kalbindeki Kozbeyli Konağı, 1870-1891 yılları
                  arasında bölgenin en varlıklı tüccar aileleri için inşa
                  edildi. Zemin katındaki devasa şarap ve zeytinyağı
                  mahzenleri, dönemin ticari gücünün bugüne ulaşan sessiz
                  tanıklarıdır.
                </p>
              </FadeIn>

              <FadeIn>
                <h2>Taş Mimari ve Horasan Harcı</h2>
                <p>
                  Kozbeyli&apos;nin taş evlerini asırlardır ayakta tutan sır,
                  duvarları ören geleneksel Horasan harcıdır. Bu harçla örülen
                  duvarlar nefes alır; konağımızın odalarında bu tarihi dokuyu
                  bugün de hissedebilirsiniz.
                </p>
                <p>
                  2012 yılında başlayan restorasyonumuz, Anıtlar Kurulu
                  denetiminde ve çimento kullanılmadan, orijinal tekniklerle
                  tamamlandı. &quot;Living Museum&quot; felsefesiyle her taş
                  aslına sadık kalınarak korundu; konak böylece köyün tarihi
                  dokusunun yaşayan bir parçası olarak misafirlerini ağırlıyor.
                </p>
              </FadeIn>

              <FadeIn>
                <h2>180 Yıllık Dibek Kahvesi Ritüeli</h2>
                <p>
                  Konak avlusundaki 180 yıllık taş dibek, Kozbeyli&apos;nin en
                  eski tanıklarından biridir. Her sabah İnci Hanım&apos;ın kahve
                  dövme ritüeliyle uyanır ve o tanıdık ses avluda yankılanır.
                </p>
                <p>
                  Elde dövülen ve odun ateşinde ağır ağır pişen dibek kahvesi,
                  köyde tek gerçek uygulayıcısı olduğumuz bir gelenektir.
                  Köpüklü bir fincan dibek kahvesi, Kozbeyli ziyaretinizin en
                  rafine duraklarından biri olacaktır.
                </p>
              </FadeIn>

              <FadeIn>
                <h2>Köyde Yavaş Bir Gün</h2>
                <p>
                  Güne konakta, 09:00 - 11:30 arasında servis edilen serpme köy
                  kahvaltısıyla başlayın. Ardından köy meydanına uzanan taş
                  sokaklarda acele etmeden yürüyün; Kozbeyli&apos;nin ritmi,
                  saate değil sabah ışığına göre akar.
                </p>
                <p>
                  Öğleden sonrasını avludaki dibek ritüeline ayırabilir ya da
                  12 kilometre uzaklıktaki Yeni Foça&apos;ya uzanabilirsiniz.
                  Akşam köye döndüğünüzde sizi bekleyen, taş duvarların
                  arasındaki o tanıdık sessizliktir.
                </p>
              </FadeIn>

              <FadeIn>
                <h2>Konağa Dönüş</h2>
                <p>
                  Kozbeyli&apos;yi en iyi anlatan şey, onu bir gece boyunca
                  yaşamaktır. Horasan harcıyla nefes alan odalarımızda
                  konaklayın, sabaha dibek sesiyle uyanın ve Ege
                  misafirperverliğini kaynağında deneyimleyin.
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap",
                    marginTop: 24,
                  }}
                >
                  <Link className="button gold" href="/rezervasyon">
                    Rezervasyon Yapın
                  </Link>
                  <Link className="button secondary" href="/deneyimler">
                    Tüm Deneyimler
                  </Link>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
