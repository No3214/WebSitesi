import { getPayloadClient } from "@/lib/payload";

export interface HotelRunnerReservation {
  id: string;
  status: string;
  guest_first_name: string;
  guest_last_name: string;
  guest_email?: string;
  guest_phone?: string;
  room_type_name: string;
  checkin: string;
  checkout: string;
  total_price: string;
  currency_code: string;
  guest_notes?: string;
}

export async function processHotelRunnerWebhook(messageUid: string, body: any) {
  const payload = await getPayloadClient();
  
  // 1. Check for Duplicate
  const existingEvent = await payload.find({
    collection: "hotelrunner-events" as any,
    where: {
      messageUid: { equals: messageUid }
    }
  });

  if (existingEvent.totalDocs > 0) {
    return { status: 409, message: "Duplicate message detected" };
  }

  // 2. Audit Trail - Create Log
  try {
    await payload.create({
      collection: "hotelrunner-events" as any,
      data: {
        messageUid,
        event: body.reservation ? "reservation" : "unknown",
        payload: body,
        status: "processed"
      }
    });
  } catch (error) {
    console.error("Audit creation failed:", error);
    // Continue anyway? Or fail? P0 audit says audit trail is important.
  }

  // 3. Domain Logic - Sync to Leads
  if (body.reservation) {
    const res: HotelRunnerReservation = body.reservation;
    
    await payload.create({
      collection: "organization-leads" as any,
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

    return { status: 200, ok: true };
  }

  return { status: 400, error: "Unsupported payload structure" };
}
