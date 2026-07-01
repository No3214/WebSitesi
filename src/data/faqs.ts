export type LocalizedText = {
  tr: string;
  en: string;
};

export type Faq = {
  q: LocalizedText;
  a: LocalizedText;
};

export const faqs = [
  {
    q: { tr: "Check-in / Check-out saatleri nedir?", en: "What are the check-in / check-out times?" },
    a: {
      tr: "Check-in 14:00 itibarıyla, check-out 12:00'ye kadardır.",
      en: "Check-in is from 14:00, and check-out is by 12:00."
    }
  },
  {
    q: { tr: "Kahvaltı konaklamaya dahil mi?", en: "Is breakfast included with the stay?" },
    a: {
      tr: "Seçtiğiniz oda, tarih ve rezervasyon kanalına göre kahvaltı koşulları değişebilir. Rezervasyon öncesinde misafir ilişkileri ekibimiz güncel dahil hizmetleri paylaşır.",
      en: "Breakfast terms may vary by room, date and booking channel. Our guest relations team confirms the included services before your reservation is finalized."
    }
  },
  {
    q: { tr: "Restoranı konaklama yapmadan kullanabilir miyiz?", en: "Can we visit the restaurant without staying at the hotel?" },
    a: {
      tr: "Evet, restoran misafirlerini de ağırlıyoruz. Masa, gün ve servis akışı için önceden rezervasyon yapmanızı öneririz.",
      en: "Yes. We welcome restaurant guests as well. We recommend booking in advance so the team can confirm table availability and service flow."
    }
  },
  {
    q: { tr: "Otopark imkanı var mı?", en: "Is parking available?" },
    a: {
      tr: "Kozbeyli köy dokusu içinde uygun yönlendirme misafir ilişkileri ekibimiz tarafından paylaşılır. Varış öncesinde aracınızla geleceğinizi bildirmeniz yeterlidir.",
      en: "Our guest relations team shares the most suitable parking guidance for the village setting. Let us know before arrival if you are coming by car."
    }
  },
  {
    q: { tr: "Evcil hayvan kabul ediyor musunuz?", en: "Do you accept pets?" },
    a: {
      tr: "Evcil hayvan talepleri oda tipi, tarih ve operasyon yoğunluğuna göre değerlendirilir. Rezervasyon öncesinde ekipten yazılı teyit almanızı rica ederiz.",
      en: "Pet requests are reviewed according to room type, date and operational availability. Please request written confirmation from the team before booking."
    }
  },
  {
    q: { tr: "Çocuklu aileler için uygun mu?", en: "Is it suitable for families with children?" },
    a: {
      tr: "Evet, aile odalarımız ve çocuk dostu menülerimiz bulunmaktadır.",
      en: "Yes, we have family rooms and child-friendly menus available."
    }
  },
  {
    q: { tr: "Hangi oda bizim için daha uygun?", en: "Which room is best for us?" },
    a: {
      tr: "Kişi sayısı, manzara beklentisi, balkon ihtiyacı ve özel gün planınıza göre oda önerisi yapabiliriz. Kararsızsanız müsaitlik sorgusu üzerinden not bırakabilirsiniz.",
      en: "We can suggest a room based on guest count, view preference, balcony needs and any special occasion. If you are unsure, leave a note with your availability request."
    }
  },
  {
    q: { tr: "Geç giriş yapabilir miyiz?", en: "Can we check in late?" },
    a: {
      tr: "Geç giriş talepleri önceden bildirildiğinde operasyon ekibimiz tarafından planlanır. Varış saatinizi rezervasyon sırasında paylaşmanız yeterlidir.",
      en: "Late arrivals can be planned by the operations team when shared in advance. Please provide your estimated arrival time during booking."
    }
  },
  {
    q: { tr: "Organizasyon rezervasyonu nasıl yapılır?", en: "How to make an event booking?" },
    a: {
      tr: "Talep formunu doldurduğunuzda satış ekibimiz resepsiyon ve operasyon saatleri içinde size döner.",
      en: "After you submit the request form, our sales team will contact you during reception and operations hours."
    }
  },
  {
    q: { tr: "Düğün, nişan veya özel davet için sabit paket fiyatı var mı?", en: "Do weddings, engagements or private events have fixed package prices?" },
    a: {
      tr: "Davet bütçesi kişi sayısı, tarih, menü, servis düzeni ve ek ihtiyaçlara göre hazırlanır. Bu nedenle teklif süreci talep formu ve ekip görüşmesiyle kişiselleştirilir.",
      en: "Event pricing is prepared according to guest count, date, menu, service setup and additional needs. The proposal is therefore personalized after the request form and team consultation."
    }
  },
  {
    q: { tr: "Kozbeyli Konağı Foça'ya yakın mı?", en: "Is Kozbeyli Konağı close to Foça?" },
    a: {
      tr: "Konağımız İzmir Foça'da, Kozbeyli Köyü içindedir. Yol tarifi için iletişim sayfasındaki harita bağlantısını kullanabilirsiniz.",
      en: "The property is in Kozbeyli Village, Foça, İzmir. You can use the map link on the contact page for directions."
    }
  },
  {
    q: { tr: "İptal ve tarih değişikliği koşulları nedir?", en: "What are the cancellation and date-change terms?" },
    a: {
      tr: "Konaklama tarihinize 72 saat (3 gün) ve daha kısa süre kala iletilen iptallerde ücret iadesi yapılmaz; konaklama bedelinin tamamı tahsil edilir. 72 saatten önce iletilen iptal ve tarih değişikliği talepleri, seçilen tarife ve rezervasyon kanalı koşullarına göre değerlendirilir; kesin koşullar rezervasyon teyidi sırasında yazılı olarak paylaşılır. Fiyatlar sezon, dönem ve doluluk durumuna göre değişiklik gösterebilir.",
      en: "Cancellations made 72 hours (3 days) or less before your check-in date are non-refundable and the full accommodation amount is charged. Cancellation and date-change requests made earlier than 72 hours are evaluated according to the selected rate and booking channel terms; final terms are shared in writing during reservation confirmation. Rates may vary by season, period and occupancy."
    }
  },
  {
    q: { tr: "Ödeme güvenliği nasıl sağlanıyor?", en: "How is payment security handled?" },
    a: {
      tr: "Site üzerinden kart numarası, CVV veya son kullanma tarihi istemiyoruz. Kartlı ödeme gerektiğinde işlem güvenli ödeme sağlayıcısı veya resmi rezervasyon kanalı üzerinden yürütülür.",
      en: "We do not ask for card number, CVV or expiry date on this site. When card payment is required, the transaction is handled through a secure payment provider or the official booking channel."
    }
  },
  {
    q: { tr: "Konaklama konsepti nedir; kahvaltı dahil mi?", en: "What is the accommodation concept; is breakfast included?" },
    a: {
      tr: "Kozbeyli Konağı oda + serpme köy kahvaltısı konseptiyle çalışır; organik köy kahvaltısı oda fiyatına dahildir ve konaklamayı takip eden sabah restoran veya bahçede servis edilir. Kahvaltısız oda satışı yapılmaz.",
      en: "Kozbeyli Konağı operates on a room-plus-village-breakfast concept; the organic village breakfast is included in the room rate and served the morning after your stay, in the restaurant or garden. Rooms are not sold without breakfast."
    }
  },
  {
    q: { tr: "Otelde yüzme havuzu var mı?", en: "Is there a swimming pool?" },
    a: {
      tr: "Hayır, Kozbeyli Konağı'nda yüzme havuzu bulunmaz. Tesis; 19. yüzyıl tescilli taş konak, geniş bahçe ve sakin köy dokusuyla yavaş yaşam (slow living) konsepti sunar. Bahçedeki süs havuzu kullanıma açık değildir; resort, bungalov veya jakuzi konsepti değildir.",
      en: "No, Kozbeyli Konağı does not have a swimming pool. It offers a slow-living concept with a 19th-century registered stone mansion, a large garden and quiet village texture. The garden's decorative pool is not in use; it is not a resort, bungalow or jacuzzi concept."
    }
  },
  {
    q: { tr: "Kaç odanız var ve oda tipleri neler?", en: "How many rooms are there and what are the room types?" },
    a: {
      tr: "Kozbeyli Konağı 16 butik odaya sahiptir. Oda tipleri: tek kişilik (25 m²), standart çift kişilik (25 m²), superior (35 m²; bazılarında balkon ve deniz/dağ manzarası) ve aile odası (50 m²). Tüm odalar deniz manzaralı değildir; manzara oda konumuna göre bahçe, dağ veya deniz yönündedir.",
      en: "Kozbeyli Konağı has 16 boutique rooms. Types: single (25 m²), standard double (25 m²), superior (35 m², some with a balcony and sea/hill view) and family room (50 m²). Not all rooms are sea-view; the outlook is toward the garden, hills or sea depending on the room."
    }
  },
  {
    q: { tr: "Restoranda hangi mutfak sunuluyor?", en: "What cuisine does the restaurant serve?" },
    a: {
      tr: "Restoran, Antakya ve Ege (Türk) mutfağını buluşturur; taş fırın lezzetleri, à la carte menü, serpme köy kahvaltısı ve gurme kokteyller sunar. Akşam yemeği için önceden rezervasyon gerekir; konaklamayan ziyaretçilere de uygunluğa göre hizmet verilir.",
      en: "The restaurant brings together Antakya and Aegean (Turkish) cuisine, with stone-oven dishes, an à la carte menu, a generous village breakfast and gourmet cocktails. Dinner requires advance reservation; non-staying visitors are also welcome subject to availability."
    }
  },
  {
    q: { tr: "Resepsiyon 24 saat açık mı?", en: "Is reception open 24 hours?" },
    a: {
      tr: "Hayır, resepsiyon 24 saat açık değildir; günlük planlı bir operasyonla hizmet verir. Giriş kapıları 23:00 sonrası kontrollüdür ve sessizlik saatleri 23:00–08:00 arasıdır; geç varış planlayan misafirlerin önceden bilgi vermesi rica edilir.",
      en: "No, reception is not open 24/7; it runs on a planned daily operation. Entrance gates are controlled after 23:00 and quiet hours are 23:00–08:00; guests planning a late arrival are asked to notify the team in advance."
    }
  },
  {
    q: { tr: "Wi-Fi ücretsiz mi ve hangi olanaklar var?", en: "Is Wi-Fi free and what facilities are available?" },
    a: {
      tr: "Evet, tüm odalarda ve genel alanlarda ücretsiz Wi-Fi bulunur. Ayrıca açık otopark (valeli ve valesiz), bahçe, teras, ortak TV alanı, günlük temizlik, emanet kasası ve 25 m² toplantı/konferans alanı gibi olanaklar sunulur.",
      en: "Yes, free Wi-Fi is available in all rooms and common areas. The property also offers open parking (valet and self), a garden, terrace, shared TV lounge, daily housekeeping, a safe and a 25 m² meeting/conference area."
    }
  },
  {
    q: { tr: "Tekerlekli sandalye erişimi var mı?", en: "Is it wheelchair accessible?" },
    a: {
      tr: "Konak tek katlıdır (asansör yok), merdivensiz girişi ve tırabzanları bulunur; tekerlekli sandalye kullanımına kısıtlamalı olarak uygundur ve engelli misafirler için ayrılmış otopark alanı vardır. Özel erişim ihtiyaçlarınızı rezervasyon öncesinde paylaşmanızı öneririz.",
      en: "The mansion is single-story (no elevator), with a step-free entrance and handrails; it is wheelchair-suitable with some limitations and has dedicated accessible parking. We recommend sharing any specific access needs before booking."
    }
  },
  {
    q: { tr: "Havalimanına uzaklık ne kadar ve transfer var mı?", en: "How far is the airport and is a transfer available?" },
    a: {
      tr: "İzmir Adnan Menderes Havalimanı araçla yaklaşık 1–1,5 saat uzaklıktadır (mesafe rotaya göre değişir); Foça ilçe merkezi ise yaklaşık 19 km'dir. Havalimanı gidiş-dönüş transferi ücretli olarak, uygunluğa göre organize edilebilir. Güncel süre için canlı yol tarifi önerilir.",
      en: "İzmir Adnan Menderes Airport is roughly a 1–1.5 hour drive away (distance varies by route); central Foça is about 19 km. A paid round-trip airport transfer can be arranged subject to availability. Use live directions for the current travel time."
    }
  },
  {
    q: { tr: "Yakında gezilebilecek yerler neler?", en: "What is there to visit nearby?" },
    a: {
      tr: "Kozbeyli Köyü'nün taş sokakları, zeytinlikleri ve dibek kahvesi durakları yürüyerek keşfedilir. Çevrede Eski Foça merkezi, koylar, Foça Kalesi, Kyme Antik Kenti, Pers Anıt Mezarı ve tarihî yel değirmenleri kültür ve fotoğraf gezileri için idealdir.",
      en: "Kozbeyli Village's stone streets, olive groves and dibek-coffee stops are best explored on foot. Nearby, Old Foça, its coves, Foça Castle, the ancient city of Kyme, the Persian rock tomb and historic windmills are ideal for culture and photography trips."
    }
  },
  {
    q: { tr: "Kozbeyli Konağı kimler için uygundur?", en: "Who is Kozbeyli Konağı best suited for?" },
    a: {
      tr: "Kozbeyli Konağı; sakin bir kaçamak arayan çiftler, huzurlu bir konfor isteyen aileler, tarih ve yavaş yaşam meraklısı gezginler ile düğün/özel davet planlayanlar için uygundur. Sessiz köy atmosferi ve 18 yaş asgari giriş yaşıyla dinlenmeye odaklı, yetişkin dostu bir deneyim sunar.",
      en: "Kozbeyli Konağı suits couples seeking a quiet escape, families wanting peaceful comfort, heritage and slow-living travelers, and those planning weddings or private events. With a quiet village atmosphere and a minimum check-in age of 18, it offers a restful, adult-friendly experience."
    }
  }
] as const satisfies readonly Faq[];
