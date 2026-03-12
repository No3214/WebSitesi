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
    slug: "standart-bahce-manzarali-oda",
    title: "Standart Bahçe Manzaralı Oda",
    short: "Kozbeyli Konağı'nın 24 metrekarelik, iç bahçe manzaralı huzurlu odası.",
    description: "Kozbeyli Konağı'nın Standart Bahçe Manzaralı odaları, 24 metrekarelik kullanım alanıyla modern konforu tarihi dokuyla birleştirir. Tesisin iç bahçesine bakan bu konaklama birimleri, orijinal taş mimarinin doğal serinliğini koruyarak misafirlere huzurlu bir atmosfer sunar. Oda içerisinde yüksek hızlı Wi-Fi, ayarlanabilir klima sistemi, LCD televizyon ve özel tasarım banyo olanakları standart olarak yer almaktadır. Kozbeyli Köyü'nün sessizliğini ve bahçedeki yerel bitki örtüsünün tazeliğini doğrudan deneyimlemek isteyen misafirler için optimize edilmiştir. Konaklama deneyimi, sabahları servis edilen ve Kozbeyli Köyü üreticilerinden tedarik edilen ürünlerle hazırlanan zengin serpme köy kahvaltısını da kapsamaktadır. Tesis genelindeki 5 yıldızlı hizmet standartları, bu oda tipinde de eksiksiz şekilde uygulanmaktadır.",
    capacity: "2 Yetişkin",
    size: "24 m²",
    view: "İç Bahçe",
    amenities: ["Bahçe Manzarası", "Klima", "LCD TV", "Wi-Fi", "Özel Banyo"],
    images: ["https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200&q=80"]
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
    images: ["https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80"]
  },
  {
    slug: "uc-kisilik-oda",
    title: "Üç Kişilik Oda",
    short: "3 yetişkin kapasiteli, 28 metrekarelik geniş konaklama alanı.",
    description: "Kozbeyli Konağı'nın Üç Kişilik Odaları, 28 metrekarelik genişliğiyle küçük gruplar ve çocuklu aileler için fonksiyonel bir yerleşim sunar. Oda düzeni, bir adet geniş çift kişilik yatak ve bir adet konforlu tek kişilik yataktan oluşmaktadır. Tarihi binanın karakteristik taş dokusunu her köşesinde hissettiren bu odalar, yüksek tavanları ve ferah pencereleriyle aydınlık bir ambiyansa sahiptir. Teknik donanım olarak yüksek hızlı Wi-Fi, klima, minibar ve özel banyo imkanlarıyla donatılmıştır. Köy yaşamının sakinliğini ve doğanın yeşilliğini pencerelerinden içeri taşıyan bu konaklama birimi, misafirlerine hem sosyal bir alan hem de kişisel bir dinlenme köşesi sağlar. Tesisin tüm gastronomi ve concierge hizmetlerine doğrudan erişim imkanı sunulmaktadır.",
    capacity: "3 Yetişkin",
    size: "28 m²",
    view: "Köy ve Doğa",
    amenities: ["Çift + Tek Kişilik Yatak", "Klima", "LCD TV", "Wi-Fi", "Minibar"],
    images: ["https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80"]
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
    images: ["https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80"]
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
    images: ["https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80"]
  },
  {
    slug: "superior-2-kisilik-oda",
    title: "Superrior 2 Kişilik Oda",
    short: "40 metrekarelik, küvetli ve panoramik deniz manzaralı lüks süit.",
    description: "Superrior 2 Kişilik Oda, Kozbeyli Konağı'nın sunduğu en yüksek konfor standartlarını temsil eden 40 metrekarelik bir lüks süittir. Kesintisiz Ege Denizi manzarasına sahip olan bu oda, içerisinde bulunan özel tasarım küvetiyle bir spa deneyimi vaat eder. Teknik donanımında Bose ses sistemi, Nespresso kahve makinesi ve L'Occitane markalı premium buklet ürünleri yer almaktadır. Antika mobilyalarla döşenmiş olan iç mekan, 19. yüzyılın asaletini 21. yüzyıl teknolojileriyle başarıyla entegre eder. Özellikle balayı çiftleri ve özel yıl dönümü kutlamaları için tasarlanan bu oda, misafirlerine Kozbeyli Köyü'ndeki en prestijli konaklama deneyimini sunar. Yastık menüsü ve özel oda servisi seçenekleriyle her anı kişiselleştirilmiş bir hizmet sunulmaktadır.",
    capacity: "2 Yetişkin",
    size: "40 m²",
    view: "Panoramik Deniz",
    amenities: ["Küvet & Duş", "Deniz Manzarası", "Premium Buklet Seti", "Bose Ses Sistemi", "Nespresso Makinesi"],
    images: ["https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80"]
  },
  {
    slug: "superior-3-kisilik-oda",
    title: "Superrior 3 Kişilik Oda",
    short: "42 metrekarelik, 3 kişi kapasiteli, küvetli lüks deniz manzaralı süit.",
    description: "Superrior 3 Kişilik Oda tipi, lüks ve ferahlık kavramlarını 42 metrekarelik alanda üç kişilik konaklama kapasitesiyle birleştirir. Panoramik deniz manzarası eşliğinde konaklama imkanı sunan bu süit, geniş banyosunda yer alan lüks küvetiyle dinlendirici bir atmosfer sağlar. Oda içerisinde yüksek kaliteli ses sistemleri, profesyonel kahve istasyonu ve ücretsiz hızlı internet erişimi gibi teknolojik olanaklar tamdır. Özel üretim yataklar ve hipoalerjenik nevresim takımları, uyku kalitesini en üst düzeye çıkarmak için seçilmiştir. Kozbeyli Köyü'nün tescilli tarihi dokusunun içerisinde, modern bir konakta sunulan bu deneyim, hem aileler hem de seçkin gezgin grupları için idealdir. Tesisin gastronomi ekibi tarafından hazırlanan özel ikramlar, bu oda tipinde konaklayan misafirler için standarttır.",
    capacity: "3 Yetişkin",
    size: "42 m²",
    view: "Panoramik Deniz",
    amenities: ["Küvet & Duş", "3 Kişilik Yatak Düzeni", "Deniz Manzarası", "Premium Buklet Seti", "Nespresso Makinesi"],
    images: ["https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80"]
  }
];
