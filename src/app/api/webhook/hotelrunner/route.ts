import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import crypto from "crypto";

export async function GET() {
  return NextResponse.json({ status: "active", version: "1.0.1", support: "HMAC-SHA256" });
}

export async function POST(req: Request) {
  try {
    const messageUid = req.headers.get("x-message-uid");
    const signature = req.headers.get("x-payload-signature");
    const secret = process.env.PAYLOAD_SECRET; 
    
    const bodyText = await req.text();
    const body = JSON.parse(bodyText);

    // SECURE HMAC VALIDATION
    if (secret && signature) {
      const hmac = crypto.createHmac("sha256", secret);
      const digest = hmac.update(bodyText).digest("hex");
      
      if (signature !== digest) {
        console.error("WEBHOOK SECURITY ALERT: Invalid signature detected.");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } else {
      console.warn("WEBHOOK WARNING: Missing security headers. Proceeding with caution.");
    }

    const payload = await getPayloadClient();
    if (!payload) {
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    // PROPER RESERVATION SYNC
    if (body.reservation) {
      const res = body.reservation;
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (payload as any).create({
        collection: "organization-leads",
        data: {
          name: `${res.guest_first_name} ${res.guest_last_name}`,
          email: res.guest_email || `booking-${res.id}@hotelrunner.com`,
          phone: res.guest_phone || "",
          type: "Reservation",
          consent: true,
          message: `
            Rezervasyon ID: ${res.id}
            Durum: ${res.status}
            Oda: ${res.room_type_name}
            Konaklama: ${res.checkin} / ${res.checkout}
            Toplam Tutar: ${res.total_price} ${res.currency_code}
            Notlar: ${res.guest_notes || 'Yok'}
          `.trim(),
          source: `hotelrunner:${res.id}`
        },
        draft: false
      });

      const response = NextResponse.json({ ok: true });
      if (messageUid) {
        response.headers.set("x-message-delivery", "confirmed");
      }
      return response;
    }

    return NextResponse.json({ ok: false, error: "Unsupported payload structure" }, { status: 400 });
  } catch (error) {
    console.error("WEBHOOK CRITICAL ERROR:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
