import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import { safeText } from "@/lib/security";

const replayStore = new Map<string, number>();
const MAX_AGE_MS = 10 * 60 * 1000;
const ALLOWED_EVENTS = new Set(["reservation.created", "reservation.updated", "reservation.cancelled"]);

function isReplay(messageUid: string) {
  const now = Date.now();
  for (const [uid, expiresAt] of replayStore.entries()) {
    if (expiresAt <= now) replayStore.delete(uid);
  }
  if (replayStore.has(messageUid)) return true;
  replayStore.set(messageUid, now + MAX_AGE_MS);
  return false;
}

export async function GET() {
  return NextResponse.json({ status: "active", version: "1.1.0", support: "HMAC-SHA256" });
}

export async function POST(req: Request) {
  try {
    const messageUid = req.headers.get("x-message-uid");
    const signature = req.headers.get("x-payload-signature");
    const secret = process.env.HOTELRUNNER_WEBHOOK_SECRET;

    if (!secret || !signature || !messageUid) {
      return NextResponse.json({ error: "Missing webhook security headers" }, { status: 401 });
    }

    if (isReplay(messageUid)) {
      return NextResponse.json({ error: "Replay detected" }, { status: 409 });
    }

    const bodyText = await req.text();
    const expected = crypto.createHmac("sha256", secret).update(bodyText).digest("hex");
    const signatureBuffer = Buffer.from(signature, "utf8");
    const expectedBuffer = Buffer.from(expected, "utf8");

    if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = JSON.parse(bodyText) as {
      event?: string;
      reservation?: Record<string, any>;
    };

    if (!body.event || !ALLOWED_EVENTS.has(body.event)) {
      return NextResponse.json({ error: "Unsupported event type" }, { status: 400 });
    }

    if (!body.reservation) {
      return NextResponse.json({ error: "Unsupported payload structure" }, { status: 400 });
    }

    const payload = await getPayloadClient();
    if (!payload) return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });

    const res = body.reservation;
    const reservationId = safeText(String(res.id || messageUid), 80);

    // Audit Log in HotelRunnerEvents
    await payload.create({
      collection: "hotelrunner-events" as any,
      data: {
        messageUid,
        event: body.event,
        payload: body,
        status: "processed"
      }
    });

    // Create Lead
    await payload.create({
      collection: "organization-leads" as any,
      data: {
        name: `${safeText(res.guest_first_name || "Misafir", 80)} ${safeText(res.guest_last_name || "", 80)}`.trim(),
        email: safeText(res.guest_email || "", 160) || `booking-${reservationId}@hotelrunner.local`,
        phone: safeText(res.guest_phone || "", 40),
        type: "Reservation",
        consent: true,
        message: [
          `Event: ${body.event}`,
          `Rezervasyon ID: ${reservationId}`,
          `Durum: ${safeText(String(res.status || "unknown"), 60)}`,
          `Oda: ${safeText(String(res.room_type_name || "unknown"), 120)}`,
          `Konaklama: ${safeText(String(res.checkin || "-"), 30)} / ${safeText(String(res.checkout || "-"), 30)}`,
          `Toplam Tutar: ${safeText(String(res.total_price || "0"), 30)} ${safeText(String(res.currency_code || ""), 10)}`,
          `Notlar: ${safeText(String(res.guest_notes || "Yok"), 500)}`,
        ].join("\n"),
        source: `hotelrunner:${reservationId}`,
      },
      draft: false,
    });

    const response = NextResponse.json({ ok: true });
    response.headers.set("x-message-delivery", "confirmed");
    return response;
  } catch (error) {
    console.error("WEBHOOK CRITICAL ERROR:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
