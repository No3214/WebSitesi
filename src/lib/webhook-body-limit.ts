import { NextResponse } from "next/server";

export const MAX_WEBHOOK_PAYLOAD_BYTES = 64_000;

type LimitedWebhookBodyResult =
  | {
      ok: true;
      bodyText: string;
      sizeBytes: number;
    }
  | {
      ok: false;
      response: NextResponse;
      sizeBytes: number;
    };

function payloadTooLargeResponse(sizeBytes: number, maxBytes: number) {
  return NextResponse.json(
    {
      ok: false,
      error: "Payload too large",
      maxBytes,
      sizeBytes,
    },
    {
      status: 413,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}

function parseContentLength(value: string | null) {
  if (!value) return null;
  const size = Number(value);
  return Number.isFinite(size) && size >= 0 ? size : null;
}

export async function readLimitedWebhookBody(
  req: Request,
  maxBytes = MAX_WEBHOOK_PAYLOAD_BYTES,
): Promise<LimitedWebhookBodyResult> {
  const contentLength = parseContentLength(req.headers.get("content-length"));
  if (contentLength !== null && contentLength > maxBytes) {
    return {
      ok: false,
      response: payloadTooLargeResponse(contentLength, maxBytes),
      sizeBytes: contentLength,
    };
  }

  const bodyText = await req.text();
  const sizeBytes = new TextEncoder().encode(bodyText).byteLength;

  if (sizeBytes > maxBytes) {
    return {
      ok: false,
      response: payloadTooLargeResponse(sizeBytes, maxBytes),
      sizeBytes,
    };
  }

  return {
    ok: true,
    bodyText,
    sizeBytes,
  };
}
