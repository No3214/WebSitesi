/** Canonical contact info — single source of truth */
export const CONTACT = {
  phone: "+905322342686",
  phoneDisplay: "0532 234 26 86",
  phoneInternational: "+90 (532) 234 26 86",
  email: "info@kozbeylikonagi.com",
  instagram: "kozbeylikonagi",
  instagramUrl: "https://www.instagram.com/kozbeylikonagi/",
  whatsappUrl: "https://wa.me/905322342686",
  mapsUrl: "https://maps.app.goo.gl/DXMWQg8aJHt3KNcTA",
  address: {
    street: "Kozbeyli Küme Evleri No:188",
    district: "Foça",
    city: "İzmir",
    postalCode: "35680",
    country: "TR",
    full: "Kozbeyli Küme Evleri No:188, Foça, İzmir 35680",
  },
  coordinates: {
    latitude: 38.7275,
    longitude: 26.7456,
  },
} as const;

/** WhatsApp link with optional pre-filled message */
export function whatsappLink(message?: string) {
  if (!message) return CONTACT.whatsappUrl;
  return `${CONTACT.whatsappUrl}?text=${encodeURIComponent(message)}`;
}
