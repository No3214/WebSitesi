/**
 * AI Negotiator Agent
 * Logic to detect user hesitation and offer dynamic persuasion (Merchant's Handshake).
 */
export interface NegotiationOffer {
  title: string;
  perk: string;
}

export const NegotiatorAgent = {
  detectHesitation: (interactionCount: number) => {
    return interactionCount > 5;
  },

  getPersuasionOffer: (tier: string = "GENEL"): NegotiationOffer => {
    const offers: Record<string, NegotiationOffer> = {
      "GENEL": {
        title: "Concierge Notu",
        perk: "Müsaitlik, oda tercihi ve özel beklentilerinizi rezervasyon ekibine tek mesajda iletebilirim."
      },
      "ALTIN_MİSAFİR": {
        title: "Dost Ağırlaması",
        perk: "Tekrar geliş notunuzu ekibe aktarabilir, müsaitliğe bağlı erken giriş/geç çıkış talebinizi önceliklendirebilirim."
      }
    };

    return offers[tier] || offers["GENEL"];
  }
};
