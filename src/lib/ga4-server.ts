import crypto from "node:crypto";

import { env } from "@/lib/env";
import { logEvent } from "@/lib/logger";

// GA4 Measurement Protocol — server-side purchase ölçümü.
//
// Neden server-side: rezervasyon HMS booking engine'de tamamlanır; tarayıcı
// bizim sitemizde olmayabilir. Tek güvenilir an, HMS'in rezervasyon
// webhook'udur. Bu modül o anda GA4'e `purchase` basar.
//
// Davranış sözleşmesi:
// - GA4_MEASUREMENT_ID veya GA4_API_SECRET boşsa SESSİZCE no-op (engine/GA4
//   kurulumları tamamlanana kadar güvenli).
// - Asla throw etmez; webhook akışını hiçbir koşulda kırmaz.
// - client_id: webhook'ta gerçek tarayıcı kimliği yoktur; rezervasyon ID'sinden
//   DETERMİNİSTİK türetilir → aynı rezervasyon için tekrar gönderim GA4
//   tarafında aynı transaction_id + client_id ile dedupe edilebilir.
// - PII GÖNDERİLMEZ: yalnızca rezervasyon no, tutar, para birimi, oda adı.

const GA4_ENDPOINT = "https://www.google-analytics.com/mp/collect";
const TIMEOUT_MS = 3000;

export type Ga4PurchaseInput = {
  transactionId: string;
  value: number;
  currency: string;
  itemName?: string;
};

export function isGa4ServerConfigured() {
  return Boolean(env.GA4_MEASUREMENT_ID && env.GA4_API_SECRET);
}

function pseudoClientId(transactionId: string) {
  // GA4 MP client_id "X.Y" sayısal biçimini bekler; hash'ten iki blok üret.
  const digest = crypto.createHash("sha256").update(`s2s:${transactionId}`).digest();
  const a = digest.readUInt32BE(0);
  const b = digest.readUInt32BE(4);
  return `${a}.${b}`;
}

/**
 * GA4'e server-side purchase gönderir. Başarı/başarısızlık yalnızca loglanır.
 * @returns true: gönderildi (2xx), false: yapılandırma yok veya gönderilemedi
 */
export async function sendGa4Purchase(input: Ga4PurchaseInput): Promise<boolean> {
  if (!isGa4ServerConfigured()) {
    logEvent("info", "ga4.purchase.skipped_not_configured", {
      transactionId: input.transactionId,
    });
    return false;
  }

  const value = Number.isFinite(input.value) ? Math.max(0, input.value) : 0;
  const currency = (input.currency || "TRY").toUpperCase().slice(0, 3);

  const body = {
    client_id: pseudoClientId(input.transactionId),
    events: [
      {
        name: "purchase",
        params: {
          transaction_id: input.transactionId,
          value,
          currency,
          items: [
            {
              item_id: input.transactionId,
              item_name: input.itemName || "Konaklama Rezervasyonu",
              item_category: "oda",
              price: value,
              quantity: 1,
            },
          ],
        },
      },
    ],
  };

  const url = `${GA4_ENDPOINT}?measurement_id=${encodeURIComponent(env.GA4_MEASUREMENT_ID)}&api_secret=${encodeURIComponent(env.GA4_API_SECRET)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    // MP /mp/collect geçerli isteklere 2xx (genelde 204) döner.
    if (res.status >= 200 && res.status < 300) {
      logEvent("info", "ga4.purchase.sent", {
        transactionId: input.transactionId,
        value,
        currency,
      });
      return true;
    }

    logEvent("warn", "ga4.purchase.rejected", {
      transactionId: input.transactionId,
      status: res.status,
    });
    return false;
  } catch (error) {
    logEvent("warn", "ga4.purchase.failed", {
      transactionId: input.transactionId,
      error: error instanceof Error ? error.name : "unknown",
    });
    return false;
  }
}
