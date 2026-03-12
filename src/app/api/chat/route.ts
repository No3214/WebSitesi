import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

import {
  enforceRateLimit,
  extractClientIp,
  safeText,
  validateSameOrigin,
} from "@/lib/security";

const RATE_LIMIT = {
  windowMs: 60 * 1000,
  maxRequests: 20,
};

let cachedSystemPrompt: string | null = null;

function buildSystemPrompt() {
  if (cachedSystemPrompt) {
    return cachedSystemPrompt;
  }

  const brandIdentity = fs.readFileSync(
    path.join(process.cwd(), "brand/identity.md"),
    "utf8",
  );
  const voiceTone = fs.readFileSync(
    path.join(process.cwd(), "brand/voice-and-tone.md"),
    "utf8",
  );
  const roomsData = fs.readFileSync(
    path.join(process.cwd(), "src/data/rooms.ts"),
    "utf8",
  );

  cachedSystemPrompt = `
 You are the Digital Concierge (Dijital Kâhya) and Growth Architect for Kozbeyli Konağı.
 Your goal is to be helpful, premium, and conversion-oriented.

 BRAND CONTEXT:
 ${brandIdentity}

 VOICE & TONE:
 ${voiceTone}

 ROOMS DATA (Use this for precise availability/features):
 ${roomsData}

 INSTRUCTIONS:
 - Respond in Turkish.
 - Be polite, welcoming, and use a premium tone.
 - If the user asks about prices or booking, guide them to the "Rezervasyon" (HotelRunner) process or WhatsApp.
 - Highlight the Antakya cuisine and the 180-year-old Dibek coffee heritage.
 - Keep responses concise but informative.
 `;

  return cachedSystemPrompt;
}

export async function POST(req: Request) {
  try {
    if (!validateSameOrigin(req)) {
      return NextResponse.json({ error: "Geçersiz istek kaynağı" }, { status: 403 });
    }

    const ipAddress = extractClientIp(req.headers);
    const rateLimit = enforceRateLimit(
      `chat:${ipAddress}`,
      RATE_LIMIT.maxRequests,
      RATE_LIMIT.windowMs,
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Çok fazla istek gönderildi. Lütfen biraz bekleyin." },
        {
          status: 429,
          headers: {
            "Retry-After": rateLimit.retryAfterSec.toString(),
          },
        },
      );
    }

    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];

    if (!messages.length) {
      return NextResponse.json({ error: "Mesaj bulunamadı." }, { status: 400 });
    }

    const _systemPrompt = buildSystemPrompt();
    void _systemPrompt;

    const lastUserMessage = safeText(
      String(messages[messages.length - 1]?.content || "").toLowerCase(),
      2000,
    );

    let aiResponse =
      "Efendim, Kozbeyli Konağı'nın huzurlu atmosferinden selamlar. Sorunuzu tam olarak anlayamadım ancak size odalarımız, meşhur Antakya soframız veya tarihi dokumuz hakkında bilgi vermekten mutluluk duyarım.";

    if (lastUserMessage.includes("fiyat") || lastUserMessage.includes("rezervasyon")) {
      aiResponse =
        "Memnuniyetle yardımcı olurum. En güncel fiyat ve müsaitlik için Rezervasyon adımından tarih seçebilir veya WhatsApp hattımız üzerinden hızlı teyit alabilirsiniz. Dilerseniz size en uygun oda tipini birlikte netleştirelim.";
    } else if (lastUserMessage.includes("oda")) {
      aiResponse =
        "Konağımızda taş dokunun modern konforla buluştuğu 7 farklı oda tipimiz mevcuttur. Özellikle Superior Deniz Manzaralı odalarımız Ege manzarasıyla öne çıkar. İsterseniz kişi sayınıza ve tarihinize göre en doğru seçeneği birlikte belirleyebiliriz.";
    } else if (
      lastUserMessage.includes("kahvaltı") ||
      lastUserMessage.includes("yemek")
    ) {
      aiResponse =
        "Gastronomi konağımızın en güçlü taraflarından biridir. Antakyalı İnci Hanım'ın reçeteleri, odun ateşinde taş fırın lezzetleri ve Dibek kahvesi geleneğimizle unutulmaz bir deneyim sunuyoruz. Akşam yemeği ya da özel masa için rezervasyon planlayalım mı?";
    }

    return NextResponse.json({ role: "assistant", content: aiResponse });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
