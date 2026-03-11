import { NextResponse } from "next/server";
import { z } from "zod";
import { getPayloadClient } from "@/lib/payload";

const leadSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(5),
  email: z.string().email().optional().or(z.literal("")),
  eventDate: z.string().optional(),
  type: z.string().min(2),
  message: z.string().min(5),
  website: z.string().optional(), // Honeypot
});

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let payloadData: any;

    if (contentType.includes("application/json")) {
      payloadData = await req.json();
    } else {
      const formData = await req.formData();
      payloadData = {
        name: String(formData.get("name") || ""),
        phone: String(formData.get("phone") || ""),
        email: String(formData.get("email") || ""),
        eventDate: String(formData.get("eventDate") || ""),
        type: String(formData.get("type") || ""),
        message: String(formData.get("message") || ""),
        website: String(formData.get("website") || ""),
      };
    }

    // Honeypot check
    if (payloadData.website) {
      return NextResponse.json({ ok: true, message: "Success" }); // Silently drop
    }

    const parsed = leadSchema.safeParse(payloadData);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const payload = await getPayloadClient();

    await payload.create({
      collection: "organization-leads",
      data: {
        ...parsed.data,
        source: "website"
      },
      overrideAccess: true
    });

    return NextResponse.json({
      ok: true,
      message: "Talebiniz başarıyla alındı. Sizinle en kısa sürede iletişime geçeceğiz."
    });
  } catch (error) {
    console.error("Lead submission error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Bir hata oluştu. Lütfen daha sonra tekrar deneyiniz."
      },
      { status: 500 }
    );
  }
}
