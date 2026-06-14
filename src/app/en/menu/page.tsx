import type { Metadata } from "next";

import { FadeIn } from "@/components/animations";
import { PageHero } from "@/components/page-hero";
import { SiteHeader } from "@/components/site-header";
import { menuSections } from "@/data/menu";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Restaurant Menu | Stone Oven & Village Breakfast",
  description:
    "Kozbeyli Konağı restaurant menu: curated village breakfast, Antakya mezes, wood-fired stone oven flavours, künefe and dibek coffee.",
  alternates: { canonical: "/en/menu" },
  openGraph: {
    url: absoluteUrl("/en/menu"),
    title: "Restaurant Menu | Kozbeyli Konağı",
    description:
      "A curated Antakya and Aegean table with village breakfast, stone-oven flavours and dibek coffee.",
    images: [
      {
        url: absoluteUrl("/videos/mihlama-poster.jpg"),
        alt: "Mıhlama prepared over stone fire at Kozbeyli Konağı",
      },
    ],
  },
};

export default function EnglishMenuPage() {
  return (
    <>
      <SiteHeader variant="overlay" />
      <PageHero
        eyebrow="DINING"
        title="A Curated Aegean and Antakya Table"
        text="Traditional recipes, stone-oven warmth and Kozbeyli's village rhythm meet in a refined restaurant experience."
      />
      <main className="section">
        <div className="container">
          <div className="menu-layout" style={{ marginTop: 0 }}>
            {menuSections.map((section, idx) => (
              <FadeIn key={section.title} delay={Math.min(idx * 0.2, 0.4)}>
                <div className="menu-section-box">
                  <div className="menu-header">
                    <h2 className="serif">{section.title}</h2>
                    {section.note ? <p className="section-desc">{section.note}</p> : null}
                  </div>

                  <div className="menu-items">
                    {section.items.map((item) => (
                      <div key={`${section.title}-${item.name}`} className="menu-item-row">
                        <div className="item-main">
                          <div className="name-price">
                            <span className="item-name">{item.name}</span>
                            {item.price ? <span className="item-price">{item.price}</span> : null}
                          </div>
                          {item.description ? <p className="item-desc">{item.description}</p> : null}
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
              <h3 className="serif">Planning a Private Dinner?</h3>
              <p>For celebrations and group dining, our guest relations team can curate the evening with you.</p>
              <a href="/en/organizasyonlar#teklif" className="button primary">
                CONTACT GUEST RELATIONS
              </a>
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
