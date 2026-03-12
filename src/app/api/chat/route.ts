import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * AI Chat API Route
 * This is the "brain" of the Digital Concierge.
 * It injects the Brand Context and Knowledge into every request.
 */

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // 1. Load Brand Context & Knowledge
    const brandIdentity = fs.readFileSync(path.join(process.cwd(), 'brand/identity.md'), 'utf8');
    const voiceTone = fs.readFileSync(path.join(process.cwd(), 'brand/voice-and-tone.md'), 'utf8');
    const roomsData = fs.readFileSync(path.join(process.cwd(), 'src/data/rooms.ts'), 'utf8');
    
    // 2. Build System Prompt
    const systemPrompt = `
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

    // 3. Integrate with LLM (Placeholder for real API call)
    // console.log("System Prompt Prepared:", systemPrompt);
    
    const lastUserMessage = messages[messages.length - 1].content.toLowerCase();
    let aiResponse = "Efendim, Kozbeyli Konağı'nın huzurlu atmosferinden selamlar. Sorunuzu tam olarak anlayamadım ancak size odalarımız, meşhur Antakya soframız veya tarihi dokumuz hakkında bilgi vermekten mutluluk duyarım.";

    if (lastUserMessage.includes('oda')) {
      aiResponse = "Konağımızda taş dokunun modern konforla buluştuğu 7 farklı oda tipimiz mevcuttur. Özellikle 'Superior Deniz Manzaralı' odalarımız Ege'nin tüm maviliğini ayağınıza sermektedir. Hangi oda tipimiz ilginizi çekiyor?";
    } else if (lastUserMessage.includes('kahvaltı') || lastUserMessage.includes('yemek')) {
      aiResponse = "Gastronomi bizim en iddialı olduğumuz alanlardan biridir. Antakyalı İnci Hanım'ın elinden çıkan özel reçeteler, sac kavurma ve odun ateşinde taş fırın lezzetlerimizle damağınızda unutulmaz bir iz bırakmak istiyoruz. Akşam yemeği için rezervasyon düşünür müsünüz?";
    }

    return NextResponse.json({ 
      role: 'assistant', 
      content: aiResponse 
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
