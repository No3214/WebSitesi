import crypto from 'node:crypto';

export interface VerifySignatureParams {
  payload: string;
  signature: string; // Base64 encoded signature
  publicKeyPem: string; // PEM formatted public key of the partner
}

/**
 * Verifies an ECDSA P-256 signature from a B2B partner.
 */
export function verifyEccSignature({ payload, signature, publicKeyPem }: VerifySignatureParams): boolean {
  try {
    const verify = crypto.createVerify('SHA256');
    verify.update(payload);
    verify.end();

    return verify.verify(
      {
        key: publicKeyPem,
        format: 'pem',
        type: 'spki',
      },
      Buffer.from(signature, 'base64')
    );
  } catch (error) {
    console.error('[ECC Auth] Signature verification failed:', error);
    return false;
  }
}

/**
 * Helper to extract payload string from Next.js request robustly.
 */
export async function extractPayloadFromRequest(req: Request): Promise<string> {
  const cloned = req.clone();
  return await cloned.text();
}
