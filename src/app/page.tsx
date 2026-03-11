"use client";

import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { SectionTitle } from "@/components/section-title";
import { SiteFooter } from "@/components/site-footer";
import { HotelRunnerEmbed } from "@/components/hotel-runner-embed";
import { rooms } from "@/data/rooms";
import { FadeIn, StaggerContainer } from "@/components/animations";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main>
        <section className="hero">
          <motion.div 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "easeOut" }}
            className="hero-bg" 
            style={{ position: 'absolute', inset: 0, zIndex: 0 }}
          >
            <Image
              src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80"
              alt="Kozbeyli Konağı Luxury Escape"
              fill
              className="object-cover"
              priority
            />
          </motion.div>
          <div className="container" style={{ position: 'relative', zIndex: 2, paddingTop: '100px' }}>
            <FadeIn direction="down">
              <span className="eyebrow" style={{ color: 'var(--ivory)' }}>ESKİ FOÇA, KOZBEYLİ</span>
            </FadeIn>
            <FadeIn delay={0.2}>
              <h1 className="serif" style={{ color: 'var(--white)', fontSize: '4.5rem', lineHeight: 1.1, marginBottom: '32px' }}>
                Tarihin Kalbinde<br />Lüks Bir Kaçış
              </h1>
            </FadeIn>
            <FadeIn delay={0.4} direction="up">
              <div style={{ display: 'flex', gap: '20px' }}>
                 <Link href="/odalar" className="button primary">ODALARIMIZI KEŞFEDİN</Link>
                 <a href="#hikayemiz" className="button secondary" style={{ color: 'var(--white)', borderColor: 'var(--white)' }}>HİKAYEMİZ</a>
              </div>
            </FadeIn>
          </div>
        </section>

        <section className="section" id="konaklama">
          <div className="container">
            <FadeIn>
              <SectionTitle
                eyebrow="Konaklama"
                title="Sükunet ve Konfor"
                text="Her detayı özenle tasarlanmış, ruhu olan odalarımızda tarihin dokusunu hissedin."
              />
            </FadeIn>
            <StaggerContainer delay={0.2}>
              <div className="card-grid">
                {rooms.map((room) => (
                  <FadeIn key={room.slug}>
                    <Link href={`/odalar/${room.slug}`} className="card">
                      <div style={{ position: 'relative', height: '250px' }}>
                        <Image
                          src={room.images[0]}
                          alt={room.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="card-body">
                        <span className="meta">{room.capacity} · {room.view}</span>
                        <h3>{room.title}</h3>
                        <p>{room.short}</p>
                      </div>
                    </Link>
                  </FadeIn>
                ))}
              </div>
            </StaggerContainer>
          </div>
        </section>

        <section className="section section-alt" id="gastronomi">
          <div className="container">
            <FadeIn>
              <SectionTitle
                eyebrow="Gastronomi"
                title="Ege'nin Yerel Lezzetleri"
                text="Bahçemizden gelen taze ürünlerle hazırlanan, taş fırınımızda pişen geleneksel Ege mutfağının en seçkin örnekleri."
              />
            </FadeIn>
            <div className="feature-grid">
              <FadeIn delay={0.1}>
                <div className="feature-box">
                  <div style={{ position: 'relative', height: '200px', marginBottom: '20px' }}>
                    <Image
                      src="https://images.unsplash.com/photo-1550966842-30c29a60e9d3?auto=format&fit=crop&w=800&q=80"
                      alt="Köy Kahvaltısı"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3>Köy Kahvaltısı</h3>
                  <p>Mevsimsel reçeller, yerel peynirler ve sıcacık taş fırın ürünleri.</p>
                </div>
              </FadeIn>
              <FadeIn delay={0.2}>
                <div className="feature-box">
                  <div style={{ position: 'relative', height: '200px', marginBottom: '20px' }}>
                    <Image
                      src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80"
                      alt="Akşam Yemeği"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3>Akşam Yemeği</h3>
                  <p>Deniz ürünleri, zeytinyağlılar ve özel şarap kavımızdan eşleşmeler.</p>
                </div>
              </FadeIn>
              <FadeIn delay={0.3}>
                <div className="feature-box">
                  <div style={{ position: 'relative', height: '200px', marginBottom: '20px' }}>
                    <Image
                      src="https://images.unsplash.com/photo-1544145945-f904253db0ad?auto=format&fit=crop&w=800&q=80"
                      alt="Dibek Kahvesi"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3>Dibek Kahvesi</h3>
                  <p>Kozbeyli&apos;nin tescilli dibek kahvesi keyfini konağımızın balkonunda yaşayın.</p>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        <section className="section" id="organizasyon">
          <div className="container">
            <FadeIn>
              <SectionTitle
                eyebrow="Organizasyon"
                title="Hayatınızın En Özel Anları"
                text="Butik düğünlerden kurumsal buluşmalara kadar, her etkinliği bir masalsı serüvene dönüştürüyoruz."
              />
            </FadeIn>
            <div className="feature-grid" style={{ marginTop: '60px' }}>
             <FadeIn delay={0.1}>
               <div className="feature-box">
                 <div style={{ height: '300px', position: 'relative', marginBottom: '20px' }}>
                   <Image
                      src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80"
                      alt="Odalarımız"
                      fill
                      className="object-cover"
                    />
                 </div>
                 <h3>Odalarımız</h3>
                 <p>Taş mimarinin serinliğini lüks detaylarla buluşturan rafine yaşam alanları.</p>
                 <Link href="/odalar" className="serif" style={{ color: 'var(--gold)', borderBottom: '1px solid var(--gold)', fontSize: '0.9rem' }}>İNCELE →</Link>
               </div>
             </FadeIn>
             <FadeIn delay={0.2}>
               <div className="feature-box">
                  <div style={{ height: '300px', position: 'relative', marginBottom: '20px' }}>
                   <Image
                      src="https://images.unsplash.com/photo-1550966842-30c29a60e9d3?auto=format&fit=crop&w=800&q=80"
                      alt="Restoran"
                      fill
                      className="object-cover"
                    />
                 </div>
                 <h3>Restoran</h3>
                 <p>Kendi bahçemizden taze mahsullerle hazırlanan Geleneksel Ege Mutfağı.</p>
                 <Link href="/menu" className="serif" style={{ color: 'var(--gold)', borderBottom: '1px solid var(--gold)', fontSize: '0.9rem' }}>MENÜYÜ GÖR →</Link>
               </div>
             </FadeIn>
             <FadeIn delay={0.3}>
               <div className="feature-box">
                  <div style={{ height: '300px', position: 'relative', marginBottom: '20px' }}>
                   <Image
                      src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"
                      alt="Etkinlikler"
                      fill
                      className="object-cover"
                    />
                 </div>
                 <h3>Etkinlikler</h3>
                 <p>Düğün, nişan ve kurumsal buluşmalarınız için masalsı bir atmosfer.</p>
                 <Link href="/organizasyonlar" className="serif" style={{ color: 'var(--gold)', borderBottom: '1px solid var(--gold)', fontSize: '0.9rem' }}>PLANLAYIN →</Link>
               </div>
             </FadeIn>
            </div>
          </div>
        </section>

        <section className="section section-alt" id="rezervasyon">
          <div className="container" style={{ maxWidth: '800px' }}>
            <FadeIn>
              <SectionTitle
                eyebrow="Rezervasyon"
                title="Yerinizi Ayırtın"
                text="En iyi fiyat garantisi ve size özel ayrıcalıklar için direkt rezervasyon yapın."
              />
              <HotelRunnerEmbed />
            </FadeIn>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
