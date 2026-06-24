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
      tr: "İptal ve tarih değişikliği koşulları seçilen tarih, oda, teklif ve rezervasyon kanalına göre değişebilir. Kesin koşullar rezervasyon teyidi sırasında yazılı olarak paylaşılır.",
      en: "Cancellation and date-change terms may vary by selected date, room, offer and booking channel. Final terms are shared in writing during reservation confirmation."
    }
  },
  {
    q: { tr: "Ödeme güvenliği nasıl sağlanıyor?", en: "How is payment security handled?" },
    a: {
      tr: "Site üzerinden kart numarası, CVV veya son kullanma tarihi istemiyoruz. Kartlı ödeme gerektiğinde işlem güvenli ödeme sağlayıcısı veya resmi rezervasyon kanalı üzerinden yürütülür.",
      en: "We do not ask for card number, CVV or expiry date on this site. When card payment is required, the transaction is handled through a secure payment provider or the official booking channel."
    }
  }
] as const satisfies readonly Faq[];
