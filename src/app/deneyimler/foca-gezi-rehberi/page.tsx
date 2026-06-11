import { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/page-hero";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FadeIn } from "@/components/animations";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Foça Gezi Rehberi",
  description:
    "Kozbeyli Konağı'ndan Foça'ya 12 dakika: Eski Foça sahil yürüyüşü, Siren Kayalıkları, balıkçı koyları ve gün batımı noktaları için özenle derlenmiş gezi rehberi.",
  keywords: [
    "foça gezi rehberi",
    "foça gezilecek yerler",
    "siren kayalıkları",
    "eski foça sahil yürüyüşü",
    "kozbeyli konağı deneyimler",
  ],
  alternates: { canonical: "/deneyimler/foca-gezi-rehberi" },
  openGraph: {
    title: "Foça Gezi Rehberi | Kozbeyli Konağı",
    description:
      "Eski Foça sahili, Siren Kayalıkları, balıkçı koyları ve gün batımı noktaları. Konaktan günübirlik bir Foça keşfi.",
    url: absoluteUrl("/deneyimler/foca-gezi-rehberi"),
    images: [
      {
        url: absoluteUrl("/images/hero.jpg"),
        alt: "Kozbeyli Konağı'ndan Foça'ya uzanan Ege manzarası",
      },
    ],
  },
};

const guideSections = [
  {
    title: "Eski Foça Sahil Yürüyüşü",
    paragraphs: [
      "Foça'nın kalbi, denizle iç içe geçen sahil şerididir. Eski Foça'da yürüyüş, taş rıhtıma usulca yanaşmış balıkçı tekneleriyle başlar; daracık sokaklara taşan begonviller, asırlık taş evlerin cumbaları ve limanı saran tarihi doku adımlarınıza eşlik eder.",
      "Sabahın erken saatlerinde kordon sakindir: martı sesleri, denizin tuzlu kokusu ve uzaktan gelen fincan tıkırtıları... Akşamüstü ise sahil, günün son ışığında yavaşlayan bir köy ritmine bürünür. Acele etmeden, durakları kendiniz seçerek yürümek bu rotanın en zarif hâlidir.",
    ],
  },
  {
    title: "Siren Kayalıkları ve Tekne Turları",
    paragraphs: [
      "Foça açıklarında denizden yükselen Siren Kayalıkları, antik anlatılarda denizcileri sesleriyle büyüleyen sirenlerin yurdu olarak anılır. Homeros'un dizelerine konu olan bu coğrafyada rüzgâr, dalga ve kaya; bugün bile aynı efsaneyi fısıldar gibidir.",
      "Yaz aylarında limandan kalkan günübirlik tekneler, kayalıkların çevresindeki berrak koylarda mola vererek bu efsaneyi denizden izleme imkânı sunar. Koruma altındaki bu sular, Akdeniz fokunun nadir yaşam alanlarından biri olarak bilinir; sabırlı bir bakış, şanslı bir günde uzakta bir silüetle ödüllendirilebilir.",
    ],
  },
  {
    title: "Balıkçı Koyları ve Deniz",
    paragraphs: [
      "Foça kıyıları, rüzgârdan korunaklı, berrak ve dingin koylarla örülüdür. Sabah denizi burada bir ayrıcalıktır: su henüz dururken kıyı taşlarının arasında balık sürüleri seçilir, deniz cam gibi açılır.",
      "Balıkçı barınaklarında günün ilk ağları toplanırken kıyıda küçük bir mola vermek, Ege'nin gündelik zarafetine tanıklık etmektir. Yanınıza alacağınız bir havlu ve iyi bir kitap, koy keşfini başlı başına bir deneyime dönüştürür.",
    ],
  },
  {
    title: "Gün Batımı Noktaları",
    paragraphs: [
      "Ege'de günün uğurlanışı Foça'da bir ritüeldir. Batıya bakan sahil şeridi, kale surlarının gölgesinde denize inen taş setler ve liman ağzı; güneşin denize değdiği anı izlemek için en sevilen noktalardandır.",
      "Dilerseniz dönüş yolunda Kozbeyli sırtlarında durup zeytin ağaçlarının arasından köyün taş damlarına vuran son ışığı izleyin; dilerseniz konağın avlusunda, elinizde bir fincan Türk kahvesiyle gökyüzünün bakırdan moruna dönüşünü seyredin.",
    ],
  },
];

const dayPlan = {
  intro:
    "Kozbeyli Konağı, Foça'ya 12 dakika mesafesiyle bu rehberin en zarif başlangıç noktasıdır. Güne konakta başlayın, Ege'yi keşfedin, akşam yine taş duvarların dinginliğine dönün.",
  steps: [
    {
      label: "Sabah — Konakta Serpme Kahvaltı",
      text: "Güne taş avluda, köy ürünleri ve Ege otlarıyla hazırlanan serpme kahvaltıyla başlayın. Telaşsız bir sofra, günün ritmini baştan belirler.",
    },
    {
      label: "Gündüz — Foça Keşfi",
      text: "Eski Foça'da sahil yürüyüşü, koylarda deniz molası ve dileyenler için Siren Kayalıkları'na uzanan bir tekne keyfi. Rotayı gününüze ve rüzgâra göre kurgulayın.",
    },
    {
      label: "Akşam — Konağa Dönüş",
      text: "Gün batımıyla birlikte Kozbeyli'ye dönün; taş avlunun serinliğinde, yıldızların altında günü yavaşça kapatın.",
    },
  ],
};

export default function FocaTravelGuidePage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Deneyimler", item: absoluteUrl("/deneyimler") },
      {
        "@type": "ListItem",
        position: 3,
        name: "Foça Gezi Rehberi",
        item: absoluteUrl("/deneyimler/foca-gezi-rehberi"),
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
          title="Foça Gezi Rehberi"
          text="Asırlık taş sokaklardan Siren Kayalıkları'na — konaktan günübirlik bir Foça keşfi için özenle derlenmiş rehberiniz."
        />

        <section className="section">
          <div className="container" style={{ maxWidth: 880 }}>
            <div className="grid gap-14">
              {guideSections.map((item) => (
                <FadeIn key={item.title}>
                  <article>
                    <h2 className="serif text-3xl mb-4 text-zinc-900">{item.title}</h2>
                    {item.paragraphs.map((paragraph, idx) => (
                      <p key={idx} className="text-zinc-600 leading-relaxed mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </article>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container" style={{ maxWidth: 880 }}>
            <FadeIn>
              <h2 className="serif text-3xl mb-4 text-zinc-900">Konaktan Günübirlik Plan</h2>
              <p className="text-zinc-600 leading-relaxed mb-8">{dayPlan.intro}</p>
              <ol className="grid gap-6" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {dayPlan.steps.map((step) => (
                  <li key={step.label} className="border-l-2 border-zinc-200 pl-6">
                    <strong className="serif text-xl text-zinc-900 block mb-2">
                      {step.label}
                    </strong>
                    <p className="text-zinc-600 leading-relaxed">{step.text}</p>
                  </li>
                ))}
              </ol>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 40 }}>
                <Link className="button gold" href="/rezervasyon">
                  Rezervasyon Yapın
                </Link>
                <Link className="button secondary" href="/deneyimler">
                  Tüm Deneyimler
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
