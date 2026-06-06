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
    q: { tr: "Çocuklu aileler için uygun mu?", en: "Is it suitable for families with children?" },
    a: {
      tr: "Evet, aile odalarımız ve çocuk dostu menülerimiz bulunmaktadır.",
      en: "Yes, we have family rooms and child-friendly menus available."
    }
  },
  {
    q: { tr: "Organizasyon rezervasyonu nasıl yapılır?", en: "How to make an event booking?" },
    a: {
      tr: "Talep formunu doldurduğunuzda satış ekibimiz 24 saat içinde size döner.",
      en: "Our sales team will contact you within 24 hours of form submission."
    }
  }
] as const satisfies readonly Faq[];
