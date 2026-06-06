// Reservation & Contact sections are defined here and merged onto the JSON
// dictionaries (src/dictionaries/*.json). Section/key naming mirrors the JSON style.
const extras = {
  en: {
    Reservation: {
      eyebrow: 'Booking',
      title: 'Reserve Your Mansion Stay',
      text: 'Select your dates on the live availability calendar; enjoy the privilege of booking direct with our best price guarantee and flexible cancellation.',
      bestPrice: 'Best Price Guarantee',
      bestPriceText: 'No intermediary commission on direct bookings; the best conditions for the same dates are always here.',
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
      text: 'Canlı müsaitlik takvimi üzerinden tarihlerinizi seçin; en iyi fiyat garantisi ve esnek iptal ile direkt rezervasyonun ayrıcalığını yaşayın.',
      bestPrice: 'En İyi Fiyat Garantisi',
      bestPriceText: 'Direkt rezervasyonda aracı komisyonu yok; aynı tarihler için en iyi koşullar her zaman burada.',
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
