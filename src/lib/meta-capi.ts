import { env } from "@/lib/env";
import { logEvent } from "@/lib/logger";

// Meta Conversions API (CAPI) — server-side Purchase ölçümü.
//
// Neden server-side: rezervasyon HMS booking engine'de ({slug}.hmshotel.net,
// AYRI alan) tamamlanır; tarayıcı bizim sitemizde olmayabilir ve onay sayfasına
// Pixel enjekte edemeyebiliriz. Güvenilir an HMS rezervasyon webhook'udur.
// Bu modül o anda Meta'ya `Purchase` eventini sunucudan gönderir.
//
// Davranış sözleşmesi (sendGa4Purchase ile aynı):
// - NEXT_PUBLIC_META_PIXEL_ID veya META_CAPI_ACCESS_TOKEN boşsa SESSİZCE no-op.
// - Asla throw etmez; webhook akışını kırmaz.
// - event_id = rezervasyon no → tarayıcı Pixel Purchase'i ile DEDUPE edilir
//   (Meta aynı event_id'li server+browser olayını tekilleştirir).
// - PII GÖNDERİLMEZ: user_data boş; action_source "system_generated".

const META_GRAPH_VERSION = "v21.0";
const TIMEOUT_MS = 3000;

export type MetaPurchaseInput = {
  /** HMS rezervasyon no — event_id (dedupe anahtarı). */
  transactionId: string;
  value: number;
  currency: string;
  roomName?: string;
};

export function isMetaCapiConfigured() {
  return Boolean(env.NEXT_PUBLIC_META_PIXEL_ID && env.META_CAPI_ACCESS_TOKEN);
}

/**
 * Meta CAPI'ye server-side Purchase gönderir. Sonuç yalnızca loglanır.
 * @returns true: gönderildi (2xx), false: yapılandırma yok veya gönderilemedi
 */
export async function sendMetaPurchase(input: MetaPurchaseInput): Promise<boolean> {
  if (!isMetaCapiConfigured()) {
    logEvent("info", "meta.purchase.skipped_not_configured", {
      transactionId: input.transactionId,
    });
    return false;
  }

  const value = Number.isFinite(input.value) ? Math.max(0, input.value) : 0;
  const currency = (input.currency || "TRY").toUpperCase().slice(0, 3);

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.transactionId,
        action_source: "system_generated",
        custom_data: {
          value,
          currency,
          content_type: "product",
          content_name: input.roomName || "Konaklama Rezervasyonu",
          order_id: input.transactionId,
        },
      },
    ],
  };
  // Test modu: doluysa Events Manager > Test Events'te gorunur (uretimde bos).
  if (env.META_CAPI_TEST_EVENT_CODE) {
    body.test_event_code = env.META_CAPI_TEST_EVENT_CODE;
  }

  const url =
    `https://graph.facebook.com/${META_GRAPH_VERSION}/` +
    `${encodeURIComponent(env.NEXT_PUBLIC_META_PIXEL_ID)}/events` +
    `?access_token=${encodeURIComponent(env.META_CAPI_ACCESS_TOKEN)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (res.status >= 200 && res.status < 300) {
      logEvent("info", "meta.purchase.sent", {
        transactionId: input.transactionId,
        value,
        currency,
      });
      return true;
    }

    logEvent("warn", "meta.purchase.rejected", {
      transactionId: input.transactionId,
      status: res.status,
    });
    return false;
  } catch (error) {
    logEvent("warn", "meta.purchase.failed", {
      transactionId: input.transactionId,
      error: error instanceof Error ? error.name : "unknown",
    });
    return false;
  }
}
