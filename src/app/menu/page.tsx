import { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { PageHero } from "@/components/page-hero";
import { FadeIn } from "@/components/animations";

import { menuSections } from "@/data/menu";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Gurme Yemek Menüsü | Taş Fırın & Kahvaltı",
  description: "Kozbeyli Konağı restoran menüsü: tescilli serpme köy kahvaltısı, Antakya mezeleri, odun ateşinde taş fırın pide ve pizzalar, közde sıcak künefe ve meşhur dibek kahvesi.",
  keywords: [
    "kozbeyli konağı menü",
    "serpme kahvaltı menüsü foça",
    "antakya yemekleri izmir",
    "taş fırın pizza izmir",
    "foça akşam yemeği mekanları",
    "sıcak künefe izmir"
  ],
  alternates: { canonical: "/menu" },
  openGraph: {
    title: "Gurme Yemek Menüsü | Taş Fırın & Kahvaltı | Kozbeyli Konağı",
    description: "Kozbeyli Konağı gurme restoran menüsü. Tescilli köy kahvaltısı, Antakya mezeleri ve odun ateşinde taş fırın lezzetleri.",
    url: absoluteUrl("/menu"),
    images: [
      {
        url: absoluteUrl("/videos/mihlama-poster.jpg"),
        alt: "Taş ateşinde hazırlanan mıhlama — Kozbeyli Konağı mutfağı",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kozbeyli Konağı Gurme Restoran Menüsü",
    description: "Serpme kahvaltı, taş fırın lezzetleri ve Antakya mezeleri.",
    images: [absoluteUrl("/videos/mihlama-poster.jpg")],
  }
};

export default function MenuPage() {
  return (
    <>
      <SiteHeader variant="overlay" />
      <PageHero
        eyebrow="GASTRONOMİ"
        title="Doğadan Tabağa Ege Lezzetleri"
        text="Geleneksel tariflerin modern dokunuşlarla buluştuğu, Kozbeyli'nin ruhunu taşıyan gurme bir yolculuk."
      />
      <main className="section">
        <div className="container">
          <div className="menu-layout" style={{ marginTop: 0 }}>
            {menuSections.map((section, idx) => (
              <FadeIn key={section.title} delay={Math.min(idx * 0.2, 0.4)}>
                <div className="menu-section-box">
                  <div className="menu-header">
                    <h2 className="serif">{section.title}</h2>
                    {section.note && <p className="section-desc">{section.note}</p>}
                  </div>

                  <div className="menu-items">
                    {section.items.map((item, i) => (
                      <div key={i} className="menu-item-row">
                        <div className="item-main">
                          <div className="name-price">
                            <span className="item-name">{item.name}</span>
                            {item.price && <span className="item-price">{item.price}</span>}
                          </div>
                          {item.description && <p className="item-desc">{item.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.6}>
            <div className="menu-cta">
              <h3 className="serif">Size Özel Bir Akşam?</h3>
              <p>Özel kutlamalarınız ve grup yemekleriniz için bizimle iletişime geçebilirsiniz.</p>
              <a href="/organizasyonlar#teklif" className="button primary">İLETİŞİME GEÇİN</a>
            </div>
          </FadeIn>
        </div>
      </main>

      <style>{`
        .menu-layout {
          max-width: 1000px;
          margin: 60px auto 0;
          display: flex;
          flex-direction: column;
          gap: 80px;
        }

        .menu-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .menu-header h2 {
          font-size: 2.5rem;
          color: var(--olive);
          margin-bottom: 16px;
        }

        .section-desc {
          max-width: 600px;
          margin: 0 auto;
          color: #666;
          font-style: italic;
        }

        .menu-items {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px 60px;
        }

        .menu-item-row {
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border);
        }

        .name-price {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 8px;
        }

        .item-name {
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--text);
        }

        .item-price {
          font-size: 0.85rem;
          color: var(--gold);
          font-weight: 700;
          text-transform: uppercase;
        }

        .item-desc {
          font-size: 0.9rem;
          color: #777;
          line-height: 1.5;
        }

        .menu-cta {
          margin-top: 120px;
          text-align: center;
          padding: 80px 40px;
          background: var(--soft);
        }

        .menu-cta h3 {
          font-size: 2rem;
          margin-bottom: 16px;
        }

        .menu-cta p {
          margin-bottom: 32px;
          color: #555;
        }

        @media (max-width: 768px) {
          .menu-items {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
