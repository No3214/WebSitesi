"use client";

import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { SectionTitle } from "@/components/section-title";
import { SiteFooter } from "@/components/site-footer";
import { LeadForm } from "@/components/lead-form";
import { FadeIn, StaggerContainer } from "@/components/animations";

const fallbackPackages = [
  {
    title: "Tescilli Mirasta Butik Düğün",
    short: "19. yüzyıl tescilli taş konak avlusunda, asırlık zeytin ağaçları eşliğinde masalsı bir imza düğünü.",
    description: "Kozbeyli Konağı, Rum ve Türk mimarisinin ortak mirasından süzülen tescilli bir yapıdır. 150-200 kişiye kadar ağırlama kapasitesine sahip geniş avlumuzda, aslına uygun restore edilmiş taş duvarlar ve geleneksel Horasan harcı işçiliği arasında, her detayı 'Uzman' ekibimizce planlanan prestijli düğünlere ev sahipliği yapıyoruz.",
    category: "Düğün & Nişan",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Kurumsal 'Off-Site' Deneyimi",
    short: "İzmir'e 15 dakika mesafede, Kozbeyli taşının termal konforuyla yaratıcı kurumsal buluşmalar.",
    description: "Şehrin gürültüsünden arınmış, Kozbeyli taşının doğal nefes alma özelliği sayesinde yaz aylarında bile doğal serinlik sunan toplantı alanlarımızda verimliliği artırın. 40 kişiye kadar butik toplantı kapasitemiz, yüksek hızlı internet ve şömineli kapalı alanımızla kurumsal prestiji tarihle birleştiriyoruz.",
    category: "Kurumsal",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Gurme Gastronomi Kutlamaları",
    short: "İnci Hanım'ın Antakya mutfağı ve 180 yıllık dibek taşında dövülmüş kahve eşliğinde kutlamalar.",
    description: "Doğum günü veya yıl dönümü gibi özel anlarınızı, Antakya ve Ege mutfağının hibritleştiği gurme lezzetlerle taçlandırın. Konak avlusundaki 180 yıllık orijinal dibek taşında elde dövülen ve odun ateşinde ağır ağır pişen imza Dibek kahvemiz, kutlamanıza gerçek bir tarihsel doku katacak.",
    category: "Özel Gün",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80"
  }
];

export default function OrganizationsPage() {
  return (
    <>
      <SiteHeader />
      <main className="section" style={{ paddingTop: '120px' }}>
        <div className="container">
          <FadeIn>
            <SectionTitle
              eyebrow="ORGANİZASYON"
              title="Sizin Hikayeniz, Bizim Mekanımız"
              text="Ege'nin kalbinde, tarihin ve doğanın kucağında unutulmaz etkinliklere imza atıyoruz."
            />
          </FadeIn>

          <StaggerContainer delay={0.2}>
            <div className="org-grid">
              {fallbackPackages.map((item, index) => (
                <FadeIn key={item.title}>
                  <div className="org-card">
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
                </FadeIn>
              ))}
            </div>
          </StaggerContainer>

          <FadeIn delay={0.5}>
            <div id="teklif" className="lead-section">
               <SectionTitle
                  eyebrow="İLETİŞİM"
                  title="Hayalinizi Planlayalım"
                  text="Detayları bizimle paylaşın, uzman ekibimiz en kısa sürede size özel bir teklif hazırlasın."
                />
              <LeadForm />
            </div>
          </FadeIn>
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
