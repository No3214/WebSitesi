import path from "path";

export type OrganizationFollowupPayload = {
  name: string;
  phone: string;
  type: string;
  message: string;
  leadScore?: number;
  leadPriority?: string;
};

export async function runOrganizationFollowup(payload: OrganizationFollowupPayload) {
  const isHighValue =
    payload.leadPriority === "high" || Boolean(payload.leadScore && payload.leadScore > 80);

  const contextMap: Record<string, string> = {
    dugun:
      "Düğün organizasyonları için L-Tipi Sofa mimarisi ve geleneksel avlu atmosferi vurgulanmalı.",
    kurumsal:
      "Kurumsal taleplerde Andezit termal kütle serinliği ve mikro-klima avantajları işlenmeli.",
    organizasyon:
      "Genel organizasyonlarda Antakya-Ege sofrası ve dibek ritüeli ile özel sunumlar planlanmalı.",
  };

  const strategy =
    contextMap[payload.type.toLowerCase()] ||
    "Kozbeyli mirası ve Aegean hospitality odağında rafine bir karşılama hazırlanmalı.";

  let videoUrl: string | null = null;
  if (isHighValue) {
    try {
      const { renderHeritageVideo } = await import("@/remotion/render");
      const outputPath = await renderHeritageVideo(payload.name.replace(/\s+/g, "-"), {
        title: `Sn. ${payload.name}`,
        subtitle: payload.type === "dugun" ? "Mirasımızda Bir Ömür" : "Tarihi Başarılar",
        description: strategy,
      });
      videoUrl = `/videos/${path.basename(outputPath)}`;
    } catch {
      videoUrl = null;
    }
  }

  return {
    ok: true,
    data: {
      enriched: true,
      strategy,
      heritageTag: "Heritage-Grade",
      assignedTo: isHighValue ? "Senior Concierge" : "Concierge",
      followupDeadline: isHighValue ? "2 Hours" : "24 Hours",
      automatedVideo: videoUrl,
    },
  };
}

// SDK-free contract kept for tests/importers. Trigger.dev v4 wiring should wrap
// runOrganizationFollowup from an external automation worker when credentials exist.
export const organizationFollowup = {
  id: "organization-followup",
  run: runOrganizationFollowup,
};
