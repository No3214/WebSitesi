import { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/page-hero";
import { SiteHeader } from "@/components/site-header";
import { SectionTitle } from "@/components/section-title";
import { FadeIn } from "@/components/animations";
import { absoluteUrl } from "@/lib/utils";
import { sanitizeJsonLd } from "@/lib/security";

export const metadata: Metadata = {
  title: "Ege Gastronomi Rotası",
  description:
    "Serpme köy kahvaltısından asırlık zeytin ağaçlarına, 180 yıllık taş dibekte dövülen kahveden taş fırın lezzetlerine: Kozbeyli Konağı'nda Ege gastronomi rotası.",
  alternates: { canonical: "/deneyimler/ege-gastronomi-rotasi" },
  openGraph: {
    title: "Ege Gastronomi Rotası | Kozbeyli Konağı",
    description:
      "Serpme köy kahvaltısı, dibek kahvesi ritüeli ve Antakya'dan Ege'ye uzanan lezzet köprüsü. Kozbeyli Konağı'nın gastronomi rotası.",
    url: absoluteUrl("/deneyimler/ege-gastronomi-rotasi"),
    images: [
      {
        url: absoluteUrl("/videos/kahvalti-poster.jpg"),
        alt: "Kozbeyli Konağı'nda serpme köy kahvaltısı sofrası",
      },
    ],
  },
};

export default function EgeGastronomiRotasiPage() {
  // Zengin sonuçlar: Ana Sayfa > Deneyimler > Ege Gastronomi Rotası kırıntısı.
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Deneyimler", item: absoluteUrl("/deneyimler") },
      {
        "@type": "ListItem",
        position: 3,
        name: "Ege Gastronomi Rotası",
        item: absoluteUrl("/deneyimler/ege-gastronomi-rotasi"),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(breadcrumbJsonLd) }}
      />
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="DENEYİMLER"
          title="Ege Gastronomi Rotası"
          text="Kozbeyli'nin taş dokusundan konağın mutfağına uzanan bir lezzet yolculuğu: serpme köy kahvaltısı, asırlık zeytin ağaçları, 180 yıllık taş dibek ve Antakya'dan Ege'ye taşınan bir aile mirası."
        />

        <section className="section">
          <div className="container" style={{ maxWidth: 880 }}>
            <FadeIn>
              <SectionTitle
                eyebrow="DURAK 01"
                title="Ege Kahvaltı Kültürü ve Serpme Sofra"
                text="Ege'de güne uzun ve telaşsız bir sofrayla başlanır; rotamızın ilk durağı da bu kültürün konaktaki karşılığıdır."
              />
              <p>
                {"Kozbeyli Konağı'nın serpme köy kahvaltısı, Kozbeyli'nin asırlık zeytin ağaçlarından ve İnci Hanım'ın geleneksel reçel tariflerinden süzülen, tarladan sofraya (farm-to-table) tam organik bir döngüdür. Taş duvarların gölgesinde kurulan sofra, Ege sabahının ritmini konağın tarihi dokusuna taşır."}
              </p>
            </FadeIn>
          </div>
        </section>

        <section className="section section-alt">
          <div className="container" style={{ maxWidth: 880 }}>
            <FadeIn>
              <SectionTitle
                eyebrow="DURAK 02"
                title="Zeytin ve Zeytinyağı"
                text="Ege mutfağının temeli zeytindir; Kozbeyli'de bu temel, asırlık ağaçların gölgesinde atılır."
              />
              <p>
                {"Kahvaltı sofrasına düşen zeytin ve zeytinyağı, Kozbeyli'nin asırlık zeytin ağaçlarından gelir. Tarladan sofraya uzanan organik döngünün ilk halkası bu ağaçlardır; her tabağa Ege'nin kadim topraklarının izini bırakırlar."}
              </p>
            </FadeIn>
          </div>
        </section>

        <section className="section">
          <div className="container" style={{ maxWidth: 880 }}>
            <FadeIn>
              <SectionTitle
                eyebrow="DURAK 03"
                title="Dibek Kahvesi ve Taş Fırın Ritüeli"
                text="Rotanın en kadim durağı: 180 yıllık orijinal taş dibek ve taş fırının ateşi."
              />
              <p>
                180 yıllık orijinal taş dibekte her gün taze olarak elde dövülen dibek
                kahvesi, Kozbeyli&apos;nin en karakteristik ritüellerinden biridir. Taş
                fırın ise mutfağın kalbidir: mıhlama taş ateşinde pişer, yöresel lezzetler
                fırının yavaş ısısında olgunlaşır.
              </p>
            </FadeIn>
          </div>
        </section>

        <section className="section section-alt">
          <div className="container" style={{ maxWidth: 880 }}>
            <FadeIn>
              <SectionTitle
                eyebrow="DURAK 04"
                title="Antakya'dan Ege'ye Lezzet Köprüsü"
                text="İnci Hanım'ın Antakya kökenli aile mirası, rotanın son durağında Ege'nin ürünleriyle buluşur."
              />
              <p>
                {"Kozbeyli Konağı'nın mutfağı yalnızca bir yemek alanı değil; İnci Hanım'ın Antakya kökenli aile mirası ile Ege'nin kadim topraklarını birleştiren bir gastronomi laboratuvarıdır. Antakya'nın aile tarifleri ile Ege'nin ürünleri aynı sofrada buluşur; şefin akşam tabağı bu köprünün imzasıdır."}
              </p>
            </FadeIn>
          </div>
        </section>

        <section className="section">
          <div className="container" style={{ maxWidth: 880 }}>
            <FadeIn>
              <SectionTitle
                eyebrow="SOFRAYA DAVET"
                title="Rotayı Sofrada Tamamlayın"
                text="Gastronomi mirasımızın hikayesini keşfedin ya da doğrudan menüye göz atın."
              />
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 40 }}>
                <Link className="button gold" href="/gastronomi">
                  Mutfağımızı Keşfedin
                </Link>
                <Link className="button secondary" href="/menu">
                  Menüye Göz Atın
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>
    </>
  );
}
