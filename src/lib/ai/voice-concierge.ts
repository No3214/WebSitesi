/**
 * Voice Concierge Personality Blueprint (V2)
 * Orchestrates the "Slow Living" & "Heritage Authority" vocal identity.
 */
export const VoiceConcierge = {
  getVoiceBlueprint: () => ({
    provider: "ElevenLabs",
    voice_id: "Kozbeyli_Signature_V1", // Custom trained voice on İnci Hanım's calm tone
    settings: {
      stability: 0.75,
      similarity_boost: 0.8,
      style: 0.05,
      use_speaker_boost: true
    },
    vocal_traits: {
      tempo: "0.85x", // Measured, calm
      pitch: "Warm mid-range",
      pauses: "Tactical breath pauses before heritage details"
    }
  }),
  
  getPromptEnrichment: (intent: string) => {
    const context = {
        HERITAGE_QUERY: "Speak with architectural authority. Mention Horasan harms or thermal mass of the stone if relevant.",
        BOOKING_QUERY: "Be warm and welcoming, like a host inviting a guest to their family home.",
        GASTRONOMY_QUERY: "Emphasize the Antakya roots and the 180-year-old dibek coffee ritual."
    };
    return context[intent as keyof typeof context] || "Maintain a helpful, premium tone.";
  }
};
