import type { Metadata } from "next";

import { FadeIn } from "@/components/animations";
import { PageHero } from "@/components/page-hero";
import { SiteHeader } from "@/components/site-header";
import type { MenuSection } from "@/data/menu";
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

const englishMenuSections: MenuSection[] = [
  {
    title: "Breakfast",
    note: "A Kozbeyli Morning",
    items: [
      {
        name: "Gourmet Village Breakfast",
        description:
          "Butter-fried eggs with sucuk, avocado, capia pepper, Hatay cracked olives, assorted cheeses, walnuts, seasonal fruit, jalapeno labneh, spicy ezme, tomato-cucumber, arugula, olive oil with zahter, fresh pişi, lepena, village bread, honey, clotted cream and house-made jams.",
        price: "750 TL",
      },
      {
        name: "Pişi Breakfast Plate",
        description:
          "Two warm pişi pastries with white and tulum cheeses, olives, spicy ezme, jam, tomato and cucumber.",
        price: "700 TL",
      },
      {
        name: "French Breakfast",
        description:
          "Two croissants with white and tulum cheeses, olives, spicy ezme, jam, tomato, cucumber and pesto.",
        price: "750 TL",
      },
      { name: "Pan Eggs with Pastirma", price: "650 TL" },
      { name: "Pan Eggs with Kavurma", price: "650 TL" },
      { name: "Mıhlama", price: "450 TL" },
      { name: "Pan Eggs with Sucuk", price: "400 TL" },
      { name: "Pan Menemen", price: "350 TL" },
      { name: "Sigara Böreği (4 pieces)", price: "300 TL" },
      { name: "Honey and Clotted Cream", price: "150 TL" },
    ],
  },
  {
    title: "Mezes",
    note: "From Antakya to the Aegean",
    items: [
      {
        name: "The Mansion Meze Plate",
        description:
          "For two guests, five selections: atom, thick cacık, sea beans, vine leaves with sour cherry and carrot tarator. Served with rustic bread and two glasses from your Paşaeli selection.",
        price: "2.400 TL",
      },
      {
        name: "Antakya Hummus with Butter and Pastirma",
        description: "Chickpea-tahini hummus topped with pastirma warmed in butter.",
        price: "450 TL",
      },
      {
        name: "Avocado and Capia Pepper",
        description: "Fresh capia pepper and avocado — light, colourful and bright.",
        price: "350 TL",
      },
      {
        name: "Vine Leaves with Olive Oil and Sour Cherry",
        description: "Rice-stuffed vine leaves with a sweet-sour sour cherry balance.",
        price: "350 TL",
      },
      { name: "Spicy Atom", price: "300 TL" },
      { name: "Sea Beans", price: "300 TL" },
      { name: "Haydari", price: "300 TL" },
    ],
  },
  {
    title: "Warm Starters & Appetizers",
    note: "A Gourmet Beginning",
    items: [
      {
        name: "Salmon Caviar",
        description: "Bright orange salmon roe over ice, with intense sea aroma and a smooth texture.",
        price: "3.000 TL",
      },
      {
        name: "Jumbo Shrimp in Butter",
        description: "Jumbo shrimp sauteed in butter with garlic and fresh herbs.",
        price: "850 TL",
      },
      {
        name: "Hatay-Style Fried Cheese",
        description: "Hot Hatay künefe cheese warmed in butter in a copper pan.",
        price: "800 TL",
      },
      {
        name: "Antakya-Style İçli Köfte (piece)",
        description: "Fine bulgur shell with minced meat and spice filling, served fried.",
        price: "200 TL",
      },
      {
        name: "Arugula Salad",
        description: "White cheese, dried fig, walnut and balsamic glaze.",
        price: "400 TL",
      },
      { name: "Butcher's Sausage & Spiced Potatoes", price: "600 TL" },
    ],
  },
  {
    title: "Neapolitan Pizza & Sandwich",
    note: "Neapolitan Pizza Tradition",
    items: [
      {
        name: "Village-Style Mansion Pizza",
        description:
          "Neapolitan dough enriched with butcher's sucuk, beef salami, beef cotto, beef bacon and buffalo cheese.",
        price: "900 TL",
      },
      {
        name: "Mansion Tandoor Pizza",
        description:
          "Slow-cooked pulled beef with Fior di Latte mozzarella, fresh arugula and grated parmesan.",
        price: "1.000 TL",
      },
      {
        name: "Margherita Napoletana",
        description:
          "Roman-style peeled tomatoes, Fior di Latte mozzarella, Grana Padano D.O.P., fresh basil and extra-virgin olive oil.",
        price: "750 TL",
      },
      {
        name: "Smoked Beef Rib Sandwich",
        description:
          "Rustic baguette with smoked beef rib, white cheese, tomato, olive oil and greens.",
        price: "750 TL",
      },
    ],
  },
  {
    title: "Cheese Boards",
    note: "Designed for Sharing",
    items: [
      {
        name: "Raki Companion Cheese Board",
        description: "A curated selection of local cheeses chosen to pair with raki.",
        price: "800 TL",
      },
      {
        name: "Turkish Local Cheese & Wine Board",
        description: "A sharing board of local cheeses paired for wine.",
        price: "1.000 TL",
      },
    ],
  },
  {
    title: "Main Courses",
    note: "From the Mansion Fire",
    items: [
      {
        name: "Dallas Steak",
        description:
          "Juicy medium-cooked ribeye with grill marks, mashed potato, toasted sliced almonds, baby carrots and grilled corn.",
        price: "3.500 TL",
      },
      {
        name: "Tenderloin Lokum",
        description:
          "Soft beef tenderloin over mashed potato with toasted sliced almonds, baby carrots and grilled corn.",
        price: "1.500 TL",
      },
      {
        name: "Village-Style Sac Kavurma",
        description:
          "Diced beef cooked on a sac griddle with garlic, onion, tomato and peppers. Served with rosemary mashed potatoes.",
        price: "1.250 TL",
      },
      {
        name: "Grilled Lamb Chops",
        description:
          "Bone-in chops grilled over heat with mashed potato, toasted sliced almonds, baby carrots and grilled corn.",
        price: "1.200 TL",
      },
      {
        name: "Mansion Köfte",
        description: "Traditional köfte served with mashed potato and toasted sliced almonds.",
        price: "800 TL",
      },
    ],
  },
  {
    title: "Desserts",
    note: "Sweet Closings",
    items: [
      {
        name: "Pistachio Katmer",
        description:
          "Thin pastry layers with generous Antep pistachio, butter and clotted cream, served with vanilla Maraş ice cream.",
        price: "400 TL",
      },
      {
        name: "Antakya Künefe",
        description: "Fine kadayıf pastry with melting cheese and syrup, finished with pistachio and clotted cream.",
        price: "400 TL",
      },
      {
        name: "Churros",
        description: "Fried pastry sticks with chocolate sauce and powdered sugar.",
        price: "400 TL",
      },
      { name: "Vanilla Maraş Ice Cream (2 scoops)", price: "300 TL" },
      {
        name: "Dessert & Coffee Ritual",
        description: "Any dessert with Turkish coffee — a refined evening close.",
        price: "500 TL",
      },
    ],
  },
  {
    title: "Wines",
    note: "Paşaeli Selection",
    items: [
      { name: "Paşaeli SYS (Glass)", description: "Sıdalan 2024 — Sultaniye, Yapıncak, Sıdalan.", price: "600 TL" },
      { name: "Paşaeli SYS (Bottle)", price: "2.400 TL" },
      {
        name: "Bir Varmış Chardonnay (Glass)",
        description: "Chardonnay 2024, pairing well with salmon caviar and mushrooms.",
        price: "800 TL",
      },
      { name: "Bir Varmış Chardonnay (Bottle)", price: "3.200 TL" },
      { name: "Paşaeli CSKS (Glass)", description: "Karasakız 2023 — Cabernet Sauvignon, Karasakız.", price: "600 TL" },
      { name: "Paşaeli CSKS (Bottle)", price: "2.400 TL" },
      { name: "Paşaeli 6N (Glass)", description: "Kaz Dağları 2024 — Karasakız.", price: "800 TL" },
      { name: "Paşaeli 6N (Bottle)", price: "3.200 TL" },
      { name: "Morso di Sole (Glass)", description: "Buldan 2021 (50cl) — Sultaniye sweet wine.", price: "800 TL" },
      { name: "Morso di Sole (Bottle)", price: "3.500 TL" },
    ],
  },
  {
    title: "Raki",
    note: "For Meze Tables",
    items: [
      { name: "Beylerbeyi Göbek Single", price: "500 TL" },
      { name: "Beylerbeyi Göbek Double", price: "700 TL" },
      { name: "Beylerbeyi Göbek 35cl", price: "2.350 TL" },
      { name: "Beylerbeyi Göbek 70cl", price: "3.600 TL" },
      { name: "Efe Gold Single", price: "500 TL" },
      { name: "Efe Gold Double", price: "700 TL" },
      { name: "Efe Gold 70cl", price: "3.600 TL" },
    ],
  },
  {
    title: "Cocktails & Beer",
    note: "Signature Cocktails",
    items: [
      { name: "Kuzu Kulağı", description: "Herbal, lightly sour signature cocktail.", price: "750 TL" },
      { name: "Wild Berry", description: "Fruity with a sweet-sour finish.", price: "750 TL" },
      { name: "Blanc (Wheat Beer)", price: "275 TL" },
      { name: "Carlsberg", price: "250 TL" },
      { name: "Tuborg Gold", price: "250 TL" },
    ],
  },
  {
    title: "Whiskies",
    note: "After Dinner",
    items: [
      { name: "Jack Daniel's Single", price: "500 TL" },
      { name: "Jack Daniel's Double", price: "800 TL" },
      { name: "Jack Daniel's 70cl", price: "4.300 TL" },
      { name: "Chivas Regal Single", price: "600 TL" },
      { name: "Chivas Regal Double", price: "1.000 TL" },
      { name: "Chivas Regal 70cl", price: "5.000 TL" },
    ],
  },
  {
    title: "Beverages",
    note: "Hot & Cold",
    items: [
      { name: "Turkish Coffee", price: "150 TL" },
      { name: "Caramel Turkish Coffee", price: "200 TL" },
      { name: "Filter Coffee", price: "150 TL" },
      { name: "Espresso", price: "150 TL" },
      { name: "Ice Latte", price: "200 TL" },
      { name: "Hot Chocolate", price: "200 TL" },
      { name: "Salep", price: "250 TL" },
      { name: "Fresh Orange Juice", price: "250 TL" },
      { name: "Tea", price: "50 TL" },
      { name: "Ayran", price: "100 TL" },
      { name: "Cola / Fanta / Ice Tea", price: "150 TL" },
      { name: "Water (large)", price: "100 TL" },
    ],
  },
];

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
