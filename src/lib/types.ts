export interface Dictionary {
  Home: {
    title: string;
    eyebrow: string;
    cta: string;
    story: string;
    heroTitle: string;
    heroText: string;
    bookNow: string;
    planEvent: string;
    kpiGuestExperience: string;
    kpiBookingTrust: string;
    kpiResponseTime: string;
    roomsTitle: string;
    roomsText: string;
    conciergeEyebrow: string;
    conciergeTitle: string;
    conciergeText: string;
    bookingTitle: string;
    bookingText: string;
    faqEyebrow: string;
    faqTitle: string;
    faqText: string;
    experiences: {
      title: string;
      text: string;
    }[];
    faqs: {
      q: string;
      a: string;
    }[];
  };
  Navigation: {
    history: string;
    rooms: string;
    dining: string;
    events: string;
    booking: string;
  };
  Rooms: {
    title: string;
    eyebrow: string;
    text: string;
    detail: string;
    size: string;
    capacity: string;
    view: string;
    experience: string;
    directBookingAdvantage: string;
    selectDates: string;
    bestPriceBook: string;
    muehuerlueTasKonak: string;
  };
  Footer: {
    description: string;
    explore: string;
    legal: string;
    contact: string;
  };
  Common: {
    hours: string;
    loading: string;
    error: string;
  };
  LeadForm: {
    name: string;
    phone: string;
    email: string;
    date: string;
    guests: string;
    budget: string;
    budgetUnder100: string;
    budget100to250: string;
    budget250to500: string;
    budgetOver500: string;
    type: string;
    typeWedding: string;
    typeEngagement: string;
    typeCorporate: string;
    typeSpecial: string;
    message: string;
    consent: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successText: string;
    newRequest: string;
    error: string;
  };
  Organizations: {
    eyebrow: string;
    title: string;
    text: string;
    contactEyebrow: string;
    contactTitle: string;
    contactText: string;
    requestOffer: string;
    packages: {
      title: string;
      description: string;
      category: string;
    }[];
  };
  Gastronomy: {
    heroTitle: string;
    heroSubtitle: string;
    inciTitle: string;
    inciContent: string;
    dibekTitle: string;
    dibekContent: string;
    breakfastTitle: string;
    breakfastContent: string;
  };
  History: {
    heroTitle: string;
    heroSubtitle: string;
    textureTitle: string;
    textureContent: string;
    merchantTitle: string;
    merchantContent: string;
    restorationTitle: string;
    restorationContent: string;
  };
}
