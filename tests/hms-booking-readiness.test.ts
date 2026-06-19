import path from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

type HmsBookingReadinessModule = {
  OFFICIAL_HMS_BOOKING_ENGINE_URL: string;
  evaluateHmsBookingReadiness: (args?: {
    rawUrl?: string;
    fetchImpl?: typeof fetch;
    timeoutMs?: number;
  }) => Promise<{
    decision: string;
    configurationSource: string;
    configurationReady: boolean;
    targetUrl: string;
    page: {
      status: number;
      finalUrl: string;
      hasKozbeyli: boolean;
      hasReservation: boolean;
      wrongPropertySignals: string[];
    };
    blockers: string[];
    warnings: string[];
  }>;
};

async function loadHmsReadinessModule() {
  return (await import(
    pathToFileURL(path.join(process.cwd(), "scripts/hms-booking-readiness.mjs")).href
  )) as HmsBookingReadinessModule;
}

function htmlResponse(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: { "content-type": "text/html; charset=UTF-8" },
  });
}

const kozbeyliReservationHtml = `
  <!doctype html>
  <html lang="tr">
    <head>
      <title>Varol Oruk - Reservation</title>
      <meta name="description" content="Kozbeyli Konağı Hotel Reservation" />
    </head>
    <body>Kozbeyli Konağı reservation screen</body>
  </html>
`;

describe("hms booking readiness", () => {
  it("passes when the official HMS fallback resolves to Kozbeyli reservation HTML", async () => {
    const { evaluateHmsBookingReadiness, OFFICIAL_HMS_BOOKING_ENGINE_URL } =
      await loadHmsReadinessModule();
    const result = await evaluateHmsBookingReadiness({
      rawUrl: "",
      fetchImpl: async () => htmlResponse(kozbeyliReservationHtml),
    });

    expect(result.decision).toBe("HMS BOOKING TARGET PASS");
    expect(result.configurationSource).toBe("code_fallback");
    expect(result.configurationReady).toBe(true);
    expect(result.targetUrl).toBe(OFFICIAL_HMS_BOOKING_ENGINE_URL);
    expect(result.page.hasKozbeyli).toBe(true);
    expect(result.page.hasReservation).toBe(true);
    expect(result.blockers).toEqual([]);
  });

  it("rejects explicit non-Kozbeyli booking engine hosts even when they are HTTPS", async () => {
    const { evaluateHmsBookingReadiness } = await loadHmsReadinessModule();
    const result = await evaluateHmsBookingReadiness({
      rawUrl: "https://soleil-mansion.hotelrunner.com/bv3/search",
      fetchImpl: async () => htmlResponse(kozbeyliReservationHtml),
    });

    expect(result.decision).toBe("HMS BOOKING TARGET FAIL");
    expect(result.configurationSource).toBe("invalid_env");
    expect(result.configurationReady).toBe(false);
    expect(result.blockers).toContain("booking target host must be kozbeyli-konagi.hmshotel.net");
  });

  it("rejects insecure first-hop redirects from the booking target", async () => {
    const { evaluateHmsBookingReadiness } = await loadHmsReadinessModule();
    const result = await evaluateHmsBookingReadiness({
      fetchImpl: async (url: string | URL | Request, init?: RequestInit) => {
        if (init?.redirect === "manual") {
          return new Response("", {
            status: 301,
            headers: { location: "http://kozbeyli-konagi.hmshotel.net/" },
          });
        }

        return htmlResponse(kozbeyliReservationHtml);
      },
    });

    expect(result.decision).toBe("HMS BOOKING TARGET FAIL");
    expect(result.blockers).toContain(
      "booking target redirects first hop to insecure HTTP: http://kozbeyli-konagi.hmshotel.net/",
    );
  });

  it("rejects wrong-property HTML even when the HTTP response is otherwise successful", async () => {
    const { evaluateHmsBookingReadiness } = await loadHmsReadinessModule();
    const result = await evaluateHmsBookingReadiness({
      fetchImpl: async () =>
        htmlResponse(
          "<html><head><title>Soleil Mansion Reservation</title></head><body>soleil-mansion hotelrunner.com/bv3/search</body></html>",
        ),
    });

    expect(result.decision).toBe("HMS BOOKING TARGET FAIL");
    expect(result.page.hasKozbeyli).toBe(false);
    expect(result.page.wrongPropertySignals).toContain("soleil mansion");
    expect(result.blockers).toContain("booking target page does not include Kozbeyli property copy");
    expect(result.blockers).toContain(
      "booking target includes wrong-property signal: soleil mansion, soleil-mansion, hotelrunner.com/bv3/search",
    );
  });
});
