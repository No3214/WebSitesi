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
    </main>
  );
}
