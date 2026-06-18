/**
 * Agentic Lead Scoring Service
 * Refines lead quality based on brand alignment and intent.
 */

export const LeadService = {
  /**
   * Scores a lead based on budget, guest count, and heritage interest.
   */
  scoreLead: (data: {
    budget?: number;
    guests: number;
    intent: string;
    interests?: string[];
  }) => {
    let score = 0;
    
    // Weight: Guest Count (Revenue Potential)
    score += Math.min(data.guests * 10, 40);
    
    // Weight: Brand Alignment (Heritage/Gastronomy interest)
    const heritageTokens = ['miras', 'tarih', 'gastronomi', 'antakya', 'slow living'];
    const interestMatches = data.interests?.filter(i => 
      heritageTokens.includes(i.toLowerCase())
    ).length || 0;
    
    score += interestMatches * 15;
    
    // Weight: Intent Velocity
    if (data.intent === 'immediate') score += 20;
    
    return {
      totalScore: Math.min(score, 100),
      quality: score > 75 ? 'HIGH_VALUE' : score > 40 ? 'QUALIFIED' : 'GENERAL',
      action: score > 75 ? 'INSTANT_CALLBACK' : 'EMAIL_REACHOUT'
    };
  },

  /**
   * CRM writes must go through `/api/lead`, where CSRF, consent, Turnstile,
   * rate-limit and dedupe controls run together. This helper only returns a
   * redacted handoff result so agentic workflows cannot fake a persisted lead.
   */
  syncLeadToCRM: async (leadData: { budget?: number; guests: number; intent: string; score: number }) => {
    return {
      success: false,
      writesPerformed: 0,
      reason: "CRM writes are disabled in LeadService; submit through /api/lead.",
      redactedSummary: {
        guests: leadData.guests,
        intent: leadData.intent,
        score: leadData.score,
        hasBudget: typeof leadData.budget === "number",
      },
    };
  }
};
