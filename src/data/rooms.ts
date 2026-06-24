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
  video?: string;
  translations?: {
    en: Pick<Room, "title" | "short" | "description" | "capacity" | "view" | "amenities">;
  };
};

export type RoomLocale = "tr" | "en";

export function getLocalizedRoom(room: Room, locale: RoomLocale): Room {
  if (locale !== "en" || !room.translations?.en) return room;
  return {
    ...room,
    ...room.translations.en,
  };
}

export function getLocalizedRooms(locale: RoomLocale): Room[] {
  return rooms.map((room) => getLocalizedRoom(room, locale));
}

export const rooms: Room[] = [
  {
    slug: "standart-bahce-manzarali-oda",
    title: "Standart Bahçe Manzaralı Oda",
    short: "Kozbeyli Konağı'nın 24 metrekarelik, iç bahçe manzaralı huzurlu odası.",
    description: "Kozbeyli'nin 1870-1891 tüccar mirasını en saf haliyle yansıtan bu oda, orijinal andezit taş duvarları ve Horasan harcı detaylarıyla doğal bir termal kütle etkisi sunar. 180 yıllık tarihi Dibek Kahvesi ritüelinin gerçekleştiği avluya sadece bir adım uzaklıkta olup, köyün beş asırlık yerleşim hafızasını pencerelerinden içeri taşır. İç bahçe manzarasıyla 'Slow Living' felsefesini tam merkezinde deneyimlemek isteyen misafirlerimiz için tasarlanmıştır.",
    capacity: "2 Yetişkin",
    size: "24 m²",
    view: "İç Bahçe",
    amenities: ["Bahçe Manzarası", "Klima", "LCD TV", "Wi-Fi", "Özel Banyo"],
    images: ["/images/odalar/standart-bahce-manzarali-oda/1.jpg", "/images/odalar/standart-bahce-manzarali-oda/2.jpg", "/images/odalar/standart-bahce-manzarali-oda/3.jpg", "/images/odalar/standart-bahce-manzarali-oda/4.jpg", "/images/odalar/detay/oda-detay-3.jpg"],
    translations: {
      en: {
        title: "Standard Garden View Room",
        short: "A peaceful 24-square-meter room overlooking the inner garden.",
        description: "A calm stone room shaped for guests who want to stay close to the courtyard rhythm of Kozbeyli. Original stone textures, warm natural light and an inner-garden view create a quiet base for slow mornings and restful evenings.",
        capacity: "2 Adults",
        view: "Inner Garden",
        amenities: ["Garden View", "Air Conditioning", "LCD TV", "Wi-Fi", "Private Bathroom"],
      },
    },
  },
  {
    slug: "standart-deniz-manzarali-oda",
    title: "Standart Deniz Manzaralı Oda",
    short: "Ege Denizi manzaralı, 24 metrekarelik otantik konaklama birimi.",
    description: "Standart Deniz Manzaralı oda tipi, Kozbeyli Konağı'nın yüksek konum avantajını kullanarak misafirlerine panoramik Ege Denizi manzarası sunar. 24 metrekarelik yaşam alanına sahip olan bu odalar, 19. yüzyıl Osmanlı taş işçiliğinin estetik detaylarını modern buklet ürünleri ve teknolojik donanımlarla harmanlar. Her bir odada özel banyo, minibar, klima ve Netflix destekli Smart TV bulunmaktadır. Ege Denizi üzerinden batan güneşin eşsiz manzarasını odanın mahremiyetinde izleme imkanı sunan bu birimler, özellikle romantik kaçamaklar ve huzur arayan çiftler tarafından tercih edilmektedir. Taş duvarların sağladığı doğal izolasyon, yaz aylarında serin, kış aylarında ise sıcak bir iç mekan iklimi oluşturarak konforu maksimize eder.",
    capacity: "2 Yetişkin",
    size: "24 m²",
    view: "Ege Denizi",
    amenities: ["Deniz Manzarası", "Klima", "LCD TV", "Wi-Fi", "Özel Banyo"],
    images: ["/images/odalar/standart-deniz-manzarali-oda/1.jpg", "/images/odalar/standart-deniz-manzarali-oda/2.jpg", "/images/odalar/standart-deniz-manzarali-oda/3.jpg", "/images/odalar/standart-deniz-manzarali-oda/4.jpg", "/images/odalar/detay/oda-detay-1.jpg"],
    translations: {
      en: {
        title: "Standard Sea View Room",
        short: "An authentic 24-square-meter room facing the Aegean Sea.",
        description: "This sea-view room combines the quiet character of the stone house with a direct sense of the Aegean horizon. It is suited to couples and guests who prefer a compact, serene room with a view-led stay.",
        capacity: "2 Adults",
        view: "Aegean Sea",
        amenities: ["Sea View", "Air Conditioning", "LCD TV", "Wi-Fi", "Private Bathroom"],
      },
    },
  },
  {
    slug: "uc-kisilik-oda",
    title: "Üç Kişilik Oda",
    short: "3 yetişkin kapasiteli, 28 metrekarelik geniş konaklama alanı.",
    description: "28 metrekarelik geniş yerleşimiyle küçük gruplar için ideal bir 'miras sığınağı' olan Üç Kişilik Oda, yüksek tavanlı Osmanlı kentsel konut mimarisinin (L-Tipi Sofa) ferahlığını sunar. Oda, Kozbeyli'nin sismik dirençli andezit kaya tabanı üzerinde, kalın taş duvarların sağladığı doğal mikro-klima avantajıyla her zaman ideal bir serinliğe sahiptir. Pencerelerden giren Poyraz rüzgarları, köyün 180 metre rakımlı temiz havasını odanızın asaletine entegre eder.",
    capacity: "3 Yetişkin",
    size: "28 m²",
    view: "Köy ve Doğa",
    amenities: ["Çift + Tek Kişilik Yatak", "Klima", "LCD TV", "Wi-Fi", "Minibar"],
    images: ["/images/odalar/3-kisilik-oda/1.jpg", "/images/odalar/3-kisilik-oda/2.jpg", "/images/odalar/3-kisilik-oda/3.jpg", "/images/odalar/3-kisilik-oda/4.jpg", "/images/odalar/detay/oda-detay-2.jpg"],
    translations: {
      en: {
        title: "Triple Room",
        short: "A spacious 28-square-meter room for up to 3 adults.",
        description: "Designed for small groups or families who want a little more room to settle in, the Triple Room keeps the stone-house atmosphere while offering a practical sleeping arrangement and a calm village-and-nature outlook.",
        capacity: "3 Adults",
        view: "Village & Nature",
        amenities: ["Double + Single Bed Setup", "Air Conditioning", "LCD TV", "Wi-Fi", "Minibar"],
      },
    },
  },
  {
    slug: "4-kisilik-aile-odasi",
    title: "4 Kişilik Aile Odası",
    short: "45 metrekarelik, geniş aileler için tasarlanmış lüks taş süit.",
    description: "4 Kişilik Aile Odası, Kozbeyli Konağı'nın butik hizmet anlayışını geniş aile konseptiyle buluşturan 45 metrekarelik bir süit yapısındadır. İki ayrı bölümden oluşan yerleşim planı, ebeveynler ve çocuklar için ideal bir mahremiyet dengesi kurar. Odada çift kişilik yatak ile birlikte esnek yatak düzenlemeleri sunulabilmektedir. Taş mimarinin sunduğu prestijli görünüm, yerden ısıtma sistemleri, geniş oturma grupları ve modern banyo üniteleriyle desteklenmiştir. 5 kişiye kadar genişletilebilen kapasitesiyle bölgedeki en kapsamlı aile konaklama seçeneklerinden biridir. Ücretsiz bebek yatağı hizmeti ve ailelere özel hazırlanan buklet setleri, konaklama boyunca yüksek konfor sağlar. Tesisin tarihi avlusuna ve restoran alanına kolay erişim imkanı bulunmaktadır.",
    capacity: "4-5 Kişi",
    size: "45 m²",
    view: "Bahçe ve Avlu",
    amenities: ["Geniş Yaşam Alanı", "Bebek Yatağı Opsiyonu", "Özel Banyo", "Klima", "Smart TV"],
    images: ["/images/odalar/aile-odasi-4-kisilik/1.jpg", "/images/odalar/aile-odasi-4-kisilik/2.jpg", "/images/odalar/aile-odasi-4-kisilik/3.jpg", "/images/odalar/aile-odasi-4-kisilik/4.jpg", "/images/odalar/aile-odasi-4-kisilik/5.jpg"],
    translations: {
      en: {
        title: "Family Room for 4",
        short: "A generous 45-square-meter stone suite designed for families.",
        description: "The Family Room brings together a larger living area, a comfortable family layout and easy access to the garden and courtyard rhythm of the property. It is a practical choice for parents and children who want privacy without losing the boutique atmosphere.",
        capacity: "4-5 Guests",
        view: "Garden & Courtyard",
        amenities: ["Spacious Living Area", "Baby Cot Option", "Private Bathroom", "Air Conditioning", "Smart TV"],
      },
    },
  },
  {
    slug: "4-kisilik-aile-odasi-balkonlu",
    title: "4 Kişilik Aile Odası Balkonlu Oda",
    short: "50 metrekarelik, özel balkonlu en prestijli aile ünitesi.",
    description: "Balkonlu Aile Odası, Kozbeyli Konağı'nın sunduğu en geniş iç mekan olan 50 metrekarelik alanıyla tesisin zirve konaklama birimlerinden biridir. Kendine ait geniş balkonu, misafirlere Kozbeyli Köyü'nün tarihi dokusunu ve temiz havasını özel bir alanda deneyimleme fırsatı verir. Taş duvarlar ve el işçiliği ahşap detaylarla süslenmiş bu birimde, iki adet Smart TV ve genişletilmiş minibar servisi mevcuttur. Oda, çok çocuklu ailelerin ihtiyaçlarını karşılamak üzere tasarlanmış olup, konforu bir üst seviyeye taşıyan geniş banyo ve özel oturma köşesine sahiptir. Balkon alanı, sabah kahvesi veya akşam dinlenmesi için ideal bir kaçış noktasıdır. Tesisin tarihsel mirası ve modern lüksü, bu odanın her detayında somutlaşmaktadır.",
    capacity: "4-5 Kişi",
    size: "50 m²",
    view: "Bahçe/Köy",
    amenities: ["Özel Balkon", "Geniş Yaşam Alanı", "Bebek Yatağı Opsiyonu", "Klima", "Smart TV"],
    images: ["/images/odalar/balkonlu-aile-odasi-4-kisilik/1.jpg", "/images/odalar/balkonlu-aile-odasi-4-kisilik/2.jpg", "/images/odalar/balkonlu-aile-odasi-4-kisilik/3.jpg", "/images/odalar/balkonlu-aile-odasi-4-kisilik/4.jpg"],
    translations: {
      en: {
        title: "Family Room with Balcony",
        short: "A 50-square-meter family room with a private balcony.",
        description: "The balcony family room is one of the most spacious stays in the house. A private balcony, generous interior layout and warm stone-and-wood details make it suitable for longer family stays and slow mornings in Kozbeyli.",
        capacity: "4-5 Guests",
        view: "Garden/Village",
        amenities: ["Private Balcony", "Spacious Living Area", "Baby Cot Option", "Air Conditioning", "Smart TV"],
      },
    },
  },
  {
    slug: "superior-2-kisilik-oda",
    title: "Superior 2 Kişilik Oda",
    short: "40 metrekarelik, küvetli ve panoramik deniz manzaralı lüks süit.",
    description: "Superior 2 Kişilik Oda, Kozbeyli Konağı'nın sunduğu en yüksek konfor standartlarını temsil eden 40 metrekarelik bir lüks süittir. Kesintisiz Ege Denizi manzarasına sahip olan bu oda, içerisinde bulunan özel tasarım küvetiyle bir spa deneyimi vaat eder. Teknik donanımında Bose ses sistemi, Nespresso kahve makinesi ve L'Occitane markalı premium buklet ürünleri yer almaktadır. Antika mobilyalarla döşenmiş olan iç mekan, 19. yüzyılın asaletini 21. yüzyıl teknolojileriyle başarıyla entegre eder. Özellikle balayı çiftleri ve özel yıl dönümü kutlamaları için tasarlanan bu oda, misafirlerine Kozbeyli Köyü'ndeki en prestijli konaklama deneyimini sunar. Yastık menüsü ve özel oda servisi seçenekleriyle her anı kişiselleştirilmiş bir hizmet sunulmaktadır.",
    capacity: "2 Yetişkin",
    size: "40 m²",
    view: "Panoramik Deniz",
    amenities: ["Küvet & Duş", "Deniz Manzarası", "Premium Buklet Seti", "Bose Ses Sistemi", "Nespresso Makinesi"],
    images: ["/images/odalar/superior-oda-deniz-manzarali/1.jpg", "/images/odalar/superior-oda-deniz-manzarali/2.jpg", "/images/odalar/superior-oda-deniz-manzarali/3.jpg", "/images/odalar/superior-oda-deniz-manzarali/4.jpg"],
    translations: {
      en: {
        title: "Superior Room for 2",
        short: "A 40-square-meter premium room with panoramic sea views.",
        description: "A refined room for guests who want a wider layout and a stronger view experience. The Superior Room for 2 pairs panoramic Aegean outlooks with a quiet, premium stone-house atmosphere.",
        capacity: "2 Adults",
        view: "Panoramic Sea",
        amenities: ["Bathtub & Shower", "Sea View", "Premium Amenities", "Bose Sound System", "Nespresso Machine"],
      },
    },
  },
  {
    slug: "superior-3-kisilik-oda",
    title: "Superior 3 Kişilik Oda",
    short: "42 metrekarelik, 3 kişi kapasiteli, küvetli lüks deniz manzaralı süit.",
    description: "Alaybey Süit, Kozbeyli'nin beş asırlık köy dokusunu 19. yüzyıl tescilli konak mimarisiyle buluşturan, Horasan harcı izleri ve tüccar ailelerin mirasını yansıtan 'Slow Living' konseptiyle tasarlandı. / Alaybey Suite brings Kozbeyli's five-century village texture together with 19th-century registered mansion architecture, Horasan mortar details and a 'Slow Living' concept reflecting merchant heritage.",
    capacity: "3 Yetişkin",
    size: "42 m²",
    view: "Panoramik Deniz",
    amenities: ["Küvet & Duş", "3 Kişilik Yatak Düzeni", "Deniz Manzarası", "Premium Buklet Seti", "Nespresso Makinesi"],
    images: ["/images/odalar/superior-3-kisilik-oda-deniz-manzarali/1.jpg", "/images/odalar/superior-3-kisilik-oda-deniz-manzarali/2.jpg", "/images/odalar/superior-3-kisilik-oda-deniz-manzarali/3.jpg", "/images/odalar/superior-3-kisilik-oda-deniz-manzarali/4.jpg", "/images/odalar/superior-3-kisilik-oda-deniz-manzarali/5.jpg", "/images/odalar/superior-3-kisilik-oda-deniz-manzarali/6.jpg"],
    translations: {
      en: {
        title: "Superior Triple Room",
        short: "A 42-square-meter premium room for 3 guests with panoramic sea views.",
        description: "A wider superior room designed for three guests who want the comfort of a premium layout with the calm of a sea-facing stone stay. It balances group practicality with a more elevated room experience.",
        capacity: "3 Adults",
        view: "Panoramic Sea",
        amenities: ["Bathtub & Shower", "3-Guest Bed Setup", "Sea View", "Premium Amenities", "Nespresso Machine"],
      },
    },
  }
];
