export type Room = {
  slug: string;
  title: string;
  short: string;
  capacity: string;
  size: string;
  view: string;
  images: string[];
};

export const rooms: Room[] = [
  {
    slug: "standart-oda",
    title: "Standart Oda",
    short: "Taş doku, sade konfor ve sakin atmosfer.",
    capacity: "1-2 Kişi",
    size: "20-24 m²",
    view: "Genel konum",
    images: ["/img/odalar/standart-1.jpeg", "/img/odalar/standart-2.jpeg"]
  },
  {
    slug: "standart-bahce-manzarali-oda",
    title: "Standart Bahçe Manzaralı Oda",
    short: "Bahçe tarafında daha yavaş ve huzurlu his veren oda tipi.",
    capacity: "1-2 Kişi",
    size: "20-24 m²",
    view: "Bahçe",
    images: ["/img/odalar/standart-bahce-1.jpeg"]
  },
  {
    slug: "standart-deniz-manzarali-oda",
    title: "Standart Deniz Manzaralı Oda",
    short: "Foça tarafını daha güçlü hissettiren manzara odası.",
    capacity: "1-2 Kişi",
    size: "20-24 m²",
    view: "Deniz",
    images: ["/img/odalar/standart-deniz-1.jpeg"]
  },
  {
    slug: "uc-kisilik-oda",
    title: "3 Kişilik Oda",
    short: "Arkadaş grupları ve küçük aileler için konforlu seçenek.",
    capacity: "3 Kişi",
    size: "24-28 m²",
    view: "Köy / Bahçe",
    images: ["/img/odalar/uclu-1.jpeg"]
  },
  {
    slug: "aile-odasi",
    title: "Aile Odası",
    short: "Aileler için daha geniş ve rahat kullanım alanı.",
    capacity: "4 Kişi",
    size: "30-36 m²",
    view: "Köy / Bahçe",
    images: ["/img/odalar/aile-1.jpeg"]
  },
  {
    slug: "balkonlu-aile-odasi",
    title: "Balkonlu Aile Odası",
    short: "Daha ferah ve açık alan hissi veren aile konaklaması.",
    capacity: "4 Kişi",
    size: "30-36 m²",
    view: "Balkon",
    images: ["/img/odalar/aile-balkon-1.jpeg"]
  },
  {
    slug: "superior-deniz-manzarali-oda",
    title: "Superior Oda Deniz Manzaralı",
    short: "Premium hissi ve deniz manzarasını birleştiren oda tipi.",
    capacity: "2 Kişi",
    size: "26-30 m²",
    view: "Deniz",
    images: ["/img/odalar/superior-deniz-1.jpeg"]
  },
  {
    slug: "superior-uc-kisilik-oda",
    title: "Superior 3 Kişilik Oda Deniz Manzaralı",
    short: "Daha büyük grup kullanımı için premium deniz manzaralı oda.",
    capacity: "3 Kişi",
    size: "28-34 m²",
    view: "Deniz",
    images: ["/img/odalar/superior-uclu-1.jpeg"]
  }
];
