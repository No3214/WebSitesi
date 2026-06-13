// Reservation & Contact sections are defined here and merged onto the JSON
// dictionaries (src/dictionaries/*.json). Section/key naming mirrors the JSON style.
const extras = {
  en: {
    Reservation: {
      eyebrow: 'Booking',
      title: 'Reserve Your Mansion Stay',
      text: 'Select your dates and share your stay request directly with our concierge team for availability confirmation and tailored support.',
      bestPrice: 'Direct Concierge',
      bestPriceText: 'Your request reaches the mansion team directly; availability, room preferences and payment steps are confirmed by our team.',
      flexibleCancel: 'Flexible Cancellation',
      flexibleCancelText: 'If your plans change, our concierge team is by your side for date changes and cancellations.',
      whatsapp: 'WhatsApp Concierge',
      whatsappText: 'Instant support before and after your reservation for room selection, transfers and special requests.',
    },
    Contact: {
      eyebrow: 'Contact',
      title: 'How May We Assist You?',
      text: 'Our concierge team is by your side every day between 09.00 and 22.00 for reservation, event and restaurant inquiries.',
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
      title: 'Konağınızı Şimdi Ayırtın',
      text: 'Tarihlerinizi seçin; müsaitlik, oda tercihi ve güvenli ödeme adımı için talebiniz doğrudan concierge ekibimize ulaşsın.',
      bestPrice: 'Doğrudan Concierge',
      bestPriceText: 'Talebiniz doğrudan konak ekibine ulaşır; müsaitlik, oda tercihleri ve ödeme adımı ekibimiz tarafından teyit edilir.',
      flexibleCancel: 'Esnek İptal',
      flexibleCancelText: 'Planlarınız değişirse concierge ekibimiz tarih değişikliği ve iptalde yanınızda.',
      whatsapp: 'WhatsApp Concierge',
      whatsappText: 'Oda seçimi, transfer ve özel istekleriniz için rezervasyon öncesi ve sonrası anında destek.',
    },
    Contact: {
      eyebrow: 'İletişim',
      title: 'Size Nasıl Yardımcı Olabiliriz?',
      text: 'Rezervasyon, organizasyon ve restoran sorularınız için concierge ekibimiz her gün 09.00 – 22.00 arasında yanınızda.',
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
