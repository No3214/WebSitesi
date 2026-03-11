import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { SectionTitle } from "@/components/section-title";
import { SiteFooter } from "@/components/site-footer";
import { getPayloadClient } from "@/lib/payload";

export const metadata = {
  title: "Gastronomi & Menü | Kozbeyli Konağı Lezzetleri"
};

const fallbackSections = [
  {
    title: "Köy Kahvaltısı",
    description: "Kozbeyli Köyü'nün bereketli topraklarından gelen, taze ve doğal ürünlerle hazırlanan meşhur serpme kahvaltımız.",
    items: [
      { name: "Yöresel Peynir Tabağı", description: "Foça tulumu, ezine ve baharatlı lor peyniri seçkisi", priceLabel: "Dahil" },
      { name: "Ev Yapımı Reçeller", description: "Bahçemizden toplanan meyvelerle hazırlanan geleneksel tarifler", priceLabel: "Dahil" },
      { name: "Taş Fırın Ürünleri", description: "Sıcak köy ekmeği, pişi ve simit çeşitleri", priceLabel: "Dahil" }
    ]
  },
  {
    title: "Ege Mutfağından Seçmeler",
    description: "Mevsimsel sebzeler ve yerel deniz mahsulleriyle hazırlanan, zeytinyağının başrolde olduğu rafine lezzetler.",
    items: [
      { name: "Günün Deniz Mahsulü", description: "Foça balıkçılarından taze gelen günlük deniz ürünleri", priceLabel: "Sorunuz" },
      { name: "Kabak Çiçeği Dolması", description: "Nar ekşili ve dereotlu özel iç harcı ile", priceLabel: "Sorunuz" },
      { name: "Zeytinyağlı Enginar", description: "Taze bezelye ve dereotu yatağında", priceLabel: "Sorunuz" }
    ]
  },
  {
     title: "Tescilli Dibek Kahvesi",
     description: "Kozbeyli'nin 200 yıllık geleneği, taş dibeklerde dövülerek hazırlanan efsanevi kahve deneyimi.",
     items: [
       { name: "Tarihi Dibek Kahvesi", description: "Geleneksel sunum ve lokum ile", priceLabel: "Tadı Unutulmaz" },
       { name: "Damla Sakızlı Dibek", description: "Gerçek sakız reçinesi ile aromalandırılmış", priceLabel: "Özel" }
     ]
  }
];

export default async function MenuPage() {
  let sections = fallbackSections;

  try {
    const payload = await getPayloadClient();
    if (payload) {
      const docs = await payload.find({
        collection: "menu-sections",
        limit: 50,
        sort: "order"
      });
  
      if (docs.docs.length) {
        sections = docs.docs as any;
      }
    }
  } catch (e) {
    console.warn("Payload menu skipped, using detailed static content.");
  }

  return (
    <>
      <SiteHeader />
      <main className="section" style={{ paddingTop: '120px' }}>
        <div className="container">
          <SectionTitle
            eyebrow="GASTRONOMİ"
            title="Doğadan Tabağa Ege Lezzetleri"
            text="Geleneksel tariflerin modern dokunuşlarla buluştuğu, Kozbeyli'nin ruhunu taşıyan gurme bir yolculuk."
          />

          <div className="menu-layout">
            {sections.map((section: any, idx: number) => (
              <div key={section.title} className="menu-section-box">
                <div className="menu-header">
                  <h2 className="serif">{section.title}</h2>
                  <p className="section-desc">{section.description}</p>
                </div>
                
                <div className="menu-items">
                  {section.items?.map((item: any, i: number) => (
                    <div key={i} className="menu-item-row">
                      <div className="item-main">
                        <div className="name-price">
                          <span className="item-name">{item.name}</span>
                          <span className="item-price">{item.priceLabel}</span>
                        </div>
                        <p className="item-desc">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="menu-cta">
            <h3 className="serif">Size Özel Bir Akşam?</h3>
            <p>Özel kutlamalarınız ve grup yemekleriniz için bizimle iletişime geçebilirsiniz.</p>
            <a href="/organizasyonlar#teklif" className="button primary">İLETİŞİME GEÇİN</a>
          </div>
        </div>
      </main>

      <style jsx>{`
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

      <SiteFooter />
    </>
  );
}
