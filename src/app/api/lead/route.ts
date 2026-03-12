import { NextResponse } from "next/server";
import { z } from "zod";
import { getPayloadClient } from "@/lib/payload";

const leadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(8).max(25),
  email: z.string().trim().email().optional().or(z.literal("")),
  eventDate: z.string().trim().max(30).optional(),
  guestCount: z.coerce.number().int().positive().max(1200).optional(),
  estimatedBudget: z
    .enum(["under-100k", "100k-250k", "250k-500k", "over-500k"])
    .optional(),
  type: z.string().trim().min(2).max(80),
  message: z.string().trim().min(10).max(3000),
  consent: z.coerce.boolean(),
  utmSource: z.string().trim().max(100).optional(),
  utmMedium: z.string().trim().max(100).optional(),
  utmCampaign: z.string().trim().max(120).optional(),
  referrer: z.string().trim().max(500).optional(),
  website: z.string().optional() // Honeypot
});

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

    // Honeypot check
    if (payloadData.website) {
      return NextResponse.json({ ok: true, message: "Success" });
    }

    const parsed = leadSchema.safeParse(payloadData);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (!parsed.data.consent) {
      return NextResponse.json(
        { ok: false, message: "Aydınlatma metni onayı zorunludur." },
        { status: 400 }
      );
    }

    const payload = await getPayloadClient();
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor?.split(",")[0]?.trim() || "unknown";

    await payload.create({
      collection: "organization-leads",
      data: {
        ...parsed.data,
        source: "website",
        ipAddress,
        userAgent: req.headers.get("user-agent") || "unknown"
      },
      overrideAccess: true
    });

    return NextResponse.json({
      ok: true,
      message: "Talebiniz alındı. Satış danışmanımız 24 saat içinde sizinle iletişime geçecek."
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
