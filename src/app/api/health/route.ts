import { NextResponse } from "next/server";

import { getAdminDependencyStatus } from "@/lib/admin-runtime";
import {
  applyRuntimeGateOperationalStatus,
  getRuntimeReadiness,
} from "@/lib/production-readiness";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

function shortCommit() {
  return process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || "local";
}

function deploymentEnvironment() {
  return process.env.VERCEL_ENV || (process.env.NODE_ENV === "production" ? "production" : "development");
}

export async function GET() {
  const adminDependencyStatus = await getAdminDependencyStatus();
  const runtimeConfiguration = applyRuntimeGateOperationalStatus(
    getRuntimeReadiness(),
    "production_database",
    adminDependencyStatus,
  );

  return NextResponse.json(
    {
      status: "ok",
      service: "kozbeyli-konagi",
      timestamp: new Date().toISOString(),
      checks: {
        app: "ok",
        runtime: "nodejs",
      },
      readiness: {
        runtimeConfiguration,
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
