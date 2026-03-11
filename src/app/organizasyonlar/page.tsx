import { SiteHeader } from "@/components/site-header";
import { SectionTitle } from "@/components/section-title";
import { getPayloadClient } from "@/lib/payload";

export const metadata = {
  title: "Unutulmaz Etkinlikler | Organizasyonlar"
};

const fallbackPackages = [
  {
    title: "Butik Düğün",
    short: "Taş mimarinin büyüleyici atmosferinde, en özel gününüzü birlikte planlayalım.",
    category: "dugun"
  },
  {
    title: "Özel Kutlamalar",
    short: "Nişan, söz veya yıl dönümü gibi rafine kutlamalarınız için kişiselleştirilmiş hizmet.",
    category: "nisan"
  },
  {
    title: "Kurumsal Etkinlikler",
    short: "Incentive gruplar, lansmanlar ve özel iş yemekleri için profesyonel çözümler.",
    category: "kurumsal"
  }
];

export default async function OrganizationsPage() {
  let packs: any[] = fallbackPackages; // Keeping any for now to avoid cascading type issues, but adding explicit array type

  try {
    const payload = await getPayloadClient();
    const docs = await payload.find({
      collection: "organization-packages",
      limit: 50,
      sort: "order"
    });

    if (docs.docs.length) {
      packs = docs.docs as any;
    }
  } catch {}

  return (
    <>
      <SiteHeader />
      <main className="section">
        <div className="container">
          <SectionTitle
            eyebrow="Organizasyon"
            title="Eşsiz Anlar İçin Benzersiz Mekân"
            text="Ege&apos;nin kalbinde, tarihin ve doğanın kucağında unutulmaz etkinliklere imza atıyoruz."
          />

          <div className="feature-grid">
            {packs.map((item: any) => (
              <div key={item.title} className="feature-box">
                <span className="eyebrow" style={{ textAlign: 'left' }}>{item.category}</span>
                <h3>{item.title}</h3>
                <p>{item.short}</p>
                <a href="#teklif" className="serif" style={{ fontSize: '0.9rem', borderBottom: '1px solid var(--gold)', color: 'var(--gold)' }}>Teklif Talebi →</a>
              </div>
            ))}
          </div>

import { LeadForm } from "@/components/lead-form";

// ... (inside the component)
          <div id="teklif" style={{ marginTop: '100px' }}>
             <SectionTitle
                eyebrow="İletişim"
                title="Sizin İçin Hazırlanalım"
                text="Hayalinizdeki organizasyonu gerçekleştirmek için detayları bizimle paylaşın."
              />
            <LeadForm />
          </div>
        </div>
      </main>
    </>
  );
}
