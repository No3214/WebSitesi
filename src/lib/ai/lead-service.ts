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
   * Syncs lead to Payload CMS.
   */
  syncLeadToCRM: async (leadData: { budget?: number; guests: number; intent: string; score: number }) => {
    console.log('[LeadService] Syncing lead to Payload CMS...', leadData);
    // Simulated fetch call to Payload endpoint
    // await fetch('/api/leads', { method: 'POST', body: JSON.stringify(leadData) });
    return { success: true, leadId: 'lead_' + Math.random().toString(36).substr(2, 9) };
  }
};
