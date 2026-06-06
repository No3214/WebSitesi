import { StoryHero, StorySegment } from "@/components/storytelling";
import { SiteHeader } from "@/components/site-header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gastronomi & Antakya Mutfağı | Kozbeyli Konağı",
  description: "Foça'da Antakya ve Ege mutfağının buluşma noktası. 500 yıllık taş dibek kahvesi ve İnci Hanım'ın imza reçeteleriyle gurme bir lezzet serüveni.",
  keywords: ["antakya mutfağı izmir", "dibek kahvesi", "kozbeyli restoran", "inci hanım mutfağı", "gurme ege kahvaltısı"],
};

export default function GastronomyPage() {
  return (
    <main className="min-h-screen bg-black">
      <SiteHeader />
      
      <StoryHero 
        title="Gastronomi Mirası" 
        subtitle="ANTAKYA'DAN EGE'YE BİR LEZZET KÖPRÜSÜ" 
      />

      <StorySegment 
        title="İnci Hanım'ın Mutfağı"
        content="Kozbeyli Konağı'nın mutfağı, sadece bir yemek alanı değil; İnci Hanım'ın Antakya kökenli aile mirası ile Ege'nin kadim topraklarını birleştiren bir 'Gastronomi Laboratuvarı'dır."
        side="left"
      />

      <StorySegment 
        title="Orijinal Taş Dibek"
        content="500 yıllık orijinal taş dibekte, her gün taze olarak elde dövülen Dibek Kahvesi, köydeki tek gerçek uygulayıcısı olduğumuz bir ritüeldir."
        side="right"
      />

      <StorySegment
        title="Farm-to-Table Kahvaltı"
        content="Serpme köy kahvaltımız, Kozbeyli'nin asırlık zeytin ağaçlarından ve İnci Hanım'ın geleneksel reçel tariflerinden süzülen tam organik bir döngüdür."
        side="left"
      />

      <section style={{ padding: "72px 24px", maxWidth: 1080, margin: "0 auto" }}>
        <h2 style={{ color: "#f5f1e8", fontSize: "1.8rem", textAlign: "center", marginBottom: 12, fontFamily: "var(--font-serif, serif)" }}>
          Mutfaktan Canlı Kareler
        </h2>
        <p style={{ color: "rgba(245,241,232,0.7)", textAlign: "center", marginBottom: 40 }}>
          Serpme köy kahvaltısı ve taş ateşinde mıhlama — Kozbeyli sabahlarının gerçek hali.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 28 }}>
          <figure style={{ margin: 0 }}>
            <video
              controls
              preload="metadata"
              playsInline
              style={{ width: "100%", borderRadius: 16, display: "block", background: "#111" }}
              data-event="video_play_kahvalti"
            >
              <source src="/videos/kahvalti.mp4" type="video/mp4" />
            </video>
            <figcaption style={{ color: "rgba(245,241,232,0.6)", fontSize: "0.9rem", marginTop: 10, textAlign: "center" }}>
              Serpme Köy Kahvaltısı
            </figcaption>
          </figure>
          <figure style={{ margin: 0 }}>
            <video
              controls
              preload="metadata"
              playsInline
              style={{ width: "100%", borderRadius: 16, display: "block", background: "#111" }}
              data-event="video_play_mihlama"
            >
              <source src="/videos/mihlama.mp4" type="video/mp4" />
            </video>
            <figcaption style={{ color: "rgba(245,241,232,0.6)", fontSize: "0.9rem", marginTop: 10, textAlign: "center" }}>
              Taş Ateşinde Mıhlama
            </figcaption>
          </figure>
        </div>
      </section>
    </main>
  );
}
