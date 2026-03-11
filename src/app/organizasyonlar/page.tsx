import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { SectionTitle } from "@/components/section-title";
import { SiteFooter } from "@/components/site-footer";
import { getPayloadClient } from "@/lib/payload";
import { LeadForm } from "@/components/lead-form";

export const metadata = {
  title: "Organizasyonlar | Kozbeyli Konağı Luxury Events"
};

const fallbackPackages = [
  {
    title: "Butik Düğün ve Davet",
    short: "Tarihi taş duvarlar arasında, zeytin ağaçlarının gölgesinde masalsı bir düğün deneyimi.",
    description: "Kozbeyli Konağı'nın büyülü atmosferi, en özel gününüzü unutulmaz bir hikayeye dönüştürüyor. 150 kişiye kadar ağırlama kapasitemiz, özel dekorasyon çözümlerimiz ve gurme düğün menülerimizle yanınızdayız.",
    category: "Düğün & Nişan",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Kurumsal Buluşmalar",
    short: "İlham verici bir ortamda, verimli toplantılar ve seçkin iş yemekleri.",
    description: "Şehrin gürültüsünden uzak, yaratıcılığı tetikleyen sessiz ve rafine bir toplantı ortamı. Profesyonel ikram hizmetlerimiz ve teknolojik altyapımızla iş dünyasına butik çözümler sunuyoruz.",
    category: "Kurumsal",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Özel Kutlamalar",
    short: "Yıl dönümü, doğum günü ve rafine kutlamalarınız için kişiselleştirilmiş hizmet.",
    description: "Sadece size ve sevdiklerinize özel, her detayı titizlikle planlanmış kutlamalar. Şefimizin özel menüleri ve konağımızın benzersiz ambiyansıyla anılarınıza değer katın.",
    category: "Özel Gün",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80"
  }
];

export default async function OrganizationsPage() {
  let packs = fallbackPackages;

  try {
    const payload = await getPayloadClient();
    if (payload) {
      const docs = await payload.find({
        collection: "organization-packages",
        limit: 50,
        sort: "order"
      });

      if (docs.docs.length) {
        packs = docs.docs.map((doc: any) => ({
          title: doc.title,
          short: doc.short,
          description: doc.description || doc.short,
          category: doc.category,
          image: doc.image?.url || fallbackPackages[0].image
        }));
      }
    }
  } catch (e) {
    console.warn("Payload integration skipped for organizations, using detailed static fallback.");
  }

  return (
    <>
      <SiteHeader />
      <main className="section" style={{ paddingTop: '120px' }}>
        <div className="container">
          <SectionTitle
            eyebrow="ORGANİZASYON"
            title="Sizin Hikayeniz, Bizim Mekanımız"
            text="Ege'nin kalbinde, tarihin ve doğanın kucağında unutulmaz etkinliklere imza atıyoruz."
          />

          <div className="org-grid">
            {packs.map((item: any, index: number) => (
              <div key={item.title} className="org-card">
                <div className="org-image-wrapper">
                  <Image 
                    src={item.image} 
                    alt={item.title} 
                    fill 
                    className="object-cover"
                    priority={index === 0}
                  />
                </div>
                <div className="org-content">
                  <span className="eyebrow">{item.category}</span>
                  <h2 className="serif">{item.title}</h2>
                  <p>{item.description}</p>
                  <a href="#teklif" className="button secondary">TEKLİF TALEBİ</a>
                </div>
              </div>
            ))}
          </div>

          <div id="teklif" className="lead-section">
             <SectionTitle
                eyebrow="İLETİŞİM"
                title="Hayalinizi Planlayalım"
                text="Detayları bizimle paylaşın, uzman ekibimiz en kısa sürede size özel bir teklif hazırlasın."
              />
            <LeadForm />
          </div>
        </div>
      </main>

      <style jsx>{`
        .org-grid {
          display: flex;
          flex-direction: column;
          gap: 100px;
          margin-top: 80px;
        }

        .org-card {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .org-card:nth-child(even) {
          direction: rtl;
        }

        .org-card:nth-child(even) .org-content {
          direction: ltr;
        }

        .org-image-wrapper {
          position: relative;
          height: 500px;
          border-radius: 4px;
          overflow: hidden;
        }

        .org-content h2 {
          font-size: 2.5rem;
          margin: 20px 0;
        }

        .org-content p {
          font-size: 1.1rem;
          line-height: 1.8;
          color: #555;
          margin-bottom: 32px;
        }

        .lead-section {
          margin-top: 150px;
          padding: 100px 0;
          background: var(--soft);
        }

        @media (max-width: 1024px) {
          .org-card {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .org-card:nth-child(even) {
            direction: ltr;
          }
          .org-image-wrapper {
            height: 350px;
          }
        }
      `}</style>

      <SiteFooter />
    </>
  );
}
