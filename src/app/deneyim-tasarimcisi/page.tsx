import { Metadata } from "next";
import { ExperienceDesignerClient } from "@/components/experience-designer-client";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Slow Living Deneyim Tasarımcısı",
  description: "Kozbeyli'de yavaş yaşamı (Slow Living) keşfetmek için 1-3 günlük size özel rotanızı tasarlayın. Gurme, romantik ve tarihi duraklarınızı kişiselleştirin.",
  keywords: ["kozbeyli deneyim rotası", "slow living rota tasarlama", "foça gezi rehberi", "butik otel gezi rotası"],
  alternates: { canonical: "/deneyim-tasarimcisi" }
};

export default function ExperienceDesignerPage() {
  return (
    <>
      <SiteHeader />
      <main className="section" style={{ paddingTop: "120px" }}>
        <ExperienceDesignerClient />
      </main>
    </>
  );
}
