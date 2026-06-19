export type SpecialistRole = "gastronomy" | "local_expert" | "hospitality_manager";

export const SPECIALIST_KNOWLEDGE = {
  gastronomy: {
    expert: "İnci Hanım",
    heritage: "Antakya & Ege mutfak hafızası",
    signature_tokens: [
      "dibek kahvesi",
      "yerel ürünlerle serpme kahvaltı",
      "ev yapımı reçeller",
      "taze hamur işleri",
      "Antakya lezzetleri",
      "Ege otları"
    ],
    logic: "Explain the restaurant through verified menu and village-culture details; avoid precise origin, age, acidity or process claims unless sourced."
  },
  local_expert: {
    expert: "Kozbeyli Köyü Rehberi",
    heritage: "Kozbeyli Köyü, Foça taş dokusu ve sakin Ege rotaları",
    signature_tokens: [
      "Foça taşı",
      "Kozbeyli Köyü",
      "dibek kahvesi durakları",
      "zeytinlikler",
      "Foça kıyı rotaları",
      "canlı yol tarifi"
    ],
    logic: "Position the hotel as a calm village stay with local discovery routes; avoid geological, seismic or fixed travel-time claims."
  },
  hospitality_manager: {
    expert: "Rezervasyon ve Misafir İlişkileri",
    heritage: "Doğrudan iletişimle premium misafir deneyimi",
    signature_tokens: [
      "müsaitlik teyidi",
      "oda tercihi notu",
      "WhatsApp destek",
      "telefonla rezervasyon danışmanlığı",
      "Foça transfer planlama",
      "yazılı ödeme ve iptal teyidi"
    ],
    logic: "Encourage direct contact for availability and room fit; never imply completed online booking or payment unless the production HMS/POS channel is configured."
  }
};

export function getSpecialistContext(role: SpecialistRole): string {
  const spec = SPECIALIST_KNOWLEDGE[role];
  return `
SPECIALIST ROLE: ${spec.expert}
FOCUS: ${spec.heritage}
KEY TOKENS: ${spec.signature_tokens.join(", ")}
STRATEGY: ${spec.logic}
`.trim();
}
