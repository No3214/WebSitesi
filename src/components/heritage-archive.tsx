"use client";

import { motion } from "framer-motion";
import Image from "next/image";

/**
 * Heritage Archive (Deep Digital Twin)
 * High-density technical data for architectural and restoration enthusiasts.
 */
export const HeritageArchive = () => {
  const archives = [
    {
      title: "Horasan'ın Gözyaşı",
      specs: [
        "Kiremit Tozu Patinası",
        "Sönmüş Kireç Dokusu",
        "Asırlık Bağlayıcılık",
        "Taşın Nefesi"
      ],
      description: "Bu duvarlar sadece taş ve kum değil; 500 yılın yorgunluğunu ve huzurunu emmiş bir hayattır. Geleneksel Horasan harcının o yumuşak dokusu, konağımıza o &apos;yaşayan bina&apos; ruhunu veren asıl sırdır.",
      image: "https://images.unsplash.com/photo-1518173946687-a4c8a483592e?auto=format&fit=crop&w=800&q=80"
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
      image: "https://images.unsplash.com/photo-1474979266404-7eaacbadb8c5?auto=format&fit=crop&w=800&q=80"
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
      image: "https://images.unsplash.com/photo-1464146072230-91cabc968266?auto=format&fit=crop&w=800&q=80"
    }
  ];

  return (
    <div className="py-24 bg-zinc-950 rounded-[40px] border border-zinc-900 p-12 overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
        <div className="serif text-[120px] text-gold uppercase tracking-tighter">Miras</div>
      </div>

      <div className="relative z-10 mb-16">
        <h3 className="serif text-4xl text-gold italic mb-4">Miras Arşivi: Görsel Hafıza</h3>
        <p className="text-zinc-500 max-w-2xl text-sm leading-relaxed">
          Kozbeyli Konağı'nın ruhunu oluşturan dokuların, kokuların ve ışıkların sinematik arşivi. 
          Bilimin değil, mimarinin ve doğanın şiirsel detaylarını keşfedin.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-12 relative z-10">
        {archives.map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
            className="flex flex-col gap-6"
          >
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000 border border-zinc-800">
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
              <h4 className="text-white font-serif text-xl mb-3">{item.title}</h4>
              <p className="text-zinc-500 text-sm leading-relaxed">{item.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
