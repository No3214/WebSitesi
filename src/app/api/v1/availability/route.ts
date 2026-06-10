import { NextResponse } from 'next/server';
import { verifyEccSignature, extractPayloadFromRequest } from '@/lib/ecc-auth';

// Audit F6/T5: partner public key artık env'den gelir; tanımlı değilse
// endpoint kapalıdır (404). Hardcoded MOCK key kaldırıldı — sahte imza
// kabul riski sıfırlandı. Gerçek partner onboard olduğunda SPKI PEM'i
// B2B_PARTNER_PUBLIC_KEY olarak ekleyin.
const PARTNER_PUBLIC_KEY = process.env.B2B_PARTNER_PUBLIC_KEY || "";

export async function POST(req: Request) {
  if (!PARTNER_PUBLIC_KEY.trim()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const signature = req.headers.get('x-b2b-signature');
    const partnerId = req.headers.get('x-partner-id');

    if (!signature || !partnerId) {
      return NextResponse.json({ error: 'Missing ECC signature or partner ID headers.' }, { status: 401 });
    }

    const payloadString = await extractPayloadFromRequest(req);

    const isValid = verifyEccSignature({
      payload: payloadString,
      signature,
      publicKeyPem: PARTNER_PUBLIC_KEY,
    });

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid ECC Signature.' }, { status: 403 });
    }

    const body = JSON.parse(payloadString);

    // Mock availability response
    const { checkIn, checkOut, guests } = body;
    
    return NextResponse.json({
      status: 'success',
      data: {
        rooms: [
          {
            slug: 'standart-deniz-manzarali-oda',
            name: 'Standart Deniz Manzaralı Oda',
            available: true,
            price: 4500,
            currency: 'TRY',
          },
          {
            slug: 'aile-odasi-4-kisilik',
            name: 'Aile Odası',
            available: true,
            price: 7500,
            currency: 'TRY',
          }
        ],
        requestedDates: { checkIn, checkOut },
        guests
      }
    });

  } catch (err) {
    console.error('[Availability API] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
