import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SectionTitle } from "@/components/section-title";
import { HotelRunnerEmbed } from "@/components/hotel-runner-embed";
import { rooms } from "@/data/rooms";

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main>
        <section className="hero">
          <div 
            className="hero-bg" 
            style={{ 
              backgroundImage: 'url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80")',
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              position: 'absolute',
              inset: 0,
              zIndex: 0
            }} 
          />
          <div className="container" style={{ position: 'relative', zIndex: 2, paddingTop: '100px' }}>
            <span className="eyebrow" style={{ color: 'var(--ivory)' }}>ESKİ FOÇA, KOZBEYLİ</span>
            <h1 className="serif" style={{ color: 'var(--white)', fontSize: '4.5rem', lineHeight: 1.1, marginBottom: '32px' }}>
              Tarihin Kalbinde<br />Lüks Bir Kaçış
            </h1>
            <div style={{ display: 'flex', gap: '20px' }}>
               <Link href="/odalar" className="button primary">ODALARIMIZI KEŞFEDİN</Link>
               <a href="#hikayemiz" className="button secondary" style={{ color: 'var(--white)', borderColor: 'var(--white)' }}>HİKAYEMİZ</a>
            </div>
          </div>
        </section>

        <section className="section" id="konaklama">
          <div className="container">
            <SectionTitle
              eyebrow="Konaklama"
              title="Sükunet ve Konfor"
              text="Her detayı özenle tasarlanmış, ruhu olan odalarımızda tarihin dokusunu hissedin."
            />
            <div className="card-grid">
              {rooms.slice(0, 3).map((room) => (
                <Link key={room.slug} href={`/odalar/${room.slug}`} className="card">
                  <img src={room.images[0]} alt={room.title} />
                  <div className="card-body">
                    <span className="meta">{room.capacity} · {room.view}</span>
                    <h3>{room.title}</h3>
                    <p>{room.short}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-alt" id="gastronomi">
          <div className="container">
            <SectionTitle
              eyebrow="Gastronomi"
              title="Ege'nin Yerel Lezzetleri"
              text="Bahçemizden gelen taze ürünlerle hazırlanan, taş fırınımızda pişen geleneksel Ege mutfağının en seçkin örnekleri."
            />
            <div className="feature-grid">
              <div className="feature-box">
                <h3>Köy Kahvaltısı</h3>
                <p>Mevsimsel reçeller, yerel peynirler ve sıcacık taş fırın ürünleri.</p>
              </div>
              <div className="feature-box">
                <h3>Akşam Yemeği</h3>
                <p>Deniz ürünleri, zeytinyağlılar ve özel şarap kavımızdan eşleşmeler.</p>
              </div>
              <div className="feature-box">
                <h3>Dibek Kahvesi</h3>
                <p>Kozbeyli&apos;nin tescilli dibek kahvesi keyfini konağımızın balkonunda yaşayın.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="organizasyon">
          <div className="container">
            <SectionTitle
              eyebrow="Organizasyon"
              title="Hayatınızın En Özel Anları"
              text="Butik düğünlerden kurumsal buluşmalara kadar, her etkinliği bir masalsı serüvene dönüştürüyoruz."
            />
            <div className="feature-grid" style={{ marginTop: '60px' }}>
             <div className="feature-box">
               <div style={{ height: '300px', backgroundColor: '#eee', marginBottom: '20px', backgroundImage: 'url("https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80")', backgroundSize: 'cover' }}></div>
               <h3>Odalarımız</h3>
               <p>Taş mimarinin serinliğini lüks detaylarla buluşturan rafine yaşam alanları.</p>
               <Link href="/odalar" className="serif" style={{ color: 'var(--gold)', borderBottom: '1px solid var(--gold)', fontSize: '0.9rem' }}>İNCELE →</Link>
             </div>
             <div className="feature-box">
               <div style={{ height: '300px', backgroundColor: '#eee', marginBottom: '20px', backgroundImage: 'url("https://images.unsplash.com/photo-1550966842-30c29a60e9d3?auto=format&fit=crop&w=800&q=80")', backgroundSize: 'cover' }}></div>
               <h3>Restoran</h3>
               <p>Kendi bahçemizden taze mahsullerle hazırlanan Geleneksel Ege Mutfağı.</p>
               <Link href="/menu" className="serif" style={{ color: 'var(--gold)', borderBottom: '1px solid var(--gold)', fontSize: '0.9rem' }}>MENÜYÜ GÖR →</Link>
             </div>
             <div className="feature-box">
               <div style={{ height: '300px', backgroundColor: '#eee', marginBottom: '20px', backgroundImage: 'url("https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80")', backgroundSize: 'cover' }}></div>
               <h3>Etkinlikler</h3>
               <p>Düğün, nişan ve kurumsal buluşmalarınız için masalsı bir atmosfer.</p>
               <Link href="/organizasyonlar" className="serif" style={{ color: 'var(--gold)', borderBottom: '1px solid var(--gold)', fontSize: '0.9rem' }}>PLANLAYIN →</Link>
             </div>
            </div>
          </div>
        </section>

        <section className="section section-alt" id="rezervasyon">
          <div className="container" style={{ maxWidth: '800px' }}>
            <SectionTitle
              eyebrow="Rezervasyon"
              title="Yerinizi Ayırtın"
              text="En iyi fiyat garantisi ve size özel ayrıcalıklar için direkt rezervasyon yapın."
            />
            <HotelRunnerEmbed />
          </div>
        </section>
      </main>
    </>
  );
}
