import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { env } from "@/lib/env";
import { getPayloadClient } from "@/lib/payload";
import {
  enforceRateLimit,
  extractClientIp,
  safeText,
  validateSameOrigin,
} from "@/lib/security";

const leadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(8).max(25),
  email: z.string().trim().email().optional().or(z.literal("")),
  eventDate: z.string().trim().max(30).optional(),
  guestCount: z.coerce.number().int().positive().max(1200).optional(),
  estimatedBudget: z.enum(["under-100k", "100k-250k", "250k-500k", "over-500k"]).optional(),
  type: z.string().trim().min(2).max(80),
  message: z.string().trim().min(10).max(3000),
  consent: z.coerce.boolean(),
  utmSource: z.string().trim().max(100).optional(),
  utmMedium: z.string().trim().max(100).optional(),
  utmCampaign: z.string().trim().max(120).optional(),
  referrer: z.string().trim().max(500).optional(),
  website: z.string().optional(),
  turnstileToken: z.string().optional(),
});

const RATE_LIMIT = {
  windowMs: 10 * 60 * 1000,
  maxRequests: 8,
};

function normalizePhone(value: string) {
  return value.replace(/\D+/g, "").slice(0, 25);
}

function normalizeEmail(value?: string) {
  return (value || "").trim().toLowerCase().slice(0, 200);
}

function scoreLead(input: z.infer<typeof leadSchema>) {
  let score = 50;

  if (input.estimatedBudget === "over-500k") score += 30;
  else if (input.estimatedBudget === "250k-500k") score += 20;

  if (input.guestCount && input.guestCount > 100) score += 15;
  if (["dugun", "kurumsal", "organizasyon"].includes(input.type.toLowerCase())) score += 10;

  const leadPriority = score >= 80 ? "high" : score <= 40 ? "low" : "normal";
  return { score, leadPriority };
}

async function verifyTurnstile(token: string | undefined, ipAddress: string) {
  if (!env.TURNSTILE_SECRET_KEY) return true;
  if (!token) return false;

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      secret: env.TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: ipAddress,
    }),
    cache: "no-store",
  });

  const result = (await response.json()) as { success?: boolean };
  return Boolean(result.success);
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let payloadData: Record<string, unknown>;

    if (contentType.includes("application/json")) {
      payloadData = await req.json();
    } else {
      const formData = await req.formData();
      payloadData = Object.fromEntries(formData.entries());
    }

    if (!validateSameOrigin(req)) {
      return NextResponse.json({ ok: false, message: "Geçersiz istek kaynağı." }, { status: 403 });
    }

    if (payloadData.website) {
      return NextResponse.json({ ok: true, message: "Success" });
    }

    const parsed = leadSchema.safeParse(payloadData);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
    }

    if (!parsed.data.consent) {
      return NextResponse.json({ ok: false, message: "Aydınlatma metni onayı zorunludur." }, { status: 400 });
    }

    const ipAddress = extractClientIp(req.headers);
    const rateLimit = enforceRateLimit(`lead:${ipAddress}`, RATE_LIMIT.maxRequests, RATE_LIMIT.windowMs);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { ok: false, message: "Çok fazla talep gönderildi. Lütfen daha sonra tekrar deneyiniz." },
        { status: 429, headers: { "Retry-After": rateLimit.retryAfterSec.toString() } },
      );
    }

    const turnstileOk = await verifyTurnstile(parsed.data.turnstileToken, ipAddress);
    if (!turnstileOk) {
      return NextResponse.json({ ok: false, message: "Bot doğrulaması başarısız." }, { status: 400 });
    }

    const payload = await getPayloadClient();
    if (!payload) {
      return NextResponse.json({ ok: false, message: "Sunucu hatası: Payload başlatılamadı." }, { status: 500 });
    }
    const normalizedPhone = normalizePhone(parsed.data.phone);
    const normalizedEmail = normalizeEmail(parsed.data.email);
    const sanitizedMessage = safeText(parsed.data.message, 3000);
    const sanitizedName = safeText(parsed.data.name, 120);
    const sanitizedType = safeText(parsed.data.type, 80);
    const dedupeHash = crypto
      .createHash("sha256")
      .update(`${normalizedEmail}|${normalizedPhone}|${sanitizedType}|${safeText(parsed.data.eventDate || "", 30)}`)
      .digest("hex");

    const duplicates = await payload.find({
      collection: "organization-leads",
      where: {
        dedupeHash: {
          equals: dedupeHash,
        },
      },
      limit: 1,
      overrideAccess: true,
    });

    if (duplicates.docs.length > 0) {
      return NextResponse.json({ ok: true, duplicate: true, message: "Talebiniz zaten alındı." });
    }

    const { score, leadPriority } = scoreLead(parsed.data);

    /* eslint-disable @typescript-eslint/no-explicit-any */
    await payload.create({
      collection: "organization-leads",
      data: {
        ...parsed.data,
        name: sanitizedName,
        type: sanitizedType,
        message: sanitizedMessage,
        source: "website",
        ipAddress,
        userAgent: req.headers.get("user-agent") || "unknown",
        normalizedPhone,
        normalizedEmail,
        dedupeHash,
        leadScore: score,
        leadPriority,
      } as any,
      overrideAccess: true,
    });
    /* eslint-enable @typescript-eslint/no-explicit-any */

    return NextResponse.json({
      ok: true,
      message: "Talebiniz alındı. Satış danışmanımız 24 saat içinde sizinle iletişime geçecek.",
    });
  } catch (error) {
    console.error("Lead submission error:", error);
    return NextResponse.json({ ok: false, message: "Bir hata oluştu. Lütfen daha sonra tekrar deneyiniz." }, { status: 500 });
  }
}
