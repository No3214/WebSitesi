export type BlogPost = {
  slug: string;
  title: { tr: string; en: string };
  excerpt: { tr: string; en: string };
  content: { tr: string; en: string };
  image: string;
  category: { tr: string; en: string };
  author: string;
  date: string;
  readingTime: number; // minutes
};

export const blogPosts: BlogPost[] = [
  {
    slug: "500-yillik-tas-mimarinin-sirlari",
    title: {
      tr: "500 Yıllık Taş Mimarinin Sırları: Horasan Harcından Günümüze",
      en: "Secrets of 500-Year Stone Architecture: From Horasan Mortar to Today",
    },
    excerpt: {
      tr: "Kozbeyli Konağı'nın duvarlarında saklı Osmanlı yapı tekniklerini ve Horasan harcının günümüzde bile eşsiz dayanıklılığını keşfedin.",
      en: "Discover Ottoman building techniques hidden in Kozbeyli Mansion's walls and the unmatched durability of Horasan mortar that endures to this day.",
    },
    content: {
      tr: `Kozbeyli Konağı, yaklaşık 1870 yılında inşa edilmiş tescilli bir Osmanlı sivil mimari örneğidir. Konağın en dikkat çekici özelliği, Horasan harcı kullanılarak örülmüş taş duvarlarıdır.

## Horasan Harcı Nedir?

Horasan harcı, kireç ve tuğla tozu karışımından oluşan antik bir yapı malzemesidir. Roma döneminden beri kullanılan bu teknik, Osmanlı mimarisinde de yaygın biçimde tercih edilmiştir. Modern çimentodan farklı olarak, Horasan harcı "nefes alan" bir yapıya sahiptir — nem alışverişi yaparak yapının ömrünü uzatır.

## Restorasyon Süreci

Konağın restorasyonu, orijinal taş dokuya sadık kalınarak gerçekleştirilmiştir. Her taş tek tek belgelenerek, orijinal Horasan harcı formülasyonuna uygun malzemelerle yeniden bağlanmıştır. Bu süreç, modern "yıkıp yapma" anlayışından tamamen farklıdır — bir "yaşayan müze" (Living Museum) felsefesiyle yürütülmüştür.

## Taş Mimarinin Doğal Avantajları

Kalın taş duvarlar, doğal bir termal kütle oluşturarak yazın serin, kışın sıcak bir iç mekan sunar. Bu sayede klima kullanımı minimum düzeyde kalır ve misafirlere doğal bir konfor deneyimi yaşatılır.`,
      en: `Kozbeyli Mansion is a registered Ottoman civil architecture example built around 1870. The most striking feature is its stone walls built with Horasan mortar.

## What is Horasan Mortar?

Horasan mortar is an ancient building material made from a mixture of lime and crushed brick. Used since the Roman period, this technique was widely preferred in Ottoman architecture. Unlike modern cement, Horasan mortar has a "breathing" structure — it exchanges moisture, extending the lifespan of the building.

## The Restoration Process

The mansion's restoration was carried out staying true to the original stone texture. Each stone was individually documented and reconnected with materials matching the original Horasan mortar formulation. This process is completely different from the modern "demolish and rebuild" approach — it was conducted with a "Living Museum" philosophy.

## Natural Advantages of Stone Architecture

Thick stone walls create a natural thermal mass, offering a cool interior in summer and warm in winter. This minimizes air conditioning use and provides guests with a natural comfort experience.`,
    },
    image: "/images/rooms/aile-4.jpeg",
    category: { tr: "Mimari & Tarih", en: "Architecture & History" },
    author: "Kozbeyli Konağı",
    date: "2026-03-15",
    readingTime: 5,
  },
  {
    slug: "antakya-mutfaginin-ege-ile-bulusmasi",
    title: {
      tr: "Antakya Mutfağının Ege ile Buluşması: İnci Hanım'ın Hikayesi",
      en: "When Antakya Cuisine Meets the Aegean: İnci Hanım's Story",
    },
    excerpt: {
      tr: "Güneydoğu'nun baharat zenginliği ile Ege'nin taze lezzetlerini bir araya getiren benzersiz mutfak hikayemiz.",
      en: "Our unique culinary story bringing together the spice richness of the Southeast with the fresh flavors of the Aegean.",
    },
    content: {
      tr: `İnci Hanım, Antakya'dan İzmir'e uzanan bir gastronomi yolculuğunun mimarıdır. Onun mutfağında, Hatay'ın derin baharat kültürü ile Ege'nin taze deniz ürünleri, zeytinyağlıları ve ot yemekleri bir araya gelir.

## Sac Kavurma Geleneği

Konağın en meşhur lezzeti olan sac kavurma, geleneksel demir sac üzerinde odun ateşinde pişirilir. Et, sebzeler ve baharatlar yüksek ısıda hızla kavrularak eşsiz bir lezzet profili oluşturur.

## 180 Yıllık Dibek Kahvesi

Kozbeyli Konağı'nın en özel ritüellerinden biri, 180 yıllık taş dibekte taze çekirdeklerin dövülerek hazırlandığı geleneksel Türk kahvesidir. Her fincan, sabırlı bir el işçiliğinin ürünüdür.

## Organik Tedarik Zinciri

Tüm reçeller, peynirler ve zeytinyağları Kozbeyli Köyü ve çevre bölgelerdeki organik üreticilerden doğrudan tedarik edilir. "Tarladan sofraya" felsefesi, her öğünde taze ve doğal lezzetler sunar.`,
      en: `İnci Hanım is the architect of a gastronomic journey from Antakya to İzmir. In her kitchen, Hatay's deep spice culture meets the Aegean's fresh seafood, olive oil dishes, and herb-based cuisine.

## The Sac Kavurma Tradition

The mansion's most famous dish, sac kavurma, is cooked on a traditional iron griddle over wood fire. Meat, vegetables, and spices are quickly seared at high heat, creating a unique flavor profile.

## 180-Year-Old Dibek Coffee

One of Kozbeyli Mansion's most special rituals is the traditional Turkish coffee prepared by pounding fresh beans in a 180-year-old stone mortar. Each cup is the product of patient craftsmanship.

## Organic Supply Chain

All jams, cheeses, and olive oils are sourced directly from organic producers in Kozbeyli Village and surrounding areas. The "farm-to-table" philosophy delivers fresh, natural flavors at every meal.`,
    },
    image: "/images/rooms/bahce-2.jpeg",
    category: { tr: "Gastronomi", en: "Gastronomy" },
    author: "Kozbeyli Konağı",
    date: "2026-03-10",
    readingTime: 4,
  },
  {
    slug: "focada-dort-mevsim-yapilacaklar",
    title: {
      tr: "Foça'da Dört Mevsim Yapılacaklar: Yerel Rehber",
      en: "Things to Do in Foça Year-Round: A Local Guide",
    },
    excerpt: {
      tr: "Antik Phokaia'dan Akdeniz fokuna, zeytinyağı hasadından tekne turlarına — Foça'nın her mevsim sunduğu deneyimler.",
      en: "From ancient Phocaea to Mediterranean monk seals, olive harvest to boat tours — experiences Foça offers every season.",
    },
    content: {
      tr: `Foça, İzmir'in en özel kıyı kasabalarından biridir. Antik Phokaia uygarlığının kurulduğu bu topraklar, binlerce yıllık tarihi doğal güzelliklerle harmanlayarak ziyaretçilerine eşsiz deneyimler sunar.

## İlkbahar (Mart-Mayıs)
- Wildflower yürüyüşleri ve doğa fotoğrafçılığı
- Zeytinlik gezileri ve erken hasat tadımları
- Kuş gözlemciliği (göç mevsimi)

## Yaz (Haziran-Ağustos)
- Foça Adaları tekne turları
- Siren Kayalıkları dalış ve yüzme
- Akdeniz foku gözlem turları
- Açık hava sinema geceleri

## Sonbahar (Eylül-Kasım)
- Zeytin hasadı deneyimi
- Şarap tadım turları (çevre bağlar)
- Balıkçı köyü gastronomi turu
- Tarihi Foça sokak yürüyüşü

## Kış (Aralık-Şubat)
- Termal kütle taş konakta huzurlu kış kaçamağı
- Şömine başında dibek kahvesi
- Kozbeyli Köyü kış lezzetleri festivali
- Sıcak taş hamam deneyimi`,
      en: `Foça is one of İzmir's most special coastal towns. These lands where the ancient Phocaean civilization was founded blend thousands of years of history with natural beauty, offering visitors unique experiences.

## Spring (March-May)
- Wildflower hikes and nature photography
- Olive grove visits and early harvest tastings
- Birdwatching (migration season)

## Summer (June-August)
- Foça Islands boat tours
- Siren Rocks diving and swimming
- Mediterranean monk seal observation tours
- Open-air cinema nights

## Autumn (September-November)
- Olive harvest experience
- Wine tasting tours (surrounding vineyards)
- Fishing village gastronomy tour
- Historic Foça street walk

## Winter (December-February)
- Peaceful winter getaway in thermal mass stone mansion
- Dibek coffee by the fireplace
- Kozbeyli Village winter flavors festival
- Hot stone hamam experience`,
    },
    image: "/images/rooms/deniz-3.jpeg",
    category: { tr: "Seyahat Rehberi", en: "Travel Guide" },
    author: "Kozbeyli Konağı",
    date: "2026-03-05",
    readingTime: 6,
  },
];
