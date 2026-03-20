export type Room = {
  slug: string;
  title: string;
  titleEn: string;
  short: string;
  shortEn: string;
  description: string;
  descriptionEn: string;
  capacity: string;
  capacityEn: string;
  size: string;
  view: string;
  viewEn: string;
  amenities: string[];
  amenitiesEn: string[];
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

export const standardAmenitiesEn = [
  "Air Conditioning",
  "LCD TV",
  "Mini Fridge",
  "Free Wi-Fi",
  "Private Bathroom",
  "Hair Dryer",
  "Liquid Soap & Shampoo",
  "Towel Set (Head, Body, Floor)",
  "Slippers",
  "Complimentary Water, Tea & Coffee",
  "Daily Housekeeping",
  "24-Hour Hot Water",
];

export const rooms: Room[] = [
  {
    slug: "standart-oda",
    title: "Standart Oda",
    titleEn: "Standard Room",
    short: "Taş duvarlar ve ahşap detaylarla bezeli, huzurlu iki kişilik konaklama.",
    shortEn: "A peaceful retreat for two, adorned with stone walls and wooden details.",
    description:
      "Kozbeyli Konağı'nın 500 yıllık taş mimarisinin en otantik örneklerinden biri. Geleneksel taş duvarlar, yüksek tavanlar ve Osmanlı dönemi mimari detaylarıyla süslenmiş odalar, modern konfor donanımlarıyla donatılmıştır. Serpme kahvaltı (sucuklu yumurta + pişi) dahildir.",
    descriptionEn:
      "One of the most authentic examples of Kozbeyli Mansion's 500-year-old stone architecture. Rooms adorned with traditional stone walls, high ceilings, and Ottoman-era architectural details, equipped with modern comfort amenities. Spread breakfast (eggs with sucuk + pişi) included.",
    capacity: "2 Kişi",
    capacityEn: "2 Guests",
    size: "~25 m²",
    view: "Bahçe / Dağ",
    viewEn: "Garden / Mountain",
    amenities: [...standardAmenities, "Çift Kişilik Yatak"],
    amenitiesEn: [...standardAmenitiesEn, "Double Bed"],
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
    titleEn: "Standard Garden View Room",
    short: "İç bahçe manzaralı, huzurlu ve doğayla iç içe konaklama.",
    shortEn: "Peaceful accommodation with inner garden views, surrounded by nature.",
    description:
      "Konağın tarihi iç bahçesine bakan bu oda, 180 yıllık Dibek Kahvesi ritüelinin gerçekleştiği avluya sadece bir adım uzaklıktadır. Taş duvarların sağladığı doğal termal kütle etkisiyle yaz aylarında serin, kış aylarında sıcak bir iç mekan sunar. 'Slow Living' felsefesini tam merkezinde deneyimlemek isteyen misafirler için idealdir. Serpme kahvaltı dahildir.",
    descriptionEn:
      "This room overlooks the mansion's historic inner garden, just a step away from the courtyard where the 180-year-old Dibek Coffee ritual takes place. The natural thermal mass of stone walls keeps the interior cool in summer and warm in winter. Ideal for guests seeking the essence of 'Slow Living.' Spread breakfast included.",
    capacity: "2 Kişi",
    capacityEn: "2 Guests",
    size: "~25 m²",
    view: "İç Bahçe",
    viewEn: "Inner Garden",
    amenities: [...standardAmenities, "Bahçe Manzarası", "Çift Kişilik Yatak"],
    amenitiesEn: [...standardAmenitiesEn, "Garden View", "Double Bed"],
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
    titleEn: "Standard Sea View Room",
    short: "Foça Körfezi'ne panoramik manzaralı, romantik kaçamak için ideal.",
    shortEn: "Panoramic views of Foça Bay, ideal for a romantic getaway.",
    description:
      "Kozbeyli tepelerinin yüksek konumundan Foça Körfezi'ne panoramik manzara sunan özel odamız. Taş duvarların sağladığı doğal izolasyon sayesinde yaz aylarında serin, kış aylarında sıcak bir iç mekan. Ege Denizi üzerinden batan güneşin eşsiz manzarasını odanın mahremiyetinde izleme imkanı. Özellikle romantik kaçamaklar ve huzur arayan çiftler tarafından tercih edilmektedir. Serpme kahvaltı dahildir.",
    descriptionEn:
      "Our exclusive room offering panoramic views of Foça Bay from the elevated Kozbeyli hills. Natural insulation from stone walls keeps the interior cool in summer and warm in winter. Watch the unique sunset over the Aegean Sea from the privacy of your room. Especially preferred by couples seeking romance and tranquility. Spread breakfast included.",
    capacity: "2 Kişi",
    capacityEn: "2 Guests",
    size: "~25 m²",
    view: "Foça Körfezi Panoramik",
    viewEn: "Foça Bay Panoramic",
    amenities: [...standardAmenities, "Deniz Manzarası", "Çift Kişilik Yatak"],
    amenitiesEn: [...standardAmenitiesEn, "Sea View", "Double Bed"],
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
    titleEn: "Superior Room",
    short: "Konağın en seçkin odası. Geniş alan, premium donanım ve panoramik manzara.",
    shortEn: "The mansion's finest room. Spacious, premium amenities, and panoramic views.",
    description:
      "Kozbeyli Konağı'nın sunduğu en yüksek konfor standartlarını temsil eden Superior Oda. Yaklaşık 35 m² geniş alanıyla, özel tasarım detaylar ve premium buklet ürünleriyle donatılmıştır. 500 yıllık taş mimarinin en seçkin örneği olan bu oda, özellikle balayı çiftleri ve özel yıl dönümü kutlamaları için tercih edilmektedir. Serpme kahvaltı dahildir.",
    descriptionEn:
      "The Superior Room represents the highest comfort standards offered by Kozbeyli Mansion. With approximately 35 m² of spacious area, it features custom design details and premium amenities. The finest example of 500-year-old stone architecture, this room is especially preferred for honeymoons and special anniversary celebrations. Spread breakfast included.",
    capacity: "2-3 Kişi",
    capacityEn: "2-3 Guests",
    size: "~35 m²",
    view: "Panoramik Manzara",
    viewEn: "Panoramic View",
    amenities: [...standardAmenities, "Premium Buklet Seti", "Geniş Yaşam Alanı"],
    amenitiesEn: [...standardAmenitiesEn, "Premium Amenity Set", "Spacious Living Area"],
    images: [
      "/images/rooms/deniz-1.jpeg",
      "/images/rooms/deniz-2.jpeg",
    ],
    price: 4850,
  },
  {
    slug: "uc-kisilik-oda",
    title: "Üç Kişilik Oda",
    titleEn: "Triple Room",
    short: "3 kişiye kadar konfor, geniş ve ferah taş mimari.",
    shortEn: "Comfort for up to 3 guests in a spacious stone-built setting.",
    description:
      "Yaklaşık 30 m² geniş yerleşimiyle küçük gruplar ve arkadaşlar için ideal. Yüksek tavanlı Osmanlı konut mimarisinin ferahlığını sunan oda, kalın taş duvarların sağladığı doğal mikro-klima avantajıyla her zaman ideal bir konfora sahiptir. Çift kişilik + tek kişilik yatak düzeni mevcuttur. Serpme kahvaltı dahildir.",
    descriptionEn:
      "Ideal for small groups and friends with its approximately 30 m² spacious layout. The room offers the airy feel of high-ceilinged Ottoman residential architecture, always maintaining ideal comfort thanks to the natural micro-climate advantage of thick stone walls. Double + single bed arrangement available. Spread breakfast included.",
    capacity: "3 Kişi",
    capacityEn: "3 Guests",
    size: "~30 m²",
    view: "Bahçe / Dağ",
    viewEn: "Garden / Mountain",
    amenities: [...standardAmenities, "Çift + Tek Kişilik Yatak"],
    amenitiesEn: [...standardAmenitiesEn, "Double + Single Bed"],
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
    titleEn: "Family Room (4 Guests)",
    short: "50 m² geniş alan, 1 çift + 2 tek yatak, aileler için ideal.",
    shortEn: "50 m² spacious area, 1 double + 2 single beds, ideal for families.",
    description:
      "Yaklaşık 50 m² geniş alanıyla aileler için tasarlanmış süit yapıda oda. 1 çift kişilik + 2 tek kişilik yatak düzeni ile 4 kişilik aile konforu sunar. Taş mimarinin sunduğu prestijli görünüm, modern banyo üniteleri ve geniş oturma alanlarıyla desteklenmiştir. Ücretsiz bebek yatağı hizmeti mevcuttur. Serpme kahvaltı dahildir.",
    descriptionEn:
      "A suite-style room designed for families with approximately 50 m² of space. Offers family comfort for 4 with 1 double + 2 single bed arrangement. Complemented by the prestigious stone architecture, modern bathroom units, and spacious seating areas. Complimentary baby cot available. Spread breakfast included.",
    capacity: "4 Kişi",
    capacityEn: "4 Guests",
    size: "~50 m²",
    view: "Bahçe / Köy",
    viewEn: "Garden / Village",
    amenities: [
      ...standardAmenities,
      "1 Çift + 2 Tek Kişilik Yatak",
      "Geniş Yaşam Alanı",
      "Bebek Yatağı Opsiyonu",
    ],
    amenitiesEn: [
      ...standardAmenitiesEn,
      "1 Double + 2 Single Beds",
      "Spacious Living Area",
      "Baby Cot Option",
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
    titleEn: "Balcony Family Room (4 Guests)",
    short: "Özel balkonlu, en geniş ve prestijli aile ünitesi.",
    shortEn: "Private balcony, the most spacious and prestigious family unit.",
    description:
      "Konağın en geniş odalarından biri olan Balkonlu Aile Odası, özel balkonu ile Kozbeyli Köyü'nün tarihi dokusunu ve temiz havasını özel bir alanda deneyimleme fırsatı verir. 1 çift + 2 tek kişilik yatak düzeni ile 4 kişilik aileler için idealdir. Balkon, sabah kahvesi veya akşam dinlenmesi için eşsiz bir kaçış noktasıdır. Serpme kahvaltı dahildir.",
    descriptionEn:
      "One of the mansion's most spacious rooms, the Balcony Family Room offers a private balcony to experience the historic texture and fresh air of Kozbeyli Village. Ideal for families of 4 with 1 double + 2 single bed arrangement. The balcony serves as a unique retreat for morning coffee or evening relaxation. Spread breakfast included.",
    capacity: "4 Kişi",
    capacityEn: "4 Guests",
    size: "~50 m²",
    view: "Bahçe / Köy Manzarası",
    viewEn: "Garden / Village View",
    amenities: [
      ...standardAmenities,
      "Özel Balkon",
      "1 Çift + 2 Tek Kişilik Yatak",
      "Geniş Yaşam Alanı",
      "Bebek Yatağı Opsiyonu",
    ],
    amenitiesEn: [
      ...standardAmenitiesEn,
      "Private Balcony",
      "1 Double + 2 Single Beds",
      "Spacious Living Area",
      "Baby Cot Option",
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
    { type: "Çift Kişilik Oda", typeEn: "Double Room", count: 9, note: "4'ü tek kişi için de uygun" },
    { type: "Üç Kişilik Oda", typeEn: "Triple Room", count: 2 },
    { type: "Superior Oda", typeEn: "Superior Room", count: 1 },
    { type: "Aile Odası (4 Kişilik)", typeEn: "Family Room (4 Guests)", count: 4 },
  ],
};

// Helper to get localized room fields
export function localizeRoom(room: Room, locale: "tr" | "en") {
  return {
    ...room,
    title: locale === "en" ? room.titleEn : room.title,
    short: locale === "en" ? room.shortEn : room.short,
    description: locale === "en" ? room.descriptionEn : room.description,
    capacity: locale === "en" ? room.capacityEn : room.capacity,
    view: locale === "en" ? room.viewEn : room.view,
    amenities: locale === "en" ? room.amenitiesEn : room.amenities,
  };
}
