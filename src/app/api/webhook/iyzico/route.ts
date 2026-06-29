const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0",
};

function methodNotAllowed() {
  return Response.json(
    { ok: false, error: "Method not allowed" },
    {
      status: 405,
      headers: {
        ...noStoreHeaders,
        Allow: "POST",
      },
    },
  );
}

function unauthorized() {
  return Response.json(
    { ok: false, error: "Unauthorized" },
    { status: 401, headers: noStoreHeaders },
  );
}

function unavailable() {
  return Response.json(
    { ok: false, error: "Webhook processing unavailable" },
    { status: 503, headers: noStoreHeaders },
  );
}

export function GET() {
  return methodNotAllowed();
}

export function HEAD() {
  return new Response(null, {
    status: 405,
    headers: {
      ...noStoreHeaders,
      Allow: "POST",
    },
  });
}

export async function POST(request: Request) {
  if (!request.headers.get("x-payload-signature")) {
    return unauthorized();
  }

  return unavailable();
}
