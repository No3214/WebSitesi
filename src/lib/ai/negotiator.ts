/**
 * AI Negotiator Agent
 * Logic to detect user hesitation and offer dynamic persuasion (Merchant's Handshake).
 */
export interface NegotiationOffer {
  title: string;
  perk: string;
  code: string;
}

export const NegotiatorAgent = {
  detectHesitation: (interactionCount: number) => {
    return interactionCount > 5;
  },

  getPersuasionOffer: (tier: string = "GENEL"): NegotiationOffer => {
    const offers: Record<string, NegotiationOffer> = {
      "GENEL": {
        title: "Tüccar Tokalaşması (Heritage Perk)",
        perk: "Direkt rezervasyonda İnci Hanım'dan antropolojik reçete ile yapılmış el yapımı reçel ve 500 yıllık dibekte dövülmüş kahve hediyesi.",
        code: "MERCHANT10"
      },
      "ALTIN_MİSAFİR": {
        title: "Dost Ağırlaması (Cognitive Tier)",
        perk: "Açık büfe akşam yemeği indirimi, geç check-out ve Kozbeyli Tüfü altında özel mimari tur.",
        code: "DOST20"
      }
    };

    return offers[tier] || offers["GENEL"];
  }
};
