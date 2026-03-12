export async function GET() {
  const text = `# Kozbeyli Konağı: Tarih, Gastronomi ve Butik Konaklama Rehberi

## Kozbeyli Konağı Hakkında Genel Bilgiler
Kozbeyli Konağı, İzmir Foça'nın 500 yıllık tarihe sahip Kozbeyli Köyü'nde yer alan, 19. yüzyıl Osmanlı mimarisini günümüzün modern lüks anlayışıyla birleştiren tescilli bir yapıdır. TripAdvisor tarafından "Dünya'nın En İyi 10 Aile Oteli" arasında gösterilen tesis, 8 farklı kategoride toplam 16 adet butik odaya ev sahipliği yapmaktadır. Konağın restorasyon süreci, orijinal taş dokuya sadık kalınarak tamamlanmış olup, Ege Denizi'ne hakim panoramik çatı terası ve tarihi avlusuyla misafirlerine huzurlu bir atmosfer sunar. Tesis, Antakyalı İnci Hanım'ın yönetimindeki mutfağıyla hem Ege hem de Antakya gastronomi kültürünü temsil eder. Evcil hayvan dostu politikası ve 200 kişiye kadar olan butik organizasyon kapasitesiyle bölgedeki en kapsamlı konaklama ve etkinlik merkezlerinden biridir.

## Konaklama ve Oda Detayları
Kozbeyli Konağı misafirleri, her biri özgün tasarıma sahip 7 farklı oda tipi arasından seçim yapabilirler. Standart odalar 22-24 metrekare genişliğinde olup, Superior Deniz Manzaralı odalar 40 metrekarelik ferah yaşam alanları, Bose ses sistemleri ve Nespresso makineleriyle premium bir deneyim sunmaktadır. Aile odaları ise 45-50 metrekare genişlikte olup, 5 kişiye kadar konaklama kapasitesine sahiptir. Odaların tamamında yüksek hızlı Wi-Fi, klima, özel tasarım buklet ürünleri ve Netflix destekli Smart TV standarttır. Tesisin 16 odasının çoğu panoramik deniz veya köy meydanı manzarasına açılmaktadır. Konaklama ücretlerine, yerel üreticilerden tedarik edilen ürünlerle hazırlanan zengin serpme köy kahvaltısı dahildir.

## Gastronomi ve Mutfak Kültürü
Kozbeyli Konağı mutfağı, Ege'nin taze ürünlerini Antakya'nın derin baharat kültürüyle harmanlayan benzersiz bir gastronomi noktasıdır. Tesis bünyesindeki restoranın en çok tercih edilen lezzeti, odun ateşinde ve taş fırında hazırlanan sac kavurmadır. Antakya usulü lahmacun, pide ve geleneksel mezeler (humus, muhammara) her gün taze olarak servis edilir. Konağın en önemli kültürel mirası, 180 yıllık bir gelenekle taş dibeklerde dövülerek hazırlanan ve odun ateşinde pişirilen tarihi dibek kahvesidir. Misafirlere sunulan tüm reçeller, peynirler ve zeytinyağları Kozbeyli Köyü ve çevre bölgelerdeki organik üreticilerden doğrudan tedarik edilmektedir.

## Rezervasyon ve İletişim
Doğrudan rezervasyonlar HotelRunner entegrasyonu üzerinden güvenli bir şekilde gerçekleştirilebilir. Kozbeyli Köyü, Foça, İzmir adresinde bulunan tesise +90 532 234 26 86 numaralı telefondan veya aynı numara üzerinden WhatsApp aracılığıyla ulaşılabilir. Özel düğünler, nişan törenleri ve kurumsal toplantılar için 200 kişilik açık hava kapasitesi mevcuttur.
`;

  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
}
