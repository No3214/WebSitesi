import { getPayloadClient } from "@/lib/payload";
import { safeText } from "@/lib/security";

export interface LeadData {
  name: string;
  phone: string;
  email?: string;
  type: string;
  message: string;
  eventDate?: string;
  guestCount?: number;
  estimatedBudget?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function processLeadSubmission(data: LeadData) {
  const payload = await getPayloadClient();
  if (!payload) throw new Error("Payload client not initialized");

  // 1. Normalization
  const normalizedPhone = data.phone.replace(/\D/g, "");
  const normalizedEmail = data.email?.toLowerCase().trim();
  const sanitizedName = safeText(data.name, 120);
  const sanitizedMessage = safeText(data.message, 3000);

  // 2. Duplicate Detection (Simple phone/date hash)
  const existingLead = await payload.find({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    collection: "organization-leads" as any,
    where: {
      and: [
        { phone: { equals: normalizedPhone } },
        { name: { equals: sanitizedName } }
      ]
    }
  });

  if (existingLead.totalDocs > 0) {
    // Check if it's the same day
    const lastLead = existingLead.docs[0];
    const today = new Date().toISOString().split('T')[0];
    const leadDay = new Date(lastLead.createdAt).toISOString().split('T')[0];
    
    if (today === leadDay) {
      return { status: 409, message: "Aynı gün içinde mükerrer talep tespit edildi." };
    }
  }

  // 3. Lead Scoring Logic
  let score = 50;
  if (data.estimatedBudget === "over-500k") score += 30;
  else if (data.estimatedBudget === "250k-500k") score += 20;

  if (data.guestCount && data.guestCount > 100) score += 15;
  if (data.type === "dugun" || data.type === "kurumsal") score += 10;

  const priority = score >= 80 ? "HIGH" : "NORMAL";

  // 4. Create Lead
  await payload.create({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    collection: "organization-leads" as any,
    data: {
      ...data,
      name: sanitizedName,
      phone: normalizedPhone,
      email: normalizedEmail,
      message: sanitizedMessage,
      leadScore: score,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      leadPriority: priority.toLowerCase() as any, // "HIGH" -> "high"
      // Since I might not have updated the collection schema yet, I'll use the message prefix strategy too
      internalNotes: `SCORE: ${score} | PRIORITY: ${priority}`,
      source: data.utmSource ? `utm:${data.utmSource}` : "website",
    },
    overrideAccess: true,
  });

  return { status: 200, ok: true };
}

export async function verifyTurnstileToken(token: string) {
  const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
  if (!secretKey) return true; // Fail open if no secret configured (for dev/demo)

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
    });
    const result = await res.json();
    return result.success;
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return false;
  }
}
