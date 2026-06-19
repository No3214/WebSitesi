"use client";

import { motion } from "framer-motion";
import Image from "next/image";

type Locale = "tr" | "en";

/**
 * Heritage Archive (Deep Digital Twin)
 * High-density technical data for architectural and restoration enthusiasts.
 */
const archiveCopy = {
  tr: {
    watermark: "Miras",
    title: "Miras Arşivi: Görsel Hafıza",
    text:
      "Kozbeyli Konağı'nın ruhunu oluşturan dokuların, kokuların ve ışıkların sinematik arşivi. Bilimin değil, mimarinin ve doğanın şiirsel detaylarını keşfedin.",
    archives: [
    {
      title: "Horasan'ın Gözyaşı",
      specs: [
        "Kiremit Tozu Patinası",
        "Sönmüş Kireç Dokusu",
        "Asırlık Bağlayıcılık",
        "Taşın Nefesi"
      ],
      description: "Bu duvarlar sadece taş ve kum değil; 19. yüzyıl tescilli taş konağın nefes alan dokusudur. Beş asırlık Kozbeyli köy hafızasıyla çevrelenen Horasan harcı, konağımıza o &apos;yaşayan bina&apos; ruhunu veren asıl sırdır.",
      image: "/images/odalar/superrior-3-kisilik-oda-deniz-manzarali/2.jpg"
    },
    {
      id: "zeytinyagi",
      title: "Sıvı Altın: Kozbeyli",
      specs: [
        "Soğuk Sıkım Saflık",
        "Aziz Zeytin Ağacı",
        "Filtresiz Doğallık",
        "Hasat Mirası"
      ],
      description: "Marka etiketlerinin ötesinde, toprağımızın bize sunduğu en saf hali. Her damlasında Kozbeyli toprağının karakterini taşıyan, el değmemiş, dürüst ve kadim bir tat.",
      image: "/images/odalar/standart-bahce-manzarali-oda/2.jpg"
    },
    {
      title: "Ahşabın Şiiri",
      specs: [
        "Sedir Kokusunun İzi",
        "Bağdadi İşçilik",
        "Tüccar Zarifliği",
        "Eski Pithoi Küpleri"
      ],
      description: "Zemin katın devasa taş kemerleri altındaki ahşap detaylar, konağın tüccar geçmişinin sessiz temsilcileridir. Ahşabın kokusu, tarihin içinden süzülüp bugüne ulaşan bir zaman yolculuğudur.",
      image: "/images/odalar/standart-oda/1.jpg"
    }
    ],
  },
  en: {
    watermark: "Heritage",
    title: "Heritage Archive: Visual Memory",
    text:
      "A cinematic archive of the textures, scents and light that shape Kozbeyli Konağı. Discover the poetic detail of architecture and nature through the mansion's historic texture.",
    archives: [
      {
        title: "The Trace of Horasan",
        specs: [
          "Tile Dust Patina",
          "Lime Texture",
          "Centuries of Binding",
          "Breathing Stone",
        ],
        description:
          "These walls are not only stone and sand. Traditional Horasan mortar gives the building its living character and keeps the historic fabric breathable.",
        image: "/images/odalar/superrior-3-kisilik-oda-deniz-manzarali/2.jpg",
      },
      {
        id: "zeytinyagi",
        title: "Liquid Gold: Kozbeyli",
        specs: [
          "Cold-Pressed Purity",
          "Ancient Olive Trees",
          "Unfiltered Character",
          "Harvest Heritage",
        ],
        description:
          "Beyond labels, this is the purest expression of our soil: honest, untouched olive oil carrying the character of Kozbeyli in every drop.",
        image: "/images/odalar/standart-bahce-manzarali-oda/2.jpg",
      },
      {
        title: "The Poetry of Wood",
        specs: [
          "Cedar Scent",
          "Baghdadi Craft",
          "Merchant Elegance",
          "Old Pithoi Jars",
        ],
        description:
          "The wooden details beneath the ground-floor stone arches quietly echo the mansion's merchant past and bring a sense of time into the present.",
        image: "/images/odalar/standart-oda/1.jpg",
      },
    ],
  },
};

export const HeritageArchive = ({ locale = "tr" }: { locale?: Locale }) => {
  const copy = archiveCopy[locale];

  return (
    <div
      className="py-24 rounded-[40px] border p-12 overflow-hidden relative group"
      style={{
        background:
          "linear-gradient(135deg, rgba(255, 252, 246, 0.98), rgba(241, 234, 220, 0.94))",
        borderColor: "rgba(61, 74, 59, 0.12)",
        boxShadow: "0 24px 70px rgba(68, 53, 31, 0.1)",
      }}
    >
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
        <div className="serif text-[120px] text-[var(--olive)] uppercase tracking-tighter">{copy.watermark}</div>
      </div>

      <div className="relative z-10 mb-16">
        <h3 className="serif text-4xl text-[var(--olive)] italic mb-4">{copy.title}</h3>
        <p className="text-[var(--muted)] max-w-2xl text-sm leading-relaxed">
          {copy.text}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-12 relative z-10">
        {copy.archives.map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
            className="flex flex-col gap-6"
          >
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden transition-all duration-1000 border border-[rgba(61,74,59,0.14)]">
              <Image src={item.image} alt={item.title} fill className="object-cover scale-110 group-hover:scale-100 transition-transform duration-[2000ms]" />
              <div className="absolute inset-x-4 bottom-4 bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/5">
                <div className="grid grid-cols-2 gap-2">
                  {item.specs.map((spec, j) => (
                    <div key={j} className="text-[9px] text-ivory/70 uppercase tracking-widest border-l border-gold pl-2">
                      {spec}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-[var(--olive)] font-serif text-xl mb-3">{item.title}</h4>
              <p className="text-[var(--muted)] text-sm leading-relaxed">{item.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
