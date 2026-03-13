"use client";

import { SiteHeader } from "@/components/site-header";
import { FadeIn } from "@/components/animations";

export default function MenuPage() {
  const sections = [
    {
      title: "Meşhur Organik Köy Kahvaltısı",
      description: "Kozbeyli Köyü&apos;nun bereketli topraklarından gelen, ev yapımı reçeller ve taze ürünlerle hazırlanan zengin soframız.",
      items: [
        { name: "Serpme Köy Kahvaltısı", description: "Ev yapımı reçeller, köy peynirleri, sıcak pişi, sahanda yumurta, taze sebzeler ve sınırsız çay eşliğinde.", priceLabel: "Dahil" },
        { name: "Konak Sıcak Tabağı", description: "Sucuklu yumurta, hellim peyniri ve ızgara zeytin.", priceLabel: "Özel" },
      ]
    },
    {
      title: "Antakya Mutfağından Esintiler",
      description: "Antakyalı İnci Hanım'ın elinden çıkan, geleneksel tariflerle hazırlanan efsanevi lezzetler.",
      items: [
        { name: "Konak Sac Kavurma", description: "Odun ateşinde, özel baharatlarla harmanlanmış yumuşacık dana eti.", priceLabel: "Gurme Seçim" },
        { name: "Özel Antakya Mezeleri", description: "Humus, muhammara, babagannuş ve taze Antakya kekiği ile.", priceLabel: "Taze" },
        { name: "Taş Fırın Lahmacun & Pide", description: "Geleneksel Antakya usulü ince hamur ve zengin iç harç.", priceLabel: "Taş Fırın" }
      ]
    },
    {
      title: "Taş Fırın Pizalarımız",
      description: "Özel mayalanmış hamur ile odun ateşinde pişen çıtır İtalyan ve Ege yorumları.",
      items: [
        { name: "Foka Margherita", description: "Foça domatesi, taze fesleğen ve mozzarella.", priceLabel: "Klasik" },
        { name: "Kozbeyli Gurme", description: "Yerel sucuk, mantar, közlenmiş biber ve Ege otları.", priceLabel: "Favori" }
      ]
    },
    {
       title: "Tatlılar & Meşhur Dibek Kahvesi",
       description: "Yemeğin sonunda unutulmaz bir kapanış için geleneksel ve modern tatlar.",
       items: [
         { name: "Sıcak Antakya Künefesi", description: "Közde hazırlanan, gerçek Antakya peyniri ve Antep fıstığı ile.", priceLabel: "Efsane" },
         { name: "Tarihi Dibek Kahvesi", description: "500 yıllık gelenekle taş dibeklerde dövülmüş, odun ateşinde pişmiş.", priceLabel: "Tescilli" }
       ]
    }
  ];

  return (
    <>
      <SiteHeader />
      <main className="section" style={{ paddingTop: '120px' }}>
        <div className="container">
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: '80px' }}>
              <span className="eyebrow">GASTRONOMİ</span>
              <h1 className="serif" style={{ fontSize: '3.5rem', marginTop: '16px' }}>Doğadan Tabağa Ege Lezzetleri</h1>
              <p style={{ color: '#666', maxWidth: '700px', margin: '24px auto 0' }}>
                Geleneksel tariflerin modern dokunuşlarla buluştuğu, Kozbeyli&apos;nin ruhunu taşıyan gurme bir yolculuk.
              </p>
            </div>
          </FadeIn>

          <div className="menu-layout">
            {sections.map((section, idx) => (
              <FadeIn key={section.title} delay={idx * 0.2}>
                <div className="menu-section-box">
                  <div className="menu-header">
                    <h2 className="serif">{section.title}</h2>
                    <p className="section-desc">{section.description}</p>
                  </div>
                  
                  <div className="menu-items">
                    {section.items.map((item, i) => (
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
    </>
  );
}
