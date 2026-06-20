import type { Metadata } from "next";

import { FadeIn } from "@/components/animations";
import { PageHero } from "@/components/page-hero";
import { SiteHeader } from "@/components/site-header";
import { menuSections, type MenuItem, type MenuSection } from "@/data/menu";
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

const sectionCopy: Record<string, { title: string; note?: string }> = {
  Kahvaltı: { title: "Breakfast", note: "A Kozbeyli Morning" },
  Mezeler: { title: "Mezes", note: "From Antakya to the Aegean" },
  "Ara Sıcaklar & Başlangıçlar": {
    title: "Warm Starters & Appetizers",
    note: "A Gourmet Beginning",
  },
  "Napoliten Pizza & Sandviç": {
    title: "Neapolitan Pizza & Sandwich",
    note: "Neapolitan Pizza Tradition",
  },
  "Peynir Tabakları": { title: "Cheese Boards", note: "Designed for Sharing" },
  "Ana Yemekler": { title: "Main Courses", note: "From the Mansion Fire" },
  Tatlılar: { title: "Desserts", note: "Sweet Closings" },
  Şaraplar: { title: "Wines", note: "Paşaeli Selection" },
  Rakı: { title: "Raki", note: "For Meze Tables" },
  "Kokteyl & Bira": { title: "Cocktails & Beer", note: "Signature Cocktails" },
  Viskiler: { title: "Whiskies", note: "After Dinner" },
  İçecekler: { title: "Beverages", note: "Hot & Cold" },
};

const itemCopy: Record<string, Partial<MenuItem>> = {
  "Gurme Serpme Kahvaltı (kişi başı)": {
    name: "Gourmet Village Breakfast (per person)",
    description:
      "Butter-fried eggs with sucuk, avocado, capia pepper, Hatay cracked olives, assorted cheeses, walnuts, seasonal fruit, jalapeno labneh, spicy ezme, tomato-cucumber, arugula, olive oil with zahter, fresh pişi, lepena, village bread, honey, clotted cream and house-made jams.",
  },
  "Pişi Kahvaltı Tabağı": {
    name: "Pişi Breakfast Plate",
    description:
      "Two warm pişi pastries with white and tulum cheeses, olives, spicy ezme, jam, tomato and cucumber.",
  },
  "Fransız Kahvaltı": {
    name: "French Breakfast",
    description:
      "Two croissants with white and tulum cheeses, olives, spicy ezme, jam, tomato, cucumber and pesto.",
  },
  "Tereyağlı Jumbo Karides": {
    name: "Jumbo Shrimp in Butter",
    description: "Jumbo shrimp sauteed in butter with garlic and fresh herbs.",
  },
  "Hatay Usulü Kızarmış Peynir": {
    name: "Hatay-Style Fried Cheese",
    description: "Hot Hatay künefe cheese warmed in butter in a copper pan.",
  },
  "Köy Usulü Konak Pizza": {
    name: "Village-Style Mansion Pizza",
    description:
      "Neapolitan dough enriched with butcher's sucuk, beef salami, beef cotto, beef bacon and buffalo cheese, finished with arugula, chilli olive oil and grated parmesan.",
  },
  "Konak Tandır Pizza": {
    name: "Mansion Tandoor Pizza",
    description:
      "Slow-cooked pulled beef with Fior di Latte mozzarella, fresh arugula and grated parmesan, served from the stone oven.",
  },
  "Dana Kaburga Füme Etli Sandviç": {
    name: "Smoked Beef Rib Sandwich",
    description:
      "Rustic baguette with smoked beef rib, white cheese, tomato, olive oil and greens.",
  },
  "Türk Yerli Peynir & Şarap Tabağı": {
    name: "Turkish Local Cheese & Wine Board",
    description: "A sharing board of local cheeses paired for wine.",
  },
  "Lokum Bonfile": {
    name: "Tenderloin Lokum",
    description:
      "Soft beef tenderloin over mashed potato with toasted sliced almonds, baby carrots and grilled corn.",
  },
  "Izgara Pirzola": {
    name: "Grilled Lamb Chops",
    description:
      "Bone-in chops grilled over heat with mashed potato, toasted sliced almonds, baby carrots and grilled corn.",
  },
  "Konak Köfte": {
    name: "Mansion Köfte",
    description: "Traditional köfte served with mashed potato and toasted sliced almonds.",
  },
  "Antep Fıstıklı Katmer": {
    name: "Pistachio Katmer",
    description:
      "Thin pastry layers with generous Antep pistachio, butter and clotted cream, served with vanilla Maraş ice cream.",
  },
  "Antakya Künefe": {
    name: "Antakya Künefe",
    description:
      "Fine kadayıf pastry with melting cheese and syrup, finished with pistachio and clotted cream.",
  },
  "Tatlı & Kahve Keyfi": {
    name: "Dessert & Coffee Ritual",
    description: "Any dessert with Turkish coffee - a refined evening close.",
  },
  "Beyaz Şarap Tadımı": {
    name: "White Wine Tasting",
    description:
      "Paşaeli SYS + Bir Varmış Bir Yokmuş Chardonnay (one glass) with a mini cheese board.",
  },
  "Kırmızı Şarap Tadımı": {
    name: "Red Wine Tasting",
    description: "Paşaeli CSKS (one glass) with a mini cheese board.",
  },
  "İthal Şarap Seçkisi": {
    name: "Imported Wine Selection",
    description:
      "A limited number of carefully selected imported wines are available. Please ask our service team for the current selection and prices.",
  },
  "Kuzu Kulağı": {
    name: "Kuzu Kulağı",
    description: "A herbal, lightly sour signature cocktail.",
  },
  "Wild Berry": {
    name: "Wild Berry",
    description: "A fruity signature cocktail with a sweet-sour finish.",
  },
};

const englishMenuSections: MenuSection[] = menuSections.map((section) => ({
  title: sectionCopy[section.title]?.title ?? section.title,
  note: sectionCopy[section.title]?.note ?? section.note,
  items: section.items.map((item) => ({
    ...item,
    ...(itemCopy[item.name] ?? {}),
  })),
}));

export default function EnglishMenuPage() {
  return (
    <>
      <SiteHeader variant="solid" />
      <PageHero
        eyebrow="DINING"
        title="A Curated Aegean and Antakya Table"
        text="Traditional recipes, stone-oven warmth and Kozbeyli's village rhythm meet in a refined restaurant experience."
      />
      <main className="section">
        <div className="container">
          <div className="menu-layout" style={{ marginTop: 0 }}>
            {englishMenuSections.map((section, idx) => (
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
          text-align: right;
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
