import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterAll, describe, expect, it } from "vitest";

const root = process.cwd();
const tmpDirs: string[] = [];

type AdminSurfaceModule = {
  evaluateAdminSurfaceSource: (args?: { baseDir?: string }) => {
    ready: boolean;
    checks: Array<{ id: string; ready: boolean; detail: string }>;
  };
  evaluateAdminSurfaceLive: (args?: {
    target?: string;
    fetchImpl?: typeof fetch;
  }) => Promise<{
    ready: boolean;
    status: number;
    location: string;
    checks: Array<{ id: string; ready: boolean; detail: string }>;
  }>;
  evaluateAdminSurfaceReadiness: (args?: {
    baseDir?: string;
    target?: string;
    fetchImpl?: typeof fetch;
  }) => Promise<{
    decision: string;
    blockers: string[];
  }>;
};

async function loadAdminSurfaceModule() {
  return (await import(
    pathToFileURL(path.join(root, "scripts/admin-surface-readiness.mjs")).href
  )) as AdminSurfaceModule;
}

const safeClientSource = `
  type RuntimeReadinessSnapshot = {
    status: string;
    ready: boolean;
    blockedGates: string[];
    configuredGates: string[];
    checks: Array<{ id: string; ready: boolean; configuredCount: number; requiredCount: number }>;
  };
  export function GrowthDashboardClient({ runtimeReadiness }: { runtimeReadiness: RuntimeReadinessSnapshot }) {
    return <div>Runtime readiness: {runtimeReadiness.status}<span>Blocked runtime gates</span></div>;
  }
`;

function makeTmpProject(source: string, clientSource = safeClientSource) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kozbeyli-admin-surface-"));
  tmpDirs.push(dir);
  const sourceDir = path.join(dir, "src/app/admin/growth");
  fs.mkdirSync(sourceDir, { recursive: true });
  fs.writeFileSync(path.join(sourceDir, "page.tsx"), source);
  fs.writeFileSync(path.join(sourceDir, "growth-client.tsx"), clientSource);
  return dir;
}

function mockFetch({
  status,
  location = "",
  body = "",
}: {
  status: number;
  location?: string;
  body?: string;
}): typeof fetch {
  return (async () =>
    ({
      status,
      headers: new Headers(location ? { location } : {}),
      text: async () => body,
    }) as Response) as typeof fetch;
}

afterAll(() => {
  for (const dir of tmpDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("admin surface readiness", () => {
  it("keeps the current growth dashboard protected by an admin role guard", async () => {
    const adminSurface = await loadAdminSurfaceModule();
    const result = adminSurface.evaluateAdminSurfaceSource();

    expect(result.ready).toBe(true);
    expect(result.checks.find((check) => check.id === "admin_role_guard")).toMatchObject({
      ready: true,
    });
    expect(result.checks.find((check) => check.id === "boolean_user_guard")).toMatchObject({
      ready: true,
    });
    expect(result.checks.find((check) => check.id === "runtime_readiness_source")).toMatchObject({
      ready: true,
    });
    expect(result.checks.find((check) => check.id === "runtime_secret_env_names")).toMatchObject({
      ready: true,
    });
  });

  it("accepts same-origin unauthenticated redirects to Payload admin login", async () => {
    const adminSurface = await loadAdminSurfaceModule();
    const result = await adminSurface.evaluateAdminSurfaceLive({
      target: "https://www.kozbeylikonagi.com/admin/growth",
      fetchImpl: mockFetch({
        status: 307,
        location: "/admin",
      }),
    });

    expect(result.ready).toBe(true);
    expect(result.status).toBe(307);
    expect(result.location).toBe("/admin");
  });

  it("blocks public dashboard body leakage", async () => {
    const adminSurface = await loadAdminSurfaceModule();
    const result = await adminSurface.evaluateAdminSurfaceReadiness({
      fetchImpl: mockFetch({
        status: 200,
        body: "<h1>Kozbeyli Commercial Launch Control</h1><p>docs/evidence</p>",
      }),
    });

    expect(result.decision).toBe("ADMIN SURFACE BLOCKED");
    expect(result.blockers.join("\n")).toContain("live_protected_status");
    expect(result.blockers.join("\n")).toContain("Kozbeyli Commercial Launch Control");
  });

  it("blocks plain authenticated-user guards without admin role enforcement", async () => {
    const adminSurface = await loadAdminSurfaceModule();
    const dir = makeTmpProject(`
      import { redirect } from "next/navigation";
      export const dynamic = "force-dynamic";
      export const metadata = { robots: { index: false, follow: false } };
      export default async function GrowthDashboardPage() {
        const user = {};
        let authenticated = false;
        authenticated = Boolean(user);
        if (!authenticated) redirect("/admin");
        return <GrowthDashboardClient />;
      }
    `);

    const result = adminSurface.evaluateAdminSurfaceSource({ baseDir: dir });

    expect(result.ready).toBe(false);
    expect(result.checks.find((check) => check.id === "admin_role_guard")).toMatchObject({
      ready: false,
    });
    expect(result.checks.find((check) => check.id === "boolean_user_guard")).toMatchObject({
      ready: false,
    });
  });

  it("blocks admin dashboard source when runtime readiness is no longer wired through the auth guard", async () => {
    const adminSurface = await loadAdminSurfaceModule();
    const dir = makeTmpProject(`
      import { redirect } from "next/navigation";
      import { GrowthDashboardClient } from "./growth-client";
      export const dynamic = "force-dynamic";
      export const metadata = { robots: { index: false, follow: false } };
      export default async function GrowthDashboardPage() {
        let authenticated = true;
        const requestHeaders = {};
        const payload = { auth: async () => ({ user: { role: "admin" } }) };
        const { user } = await payload.auth({ headers: requestHeaders });
        authenticated = user?.role === "admin";
        if (!authenticated) redirect("/admin");
        return <GrowthDashboardClient />;
      }
    `);

    const result = adminSurface.evaluateAdminSurfaceSource({ baseDir: dir });

    expect(result.ready).toBe(false);
    expect(result.checks.find((check) => check.id === "runtime_readiness_source")).toMatchObject({
      ready: false,
    });
    expect(result.checks.find((check) => check.id === "runtime_readiness_prop")).toMatchObject({
      ready: false,
    });
  });

  it("blocks admin dashboard source when the client renders secret env names", async () => {
    const adminSurface = await loadAdminSurfaceModule();
    const dir = makeTmpProject(
      `
        import { redirect } from "next/navigation";
        import { getRuntimeReadiness } from "@/lib/production-readiness";
        import { GrowthDashboardClient } from "./growth-client";
        export const dynamic = "force-dynamic";
        export const metadata = { robots: { index: false, follow: false } };
        export default async function GrowthDashboardPage() {
          let authenticated = true;
          const requestHeaders = {};
          const payload = { auth: async () => ({ user: { role: "admin" } }) };
          const { user } = await payload.auth({ headers: requestHeaders });
          authenticated = user?.role === "admin";
          if (!authenticated) redirect("/admin");
          return <GrowthDashboardClient runtimeReadiness={getRuntimeReadiness()} />;
        }
      `,
      `${safeClientSource}\nexport const leaked = "GA4_API_SECRET";`,
    );

    const result = adminSurface.evaluateAdminSurfaceSource({ baseDir: dir });

    expect(result.ready).toBe(false);
    expect(result.checks.find((check) => check.id === "runtime_secret_env_names")).toMatchObject({
      ready: false,
    });
  });

  it("blocks cross-origin redirects from admin growth", async () => {
    const adminSurface = await loadAdminSurfaceModule();
    const result = await adminSurface.evaluateAdminSurfaceReadiness({
      target: "https://www.kozbeylikonagi.com/admin/growth",
      fetchImpl: mockFetch({
        status: 302,
        location: "https://example.com/admin",
      }),
    });

    expect(result.decision).toBe("ADMIN SURFACE BLOCKED");
    expect(result.blockers.join("\n")).toContain("live_same_origin_admin_redirect");
  });
});
