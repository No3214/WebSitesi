export type Room = {
  slug: string;
  title: string;
  short: string;
  description: string;
  capacity: string;
  size: string;
  view: string;
  amenities: string[];
  images: string[];
  price?: number; // TL per night (cash/transfer)
};

// Standard amenities included in ALL rooms
export const standardAmenities = [
  "Klima",
  "LCD TV",
  "Mini Buzdolabı",
  "Ücretsiz Wi-Fi",
  "Özel Banyo",
  "Saç Kurutma Makinesi",
  "Sıvı Sabun & Şampuan",
  "Havlu Seti (Baş, Vücut, Yer)",
  "Terlik",
  "Su, Çay/Kahve İkramı",
  "Günlük Temizlik",
  "24 Saat Sıcak Su",
];

export const rooms: Room[] = [
  {
    slug: "standart-oda",
    title: "Standart Oda",
    short: "Taş duvarlar ve ahşap detaylarla bezeli, huzurlu iki kişilik konaklama.",
    description:
      "Kozbeyli Konağı'nın 500 yıllık taş mimarisinin en otantik örneklerinden biri. Geleneksel taş duvarlar, yüksek tavanlar ve Osmanlı dönemi mimari detaylarıyla süslenmiş odalar, modern konfor donanımlarıyla donatılmıştır. Serpme kahvaltı (sucuklu yumurta + pişi) dahildir.",
    capacity: "2 Kişi",
    size: "~25 m²",
    view: "Bahçe / Dağ",
    amenities: [...standardAmenities, "Çift Kişilik Yatak"],
    images: [
      "/images/rooms/standart-1.jpeg",
      "/images/rooms/standart-2.jpeg",
      "/images/rooms/standart-3.jpeg",
      "/images/rooms/standart-4.jpeg",
    ],
    price: 3500,
  },
  {
    slug: "standart-bahce-manzarali-oda",
    title: "Standart Bahçe Manzaralı Oda",
    short: "İç bahçe manzaralı, huzurlu ve doğayla iç içe konaklama.",
    description:
      "Konağın tarihi iç bahçesine bakan bu oda, 180 yıllık Dibek Kahvesi ritüelinin gerçekleştiği avluya sadece bir adım uzaklıktadır. Taş duvarların sağladığı doğal termal kütle etkisiyle yaz aylarında serin, kış aylarında sıcak bir iç mekan sunar. 'Slow Living' felsefesini tam merkezinde deneyimlemek isteyen misafirler için idealdir. Serpme kahvaltı dahildir.",
    capacity: "2 Kişi",
    size: "~25 m²",
    view: "İç Bahçe",
    amenities: [...standardAmenities, "Bahçe Manzarası", "Çift Kişilik Yatak"],
    images: [
      "/images/rooms/bahce-1.jpeg",
      "/images/rooms/bahce-2.jpeg",
      "/images/rooms/bahce-3.jpeg",
      "/images/rooms/bahce-4.jpeg",
    ],
    price: 3500,
  },
  {
    slug: "standart-deniz-manzarali-oda",
    title: "Standart Deniz Manzaralı Oda",
    short: "Foça Körfezi'ne panoramik manzaralı, romantik kaçamak için ideal.",
    description:
      "Kozbeyli tepelerinin yüksek konumundan Foça Körfezi'ne panoramik manzara sunan özel odamız. Taş duvarların sağladığı doğal izolasyon sayesinde yaz aylarında serin, kış aylarında sıcak bir iç mekan. Ege Denizi üzerinden batan güneşin eşsiz manzarasını odanın mahremiyetinde izleme imkanı. Özellikle romantik kaçamaklar ve huzur arayan çiftler tarafından tercih edilmektedir. Serpme kahvaltı dahildir.",
    capacity: "2 Kişi",
    size: "~25 m²",
    view: "Foça Körfezi Panoramik",
    amenities: [...standardAmenities, "Deniz Manzarası", "Çift Kişilik Yatak"],
    images: [
      "/images/rooms/deniz-1.jpeg",
      "/images/rooms/deniz-2.jpeg",
      "/images/rooms/deniz-3.jpeg",
      "/images/rooms/deniz-4.jpeg",
    ],
    price: 3500,
  },
  {
    slug: "superior-oda",
    title: "Superior Oda",
    short: "Konağın en seçkin odası. Geniş alan, premium donanım ve panoramik manzara.",
    description:
      "Kozbeyli Konağı'nın sunduğu en yüksek konfor standartlarını temsil eden Superior Oda. Yaklaşık 35 m² geniş alanıyla, özel tasarım detaylar ve premium buklet ürünleriyle donatılmıştır. 500 yıllık taş mimarinin en seçkin örneği olan bu oda, özellikle balayı çiftleri ve özel yıl dönümü kutlamaları için tercih edilmektedir. Serpme kahvaltı dahildir.",
    capacity: "2-3 Kişi",
    size: "~35 m²",
    view: "Panoramik Manzara",
    amenities: [...standardAmenities, "Premium Buklet Seti", "Geniş Yaşam Alanı"],
    images: [
      "/images/rooms/deniz-1.jpeg",
      "/images/rooms/deniz-2.jpeg",
    ],
    price: 4850,
  },
  {
    slug: "uc-kisilik-oda",
    title: "Üç Kişilik Oda",
    short: "3 kişiye kadar konfor, geniş ve ferah taş mimari.",
    description:
      "Yaklaşık 30 m² geniş yerleşimiyle küçük gruplar ve arkadaşlar için ideal. Yüksek tavanlı Osmanlı konut mimarisinin ferahlığını sunan oda, kalın taş duvarların sağladığı doğal mikro-klima avantajıyla her zaman ideal bir konfora sahiptir. Çift kişilik + tek kişilik yatak düzeni mevcuttur. Serpme kahvaltı dahildir.",
    capacity: "3 Kişi",
    size: "~30 m²",
    view: "Bahçe / Dağ",
    amenities: [...standardAmenities, "Çift + Tek Kişilik Yatak"],
    images: [
      "/images/rooms/uc-kisilik-1.jpeg",
      "/images/rooms/uc-kisilik-2.jpeg",
      "/images/rooms/uc-kisilik-3.jpeg",
      "/images/rooms/uc-kisilik-4.jpeg",
    ],
    price: 4250,
  },
  {
    slug: "aile-odasi",
    title: "Aile Odası (4 Kişilik)",
    short: "50 m² geniş alan, 1 çift + 2 tek yatak, aileler için ideal.",
    description:
      "Yaklaşık 50 m² geniş alanıyla aileler için tasarlanmış süit yapıda oda. 1 çift kişilik + 2 tek kişilik yatak düzeni ile 4 kişilik aile konforu sunar. Taş mimarinin sunduğu prestijli görünüm, modern banyo üniteleri ve geniş oturma alanlarıyla desteklenmiştir. Ücretsiz bebek yatağı hizmeti mevcuttur. Serpme kahvaltı dahildir.",
    capacity: "4 Kişi",
    size: "~50 m²",
    view: "Bahçe / Köy",
    amenities: [
      ...standardAmenities,
      "1 Çift + 2 Tek Kişilik Yatak",
      "Geniş Yaşam Alanı",
      "Bebek Yatağı Opsiyonu",
    ],
    images: [
      "/images/rooms/aile-1.jpeg",
      "/images/rooms/aile-2.jpeg",
      "/images/rooms/aile-3.jpeg",
      "/images/rooms/aile-4.jpeg",
      "/images/rooms/aile-5.jpeg",
    ],
    price: 5000,
  },
  {
    slug: "balkonlu-aile-odasi",
    title: "Balkonlu Aile Odası (4 Kişilik)",
    short: "Özel balkonlu, en geniş ve prestijli aile ünitesi.",
    description:
      "Konağın en geniş odalarından biri olan Balkonlu Aile Odası, özel balkonu ile Kozbeyli Köyü'nün tarihi dokusunu ve temiz havasını özel bir alanda deneyimleme fırsatı verir. 1 çift + 2 tek kişilik yatak düzeni ile 4 kişilik aileler için idealdir. Balkon, sabah kahvesi veya akşam dinlenmesi için eşsiz bir kaçış noktasıdır. Serpme kahvaltı dahildir.",
    capacity: "4 Kişi",
    size: "~50 m²",
    view: "Bahçe / Köy Manzarası",
    amenities: [
      ...standardAmenities,
      "Özel Balkon",
      "1 Çift + 2 Tek Kişilik Yatak",
      "Geniş Yaşam Alanı",
      "Bebek Yatağı Opsiyonu",
    ],
    images: [
      "/images/rooms/balkonlu-aile-1.jpeg",
      "/images/rooms/balkonlu-aile-2.jpeg",
    ],
    price: 5000,
  },
];

// Room count summary for use across the site
export const roomSummary = {
  total: 16,
  types: [
    { type: "Çift Kişilik Oda", count: 9, note: "4'ü tek kişi için de uygun" },
    { type: "Üç Kişilik Oda", count: 2 },
    { type: "Superior Oda", count: 1 },
    { type: "Aile Odası (4 Kişilik)", count: 4 },
  ],
};
