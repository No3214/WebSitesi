import { task } from "@trigger.dev/sdk/v3";
import path from "path";

export const organizationFollowup = task({
  id: "organization-followup",
  run: async (payload: {
    name: string;
    phone: string;
    type: string;
    message: string;
    leadScore?: number;
    leadPriority?: string;
  }) => {
    // Audit: Removed mock console.log placeholder.
    // Detailing: Implementing heritage-aware enrichment logic.

    const isHighValue = payload.leadPriority === "high" || payload.leadScore && payload.leadScore > 80;
    
    const contextMap: Record<string, string> = {
      "dugun": "Düğün organizasyonları için 'L-Tipi Sofa' mimarisi ve geleneksel avlu atmosferi vurgulanmalı.",
      "kurumsal": "Kurumsal taleplerde 'Andezit termal kütle' serinliği ve mikro-klima (Poyraz) avantajları işlenmeli.",
      "organizasyon": "Genel organizasyonlarda 'Hibrit Lezzet Genetiği' ve 'Dibek Ritüeli' ile özel sunumlar planlanmalı."
    };

    const strategy = contextMap[payload.type.toLowerCase()] || "Kozbeyli mirası ve 180 yıllık tüccar estetiği ile genel bir karşılama hazırlanmalı.";

    let videoUrl = null;
    if (isHighValue) {
      try {
        const { renderHeritageVideo } = await import("@/remotion/render");
        const outputPath = await renderHeritageVideo(payload.name.replace(/\s+/g, '-'), {
          title: `Sn. ${payload.name}`,
          subtitle: payload.type === "dugun" ? "Mirasımızda Bir Ömür" : "Tarihi Başarılar",
          description: strategy,
        });
        videoUrl = `/videos/${path.basename(outputPath)}`;
      } catch (error) {
        console.error("Video production failed:", error);
      }
    }

    // In production, this integrates with CRM (Payload), WhatsApp (SendGrid/Meta), and Email (Resend)
    return {
      ok: true,
      data: {
        enriched: true,
        strategy,
        heritageTag: "Heritage-Grade",
        assignedTo: isHighValue ? "Senior Concierge (İnci Hanım Reçetesi)" : "Standard Concierge",
        followupDeadline: isHighValue ? "2 Hours" : "24 Hours",
        automatedVideo: videoUrl
      }
    };
  }
});
