// Reservation & Contact sections are defined here and merged onto the JSON
// dictionaries (src/dictionaries/*.json). Section/key naming mirrors the JSON style.
const extras = {
  en: {
    Reservation: {
      eyebrow: 'Booking',
      title: 'Booking',
      text: 'Dates, guests and room selection open in the official HMS booking screen; our team remains available by WhatsApp and phone.',
      bestPrice: 'Direct Reservation',
      bestPriceText: 'Your request reaches the mansion team directly; availability, room preferences and payment steps are confirmed by our team.',
      flexibleCancel: 'Terms Confirmed in Writing',
      flexibleCancelText: 'Date changes, cancellations and payment steps are confirmed according to the selected offer, period and booking channel.',
      whatsapp: 'WhatsApp Support',
      whatsappText: 'Instant support before and after your reservation for room selection, transfers and special requests.',
    },
    Contact: {
      eyebrow: 'Contact',
      title: 'How May We Assist You?',
      text: 'Our guest relations team is by your side every day between 09.00 and 22.00 for reservation, event and restaurant inquiries.',
      phone: 'Phone',
      email: 'E-mail',
      address: 'Address',
      directions: 'Get Directions',
      message: 'Leave a Message',
    },
  },
  tr: {
    Reservation: {
      eyebrow: 'Rezervasyon',
      title: 'Rezervasyon',
      text: 'Tarih, kişi sayısı ve oda seçimi resmi HMS rezervasyon ekranında açılır; ekibimiz WhatsApp ve telefon desteğiyle yanınızda kalır.',
      bestPrice: 'Doğrudan Rezervasyon',
      bestPriceText: 'Talebiniz doğrudan konak ekibine ulaşır; müsaitlik, oda tercihleri ve ödeme adımı ekibimiz tarafından teyit edilir.',
      flexibleCancel: 'Koşullar Yazılı Teyit',
      flexibleCancelText: 'Tarih değişikliği, iptal ve ödeme adımları seçilen teklif, dönem ve rezervasyon kanalına göre yazılı teyitle netleşir.',
      whatsapp: 'WhatsApp Destek',
      whatsappText: 'Oda seçimi, transfer ve özel istekleriniz için rezervasyon öncesi ve sonrası anında destek.',
    },
    Contact: {
      eyebrow: 'İletişim',
      title: 'Size Nasıl Yardımcı Olabiliriz?',
      text: 'Rezervasyon, organizasyon ve restoran sorularınız için misafir ilişkileri ekibimiz her gün 09.00 – 22.00 arasında yanınızda.',
      phone: 'Telefon',
      email: 'E-posta',
      address: 'Adres',
      directions: 'Yol Tarifi Al',
      message: 'Mesaj Bırakın',
    },
  },
};

const dictionaries = {
  en: () => import('@/dictionaries/en.json').then((module) => ({ ...module.default, ...extras.en })),
  tr: () => import('@/dictionaries/tr.json').then((module) => ({ ...module.default, ...extras.tr })),
};

export const getDictionary = async (locale: 'en' | 'tr') => {
  return dictionaries[locale] ? dictionaries[locale]() : dictionaries.tr();
};
