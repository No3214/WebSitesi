import { NextResponse } from 'next/server';
import { verifyEccSignature, extractPayloadFromRequest } from '@/lib/ecc-auth';

// In a real scenario, this public key would be fetched from a database based on the partnerId
const MOCK_PARTNER_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEK/v1O7x8P21k28Q/2n7y9Z71M8kP
G3/Z82yvJ+4s1v/c2m1tZt4qR/N8qV8c4U5B0gN+Pq8Mh3mF/l5h2J4W1w==
-----END PUBLIC KEY-----`;

export async function POST(req: Request) {
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
      publicKeyPem: MOCK_PARTNER_PUBLIC_KEY,
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
