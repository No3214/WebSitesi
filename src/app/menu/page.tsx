import { SiteHeader } from "@/components/site-header";
import { SectionTitle } from "@/components/section-title";
import { getPayloadClient } from "@/lib/payload";

export const metadata = {
  title: "Gurme Deneyim | Online Menü"
};

const fallbackSections = [
  {
    title: "Kahvaltı",
    description: "Yerel mahsullerle hazırlanan zengin serpme kahvaltı ve özel dibek kahvesi.",
    items: [{ name: "Serpme Köy Kahvaltısı", description: "Sınırsız çay ve zengin çeşitler ile", priceLabel: "Sorgulayınız" }]
  },
  {
    title: "Akşam Yemeği",
    description: "Ege'nin taze ürünleri ve özel şarap seçkisi ile rafine bir akşam.",
    items: [{ name: "Günün Spesiyali", description: "Şefin yorumuyla taze deniz ürünleri", priceLabel: "Sorgulayınız" }]
  }
];

export default async function MenuPage() {
  let sections = fallbackSections;

  try {
    const payload = await getPayloadClient();
    const docs = await payload.find({
      collection: "menu-sections",
      limit: 50,
      sort: "order"
    });

    if (docs.docs.length) {
      sections = docs.docs as any;
    }
  } catch {}

  return (
    <>
      <SiteHeader />
      <main className="section">
        <div className="container">
          <SectionTitle
            eyebrow="Gastronomi"
            title="Kozbeyli Lezzetleri"
            text="Mevsimsel ve yerel ürünlerle hazırlanan menümüzü keşfedin."
          />

          <div className="feature-grid">
            {sections.map((section: any) => (
              <div key={section.title} className="feature-box">
                <span className="eyebrow" style={{ textAlign: 'left' }}>Bölüm</span>
                <h3>{section.title}</h3>
                <p style={{ fontStyle: 'italic', color: '#666', marginBottom: '24px' }}>{section.description}</p>

                {section.items?.length ? (
                  <ul style={{ listStyle: 'none', padding: 0, borderTop: '1px solid var(--border)' }}>
                    {section.items.map((item: any, i: number) => (
                      <li key={`${section.title}-${i}`} style={{ padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <strong>{item.name}</strong>
                          <span style={{ fontSize: '0.8rem', color: 'var(--gold)' }}>{item.priceLabel}</span>
                        </div>
                        {item.description ? <p style={{ fontSize: '0.85rem', margin: '4px 0 0', color: '#888' }}>{item.description}</p> : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
