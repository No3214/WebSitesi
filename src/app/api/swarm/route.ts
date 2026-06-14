import { NextResponse } from "next/server";
import { z } from "zod";

import { errField, logEvent } from "@/lib/logger";
import { enforceRateLimit, extractClientIp, safeText, validateSameOrigin } from "@/lib/security";

const taskTypes = [
  "sales-concierge",
  "pricing-agent",
  "content-architect",
  "design-agent",
  "ecc-check",
  "growth-engine",
] as const;

type TaskType = (typeof taskTypes)[number];
type SwarmTaskResult = {
  agent: string;
  summary: string;
  nextActions?: string[];
  supportingAgents?: SwarmTaskResult[];
};

const requestSchema = z.object({
  taskType: z.enum(taskTypes),
  payload: z.record(z.unknown()).optional().default({}),
});

const SWARM_RATE_LIMIT = {
  windowMs: 10 * 60 * 1000,
  maxRequests: 20,
};

function sanitizePayload(payload: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [
      safeText(key, 48),
      typeof value === "string" ? safeText(value, 280) : value,
    ]),
  );
}

function runTask(taskType: TaskType, payload: Record<string, unknown>): SwarmTaskResult {
  const context = typeof payload.context === "string" ? payload.context : "";
  const dates = typeof payload.dates === "string" ? payload.dates : "seçilen tarihler";

  switch (taskType) {
    case "sales-concierge":
      return {
        agent: "sales-concierge",
        summary:
          `Misafir talebi ${dates} için rezervasyon akışına alındı. Yanıt, direkt rezervasyon avantajı yerine uygunluk ve kişiselleştirilmiş planlama üzerinden kurulmalı.`,
        nextActions: [
          "HMS linki yoksa WhatsApp fallback ile uygunluk al",
          "Oda tercihi, kişi sayısı ve özel beklentiyi tek mesajda netleştir",
          "Fiyat veya garanti edilmeyen kampanya uydurma",
        ],
      };
    case "pricing-agent":
      return {
        agent: "pricing-agent",
        summary:
          "Canlı PMS/HMS fiyat kaynağı bağlı olmadığı için otomatik fiyat artırımı yapılmaz; sadece dönemsel talep sinyali ve manuel teklif önerisi üretildi.",
        nextActions: [
          "Canlı stok ve fiyat kaynağı gelene kadar fiyatı sabitleme",
          "Hafta sonu ve etkinlik taleplerini misafir ilişkileri onayına yönlendir",
          "Teklif sayfasında fiyat göstermeme kuralını koru",
        ],
      };
    case "content-architect":
      return {
        agent: "content-architect",
        summary:
          "İçerik önerisi marka sözlüğüne göre değerlendirildi: authentic, curation, historic texture ve Aegean hospitality ekseni korunmalı.",
        nextActions: [
          "Kozbeyli, Foça, taş mimari, dibek kahvesi ve Antakya-Ege mutfağı bağlamını güçlendir",
          "Yerel işletme veya tarih iddiası için kanıt yoksa ekleme",
          "TR birincil, EN uluslararası misafir için kısa ve rafine olmalı",
        ],
      };
    case "design-agent":
      return {
        agent: "design-agent",
        summary:
          "Tasarım kontrolü: taş, zeytin, sabah güneşi, warm white ve deep azure kimliği korunmalı; kart yoğunluğu ve düşük kontrast izlenmeli.",
        nextActions: [
          "Küçük altın metinlerde erişilebilir koyu altın tonu kullan",
          "Hero ve oda görsellerinde gerçek ürün sinyalini koru",
          "Mobilde CTA ve dil geçişi TR/EN rota bütünlüğünü bozmasın",
        ],
      };
    case "ecc-check":
      return {
        agent: "ecc-check",
        summary:
          "ECC güvenlik kapısı fail-closed çalışır: imza, origin veya zorunlu alan yoksa işlem onaylanmaz.",
        nextActions: [
          "Webhook imzalarını production secret ile doğrula",
          "Tekrar saldırısı için Upstash Redis production env gir",
          "Ödeme/POS bilgisi olmadan tahsilat yapıldığı izlenimi verme",
        ],
      };
    case "growth-engine":
      return {
        agent: "master-growth-engine",
        summary:
          `Growth swarm ${context || "genel yayın hazırlığı"} bağlamında beş alt ajanı koordine etti.`,
        supportingAgents: [
          runTask("sales-concierge", payload),
          runTask("pricing-agent", payload),
          runTask("content-architect", payload),
          runTask("design-agent", payload),
          runTask("ecc-check", payload),
        ],
      };
  }
}

export function GET() {
  return NextResponse.json({
    mode: "deterministic-advisory",
    allowedTaskTypes: taskTypes,
    productionNote:
      "This endpoint produces governed recommendations. It does not execute paid media, pricing, payment or external booking actions.",
  });
}

export async function POST(req: Request) {
  try {
    if (!validateSameOrigin(req)) {
      return NextResponse.json({ error: "Geçersiz istek kaynağı." }, { status: 403 });
    }

    const ipAddress = extractClientIp(req.headers);
    const rateLimit = await enforceRateLimit(
      `swarm:${ipAddress}`,
      SWARM_RATE_LIMIT.maxRequests,
      SWARM_RATE_LIMIT.windowMs,
    );
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many swarm requests" },
        { status: 429, headers: { "Retry-After": rateLimit.retryAfterSec.toString() } },
      );
    }

    const parsed = requestSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid swarm task",
          allowedTaskTypes: taskTypes,
          issues: parsed.error.issues.map((issue) => issue.path.join(".")),
        },
        { status: 400 },
      );
    }

    const payload = sanitizePayload(parsed.data.payload);

    return NextResponse.json({
      status: "success",
      mode: "deterministic-advisory",
      taskType: parsed.data.taskType,
      payload,
      result: runTask(parsed.data.taskType, payload),
      governance: {
        executesExternalActions: false,
        requiresHumanApproval: ["pricing", "payments", "booking-engine", "paid-media"],
        evidenceRequired: true,
      },
    });
  } catch (err) {
    logEvent("error", "swarm.unhandled", { err: errField(err) });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
