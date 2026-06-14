import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function shortCommit() {
  return process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || "local";
}

function deploymentEnvironment() {
  return process.env.VERCEL_ENV || (process.env.NODE_ENV === "production" ? "production" : "development");
}

export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "kozbeyli-konagi",
      timestamp: new Date().toISOString(),
      checks: {
        app: "ok",
        runtime: "nodejs",
      },
      deployment: {
        environment: deploymentEnvironment(),
        commit: shortCommit(),
      },
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
