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
};

export const rooms: Room[] = [
  {
    slug: "standart-oda",
    title: "Standart Oda",
    short: "Taş doku ve rafine konforun buluştuğu özgün bir Ege deneyimi.",
    description: "Kozbeyli Konağı'nın ruhunu yansıtan Standart Odalarımız, geleneksel taş mimarinin serinliğini ve ahşabın sıcaklığını bir araya getirir. Minimalist bir lüks anlayışıyla tasarlanan bu odalar, huzurlu bir uyku ve rafine bir dinlenme alanı sunar.",
    capacity: "2 Yetişkin",
    size: "22 m²",
    view: "Köy Meydanı",
    amenities: [
      "Özel Tasarım Buklet Seti",
      "Yüksek Kalite Pamuklu Nevresim",
      "Mini Bar & Nespresso Makinesi",
      "Klima & Yerden Isıtma",
      "Yüksek Hızlı Wi-Fi",
      "Netflix Destekli Smart TV"
    ],
    images: ["https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80"]
  },
  {
    slug: "superior-deniz-manzarali-oda",
    title: "Superior Deniz Manzaralı Oda",
    short: "Ege'nin sonsuz maviliğine uyanacağınız, panoramik manzaralı premium konaklama.",
    description: "Superior odalarımız, Konağımızın en üst katında yer alarak Foça'nın ve Ege Denizi'nin büyüleyici manzarasını ayaklarınızın altına serer. Geniş yaşam alanı ve özel tasarım mobilyalarıyla, konforun ve görselliğin zirvesini yaşatır.",
    capacity: "2 Yetişkin",
    size: "30 m²",
    view: "Panoramik Ege Denizi",
    amenities: [
      "Panoramik Deniz Manzaralı Balkon",
      "L'Occitane Buklet Ürünleri",
      "Yastık Menüsü",
      "Mini Bar & Premium Kahve Seçkisi",
      "Bose Ses Sistemi",
      "Işık ve Isı Otomasyonu"
    ],
    images: ["https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80"]
  },
  {
    slug: "aile-odasi",
    title: "Aile Odası",
    short: "Geniş aileler için tasarlanmış, ortak ve özel alanların dengelendiği ferah süit.",
    description: "İki ayrı odadan oluşan Aile Odalarımız, mahremiyet ve birlikte vakit geçirme dengesini mükemmel bir şekilde kurar. Geleneksel Ege evi sıcaklığında, modern geniş imkanlarla donatılmış bu alan, tüm aileniz için unutulmaz bir tatil vaat eder.",
    capacity: "4 Yetişkin",
    size: "45 m²",
    view: "Bahçe ve Avlu",
    amenities: [
      "İki Ayrı Yatak Odası",
      "Çocuklara Özel Buklet Seti",
      "Geniş Oturma Grubu",
      "Bebek Yatağı Opsiyonu",
      "2 Adet Smart TV",
      "Aile Boyu Mini Bar"
    ],
    images: ["https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80"]
  }
];
