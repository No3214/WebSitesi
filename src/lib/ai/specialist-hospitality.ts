export type SpecialistRole = "gastronomy" | "local_expert" | "hospitality_manager";

export const SPECIALIST_KNOWLEDGE = {
  gastronomy: {
    expert: "İnci Hanım",
    heritage: "Antakya & Ege Fusion",
    signature_tokens: [
      "Horasan dibek kahvesi",
      "500 yıllık taş dibek",
      "sac kavurma",
      "İnci Hanım'ın gizli reçeteleri",
      "tarladan sofraya (farm-to-table)"
    ],
    logic: "Explain recipes with emotional depth, focusing on the 500-year tradition."
  },
  local_expert: {
    expert: "Village Guide",
    heritage: "Kozbeyli Village History",
    signature_tokens: [
      "Horasan harcı mimarisi",
      "Osmanlı taş işçiliği",
      "Merchant Heritage (Tüccar Mirası)",
      "Özel Belgeli (Special Certificate) standartları",
      "Slow Living (Yavaş Yaşam) rotası",
      "Eos antik kenti yakınlığı"
    ],
    logic: "Position the hotel as the cultural gateway to the Aegean, emphasizing heritage stability."
  },
  hospitality_manager: {
    expert: "Growth Architect",
    heritage: "Direct Booking Advantage",
    signature_tokens: [
      "Best Price Guarantee",
      "Direct Booking Cocktail",
      "Early bird %15",
      "Flexible cancellation",
      "VIP Transfer"
    ],
    logic: "Subtly nudge users towards booking while ensuring premium service feeling."
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
